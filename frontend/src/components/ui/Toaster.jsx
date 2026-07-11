import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

/* ─── Module-level singleton store ───────────────────────────────
   This holds the toasts and a setter to trigger re-renders. */
let toasts = [];
let listeners = [];

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
  success: (message) => {
    const id = Date.now().toString() + Math.random().toString();
    toasts.push({ id, type: 'success', message });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 5000);
    return id;
  },
  error: (message) => {
    const id = Date.now().toString() + Math.random().toString();
    toasts.push({ id, type: 'error', message });
    notifyListeners();
    setTimeout(() => toast.dismiss(id), 7000);
    return id;
  },
  loading: (message) => {
    const id = Date.now().toString() + Math.random().toString();
    toasts.push({ id, type: 'loading', message });
    notifyListeners();
    return id;
  },
  dismiss: (id) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  },
};

export const Toaster = () => {
  const [currentToasts, setCurrentToasts] = useState(toasts);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {currentToasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md text-sm font-medium transform transition-all duration-300 animate-in slide-in-from-right-4 fade-in
            ${
              t.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                : t.type === 'error'
                ? 'bg-red-50/90 border-red-200 text-red-800'
                : 'bg-white/90 border-slate-200 text-slate-800'
            }
          `}
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          {t.type === 'loading' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin shrink-0" />}
          
          <p className="mr-6">{t.message}</p>
          
          <button
            onClick={() => toast.dismiss(t.id)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-50 hover:opacity-100 hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
