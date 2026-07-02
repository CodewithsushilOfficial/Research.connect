const aiSessionRepository = require("../repository/ai-session.repository");
const { NotFoundError, ValidationError } = require("../../../common/errors/AppError");

class AiService {
  /**
   * Create a new AI session
   */
  async createSession(userId, workspace, title = "New Session") {
    return await aiSessionRepository.create({
      userId,
      workspace,
      title,
      messages: [],
    });
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId, workspace = null) {
    return await aiSessionRepository.findUserSessions(userId, workspace);
  }

  /**
   * Get a single session details
   */
  async getSessionById(userId, sessionId) {
    const session = await aiSessionRepository.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new NotFoundError("AI Session not found.");
    }
    return session;
  }

  /**
   * Update session properties (e.g., rename, pin)
   */
  async updateSession(userId, sessionId, updateData) {
    const session = await aiSessionRepository.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new NotFoundError("AI Session not found.");
    }
    
    // Whitelist updates
    const allowedUpdates = ["title", "isPinned", "provider", "model"];
    const updates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    return await aiSessionRepository.update(sessionId, updates);
  }

  /**
   * Soft delete an AI session
   */
  async deleteSession(userId, sessionId) {
    const session = await aiSessionRepository.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new NotFoundError("AI Session not found.");
    }
    return await aiSessionRepository.softDelete(sessionId, userId);
  }

  /**
   * Main route runner: accepts user prompt, logs to session, generates simulated response, logs response, and saves.
   */
  async generateResponse(userId, workspace, prompt, sessionId = null, provider = "Research Connect AI", model = "GPT-4o Enhanced", attachments = []) {
    if (!prompt || !prompt.trim()) {
      throw new ValidationError("Prompt is required.");
    }

    let session;
    if (sessionId) {
      session = await aiSessionRepository.findOne({ _id: sessionId, userId });
      if (!session) {
        throw new NotFoundError("Specified AI Session not found.");
      }
    } else {
      // Auto-create session if none is provided
      const title = prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt;
      session = await this.createSession(userId, workspace, title);
    }

    // Update provider and model on session if they changed
    session.provider = provider;
    session.model = model;

    // 1. Add User Message
    session.messages.push({
      role: "user",
      content: prompt,
      attachments: attachments || [],
      createdAt: new Date(),
    });

    // 2. Generate premium response based on workspace
    const aiOutput = this.getSimulatedResponse(workspace, prompt, model);

    // 3. Add Assistant Message
    session.messages.push({
      role: "assistant",
      content: aiOutput,
      createdAt: new Date(),
    });

    // 4. If title was default "New Session", auto-rename it based on prompt
    if (session.title === "New Session" && session.messages.filter(m => m.role === "user").length === 1) {
      session.title = prompt.length > 40 ? `${prompt.substring(0, 40)}...` : prompt;
    }

    await session.save();

    return {
      session,
      response: aiOutput,
    };
  }

  /**
   * Generates highly relevant, premium academic content
   */
  getSimulatedResponse(workspace, prompt, model) {
    const cleanPrompt = prompt.trim();
    
    switch (workspace) {
      case "literature-review":
        return `### Literature Review Synthesis: "${cleanPrompt}"
        
Based on your topic of inquiry, we scanned indexed publications (OpenAlex, CrossRef, PubMed). Here is the synthesis of recent findings:

#### 1. Core Paradigm & Frameworks
Research indicates that the implementation of **${cleanPrompt}** rests upon three primary pillars:
*   **Architectural Modularity**: Allows separate nodes to process data concurrently.
*   **Adaptive Weighting**: Dynamic adjustments based on semantic entropy.
*   **Empirical Validation**: Relying on verified clinical or systemic cohorts.

#### 2. Comparative Analysis of Key Literature
| Study | Methodology | Key Finding | Limitations | Citation |
| :--- | :--- | :--- | :--- | :--- |
| **Chen et al. (2025)** | Randomized control trial (N=120) | Multi-modal alignment reduces latency by **32%**. | High initial computational overhead. | [Chen2025](file:///api/v1/publications/details) |
| **Miller & Patel (2026)** | Qualitative meta-analysis | Highlighted organizational bottlenecks in cloud clusters. | Relies on self-reported datasets. | [Miller2026](file:///api/v1/publications/details) |
| **Rodriguez (2026)** | Double-blind clinical evaluation | Identified significant cognitive ease using automated interfaces. | Limited geographic cohort. | [Rodriguez2026](file:///api/v1/publications/details) |

#### 3. Synthesis & Conclusion
The literature strongly suggests that while **${cleanPrompt}** offers robust scalability, current models fail to fully address edge execution constraints. Future studies must design low-footprint parameter tuning to deploy these systems effectively.

***

#### References & Academic Citations
*   *Chen, D., & Miller, R. (2025).* Multi-modal Attention Networks. *Journal of Research Connect*, 14(2), 112-120.
*   *Miller, A., & Patel, S. (2026).* Cloud-native bottlenecks in AI-powered pipelines. *IEEE Transactions*, 45(1), 89-97.
*   *Rodriguez, M. (2026).* Interface Optimization for Academic Co-Pilots. *ACM Comput. Hum. Interact.*, 29(4), 301-315.`;

      case "research-assistant":
        return `### AI Research Assistant: "${cleanPrompt}"

I have analyzed your query and structured a comprehensive research framework to guide your workflow.

#### Recommended Action Steps
1.  **Drafting Phase**: Begin with a 500-word conceptual description of the core mechanism.
2.  **Hypothesis Formulation**: Define the primary null hypothesis ($H_0$) and alternative hypothesis ($H_1$).
3.  **Data Curation**: Gather a minimum of 5,000 clean training instances to validate the metrics.

#### Suggested Outline
*   **Section 1: Introduction**
    *   Contextual background of ${cleanPrompt}.
    *   Research question and significance.
*   **Section 2: System Architecture / Methodology**
    *   Mathematical formulation.
    *   Data preprocessing pipeline.
*   **Section 3: Evaluation**
    *   Experimental parameters.
    *   Baselines for comparison.

Let me know which section you would like me to draft first!`;

      case "paper-summary":
        return `### Comprehensive Paper Summary: "${cleanPrompt}"

Here is the structured extraction of the publication's core components:

*   **Primary Objective**: To address key performance limitations in **${cleanPrompt}** by introducing a lightweight transformer layer.
*   **Core Methodology**: The authors deployed a hybrid self-attention mechanism tested across 3 benchmark datasets.
*   **Key Findings**:
    *   Achieved a **15%** decrease in parameter size.
    *   Maintained **98.2%** accuracy compared to dense models.
*   **Limitations Identified**:
    *   Poor handling of highly out-of-distribution inputs.
    *   Vulnerable to adversarial noise.

#### Summary Matrix
| Metric | Details |
| :--- | :--- |
| **Research Type** | Quantitative Empirical |
| **Datasets** | CIFAR-100, ImageNet-LT, Custom Connect-V1 |
| **Novelty Score** | 8.5/10 (highly optimized layers) |
| **Impact Level** | High (potential standard for mobile networks) |`;

      case "citation-generator":
        return `### Academic Citations Generated

Here are the formatted citations for your source: **${cleanPrompt}**

#### APA 7th Edition
> Chen, D., Miller, R., & Patel, S. (2026). *The Impact of ${cleanPrompt} on Modern Informatics*. Journal of Research Connect, 15(1), 45-58.

#### MLA 9th Edition
> Chen, David, et al. "The Impact of ${cleanPrompt} on Modern Informatics." *Journal of Research Connect*, vol. 15, no. 1, 2026, pp. 45-58.

#### Chicago Style
> Chen, David, Robert Miller, and Sonal Patel. "The Impact of ${cleanPrompt} on Modern Informatics." *Journal of Research Connect* 15, no. 1 (2026): 45-58.

#### Harvard Style
> CHEN, D., MILLER, R. & PATEL, S. 2026. The Impact of ${cleanPrompt} on Modern Informatics. *Journal of Research Connect*, 15, 45-58.

#### BibTeX Export
\`\`\`bibtex
@article{chen2026impact,
  author    = {Chen, David and Miller, Robert and Patel, Sonal},
  title     = {The Impact of ${cleanPrompt} on Modern Informatics},
  journal   = {Journal of Research Connect},
  volume    = {15},
  number    = {1},
  pages     = {45--58},
  year      = {2026},
  publisher = {Research Connect Press}
}
\`\`\``;

      case "research-gap":
        return `### Research Gaps Identified for: "${cleanPrompt}"

Based on a semantic mapping of 14,200 papers in this domain, we identified three critical, unaddressed research gaps:

#### Gap 1: Edge Computing Resource Scaling
*   **Description**: While current algorithms are highly accurate, there is a complete lack of empirical evaluations running **${cleanPrompt}** on low-power ARM microcontrollers.
*   **Why it exists**: Most developers utilize large server instances; research hasn't adapted to localized IoT constraints.
*   **Proposed Research Question**: *How does quantization affect the precision of ${cleanPrompt} when deployed on 32-bit edge processors?*

#### Gap 2: Cross-Domain Transferability
*   **Description**: Existing models are fine-tuned strictly on domain-specific datasets, leading to severe performance decay when shifted to related fields.
*   **Proposed Research Question**: *Can zero-shot domain adaptation stabilize performance decay during domain shifts?*

#### Gap 3: Long-term Behavioral Drift
*   **Description**: Most evaluations only cover short runs, neglecting model performance over continuous 12-month periods.`;

      case "methodology-generator":
        return `### Optimal Methodology Design: "${cleanPrompt}"

Here is a step-by-step methodology framework tailored to study **${cleanPrompt}**:

#### 1. Data Collection & Preprocessing
*   **Sampling strategy**: Stratified random sampling across 5 key repositories.
*   **Preprocessing pipeline**:
    1.  Normalize all input matrices to [0, 1].
    2.  Filter out duplicate features containing covariance > 0.85.

#### 2. Experimental Configuration
\`\`\`python
# Suggested experimental execution block
experimental_config = {
    "learning_rate": 0.001,
    "batch_size": 32,
    "optimizer": "AdamW",
    "dropout_rate": 0.2,
    "loss_function": "CategoricalCrossEntropy"
}
\`\`\`

#### 3. Validation Metrics
*   **Primary Metric**: F1-Score (to balance class imbalances).
*   **Secondary Metrics**: Area Under ROC (AUC), Mean Absolute Error (MAE), Latency (ms).`;

      case "paper-reviewer":
        return `### Simulated Peer Review Critique
**Topic / Draft**: "${cleanPrompt}"
**Simulated Role**: Senior Reviewer (IEEE / Nature-approved guidelines)

---

#### 1. Overall Recommendation
*   **Decision**: Major Revision
*   **Novelty**: Moderate-High
*   **Clarity**: Moderate

#### 2. Key Strengths
*   **Strong empirical foundation**: The experiments are well-structured with clear baselines.
*   **Well-defined problem statement**: The introduction clearly highlights why existing methods fall short.

#### 3. Critical Weaknesses
*   **Methodological Vagueness**: Section 3.2 lacks detail on how the parameter tuning was initialized.
*   **Lack of baseline comparisons**: The authors should compare their model directly with recent 2025 standard models.
*   **Grammatical consistency**: Minor typos exist on page 4, lines 112-115.

#### 4. Detailed Actionable Recommendations
*   *Add a table showing ablation studies to justify why the second convolutional layer is needed.*
*   *Explicitly define the threshold parameters used in the filtering module.*`;

      case "proposal-generator":
        return `### Research Proposal Structure (NIH/NSF Style)
**Project Title**: Redefining ${cleanPrompt} for Enterprise Applications

#### 1. Specific Aims
*   **Aim 1**: Establish a modular benchmark suite to measure scalability.
*   **Aim 2**: Deploy localized parameter tuning to reduce operational latency.
*   **Aim 3**: Evaluate longitudinal resilience through multi-cloud trials.

#### 2. Budget and Justification Summary
| Category | Budget Request | Purpose |
| :--- | :--- | :--- |
| **Personnel** | $75,000 | Support for 1 Postdoc researcher (12 months) |
| **Compute / Cloud** | $12,000 | AWS & Google Cloud GPU instance allocations |
| **Dissemination** | $3,500 | Open-access publishing fees and IEEE presentation |
| **Total** | **$90,500** | |

#### 3. Projected Intellectual Merit
This project will create open-source libraries that democratize access to **${cleanPrompt}**, providing lightweight APIs for academic teams globally.`;

      case "thesis-assistant":
        return `### Thesis Chapter Copilot: "${cleanPrompt}"

I have generated a drafting blueprint and starter text for your **Introduction** chapter.

#### Section 1.1: Context of the Study
> "In recent years, the rapid advancement of academic search tools has transformed how scholars locate relevant literature. A critical component in this paradigm is **${cleanPrompt}**, which serves as the interface between raw database schemas and semantic query processing. However, current systems face operational bottlenecks that inhibit real-time extraction..."

#### Thesis Chapter Outline
1.  **Chapter 1: Introduction**
    *   1.1 Background of the study.
    *   1.2 Statement of the problem.
    *   1.3 Objectives of the thesis.
2.  **Chapter 2: Literature Review**
    *   2.1 Historical evolution.
    *   2.2 Modern frameworks.
    *   2.3 Summary of gaps.
3.  **Chapter 3: Methodology**
    *   3.1 Research design.
    *   3.2 Technical architecture.
    *   3.3 Evaluation metrics.`;

      case "pdf-chat":
        return `### AI PDF Chat: "${cleanPrompt}"

Based on the uploaded document, I have indexed the content and am ready to answer your questions.

#### Key Document Stats
*   **File Name**: \`manuscript_${cleanPrompt.replace(/\s+/g, "_")}.pdf\`
*   **Indexed Sections**: Abstract, Methodology, Discussion, References.

#### Core Insights from the PDF
1.  **Main Finding**: The paper proposes a hybrid methodology that achieves a **22%** reduction in query routing.
2.  **Data Source**: The research utilizes a dataset of 50,000 publications indexed in 2025.
3.  **Key Math Equation**:
    $$E = \\sum_{i=1}^{n} w_i \\log(p_i)$$

*What specific section or dataset from this PDF should I explain in detail?*`;

      case "dataset-finder":
        return `### AI Dataset Finder: "${cleanPrompt}"

I searched public repositories (Kaggle, Zenodo, Hugging Face, Harvard Dataverse) for datasets matching **${cleanPrompt}**:

#### Recommended Datasets
1.  **Academic-Cite-Connect (Zenodo)**
    *   *Size*: 4.2 GB
    *   *Format*: JSONL
    *   *Access*: Open Access (CC-BY-4.0)
    *   *Description*: 1.2M academic citation networks with metadata and temporal indexing.
    *   *Link*: [Access Dataset](https://zenodo.org/record/example)

2.  **Semantic-Papers-2025 (Hugging Face)**
    *   *Size*: 12.8 GB
    *   *Format*: Parquet
    *   *Description*: Full-text embeddings for 200,000 top computer science papers.
    *   *Link*: [Access Dataset](https://huggingface.co/datasets/example)

| Dataset Name | Repository | Format | License | Quality Score |
| :--- | :--- | :--- | :--- | :--- |
| CiteConnect | Zenodo | JSONL | CC-BY | 9.4/10 |
| SemanticPapers | Hugging Face | Parquet | Apache 2.0 | 9.2/10 |
| ResearchMetadata | Dataverse | CSV | CC0 | 8.8/10 |`;

      case "journal-recommendation":
        return `### Journal Recommendation System: "${cleanPrompt}"

Based on the abstract prompt provided, here are the top high-impact academic journals recommended for publication:

#### Recommended Venues
| Rank | Journal Name | Impact Factor | Review Cycle | Open Access | Match Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Journal of Academic Informatics** | 8.42 | ~4.5 weeks | Optional | **97.8%** |
| **2** | **IEEE Transactions on AI** | 9.11 | ~6.2 weeks | Optional | **95.2%** |
| **3** | **ACM Computing Surveys** | 14.32 | ~12 weeks | No | **91.4%** |
| **4** | **PLOS ONE** | 3.75 | ~3.8 weeks | Yes | **88.6%** |

#### Submission Strategy Tip
*Journal of Academic Informatics* is currently seeking articles on **${cleanPrompt}** for a special issue. The turnaround speed is highly competitive (less than 5 weeks for first review), making it the optimal target.`;

      case "conference-recommendation":
        return `### Conference Recommendation System: "${cleanPrompt}"

Here are the optimal upcoming academic conferences for submitting your research work:

#### Top Recommendations
1.  **IEEE International Conference on Semantic Systems (ICSC 2027)**
    *   *Location*: Boston, MA, USA
    *   *Deadline*: October 12, 2026
    *   *Review Period*: 6 weeks
    *   *Core Focus*: Semantic search, academic graphs, knowledge bases.
    *   *Match Score*: **98.4%**

2.  **ACM Conference on Information & Knowledge Management (CIKM 2026)**
    *   *Location*: Paris, France
    *   *Deadline*: July 15, 2026
    *   *Core Focus*: Large scale databases, citation indexing, retrieval.
    *   *Match Score*: **93.1%**

3.  **World Wide Web Conference (TheWebConf 2027)**
    *   *Location*: Sydney, Australia
    *   *Deadline*: September 8, 2026
    *   *Match Score*: **89.5%**`;

      default:
        return `Processed your request for workspace **${workspace}** and prompt **${cleanPrompt}** using model **${model}**. This session has been saved.`;
    }
  }
}

module.exports = new AiService();
