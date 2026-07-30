import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ExternalLink, X, BookOpen, Building2 } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';

/**
 * CoAuthorsSection — Reusable Co-Authors widget with "View All" modal capability.
 *
 * Features:
 *  - Displays up to 5 co-authors in compact list/grid.
 *  - Real profile images (Cloudflare R2 / Avatar component).
 *  - "View All" button opens a full modal showcasing all co-authors loaded from MongoDB.
 *  - Reused on both Home Feed Right Sidebar and Profile Page.
 */
const CoAuthorsSection = ({ coAuthors = [], title = 'Co-Authors', subhead = 'Academic Collaboration Network' }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!coAuthors || coAuthors.length === 0) {
    return null; // Hide cleanly if no co-authors
  }

  const initialList = coAuthors.slice(0, 5);
  const hasMore = coAuthors.length > 5;

  const handleCoAuthorClick = (co) => {
    if (co.profileSlug) {
      setIsModalOpen(false);
      navigate(`/profile/${co.profileSlug}`);
    } else if (co.profileURL) {
      window.open(co.profileURL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-text-primary tracking-tight uppercase flex items-center gap-1.5">
            <Users size={14} className="text-accent-indigo" />
            {title}
          </h3>
          {subhead && (
            <p className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider">
              {subhead}
            </p>
          )}
        </div>
        <span className="text-[10px] font-bold text-text-muted bg-bg-surface border border-border px-2.5 py-0.5 rounded-full">
          {coAuthors.length} total
        </span>
      </div>

      {/* Initial 5 Co-Authors List */}
      <div className="space-y-2.5">
        {initialList.map((co, idx) => (
          <div
            key={co._id || idx}
            onClick={() => handleCoAuthorClick(co)}
            className="p-2.5 bg-bg-surface hover:bg-bg-card border border-border hover:border-primary/40 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={co.profileImage || co.photo}
                name={co.fullName || co.name}
                size="sm"
                className="shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                  {co.fullName || co.name}
                </h4>
                <p className="text-[10px] text-text-muted truncate">
                  {co.institution || co.affiliation || co.designation || 'Academic Researcher'}
                </p>
              </div>
            </div>

            {co.sharedPublicationsCount > 0 && (
              <span className="text-[10px] font-bold text-accent-indigo bg-light-purple px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <BookOpen size={10} />
                {co.sharedPublicationsCount}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* View All Button */}
      {coAuthors.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full text-xs font-semibold text-text-secondary hover:text-primary bg-bg-surface hover:bg-bg-card border border-border hover:border-primary py-2.5 rounded-xl transition-all text-center"
        >
          View All Co-Authors ({coAuthors.length})
        </button>
      )}

      {/* View All Co-Authors Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-text-primary flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    All Co-Authors ({coAuthors.length})
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Academic collaborators and co-authors loaded from MongoDB.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-surface rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="p-5 overflow-y-auto space-y-3 flex-1">
                {coAuthors.map((co, idx) => (
                  <div
                    key={co._id || idx}
                    onClick={() => handleCoAuthorClick(co)}
                    className="p-3.5 bg-bg-surface hover:bg-bg-card border border-border hover:border-primary/40 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={co.profileImage || co.photo}
                        name={co.fullName || co.name}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                            {co.fullName || co.name}
                          </h4>
                          {co.profileSlug && (
                            <span className="text-[10px] font-bold text-primary bg-light-blue px-2 py-0.5 rounded-full">
                              Member
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted truncate mt-0.5 flex items-center gap-1">
                          <Building2 size={11} className="shrink-0" />
                          {co.institution || co.affiliation || 'Academic Institution'}
                        </p>
                        {co.researchAreas?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {co.researchAreas.slice(0, 3).map((area, i) => (
                              <span key={i} className="text-[9px] bg-bg-card border border-border text-text-muted px-2 py-0.5 rounded-full">
                                {typeof area === 'string' ? area : area.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {co.sharedPublicationsCount > 0 && (
                        <span className="text-xs font-bold text-accent-indigo bg-light-purple px-2.5 py-1 rounded-full flex items-center gap-1">
                          <BookOpen size={12} />
                          {co.sharedPublicationsCount} shared
                        </span>
                      )}
                      <ExternalLink size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-border bg-bg-surface flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-bg-card border border-border text-text-primary rounded-xl hover:border-primary transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoAuthorsSection;
