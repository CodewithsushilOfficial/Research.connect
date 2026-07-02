import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  BookOpen,
  Quote,
  Brain,
  ClipboardList,
  CheckSquare,
  PenTool,
  FileText,
  Database,
  Compass,
  Clock,
} from "lucide-react";

export const aiTools = [
  {
    id: "literature-review",
    label: "AI Literature Review",
    desc: "Scan and synthesize 200M+ research papers for literature review.",
    icon: Search,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "hover:border-blue-300",
    glowColor: "rgba(37, 99, 235, 0.15)",
    time: "3 min",
  },
  {
    id: "research-assistant",
    label: "AI Research Assistant",
    desc: "Draft outlines, refine methodologies, and structure research.",
    icon: Sparkles,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "hover:border-amber-300",
    glowColor: "rgba(245, 158, 11, 0.15)",
    time: "1 min",
  },
  {
    id: "paper-summary",
    label: "AI Paper Summary",
    desc: "Extract key insights, claims, and limitations instantly.",
    icon: BookOpen,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    borderColor: "hover:border-indigo-300",
    glowColor: "rgba(79, 70, 229, 0.15)",
    time: "2 min",
  },
  {
    id: "citation-generator",
    label: "AI Citation Generator",
    desc: "Generate correct formatted citations in APA, MLA, Harvard, BibTeX.",
    icon: Quote,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "hover:border-emerald-300",
    glowColor: "rgba(34, 197, 94, 0.15)",
    time: "1 min",
  },
  {
    id: "research-gap",
    label: "AI Research Gap Finder",
    desc: "Analyze existing corpus to pinpoint unexplored avenues.",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "hover:border-purple-300",
    glowColor: "rgba(168, 85, 247, 0.15)",
    time: "4 min",
  },
  {
    id: "methodology-generator",
    label: "AI Methodology Generator",
    desc: "Synthesize optimal experiment setups and validation metrics.",
    icon: ClipboardList,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    borderColor: "hover:border-rose-300",
    glowColor: "rgba(244, 63, 94, 0.15)",
    time: "5 min",
  },
  {
    id: "paper-reviewer",
    label: "AI Paper Reviewer",
    desc: "Simulate peer reviewer critiques and detect structural errors.",
    icon: CheckSquare,
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
    borderColor: "hover:border-cyan-300",
    glowColor: "rgba(6, 182, 212, 0.15)",
    time: "6 min",
  },
  {
    id: "proposal-generator",
    label: "AI Proposal Generator",
    desc: "Structure research proposal narratives for NIH, NSF, Horizon.",
    icon: PenTool,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "hover:border-orange-300",
    glowColor: "rgba(249, 115, 22, 0.15)",
    time: "8 min",
  },
  {
    id: "thesis-assistant",
    label: "AI Thesis Assistant",
    desc: "Co-pilot drafting chapters, literature gaps, and introductions.",
    icon: FileText,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    borderColor: "hover:border-teal-300",
    glowColor: "rgba(20, 184, 166, 0.15)",
    time: "10 min",
  },
  {
    id: "pdf-chat",
    label: "AI PDF Chat",
    desc: "Upload research PDFs and converse directly with the paper.",
    icon: FileText,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "hover:border-pink-300",
    glowColor: "rgba(236, 72, 153, 0.15)",
    time: "2 min",
  },
  {
    id: "dataset-finder",
    label: "AI Dataset Finder",
    desc: "Discover public repositories and open datasets.",
    icon: Database,
    color: "text-violet-500",
    bgColor: "bg-violet-50",
    borderColor: "hover:border-violet-300",
    glowColor: "rgba(139, 92, 246, 0.15)",
    time: "3 min",
  },
  {
    id: "journal-recommendation",
    label: "AI Journal Recommend",
    desc: "Match your manuscript abstract to optimal high-impact journals.",
    icon: Compass,
    color: "text-lime-650",
    bgColor: "bg-lime-50",
    borderColor: "hover:border-lime-300",
    glowColor: "rgba(101, 163, 13, 0.15)",
    time: "2 min",
  },
  {
    id: "conference-recommendation",
    label: "AI Conference Recommend",
    desc: "Find relevant IEEE, ACM, or Nature-approved call for papers.",
    icon: Compass,
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-50",
    borderColor: "hover:border-fuchsia-300",
    glowColor: "rgba(217, 70, 239, 0.15)",
    time: "2 min",
  },
];

const QuickToolGrid = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = (id) => {
    navigate(`/ai-workspace/${id}`);
    
    // Scroll workspace view smoothly into view if on mobile/small screen
    const element = document.getElementById("current-workspace-card");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 mb-10">
      <div className="flex items-center justify-between text-left">
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Quick AI Tools</h3>
        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
          13 Workspace Hubs Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = location.pathname.endsWith(`/${tool.id}`);
          return (
            <motion.button
              key={tool.id}
              onClick={() => handleCardClick(tool.id)}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`relative bg-white border text-left p-4.5 rounded-2xl transition-all outline-none flex flex-col justify-between h-[135px] ${
                isActive
                  ? "border-primary ring-2 ring-primary/10 shadow-md shadow-primary/5"
                  : `border-slate-200 ${tool.borderColor}`
              }`}
              style={{
                boxShadow: isActive
                  ? `0 10px 15px -3px ${tool.glowColor}, 0 4px 6px -4px ${tool.glowColor}`
                  : undefined,
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${tool.bgColor} ${tool.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-450 font-bold bg-slate-50 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{tool.time}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {tool.label}
                  </h4>
                  <p className="text-[10px] text-slate-550 line-clamp-2 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickToolGrid;
