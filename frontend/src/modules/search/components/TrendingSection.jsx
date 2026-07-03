import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Search, BookOpen, Tag, FlameIcon, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import searchService from '../../../services/search.service';

const TrendingSection = ({ onQueryClick }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['search-trending'],
    queryFn: () => searchService.getTrending(),
    staleTime: 5 * 60 * 1000,
  });

  const handleClick = (query) => {
    if (onQueryClick) { onQueryClick(query); return; }
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map(j => <div key={j} className="h-8 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { trendingQueries = [], trendingResearchAreas = [], popularJournals = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Trending Queries */}
      {trendingQueries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Trending Searches</h3>
          </div>
          <div className="space-y-1">
            {trendingQueries.map((item, i) => (
              <button
                key={i}
                onClick={() => handleClick(item.query)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-orange-50 rounded-xl transition-colors group text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-orange-400 w-5">#{i + 1}</span>
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <span className="text-sm text-gray-700 group-hover:text-orange-700 transition-colors">{item.query}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{item.count?.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trending Research Areas */}
      {trendingResearchAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Research Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingResearchAreas.map((area, i) => (
              <button
                key={i}
                onClick={() => handleClick(area.area)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors border border-blue-200 hover:border-blue-300"
              >
                {area.area}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Popular Journals */}
      {popularJournals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Popular Journals</h3>
          </div>
          <div className="space-y-1">
            {popularJournals.map((j, i) => (
              <button
                key={i}
                onClick={() => handleClick(j.journal)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-green-50 rounded-xl transition-colors group text-left"
              >
                <span className="text-sm text-gray-700 group-hover:text-green-700 transition-colors truncate">{j.journal}</span>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{j.count} papers</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrendingSection;
