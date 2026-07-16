import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, BookOpen, Award, Eye, Download, ChevronLeft,
  ChevronRight, ChevronDown, Calendar, Sparkles, Building2, Clock,
  ShieldCheck, XCircle, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import searchService from '../../services/search.service';

/* ------------------------------------------------------------------ */
/* Keyframes + small helper styles, injected once so this component   */
/* is drop-in without requiring edits to index.css / tailwind.config. */
/* ------------------------------------------------------------------ */
const GLOBAL_SEARCH_STYLES = `
@keyframes fade-up { from { opacity:0; transform:translateY(24px);} to { opacity:1; transform:translateY(0);} }
@keyframes fade-in { from { opacity:0;} to { opacity:1;} }
@keyframes slide-right { from { opacity:0; transform:translateX(-24px);} to { opacity:1; transform:translateX(0);} }
@keyframes slide-left { from { opacity:0; transform:translateX(24px);} to { opacity:1; transform:translateX(0);} }
@keyframes card-rise { from { opacity:0; transform:translateY(32px) scale(0.97);} to { opacity:1; transform:translateY(0) scale(1);} }
@keyframes shimmer { from { background-position:-200% 0;} to { background-position:200% 0;} }
@keyframes search-glow { 0%,100% { box-shadow:0 0 0 0 rgba(37,99,235,0);} 50% { box-shadow:0 0 0 8px rgba(37,99,235,0.12);} }
@keyframes blink { 0%,100% { opacity:1;} 50% { opacity:0;} }
@keyframes pulse-ring { 0% { transform:scale(1); opacity:0.7;} 100% { transform:scale(2); opacity:0;} }
@keyframes pulse-ring-green { 0% { transform:scale(1); opacity:0.5;} 100% { transform:scale(2); opacity:0;} }
@keyframes badge-pop { 0% { transform:scale(0) rotate(-8deg);} 70% { transform:scale(1.15) rotate(2deg);} 100% { transform:scale(1) rotate(0deg);} }
@keyframes filter-slide { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }
@keyframes result-in { from { opacity:0; transform:translateX(-16px) scale(0.98);} to { opacity:1; transform:translateX(0) scale(1);} }
@keyframes skeleton-wave { 0% { background-position:-200% 0;} 100% { background-position:200% 0;} }
@keyframes spin-slow { from { transform:rotate(0deg);} to { transform:rotate(360deg);} }
@keyframes float { 0%,100% { transform:translateY(0px);} 50% { transform:translateY(-6px);} }
@keyframes underline-grow { from { width:0%; } to { width:100%; } }

.gs-animate-blink { animation: blink 1s step-start infinite; }
.gs-shimmer {
  background: linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%);
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s linear infinite;
}
.gs-float { animation: float 6s ease-in-out infinite; }
.gs-float-slow { animation: float 4s ease-in-out infinite; }
.gs-badge-pop { animation: badge-pop 0.3s ease forwards; }
.gs-fade-up { animation: fade-up 0.5s ease forwards; opacity:0; }
.gs-fade-in { animation: fade-in 0.4s ease forwards; opacity:0; }
.gs-slide-right { animation: slide-right 0.4s ease forwards; opacity:0; }
.gs-filter-slide { animation: filter-slide 0.3s ease forwards; opacity:0; }
.gs-result-in { animation: result-in 0.4s ease forwards; opacity:0; }

.gs-abstract {
  max-height: 3rem;
  overflow: hidden;
  transition: max-height 300ms ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.gs-card:hover .gs-abstract {
  max-height: 10rem;
  -webkit-line-clamp: unset;
}
.gs-title-underline {
  position: relative;
  display: inline;
}
.gs-title-underline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0%;
  height: 1.5px;
  background: #2563EB;
  transition: width 200ms ease;
}
.gs-card:hover .gs-title-underline::after { width: 100%; }
.gs-view-btn svg { transition: transform 200ms ease; }
.gs-view-btn:hover svg { transform: translateX(4px); }
.gs-prev-btn:hover svg { transform: translateX(-3px); }
.gs-next-btn:hover svg { transform: translateX(3px); }
.gs-icon-btn svg { transition: transform 200ms ease; }

.gs-toggle-track {
  width: 44px; height: 24px; border-radius: 9999px;
  position: relative; transition: background-color 200ms ease;
  cursor: pointer; flex-shrink: 0;
}
.gs-toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 9999px;
  background: white; transition: transform 200ms ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.15);
}
.gs-ripple {
  position: absolute; inset: 0; border-radius: 9999px;
  background: rgba(34,197,94,0.25);
  animation: pulse-ring-green 400ms ease-out forwards;
  pointer-events: none;
}
`;

