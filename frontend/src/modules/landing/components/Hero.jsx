import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../../../components/common/buttons/Button';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-20 pb-24 md:pt-28 md:pb-32 px-4 border-b border-border">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-light-blue rounded-full filter blur-[80px] opacity-60 -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-light-purple rounded-full filter blur-[100px] opacity-40 -z-10"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 text-left space-y-6"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-light-blue text-primary border border-blue-200 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-accent-indigo" />
            <span>Phase 0 Foundation Live</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-primary tracking-tight leading-tight"
          >
            Empowering Scientific <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-indigo">
              Discovery & Synergy
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-text-secondary max-w-2xl leading-relaxed"
          >
            An enterprise-grade, AI-powered collaboration network built for researchers. Discover academic publications, cooperate on projects, and sync Google Scholar metrics in real-time.
          </motion.p>

          {/* Search bar UI */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl flex items-center p-1.5 bg-bg-card rounded-xl shadow-md border border-border focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all"
          >
            <div className="flex items-center flex-grow pl-3 text-text-secondary">
              <Search className="w-5 h-5 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search research papers, keywords, DOI..."
                className="w-full bg-transparent border-none text-text-primary focus:ring-0 focus:outline-none placeholder-text-secondary text-sm"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </motion.form>

          {/* Trust bullets */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-text-secondary font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              <span>Semantic Search Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              <span>Secure Session Locks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              <span>Modular Repository Layer</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Right Visuals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="lg:col-span-5 flex justify-center relative"
        >
          {/* Glassmorphic illustration panel simulating publication dashboard */}
          <div className="w-full max-w-md bg-white/70 backdrop-blur-md border border-slate-200 p-6 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-primary rounded-bl-full opacity-10"></div>
            
            {/* Header profile row */}
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                AS
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm">Dr. Alice Smith</h4>
                <p className="text-xs text-text-secondary">Associate Professor, Stanford</p>
              </div>
            </div>

            {/* Micro stats grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#DBEAFE] p-3 rounded-xl border border-blue-200">
                <p className="text-xs text-[#2563EB] font-bold">Citations</p>
                <p className="text-xl font-extrabold text-[#0F172A]">4,200+</p>
              </div>
              <div className="bg-[#DCFCE7] p-3 rounded-xl border border-green-200">
                <p className="text-xs text-[#22C55E] font-bold">h-Index</p>
                <p className="text-xl font-extrabold text-[#0F172A]">18</p>
              </div>
            </div>

            {/* Micro paper list preview */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-text-primary uppercase tracking-wider">Publications Preview</p>
              <div className="p-3 bg-bg-card rounded-lg border border-border text-left hover:border-slate-300 transition-colors">
                <h5 className="font-semibold text-xs text-text-primary mb-1">Attention Is All You Need</h5>
                <p className="text-[10px] text-text-secondary">Preprint • Cited by 120,531</p>
              </div>
              <div className="p-3 bg-bg-card rounded-lg border border-border text-left hover:border-slate-300 transition-colors">
                <h5 className="font-semibold text-xs text-text-primary mb-1">Deep Residual Learning for Image Recognition</h5>
                <p className="text-[10px] text-text-secondary">Conference Paper • Cited by 98,241</p>
              </div>
            </div>

            {/* Bottom synergy indicator */}
            <div className="bg-light-purple p-3 rounded-xl border border-purple-200 flex items-center justify-between text-xs">
              <span className="text-accent-indigo font-bold">AI Vector Embeddings Sync</span>
              <span className="px-2 py-0.5 rounded bg-white text-accent-indigo font-semibold border border-purple-200">
                Active
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
