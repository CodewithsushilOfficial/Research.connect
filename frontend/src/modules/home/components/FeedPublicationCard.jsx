import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Heart, Bookmark, Share2, Eye, Download, Quote,
  FileText, Tag, Calendar, Building2, ExternalLink,
  ChevronDown, ChevronUp, CheckCircle2, BookOpen, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Avatar from '../../../components/ui/Avatar';
import feedService from '../../../services/feed.service';
import { toggleLikeInFeed, toggleBookmarkInFeed } from '../../../redux/slices/feedSlice';

const formatCount = (n) => {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

const FeedPublicationCard = ({ pub, onFollowAuthor }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector(s => s.auth.user);

  const [liked, setLiked] = useState(pub.liked ?? false);
  const [bookmarked, setBookmarked] = useState(pub.bookmarked ?? false);
  const [likeCount, setLikeCount] = useState(pub.likes ?? pub.likesCount ?? 0);
  const [showAbstract, setShowAbstract] = useState(false);

  /* Author details */
  const author = pub.userId || {};
  const authorName = author.fullName
    || (author.firstName ? `${author.firstName} ${author.lastName || ''}`.trim() : null)
    || (pub.authors ? pub.authors.split(',')[0].trim() : 'Researcher');
  const authorImage = author.profileImage?.url || author.profileImage || '';
  const authorSlug = author.slug || author.profileSlug || author.username || author._id;
  const institution = author.institution || pub.institution || 'Academic Institute';
  const pubYear = pub.year || (pub.createdAt ? new Date(pub.createdAt).getFullYear() : '2026');

  /* Venue / Journal */
  const venue = pub.journal || pub.conference || pub.publication || pub.publisher || '';
  const readingTime = pub.readingTime || Math.max(3, Math.ceil((pub.abstract?.length || 500) / 100));
  const researchScore = pub.researchScore || pub.score || 20;

  const handleLike = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await feedService.toggleLike(pub._id);
      const next = !liked;
      setLiked(next);
      setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
      dispatch(toggleLikeInFeed(pub._id));
    } catch {
      toast.error('Could not update like.');
    }
  }, [liked, pub._id, dispatch]);

  const handleBookmark = useCallback(async (e) => {
    e.stopPropagation();
    try {
      await feedService.toggleBookmark(pub._id);
      const next = !bookmarked;
      setBookmarked(next);
      dispatch(toggleBookmarkInFeed(pub._id));
      toast.success(next ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      toast.error('Could not bookmark.');
    }
  }, [bookmarked, pub._id, dispatch]);

  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/publications/${pub.slug || pub._id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Could not copy link.');
    }
  }, [pub.slug, pub._id]);

  const handleOpen = useCallback(() => {
    if (pub.slug) navigate(`/publications/${pub.slug}`);
    else if (pub._id) navigate(`/publications/${pub._id}`);
  }, [pub.slug, pub._id, navigate]);

  const handleAuthorClick = useCallback((e) => {
    e.stopPropagation();
    if (authorSlug) navigate(`/profile/${authorSlug}`);
  }, [authorSlug, navigate]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
      className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-left space-y-3.5 group"
    >
      {/* Top Row: Author Metadata & Score Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleAuthorClick}
            className="shrink-0 ring-2 ring-transparent hover:ring-primary/30 rounded-full transition-all"
          >
            <Avatar src={authorImage} name={authorName} size="md" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAuthorClick}
                className="font-extrabold text-sm text-text-primary hover:text-primary transition-colors truncate"
              >
                {authorName}
              </button>
              <CheckCircle2 size={14} className="text-primary shrink-0 fill-primary/10" />
            </div>
            <p className="text-xs text-text-muted truncate">
              {institution} • {pubYear}
            </p>
          </div>
        </div>

        {/* Score Badge matching Image 2 */}
        <div className="bg-light-blue border border-light-blue px-3 py-1 rounded-full text-xs font-extrabold text-primary shrink-0 flex items-center gap-1">
          <Quote size={12} className="text-primary" />
          Score: {researchScore}
        </div>
      </div>

      {/* Title */}
      <h3
        onClick={handleOpen}
        className="font-black text-lg text-text-primary leading-snug cursor-pointer group-hover:text-primary transition-colors"
      >
        {pub.title || 'Untitled Research Publication'}
      </h3>

      {/* Abstract Preview */}
      {pub.abstract && (
        <div className="space-y-1">
          <p className={`text-xs text-text-secondary leading-relaxed ${!showAbstract ? 'line-clamp-2' : ''}`}>
            {pub.abstract}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAbstract(v => !v);
            }}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            {showAbstract ? (
              <>Hide Abstract <ChevronUp size={13} /></>
            ) : (
              <>Read Abstract <ChevronDown size={13} /></>
            )}
          </button>
        </div>
      )}

      {/* Metadata Pill Row (Journal & Reading Time) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {venue && (
          <span className="text-[11px] font-semibold bg-bg-surface text-text-secondary border border-border px-3 py-1 rounded-md">
            Journal: {venue}
          </span>
        )}
        <span className="text-[11px] font-semibold bg-bg-surface text-text-secondary border border-border px-2.5 py-1 rounded-md flex items-center gap-1">
          <Clock size={11} className="text-text-muted" />
          {readingTime} min read
        </span>
      </div>

      {/* Keyword Tags Row */}
      {pub.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pub.keywords.slice(0, 5).map((kw, i) => (
            <span
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?q=${encodeURIComponent(kw)}`);
              }}
              className="text-[11px] font-bold text-primary bg-light-blue/70 hover:bg-primary hover:text-white border border-light-blue px-2.5 py-0.5 rounded-full cursor-pointer transition-all"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Metrics & Actions Row */}
      <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
        {/* Left Stats & Actions */}
        <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors ${
              liked ? 'text-accent-red font-bold' : 'hover:text-text-primary'
            }`}
          >
            <Heart size={15} className={liked ? 'fill-accent-red text-accent-red' : ''} />
            <span>{formatCount(likeCount)}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 transition-colors ${
              bookmarked ? 'text-primary font-bold' : 'hover:text-text-primary'
            }`}
          >
            <Bookmark size={15} className={bookmarked ? 'fill-primary text-primary' : ''} />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
          >
            <Share2 size={15} />
          </button>
        </div>

        {/* Read Button */}
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition-all"
        >
          <ExternalLink size={13} />
          Read
        </button>
      </div>
    </motion.article>
  );
};

export default FeedPublicationCard;
