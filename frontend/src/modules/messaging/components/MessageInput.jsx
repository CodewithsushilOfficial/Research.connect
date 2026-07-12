import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Paperclip, Smile, FileText, X, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import messagesService from '../services/messages.service';
import publicationService from '../../../services/publication.service';

const QUICK_EMOJIS = ['😀', '👍', '❤️', '🔥', '👏', '🙌', '💡', '📝', '🎓', '🔬', '📊'];

const MessageInput = ({ conversationId, onSend, replyContext, onClearReply, editContext, onClearEdit, socket }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showPubDropdown, setShowPubDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showCitationHelper, setShowCitationHelper] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Load user's publications for sharing
  const { data: pubsData } = useQuery({
    queryKey: ['myPublicationsForSharing'],
    queryFn: async () => {
      const res = await publicationService.getMyPublications({ limit: 10 });
      return res.data;
    },
    enabled: showPubDropdown
  });

  const publicationsList = pubsData?.docs || [];

  // When editContext changes, set the text input
  useEffect(() => {
    if (editContext) {
      setText(editContext.text || '');
    } else {
      setText('');
    }
  }, [editContext]);

  // Handle typing emissions
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket && conversationId) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('chat:typing', { conversationId });
      }

      // Debounce stop typing signal
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('chat:stopTyping', { conversationId });
      }, 2000);
    }
  };

  // Upload attachment file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce 100MB limit
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size cannot exceed 100MB.');
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await messagesService.uploadAttachment(formData);
      if (res.success) {
        setAttachedFile(res.data);
        toast.success(`Attached: ${file.name}`);
      } else {
        toast.error('File upload failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !attachedFile) return;

    if (editContext) {
      // Call edit
      onSend({
        action: 'edit',
        messageId: editContext._id,
        text: text.trim()
      });
    } else {
      // Send message
      onSend({
        action: 'send',
        text: text.trim(),
        attachmentId: attachedFile?._id,
        replyTo: replyContext?._id,
        type: attachedFile ? (attachedFile.fileType.startsWith('image/') ? 'image' : 'pdf') : 'text'
      });
    }

    // Reset input
    setText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    if (isTyping && socket && conversationId) {
      setIsTyping(false);
      socket.emit('chat:stopTyping', { conversationId });
    }
  };

  const handleSharePublication = (pub) => {
    const meta = {
      title: pub.title,
      slug: pub.slug,
      authors: pub.authors ? pub.authors.join(', ') : '',
      journal: pub.journal || ''
    };

    onSend({
      action: 'send',
      text: JSON.stringify(meta),
      type: 'publication'
    });

    setShowPubDropdown(false);
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
  };

  return (
    <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-2 relative z-25">
      {/* AI & Citation Assistant bar */}
      <div className="flex gap-2 mb-1">
        <button
          onClick={() => setShowAiAssistant(!showAiAssistant)}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-150" /> AI Assistant
        </button>
        <button
          onClick={() => setShowCitationHelper(!showCitationHelper)}
          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100 transition-all cursor-pointer"
        >
          <GraduationCap className="w-3 h-3 text-teal-500 fill-teal-150" /> Citation Helper
        </button>
      </div>

      {showAiAssistant && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-1 text-[10px] animate-in fade-in slide-in-from-top-1 duration-150">
          <button 
            onClick={() => { setText("Hi, following up on our previous discussion regarding collaboration. Let me know your thoughts."); setShowAiAssistant(false); }}
            className="px-2 py-1 bg-white hover:bg-indigo-50 border border-indigo-200/50 rounded-lg text-slate-600 font-bold cursor-pointer"
          >
            ✉️ Follow-up message
          </button>
          <button 
            onClick={() => { setText("Hi, would you mind reviewing my latest publication draft when you get a chance? I would appreciate your feedback."); setShowAiAssistant(false); }}
            className="px-2 py-1 bg-white hover:bg-indigo-50 border border-indigo-200/50 rounded-lg text-slate-600 font-bold cursor-pointer"
          >
            📝 Request Paper Review
          </button>
          <button 
            onClick={() => { setText("Hi, are you available for a quick voice/video call sometime this week to discuss research ideas?"); setShowAiAssistant(false); }}
            className="px-2 py-1 bg-white hover:bg-indigo-50 border border-indigo-200/50 rounded-lg text-slate-600 font-bold cursor-pointer"
          >
            📞 Invite to Call
          </button>
        </div>
      )}

      {showCitationHelper && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-teal-50/50 border border-teal-100 rounded-xl mb-1 text-[10px] animate-in fade-in slide-in-from-top-1 duration-150">
          <button 
            onClick={() => { setText(prev => prev + " (Smith et al., 2026)"); setShowCitationHelper(false); }}
            className="px-2 py-1 bg-white hover:bg-teal-50 border border-teal-200/50 rounded-lg text-slate-600 font-bold cursor-pointer"
          >
            🎓 APA (Short)
          </button>
          <button 
            onClick={() => { setText(prev => prev + " Smith, A., & Jones, B. (2026). Deep Learning for Molecular Design. Journal of Computational Chemistry, 47(3), 112-120. DOI: 10.1002/jcc.27182"); setShowCitationHelper(false); }}
            className="px-2 py-1 bg-white hover:bg-teal-50 border border-teal-200/50 rounded-lg text-slate-600 font-bold cursor-pointer"
          >
            📚 Full APA Citation
          </button>
        </div>
      )}
      
      {/* Reply Scope Preview */}
      {replyContext && (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-150 px-3.5 py-2 rounded-2xl animate-in slide-in-from-bottom-2 duration-150">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
            Replying to: <span className="italic text-slate-700">"{replyContext.text}"</span>
          </span>
          <button onClick={onClearReply} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer">
            <X className="w-3.5 h-3.5 text-slate-550" />
          </button>
        </div>
      )}

      {/* Edit Scope Preview */}
      {editContext && (
        <div className="flex justify-between items-center bg-amber-50 border border-amber-150 px-3.5 py-2 rounded-2xl animate-in slide-in-from-bottom-2 duration-150">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
            Editing message
          </span>
          <button onClick={onClearEdit} className="p-0.5 hover:bg-amber-100 rounded-full cursor-pointer">
            <X className="w-3.5 h-3.5 text-amber-750" />
          </button>
        </div>
      )}

      {/* Attached file bar */}
      {attachedFile && (
        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-150 px-3.5 py-2 rounded-2xl animate-in slide-in-from-bottom-2 duration-150">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide truncate max-w-[250px]">
            Attachment: {attachedFile.filename}
          </span>
          <button onClick={() => setAttachedFile(null)} className="p-0.5 hover:bg-emerald-100 rounded-full cursor-pointer">
            <X className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Input controls bar */}
      <div className="flex items-center gap-2.5 relative">
        {/* Rounded Pill Wrapper */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white rounded-full transition-all shadow-inner relative">
          
          {/* Smiley Emoji Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 text-slate-450 hover:text-blue-600 transition-colors cursor-pointer"
              title="Add Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Inline Quick Emojis */}
            {showEmojiPicker && (
              <div className="absolute bottom-11 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-base p-1 hover:bg-slate-50 hover:scale-125 rounded-md transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text Area inside Pill */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={editContext ? "Edit message..." : "Type a message..."}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder-slate-400 resize-none max-h-24 overflow-y-auto py-1"
          />

          {/* Attachment uploader inside Pill */}
          <label className="p-1 text-slate-450 hover:text-blue-600 transition-colors cursor-pointer relative">
            <Paperclip className="w-4 h-4" />
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="hidden" 
              disabled={uploadingFile || !!editContext}
            />
            {uploadingFile && (
              <span className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </span>
            )}
          </label>

          {/* Share Publication Button inside Pill */}
          {!editContext && (
            <div className="relative">
              <button
                onClick={() => setShowPubDropdown(!showPubDropdown)}
                className="p-1 text-slate-450 hover:text-blue-600 transition-colors cursor-pointer"
                title="Share Publication"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Publication Dropdown */}
              {showPubDropdown && (
                <div className="absolute bottom-11 right-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 max-h-60 overflow-y-auto space-y-2 text-left animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-1">
                    <h6 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                      Share a Publication
                    </h6>
                    <button onClick={() => setShowPubDropdown(false)} className="p-0.5 hover:bg-slate-150 rounded-full cursor-pointer">
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                  {publicationsList.length > 0 ? (
                    publicationsList.map((pub) => (
                      <div 
                        key={pub._id}
                        onClick={() => handleSharePublication(pub)}
                        className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl cursor-pointer transition-colors text-left space-y-0.5"
                      >
                        <p className="text-[11px] font-black text-slate-800 line-clamp-1">{pub.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                          {pub.authors ? pub.authors.join(', ') : 'Me'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold py-4 text-center">
                      No publications found to share
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Circular Send Button outside Pill */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !attachedFile}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-750 hover:scale-105 active:scale-95 disabled:scale-100 transition-all text-white rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4 fill-white text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
