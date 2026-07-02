import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Send, Trash2, FileText, CheckCircle, HelpCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import ModelSelector from "./ModelSelector";

const PromptInput = ({
  value,
  onChange,
  onClear,
  onSubmit,
  loading,
  selectedProvider,
  selectedModel,
  onModelChange,
  workspaceLabel,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 260)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    // Submit on Enter without Shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitForm();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const file = fileList[0];
    const allowedExtensions = [".pdf", ".docx", ".txt", ".csv"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Unsupported file format. Please upload PDF, DOCX, TXT, or CSV.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    const newAttachment = {
      name: file.name,
      size: file.size,
      fileType: fileExtension,
      fileObject: file,
    };

    setAttachments([newAttachment]); // Replace or add. Let's allow single attachment for simplicity
    toast.success(`Attached "${file.name}"`);
  };

  const removeAttachment = () => {
    setAttachments([]);
  };

  const handleSubmitForm = () => {
    if (!value.trim() && attachments.length === 0) return;
    onSubmit(value, attachments);
    // Keep attachment or clear it based on flow. Let's clear after submission
    setAttachments([]);
  };

  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
  const charCount = value.length;

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative bg-white border rounded-2xl p-4 transition-all duration-300 shadow-sm ${
        dragActive
          ? "border-primary ring-2 ring-primary/10 bg-primary/5"
          : "border-slate-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
      }`}
    >
      {/* Drag overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center pointer-events-none z-10 animate-pulse">
          <FileText className="w-10 h-10 text-primary mb-2" />
          <span className="text-xs font-bold text-primary">Drop PDF, DOCX, TXT, or CSV here</span>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-xl font-bold"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span className="max-w-[200px] truncate">{file.name}</span>
              <span className="text-[10px] text-slate-400 font-semibold">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
              <button
                type="button"
                onClick={removeAttachment}
                className="hover:bg-slate-200 p-0.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Auto-resizing Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Describe your research problem, upload a paper or ask an academic question for ${workspaceLabel}...`}
        disabled={loading}
        rows={3}
        className="w-full text-xs text-slate-900 placeholder-slate-400 bg-transparent resize-none border-none outline-none focus:ring-0 p-0 leading-relaxed min-h-[70px] max-h-[260px]"
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.docx,.txt,.csv"
      />

      {/* Toolbar / Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <ModelSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onChange={onModelChange}
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="Attach file (PDF, DOCX, TXT, CSV)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={onClear}
              disabled={loading}
              className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm flex items-center justify-center"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter and Submit Button */}
        <div className="flex items-center gap-3.5">
          <span className="text-[10px] text-slate-400 font-bold hidden sm:inline-block">
            {charCount} chars | {wordCount} words
          </span>

          <button
            type="button"
            onClick={handleSubmitForm}
            disabled={loading || (!value.trim() && attachments.length === 0)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-xs font-bold py-2.5 px-4.5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <span>{loading ? "Analyzing..." : "Generate"}</span>
            <Send className={`w-3.5 h-3.5 ${loading ? "animate-bounce" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
