import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Compass } from "lucide-react";
import { toast } from "react-hot-toast";
import WorkspaceHeader from "../components/WorkspaceHeader";
import PromptTemplates from "../components/PromptTemplates";
import PromptInput from "../components/PromptInput";
import ResultViewer from "../components/ResultViewer";
import aiService from "../services/ai.service";

const ConferenceRecommendation = () => {
  const {
    selectedProvider,
    selectedModel,
    activeSession,
    setActiveSession,
    loading,
    setLoading,
    currentContent,
    setCurrentContent,
    loadSessions,
    loadUsageStats,
    activeWorkspace,
    setSelectedModel,
    setSelectedProvider,
    temperature,
    contextLength,
    dbTemplates,
  } = useOutletContext();

  const [promptText, setPromptText] = useState("");

  useEffect(() => {
    if (activeSession) {
      aiService.getSessionById(activeSession._id).then(res => {
        if (res.success && res.data?.messages) {
          const userMsgs = res.data.messages.filter((m) => m.role === "user");
          if (userMsgs.length > 0) {
            setPromptText(userMsgs[userMsgs.length - 1].content);
          }
        }
      }).catch(() => {});
    } else {
      setPromptText("");
    }
  }, [activeSession]);

  const handleSubmit = async (text, attachments) => {
    setLoading(true);
    setCurrentContent("");

    try {
      await aiService.generateResponseStream({
        workspace: activeWorkspace,
        prompt: text,
        sessionId: activeSession?._id,
        provider: selectedProvider,
        model: selectedModel,
        temperature,
        contextLength,
        attachments,
        onChunk: (chunk) => {
          setCurrentContent((prev) => prev + chunk);
        },
        onDone: (session) => {
          setActiveSession(session);
          loadSessions();
          loadUsageStats();
          setLoading(false);
          toast.success("Conferences recommended!");
        },
        onError: (err) => {
          setLoading(false);
          toast.error(err.message || "Failed to stream AI response");
        },
      });
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Streaming failed");
    }
  };

  const handleClear = () => {
    setPromptText("");
  };

  const handleRegenerate = () => {
    if (promptText) {
      handleSubmit(promptText, []);
    }
  };

  const handleContinue = () => {
    const continuePrompt = "List conferences with upcoming abstracts submission windows next month.";
    setPromptText(continuePrompt);
    handleSubmit(continuePrompt, []);
  };

  const handleModelSelect = (prov, modelOpt) => {
    setSelectedProvider(prov);
    setSelectedModel(modelOpt);
  };

  return (
    <div
      id="current-workspace-card"
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-left animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <WorkspaceHeader
        title="AI Conference Recommendation"
        description="Pinpoint matching IEEE, ACM, and Springer conferences."
        icon={Compass}
        colorClass="text-emerald-600"
      />
      
      <PromptTemplates
        workspace="conference-recommendation"
        dbTemplates={dbTemplates}
        onSelectTemplate={setPromptText}
      />

      <PromptInput
        value={promptText}
        onChange={setPromptText}
        onClear={handleClear}
        onSubmit={handleSubmit}
        loading={loading}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onModelChange={handleModelSelect}
        workspaceLabel="Conference Recommendation"
      />

      <ResultViewer
        content={currentContent}
        loading={loading}
        onRegenerate={handleRegenerate}
        onContinue={handleContinue}
      />
    </div>
  );
};

export default ConferenceRecommendation;
