import React from 'react';

/**
 * SkeletonCard — shimmer placeholder matching the shape of ResultCard.
 * Uses a CSS gradient mask sweep animation.
 */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 overflow-hidden relative">
    {/* Shimmer overlay */}
    <div
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s infinite',
      }}
    />

    {/* Type badge row */}
    <div className="flex items-center gap-2 mb-4">
      <div className="h-6 w-28 bg-[#E2E8F0] rounded-full animate-pulse" />
      <div className="h-6 w-16 bg-[#E2E8F0] rounded-full animate-pulse" />
    </div>

    {/* Title */}
    <div className="h-5 bg-[#E2E8F0] rounded-lg w-5/6 mb-2 animate-pulse" />
    <div className="h-5 bg-[#E2E8F0] rounded-lg w-4/6 mb-4 animate-pulse" />

    {/* Authors */}
    <div className="h-4 bg-[#E2E8F0]/70 rounded w-2/4 mb-3 animate-pulse" />

    {/* Abstract lines */}
    <div className="space-y-2 mb-4">
      <div className="h-3.5 bg-[#E2E8F0]/60 rounded w-full animate-pulse" />
      <div className="h-3.5 bg-[#E2E8F0]/60 rounded w-11/12 animate-pulse" />
    </div>

    {/* Tags */}
    <div className="flex gap-2 mb-4">
      {[60, 80, 64, 72].map((w, i) => (
        <div key={i} className="h-6 rounded-full bg-[#EDE9FE] animate-pulse" style={{ width: w }} />
      ))}
    </div>

    {/* Footer stats + button */}
    <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
      <div className="flex gap-4">
        <div className="h-4 w-16 bg-[#E2E8F0]/60 rounded animate-pulse" />
        <div className="h-4 w-16 bg-[#E2E8F0]/60 rounded animate-pulse" />
        <div className="h-4 w-20 bg-[#E2E8F0]/60 rounded animate-pulse" />
      </div>
      <div className="h-8 w-20 bg-[#DBEAFE] rounded-xl animate-pulse" />
    </div>
  </div>
);

export default SkeletonCard;
