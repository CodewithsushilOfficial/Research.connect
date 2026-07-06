import { useState, useRef, useEffect } from 'react';
import { Paperclip, PlusCircle, Smile, Send, X, Image, Cloud } from 'lucide-react';
import { useMessaging } from '../../context/MessagingContext';
import { messagingApi } from '../../services/messagingApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageInput() {
  const { activeConversationId, sendMessage, setUserTyping, getOtherParticipant, blockedUsers, toggleBlockUser } = useMessaging();
  const [inputVal, setInputVal] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    if (activeConversationId) {
      setUserTyping(activeConversationId, 'user-me', true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setUserTyping(activeConversationId, 'user-me', false);
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (activeConversationId) setUserTyping(activeConversationId, 'user-me', false);
    };
  }, [activeConversationId, setUserTyping]);

  const handleSend = () => {
    const trimmed = inputVal.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isUploading) { toast.error('Please wait for uploads to finish'); return; }
    sendMessage(activeConversationId, trimmed, attachments);
    setInputVal('');
    setAttachments([]);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setUserTyping(activeConversationId, 'user-me', false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = null;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const att = await messagingApi.uploadFile(file, (p) => setUploadProgress(p));
      setAttachments(prev => [...prev, att]);
    } catch {
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeAttachment = (id) => setAttachments(prev => prev.filter(a => a.id !== id));

  const canSend = (inputVal.trim() || attachments.length > 0) && !isUploading;

  const otherParticipant = getOtherParticipant(activeConversationId);
  const isBlocked = otherParticipant ? blockedUsers.has(otherParticipant.id) : false;

  if (isBlocked) {
    return (
      <footer className="anim-footer bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-6 flex-shrink-0 flex flex-col items-center justify-center gap-2">
        <p className="text-sm font-medium text-[#64748B]">You have blocked this user.</p>
        <button 
          onClick={() => toggleBlockUser(otherParticipant.id)} 
          className="text-xs font-semibold text-[#2563EB] hover:text-[#4F46E5] hover:underline"
        >
          Unblock to send a message
        </button>
      </footer>
    );
  }

  return (
    <footer className="anim-footer bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-4 pt-3 pb-5 flex-shrink-0 flex flex-col gap-2 relative z-20 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.04)]">
      {/* Upload Progress */}
      {isUploading && (
        <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden mx-1">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${uploadProgress}%`,
              background: 'linear-gradient(90deg, #2563EB, #4F46E5)',
            }}
          />
        </div>
      )}

      {/* Attachment Chips */}
      <div className="flex flex-wrap gap-2 px-1">
        <AnimatePresence>
          {attachments.map((att, idx) => (
            <motion.div
              key={att.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.05 }}
              className="flex items-center gap-1.5 bg-[#EEF2FF] border border-[#C7D2FE] px-3 py-1.5 rounded-full text-xs font-semibold text-[#4F46E5]"
            >
              <span className="truncate max-w-[150px]">{att.fileName}</span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 hover:bg-[#C7D2FE] rounded-full transition-colors text-[#6366F1] hover:text-[#0F172A]"
              >
                <X size={11} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Row */}
      <motion.div
        animate={isFocused ? { scale: 1.01, y: -2 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative flex items-center gap-2 px-3 py-2.5 rounded-2xl transition-all duration-300
          ${isFocused 
            ? 'bg-white shadow-[0_8px_30px_-4px_rgba(37,99,235,0.15)] ring-2 ring-blue-500/20' 
            : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'}`}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

        {/* Attachment */}
        <motion.button
          whileHover={{ scale: 1.15, rotate: [0, -15, 15, -15, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          whileTap={{ scale: 0.85 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0"
          aria-label="Attach file"
        >
          <Paperclip size={17} />
        </motion.button>

        {/* Plus */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.15, rotate: 180 }}
            whileTap={{ scale: 0.85, rotate: 90 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0 
              ${showPlusMenu ? 'text-blue-600 bg-blue-50 rotate-90' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
            aria-label="Add attachment"
          >
            <PlusCircle size={17} />
          </motion.button>
          
          <AnimatePresence>
          {showPlusMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-[#E2E8F0] overflow-hidden z-50"
            >
              <button 
                onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors border-b border-[#F1F5F9]"
              >
                <Image size={18} className="text-[#2563EB]" />
                Photo & Video
              </button>
              <button 
                onClick={() => { 
                  window.open('https://drive.google.com', '_blank');
                  toast.success("Opening Google Drive..."); 
                  setShowPlusMenu(false); 
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
              >
                <Cloud size={18} className="text-[#16A34A]" />
                Google Drive
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Text Input */}
        <input
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal py-1.5 px-2 tracking-wide"
          placeholder="Type a message or share a link…"
          type="text"
          disabled={isUploading}
        />

        {/* Emoji */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.15, y: -2, rotate: [0, -20, 20, -20, 0] }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            whileTap={{ scale: 0.85, y: 2 }}
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors flex-shrink-0
              ${showEmojiMenu ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
            aria-label="Add emoji"
          >
            <Smile size={17} />
          </motion.button>

          <AnimatePresence>
          {showEmojiMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full right-0 mb-2 p-3 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-[#E2E8F0] grid grid-cols-4 gap-2 z-50"
            >
              {['😀', '😂', '❤️', '👍', '🙌', '🔥', '🎉', '💡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => { setInputVal(prev => prev + emoji); setShowEmojiMenu(false); }}
                  className="w-9 h-9 flex items-center justify-center hover:bg-[#F8FAFC] rounded-lg text-xl transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Send Button */}
        <motion.button
          whileHover={canSend ? { scale: 1.1, y: -2 } : { rotate: [0, -5, 5, -5, 0], transition: { duration: 0.2 } }}
          whileTap={canSend ? { scale: 0.9, y: 2 } : { scale: 1 }}
          onClick={handleSend}
          disabled={!canSend}
          className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-white flex-shrink-0 transition-all duration-300
            ${canSend 
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] hover:shadow-[0_12px_25px_-6px_rgba(79,70,229,0.6)]' 
              : 'bg-slate-200/70 cursor-not-allowed text-slate-400'}`}
          aria-label="Send message"
        >
          <motion.div
            initial={false}
            animate={canSend ? { x: 0, y: 0, rotate: 0 } : { x: -2, y: 2, rotate: -10 }}
            whileHover={canSend ? { x: 2, y: -2 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Send size={15} />
          </motion.div>
        </motion.button>
      </motion.div>
    </footer>
  );
}
