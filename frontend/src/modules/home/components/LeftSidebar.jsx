import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home, BookOpen, Bookmark, FolderKanban,
  Network, MessageSquare, TrendingUp, User,
  ChevronRight, FlaskConical
} from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';

const NAV_ITEMS = [
  { label: 'Home Feed',      icon: Home,           path: '/home' },
  { label: 'My Publications',icon: BookOpen,        path: '/publications' },
  { label: 'Bookmarks',      icon: Bookmark,        path: '/bookmarks' },
  { label: 'Projects',       icon: FolderKanban,    path: '/projects' },
  { label: 'Network',        icon: Network,         path: '/connections' },
  { label: 'Messages',       icon: MessageSquare,   path: '/messages' },
  { label: 'Research',       icon: FlaskConical,    path: '/search' },
];

const StatPill = ({ label, value, color = 'text-primary' }) => (
  <div className="flex flex-col items-center p-2.5 bg-bg-surface rounded-xl border border-border">
    <span className={`text-base font-black ${color}`}>{value ?? '—'}</span>
    <span className="text-[10px] text-text-muted font-medium mt-0.5 text-center">{label}</span>
  </div>
);

const LeftSidebar = ({ scholarData }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, profile } = useSelector(s => s.auth);

  if (!user) return null;

  const fullName     = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const designation  = profile?.designation || user.designation || 'Researcher';
  const institution  = profile?.institution || user.institution || '';
  const department   = profile?.department  || '';
  const avatarSrc    = profile?.profileImage?.url || profile?.profileImage || user.profileImage?.url || user.profileImage || '';
  const slug         = user.slug || user.profileSlug || user.username || user._id;
  const completion   = profile?.profileCompletion ?? user.profileCompletion ?? 0;
  const researchScore = profile?.metrics?.researchScore ?? 0;

  // Scholar metrics
  const citations = scholarData?.profile?.totalCitations ?? scholarData?.profile?.citations ?? 0;
  const hIndex    = scholarData?.profile?.hIndex ?? 0;
  const i10Index  = scholarData?.profile?.i10Index ?? 0;

  // Research areas (up to 4)
  const areas = (profile?.researchAreas || []).slice(0, 4);

  return (
    <aside className="space-y-4">
      {/* ── Profile card ─────────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        {/* Banner */}
        <div className="h-16 bg-gradient-to-r from-primary/20 via-accent-indigo/15 to-accent-indigo/5" />

        <div className="px-4 pb-4">
          {/* Avatar overlapping banner */}
          <div className="-mt-7 mb-3">
            <button onClick={() => navigate(`/profile/${slug}`)}>
              <Avatar
                src={avatarSrc}
                name={fullName}
                size="xl"
                className="ring-4 ring-bg-card"
              />
            </button>
          </div>

          <button
            onClick={() => navigate(`/profile/${slug}`)}
            className="text-left group w-full"
          >
            <h2 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors leading-tight">
              {fullName}
            </h2>
          </button>
          <p className="text-xs text-text-secondary mt-0.5 truncate">{designation}</p>
          {institution && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{institution}</p>
          )}
          {department && (
            <p className="text-[11px] text-text-muted truncate">{department}</p>
          )}

          {/* Profile completion bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-semibold text-text-muted">Profile complete</span>
              <span className="text-[10px] font-bold text-primary">{completion}%</span>
            </div>
            <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent-indigo rounded-full transition-all duration-700"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Research areas */}
          {areas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {areas.map((area, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium bg-light-blue text-primary px-2 py-0.5 rounded-full border border-light-blue"
                >
                  {typeof area === 'string' ? area : area.name || area.area}
                </span>
              ))}
            </div>
          )}

          {/* View profile CTA */}
          <button
            onClick={() => navigate(`/profile/${slug}`)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-primary bg-light-blue hover:bg-primary hover:text-white border border-light-blue hover:border-primary rounded-xl py-2 transition-all duration-200"
          >
            <User size={13} />
            View Profile
          </button>
        </div>
      </div>

      {/* ── Metrics ────────────────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-2xl p-4">
        <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={13} className="text-primary" />
          Your Impact
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Citations"     value={citations}     color="text-primary" />
          <StatPill label="h-index"       value={hIndex}        color="text-accent-indigo" />
          <StatPill label="Research Score" value={researchScore} color="text-accent-green" />
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-2xl p-3">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} className={isActive ? 'text-primary' : 'text-text-muted'} />
                  {label}
                </span>
                {isActive && <ChevronRight size={13} className="text-primary" />}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default LeftSidebar;
