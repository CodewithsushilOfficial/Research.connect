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
import StickyBox from '../../../components/common/StickyBox';

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
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">

        {/* ── 2-Column Responsive Grid (Matching Image 2) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* 1. Center Main Feed Column (lg:col-span-8) */}
          <div className="col-span-1 lg:col-span-8">
            <FeedColumn
              welcomeData={user ? { fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(), firstName: user.firstName || 'Scholar' } : null}
              sidebarData={sidebarData}
            />
          </div>

          {/* 2. Right Sidebar Column (lg:col-span-4) — StickyBox computes exact pixel position via JS, immune to nested-scroll-container CSS sticky glitches. Column stretches (items-stretch) to match feed height so it has room to stay pinned the whole way down. */}
          <div className="col-span-1 lg:col-span-4">
            <StickyBox offset={80}>
              <RightSidebar
                sidebarData={sidebarData}
                suggestions={suggestions}
                profile={profile}
                user={user}
                onFollowed={handleFollowed}
              />
            </StickyBox>
          </div>

        </div>

      </div>
    </div>
  );
};

export default HomeFeed;