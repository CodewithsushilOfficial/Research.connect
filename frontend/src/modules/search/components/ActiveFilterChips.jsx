import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { PUBLICATION_TYPES } from '../types';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Renders the row of active filter chips below the filter bar.
 * Each chip can be individually removed with an animated pop-out.
 */
const ActiveFilterChips = ({ filters, onRemoveType, onRemoveYear, onRemoveCitation, onClearAll }) => {
  const chips = [];

  // Publication type chips
  (filters.publicationTypes || []).forEach((type) => {
    const label = PUBLICATION_TYPES.find((t) => t.value === type)?.label || type;
    chips.push({ id: `type-${type}`, label, onRemove: () => onRemoveType(type) });
  });

  // Year range chip
  const defaultYear = { from: 2000, to: new Date().getFullYear() };
  if (filters.yearFrom !== defaultYear.from || filters.yearTo !== defaultYear.to) {
    chips.push({
      id: 'year',
      label: `${filters.yearFrom}–${filters.yearTo}`,
      onRemove: onRemoveYear,
    });
  }

  // Citation range chip
  if (filters.citationMin > 0 || filters.citationMax < 5000) {
    const label =
      filters.citationMax >= 5000
        ? `${filters.citationMin.toLocaleString()}+ citations`
        : `${filters.citationMin.toLocaleString()}–${filters.citationMax.toLocaleString()} citations`;
    chips.push({ id: 'citation', label, onRemove: onRemoveCitation });
  }

  if (chips.length === 0) return null;

  const reduced = prefersReduced();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <AnimatePresence>
        {chips.map((chip) => (
          <motion.div
            key={chip.id}
            initial={reduced ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.7, opacity: 0, x: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
          >
            <span>{chip.label}</span>
            <button
              onClick={chip.onRemove}
              className="ml-0.5 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {chips.length > 1 && (
        <motion.button
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClearAll}
          className="flex items-center gap-1 text-xs font-semibold text-[#475569] hover:text-[#2563EB] transition-colors px-2 py-1.5"
        >
          <RotateCcw className="w-3 h-3" />
          Clear all
        </motion.button>
      )}
    </div>
  );
};

export default ActiveFilterChips;
