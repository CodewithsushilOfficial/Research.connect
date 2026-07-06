import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen, Share2, Users } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden bg-hero-gradient">
      {/* Background Gradients & Glows (subtle for light theme) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-550/5 blur-[120px] -z-10"></div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] -z-10"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-white border border-border px-4 py-2 rounded-full mb-8 shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">A New Era of Academic Collaboration</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-8 max-w-4xl mx-auto leading-[1.1]"
        >
          Connecting Minds to{' '}
          <span className="gradient-text">Advance Human Knowledge</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Discover relevant publications, connect with global co-authors, and leverage AI to accelerate your scientific discoveries.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20"
        >
          <Link
            to="/register"
            className="group w-full sm:w-auto inline-flex justify-center items-center py-4 px-8 border border-transparent rounded-xl text-base font-bold text-white bg-primary hover:bg-primary-600 shadow-lg shadow-primary/25 transition duration-200"
          >
            Join the Network
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex justify-center items-center py-4 px-8 rounded-xl text-base font-bold text-muted-foreground bg-white border border-border hover:bg-slate-50 hover:text-foreground transition duration-200 shadow-sm"
          >
            Explore Features
          </a>
        </motion.div>

        {/* Floating Feature Cards representing the network */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="p-6 rounded-2xl bg-card border border-border text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-xl w-fit border border-primary/20 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Smart Discovery</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Find publications and research papers tailored to your specific field and interests using semantic analysis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-xl w-fit border border-primary/20 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Real-time Collaboration</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Form research groups, co-author publications, and share datasets seamlessly within secure environments.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border text-left space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-primary/10 p-3 rounded-xl w-fit border border-primary/20 text-primary">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Impact Tracking</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Monitor your citations, reads, views, and h-index dynamically with real-time updates and analytics.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
