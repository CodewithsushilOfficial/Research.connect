import React from "react";
import { Brain, Cpu, History, Bookmark, Sparkles, Keyboard, Award } from "lucide-react";
import SessionHistory from "./SessionHistory";

const RightUtilityPanel = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onPinSession,
  provider,
  model,
  dailyTokenUsage = 14500,
  dailyTokenLimit = 50000,
}) => {
  const tokenPercentage = Math.min((dailyTokenUsage / dailyTokenLimit) * 100, 100);

  const shortcuts = [
    { keys: "Enter", desc: "Generate prompt" },
    { keys: "Shift + Enter", desc: "Add new line" },
    { keys: "Esc", desc: "Clear prompt text" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* 1. Active Provider & Model Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Brain className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Engine Config
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              AI Provider
            </span>
            <div className="font-extrabold text-slate-800 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>{provider}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Selected Model
            </span>
            <div className="font-extrabold text-slate-800 flex items-center gap-1 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="truncate">{model}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Usage Meters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Award className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Token Allowance
          </h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Daily Usage</span>
            <span>
              {dailyTokenUsage.toLocaleString()} / {dailyTokenLimit.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-indigo-650 h-full rounded-full transition-all duration-500"
              style={{ width: `${tokenPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] text-slate-450 font-bold">
            <span>{tokenPercentage.toFixed(0)}% Consumed</span>
            <span>Resets in 14h 45m</span>
          </div>
        </div>
      </div>

      {/* 3. Recent Sessions History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm flex flex-col min-h-[300px]">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-3.5">
          <History className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Recent Sessions
          </h4>
        </div>

        <div className="flex-1">
          <SessionHistory
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={onSelectSession}
            onRenameSession={onRenameSession}
            onDeleteSession={onDeleteSession}
            onPinSession={onPinSession}
          />
        </div>
      </div>

      {/* 4. Keyboard Shortcuts */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Keyboard className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Keyboard Shortcuts
          </h4>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">{sc.desc}</span>
              <kbd className="bg-slate-50 border border-slate-200 text-slate-655 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm font-mono">
                {sc.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightUtilityPanel;
