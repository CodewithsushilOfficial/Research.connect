const AiPromptTemplate = require("../../../models/AiPromptTemplate");

const defaultTemplates = [
  {
    workspace: "literature-review",
    label: "Synthesize Multi-Modal Transformers",
    text: "Write a literature review on the recent advancements of multi-modal transformers in clinical data synthesis, focusing on papers from 2024 to 2026.",
    category: "Architecture",
  },
  {
    workspace: "literature-review",
    label: "Evaluate Edge Compute Latency",
    text: "Draft a literature synthesis comparing edge computing latency profiles for lightweight neural models in IoT settings.",
    category: "Performance",
  },
  {
    workspace: "research-assistant",
    label: "Formulate Core Hypothesis",
    text: "I am researching model compression. Help me formulate a clear null and alternative hypothesis and propose a validation pipeline.",
    category: "Hypothesis",
  },
  {
    workspace: "paper-summary",
    label: "Summarize Key Claims",
    text: "Summarize the primary claims, theoretical contributions, and empirical limitations of the attached manuscript on decentralized consensus.",
    category: "General",
  },
  {
    workspace: "citation-generator",
    label: "Generate APA & BibTeX",
    text: "Generate citations in APA, Chicago, and BibTeX for the article 'Attention Multi-Modal Search in Informatics' by David Chen and Robert Miller, published in 2026.",
    category: "Citation",
  },
  {
    workspace: "research-gap",
    label: "Find Edge Quantization Gaps",
    text: "Analyze the current state of parameter quantization for Edge AI and identify unexplored gaps regarding 32-bit microcontrollers.",
    category: "Gaps",
  },
  {
    workspace: "methodology-generator",
    label: "Design Wearable Experiment",
    text: "Propose an experimental design, sample size selection, and validation metrics for a trial monitoring cognitive stress in 100 participants.",
    category: "Methodology",
  },
  {
    workspace: "paper-reviewer",
    label: "Simulate Peer Reviewer",
    text: "Act as a peer reviewer for IEEE Transactions. Critique the methodology and experimental validation in my draft on adversarial noise.",
    category: "Critique",
  },
  {
    workspace: "proposal-generator",
    label: "NIH Grant Proposal Outline",
    text: "Structure a comprehensive grant proposal outline for an NIH R01 grant focusing on automated sleep cycle detection.",
    category: "Grants",
  },
  {
    workspace: "thesis-assistant",
    label: "Draft Introduction Draft",
    text: "Help me draft a 300-word introduction section for my thesis chapter on transformer attention routing bottlenecks.",
    category: "Thesis",
  },
  {
    workspace: "pdf-chat",
    label: "Explain Table 2 Results",
    text: "Explain the findings of Table 2 in this paper and discuss whether the performance improvement is statistically significant.",
    category: "Analysis",
  },
  {
    workspace: "dataset-finder",
    label: "Find Temporal Graphs",
    text: "Discover open-access datasets containing temporal citation graphs and author co-authorship relationships from 2025 onwards.",
    category: "Data",
  },
  {
    workspace: "journal-recommendation",
    label: "Match Abstract to Venues",
    text: "Here is my manuscript abstract: [Paste Abstract]. Recommend the top 3 optimal journals based on impact factor, submission turnaround, and match percentage.",
    category: "Journal",
  },
  {
    workspace: "conference-recommendation",
    label: "IEEE / ACM Conference Search",
    text: "I have a paper on decentralized graph routing. Suggest IEEE or ACM conferences with deadlines between October and December 2026.",
    category: "Conference",
  }
];

class SeederService {
  async seedTemplates() {
    try {
      const count = await AiPromptTemplate.countDocuments();
      if (count === 0) {
        console.log("Seeding default AI Prompt Templates into MongoDB...");
        await AiPromptTemplate.insertMany(defaultTemplates);
        console.log("Successfully seeded AI Prompt Templates.");
      }
    } catch (err) {
      console.error("Failed to seed AI Prompt Templates:", err.message);
    }
  }
}

module.exports = new SeederService();
