import React, { useState } from 'react';

const TOPIC_TAGS = [
  'Large Language Models', 'CRISPR Gene Editing', 'Quantum Computing',
  'Diffusion Models', 'Climate AI', 'Protein Folding', 'Federated Learning',
  'Dark Matter', 'mRNA Vaccines', 'Neuroplasticity', 'Graphene', 'Exoplanets',
  'Large Language Models', 'CRISPR Gene Editing', 'Quantum Computing',
  'Diffusion Models', 'Climate AI', 'Protein Folding', 'Federated Learning',
  'Dark Matter', 'mRNA Vaccines', 'Neuroplasticity', 'Graphene', 'Exoplanets',
];

const RESEARCHER_TAGS = [
  'Dr. Sarah Chen · MIT', 'Prof. Elena Rossetti · Bologna', 'Dr. Marcus Webb · MIT CSAIL',
  'Prof. Aisha Diallo · Oxford', 'Dr. Raj Patel · Stanford', 'Dr. Liu Wei · Peking University',
  'Prof. Priya Sharma · IIT Bombay', 'Dr. Alex Kumar · Cambridge', 'Dr. Sofia Martinez · ETH Zurich',
  'Prof. James Park · Harvard', 'Dr. Yuki Tanaka · Tokyo University', 'Dr. Ana Costa · INRIA',
  'Dr. Sarah Chen · MIT', 'Prof. Elena Rossetti · Bologna', 'Dr. Marcus Webb · MIT CSAIL',
  'Prof. Aisha Diallo · Oxford', 'Dr. Raj Patel · Stanford', 'Dr. Liu Wei · Peking University',
  'Prof. Priya Sharma · IIT Bombay', 'Dr. Alex Kumar · Cambridge', 'Dr. Sofia Martinez · ETH Zurich',
  'Prof. James Park · Harvard', 'Dr. Yuki Tanaka · Tokyo University', 'Dr. Ana Costa · INRIA',
];

const BottomTicker = () => {
  const [row1Paused, setRow1Paused] = useState(false);
  const [row2Paused, setRow2Paused] = useState(false);

  return (
    <div className="bg-white border-t border-[#E2E8F0] py-5 overflow-hidden">
      {/* Row 1 — Topics sliding left */}
      <div
        className="relative mb-3"
        onMouseEnter={() => setRow1Paused(true)}
        onMouseLeave={() => setRow1Paused(false)}
      >
        {/* Fade edge left */}
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        {/* Fade edge right */}
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div
          className="flex gap-3 animate-slide-left"
          style={{ animationPlayState: row1Paused ? 'paused' : 'running', width: 'max-content' }}
        >
          {TOPIC_TAGS.map((tag, i) => (
            <span
              key={`topic-${i}`}
              className="bg-[#DBEAFE] text-[#2563EB] text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 cursor-pointer hover:bg-[#BFDBFE] transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Row 2 — Researchers sliding right */}
      <div
        className="relative"
        onMouseEnter={() => setRow2Paused(true)}
        onMouseLeave={() => setRow2Paused(false)}
      >
        {/* Fade edge left */}
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        {/* Fade edge right */}
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div
          className="flex gap-3 animate-slide-right"
          style={{ animationPlayState: row2Paused ? 'paused' : 'running', width: 'max-content' }}
        >
          {RESEARCHER_TAGS.map((tag, i) => (
            <span
              key={`researcher-${i}`}
              className="bg-[#F8FAFC] text-[#475569] text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 border border-[#E2E8F0] cursor-pointer hover:bg-[#F1F5F9] transition-colors duration-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomTicker;
