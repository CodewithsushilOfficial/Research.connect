import React, { useState } from "react";
import { X, Send } from "lucide-react";

// Lightweight, frontend-only application form. On submit it just records the
// application in local state — hook this up to your real endpoint later.
export default function ApplyModal({ project, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const canSubmit = name.trim().length > 0 && message.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Apply to Collaborate</h3>
            <p className="mt-0.5 text-sm text-slate-500">{project.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <label className="mb-1.5 block text-xs font-medium text-slate-600">Your name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ananya Rao"
          className="mb-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
        />

        <label className="mb-1.5 block text-xs font-medium text-slate-600">
          Tell the team why you'd like to join
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Share your relevant experience, skills, or what you'd like to contribute..."
          className="w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit(name, message)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={14} /> Send Application
          </button>
        </div>
      </div>
    </div>
  );
}