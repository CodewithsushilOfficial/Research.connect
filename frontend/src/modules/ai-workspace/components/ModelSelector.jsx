import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Brain, Sparkles, Cpu, Shield, Database } from "lucide-react";

const providers = [
  {
    id: "NVIDIA NIM",
    name: "NVIDIA NIM (Production)",
    icon: Database,
    color: "text-emerald-500",
    models: ["meta/llama-3.1-70b-instruct", "deepseek-r1", "qwen2.5-coder-32b-instruct"],
  },
  {
    id: "Gemini",
    name: "Google Gemini (Live API)",
    icon: Shield,
    color: "text-indigo-500",
    models: ["gemini-1.5-flash", "gemini-1.5-pro"],
  },
  {
    id: "OpenAI",
    name: "OpenAI GPT (Production)",
    icon: Sparkles,
    color: "text-amber-500",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  {
    id: "Claude",
    name: "Anthropic Claude",
    icon: Cpu,
    color: "text-rose-500",
    models: ["claude-3-5-sonnet", "claude-3-opus"],
  },
  {
    id: "HuggingFace",
    name: "Hugging Face",
    icon: Brain,
    color: "text-purple-500",
    models: ["meta-llama/Llama-3-70b-instruct", "mistralai/Mixtral-8x7B-Instruct"],
  },
];

const ModelSelector = ({ selectedProvider, selectedModel, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (providerId, model) => {
    onChange(providerId, model);
    setIsOpen(false);
  };

  const currentProvider = providers.find((p) => p.id === selectedProvider) || providers[0];
  const ProviderIcon = currentProvider.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-primary/5 active:scale-[0.98]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <ProviderIcon className={`w-3.5 h-3.5 ${currentProvider.color}`} />
        <span className="text-slate-400 mr-0.5">{currentProvider.name.split(" ")[0]}:</span>
        <span className="text-slate-900 font-extrabold truncate max-w-[120px] sm:max-w-[180px]">
          {selectedModel.split("/").pop()}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 lg:right-0 lg:left-auto mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[10px] uppercase font-black text-slate-900 tracking-wider">
              Choose AI Workspace Model
            </span>
          </div>
          
          <div className="max-h-[320px] overflow-y-auto p-1.5 scrollbar-thin space-y-2">
            {providers.map((prov) => {
              const Icon = prov.icon;
              return (
                <div key={prov.id} className="space-y-0.5">
                  <div className="px-3 py-1 flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                    <Icon className={`w-3 h-3 ${prov.color}`} />
                    <span>{prov.name}</span>
                  </div>
                  <div className="space-y-0.5">
                    {prov.models.map((modelOpt) => {
                      const isSelected = selectedProvider === prov.id && selectedModel === modelOpt;
                      return (
                        <button
                          key={modelOpt}
                          type="button"
                          onClick={() => handleSelect(prov.id, modelOpt)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-all font-semibold ${
                            isSelected
                              ? "bg-primary/5 text-primary font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{modelOpt.split("/").pop()}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;
