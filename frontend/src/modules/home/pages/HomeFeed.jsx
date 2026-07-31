import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import feedService from '../../../services/feed.service';
import scholarService from '../../../services/scholar.service';
import recommendationService from '../../../services/recommendation.service';

import FeedColumn from '../components/FeedColumn';
import RightSidebar from '../components/RightSidebar';

/**
 * HomeFeed — Clean 2-Column Academic Layout (Matching Reference Image 2)
 *
 * Outer AppLayout handles the main left navigation menu.
 * Inside HomeFeed:
 *   - Center Column (68% width): Welcome Header, Tab Switcher, Feed Publications List
 *   - Right Column (32% width): Academic Standing, Trending Keywords, Suggested Researchers
 */
const HomeFeed = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useSelector(s => s.auth);

  /* ── Sidebar Data (Keywords & AI Insight) ──────────────── */
  const { data: sidebarData } = useQuery({
    queryKey: ['feedSidebar'],
    queryFn: async () => {
      const res = await feedService.getFeedSidebar();
      return res.success ? res.data : null;
    },
    staleTime: 5 * 60 * 1000,
  });

  /* ── Suggested Researchers ────────────────────────────── */
  const { data: suggestionsData, refetch: refetchSuggestions } = useQuery({
    queryKey: ['suggestedResearchers'],
    queryFn: async () => {
      const res = await recommendationService.getResearchers(6);
      return res.success ? (res.data?.docs || res.data?.data?.docs || []) : [];
    },
    staleTime: 10 * 60 * 1000,
  });

  const handleFollowed = () => {
    refetchSuggestions();
    queryClient.invalidateQueries({ queryKey: ['feedSidebar'] });
  };

  const suggestions = suggestionsData || [];

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 pt-0 pb-6">

        {/* ── 2-Column Responsive Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* 1. Center Main Feed Column (lg:col-span-8) */}
          <div className="col-span-1 lg:col-span-8">
            <FeedColumn
              welcomeData={user ? { fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(), firstName: user.firstName || 'Scholar' } : null}
              sidebarData={sidebarData}
            />
          </div>

          {/* 2. Right Sidebar Column (lg:col-span-4) — Sticky Top 0 to align visually with main feed */}
          <div className="col-span-1 lg:col-span-4 lg:sticky lg:top-0">
            <RightSidebar
              sidebarData={sidebarData}
              suggestions={suggestions}
              profile={profile}
              user={user}
              onFollowed={handleFollowed}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default HomeFeed;