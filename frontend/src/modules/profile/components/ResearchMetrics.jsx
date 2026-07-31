import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  Award,
  BarChart2,
  Calendar,
  Briefcase,
  ShieldCheck,
  BookOpen,
  Database,
  Download,
  Eye,
  Activity
} from 'lucide-react';

/**
 * ResearchMetrics — Reusable Academic Performance Indicators component.
 *
 * Features:
 *  - Individual cards styled with soft pastel tinted background colors.
 *  - Hides ANY metric card whose value is <= 0, null, undefined, or non-numeric.
 *  - Shared component used across both Home Feed & Profile Page.
 */
const ResearchMetrics = ({
  metrics = {},
  title = 'Research Analytics & Metrics',
  subhead = 'Academic Performance Indicators',
  compact = false
}) => {
  const safeMetrics = metrics || {};

  const getVal = (primaryKey, secondaryKey) => {
    if (typeof safeMetrics[primaryKey] === 'number') return safeMetrics[primaryKey];
    if (typeof safeMetrics[secondaryKey] === 'number') return safeMetrics[secondaryKey];
    if (Array.isArray(safeMetrics[primaryKey])) return safeMetrics[primaryKey].length;
    if (Array.isArray(safeMetrics[secondaryKey])) return safeMetrics[secondaryKey].length;
    return 0;
  };

  const candidateMetrics = [
    { id: 'publications', label: 'Publications', value: getVal('publicationsCount', 'publications'), icon: FileText, color: 'text-blue-600 bg-blue-100/70 border-blue-200/60', cardBg: 'bg-blue-50/60 border-blue-100 hover:border-blue-300/60' },
    { id: 'citations', label: 'Citations', value: getVal('citationsCount', 'totalCitations'), icon: TrendingUp, color: 'text-indigo-600 bg-indigo-100/70 border-indigo-200/60', cardBg: 'bg-indigo-50/60 border-indigo-100 hover:border-indigo-300/60' },
    { id: 'hIndex', label: 'h-index', value: getVal('hIndex', 'h_index'), icon: Award, color: 'text-orange-600 bg-orange-100/70 border-orange-200/60', cardBg: 'bg-orange-50/60 border-orange-100 hover:border-orange-300/60' },
    { id: 'i10Index', label: 'i10-index', value: getVal('i10Index', 'i10_index'), icon: BarChart2, color: 'text-emerald-600 bg-emerald-100/70 border-emerald-200/60', cardBg: 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-300/60' },
    { id: 'experience', label: 'Experience (Years)', value: getVal('experienceYears', 'researchExperience'), icon: Calendar, color: 'text-purple-600 bg-purple-100/70 border-purple-200/60', cardBg: 'bg-purple-50/60 border-purple-100 hover:border-purple-300/60' },
    { id: 'projects', label: 'Projects', value: getVal('projectsCount', 'projects'), icon: Briefcase, color: 'text-pink-600 bg-pink-100/70 border-pink-200/60', cardBg: 'bg-pink-50/60 border-pink-100 hover:border-pink-300/60' },
    { id: 'patents', label: 'Patents', value: getVal('patentsCount', 'patents'), icon: ShieldCheck, color: 'text-teal-600 bg-teal-100/70 border-teal-200/60', cardBg: 'bg-teal-50/60 border-teal-100 hover:border-teal-300/60' },
    { id: 'books', label: 'Books', value: getVal('booksCount', 'books'), icon: BookOpen, color: 'text-red-600 bg-red-100/70 border-red-200/60', cardBg: 'bg-red-50/60 border-red-100 hover:border-red-300/60' },
    { id: 'datasets', label: 'Datasets', value: getVal('datasetsCount', 'datasets'), icon: Database, color: 'text-yellow-600 bg-yellow-100/70 border-yellow-200/60', cardBg: 'bg-yellow-50/60 border-yellow-100 hover:border-yellow-300/60' },
    { id: 'downloads', label: 'Downloads', value: getVal('downloadsCount', 'downloads'), icon: Download, color: 'text-cyan-600 bg-cyan-100/70 border-cyan-200/60', cardBg: 'bg-cyan-50/60 border-cyan-100 hover:border-cyan-300/60' },
    { id: 'views', label: 'Reads / Views', value: getVal('viewsCount', 'views'), icon: Eye, color: 'text-rose-600 bg-rose-100/70 border-rose-200/60', cardBg: 'bg-rose-50/60 border-rose-100 hover:border-rose-300/60' },
    { id: 'researchScore', label: 'Research Score', value: getVal('researchScore', 'score'), icon: Activity, color: 'text-violet-600 bg-violet-100/70 border-violet-200/60', cardBg: 'bg-violet-50/60 border-violet-100 hover:border-violet-300/60' },
  ];

  // STRICT ZERO-CARD FILTERING: Only include cards with numeric value > 0
  const activeMetrics = candidateMetrics.filter(
    m => typeof m.value === 'number' && !isNaN(m.value) && m.value > 0
  );

  if (activeMetrics.length === 0) {
    return null; // Hide block completely if no metrics have a value > 0
  }

  const gridColsClass = compact
    ? activeMetrics.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
    : activeMetrics.length === 1
      ? 'grid-cols-1'
      : activeMetrics.length === 2
        ? 'grid-cols-2'
        : activeMetrics.length === 3
          ? 'grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4';

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-xs font-bold text-text-primary tracking-tight uppercase">
          {title}
        </h3>
        {subhead && (
          <p className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider">
            {subhead}
          </p>
        )}
      </div>

      {/* Dynamic Metric Grid */}
      <div className={`grid ${gridColsClass} gap-3`}>
        {activeMetrics.map((item, idx) => {
          const Icon = item.icon;
          const formattedVal = Number(item.value) >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all ${item.cardBg}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted truncate">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 border ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-lg sm:text-xl font-black text-text-primary tracking-tight block">
                  {formattedVal}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ResearchMetrics;
