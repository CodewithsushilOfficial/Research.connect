import React, { useState } from 'react';
import { ArrowRight, Award, BarChart2 } from 'lucide-react';

const RESEARCHERS = [
  {
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    gradient: 'linear-gradient(135deg, #2563EB, #4F46E5)',
    institution: 'MIT',
    field: 'Quantum Physics',
    citations: '1.2k',
    hIndex: 24,
    online: true,
  },
  {
    name: 'Prof. Elena Rossetti',
    initials: 'ER',
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
    institution: 'University of Bologna',
    field: 'Bioinformatics',
    citations: '2.8k',
    hIndex: 31,
    online: true,
  },
  {
    name: 'Dr. Marcus Webb',
    initials: 'MW',
    gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    institution: 'MIT CSAIL',
    field: 'ML / AI',
    citations: '945',
    hIndex: 18,
    online: false,
  },
  {
    name: 'Prof. Aisha Diallo',
    initials: 'AD',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    institution: 'Oxford',
    field: 'Climate Science',
    citations: '1.6k',
    hIndex: 22,
    online: true,
  },
  {
    name: 'Dr. Raj Patel',
    initials: 'RP',
    gradient: 'linear-gradient(135deg, #EF4444, #EC4899)',
    institution: 'Stanford',
    field: 'Quantum Computing',
    citations: '734',
    hIndex: 15,
    online: false,
  },
];

const TopResearchersRow = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold text-[#0F172A]">Top Researchers in This Area</h2>
        <button className="flex items-center gap-1 text-sm text-[#2563EB] font-medium hover:gap-2 transition-all duration-200 group">
          See all researchers
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}
      >
        {RESEARCHERS.map((r, i) => (
          <div
            key={r.name}
            className="w-52 flex-shrink-0 bg-white border rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 opacity-0 animate-card-rise"
            style={{
              borderColor: hovered === i ? '#BFDBFE' : '#E2E8F0',
              boxShadow: hovered === i ? '0 8px 24px rgba(37,99,235,0.10)' : '0 1px 4px rgba(0,0,0,0.03)',
              transform: hovered === i ? 'translateY(-4px)' : 'translateY(0)',
              animationDelay: `${i * 60}ms`,
              animationFillMode: 'forwards',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Avatar */}
            <div className="relative inline-block mb-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto"
                style={{ background: r.gradient }}
              >
                {r.initials}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0">
                <div
                  className={`w-3 h-3 rounded-full border-2 border-white ${r.online ? 'bg-[#22C55E]' : 'bg-gray-300'}`}
                />
                {r.online && (
                  <div className="absolute inset-0 rounded-full bg-[#22C55E] animate-pulse-ring" />
                )}
              </div>
            </div>

            {/* Info */}
            <h3 className="font-bold text-[#0F172A] text-sm leading-snug">{r.name}</h3>
            <p className="text-xs text-[#475569] mt-0.5 mb-1">{r.institution}</p>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#2563EB] mb-3">
              {r.field}
            </span>

            {/* Stats */}
            <div className="flex justify-center gap-3 mb-3">
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-[#475569]">
                  <Award className="w-3 h-3 text-[#F59E0B]" />
                  <span>{r.citations}</span>
                </div>
                <p className="text-[10px] text-[#94A3B8]">Citations</p>
              </div>
              <div className="w-px bg-[#E2E8F0]" />
              <div className="text-center">
                <div className="flex items-center gap-1 text-xs text-[#475569]">
                  <BarChart2 className="w-3 h-3 text-[#4F46E5]" />
                  <span>{r.hIndex}</span>
                </div>
                <p className="text-[10px] text-[#94A3B8]">H-index</p>
              </div>
            </div>

            {/* CTA */}
            <button
              className="w-full py-2 text-sm font-medium text-[#2563EB] border border-[#E2E8F0] rounded-lg transition-all duration-150 hover:bg-[#EFF6FF] hover:border-[#BFDBFE]"
              onClick={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; setTimeout(() => { e.currentTarget.style.transform = ''; }, 150); }}
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopResearchersRow;
