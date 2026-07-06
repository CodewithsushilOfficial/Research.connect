import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResultCard from './ResultCard';
import SkeletonCard from './SkeletonCard';
import NoResultsState from './NoResultsState';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * ResultsList — renders a staggered list of ResultCards.
 * Re-runs stagger animation whenever the filterKey changes.
 * Shows skeletons while loading, NoResultsState when empty.
 */
const ResultsList = ({ results, isLoading, query, filterKey, onClearFilters }) => {
  const reduced = prefersReduced();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return <NoResultsState query={query} onClearFilters={onClearFilters} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={filterKey}
        initial={false}
        className="space-y-4"
      >
        {results.map((result, i) => (
          <ResultCard key={result.id} result={result} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultsList;
