import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, BookOpen, BookMarked, GraduationCap, Microscope,
  Lightbulb, TrendingUp, Award, ExternalLink, Quote
} from 'lucide-react';

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Type config ─────────────────────────────────────────── */
const TYPE_CONFIG = {
  journal_article: {
    label: 'Journal Article',
    icon: BookOpen,
    iconBg: 'bg-[#DBEAFE]',
    iconColor: 'text-[#2563EB]',
    badgeBg: 'bg-[#DBEAFE]',
    badgeText: 'text-[#2563EB]',
  },
  conference_paper: {
    label: 'Conference Paper',
    icon: Microscope,
    iconBg: 'bg-[#EDE9FE]',
    iconColor: 'text-[#4F46E5]',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#4F46E5]',
  },
  preprint: {
    label: 'Preprint',
    icon: FileText,
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-amber-600',
  },
  book_chapter: {
    label: 'Book Chapter',
    icon: BookMarked,
    iconBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#22C55E]',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#22C55E]',
  },
  thesis: {
    label: 'Thesis',
    icon: GraduationCap,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-600',
  },
  patent: {
    label: 'Patent',
    icon: Lightbulb,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-600',
  },
};

/* ─── Mini Sparkline ────────────────────────────────────────── */
const Sparkline = ({ data = [], color = '#22C55E' }) => {
  if (!data || data.length < 2) return null;
  const w = 60, h = 24;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gradient area fill */}
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts.join(' ')} ${w},${h}`}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
    </svg>
  );
};

/* ─── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target, delay = 0) {
  const [val, setVal] = useState(0);
  const reduced = prefersReduced();

  useEffect(() => {
    if (reduced) { setVal(target); return; }
    let startTime = null;
    const duration = 800;
    const start = () => {
      requestAnimationFrame(function tick(time) {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setVal(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      });
    };
    const timer = setTimeout(start, delay);
    return () => clearTimeout(timer);
  }, [target, delay, reduced]);

  return val;
}

/* ─── ResultCard ────────────────────────────────────────────── */
const ResultCard = ({ result, index = 0 }) => {
  const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.journal_article;
  const Icon = config.icon;
  const reduced = prefersReduced();

  const citCount = useCountUp(result.citationCount, index * 30);

  const isTrending =
    result.citationTrend &&
    result.citationTrend.length >= 2 &&
    result.citationTrend[result.citationTrend.length - 1] >
      result.citationTrend[result.citationTrend.length - 2];

  const authorsStr =
    result.authors.length > 3
      ? `${result.authors.slice(0, 3).join(', ')} +${result.authors.length - 3} more`
      : result.authors.join(', ');

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? {}
          : { type: 'spring', stiffness: 280, damping: 26, delay: index * 0.055 }
      }
      whileHover={reduced ? {} : { y: -4, scale: 1.005 }}
      className="bg-white rounded-[24px] border border-[#E2E8F0] p-6 transition-all duration-300 group cursor-default relative overflow-hidden"
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={(e) => {
        if (!reduced) {
          e.currentTarget.style.borderColor = '#BFDBFE';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(37,99,235,0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
      }}
    >
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex gap-5 relative z-10">
        {/* Type icon */}
        <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center flex-shrink-0 mt-1 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row — badges + year */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${config.badgeBg} ${config.badgeText}`}>
                {config.label}
              </span>
              {result.year && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-[#475569] shadow-sm border border-slate-200">
                  {result.year}
                </span>
              )}
            </div>

            {/* Citation cluster */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isTrending && (
                <div className="flex items-center gap-1 text-[#22C55E]">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-wide hidden sm:inline">Trending</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Sparkline data={result.citationTrend} color="#22C55E" />
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Quote className="w-3 h-3 text-[#22C55E] rotate-180" />
                    <span className="text-sm font-black text-[#0F172A]">{citCount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-[#475569] font-medium leading-none">citations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg font-black text-[#0F172A] leading-snug mb-2 line-clamp-2 group-hover:text-[#2563EB] transition-colors duration-200">
            {result.title}
          </h2>

          {/* Authors */}
          <p className="text-[13px] text-[#64748B] font-semibold mb-1.5 truncate">
            {authorsStr}
          </p>

          {/* Venue */}
          <p className="text-xs text-[#2563EB] font-semibold flex items-center gap-1 mb-3 truncate">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            {result.venue}
          </p>

          {/* Abstract */}
          <p className="text-sm text-[#475569] leading-relaxed mb-4 line-clamp-2">
            {result.abstract}
          </p>

          {/* Tags */}
          {result.tags && result.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {result.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
              {result.tags.length > 5 && (
                <span className="px-2 py-1 text-xs font-semibold text-[#64748B]">+{result.tags.length - 5}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F1F5F9] mt-2">
            <div className="flex items-center gap-4 text-[#64748B]">
              <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                <Award className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-amber-700">{result.citationCount.toLocaleString()} cited</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-xl hover:bg-gray-100 text-[#64748B] hover:text-[#2563EB] transition-colors"
                title="External link"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                className="px-5 py-2 text-xs font-black text-white rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
                onMouseEnter={(e) => {
                  if (!reduced) e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.4)';
                }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'; }}
              >
                View Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ResultCard;
