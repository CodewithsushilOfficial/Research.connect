import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Users, Building2, Mic2 } from 'lucide-react';

const TABS = [
  { key: 'all',          label: 'All',          icon: Search },
  { key: 'publications', label: 'Publications',  icon: BookOpen },
  { key: 'authors',      label: 'Authors',       icon: Users },
  { key: 'journals',     label: 'Journals',      icon: Building2 },
  { key: 'conferences',  label: 'Conferences',   icon: Mic2 },
];

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * SearchTabs — horizontal tab bar with a sliding gradient pill indicator.
 * The pill uses Framer Motion's layoutId for a smooth shared-element transition.
 */
const SearchTabs = ({ activeTab, onChange }) => {
  const reduced = prefersReduced();

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-px" role="tablist">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 flex-shrink-0 ${
              isActive
                ? 'text-white'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-gray-100'
            }`}
          >
            {/* Sliding background pill */}
            {isActive && (
              <motion.span
                layoutId={reduced ? undefined : 'tab-pill'}
                className="absolute inset-0 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 300, damping: 25 }
                }
              />
            )}

            {/* Icon + label (above the pill via relative z-index) */}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SearchTabs;
export { TABS };
