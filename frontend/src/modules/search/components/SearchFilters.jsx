import React from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PUBLICATION_TYPES = [
  'Article', 'Conference Paper', 'Book', 'Book Chapter', 'Thesis',
  'Report', 'Review', 'Preprint', 'Dataset', 'Patent', 'Poster'
];

const LANGUAGES = ['English', 'French', 'German', 'Spanish', 'Chinese', 'Arabic', 'Portuguese', 'Japanese', 'Korean'];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'mostCited', label: 'Most Cited' },
  { value: 'mostViewed', label: 'Most Viewed' },
  { value: 'mostDownloaded', label: 'Most Downloaded' },
  { value: 'alphabetical', label: 'A → Z (Title)' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckboxOption = ({ label, checked, onChange, count }) => (
  <label className="flex items-center justify-between gap-2 cursor-pointer py-1 group">
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
        checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
      }`}>
        {checked && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </div>
    {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
  </label>
);

const SearchFilters = ({ filters, onChange, onReset, sort, onSortChange, activeCount = 0 }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const toggleType = (type) => {
    const current = filters.publicationType === type ? '' : type;
    update('publicationType', current);
  };

  const toggleLanguage = (lang) => {
    const current = filters.language === lang ? '' : lang;
    update('language', current);
  };

  return (
    <aside className="w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-900">Filters</h3>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        {/* Sort */}
        <FilterSection title="Sort By">
          <select
            value={sort}
            onChange={e => onSortChange(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-colors"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </FilterSection>

        {/* Publication Type */}
        <FilterSection title="Publication Type">
          <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
            {PUBLICATION_TYPES.map(type => (
              <CheckboxOption
                key={type}
                label={type}
                checked={filters.publicationType === type}
                onChange={() => toggleType(type)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Year Range */}
        <FilterSection title="Year">
          <div className="flex items-center gap-2">
            <select
              value={filters.yearFrom || ''}
              onChange={e => update('yearFrom', e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">From</option>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-gray-400 text-xs">–</span>
            <select
              value={filters.yearTo || ''}
              onChange={e => update('yearTo', e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">To</option>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </FilterSection>

        {/* Quick Badges */}
        <FilterSection title="Access & Format">
          <div className="space-y-1">
            <CheckboxOption
              label="Open Access"
              checked={filters.openAccess === 'true'}
              onChange={() => update('openAccess', filters.openAccess === 'true' ? '' : 'true')}
            />
            <CheckboxOption
              label="Has PDF"
              checked={filters.hasPDF === 'true'}
              onChange={() => update('hasPDF', filters.hasPDF === 'true' ? '' : 'true')}
            />
            <CheckboxOption
              label="Google Scholar Verified"
              checked={filters.isScholarImported === 'true'}
              onChange={() => update('isScholarImported', filters.isScholarImported === 'true' ? '' : 'true')}
            />
          </div>
        </FilterSection>

        {/* Language */}
        <FilterSection title="Language" defaultOpen={false}>
          <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
            {LANGUAGES.map(lang => (
              <CheckboxOption
                key={lang}
                label={lang}
                checked={filters.language === lang}
                onChange={() => toggleLanguage(lang)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
};

export default SearchFilters;