/* Simple count-up hook using requestAnimationFrame + easeOutQuad */
const useCountUp = (target, duration = 600) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;

    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

const TYPING_TEXT = "Search millions of publications, authors, journals, and patents...";
const POPULAR_TOPICS = ["Large Language Models", "CRISPR", "Quantum Computing", "Climate AI", "Protein Folding"];
const DOCUMENT_TYPES = ["All", "Journal Article", "Conference Paper", "Book Chapter", "Book", "Technical Report", "Thesis"];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest Works', icon: Clock },
  { value: 'mostCited', label: 'Most Cited', icon: Award },
  { value: 'trending', label: 'Trending (Views)', icon: Eye },
];

const GlobalSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'latest';
  const type = searchParams.get('type') || 'All';
  const filter = searchParams.get('filter') || '';
  const year = searchParams.get('year') || '';

  const [searchVal, setSearchVal] = useState(query);

  // Sync local input if URL query changes (back/forward navigation)
  useEffect(() => {
    setSearchVal(query);
  }, [query]);

  // Debounced live search — fires 400ms after user stops typing
  useEffect(() => {
    if (!searchVal.trim()) return;
    const timer = setTimeout(() => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('q', searchVal.trim());
        next.set('page', '1');
        return next;
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const queryParams = {
    q: query,
    page,
    sort,
    limit: 10,
  };
  if (type !== 'All') queryParams.publicationType = type;
  if (filter) queryParams.filter = filter;
  if (year) queryParams.year = year;

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['global-search', queryParams],
    queryFn: () => searchService.searchPublications(queryParams),
    enabled: !!query,
  });

  const data = rawData?.data || rawData || {};

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchVal, page: '1', sort, type, filter, year });
  };

  const handleFilterChange = (key, value) => {
    const newParams = {
      q: query,
      page: '1',
      sort,
      type,
      filter,
      year,
    };
    newParams[key] = value;

    // Clean up empty params
    Object.keys(newParams).forEach(k => {
      if (!newParams[k]) delete newParams[k];
    });

    setSearchParams(newParams);
  };

  const results = data?.results || [];
  const totalPages = data?.totalPages || 1;
  const totalResults = data?.total ?? results.length;

  /* ---------------- Typewriter effect (hero subtitle) ---------------- */
  const [displayed, setDisplayed] = useState("");
  const [typingDone, setTypingDone] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(TYPING_TEXT.substring(0, i + 1));
        i++;
        if (i === TYPING_TEXT.length) {
          clearInterval(interval);
          setTypingDone(true);
          setTimeout(() => setCursorVisible(false), 1000);
        }
      }, 35);
      return () => clearInterval(interval);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- Filter transition (fade out / fade in) ---------------- */
  const [isFiltering, setIsFiltering] = useState(false);
  const filterSignature = `${type}|${year}|${sort}|${filter}`;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsFiltering(true);
    const t = setTimeout(() => setIsFiltering(false), 150);
    return () => clearTimeout(t);
  }, [filterSignature]);

  /* ---------------- Browser tab title ---------------- */
  useEffect(() => {
    document.title = query ? `Search: ${query} — ResearchConnect` : 'Search — ResearchConnect';
  }, [query]);

  /* ---------------- Open access toggle ripple ---------------- */
  const [showRipple, setShowRipple] = useState(false);
  const isOpenAccess = filter === 'openAccess';

  const handleOpenAccessToggle = (checked) => {
    handleFilterChange('filter', checked ? 'openAccess' : '');
    if (checked) {
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 400);
    }
  };

  /* ---------------- Quick stats (derived, additive only) ---------------- */
  const currentYear = new Date().getFullYear();
  const openAccessCount = results.filter(r => r.isOpenAccess).length;
  const openAccessPct = results.length ? Math.round((openAccessCount / results.length) * 100) : 0;
  const thisYearCount = results.filter(r => Number(r.publicationYear) === currentYear).length;
  const animatedTotal = useCountUp(totalResults);

  /* ---------------- Search bar focus glow ---------------- */
  const [searchFocused, setSearchFocused] = useState(false);

  /* ---------------- Search button press ---------------- */
  const [btnPressed, setBtnPressed] = useState(false);
  const onSearchButtonClick = () => {
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 150);
  };

  const applyTopicChip = (topic) => {
    setSearchVal(topic);
    setSearchParams({ q: topic, page: '1', sort, type, filter, year });
  };

  const startIdx = results.length ? (page - 1) * 10 + 1 : 0;
  const endIdx = results.length ? startIdx + results.length - 1 : 0;

  const pageNumbers = () => {
    const nums = [];
    const span = 5;
    let start = Math.max(1, page - Math.floor(span / 2));
    let end = Math.min(totalPages, start + span - 1);
    start = Math.max(1, end - span + 1);
    for (let p = start; p <= end; p++) nums.push(p);
    return nums;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <style>{GLOBAL_SEARCH_STYLES}</style>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ============================= SECTION 1 — HERO SEARCH HEADER ============================= */}
        <div
          className="relative overflow-hidden rounded-3xl pt-10 pb-8 px-8"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)' }}
        >
          {/* decorative blobs */}
          <div className="gs-float absolute -top-0 -left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="gs-float absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" style={{ animationDelay: '1.5s' }} />

          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div
                  className="gs-fade-in inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{ animationDelay: '200ms' }}
                >
                  <Sparkles className="w-3 h-3" />
                  GLOBAL RESEARCH SEARCH
                </div>
                <h1
                  className="gs-fade-up text-white text-[28px] font-black"
                  style={{ animationDelay: '100ms' }}
                >
                  Discover the world's research
                </h1>
                <p className="text-white/65 text-[14px] mt-1 min-h-[20px]">
                  {displayed}
                  {cursorVisible && (
                    <span className="gs-animate-blink inline-block w-[2px] h-[14px] bg-white/80 ml-0.5 align-middle" />
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                {[
                  { n: '2.4M+', l: 'Papers' },
                  { n: '50k+', l: 'Authors' },
                  { n: '180+', l: 'Countries' },
                ].map((stat, i) => (
                  <div
                    key={stat.l}
                    className="gs-badge-pop bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center"
                    style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                  >
                    <div className="text-white font-black text-[18px]">{stat.n}</div>
                    <div className="text-white/50 text-xs">{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6">
              <div
                className="bg-white rounded-2xl p-1.5 flex items-center"
                style={{
                  boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                  animation: searchFocused ? 'search-glow 1.5s ease-in-out infinite' : 'none',
                }}
              >
                <Search className="text-[#94A3B8] w-5 h-5 ml-3.5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search by title, keywords, DOI, or abstract..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[#0F172A] text-[15px] px-3 py-3.5 outline-none min-w-0"
                />
                <div className="relative border-l border-[#E2E8F0] flex-shrink-0">
                  <select
                    value={type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="appearance-none bg-transparent outline-none cursor-pointer text-[#475569] text-sm font-medium pl-4 pr-8 py-3.5"
                  >
                    {DOCUMENT_TYPES.map(t => (
                      <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  onClick={onSearchButtonClick}
                  className="text-white font-bold px-7 py-3 rounded-xl mx-0.5 flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                    transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
                    transitionProperty: 'transform, box-shadow',
                  }}
                >
                  Search
                </button>
              </div>

              {/* Popular tag chips */}
              <div className="mt-4 flex items-center flex-wrap gap-2">
                <span className="text-white/40 text-xs mr-1">Try:</span>
                {POPULAR_TOPICS.map((topic, i) => (
                  <button
                    type="button"
                    key={topic}
                    onClick={() => applyTopicChip(topic)}
                    className="gs-fade-in bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/25 transition-all duration-200"
                    style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ============================= SECTION 2 — FILTER SIDEBAR ============================= */}
          <div className="gs-slide-right bg-white border border-[#E2E8F0] rounded-2xl p-5 self-start sticky top-24" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">Filters</h3>
              </div>
              <button
                type="button"
                onClick={() => setSearchParams({ q: query, page: '1', sort: 'latest', type: 'All' })}
                className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-[#EF4444] transition-colors duration-150"
              >
                <XCircle className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
            <div className="border-t border-[#F1F5F9] mt-3 mb-5" />

            {/* Document Type */}
            <div className="gs-filter-slide space-y-2 mb-5" style={{ animationDelay: '100ms' }}>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Document Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="appearance-none w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#475569] font-medium bg-white outline-none cursor-pointer"
                >
                  {DOCUMENT_TYPES.map(t => (
                    <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Publication Year */}
            <div className="gs-filter-slide space-y-2 mb-5" style={{ animationDelay: '200ms' }}>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-3 transition-colors duration-200"
                style={{ color: year ? '#2563EB' : '#94A3B8' }}
              >
                Publication Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                placeholder="e.g. 2024"
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all duration-200"
              />
            </div>

            {/* Sort By — visual radio pills */}
            <div className="space-y-2 mb-5">
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-3">Sort By</label>
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt, i) => {
                  const Icon = opt.icon;
                  const active = sort === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => handleFilterChange('sort', opt.value)}
                      className="gs-filter-slide w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200"
                      style={{
                        animationDelay: `${i * 60}ms`,
                        borderColor: active ? '#2563EB' : '#E2E8F0',
                        backgroundColor: active ? '#EFF6FF' : 'transparent',
                        color: active ? '#2563EB' : '#475569',
                        fontWeight: active ? 600 : 500,
                      }}
                      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = '#BFDBFE'; e.currentTarget.style.backgroundColor = '#F8FAFC'; } }}
                      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[13px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Open Access toggle */}
            <div className="gs-filter-slide space-y-2" style={{ animationDelay: '350ms' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Open Access</span>
                <div
                  className="gs-toggle-track"
                  style={{ backgroundColor: isOpenAccess ? '#22C55E' : '#E2E8F0' }}
                  onClick={() => handleOpenAccessToggle(!isOpenAccess)}
                >
                  {showRipple && <span className="gs-ripple" />}
                  <div
                    className="gs-toggle-thumb"
                    style={{ transform: isOpenAccess ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                  {/* keep original input for a11y / form semantics, visually hidden */}
                  <input
                    type="checkbox"
                    checked={isOpenAccess}
                    onChange={(e) => handleOpenAccessToggle(e.target.checked)}
                    className="sr-only"
                  />
                </div>
              </div>
              {isOpenAccess && (
                <span className="gs-badge-pop inline-block bg-[#DCFCE7] text-[#22C55E] text-xs font-bold px-2.5 py-1 rounded-full" style={{ animationDuration: '250ms' }}>
                  ✓ Open Access
                </span>
              )}
            </div>

            {/* Quick stats */}
            <div className="border-t border-[#F1F5F9] mt-5 pt-4 space-y-2.5">
              <p className="text-xs font-bold text-[#0F172A] uppercase tracking-widest mb-2">Quick Stats</p>
              {[
                { label: 'Total Results', value: animatedTotal, color: '#2563EB' },
                { label: 'Open Access', value: `${openAccessPct}%`, color: '#22C55E' },
                { label: 'This Year', value: thisYearCount, color: '#F59E0B' },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="gs-fade-in flex items-center justify-between text-sm"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="text-[#475569]">{row.label}</span>
                  <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ============================= SECTION 3 — RESULTS AREA ============================= */}
          <div className="lg:col-span-3 space-y-6">

            {isLoading ? (
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="gs-fade-up bg-white border border-[#E2E8F0] rounded-2xl p-6"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex gap-2">
                      <div className="gs-shimmer h-5 w-20 rounded-lg" />
                      <div className="gs-shimmer h-5 w-16 rounded-lg" />
                    </div>
                    <div className="gs-shimmer h-6 w-3/4 rounded-lg mt-3" />
                    <div className="space-y-2 mt-2">
                      <div className="gs-shimmer h-4 w-full rounded-lg" />
                      <div className="gs-shimmer h-4 w-5/6 rounded-lg" />
                      <div className="gs-shimmer h-4 w-4/5 rounded-lg" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <div className="gs-shimmer h-4 w-16 rounded-lg" />
                      <div className="gs-shimmer h-4 w-16 rounded-lg" />
                      <div className="gs-shimmer h-4 w-16 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Results header row */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                  <div className="text-sm">
                    {query ? (
                      <span className="text-[#475569]">
                        Showing results for <span className="text-[#0F172A] font-bold text-[16px]">&ldquo;{query}&rdquo;</span>
                      </span>
                    ) : (
                      <span className="text-[#475569]">Start searching above</span>
                    )}
                  </div>
                  <span
                    key={results.length}
                    className="gs-badge-pop bg-[#DBEAFE] text-[#2563EB] font-bold text-sm px-3 py-1 rounded-full"
                  >
                    {results.length} results
                  </span>
                </div>

                <div
                  className="space-y-4 transition-opacity duration-150"
                  style={{ opacity: isFiltering ? 0 : 1 }}
                >
                  {results.map((pub, index) => (
                    <div
                      key={pub._id}
                      className="gs-card gs-result-in group relative bg-white border border-[#E2E8F0] border-l-[3px] border-l-transparent rounded-2xl p-6 transition-all duration-300 hover:-translate-y-[3px] hover:border-[#BFDBFE] hover:border-l-[#2563EB]"
                      style={{
                        animationDelay: `${index * 80}ms`,
                        boxShadow: undefined,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.10)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {/* Meta row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="gs-badge-pop bg-[#DBEAFE] text-[#2563EB] text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ animationDelay: `${index * 80 + 100}ms` }}
                        >
                          {pub.publicationType}
                        </span>
                        <span className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#94A3B8]" /> {pub.publicationYear}
                        </span>
                        {pub.user?.isVerified && (
                          <span
                            className="gs-badge-pop bg-[#DCFCE7] text-[#22C55E] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{ animationDelay: `${index * 80 + 400}ms` }}
                          >
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {pub.createdAt && (
                          <span className="text-[#94A3B8] text-xs ml-auto">
                            {new Date(pub.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-[17px] font-bold text-[#0F172A] mt-3 leading-snug transition-transform duration-200 group-hover:translate-x-[3px] group-hover:text-[#2563EB]">
                        <a href={`/publications/${pub._id}`} className="gs-title-underline cursor-pointer">
                          {pub.title}
                        </a>
                      </h3>

                      {/* Abstract */}
                      <p className="gs-abstract text-[#475569] text-sm leading-relaxed mt-2">
                        {pub.abstract}
                      </p>

                      {/* Authors */}
                      {pub.authors && pub.authors.length > 0 && (
                        <p className="text-xs text-[#94A3B8] font-medium flex items-center gap-1 flex-wrap mt-2">
                          <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Authors:</span>
                          <span className="text-[#475569] font-semibold text-sm">
                            {pub.authors.slice(0, 3).map(a => (typeof a === 'string' ? a : a?.name || '')).join(', ')}
                          </span>
                          {pub.authors.length > 3 && (
                            <span className="bg-[#EDE9FE] text-[#4F46E5] text-xs font-bold px-2 py-0.5 rounded-full">
                              +{pub.authors.length - 3} more
                            </span>
                          )}
                        </p>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#F8FAFC]">
                        <span className="gs-icon-btn flex items-center gap-1.5 text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors duration-200">
                          <Eye className="w-3.5 h-3.5 text-[#94A3B8]" /> {pub.analytics?.views || 0}
                        </span>
                        <span className="gs-icon-btn flex items-center gap-1.5 text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors duration-200">
                          <Download className="w-3.5 h-3.5 text-[#94A3B8]" /> {pub.analytics?.downloads || 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-bold text-[#2563EB]">
                          <Award className="w-3.5 h-3.5" /> {pub.citationCount || 0}
                        </span>
                        <a
                          href={`/publications/${pub._id}`}
                          className="gs-view-btn ml-auto flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] font-semibold text-sm px-4 py-2 rounded-xl hover:bg-[#2563EB] hover:text-white transition-all duration-200"
                        >
                          View Paper <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}

                  {results.length === 0 && (
                    <div className="text-center py-20 px-8 bg-white rounded-2xl border border-[#E2E8F0]">
                      <BookOpen className="gs-float-slow w-16 h-16 text-[#DBEAFE] mx-auto mb-6" />
                      <h3 className="text-[20px] font-bold text-[#0F172A]">No publications found</h3>
                      <p className="text-sm text-[#475569] mt-2">Try refining your search keywords or adjusting your sidebar filters.</p>
                      <div className="flex flex-col items-center gap-2 mt-6 max-w-xs mx-auto">
                        {['Try broader keywords', 'Remove year filter', 'Search all types'].map((tip, i) => (
                          <button
                            type="button"
                            key={tip}
                            onClick={() => {
                              if (tip === 'Remove year filter') handleFilterChange('year', '');
                              if (tip === 'Search all types') handleFilterChange('type', 'All');
                            }}
                            className="gs-fade-up w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#475569] cursor-pointer hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-200"
                            style={{ animationDelay: `${i * 100}ms` }}
                          >
                            {tip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ============================= SECTION 4 — PAGINATION ============================= */}
                {totalPages > 1 && (
                  <div className="gs-fade-up">
                    <div className="flex justify-between items-center bg-white border border-[#E2E8F0] rounded-2xl p-4">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => handleFilterChange('page', page - 1)}
                        className="gs-prev-btn flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <div className="flex items-center gap-2">
                        {pageNumbers()[0] > 1 && <span className="text-[#94A3B8] px-1">...</span>}
                        {pageNumbers().map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => handleFilterChange('page', p)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-150 ${p === page
                                ? 'gs-badge-pop text-white font-bold'
                                : 'border border-[#E2E8F0] text-[#475569] font-semibold hover:border-[#2563EB] hover:text-[#2563EB]'
                              }`}
                            style={p === page ? { background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)' } : undefined}
                          >
                            {p}
                          </button>
                        ))}
                        {pageNumbers()[pageNumbers().length - 1] < totalPages && <span className="text-[#94A3B8] px-1">...</span>}
                      </div>

                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => handleFilterChange('page', page + 1)}
                        className="gs-next-btn flex items-center gap-2 px-5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[#94A3B8] text-xs text-center mt-2">
                      Page {page} of {totalPages} · Showing {startIdx}-{endIdx} of {totalResults} results
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;