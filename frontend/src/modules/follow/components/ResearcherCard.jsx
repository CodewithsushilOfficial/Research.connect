import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, GraduationCap, BookOpen, Users, HelpCircle, 
  ArrowRight, Check, Mail, Award, MapPin, Building2, 
  Briefcase, CheckCircle2, UserPlus, UserCheck, MessageSquare, Handshake
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import feedService from '../../../services/feed.service';
import UserAvatar from '../../../components/ui/Avatar';

const ResearcherCard = ({ researcher, currentUserId, onFollowChange, onCollaborate }) => {
  const navigate = useNavigate();
  const [showReasons, setShowReasons] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(researcher.isFollowing));
  const [followLoading, setFollowLoading] = useState(false);

  if (!researcher) return null;

  const targetId = researcher._id || researcher.userId;
  const name = researcher.fullName || researcher.name || `${researcher.firstName || ''} ${researcher.lastName || ''}`.trim() || 'Researcher';
  const targetSlug = researcher.profileSlug || researcher.username || targetId;
  const isSelf = currentUserId === targetId;

  const metrics = researcher.metrics || {};
  const pubCount = researcher.publicationsCount ?? metrics.publicationsCount ?? 0;
  const citCount = researcher.citationsCount ?? metrics.citationsCount ?? metrics.totalCitations ?? 0;
  const hIndex = researcher.hIndex ?? metrics.hIndex ?? 0;
  const i10Index = researcher.i10Index ?? metrics.i10Index ?? 0;

  const matchPercentage = researcher.matchPercentage || 50;
  const reasons = researcher.reasons || [];
  const researchAreas = researcher.researchAreas || [];
  const mutualFollowers = researcher.mutualFollowers || [];

  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    if (followLoading) return;
    setFollowLoading(true);
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);
    try {
      await feedService.toggleFollow(targetId);
      toast.success(newStatus ? `Following ${name}` : `Unfollowed ${name}`);
      onFollowChange?.(targetId, newStatus);
    } catch (error) {
      setIsFollowing(!newStatus);
      toast.error('Could not update follow status.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCardClick = () => {
    if (targetSlug) {
      navigate(`/profile/${targetSlug}`);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' }}
      transition={{ duration: 0.25 }}
      className="bg-bg-card rounded-2xl border border-border p-5 flex flex-col justify-between gap-4 text-left relative overflow-hidden transition-all duration-300 group hover:border-primary/40 shadow-sm"
    >
      {/* Top Bar: Match Score & Match Reasons toggle */}
      <div className="flex justify-between items-center w-full">
        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${getScoreBadge(matchPercentage)}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${matchPercentage >= 80 ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${matchPercentage >= 80 ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
          </span>
          <span>{matchPercentage}% Match</span>
        </div>

        {reasons.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowReasons(!showReasons); }}
            className="text-[10px] text-text-muted hover:text-primary font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Match analysis</span>
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Expandable Reasons Analysis */}
      <AnimatePresence>
        {showReasons && reasons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-surface border border-border rounded-xl p-3 text-xs font-semibold text-text-secondary space-y-1.5 overflow-hidden"
          >
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest pb-1 border-b border-border">Matching Factors</p>
            <ul className="space-y-1">
              {reasons.map((r, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Profile Info */}
      <div className="flex gap-3.5 items-start">
        <div className="cursor-pointer shrink-0" onClick={handleCardClick}>
          <UserAvatar user={researcher} size="xl" showBorder className="transition-transform duration-200 group-hover:scale-105" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={handleCardClick}
              className="text-base font-extrabold text-text-primary hover:text-primary cursor-pointer transition-colors leading-tight truncate"
            >
              {name}
            </h4>
            {researcher.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" title="Verified Researcher" />
            )}
          </div>

          <p className="text-xs text-text-secondary font-medium leading-snug line-clamp-1">
            {researcher.designation || researcher.headline || 'Academic Researcher'}
          </p>

          {(researcher.institution || researcher.department) && (
            <p className="text-[11px] text-text-muted font-medium flex items-center gap-1 pt-0.5 truncate">
              <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{[researcher.department, researcher.institution].filter(Boolean).join(' · ')}</span>
            </p>
          )}

          {researcher.country && (
            <p className="text-[10px] text-text-muted font-medium flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-text-muted shrink-0" />
              <span>{researcher.country}</span>
            </p>
          )}
        </div>
      </div>

      {/* Academic Metrics Summary Grid */}
      <div className="grid grid-cols-4 gap-1 bg-bg-surface rounded-xl p-2 border border-border text-center">
        <div>
          <p className="text-xs font-black text-text-primary">{pubCount}</p>
          <p className="text-[9px] font-bold text-text-muted uppercase">Pubs</p>
        </div>
        <div>
          <p className="text-xs font-black text-text-primary">{citCount}</p>
          <p className="text-[9px] font-bold text-text-muted uppercase">Citations</p>
        </div>
        <div>
          <p className="text-xs font-black text-text-primary">{hIndex}</p>
          <p className="text-[9px] font-bold text-text-muted uppercase">h-index</p>
        </div>
        <div>
          <p className="text-xs font-black text-text-primary">{i10Index}</p>
          <p className="text-[9px] font-bold text-text-muted uppercase">i10-index</p>
        </div>
      </div>

      {/* Research Areas / Tags */}
      {researchAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {researchAreas.slice(0, 3).map((area, idx) => (
            <span
              key={area._id || area.name || idx}
              className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider"
            >
              {typeof area === 'string' ? area : area.name}
            </span>
          ))}
        </div>
      )}

      {/* Availability / Mutuals Badge */}
      <div className="flex items-center justify-between text-[11px] text-text-muted pt-1 border-t border-border">
        {researcher.isAvailableForCollaboration ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Handshake className="w-3 h-3" />
            Open to Collaborate
          </span>
        ) : (
          <span className="text-[10px] text-text-muted font-medium italic">Academic Profile</span>
        )}

        {mutualFollowers.length > 0 && (
          <span className="text-[10px] font-bold text-text-muted">
            {mutualFollowers.length} mutual follower{mutualFollowers.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {!isSelf && (
          <>
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                isFollowing
                  ? 'bg-bg-surface text-text-secondary border border-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                  : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
              }`}
            >
              {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/messages?participantId=${targetId}`);
              }}
              className="py-2 px-3 bg-bg-surface hover:bg-bg-card text-text-primary border border-border hover:border-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
              title="Send Message"
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span>Message</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCollaborate?.(researcher);
              }}
              className="py-2 px-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              title="Invite to Collaborate"
            >
              <Handshake className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        <button
          onClick={handleCardClick}
          className="py-2 px-3 bg-bg-surface hover:bg-bg-card text-text-secondary hover:text-primary border border-border hover:border-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 ml-auto"
          title="View Full Profile"
        >
          <span>Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default ResearcherCard;
