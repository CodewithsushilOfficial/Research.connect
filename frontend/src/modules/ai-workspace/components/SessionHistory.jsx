import React, { useState } from "react";
import { Search, Pin, Trash2, Edit2, Check, X, MessageSquare, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

const SessionHistory = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onPinSession,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (e, session) => {
    e.stopPropagation();
    setEditingId(session._id);
    setEditTitle(session.title);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      toast.error("Session title cannot be empty");
      return;
    }
    onRenameSession(id, editTitle);
    setEditingId(null);
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col text-left h-full max-h-[380px]">
      {/* Search Input */}
      <div className="relative mb-3.5">
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5 text-slate-900 font-medium"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            const isActive = activeSessionId === session._id;
            const isEditing = editingId === session._id;
            return (
              <div
                key={session._id}
                onClick={() => !isEditing && onSelectSession(session._id)}
                className={`group w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary/5 border-primary/20 text-primary font-bold shadow-sm"
                    : "border-transparent hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:border-primary font-semibold"
                      autoFocus
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs truncate font-extrabold leading-tight">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-semibold">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize">• {session.workspace.replace("-", " ")}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity ml-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(e, session._id)}
                        className="p-1 hover:bg-slate-200 rounded text-green-600 transition-colors"
                        title="Save rename"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-655 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPinSession(session._id, !session.isPinned);
                        }}
                        className={`p-1 hover:bg-slate-200 rounded transition-colors ${
                          session.isPinned ? "text-amber-500" : "text-slate-400 hover:text-amber-500"
                        }`}
                        title={session.isPinned ? "Unpin session" : "Pin session"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleStartEdit(e, session)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                        title="Rename session"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session._id);
                        }}
                        className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs font-semibold">
            No history logs found
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
