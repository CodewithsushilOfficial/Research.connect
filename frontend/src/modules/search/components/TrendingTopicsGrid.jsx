import React from 'react';
import { Brain, Dna, Cpu, CloudRain, Microscope, Layers, ArrowRight } from 'lucide-react';

const TOPICS = [
  {
    title: 'Large Language Models',
    icon: Brain,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    gradient: 'linear-gradient(135deg, #EFF6FF, #EDE9FE)',
    border: '#BFDBFE',
    pill: '🔥 Hot',
    pillBg: '#FEF3C7',
    pillText: '#F59E0B',
    papers: '124k papers',
    growth: '↑ 34% this month',
    progress: 85,
    barBg: '#DBEAFE',
    barFill: '#2563EB',
  },
  {
    title: 'CRISPR Gene Editing',
    icon: Dna,
    iconColor: '#22C55E',
    iconBg: '#DCFCE7',
    gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    border: '#BBF7D0',
    pill: 'New',
    pillBg: '#DCFCE7',
    pillText: '#22C55E',
    papers: '89k papers',
    growth: '↑ 28%',
    progress: 70,
    barBg: '#DCFCE7',
    barFill: '#22C55E',
  },
  {
    title: 'Quantum Computing',
    icon: Cpu,
    iconColor: '#4F46E5',
    iconBg: '#EDE9FE',
    gradient: 'linear-gradient(135deg, #EDE9FE, #F5F3FF)',
    border: '#DDD6FE',
    pill: 'Rising',
    pillBg: '#EDE9FE',
    pillText: '#4F46E5',
    papers: '67k papers',
    growth: '↑ 41%',
    progress: 62,
    barBg: '#EDE9FE',
    barFill: '#4F46E5',
  },
  {
    title: 'Climate AI',
    icon: CloudRain,
    iconColor: '#F59E0B',
    iconBg: '#FEF3C7',
    gradient: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
    border: '#FDE68A',
    pill: 'Urgent',
    pillBg: '#FEF3C7',
    pillText: '#F59E0B',
    papers: '45k papers',
    growth: '↑ 19%',
    progress: 45,
    barBg: '#FEF3C7',
    barFill: '#F59E0B',
  },
  {
    title: 'Protein Folding',
    icon: Microscope,
    iconColor: '#EF4444',
    iconBg: '#FEE2E2',
    gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)',
    border: '#FECDD3',
    pill: 'Breakthrough',
    pillBg: '#FEE2E2',
    pillText: '#EF4444',
    papers: '38k papers',
    growth: '↑ 52%',
    progress: 38,
    barBg: '#FEE2E2',
    barFill: '#EF4444',
  },
  {
    title: 'Diffusion Models',
    icon: Layers,
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
    gradient: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    border: '#BFDBFE',
    pill: 'Trending',
    pillBg: '#DBEAFE',
    pillText: '#2563EB',
    papers: '29k papers',
    growth: '↑ 67%',
    progress: 30,
    barBg: '#DBEAFE',
    barFill: '#2563EB',
  },
];

const TrendingTopicsGrid = ({ onTopicClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[18px] font-bold text-[#0F172A]">Trending Topics</h2>
        <button className="flex items-center gap-1 text-sm text-[#2563EB] hover:gap-2 transition-all duration-200 font-medium group">
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.title}
              onClick={() => onTopicClick?.(topic.title)}
              className="text-left p-5 rounded-2xl border cursor-pointer transition-all duration-250 hover:-translate-y-1 group opacity-0 animate-card-rise"
              style={{
                background: topic.gradient,
                borderColor: topic.border,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                animationDelay: `${i * 100}ms`,
                animationFillMode: 'forwards',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.10)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: topic.iconBg }}>
                  <Icon className="w-5 h-5" style={{ color: topic.iconColor }} />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: topic.pillBg, color: topic.pillText }}>
                  {topic.pill}
                </span>
              </div>
              <h3 className="font-bold text-[#0F172A] text-[15px] mb-2 leading-snug group-hover:text-[#2563EB] transition-colors duration-200">{topic.title}</h3>
              <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="text-[#475569] font-medium">{topic.papers}</span>
                <span className="text-[#22C55E] font-semibold">{topic.growth}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: topic.barBg }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${topic.progress}%`, background: topic.barFill }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingTopicsGrid;
