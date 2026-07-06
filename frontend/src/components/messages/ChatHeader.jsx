import { useState, useRef, useEffect } from 'react';
import { Video, Phone, PhoneOff, Mic, MicOff, VideoOff, MoreVertical, ArrowLeft, User, Search, BellOff, Bell, Ban, Trash2, X, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMessaging } from '../../context/MessagingContext';
import { formatLastSeen } from '../../data/mockData';
import { toast } from 'react-hot-toast';

export default function ChatHeader() {
  const { activeConversation, getOtherParticipant, typingUsers, onlineUsers, selectConversation, searchQuery, setSearchQuery, deleteConversation, blockedUsers, toggleBlockUser, currentUserId } = useMessaging();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [activeCall, setActiveCall] = useState(null); // 'voice' | 'video'
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const menuRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeConversation) return null;

  const otherParticipant = getOtherParticipant(activeConversation.id);
  const typingUserIds = Array.from(typingUsers.get(activeConversation.id) || []);
  const isTyping = typingUserIds.some(id => id !== 'user-me' && id !== currentUserId);
  const isBlocked = otherParticipant ? blockedUsers.has(otherParticipant.id) : false;

  let title = '', avatarUrl = '', statusText = '', showOnlineDot = false;

  if (activeConversation.isGroup) {
    title = activeConversation.groupName;
    avatarUrl = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=64&h=64&fit=crop&q=80';
    statusText = isTyping ? 'Someone is typing…' : `${activeConversation.participants.length} members`;
  } else if (otherParticipant) {
    title = otherParticipant.fullName;
    avatarUrl = otherParticipant.avatarUrl;
    const isOnline = onlineUsers.has(otherParticipant.id);
    if (isTyping) {
      statusText = 'Typing…';
    } else if (isOnline) {
      statusText = 'Active Now';
      showOnlineDot = true;
    } else {
      statusText = `Last seen ${formatLastSeen(otherParticipant.lastSeen)}`;
    }
  }

  if (showSearch) {
    return (
      <header className="anim-header-reveal flex-shrink-0 h-[72px] px-6 flex items-center justify-between bg-white border-b border-[#E2E8F0] z-10 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2563EB]/20 to-transparent" />
        <div className="flex-1 flex items-center bg-[#F8FAFC] rounded-xl px-4 py-2.5 border border-[#E2E8F0] anim-fade-up">
          <Search size={18} className="text-[#94A3B8] mr-3" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in conversation..."
            className="flex-1 bg-transparent outline-none text-sm text-[#0F172A]"
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="p-1 hover:bg-[#E2E8F0] rounded-full text-[#64748B] transition-colors">
            <X size={16} />
          </button>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="anim-header-reveal flex-shrink-0 h-[72px] px-6 flex items-center justify-between bg-white border-b border-[#E2E8F0] z-10 relative">
        {/* Subtle gradient underline */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2563EB]/20 to-transparent" />

        {/* Left: Back (mobile) + Avatar + Edit button + Name */}
        <div className="flex items-center gap-2 anim-slide-up-stagger" style={{ animationDelay: '80ms' }}>
          {/* Back button */}
          <button
            onClick={() => selectConversation(null)}
            className="p-2 -ml-2 rounded-xl text-[#64748B] hover:bg-[#EEF2FF] hover:text-[#2563EB] transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div
            className="relative flex-shrink-0 group cursor-pointer"
            onClick={() => !activeConversation.isGroup && otherParticipant && navigate(`/profile/${otherParticipant.username || otherParticipant.id}`)}
          >
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#DBEAFE] shadow-sm group-hover:ring-[#2563EB] transition-colors duration-300">
              {avatarUrl && <img src={avatarUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
            </div>
            {showOnlineDot && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#22C55E] border-2 border-white rounded-full pulse-online" />
            )}
          </div>

          {/* Edit pencil button — always visible on desktop */}
          <button
            aria-label="Edit chat"
            onClick={() => {
              setIsEditingTitle(true);
              setEditedTitle(title);
              setTimeout(() => editInputRef.current?.focus(), 50);
            }}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EEF2FF] transition-all duration-200 flex-shrink-0"
            title="Edit chat name"
          >
            <Pencil size={15} />
          </button>

          {/* Title / Inline Rename */}
          <div>
            {isEditingTitle ? (
              <form
                className="flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsEditingTitle(false);
                  toast.success('Chat name updated');
                }}
              >
                <input
                  ref={editInputRef}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-sm font-bold text-[#0F172A] border-b-2 border-[#2563EB] bg-transparent outline-none w-40"
                  onBlur={() => setIsEditingTitle(false)}
                />
                <button type="submit" className="p-1 rounded-full hover:bg-[#DCFCE7] text-[#22C55E] transition-colors">
                  <Check size={14} />
                </button>
              </form>
            ) : (
              <div
                className="cursor-pointer group"
                onClick={() => !activeConversation.isGroup && otherParticipant && navigate(`/profile/${otherParticipant.username || otherParticipant.id}`)}
              >
                <h3 className="text-sm font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors duration-300">{title}</h3>
                <p className={`text-xs font-medium flex items-center gap-1.5 mt-0.5
                ${showOnlineDot ? 'text-[#22C55E]' : isTyping ? 'text-[#4F46E5]' : 'text-[#94A3B8]'}`}>
                  {showOnlineDot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block" />
                  )}
                  {isTyping ? (
                    <span className="flex items-center gap-1">
                      Typing
                      <span className="flex items-center gap-[3px] ml-0.5">
                        <span className="w-1 h-1 rounded-full bg-[#4F46E5] typing-dot" />
                        <span className="w-1 h-1 rounded-full bg-[#4F46E5] typing-dot" />
                        <span className="w-1 h-1 rounded-full bg-[#4F46E5] typing-dot" />
                      </span>
                    </span>
                  ) : statusText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1 anim-slide-up-stagger" style={{ animationDelay: '180ms' }}>
          <button
            aria-label="Video call"
            onClick={() => setActiveCall('video')}
            className="btn-icon-ripple w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF2FF] transition-all duration-300 hover:scale-110 hover:shadow-sm group"
          >
            <Video className="w-[18px] h-[18px] group-hover:rotate-12 transition-transform duration-300" />
          </button>
          <button
            aria-label="Voice call"
            onClick={() => setActiveCall('voice')}
            className="btn-icon-ripple w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF2FF] transition-all duration-300 hover:scale-110 hover:shadow-sm group"
          >
            <Phone className="w-[18px] h-[18px] group-hover:rotate-12 transition-transform duration-300" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="More options"
              className="btn-icon-ripple w-10 h-10 rounded-full flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF2FF] transition-all duration-300 hover:scale-110 hover:shadow-sm group"
            >
              <MoreVertical className="w-[18px] h-[18px] group-hover:rotate-12 transition-transform duration-300" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-[#E2E8F0] py-2 z-50 anim-fade-up">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (otherParticipant?.id) navigate(`/profile/user/${otherParticipant.id}`);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-3 transition-colors"
                >
                  <User size={16} className="text-[#94A3B8]" /> View Profile
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowSearch(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-3 transition-colors"
                >
                  <Search size={16} className="text-[#94A3B8]" /> Search in Conversation
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMuted(!isMuted);
                    toast.success(isMuted ? 'Notifications unmuted' : 'Notifications muted');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-3 transition-colors"
                >
                  {isMuted ? <Bell size={16} className="text-[#94A3B8]" /> : <BellOff size={16} className="text-[#94A3B8]" />}
                  {isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </button>
                <div className="h-px bg-[#E2E8F0] my-1.5" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (otherParticipant) {
                      toggleBlockUser(otherParticipant.id);
                      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
                    }
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors ${isBlocked ? 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]' : 'text-red-600 hover:bg-red-50'
                    }`}
                >
                  <Ban size={16} className={isBlocked ? "text-[#94A3B8]" : ""} />
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    deleteConversation(activeConversation.id);
                    toast.success('Chat deleted');
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={16} /> Delete Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Call UI Modal */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/80 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900/60 border border-slate-700 w-full max-w-sm rounded-[2.5rem] p-8 py-12 flex flex-col items-center shadow-2xl overflow-hidden relative"
            >
              {/* Pulsing background rings */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <motion.div
                  animate={{ scale: [1, 2, 2.5], opacity: [0.3, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="w-32 h-32 bg-blue-500 rounded-full absolute"
                />
                <motion.div
                  animate={{ scale: [1, 2, 2.5], opacity: [0.3, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                  className="w-32 h-32 bg-indigo-500 rounded-full absolute"
                />
              </div>

              {/* Avatar */}
              <div className="relative z-10 w-28 h-28 rounded-full overflow-hidden border-4 border-slate-800 shadow-xl mb-6">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <User size={40} className="text-slate-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <h2 className="relative z-10 text-2xl font-bold text-white mb-1 text-center">{title}</h2>
              <p className="relative z-10 text-slate-400 mb-12 text-sm font-medium">
                {activeCall === 'video' ? 'Calling...' : 'Ringing...'}
              </p>

              {/* Controls */}
              <div className="relative z-10 flex items-center justify-center gap-5 w-full mt-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg
                    ${isMicMuted ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white hover:bg-slate-700 backdrop-blur-md'}`}
                  aria-label="Toggle Microphone"
                >
                  {isMicMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setActiveCall(null);
                    setIsMicMuted(false);
                    setIsVideoOff(false);
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30"
                  aria-label="End Call"
                >
                  <PhoneOff size={26} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (activeCall === 'voice') setActiveCall('video');
                    else setIsVideoOff(!isVideoOff);
                  }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-lg
                    ${isVideoOff ? 'bg-white text-slate-900' : 'bg-slate-800/80 text-white hover:bg-slate-700 backdrop-blur-md'}`}
                  aria-label="Toggle Video"
                >
                  {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
