import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import publicationService from '../../../services/publication.service';
import feedService from '../../../services/feed.service';
import UserAvatar from '../../../components/ui/Avatar';

const RelatedResearchersPanel = ({ publicationId }) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState({});

  const { data: researchers = [], isLoading } = useQuery({
    queryKey: ['related-researchers', publicationId],
    queryFn: async () => {
      const res = await publicationService.getRelatedResearchers(publicationId, 5);
      return res.success ? res.data : [];
    },
    enabled: !!publicationId,
    staleTime: 5 * 60 * 1000,
  });

  const handleFollow = async (userId, name) => {
    try {
      await feedService.toggleFollow(userId);
      setFollowing(prev => ({ ...prev, [userId]: !prev[userId] }));
      toast.success(following[userId] ? 'Unfollowed' : `Following ${name}`);
    } catch {
      toast.error('Could not update follow status.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Users size={14} className="text-blue-600" />
          RELATED RESEARCHERS
        </h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      ) : researchers.length === 0 ? (
        <div className="text-center py-6 space-y-2 bg-slate-50 rounded-xl border border-slate-100">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-400 font-medium">No related researchers found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {researchers.map((r) => {
            const slug = r.profileSlug || r._id;
            const isFollowing = following[r.userId || r._id];

            return (
              <div
                key={r._id}
                className="p-3 bg-slate-50/60 border border-slate-100 rounded-xl space-y-2.5 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => navigate(`/profile/${slug}`)}
                    className="shrink-0"
                  >
                    <UserAvatar src={r.avatar || r.profileImage} name={r.fullName || r.name} size="md" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => navigate(`/profile/${slug}`)}
                      className="font-bold text-xs text-slate-800 hover:text-blue-600 transition-colors text-left truncate block w-full"
                    >
                      {r.fullName || r.name}
                    </button>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {r.designation || 'Researcher'}{r.institution ? ` · ${r.institution}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {r.publicationCount > 0 && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <BookOpen size={11} /> {r.publicationCount} pubs
                        </span>
                      )}
                      {r.citationCount > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {r.citationCount} citations
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleFollow(r.userId || r._id, r.fullName || r.name)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      isFollowing
                        ? 'bg-white text-slate-600 border border-slate-200 hover:text-red-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={() => navigate(`/messages?participantId=${r.userId || r._id}`)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-1 bg-white"
                  >
                    <Mail size={13} />
                    Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RelatedResearchersPanel;
