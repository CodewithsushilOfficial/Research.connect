import React from 'react';
import { Terminal, Stethoscope, Atom, Dna, BrainCircuit, Landmark } from 'lucide-react';

export const Categories = () => {
  const categories = [
    {
      icon: <Terminal className="h-6 w-6" />,
      title: 'Computer Science',
      papers: '2.4M+ Papers',
      bgColor: 'bg-[#DBEAFE]',
      iconColor: 'text-[#2563EB]',
    },
    {
      icon: <Stethoscope className="h-6 w-6" />,
      title: 'Medicine & Health',
      papers: '4.1M+ Papers',
      bgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#22C55E]',
    },
    {
      icon: <Atom className="h-6 w-6" />,
      title: 'Physics & Astronomy',
      papers: '1.8M+ Papers',
      bgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#4F46E5]',
    },
    {
      icon: <Dna className="h-6 w-6" />,
      title: 'Biology & Genetics',
      papers: '2.2M+ Papers',
      bgColor: 'bg-[#DCFCE7]',
      iconColor: 'text-[#10B981]',
    },
    {
      icon: <BrainCircuit className="h-6 w-6" />,
      title: 'Neuroscience',
      papers: '850K+ Papers',
      bgColor: 'bg-[#EDE9FE]',
      iconColor: 'text-[#8B5CF6]',
    },
    {
      icon: <Landmark className="h-6 w-6" />,
      title: 'Social Sciences',
      papers: '1.1M+ Papers',
      bgColor: 'bg-[#FEF3C7]',
      iconColor: 'text-[#F59E0B]',
    },
  ];

  return (
    <section className="py-24 bg-[#F8FAFC] border-t border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Explore Popular Disciplines
            </h2>
            <p className="mt-4 text-lg text-muted-foreground font-medium">
              Browse through millions of publications organized across diverse fields of study.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map((category, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white border border-border hover:border-slate-300 hover:shadow-sm text-center space-y-4 transition duration-200 cursor-pointer group"
            >
              <div className={`${category.bgColor} ${category.iconColor} p-4 rounded-xl w-fit mx-auto border border-white/50 transition duration-200 group-hover:scale-105`}>
                {category.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition duration-200">
                  {category.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{category.papers}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
