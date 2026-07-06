import React, { useState } from 'react';
import { BookOpen, Eye, Quote, Download, ArrowRight } from 'lucide-react';

const PAPERS = [
  {
    id: 1,
    title: 'Quantum Entanglement in Neural Networks: A Novel Approach to Parallel Computing',
    authors: [
      { name: 'Dr. Sarah Chen', initials: 'SC', color: '#2563EB' },
      { name: 'Dr. Raj Patel',  initials: 'RP', color: '#4F46E5' },
    ],
    authorStr: 'Dr. Sarah Chen, Dr. Raj Patel',
    journal: 'Nature Physics',
    year: 2024,
    field: 'Computer Science',
    fieldBg: '#DBEAFE', fieldText: '#2563EB',
    openAccess: true,
    reads: '1.2k', citations: 48, downloads: 234,
    timestamp: '2 days ago',
  },
  {
    id: 2,
    title: 'CRISPR-Cas9 Therapeutic Applications in Rare Genetic Disorders: A Systematic Review',
    authors: [
      { name: 'Prof. Elena Rossetti', initials: 'ER', color: '#22C55E' },
      { name: 'Dr. James Park',       initials: 'JP', color: '#F59E0B' },
    ],
    authorStr: 'Prof. Elena Rossetti, Dr. James Park',
    journal: 'Cell',
    year: 2024,
    field: 'Biology',
    fieldBg: '#DCFCE7', fieldText: '#22C55E',
    openAccess: true,
    reads: '892', citations: 34, downloads: 189,
    timestamp: '4 days ago',
  },
  {
    id: 3,
    title: 'Large-Scale Climate Modeling Using Federated Machine Learning',
    authors: [
      { name: 'Dr. Aisha Diallo', initials: 'AD', color: '#EF4444' },
      { name: 'Dr. Marcus Webb',  initials: 'MW', color: '#4F46E5' },
    ],
    authorStr: 'Dr. Aisha Diallo, Dr. Marcus Webb',
    journal: 'Nature Climate',
    year: 2024,
    field: 'Climate Science',
    fieldBg: '#FEF3C7', fieldText: '#F59E0B',
    openAccess: false,
    reads: '634', citations: 21, downloads: 98,
    timestamp: '1 week ago',
  },
  {
    id: 4,
    title: 'Protein Structure Prediction Beyond AlphaFold: Incorporating Dynamic Conformations',
    authors: [
      { name: 'Prof. Liu Wei',   initials: 'LW', color: '#22C55E' },
      { name: 'Dr. Priya Sharma', initials: 'PS', color: '#EF4444' },
    ],
    authorStr: 'Prof. Liu Wei, Dr. Priya Sharma',
    journal: 'Science',
    year: 2023,
    field: 'Biology',
    fieldBg: '#DCFCE7', fieldText: '#22C55E',
    openAccess: true,
    reads: '2.1k', citations: 87, downloads: 412,
    timestamp: '2 weeks ago',
  },
  {
    id: 5,
    title: 'Diffusion Models for Scientific Discovery: Applications in Drug Design',
    authors: [
      { name: 'Dr. Alex Kumar',    initials: 'AK', color: '#2563EB' },
      { name: 'Dr. Sofia Martinez', initials: 'SM', color: '#4F46E5' },
    ],
    authorStr: 'Dr. Alex Kumar, Dr. Sofia Martinez',
    journal: 'NeurIPS',
    year: 2024,
    field: 'Computer Science',
    fieldBg: '#DBEAFE', fieldText: '#2563EB',
    openAccess: false,
    reads: '445', citations: 16, downloads: 67,
    timestamp: '3 weeks ago',
  },
];

const FILTER_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'openaccess', label: 'Open Access' },
  { id: 'preprints', label: 'Preprints' },
];

const AuthorAvatars = ({ authors }) => (
  <div className="flex items-center">
    {authors.slice(0, 3).map((a, i) => (
      <div
        key={a.name}
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white flex-shrink-0"
        style={{ background: a.color, marginLeft: i > 0 ? '-6px' : 0, zIndex: 3 - i }}
      >
        {a.initials}
      </div>
    ))}
  </div>
);

const RecentPapersFeed = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  const filtered = PAPERS.filter((p) => {
    if (activeFilter === 'openaccess') return p.openAccess;
    return true;
  });

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold text-[#0F172A]">Recent Papers</h2>
        <div className="flex items-center gap-2">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                activeFilter === pill.id
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'border-[#E2E8F0] text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paper cards */}
      <div className="space-y-3">
        {filtered.map((paper, i) => (
          <div
            key={paper.id}
            className="bg-white border rounded-xl p-5 transition-all duration-200 cursor-pointer opacity-0 animate-card-rise"
            style={{
              borderColor: hoveredCard === paper.id ? '#BFDBFE' : '#E2E8F0',
              boxShadow: hoveredCard === paper.id ? '0 8px 24px rgba(37,99,235,0.08)' : '0 1px 4px rgba(0,0,0,0.03)',
              transform: hoveredCard === paper.id ? 'translateY(-2px)' : 'translateY(0)',
              animationDelay: `${i * 80}ms`,
              animationFillMode: 'forwards',
            }}
            onMouseEnter={() => setHoveredCard(paper.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: paper.fieldBg, color: paper.fieldText }}>
                  {paper.field}
                </span>
                {paper.openAccess && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#22C55E]">
                    Open Access
                  </span>
                )}
              </div>
              <span className="text-xs text-[#94A3B8]">{paper.timestamp}</span>
            </div>

            {/* Title */}
            <h3
              className="text-[15px] font-semibold text-[#0F172A] line-clamp-2 mb-2 leading-snug transition-colors duration-200"
              style={{ color: hoveredCard === paper.id ? '#2563EB' : '#0F172A' }}
            >
              {paper.title}
            </h3>

            {/* Authors */}
            <div className="flex items-center gap-2 mb-2">
              <AuthorAvatars authors={paper.authors} />
              <span className="text-sm text-[#475569] truncate">{paper.authorStr}</span>
            </div>

            {/* Journal */}
            <div className="flex items-center gap-1.5 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#94A3B8] flex-shrink-0" />
              <span className="text-sm text-[#475569]">{paper.journal}</span>
              <span className="text-[#94A3B8]">·</span>
              <span className="text-sm text-[#475569]">{paper.year}</span>
            </div>

            {/* Stats + CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Eye className="w-3.5 h-3.5" /> {paper.reads} reads
                </span>
                <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Quote className="w-3.5 h-3.5" /> {paper.citations} citations
                </span>
                <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Download className="w-3.5 h-3.5" /> {paper.downloads}
                </span>
              </div>
              <button className="flex items-center gap-1 text-sm text-[#2563EB] font-semibold hover:gap-2 transition-all duration-200 group">
                View Paper
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPapersFeed;
