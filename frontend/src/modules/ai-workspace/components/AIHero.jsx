import React from "react";
import { Sparkles, Upload, Compass, ArrowRight, Brain, FileText } from "lucide-react";
import { motion } from "framer-motion";

const AIHero = ({ onStartNewSession, onUploadTrigger, onBrowseTemplates }) => {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/60 via-indigo-50/20 to-bg-page border-b border-slate-100 py-12 md:py-16 px-6 md:px-8 rounded-3xl mb-8">
      {/* Light Blur circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Heading and CTAs */}
        <div className="lg:col-span-7 text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic AI Copilot v1.0</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none"
            >
              AI Workspace
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl font-bold text-slate-700 leading-tight"
            >
              Premium AI Research Suite for Researchers, Scientists and Authors.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-2xl"
            >
              Accelerate literature reviews, summarize publications, generate citations, discover journals, identify research gaps and collaborate with AI.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <button
              onClick={onStartNewSession}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <span>Start New Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onUploadTrigger}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all active:scale-[0.98]"
            >
              <Upload className="w-4 h-4 text-primary" />
              <span>Upload PDF</span>
            </button>

            <button
              onClick={onBrowseTemplates}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold py-3 px-4 rounded-xl transition-all"
            >
              <Compass className="w-4 h-4 text-slate-450" />
              <span>Browse Prompt Templates</span>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Premium AI Illustration */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-72 h-72 md:w-80 md:h-80"
          >
            {/* Background glowing circle */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-indigo-650/10 rounded-full blur-2xl animate-pulse pointer-events-none" />

            <svg
              viewBox="0 0 200 200"
              className="w-full h-full drop-shadow-xl text-slate-200"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer orbit lines */}
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.75" />

              {/* Orbiting particles */}
              <motion.circle
                cx="100"
                cy="100"
                r="6"
                fill="#2563EB"
                className="origin-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                style={{ originX: "100px", originY: "100px", transformOrigin: "100px 100px", cx: 160 }}
              />

              <motion.circle
                cx="100"
                cy="100"
                r="4"
                fill="#4F46E5"
                className="origin-center"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                style={{ originX: "100px", originY: "100px", transformOrigin: "100px 100px", cx: 40 }}
              />

              {/* Connections (Mesh network lines) */}
              <line x1="100" y1="100" x2="60" y2="60" stroke="#DBEAFE" strokeWidth="1" />
              <line x1="100" y1="100" x2="140" y2="60" stroke="#DBEAFE" strokeWidth="1" />
              <line x1="100" y1="100" x2="140" y2="140" stroke="#DBEAFE" strokeWidth="1" />
              <line x1="100" y1="100" x2="60" y2="140" stroke="#DBEAFE" strokeWidth="1" />

              {/* Peripheral Nodes (Academic Icons) */}
              <g className="cursor-pointer">
                <circle cx="60" cy="60" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <foreignObject x="51" y="51" width="18" height="18">
                  <Brain className="w-4.5 h-4.5 text-primary" />
                </foreignObject>
              </g>

              <g className="cursor-pointer">
                <circle cx="140" cy="60" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <foreignObject x="131" y="51" width="18" height="18">
                  <FileText className="w-4.5 h-4.5 text-indigo-600" />
                </foreignObject>
              </g>

              <g className="cursor-pointer">
                <circle cx="140" cy="140" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="140" cy="140" r="4" fill="#22C55E" />
              </g>

              <g className="cursor-pointer">
                <circle cx="60" cy="140" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="60" cy="140" r="4" fill="#F59E0B" />
              </g>

              {/* Central Core */}
              <motion.g
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <circle cx="100" cy="100" r="26" fill="#2563EB" className="opacity-10" />
                <circle cx="100" cy="100" r="20" fill="#2563EB" />
                <circle cx="100" cy="100" r="16" fill="url(#coreGradient)" />
                <foreignObject x="91" y="91" width="18" height="18">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </foreignObject>
              </motion.g>

              <defs>
                <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIHero;
