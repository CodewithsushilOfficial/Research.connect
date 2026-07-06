import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import {
  BellRing, CheckCheck, ChevronDown, Loader2,
  CheckCircle, Bell, BookOpen, BellDot, TrendingUp,
} from 'lucide-react';
import CategoryPanel  from '../components/CategoryPanel';
import NotificationCardV2 from '../components/NotificationCardV2';
import BentoCards     from '../components/BentoCards';
import { useNotifications } from '../../../hooks/useNotifications';

// ── Spring / easing constants ─────────────────────────────────────────────────
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];

// ── Animated counter for metric cards ────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = '', className = '' }) => {
  const count    = useMotionValue(0);
  const rounded  = useTransform(count, (v) => `${Math.round(v)}${suffix}`);
  const ref      = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration: 1.1, ease: 'easeOut' });
    return controls.stop;
  }, [isInView, value, count]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
};

// ── Metric card component ─────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, subtitle, badgeBg, iconColor, fillColor, delay, isRatio = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25, delay }}
    whileHover={{
      scale: 1.02,
      y: -3,
      boxShadow: '0 8px 30px rgba(15,23,42,0.06)',
      transition: { type: 'spring', stiffness: 340, damping: 22 },
    }}
    className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_8px_30px_rgba(15,23,42,0.03)] p-5 overflow-hidden cursor-default"
  >
    <div className="relative">
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: badgeBg }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: iconColor }} />
      </div>

      {/* Label */}
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
        {label}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1">
        <AnimatedNumber
          value={value}
          suffix={isRatio ? '%' : ''}
          className="text-[28px] font-bold text-[#0F172A] leading-none"
        />
      </div>

      {/* Read ratio progress bar */}
      {isRatio && (
        <div className="mt-2.5 w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: fillColor }}
            initial={{ width: '0%' }}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: delay + 0.2 }}
          />
        </div>
      )}

      {/* Subtitle */}
      {subtitle && !isRatio && (
        <p className="text-[12px] text-[#475569] mt-1">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

// ── Skeleton loaders ──────────────────────────────────────────────────────────
const SkeletonPulse = ({ className = '' }) => (
  <div
    className={`rounded-lg animate-shimmer-sweep ${className}`}
    style={{
      background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
      backgroundSize: '200% 100%',
    }}
  />
);

const MetricCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 overflow-hidden">
    <SkeletonPulse className="w-9 h-9 mb-3" />
    <SkeletonPulse className="h-2.5 w-16 mb-2" />
    <SkeletonPulse className="h-7 w-20 mb-2" />
    <SkeletonPulse className="h-2 w-12" />
  </div>
);

const NotificationCardSkeleton = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex gap-4"
  >
    <div
      className="w-[52px] h-[52px] rounded-full flex-shrink-0 animate-shimmer-sweep"
      style={{
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%',
      }}
    />
    <div className="flex-1 space-y-2.5 py-1">
      <SkeletonPulse className="h-3 w-3/4" />
      <SkeletonPulse className="h-2.5 w-full" />
      <SkeletonPulse className="h-2.5 w-5/6" />
      <div className="flex gap-3 mt-3">
        <SkeletonPulse className="h-2 w-16" />
        <SkeletonPulse className="h-2 w-12" />
      </div>
    </div>
  </motion.div>
);

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ label, count }) => (
  <motion.div
    className="flex items-center gap-3 mb-5"
    initial={{ opacity: 0, letterSpacing: '0.3em' }}
    animate={{ opacity: 1, letterSpacing: '0.12em' }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
  >
    <span className="uppercase text-[11px] tracking-[0.12em] text-[#94A3B8] font-bold whitespace-nowrap">
      {label}
    </span>
    {count > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
        className="bg-[#F1F5F9] text-[#94A3B8] text-[10px] font-bold px-2 py-0.5 rounded-full"
      >
        {count}
      </motion.span>
    )}
    <motion.div
      className="flex-1 h-px origin-left"
      style={{ background: 'linear-gradient(90deg, #2563EB, #4F46E5, transparent)' }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO }}
    />
  </motion.div>
);

// ── Filter helper ─────────────────────────────────────────────────────────────
const FILTER_TYPE_MAP = {
  citations: 'citation',
  mentions:  'mention',
  reviews:   'review',
  system:    'system',
};

