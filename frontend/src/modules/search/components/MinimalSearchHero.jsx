import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const WORDS = [
  'Groundbreaking Ideas',
  'Pioneering Researchers',
  'Millions of Publications',
  'Cutting-edge Datasets',
  'Game-changing Innovations',
  'Global Patents',
  'Academic Breakthroughs',
  'Future Technologies',
  'Brilliant Minds',
  'Hidden Insights'
];

const MinimalSearchHero = () => {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const currentWord = WORDS[wordIndex];

    if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, 40); // Slightly faster deleting speed for better flow
      } else {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % WORDS.length);
      }
    } else {
      if (displayText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 80); // Slightly faster typing speed
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2500); // Slightly longer pause before deleting
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <div className="mb-10 opacity-0 animate-fade-slide-up group cursor-default">
      <div className="flex items-start gap-5">
        {/* Large Search Icon container with hover animation */}
        <div className="w-[64px] h-[64px] rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_12px_30px_rgba(37,99,235,0.4)] opacity-0 animate-scale-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <Search className="w-8 h-8 transition-transform duration-500 group-hover:scale-110" />
        </div>
        
        {/* Header Text & Subtitle */}
        <div className="pt-1.5 opacity-0 animate-fade-slide-right" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <h1 className="text-[40px] font-extrabold text-[#0F172A] leading-tight tracking-tight flex items-center h-[48px]">
            Discover&nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#4F46E5] relative pr-1">
              {displayText}
              <span className="absolute right-0 top-[10%] h-[80%] w-[3px] bg-[#2563EB] animate-pulse rounded-full" style={{ animationDuration: '0.8s' }} />
            </span>
          </h1>
          <p className="text-[15px] text-[#475569] mt-3.5 max-w-2xl font-medium leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            Dive into millions of peer-reviewed publications, cutting-edge datasets, and profiles of pioneering researchers around the globe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MinimalSearchHero;
