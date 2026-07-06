import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPE_OPTIONS = ['All', 'Papers', 'Authors', 'Journals', 'Patents', 'Datasets'];

const TRENDING_TAGS = [
  'Large Language Models', 'CRISPR', 'Quantum Computing', 'Diffusion Models',
  'Climate AI', 'Protein Folding', 'Federated Learning', 'Dark Matter',
  'mRNA Vaccines', 'Neuroplasticity', 'Graphene', 'Exoplanets',
  'Large Language Models', 'CRISPR', 'Quantum Computing', 'Diffusion Models',
  'Climate AI', 'Protein Folding', 'Federated Learning', 'Dark Matter',
  'mRNA Vaccines', 'Neuroplasticity', 'Graphene', 'Exoplanets',
];

const RECENT_SEARCHES = ['CRISPR Gene Editing', 'Quantum Computing', 'Neural Networks'];

const HeroSearchHeader = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState('All');
  const [typeOpen, setTypeOpen] = useState(false);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (s) => {
    setQuery(s);
    onSearch?.(s);
    navigate(`/search?q=${encodeURIComponent(s)}`);
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)', paddingTop: '48px', paddingBottom: '40px' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/5 rounded-full animate-float pointer-events-none" />
      <div className="absolute -bottom-24 -right-16 w-96 h-96 bg-white/5 rounded-full animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/3 rounded-full animate-float pointer-events-none" style={{ animationDelay: '0.8s' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <p className="text-white/60 uppercase tracking-widest text-xs font-semibold mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          Discover Research
        </p>

        {/* Heading */}
        <h1
          className="text-white font-bold text-center text-[32px] md:text-[42px] leading-tight mb-8 opacity-0 animate-fade-up"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.1)', animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          Search the world's scientific knowledge
        </h1>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[680px] opacity-0 animate-fade-up"
          style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
        >
          <div
            className="flex items-center bg-white rounded-2xl p-2 transition-all duration-300"
            style={{
              boxShadow: isFocused
                ? '0 8px 40px rgba(0,0,0,0.2), 0 0 0 8px rgba(37,99,235,0.12)'
                : '0 8px 40px rgba(0,0,0,0.2)',
            }}
          >
            <Search className="w-5 h-5 text-[#2563EB] ml-3 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search researchers, papers, patents, keywords..."
              className="flex-1 text-[#0F172A] text-base bg-transparent border-none outline-none ring-0 px-3 py-3 placeholder-[#94A3B8]"
            />

            {/* Type selector */}
            <div ref={typeRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setTypeOpen((o) => !o)}
                className="flex items-center gap-1.5 px-4 py-3 border-l border-[#E2E8F0] text-[#475569] font-medium text-sm hover:text-[#0F172A] transition-colors"
              >
                {type}
                <ChevronDown className={`w-4 h-4 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
              </button>
              {typeOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 overflow-hidden">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => { setType(opt); setTypeOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        type === opt ? 'bg-[#EFF6FF] text-[#2563EB] font-semibold' : 'text-[#475569] hover:bg-gray-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm ml-1 transition-all duration-150 active:scale-95 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.4)'; }}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </form>

        {/* Recent searches */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mt-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
        >
          <span className="text-white/60 text-xs">Recent:</span>
          {RECENT_SEARCHES.map((s, i) => (
            <button
              key={s}
              onClick={() => handleSuggestionClick(s)}
              className="flex items-center gap-1.5 bg-white/15 text-white text-xs px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/25 transition-all duration-200 cursor-pointer opacity-0 animate-fade-in"
              style={{ animationDelay: `${460 + i * 60}ms`, animationFillMode: 'forwards' }}
            >
              <Clock className="w-3 h-3 text-white/40" />
              {s}
            </button>
          ))}
        </div>

        {/* Auto-scrolling trending tags */}
        <div
          className="w-full mt-6 overflow-hidden opacity-0 animate-fade-up"
          style={{ animationDelay: '550ms', animationFillMode: 'forwards' }}
          onMouseEnter={() => setTickerPaused(true)}
          onMouseLeave={() => setTickerPaused(false)}
        >
          <div
            className="flex gap-3 animate-slide-left"
            style={{ animationPlayState: tickerPaused ? 'paused' : 'running', width: 'max-content' }}
          >
            {TRENDING_TAGS.map((tag, i) => (
              <button
                key={`${tag}-${i}`}
                onClick={() => handleSuggestionClick(tag)}
                className="bg-white/10 border border-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-white/25 transition-all duration-200 flex-shrink-0"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchHeader;