const applyFilter = (list, filter) => {
  if (filter === 'all') return list;
  const t = FILTER_TYPE_MAP[filter];
  return t ? list.filter((n) => n.type === t) : list;
};

// ── Main page ─────────────────────────────────────────────────────────────────
const NotificationCenter = () => {
  const [activeFilter, setActiveFilter]   = useState('all');
  const [showToast, setShowToast]         = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const bellRef = useRef(null);

  const {
    dateGrouped,
    stats,
    isLoading,
    isFetching,
    markAsRead,
    markAllRead,
    dismissNotification,
    isMarkingAllRead,
    refetch,
  } = useNotifications();

  // Periodic bell shake
  useEffect(() => {
    const interval = setInterval(() => {
      bellRef.current?.classList.add('animate-bell-shake');
      setTimeout(() => bellRef.current?.classList.remove('animate-bell-shake'), 700);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filtered groups
  const today     = useMemo(() => applyFilter(dateGrouped.today,     activeFilter), [dateGrouped.today,     activeFilter]);
  const yesterday = useMemo(() => applyFilter(dateGrouped.yesterday, activeFilter), [dateGrouped.yesterday, activeFilter]);
  const older     = useMemo(() => applyFilter(dateGrouped.older,     activeFilter), [dateGrouped.older,     activeFilter]);
  const totalFiltered = today.length + yesterday.length + older.length;

  const handleMarkAllRead = useCallback(() => {
    markAllRead();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  }, [markAllRead]);

  // ── Metric cards config ───────────────────────────────────────────────────
  const metricCards = [
    {
      icon:        Bell,
      label:       'Total',
      value:       stats.total,
      subtitle:    'all notifications',
      badgeBg:     '#DBEAFE',
      iconColor:   '#2563EB',
    },
    {
      icon:        BellDot,
      label:       'Unread',
      value:       stats.unread,
      subtitle:    'needs attention',
      badgeBg:     '#FEF3C7',
      iconColor:   '#F59E0B',
    },
    {
      icon:        BookOpen,
      label:       'Citations',
      value:       stats.citations,
      subtitle:    'research references',
      badgeBg:     '#EDE9FE',
      iconColor:   '#4F46E5',
    },
    {
      icon:        TrendingUp,
      label:       'Read Ratio',
      value:       stats.readRatio,
      subtitle:    null,
      badgeBg:     '#DCFCE7',
      iconColor:   '#22C55E',
      fillColor:   '#22C55E',
      isRatio:     true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Success toast ─────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl p-4 pr-6 flex items-center gap-3 z-50 max-w-sm"
        style={{
          transform: showToast ? 'translateX(0) scale(1)' : 'translateX(130%) scale(0.9)',
          opacity:   showToast ? 1 : 0,
          transition: 'all 350ms cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#22C55E] rounded-l-2xl" />
        <div className="w-8 h-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
          <CheckCircle className="w-4 h-4 text-[#22C55E]" />
        </div>
        <div>
          <p className="text-[#0F172A] font-semibold text-sm">All caught up!</p>
          <p className="text-[#94A3B8] text-xs">All notifications marked as read</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 lg:py-10">

        {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-6">
          <div>
            <motion.div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DBEAFE] rounded-full mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            >
              <BellRing ref={bellRef} className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-[#2563EB] text-[12px] font-semibold tracking-wide">
                Notification Center
              </span>
            </motion.div>

            <motion.h1
              className="text-[34px] font-bold text-[#0F172A] mb-2.5 leading-tight"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: EASE_OUT_EXPO }}
            >
              Stay Updated
            </motion.h1>

            <motion.p
              className="text-[15px] text-[#475569] leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: EASE_OUT_EXPO }}
            >
              Track citations, mentions, peer reviews, and your research network
              activity — all in one place.
            </motion.p>
          </div>

          {/* Mark all read button */}
          <motion.div
            className="shrink-0 self-start md:self-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.22, ease: EASE_OUT_EXPO }}
          >
            <div className="w-fit p-[1.5px] bg-gradient-to-br from-[#2563EB] to-[#4F46E5] rounded-xl group hover:shadow-lg hover:shadow-blue-200 transition-shadow duration-300">
              <button
                onClick={handleMarkAllRead}
                disabled={stats.unread === 0 || isMarkingAllRead}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-[10px] text-[#2563EB] font-semibold text-sm transition-all duration-200 group-hover:bg-[#EFF6FF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95] whitespace-nowrap"
              >
                {isMarkingAllRead ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4" />
                )}
                Mark all as read
                {stats.unread > 0 && (
                  <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {stats.unread}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Decorative gradient line */}
        <motion.div
          className="w-full h-[1.5px] rounded-full mb-8 origin-left"
          style={{ background: 'linear-gradient(90deg, #2563EB, #4F46E5, transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE_OUT_EXPO }}
        />

        {/* ── 4 METRIC STAT CARDS ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
            : metricCards.map((card, i) => (
                <MetricCard key={card.label} {...card} delay={i * 0.05} />
              ))
          }
        </div>

        {/* ── MAIN LAYOUT ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[288px_1fr] gap-8 items-start">

          {/* LEFT: Category panel */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: EASE_OUT_EXPO }}
          >
            {isLoading ? (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonPulse key={i} className="h-9 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <CategoryPanel
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                stats={stats}
              />
            )}
          </motion.aside>

          {/* RIGHT: Notifications feed */}
          <main className="space-y-8 min-h-[60vh]">

            {/* ── Loading skeleton feed ────────────────────────────────────── */}
            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <NotificationCardSkeleton key={i} delay={i * 0.07} />
                ))}
              </div>
            )}

            {/* ── Live notification feed ───────────────────────────────────── */}
            {!isLoading && (
              <>
                {/* TODAY */}
                {today.length > 0 && (
                  <section>
                    <SectionLabel label="Today" count={today.length} />
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {today.map((notif, i) => (
                          <NotificationCardV2
                            key={notif.id}
                            notification={notif}
                            index={i}
                            onDismiss={dismissNotification}
                            onMarkRead={markAsRead}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* YESTERDAY */}
                {yesterday.length > 0 && (
                  <section>
                    <SectionLabel label="Yesterday" count={yesterday.length} />
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {yesterday.map((notif, i) => (
                          <NotificationCardV2
                            key={notif.id}
                            notification={notif}
                            index={today.length + i}
                            onDismiss={dismissNotification}
                            onMarkRead={markAsRead}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* OLDER */}
                {older.length > 0 && (
                  <section>
                    <SectionLabel label="Older" count={older.length} />
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {older.map((notif, i) => (
                          <NotificationCardV2
                            key={notif.id}
                            notification={notif}
                            index={i}
                            onDismiss={dismissNotification}
                            onMarkRead={markAsRead}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </section>
                )}

                {/* ── BentoCards Footer ── */}
                {activeFilter === 'all' && (
                  <BentoCards
                    weeklyStats={{
                      weeklyReads:     stats.weeklyReads,
                      weeklyCitations: stats.weeklyCitations,
                      weeklyBars:      stats.weeklyBars,
                    }}
                  />
                )}

                {/* ── Empty state ─────────────────────────────────────────── */}
                <AnimatePresence>
                  {totalFiltered === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center py-20"
                    >
                      <motion.div
                        className="w-20 h-20 bg-gradient-to-br from-[#EFF6FF] to-[#EDE9FE] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                      >
                        <Bell className="w-9 h-9 text-[#CBD5E1]" />
                      </motion.div>
                      <h3 className="text-[#0F172A] font-bold text-lg mb-2">
                        You're all caught up!
                      </h3>
                      <p className="text-[#94A3B8] text-sm max-w-xs mx-auto leading-relaxed">
                        No notifications found in this category. Check back later.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Load older button ───────────────────────────────────── */}
                {totalFiltered > 0 && (
                  <motion.div
                    className="py-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <button
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-[#E2E8F0] rounded-full text-[#475569] font-medium text-[14px] shadow-sm transition-all duration-200 hover:border-[#2563EB] hover:text-[#2563EB] hover:shadow-md group"
                    >
                      {isFetching ? (
                        <>
                          <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                          <span className="text-[#94A3B8]">Refreshing...</span>
                        </>
                      ) : (
                        <>
                          Refresh notifications
                          <ChevronDown className="w-4 h-4 group-hover:animate-icon-bounce" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
