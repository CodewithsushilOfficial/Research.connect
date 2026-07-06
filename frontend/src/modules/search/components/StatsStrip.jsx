import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Users, Globe, TrendingUp } from 'lucide-react';

const STATS = [
  { icon: BookOpen,   color: '#2563EB', bg: '#DBEAFE', number: 2400000, display: '2.4M+', label: 'Papers Indexed' },
  { icon: Users,      color: '#22C55E', bg: '#DCFCE7', number: 50000,   display: '50k+',  label: 'Active Researchers' },
  { icon: Globe,      color: '#4F46E5', bg: '#EDE9FE', number: 180,     display: '180+',  label: 'Countries' },
  { icon: TrendingUp, color: '#F59E0B', bg: '#FEF3C7', number: 98,      display: '98%',   label: 'Uptime' },
];

const easeOutQuad = (t) => t * (2 - t);

function useCountUp(target, duration = 1500, active = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const frame = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      setVal(Math.round(easeOutQuad(progress) * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration, active]);
  return val;
}

const StatItem = ({ stat, index, active }) => {
  const Icon = stat.icon;
  const raw = useCountUp(stat.number, 1500, active);

  const display = () => {
    if (stat.display.endsWith('%')) return `${raw}%`;
    if (stat.display.endsWith('M+')) return raw >= 1000000 ? `${(raw / 1000000).toFixed(1)}M+` : `${(raw / 1000).toFixed(0)}k`;
    if (stat.display.endsWith('k+')) return `${(raw / 1000).toFixed(0)}k+`;
    return `${raw}+`;
  };

  return (
    <div
      className="flex flex-col items-center py-6 px-4 opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
        <Icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <p className="text-[24px] font-black text-[#0F172A] leading-none mb-1">{display()}</p>
      <p className="text-xs text-[#475569] font-medium text-center">{stat.label}</p>
    </div>
  );
};

const StatsStrip = () => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-white border-b border-[#E2E8F0]">
      <div className="grid grid-cols-2 md:grid-cols-4 max-w-5xl mx-auto">
        {STATS.map((stat, i) => (
          <div key={stat.label} className={`${i < STATS.length - 1 ? 'border-r border-[#E2E8F0]' : ''}`}>
            <StatItem stat={stat} index={i} active={active} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsStrip;
