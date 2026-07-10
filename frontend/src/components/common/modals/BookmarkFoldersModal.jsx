import React, { useState } from 'react';
import { X, Folder, FolderPlus, Check } from 'lucide-react';

const BookmarkFoldersModal = ({ isOpen, onClose, folders, onSelectFolder, initialFolder = 'General' }) => {
  if (!isOpen) return null;

  const [selected, setSelected] = useState(initialFolder);
  const [newFolder, setNewFolder] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const handleCreateAndSelect = () => {
    if (newFolder.trim()) {
      onSelectFolder(newFolder.trim());
      setNewFolder('');
      setShowAddInput(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Save to Collection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="max-h-48 overflow-y-auto space-y-1">
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setSelected(folder)}
                className={`w-full flex items-center justify-between p-3 text-sm font-medium rounded-xl border transition-all ${
                  selected === folder
                    ? 'border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className={`w-4 h-4 ${selected === folder ? 'text-indigo-500' : 'text-slate-400'}`} />
                  {folder}
                </div>
                {selected === folder && <Check className="w-4 h-4 text-indigo-500" />}
              </button>
            ))}
          </div>

          {/* New folder creation */}
          {!showAddInput ? (
            <button
              onClick={() => setShowAddInput(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold border border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Create New Collection Folder
            </button>
          ) : (
            <div className="flex gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
              <input
                type="text"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="Collection name..."
                className="flex-1 px-3 py-1.5 text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100"
              />
              <button
                onClick={handleCreateAndSelect}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowAddInput(false)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelectFolder(selected)}
            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/10"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookmarkFoldersModal;
