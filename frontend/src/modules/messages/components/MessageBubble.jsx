import React from 'react';
import { useSelector } from 'react-redux';
import { Reply, Edit2, FileText, Download } from 'lucide-react';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ message, onReply, onEditInit }) => {
  const user = useSelector((state) => state.auth.user);
  const isMine = message.senderId === user?._id || message.senderId?._id === user?._id;

  const timeString = formatTime(message.createdAt);

  // Render attachment or publication
  const renderAttachment = () => {
    if (message.type === 'publication' && message.text) {
      try {
        const pubData = JSON.parse(message.text);
        return (
          <div className="mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl max-w-sm">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold text-slate-800 line-clamp-2">{pubData.title}</p>
                {pubData.authors && <p className="text-[10px] text-slate-500 truncate">{pubData.authors}</p>}
              </div>
            </div>
          </div>
        );
      } catch (err) {
        return <p className="text-sm">{message.text}</p>;
      }
    }

    if (message.attachment || message.attachmentId) {
      const att = message.attachment || message.attachmentId;
      if (message.type === 'image' && att.url) {
        return (
          <div className="mt-1 rounded-xl overflow-hidden border border-slate-200/50 max-w-xs shadow-sm">
            <img src={att.url} alt="Attachment" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        );
      } else if (message.type === 'pdf' && att.url) {
        return (
          <a href={att.url} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors group max-w-xs">
            <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4 text-rose-700" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-rose-900 truncate">{att.filename || 'Document.pdf'}</p>
              <p className="text-[9px] text-rose-600 font-semibold uppercase">{att.size ? Math.round(att.size / 1024) + ' KB' : 'PDF'}</p>
            </div>
          </a>
        );
      }
    }

    return <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{message.text}</p>;
  };

  return (
    <div className={`flex flex-col group animate-in slide-in-from-bottom-1 duration-200 ${isMine ? 'items-end' : 'items-start'}`}>

      {/* Reply Context Bar */}
      {message.replyTo && (
        <div className={`flex items-center gap-1.5 mb-1 opacity-75 text-[10px] uppercase font-black tracking-wide ${isMine ? 'text-blue-600 mr-2' : 'text-slate-500 ml-2'}`}>
          <Reply className="w-3 h-3" />
          <span>Replied to {isMine ? 'them' : 'you'}</span>
        </div>
      )}

      {/* Main Bubble Content */}
      <div className={`relative flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>

        <div className={`relative px-3.5 py-2.5 shadow-sm min-w-[60px] max-w-full break-words
          ${isMine
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm border border-blue-500'
            : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200'
          }`}
        >
          {renderAttachment()}

          <div className={`flex items-center justify-end gap-1 mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
            <span className="text-[9px] font-bold select-none">{timeString}</span>
            {message.isEdited && <span className="text-[8px] italic ml-1 select-none">(edited)</span>}
            {isMine && message.isRead && <span className="text-[9px] font-bold text-blue-100 ml-1 select-none">· Read</span>}
          </div>
        </div>

        {/* Hover Actions (Reply, Edit) */}
        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <button onClick={onReply} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-450 hover:text-blue-600 transition-colors shadow-xs bg-white border border-slate-100" title="Reply">
            <Reply className="w-3.5 h-3.5" />
          </button>
          {isMine && (
            <button onClick={onEditInit} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-450 hover:text-amber-600 transition-colors shadow-xs bg-white border border-slate-100" title="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;
