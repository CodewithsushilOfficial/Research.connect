import React from 'react';
import { motion } from 'framer-motion';
import { SearchX, RotateCcw } from 'lucide-react';

/**
 * NoResultsState — shown when the search returns zero matches.
 * Distinct from DiscoverState — different icon, copy, and action.
 */
const NoResultsState = ({ query, onClearFilters }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="w-20 h-20 rounded-3xl bg-[#FEF3C7] flex items-center justify-center mb-6"
    >
      <SearchX className="w-10 h-10 text-amber-500" />
    </motion.div>

    <motion.h2
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="text-2xl font-black text-[#0F172A] tracking-tight mb-3"
    >
      No results for &ldquo;{query}&rdquo;
    </motion.h2>

    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="text-[#475569] text-sm max-w-sm mx-auto leading-relaxed mb-8 font-medium"
    >
      Try different keywords, check your spelling, or remove some filters to broaden the search.
    </motion.p>

    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onClick={onClearFilters}
      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#2563EB] border border-[#2563EB] hover:bg-[#DBEAFE] active:scale-95 transition-all duration-200"
    >
      <RotateCcw className="w-4 h-4" />
      Clear all filters
    </motion.button>
  </div>
);

export default NoResultsState;
