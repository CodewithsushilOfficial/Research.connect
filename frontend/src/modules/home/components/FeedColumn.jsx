import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Sparkles, Flame, Clock, Users, FolderKanban,
  Loader2, BookOpen, RefreshCw, TrendingUp, Plus,
  Compass, ArrowUpRight
} from 'lucide-react';
import FeedPublicationCard from './FeedPublicationCard';
import feedService from '../../../services/feed.service';

const TABS = [
  { id: 'recommended', label: 'Recommended', icon: Sparkles },
  { id: 'trending',    label: 'Trending',    icon: Flame },
  { id: 'latest',      label: 'Latest',      icon: Clock },
  { id: 'following',   label: 'Following',   icon: Users },
  { id: 'projects',    label: 'Projects',    icon: FolderKanban },
];

/* ── Skeleton Loader ───────────────────────────────────────── */
const FeedSkeleton = () => (
  <div className="bg-bg-card border border-border rounded-2xl p-5 animate-pulse space-y-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-bg-surface" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-bg-surface rounded w-1/3" />
        <div className="h-3 bg-bg-surface rounded w-1/2" />
      </div>
      <div className="h-6 w-20 bg-bg-surface rounded-full" />
    </div>
    <div className="h-5 bg-bg-surface rounded w-5/6" />
    <div className="h-4 bg-bg-surface rounded w-2/3" />
    <div className="space-y-2">
      <div className="h-3 bg-bg-surface rounded" />
      <div className="h-3 bg-bg-surface rounded w-4/5" />
    </div>
    <div className="flex justify-between pt-3 border-t border-border">
      <div className="flex gap-2">
        <div className="h-7 w-16 bg-bg-surface rounded-lg" />
        <div className="h-7 w-16 bg-bg-surface rounded-lg" />
      </div>
      <div className="h-7 w-20 bg-bg-surface rounded-lg" />
    </div>
  </div>
);

