import React, { useState } from 'react';
import {
  Infinity as InfinityIcon, FileText, User, BookOpen, Shield, Database,
  Search, Check, XCircle
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all',      label: 'All Results',   icon: InfinityIcon, badge: '2.4M', badgeBg: '#DBEAFE', badgeText: '#2563EB' },
  { id: 'papers',   label: 'Papers',        icon: FileText,     badge: '1.8M', badgeBg: '#DCFCE7', badgeText: '#22C55E' },
  { id: 'authors',  label: 'Authors',       icon: User,         badge: '50k',  badgeBg: '#EDE9FE', badgeText: '#4F46E5' },
  { id: 'journals', label: 'Journals',      icon: BookOpen,     badge: '12k',  badgeBg: '#FEF3C7', badgeText: '#F59E0B' },
  { id: 'patents',  label: 'Patents',       icon: Shield,       badge: '180k', badgeBg: '#FEE2E2', badgeText: '#EF4444' },
  { id: 'datasets', label: 'Datasets',      icon: Database,     badge: '42k',  badgeBg: '#DBEAFE', badgeText: '#2563EB' },
];

const FIELDS = [
  { label: 'Computer Science', count: '842k' },
  { label: 'Biology',          count: '621k' },
  { label: 'Physics',          count: '534k' },
  { label: 'Chemistry',        count: '412k' },
  { label: 'Medicine',         count: '891k' },
  { label: 'Mathematics',      count: '298k' },
  { label: 'Climate Science',  count: '156k' },
  { label: 'Engineering',      count: '445k' },
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'cited',     label: 'Most Cited' },
  { id: 'newest',    label: 'Newest' },
  { id: 'popular',   label: 'Most Read' },
];

const FilterPanel = ({ activeCategory, onCategoryChange, activeSort, onSortChange, selectedFields, onFieldsChange, yearFrom, yearTo, onYearChange, onReset }) => {
  const [fieldSearch, setFieldSearch] = useState('');

  const filteredFields = FIELDS.filter((f) =>
    f.label.toLowerCase().includes(fieldSearch.toLowerCase())
  );

  const toggleField = (field) => {
    if (selectedFields.includes(field)) {
      onFieldsChange(selectedFields.filter((f) => f !== field));
    } else {
      onFieldsChange([...selectedFields, field]);
    }
  };

  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sticky top-24 opacity-0 animate-fade-up"
      style={{ animationFillMode: 'forwards', animationDuration: '0.4s' }}
    >
      {/* Categories */}
      <p className="uppercase text-xs tracking-widest text-[#94A3B8] font-semibold mb-3">Filter By</p>
      <div className="space-y-1 mb-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-bold border-l-[3px] border-[#2563EB]'
                  : 'text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 flex-shrink-0 transition-transform duration-150 ${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'} ${!isActive ? 'group-hover:translate-x-0.5' : ''}`}
                style={{ width: 18, height: 18 }}
              />
              <span className="flex-1 text-left">{cat.label}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: isActive ? cat.badgeBg : '#F1F5F9', color: isActive ? cat.badgeText : '#94A3B8' }}
              >
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-[#E2E8F0] my-4" />

      {/* Research Field */}
      <p className="uppercase text-xs tracking-widest text-[#94A3B8] font-semibold mb-3">Research Field</p>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Filter fields..."
          value={fieldSearch}
          onChange={(e) => setFieldSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
        {filteredFields.map((field) => {
          const checked = selectedFields.includes(field.label);
          return (
            <label
              key={field.label}
              className="flex items-center gap-2.5 py-1.5 cursor-pointer group"
            >
              <div
                onClick={() => toggleField(field.label)}
                className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all duration-150 cursor-pointer ${
                  checked ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#E2E8F0] hover:border-[#2563EB]'
                }`}
              >
                {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </div>
              <span className="flex-1 text-sm text-[#475569] group-hover:text-[#0F172A] transition-colors">{field.label}</span>
              <span className="text-xs text-[#94A3B8]">{field.count}</span>
            </label>
          );
        })}
      </div>

      <div className="border-t border-[#E2E8F0] my-4" />

      {/* Year Range */}
      <p className="uppercase text-xs tracking-widest text-[#94A3B8] font-semibold mb-3">Year Range</p>
      <div className="flex items-center gap-2 mb-5">
        <input
          type="number"
          value={yearFrom}
          onChange={(e) => onYearChange(+e.target.value, yearTo)}
          className="w-full py-2 text-sm text-center border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
        />
        <span className="text-[#94A3B8] font-bold">—</span>
        <input
          type="number"
          value={yearTo}
          onChange={(e) => onYearChange(yearFrom, +e.target.value)}
          className="w-full py-2 text-sm text-center border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
        />
      </div>

      <div className="border-t border-[#E2E8F0] my-4" />

      {/* Sort By */}
      <p className="uppercase text-xs tracking-widest text-[#94A3B8] font-semibold mb-3">Sort By</p>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSortChange(opt.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              activeSort === opt.id
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#EF4444] transition-colors mx-auto"
      >
        <XCircle className="w-4 h-4" />
        Reset Filters
      </button>
    </div>
  );
};

export default FilterPanel;
