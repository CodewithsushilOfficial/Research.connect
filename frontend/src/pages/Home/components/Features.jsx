import React from 'react';
import { Shield, Cpu, Target, Award, Compass, MessageSquare } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: <Cpu className="h-6 w-6" />,
      title: 'AI Research Recommendations',
      description: 'Our proprietary recommendation engine matches you with relevant publications and researchers based on your profile and reading history.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Verified Researcher Profiles',
      description: 'Robust verification mechanisms ensure that profiles belong to actual researchers, preventing spam and academic identity theft.',
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Precision Literature Search',
      description: 'Search through millions of papers with advanced filters (keywords, authors, publication date, journal impact) and semantic understanding.',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Impact Analytics & h-Index',
      description: 'Get deep insights into how your work is being received, tracking citations, reads, and overall academic reach.',
    },
    {
      icon: <Compass className="h-6 w-6" />,
      title: 'Co-Author & Peer Discovery',
      description: 'Find potential collaborators with complementary skills or similar research paths to accelerate your active projects.',
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Secure Scientific Discussions',
      description: 'Engage in structured Q&A, comment on open-access preprints, and exchange constructive feedback with peers.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#F8FAFC] border-t border-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Designed for Modern Scientific Discovery
          </h2>
          <p className="mt-4 text-lg text-muted-foreground font-medium">
            Research Connect provides a suite of advanced tools that simplify the way you find, share, and collaborate on scientific research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group p-8 rounded-2xl bg-white border border-border hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="bg-primary/10 p-3 rounded-xl w-fit border border-primary/20 text-primary group-hover:bg-primary/20 transition duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition duration-200">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
