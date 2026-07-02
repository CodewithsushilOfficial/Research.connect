import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Search, Brain, Cpu, Sparkles, Sliders, Clock, Bookmark, 
  History, Keyboard, Award, Settings, ChevronRight, Pin 
} from "lucide-react";
import { aiTools } from "../components/QuickToolGrid";
import aiService from "../services/ai.service";
import SessionHistory from "../components/SessionHistory";

const AIWorkspace = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route extraction helper
  const getActiveWorkspace = useCallback(() => {
    const parts = location.pathname.split("/");
    return parts[parts.length - 1] || "literature-review";
  }, [location.pathname]);

  const activeWorkspace = getActiveWorkspace();

  // --- Configuration States ---
  const [selectedProvider, setSelectedProvider] = useState("NVIDIA NIM");
  const [selectedModel, setSelectedModel] = useState("meta/llama-3.1-70b-instruct");
  const [temperature, setTemperature] = useState(0.7);
  const [contextLength, setContextLength] = useState(4096);

  // --- History & Stats States ---
  const [sessions, setSessions] = useState([]);
  const [dbTemplates, setDbTemplates] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentContent, setCurrentContent] = useState("");
  const [dailyTokenUsage, setDailyTokenUsage] = useState(14500);
  const [dailyTokenLimit] = useState(50000);
  const [searchToolQuery, setSearchToolQuery] = useState("");

  // Load user sessions for current workspace
  const loadSessions = useCallback(async () => {
    try {
      const workspace = getActiveWorkspace();
      const res = await aiService.getSessions(workspace);
      if (res && res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load AI sessions:", err);
    }
  }, [getActiveWorkspace]);

  // Load daily token metrics from database
  const loadUsageStats = useCallback(async () => {
    try {
      const res = await aiService.getHistory();
      if (res && res.success && res.data && res.data.length > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        const todayUsage = res.data.find(u => u.date === todayStr);
        if (todayUsage) {
          setDailyTokenUsage(todayUsage.tokensUsed);
        }
      }
    } catch (err) {
      console.error("Failed to load AI usage metrics:", err);
    }
  }, []);

  // Fetch templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await aiService.getTemplates();
        if (res && res.success) {
          setDbTemplates(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      }
    };
    loadTemplates();
  }, []);

  // Sync on pathname change
  useEffect(() => {
    loadSessions();
    loadUsageStats();
    setActiveSession(null);
    setCurrentContent("");
  }, [location.pathname, loadSessions, loadUsageStats]);

  // Select session from history
  const handleSelectSession = async (sessionId) => {
    try {
      setLoading(true);
      const res = await aiService.getSessionById(sessionId);
      if (res && res.success && res.data) {
        const { session, messages } = res.data;
        setActiveSession(session);
        setSelectedProvider(session.provider || "NVIDIA NIM");
        setSelectedModel(session.model || "meta/llama-3.1-70b-instruct");
        setTemperature(session.temperature || 0.7);
        setContextLength(session.contextLength || 4096);

        // Find last assistant response content
        const assistantMsgs = messages.filter((m) => m.role === "assistant");
        if (assistantMsgs.length > 0) {
          setCurrentContent(assistantMsgs[assistantMsgs.length - 1].content);
        } else {
          setCurrentContent("");
        }
      }
    } catch (err) {
      toast.error("Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  // Start new session
  const handleStartNewSession = () => {
    setActiveSession(null);
    setCurrentContent("");
    toast.success("Ready for a new session!");
  };

  // Rename session
  const handleRenameSession = async (id, newTitle) => {
    try {
      const res = await aiService.updateSession(id, { title: newTitle });
      if (res && res.success) {
        toast.success("Session renamed");
        loadSessions();
        if (activeSession && activeSession._id === id) {
          setActiveSession((prev) => ({ ...prev, title: newTitle }));
        }
      }
    } catch (err) {
      toast.error("Failed to rename session");
    }
  };

  // Delete session
  const handleDeleteSession = async (id) => {
    try {
      const res = await aiService.deleteSession(id);
      if (res && res.success) {
        toast.success("Session deleted");
        loadSessions();
        if (activeSession && activeSession._id === id) {
          setActiveSession(null);
          setCurrentContent("");
        }
      }
    } catch (err) {
      toast.error("Failed to delete session");
    }
  };

  // Pin session
  const handlePinSession = async (id, isPinned) => {
    try {
      const res = await aiService.updateSession(id, { isPinned });
      if (res && res.success) {
        toast.success(isPinned ? "Pinned to top" : "Session unpinned");
        loadSessions();
        if (activeSession && activeSession._id === id) {
          setActiveSession((prev) => ({ ...prev, isPinned }));
        }
      }
    } catch (err) {
      toast.error("Failed to update pin state");
    }
  };

  // Model provider config change callback
  const handleModelChange = (prov, mdl) => {
    setSelectedProvider(prov);
    setSelectedModel(mdl);
    toast.success(`Switched to ${prov}: ${mdl}`);
  };

  // Filter tools list on left side search
  const filteredTools = aiTools.filter((t) =>
    t.label.toLowerCase().includes(searchToolQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchToolQuery.toLowerCase())
  );

  const tokenPercentage = Math.min((dailyTokenUsage / dailyTokenLimit) * 100, 100);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-bg-page text-slate-800 overflow-hidden">
      
      {/* ==================================================================== */}
      {/* LEFT SIDEBAR: QUICK AI TOOLS LIST (Main Left Sidebar) */}
      {/* ==================================================================== */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 text-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-[12px] font-black text-slate-900 tracking-wider uppercase flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span>Quick AI Tools</span>
          </h3>
          <p className="text-[9px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">
            {aiTools.length} Workspace Hubs Available
          </p>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-slate-100 flex-shrink-0 bg-slate-50/20">
          <div className="relative">
            <input
              type="text"
              placeholder="Search AI Tool..."
              value={searchToolQuery}
              onChange={(e) => setSearchToolQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-9.5 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 text-slate-900 font-semibold transition-all duration-200"
            />
            <Search className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-grow overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = location.pathname.endsWith(`/${tool.id}`);
            return (
              <NavLink
                key={tool.id}
                to={`/ai-workspace/${tool.id}`}
                className={`group w-full flex items-start gap-3.5 p-3 rounded-2xl transition-all border text-left active:scale-[0.99] duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50/60 to-blue-50/20 border-primary/20 border-l-4 border-l-primary shadow-sm"
                    : "border-transparent hover:bg-slate-50/80 hover:border-slate-100"
                }`}
              >
                <span className={`p-2.5 rounded-xl transition-all duration-150 shrink-0 ${tool.bgColor || "bg-slate-50"} ${tool.color || "text-slate-500"} ${
                  isActive
                    ? "scale-105 shadow-sm ring-1 ring-primary/10 font-bold"
                    : "opacity-75 group-hover:opacity-100"
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-[11px] text-slate-900 leading-tight flex items-center justify-between gap-1">
                    <span>{tool.label}</span>
                    <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5 whitespace-nowrap shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {tool.time}
                    </span>
                  </h4>
                  <p className="text-[9.5px] text-slate-450 line-clamp-1 mt-1 font-semibold leading-tight group-hover:text-slate-655 transition-colors">
                    {tool.desc}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* CENTER & RIGHT AREAS CONTAINER */}
      {/* ==================================================================== */}
      <div className="flex flex-1 min-w-0 h-full overflow-hidden">
        
        {/* CENTER / MAIN WORKSPACE AREA (Scrollable) */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          <Outlet
            context={{
              selectedProvider,
              selectedModel,
              setSelectedProvider,
              setSelectedModel,
              temperature,
              setTemperature,
              contextLength,
              setContextLength,
              activeSession,
              setActiveSession,
              loading,
              setLoading,
              currentContent,
              setCurrentContent,
              loadSessions,
              loadUsageStats,
              activeWorkspace,
              handleStartNewSession,
              dbTemplates,
            }}
          />
        </main>

        {/* RIGHT SIDEBAR WIDGETS (Scrollable) */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* 1. Engine Config */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left space-y-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-black text-slate-900 tracking-wider">
                Engine Config
              </span>
              <Sliders className="w-3.5 h-3.5 text-primary" />
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                  AI Provider
                </span>
                <div className="flex items-center gap-1.5 font-black text-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span>{selectedProvider}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                  Model Instance
                </span>
                <div className="flex items-center gap-1.5 font-black text-slate-850 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="truncate">{selectedModel.split("/").pop()}</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5 pt-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                    Temperature
                  </span>
                  <span className="font-black text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-lg text-[10px]">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Context Length */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                    Max Tokens
                  </span>
                  <span className="font-black text-slate-800 font-mono bg-slate-50 px-2 py-0.5 rounded-lg text-[10px]">{contextLength}</span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="512"
                  value={contextLength}
                  onChange={(e) => setContextLength(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* 2. Token Daily Allowance */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left space-y-4 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-black text-slate-900 tracking-wider">
                Token Allowance
              </span>
              <Award className="w-3.5 h-3.5 text-primary" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                <span>Daily Usage</span>
                <span className="font-mono">
                  {dailyTokenUsage.toLocaleString()} / {dailyTokenLimit.toLocaleString()}
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 via-primary to-indigo-650 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  style={{ width: `${tokenPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase tracking-wider">
                <span>{tokenPercentage.toFixed(1)}% Consumed</span>
                <span>Resets in 14h 45m</span>
              </div>
            </div>
          </div>

          {/* 3. Recent Sessions History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left flex flex-col max-h-[360px] transition-all duration-300 hover:shadow-md flex-shrink-0">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
              <span className="text-[10px] uppercase font-black text-slate-900 tracking-wider">
                Recent Sessions
              </span>
              <History className="w-3.5 h-3.5 text-primary" />
            </div>

            <div className="overflow-y-auto scrollbar-thin">
              <SessionHistory
                sessions={sessions}
                activeSessionId={activeSession?._id}
                onSelectSession={handleSelectSession}
                onRenameSession={handleRenameSession}
                onDeleteSession={handleDeleteSession}
                onPinSession={handlePinSession}
              />
            </div>
          </div>

          {/* 4. Keyboard Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left space-y-3.5 transition-all duration-300 hover:shadow-md flex-shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-black text-slate-900 tracking-wider">
                Hotkeys
              </span>
              <Keyboard className="w-3.5 h-3.5 text-primary" />
            </div>

            <div className="space-y-2.5 text-xs font-semibold text-slate-550">
              <div className="flex items-center justify-between">
                <span>Generate Prompt</span>
                <kbd className="bg-slate-50 border border-slate-200 text-slate-655 text-[9px] px-2 py-0.5 rounded-lg font-mono font-bold shadow-sm">
                  Enter
                </kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Add New Line</span>
                <kbd className="bg-slate-50 border border-slate-200 text-slate-655 text-[9px] px-2 py-0.5 rounded-lg font-mono font-bold shadow-sm">
                  Shift+Enter
                </kbd>
              </div>
            </div>
          </div>

          {/* Tiny Status Footer */}
          <div className="text-[9px] font-bold text-slate-400 text-center space-y-0.5 pt-4 border-t border-slate-100 flex-shrink-0">
            <p>© 2026 Research Connect Inc.</p>
            <p className="tracking-wide">NVIDIA NIM V2.0 ENGINE</p>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default AIWorkspace;
