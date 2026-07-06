import React from 'react';

export const Stats = () => {
  const stats = [
    { value: '150K+', label: 'Verified Researchers' },
    { value: '12M+', label: 'Scientific Publications' },
    { value: '50M+', label: 'Citation Connections' },
    { value: '2.5K+', label: 'Academic Institutions' },
  ];

  return (
    <section id="stats" className="py-20 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-10 md:p-16 rounded-3xl glass border border-border relative overflow-hidden shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 -ml-24 -mbl-24 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl -z-10"></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
