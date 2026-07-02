import React from "react";
import { Sparkles, Terminal } from "lucide-react";

const templatesByWorkspace = {
  "literature-review": [
    { label: "Synthesize Multi-Modal Transformers", text: "Write a literature review on the recent advancements of multi-modal transformers in clinical data synthesis, focusing on papers from 2024 to 2026." },
    { label: "Evaluate Edge Compute Latency", text: "Draft a literature synthesis comparing edge computing latency profiles for lightweight neural models in IoT settings." }
  ],
  "research-assistant": [
    { label: "Formulate Core Hypothesis", text: "I am researching model compression. Help me formulate a clear null and alternative hypothesis and propose a validation pipeline." }
  ],
  "paper-summary": [
    { label: "Summarize Key Claims", text: "Summarize the primary claims, theoretical contributions, and empirical limitations of the attached manuscript on decentralized consensus." }
  ],
  "citation-generator": [
    { label: "Generate APA & BibTeX", text: "Generate citations in APA, Chicago, and BibTeX for the article 'Attention Multi-Modal Search in Informatics' by David Chen and Robert Miller, published in 2026." }
  ],
  "research-gap": [
    { label: "Find Edge Quantization Gaps", text: "Analyze the current state of parameter quantization for Edge AI and identify unexplored gaps regarding 32-bit microcontrollers." }
  ],
  "methodology-generator": [
    { label: "Design Wearable Experiment", text: "Propose an experimental design, sample size selection, and validation metrics for a trial monitoring cognitive stress in 100 participants." }
  ],
  "paper-reviewer": [
    { label: "Simulate Peer Reviewer", text: "Act as a peer reviewer for IEEE Transactions. Critique the methodology and experimental validation in my draft on adversarial noise." }
  ],
  "proposal-generator": [
    { label: "NIH Grant Proposal Outline", text: "Structure a comprehensive grant proposal outline for an NIH R01 grant focusing on automated sleep cycle detection." }
  ],
  "thesis-assistant": [
    { label: "Draft Introduction Draft", text: "Help me draft a 300-word introduction section for my thesis chapter on transformer attention routing bottlenecks." }
  ],
  "pdf-chat": [
    { label: "Explain Table 2 Results", text: "Explain the findings of Table 2 in this paper and discuss whether the performance improvement is statistically significant." }
  ],
  "dataset-finder": [
    { label: "Find Temporal Graphs", text: "Discover open-access datasets containing temporal citation graphs and author co-authorship relationships from 2025 onwards." }
  ],
  "journal-recommendation": [
    { label: "Match Abstract to Venues", text: "Here is my manuscript abstract: [Paste Abstract]. Recommend the top 3 optimal journals based on impact factor, submission turnaround, and match percentage." }
  ],
  "conference-recommendation": [
    { label: "IEEE / ACM Conference Search", text: "I have a paper on decentralized graph routing. Suggest IEEE or ACM conferences with deadlines between October and December 2026." }
  ]
};

const PromptTemplates = ({ workspace, dbTemplates = [], onSelectTemplate }) => {
  // Filter DB templates for this workspace
  let templates = dbTemplates.filter((t) => t.workspace === workspace && t.isActive !== false);

  // Fallback to static config if database yields no records yet
  if (templates.length === 0) {
    templates = templatesByWorkspace[workspace] || [];
  }

  if (templates.length === 0) return null;

  return (
    <div className="space-y-2.5 text-left">
      <div className="flex items-center gap-1.5 text-slate-450 font-bold text-[10px] uppercase tracking-wider">
        <Terminal className="w-3.5 h-3.5" />
        <span>Prompt Templates</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectTemplate(tpl.text)}
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3.5 py-2 rounded-xl transition-all font-semibold active:scale-[0.98]"
          >
            <Sparkles className="w-3 h-3 text-indigo-500 flex-shrink-0" />
            <span className="line-clamp-1">{tpl.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptTemplates;
