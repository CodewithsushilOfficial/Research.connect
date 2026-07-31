import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare, ThumbsUp, Reply, Trash2, Edit2, Loader2, Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import publicationService from '../../../services/publication.service';
import { useSelector } from 'react-redux';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import UserAvatar from '../../../components/ui/Avatar';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const CommentInput = ({ onSubmit, placeholder = 'Write a comment…', loading, autoFocus = false }) => {
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={2}
        className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all text-slate-700 placeholder:text-slate-400 bg-white"
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e); }}
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3 py-2 rounded-xl transition-all h-9 shrink-0"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
      </button>
    </form>
  );
};

const SingleComment = ({ comment, publicationId, currentUserId, depth = 0 }) => {
  const queryClient = useQueryClient();
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const commentAuthorId = comment.userId?._id || comment.userId;
  const isOwner = currentUserId && String(commentAuthorId) === String(currentUserId);

  const addMutation = useMutation({
    mutationFn: ({ content, parentId }) => publicationService.addComment(publicationId, content, parentId),
    onSuccess: () => { queryClient.invalidateQueries(['comments', publicationId]); setShowReply(false); },
    onError: () => toast.error('Could not post reply.'),
  });

  const editMutation = useMutation({
    mutationFn: ({ content }) => publicationService.editComment(comment._id, content),
    onSuccess: () => { queryClient.invalidateQueries(['comments', publicationId]); setEditing(false); },
    onError: () => toast.error('Could not edit comment.'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => publicationService.deleteComment(comment._id),
    onSuccess: () => { queryClient.invalidateQueries(['comments', publicationId]); toast.success('Deleted.'); },
    onError: () => toast.error('Could not delete comment.'),
  });

  const likeMutation = useMutation({
    mutationFn: () => publicationService.toggleLikeComment(comment._id),
    onSuccess: () => queryClient.invalidateQueries(['comments', publicationId]),
  });

  const authorObj = typeof comment.userId === 'object' ? comment.userId : {};
  const displayName = authorObj.fullName || `${authorObj.firstName || ''} ${authorObj.lastName || ''}`.trim() || authorObj.username || 'Researcher';
  const avatarSrc = authorObj.profileImage?.url || authorObj.profileImage || '';
  const liked = comment.likes?.includes?.(currentUserId) || comment.likedBy?.includes?.(currentUserId);
  const likeCount = comment.likes?.length || comment.likesCount || 0;

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-6 sm:ml-8 border-l-2 border-slate-100 pl-3 pt-2' : ''}`}>
      <UserAvatar src={avatarSrc} name={displayName} size="sm" showBorder />

      <div className="flex-1 min-w-0">
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800 truncate">{displayName}</span>
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          {editing ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-blue-400 bg-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditing(false)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editMutation.mutate({ content: editText })}
                  disabled={editMutation.isPending || !editText.trim()}
                  className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          )}
        </div>

        {/* Action bar */}
        {!editing && (
          <div className="flex items-center gap-4 mt-1.5 px-1">
            <button
              onClick={() => likeMutation.mutate()}
              className={`inline-flex items-center gap-1 text-[11px] font-bold transition-colors ${
                liked ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              {likeCount > 0 && <span>{likeCount}</span>}
              Like
            </button>

            {currentUserId && (
              <button
                onClick={() => setShowReply(v => !v)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Reply
              </button>
            )}

            {isOwner && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-600 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply Input */}
        {showReply && (
          <div className="mt-2">
            <CommentInput
              autoFocus
              placeholder="Write a reply…"
              loading={addMutation.isPending}
              onSubmit={(content) => addMutation.mutate({ content, parentId: comment._id })}
            />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <SingleComment
                key={reply._id}
                comment={reply}
                publicationId={publicationId}
                currentUserId={currentUserId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection = ({ publicationId }) => {
  const queryClient = useQueryClient();
  const auth = useAuth();
  const reduxUser = useSelector(s => s.auth?.user);

  let storedUser = null;
  try {
    const saved = localStorage.getItem('user');
    if (saved) storedUser = JSON.parse(saved);
  } catch (e) {}

  const currentUser = auth?.user || reduxUser || storedUser;
  const currentUserId = currentUser?._id || currentUser?.id;
  const token = auth?.token || useSelector(s => s.auth?.token) || localStorage.getItem('token');
  const isAuthenticated = !!token;

  const { socket } = useSocket();

  // Listen for live comment updates via Socket.IO
  useEffect(() => {
    if (!socket || !publicationId) return;

    const handleCommentEvent = (data) => {
      if (data?.publicationId === publicationId || data?.publicationId?.toString() === publicationId?.toString()) {
        queryClient.invalidateQueries(['comments', publicationId]);
      }
    };

    socket.on('comment:new', handleCommentEvent);
    socket.on('comment:like', handleCommentEvent);
    socket.on('comment:reply', handleCommentEvent);
    socket.on('comment:delete', handleCommentEvent);

    return () => {
      socket.off('comment:new', handleCommentEvent);
      socket.off('comment:like', handleCommentEvent);
      socket.off('comment:reply', handleCommentEvent);
      socket.off('comment:delete', handleCommentEvent);
    };
  }, [socket, publicationId, queryClient]);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', publicationId],
    queryFn: async () => {
      const res = await publicationService.getComments(publicationId);
      return res.success ? res.data : [];
    },
    enabled: !!publicationId,
    staleTime: 10_000,
  });

  const addMutation = useMutation({
    mutationFn: ({ content }) => publicationService.addComment(publicationId, content, null),
    onSuccess: () => queryClient.invalidateQueries(['comments', publicationId]),
    onError: () => toast.error('Could not post comment.'),
  });

  const topLevel = comments.filter(c => !c.parentId);
  const total = comments.length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-extrabold text-slate-800">
          Discussion
          {total > 0 && (
            <span className="ml-1.5 text-xs font-bold text-slate-400">({total})</span>
          )}
        </h3>
      </div>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <div className="flex gap-3">
          <UserAvatar
            src={currentUser?.profileImage?.url || currentUser?.profileImage}
            name={currentUser?.fullName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username}
            size="sm"
            showBorder
          />
          <div className="flex-1">
            <CommentInput
              placeholder="Share your thoughts on this publication…"
              loading={addMutation.isPending}
              onSubmit={(content) => addMutation.mutate({ content })}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 text-center py-3 bg-slate-50 rounded-xl border border-slate-100">
          Sign in to join the discussion
        </p>
      )}

      {/* Comment List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-8 space-y-2 bg-slate-50/50 rounded-xl border border-slate-100">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">No comments yet. Be the first to comment.</p>
        </div>
      ) : (
        <div className="space-y-5 divide-y divide-slate-100">
          {topLevel.map(c => (
            <div key={c._id} className="pt-4 first:pt-0">
              <SingleComment
                comment={c}
                publicationId={publicationId}
                currentUserId={currentUserId}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
