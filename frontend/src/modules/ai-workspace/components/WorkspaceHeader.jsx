import React from "react";
import { Sparkles } from "lucide-react";

const WorkspaceHeader = ({ title, description, icon: Icon, colorClass }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 text-left">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm ${colorClass || "text-primary"}`}>
            <Icon className="w-5.5 h-5.5" />
          </div>
        )}
        <div className="space-y-0.5">
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2 bg-gradient-to-r from-slate-950 to-indigo-950 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-[11px] text-slate-450 max-w-xl leading-relaxed font-semibold">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center self-start sm:self-center gap-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-750 px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm whitespace-nowrap">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        <span>Cognitive Engine Active</span>
      </div>
    </div>
  );
};

export default WorkspaceHeader;
