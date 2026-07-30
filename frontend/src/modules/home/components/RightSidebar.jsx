import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Users, Search, Mail, RefreshCw, Star,
  Award, ChevronRight, CheckCircle2, Sparkles, BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { setQuery } from '../../../redux/slices/searchSlice';
import Avatar from '../../../components/ui/Avatar';
import feedService from '../../../services/feed.service';
import profileService from '../../../services/profile.service';
import ResearchMetrics from '../../profile/components/ResearchMetrics';
import CoAuthorsSection from '../../profile/components/CoAuthorsSection';

/* ─── 1. Trending Keywords Widget ────────────────────────────── */
const TrendingKeywords = ({ keywords = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [q, setQ] = useState('');

  const filtered = keywords.filter(k =>
    k.tag?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={14} className="text-primary" />
          TRENDING KEYWORDS
        </h3>
        <span className="text-[11px] font-semibold text-text-muted bg-bg-surface border border-border px-2.5 py-0.5 rounded-full">
          {keywords.length || 10} tags
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search keywords..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="w-full bg-bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>

      {/* Keyword Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {filtered.slice(0, 12).map(k => (
          <button
            key={k.tag}
            onClick={() => {
              dispatch(setQuery(k.tag));
              navigate(`/search?q=${encodeURIComponent(k.tag)}`);
            }}
            className="text-xs font-medium bg-light-blue hover:bg-primary hover:text-white border border-light-blue hover:border-primary text-primary px-3 py-1.5 rounded-full transition-all duration-200"
          >
            #{k.tag} <span className="text-[10px] opacity-75 font-semibold">({k.count})</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-text-muted py-2">No matching keywords found.</p>
        )}
      </div>

      {/* View All Button */}
      <button
        onClick={() => {
          dispatch(setQuery(''));
          navigate('/search');
        }}
        className="w-full text-xs font-semibold text-text-secondary hover:text-primary bg-bg-surface hover:bg-bg-card border border-border hover:border-primary py-2.5 rounded-xl transition-all text-center"
      >
        View All Keywords
      </button>
    </div>
  );
};

/* ─── 2. Suggested Researchers Widget ────────────────────────── */
const SuggestedResearchers = ({ researchers = [], onFollowed }) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState({});

  const handleFollow = async (userId, name) => {
    try {
      await feedService.toggleFollow(userId);
      setFollowing(prev => ({ ...prev, [userId]: !prev[userId] }));
      toast.success(following[userId] ? 'Unfollowed' : `Following ${name}`);
      onFollowed?.(userId);
    } catch {
      toast.error('Could not update follow status.');
    }
  };

  if (!researchers.length) return null;

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Users size={14} className="text-accent-indigo" />
          SUGGESTED RESEARCHERS
        </h3>
      </div>

      <div className="space-y-3">
        {researchers.slice(0, 4).map((res, i) => {
          const isFollowing = following[res.userId];
          return (
            <div key={res.userId || i} className="p-3 bg-bg-surface border border-border rounded-xl space-y-2.5">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => navigate(`/profile/${res.profileSlug || res.userId}`)}
                  className="shrink-0"
                >
                  <Avatar src={res.avatar} name={res.name} size="md" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() => navigate(`/profile/${res.profileSlug || res.userId}`)}
                      className="font-bold text-xs text-text-primary hover:text-primary transition-colors text-left truncate"
                    >
                      {res.name}
                    </button>
                    {res.matchPercentage > 0 && (
                      <span className="text-[10px] font-bold text-accent-green bg-light-green px-2 py-0.5 rounded-full shrink-0">
                        {res.matchPercentage}% match
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {res.designation || 'Researcher'}{res.institution ? ` · ${res.institution}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleFollow(res.userId, res.name)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isFollowing
                      ? 'bg-bg-card text-text-secondary border border-border hover:text-accent-red'
                      : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => navigate(`/messages?participantId=${res.userId}`)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-border text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1 bg-bg-card"
                >
                  <Mail size={13} />
                  Message
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/connections')}
        className="w-full text-xs font-semibold text-text-secondary hover:text-primary bg-bg-surface hover:bg-bg-card border border-border hover:border-primary py-2.5 rounded-xl transition-all text-center"
      >
        View All Researchers
      </button>
    </div>
  );
};

/* ─── Right Sidebar Main Component ───────────────────────────── */
const RightSidebar = ({ sidebarData, suggestions, profile, user, onFollowed }) => {
  const keywords = sidebarData?.trendingKeywords || [];

  // Fetch metrics dynamically from MongoDB API
  const { data: metricsData } = useQuery({
    queryKey: ['myMetrics'],
    queryFn: async () => {
      try {
        const res = await profileService.getMetrics('me');
        if (res.success && res.data) return res.data;
      } catch (e) { /* ignore error */ }
      try {
        const profRes = await profileService.getProfile();
        if (profRes.success && profRes.data) {
          return {
            publicationsCount: profRes.data.publications?.length || profRes.data.metrics?.publicationsCount || 0,
            citationsCount: profRes.data.metrics?.totalCitations || profRes.data.metrics?.citationsCount || 0,
            hIndex: profRes.data.metrics?.hIndex || 0,
            i10Index: profRes.data.metrics?.i10Index || 0,
            projectsCount: profRes.data.projects?.length || profRes.data.metrics?.projectsCount || 0,
            downloadsCount: profRes.data.metrics?.downloadsCount || 0,
            viewsCount: profRes.data.metrics?.viewsCount || 0,
            experienceYears: profRes.data.metrics?.researchExperience || 0,
            patentsCount: profRes.data.metrics?.patentsCount || 0,
            booksCount: profRes.data.metrics?.booksCount || 0,
            datasetsCount: profRes.data.metrics?.datasetsCount || 0,
          };
        }
      } catch (e) { /* ignore error */ }
      return {};
    },
    staleTime: 2 * 60 * 1000
  });

  // Fetch co-authors dynamically from MongoDB API
  const { data: coAuthorsData } = useQuery({
    queryKey: ['myCoAuthors'],
    queryFn: async () => {
      try {
        const res = await profileService.getCoAuthors('me');
        return res.success ? res.data : [];
      } catch (e) { return []; }
    },
    staleTime: 5 * 60 * 1000
  });

  const metrics = metricsData || profile?.metrics || user?.metrics || {};
  const coAuthors = coAuthorsData || profile?.coAuthors || [];

  return (
    <aside className="space-y-5">
      {/* 1. Research Analytics & Metrics Card (ALWAYS VISIBLE ABOVE TRENDING KEYWORDS) */}
      <ResearchMetrics
        metrics={metrics}
        title="Research Analytics & Metrics"
        subhead="Academic Performance Indicators"
        compact
      />

      {/* 2. Trending Keywords Card */}
      <TrendingKeywords keywords={keywords} />

      {/* 3. Co-Authors Section Card */}
      <CoAuthorsSection
        coAuthors={coAuthors}
        title="Co-Authors"
        subhead="Academic Collaboration Network"
      />

      {/* 4. Suggested Researchers Card */}
      <SuggestedResearchers researchers={suggestions} onFollowed={onFollowed} />
    </aside>
  );
};

export default RightSidebar;
