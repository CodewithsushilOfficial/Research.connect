import React from 'react';
import { User } from 'lucide-react';

const TypingIndicator = ({ name }) => {
  return (
    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-[200px]">
      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center shrink-0 border border-slate-300">
        <User className="w-3.5 h-3.5 text-slate-500" />
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm flex flex-col gap-1.5">
        <span className="text-[9px] font-black uppercase tracking-wide text-slate-400">
          {name} is typing
        </span>
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