/* ── Project Card ──────────────────────────────────────────── */
const ProjectCard = ({ proj }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={() => navigate(`/projects/${proj._id}`)}
      className="bg-bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
          proj.status === 'active'
            ? 'bg-light-green text-accent-green border-light-green'
            : 'bg-bg-surface text-text-muted border-border'
        }`}>
          {proj.status || 'Open Project'}
        </span>
      </div>
      <h3 className="font-bold text-base text-text-primary group-hover:text-primary transition-colors leading-snug mb-1">
        {proj.title}
      </h3>
      {proj.userId?.fullName && (
        <p className="text-xs text-text-muted mb-2">Lead Researcher: {proj.userId.fullName}</p>
      )}
      {proj.description && (
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{proj.description}</p>
      )}
    </motion.div>
  );
};

/* ── Empty State ───────────────────────────────────────────── */
const EmptyState = ({ tab }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
      <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3" />
      <p className="font-bold text-base text-text-primary mb-1">
        {tab === 'following'
          ? 'No publications from researchers you follow'
          : 'No research publications available yet'}
      </p>
      <p className="text-xs text-text-muted mb-5 max-w-md mx-auto">
        {tab === 'following'
          ? 'Start following other scholars to receive their latest research updates here.'
          : 'Be the first to publish a new paper or explore community topics.'}
      </p>
      <button
        onClick={() => navigate('/search')}
        className="text-xs font-semibold text-white bg-primary hover:bg-primary-hover px-5 py-2.5 rounded-xl transition-all shadow-sm"
      >
        Explore Publications
      </button>
    </div>
  );
};

/* ── Welcome Section ────────────────────────────────────────── */
const WelcomeHeader = ({ welcomeData }) => {
  const navigate = useNavigate();
  const name = welcomeData?.fullName || welcomeData?.firstName || 'Researcher';

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
      {/* Title */}
      <h1
        className="font-extrabold text-text-primary tracking-tight whitespace-nowrap overflow-hidden"
        style={{ fontSize: 'clamp(0.75rem, 4.2vw, 1.5rem)' }}
      >
        Welcome back, <span className="text-primary">{name}</span> 👋
      </h1>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <button
          onClick={() => navigate('/search')}
          aria-label="Explore Research"
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl text-[11px] sm:text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all whitespace-nowrap w-full sm:w-auto"
        >
          <Compass size={14} className="shrink-0" />
          Explore Research
        </button>

        <button
          onClick={() => navigate('/publications/create')}
          aria-label="Create Publication"
          className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl text-[11px] sm:text-xs font-bold text-text-primary bg-bg-card hover:bg-bg-surface border border-border hover:border-primary transition-all whitespace-nowrap w-full sm:w-auto"
        >
          <Plus size={14} className="shrink-0" />
          Create Publication
        </button>

        <button
          onClick={() => navigate('/projects/create')}
          aria-label="Create Project"
          className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl text-[11px] sm:text-xs font-bold text-text-primary bg-bg-card hover:bg-bg-surface border border-border hover:border-primary transition-all whitespace-nowrap w-full sm:w-auto"
        >
          <FolderKanban size={14} className="shrink-0" />
          Create Project
        </button>
      </div>
    </div>
  );
};

/* ── FeedColumn Main Component ─────────────────────────────── */
const FeedColumn = ({ welcomeData, sidebarData }) => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [feed, setFeed] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const tabRef = useRef('recommended');

  const fetchPage = async (tab, pg, replace = false) => {
    setLoading(true);
    try {
      let res;
      if (tab === 'recommended') res = await feedService.getFeed(pg, 10);
      else if (tab === 'trending')  res = await feedService.getTrending(pg, 10);
      else if (tab === 'latest')    res = await feedService.getLatest(pg, 10);
      else if (tab === 'following') res = await feedService.getFollowingFeed(pg, 10);
      else if (tab === 'projects')  res = await feedService.getProjects(pg, 10);

      if (res?.success) {
        const docs = tab === 'projects'
          ? (res.data?.data?.docs || res.data?.docs || [])
          : (res.data?.docs || []);

        if (docs.length < 10) setHasMore(false);

        if (replace) {
          setFeed(docs);
        } else {
          setFeed(prev => {
            const ids = new Set(prev.map(d => d._id));
            return [...prev, ...docs.filter(d => !ids.has(d._id))];
          });
        }
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    tabRef.current = activeTab;
    setFeed([]);
    setPage(1);
    setHasMore(true);
    fetchPage(activeTab, 1, true);
  }, [activeTab]);

  useEffect(() => {
    if (page === 1) return;
    if (tabRef.current !== activeTab) return;
    fetchPage(activeTab, page, false);
  }, [page]);

  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  const isFirstLoad = loading && feed.length === 0;

  return (
    <section className="space-y-5">
      {/* 1. Welcome Card */}
      <WelcomeHeader welcomeData={welcomeData} sidebarData={sidebarData} />

      {/* 2. Tabs Bar (Pill style) */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-[11px] sm:text-xs whitespace-nowrap border transition-all ${
                active
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-bg-card border-border text-text-muted hover:text-text-primary hover:border-primary/40'
              }`}
            >
              <Icon size={13} className="shrink-0" />
              {label}
            </button>
          );
        })}
      </div>

      {/* 3. Feed List */}
      <div className="space-y-4 min-h-[60vh]">
        {isFirstLoad ? (
          [1, 2, 3].map(i => <FeedSkeleton key={i} />)
        ) : feed.length === 0 && !loading ? (
          <EmptyState tab={activeTab} />
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {feed.map(item =>
              activeTab === 'projects' ? (
                <ProjectCard key={item._id} proj={item} />
              ) : (
                <FeedPublicationCard key={item._id} pub={item} />
              )
            )}
          </AnimatePresence>
        )}

        {/* Sentinel */}
        <div ref={observerRef} className="h-8 flex items-center justify-center">
          {loading && feed.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted py-4">
              <Loader2 size={15} className="animate-spin text-primary" />
              Loading research publications...
            </div>
          )}
          {!hasMore && feed.length > 0 && (
            <p className="text-xs text-text-muted py-4">All available publications loaded.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeedColumn;