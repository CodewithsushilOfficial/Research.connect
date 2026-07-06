import React from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

const prefersReduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * DiscoverState — animated empty/discover state shown before any search query.
 * Features:
 *  - Floating icon container (slow y-oscillation, 3s loop)
 *  - Pulsing ring behind the icon
 *  - Quick-start suggestion chips
 */
const DiscoverState = ({ onSuggestionClick }) => {
  const reduced = prefersReduced();

  const suggestions = [
    'Large Language Models', 'CRISPR Gene Editing', 'Quantum Computing',
    'Diffusion Models', 'Climate AI', 'Protein Folding', 'Federated Learning',
  ];

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Pulsing ring + floating icon */}
      <div className="relative mb-10">
        {/* Outer pulse ring */}
        {!reduced && (
          <>
            <motion.div
              className="absolute inset-0 rounded-3xl bg-blue-100"
              animate={{ scale: [1, 1.25, 1.5], opacity: [0.5, 0.25, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              style={{ width: 96, height: 96, top: 0, left: 0 }}
            />
            <motion.div
              className="absolute inset-0 rounded-3xl bg-indigo-100"
              animate={{ scale: [1, 1.45, 1.9], opacity: [0.3, 0.15, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
              style={{ width: 96, height: 96, top: 0, left: 0 }}
            />
          </>
        )}

        {/* Floating icon container */}
        <motion.div
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
          animate={reduced ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Search className="w-11 h-11 text-white" />
          {/* Sparkle badge */}
          <motion.div
            className="absolute -top-2 -right-2 w-7 h-7 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg"
            animate={reduced ? {} : { rotate: [0, 15, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Heading */}
      <h2 className="text-4xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155]">
        Discover Research
      </h2>
      <p className="text-[#475569] text-base max-w-md mx-auto leading-relaxed mb-10 font-medium">
        Search millions of publications, authors, journals, and conferences.
        Explore the world's scientific knowledge in one place.
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-xl">
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            onClick={() => onSuggestionClick && onSuggestionClick(s)}
            className="px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#BFDBFE] hover:text-[#2563EB] rounded-full text-[13px] font-bold transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-[#F8FAFC] hover:to-[#EFF6FF]"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverState;
