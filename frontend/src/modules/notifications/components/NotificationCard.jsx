import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Trash2, Eye, Circle, Mail, Users, FileText, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import notificationsService from '../services/notifications.service';

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
};

const getNotificationIcon = (type) => {
  const baseClass = "w-4 h-4";
  if (type.startsWith('follow')) return <Sparkles className={`${baseClass} text-indigo-500`} />;
  if (type.startsWith('connection')) return <Users className={`${baseClass} text-blue-500`} />;
  if (type.startsWith('publication')) return <FileText className={`${baseClass} text-emerald-500`} />;
  if (type.startsWith('comment') || type.startsWith('mention')) return <MessageSquare className={`${baseClass} text-pink-500`} />;
  return <Mail className={`${baseClass} text-slate-400`} />;
};

const NotificationCard = ({ notification }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { _id, actorId, title, message, isRead, createdAt, targetUrl } = notification;

  const actorName = actorId ? `${actorId.firstName} ${actorId.lastName}` : 'Someone';
  const actorImage = actorId?.profileImage?.url || actorId?.profileImage;

  // Mark read mutation
  const markReadMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.markAsRead(_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.deleteNotification(_id);
    },
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handleCardClick = () => {
    if (!isRead) {
      markReadMutation.mutate();
    }
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <div 
      className={`group p-4 md:p-5 rounded-2xl transition-all duration-300 flex items-start justify-between gap-4 text-left relative overflow-hidden backdrop-blur-md ${
        isRead 
          ? 'bg-white/80 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]' 
          : 'bg-blue-50/40 border border-blue-100 hover:bg-blue-50/60 hover:border-blue-200 hover:shadow-[0_4px_20px_rgb(59,130,246,0.06)]'
      }`}
    >
      {/* Unread indicator dot */}
      {!isRead && (
        <span className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
      )}

      <div className="flex gap-4 items-start cursor-pointer flex-1 min-w-0" onClick={handleCardClick}>
        {/* Actor Avatar / Icon stack */}
        <div className="relative shrink-0 mt-0.5">
          <img
            src={actorImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
            alt={actorName}
            className={`w-12 h-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 shadow-sm ${
              !isRead ? 'ring-2 ring-blue-100 ring-offset-2' : 'ring-1 ring-slate-200'
            }`}
          />
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md shadow-slate-200/50 border border-slate-100 flex items-center justify-center transform group-hover:-rotate-12 transition-transform duration-300">
            {getNotificationIcon(notification.type)}
          </div>
          {!isRead && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full shadow-sm" />
          )}
        </div>

        {/* Message details */}
        <div className="space-y-1 flex-1 min-w-0 pr-8">
          <h4 className={`text-sm font-black leading-tight transition-colors duration-200 ${
            !isRead ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-800 group-hover:text-blue-600'
          }`}>
            {title}
          </h4>
          <p className={`text-[12px] font-medium leading-relaxed break-words ${
            !isRead ? 'text-slate-600' : 'text-slate-500'
          }`}>
            {message}
          </p>
          <span className="text-[10px] font-bold text-slate-400 block pt-1 tracking-wide uppercase">
            {formatTimeAgo(createdAt)}
          </span>
          {notification.type === 'publication_uploaded' && (
            <div className="flex flex-wrap gap-2 pt-3.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  if (!isRead) markReadMutation.mutate();
                  if (targetUrl) navigate(targetUrl);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" /> Read Publication
              </button>
              <button
                onClick={() => {
                  if (!isRead) markReadMutation.mutate();
                  if (actorId) navigate(`/profile/${actorId.profileSlug || actorId.username}`);
                }}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5" /> View Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0 self-center absolute right-3 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-sm border border-white/50">
        {!isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              markReadMutation.mutate();
            }}
            disabled={markReadMutation.isPending}
            className="p-2 bg-white hover:bg-blue-50 text-blue-500 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95"
            title="Mark as Read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          className="p-2 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-95"
          title="Delete Notification"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
export { formatTimeAgo };
