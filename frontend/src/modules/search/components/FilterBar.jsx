import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { PUBLICATION_TYPES, SORT_OPTIONS, CITATION_PRESETS } from '../types';
import ActiveFilterChips from './ActiveFilterChips';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Dual-handle Range Slider ─────────────────────────────────── */
const RangeSlider = ({ min, max, valueMin, valueMax, onChangeMin, onChangeMax, accentColor = '#2563EB', label }) => {
  const trackRef = useRef(null);

  const percent = (v) => ((v - min) / (max - min)) * 100;

  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const val = Math.round(min + pct * (max - min));
    const midpoint = (valueMin + valueMax) / 2;
    if (val < midpoint) onChangeMin(Math.min(val, valueMax));
    else onChangeMax(Math.max(val, valueMin));
  };

  return (
    <div className="w-full">
      {/* Track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-2 bg-[#E2E8F0] rounded-full cursor-pointer my-4"
      >
        {/* Filled range */}
        <div
          className="absolute top-0 h-2 rounded-full"
          style={{
            left: `${percent(valueMin)}%`,
            width: `${percent(valueMax) - percent(valueMin)}%`,
            background: accentColor === 'green'
              ? 'linear-gradient(90deg, #22C55E, #10B981)'
              : 'linear-gradient(90deg, #2563EB, #4F46E5)',
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={valueMin}
          onChange={(e) => onChangeMin(Math.min(+e.target.value, valueMax - 1))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: valueMin > max - 10 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={valueMax}
          onChange={(e) => onChangeMax(Math.max(+e.target.value, valueMin + 1))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />

        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `${percent(valueMin)}%`, background: accentColor === 'green' ? '#22C55E' : '#2563EB' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `${percent(valueMax)}%`, background: accentColor === 'green' ? '#22C55E' : '#2563EB' }}
        />
      </div>
    </div>
  );
};

/* ─── Custom Sort Dropdown ──────────────────────────────────────── */
const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = SORT_OPTIONS.find((o) => o.value === value);
  const reduced = prefersReduced();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] transition-all active:scale-95"
      >
        {selected?.label || 'Sort'}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute left-0 top-full mt-1.5 w-44 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                  value === opt.value
                    ? 'text-[#2563EB] bg-[#DBEAFE]'
                    : 'text-[#475569] hover:bg-gray-50 hover:text-[#0F172A]'
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main FilterBar ────────────────────────────────────────────── */
const FilterBar = ({ filters, onChange, totalResults, query }) => {
  const [expanded, setExpanded] = useState(false);
  const reduced = prefersReduced();

  const hasActiveFilters =
    filters.publicationTypes.length > 0 ||
    filters.yearFrom !== 2000 ||
    filters.yearTo !== new Date().getFullYear() ||
    filters.citationMin > 0 ||
    filters.citationMax < 5000;

  const toggleType = (type) => {
    const already = filters.publicationTypes.includes(type);
    onChange({
      ...filters,
      publicationTypes: already
        ? filters.publicationTypes.filter((t) => t !== type)
        : [...filters.publicationTypes, type],
    });
  };

  const removeType = (type) => toggleType(type);
  const removeYear = () => onChange({ ...filters, yearFrom: 2000, yearTo: new Date().getFullYear() });
  const removeCitation = () => onChange({ ...filters, citationMin: 0, citationMax: 5000 });

  const clearAll = () =>
    onChange({
      ...filters,
      publicationTypes: [],
      yearFrom: 2000,
      yearTo: new Date().getFullYear(),
      citationMin: 0,
      citationMax: 5000,
    });

  return (
    <div className="bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter bar row */}
        <div className="flex items-center gap-3 py-3 overflow-x-auto no-scrollbar">
          {/* Toggle expand button */}
          <button
            onClick={() => setExpanded((e) => !e)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition-all active:scale-95 flex-shrink-0 ${
              hasActiveFilters || expanded
                ? 'border-[#2563EB] text-[#2563EB] bg-[#DBEAFE]'
                : 'border-[#E2E8F0] text-[#475569] bg-white hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-5 h-5 rounded-full text-white text-[10px] font-black flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
                {filters.publicationTypes.length +
                  (filters.yearFrom !== 2000 || filters.yearTo !== new Date().getFullYear() ? 1 : 0) +
                  (filters.citationMin > 0 || filters.citationMax < 5000 ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-[#E2E8F0] flex-shrink-0" />

          {/* Type quick-select chips */}
          {PUBLICATION_TYPES.map((pt) => {
            const active = filters.publicationTypes.includes(pt.value);
            return (
              <motion.button
                key={pt.value}
                onClick={() => toggleType(pt.value)}
                animate={active ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
                style={active ? { background: 'linear-gradient(135deg, #2563EB, #4F46E5)' } : {}}
              >
                {pt.label}
              </motion.button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-[#E2E8F0] flex-shrink-0" />

          {/* Sort dropdown */}
          <div className="flex-shrink-0">
            <SortDropdown value={filters.sort} onChange={(v) => onChange({ ...filters, sort: v })} />
          </div>

          {/* Results count */}
          {query && totalResults !== undefined && (
            <span className="ml-auto flex-shrink-0 text-xs font-semibold text-[#475569] whitespace-nowrap">
              <span className="text-[#0F172A] font-black">{totalResults.toLocaleString()}</span> results
            </span>
          )}
        </div>

        {/* Expandable panel */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduced ? { duration: 0.1 } : { type: 'spring', stiffness: 280, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="py-5 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#E2E8F0]">
                {/* Publication Year */}
                <div>
                  <p className="text-xs font-black text-[#475569] uppercase tracking-widest mb-3">Publication Year</p>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min={2000}
                      max={filters.yearTo}
                      value={filters.yearFrom}
                      onChange={(e) => onChange({ ...filters, yearFrom: +e.target.value })}
                      className="w-24 px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#0F172A] text-center focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <span className="text-[#475569] text-sm font-bold">–</span>
                    <input
                      type="number"
                      min={filters.yearFrom}
                      max={new Date().getFullYear()}
                      value={filters.yearTo}
                      onChange={(e) => onChange({ ...filters, yearTo: +e.target.value })}
                      className="w-24 px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#0F172A] text-center focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <RangeSlider
                    min={2000}
                    max={new Date().getFullYear()}
                    valueMin={filters.yearFrom}
                    valueMax={filters.yearTo}
                    onChangeMin={(v) => onChange({ ...filters, yearFrom: v })}
                    onChangeMax={(v) => onChange({ ...filters, yearTo: v })}
                  />
                </div>

                {/* Citation Count */}
                <div>
                  <p className="text-xs font-black text-[#475569] uppercase tracking-widest mb-3">Citation Count</p>
                  {/* Preset chips */}
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {CITATION_PRESETS.map((p) => {
                      const active = filters.citationMin === p.min && filters.citationMax === p.max;
                      return (
                        <button
                          key={p.label}
                          onClick={() => onChange({ ...filters, citationMin: p.min, citationMax: p.max })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                            active
                              ? 'bg-[#22C55E] text-white border-[#22C55E]'
                              : 'bg-white border-[#E2E8F0] text-[#475569] hover:border-[#22C55E] hover:text-[#22C55E]'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#0F172A]">{filters.citationMin.toLocaleString()}</span>
                    <div className="flex-1" />
                    <span className="text-xs font-bold text-[#0F172A]">{filters.citationMax >= 5000 ? '5,000+' : filters.citationMax.toLocaleString()}</span>
                  </div>
                  <RangeSlider
                    min={0}
                    max={5000}
                    valueMin={filters.citationMin}
                    valueMax={filters.citationMax}
                    onChangeMin={(v) => onChange({ ...filters, citationMin: v })}
                    onChangeMax={(v) => onChange({ ...filters, citationMax: v })}
                    accentColor="green"
                  />
                </div>

                {/* Publication Type (multi-select in panel) */}
                <div>
                  <p className="text-xs font-black text-[#475569] uppercase tracking-widest mb-3">Publication Type</p>
                  <div className="flex flex-wrap gap-2">
                    {PUBLICATION_TYPES.map((pt) => {
                      const active = filters.publicationTypes.includes(pt.value);
                      return (
                        <motion.button
                          key={pt.value}
                          onClick={() => toggleType(pt.value)}
                          animate={active ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            active
                              ? 'text-white shadow-sm'
                              : 'bg-white border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]'
                          }`}
                          style={active ? { background: 'linear-gradient(135deg, #2563EB, #4F46E5)' } : {}}
                        >
                          {pt.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter chips row */}
        {hasActiveFilters && (
          <div className="pb-3">
            <ActiveFilterChips
              filters={filters}
              onRemoveType={removeType}
              onRemoveYear={removeYear}
              onRemoveCitation={removeCitation}
              onClearAll={clearAll}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
