const aiGatewayService = require("./aiGateway.service");
const summaryService = require("./summary.service");
const reviewService = require("./review.service");
const citationService = require("./citation.service");
const researchGapService = require("./researchGap.service");
const journalService = require("./journal.service");
const conferenceService = require("./conference.service");

const AiMessage = require("../../../models/AiMessage");
const AiSession = require("../../../models/AiSession");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const embeddingService = require("./embedding.service");
const AiVectorStore = require("../../../models/AiVectorStore");

class ChatService {
  /**
   * Router to delegate the stream request to the correct specialized service or execute chat/RAG
   */
  async streamResponse(params) {
    const { workspace } = params;

    switch (workspace) {
      case "paper-summary":
        return await summaryService.summarize(params);
        
      case "literature-review":
      case "paper-reviewer":
      case "reviewer":
        return await reviewService.review(params);
        
      case "citation-generator":
      case "citation":
        return await citationService.generateCitations(params);
        
      case "research-gap":
        return await researchGapService.findGaps(params);
        
      case "journal-recommendation":
      case "journal":
        return await journalService.recommendJournals(params);
        
      case "conference-recommendation":
      case "conference":
        return await conferenceService.recommendConferences(params);
        
      case "research-assistant":
        params.prompt = `Act as an expert academic research co-pilot. Formulate research hypotheses, outline sections, and propose a validation pipeline for the following query:\n\n${params.prompt}`;
        break;

      case "methodology-generator":
      case "methodology":
        params.prompt = `Design an optimal, step-by-step experimental methodology, sampling strategy, and validation metrics for the following topic:\n\n${params.prompt}`;
        break;

      case "proposal-generator":
      case "proposal":
        params.prompt = `Draft a structured grant proposal (NIH/NSF style), detailing specific aims, significance, and budget justification for:\n\n${params.prompt}`;
        break;

      case "thesis-assistant":
      case "thesis":
        params.prompt = `Act as a thesis drafting copilot. Generate chapter blueprints and draft academic content for the following topic:\n\n${params.prompt}`;
        break;

      case "dataset-finder":
      case "dataset":
        params.prompt = `Discover high-quality, open-access research datasets (Kaggle, Zenodo, HF, Dataverse) matching:\n\n${params.prompt}`;
        break;
        
      default:
        // Falls through to standard chat / pdf-chat
        break;
    }

    return await this.executeChat(params);
  }

  /**
   * Execution of standard chat and PDF RAG analysis
   */
  async executeChat(params) {
    let { 
      userId, 
      workspace, 
      prompt, 
      sessionId, 
      provider, 
      model, 
      temperature, 
      contextLength, 
      attachments = [], 
      onChunk 
    } = params;

    // Handle PDF Chat (RAG)
    if (workspace === "pdf-chat") {
      let pdfAttachment = attachments.find(a => a.fileType === ".pdf" || a.name.endsWith(".pdf"));
      
      // Look up attachment in session history if continuing a session
      if (!pdfAttachment && sessionId) {
        const firstMsg = await AiMessage.findOne({ sessionId }).sort({ createdAt: 1 });
        if (firstMsg && firstMsg.attachments && firstMsg.attachments.length > 0) {
          pdfAttachment = firstMsg.attachments.find(a => a.fileType === ".pdf" || a.name.endsWith(".pdf"));
        }
      }

      if (pdfAttachment) {
        const diskFilename = pdfAttachment.path || pdfAttachment.name;
        const finalFilename = path.basename(diskFilename);
        const filePath = path.join(process.cwd(), "uploads", finalFilename);

        if (fs.existsSync(filePath)) {
          let existingChunks = await AiVectorStore.find({ filePath });
          
          if (existingChunks.length === 0) {
            try {
              console.log(`[RAG]: Initializing PDF extraction for file: ${finalFilename}`);
              const fileBuffer = fs.readFileSync(filePath);
              const data = await pdfParse(fileBuffer);
              const text = data.text;

              // Chunk text (~800 chars with ~150 chars overlap)
              const chunkSize = 800;
              const overlap = 150;
              const chunks = [];
              for (let i = 0; i < text.length; i += (chunkSize - overlap)) {
                const chunk = text.substring(i, i + chunkSize).trim();
                if (chunk.length > 50) {
                  chunks.push(chunk);
                }
              }

              console.log(`[RAG]: PDF parsed into ${chunks.length} chunks. Generating embeddings...`);
              const indexedChunks = [];
              for (const chunkText of chunks) {
                try {
                  const { embedding } = await embeddingService.getEmbedding(chunkText);
                  indexedChunks.push({
                    filePath,
                    chunkText,
                    embedding,
                  });
                } catch (err) {
                  console.error("[RAG]: Embedding chunk failed:", err.message);
                }
              }

              if (indexedChunks.length > 0) {
                await AiVectorStore.insertMany(indexedChunks);
                existingChunks = indexedChunks;
                console.log(`[RAG]: Successfully indexed ${indexedChunks.length} chunks.`);
              }
            } catch (err) {
              console.error("[RAG]: PDF extraction failed:", err.message);
            }
          }

          if (existingChunks.length > 0) {
            try {
              const { embedding: queryEmbedding } = await embeddingService.getEmbedding(prompt);
              
              const cosineSimilarity = (vecA, vecB) => {
                let dotProduct = 0.0;
                let normA = 0.0;
                let normB = 0.0;
                for (let i = 0; i < vecA.length; i++) {
                  dotProduct += vecA[i] * vecB[i];
                  normA += vecA[i] * vecA[i];
                  normB += vecB[i] * vecB[i];
                }
                if (normA === 0 || normB === 0) return 0;
                return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
              };

              const similarities = existingChunks.map(chunk => {
                const score = cosineSimilarity(queryEmbedding, chunk.embedding);
                return { chunkText: chunk.chunkText, score };
              });

              similarities.sort((a, b) => b.score - a.score);
              const topChunks = similarities.slice(0, 3).map(s => s.chunkText);

              if (topChunks.length > 0) {
                prompt = `Context from uploaded document "${pdfAttachment.name}":\n\n` + 
                  topChunks.map((c, idx) => `[Context Chunk ${idx + 1}]:\n${c}`).join("\n\n") + 
                  `\n\nUser Question: ${prompt}\n\nPlease answer the user's question accurately using only the context chunks above. Citations should refer specifically to the context details when answering.`;
              }
            } catch (err) {
              console.error("[RAG]: Vector search failed:", err.message);
            }
          }
        }
      }
    }

    return await aiGatewayService.streamResponse({
      userId,
      workspace,
      prompt,
      sessionId,
      provider,
      model,
      temperature,
      contextLength,
      attachments,
      onChunk,
    });
  }
}

module.exports = new ChatService();
