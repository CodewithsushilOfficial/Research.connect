import { useEffect, useState } from 'react';
import { useMessaging } from '../../context/MessagingContext';
import { ConversationSkeleton } from './Skeletons';
import ConversationItem from './ConversationItem';
import { CURRENT_USER } from '../../data/mockData';
import { MessageSquare, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ConversationsList() {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    isLoadingConversations,
    loadConversations,
    createConversation
  } = useMessaging();

  const [filterQuery, setFilterQuery] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!userIdInput.trim()) return;
    setIsStartingChat(true);
    try {
      await createConversation(userIdInput.trim());
      setUserIdInput('');
      toast.success('Conversation started!');
    } catch (err) {
      toast.error(err.message || 'Failed to start chat. Check the User ID.');
    } finally {
      setIsStartingChat(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    let displayName = '';
    if (conv.isGroup) {
      displayName = conv.groupName || '';
    } else {
      const otherParticipant = conv.participants.find(p => p.id !== CURRENT_USER.id);
      displayName = otherParticipant ? otherParticipant.fullName : '';
    }
    return displayName.toLowerCase().includes(filterQuery.toLowerCase());
  });

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <section className="w-full h-full flex flex-col">
      {/* Header */}
      <div
        className="anim-conv-header px-5 py-5 border-b border-[#E8EDF5] flex items-center gap-3 flex-shrink-0 group hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        style={{ animationDelay: '30ms' }}
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] flex items-center justify-center shadow-sm shadow-blue-200 group-hover:shadow-blue-300 group-hover:scale-105 transition-all duration-300">
          <MessageSquare size={15} className="text-white group-hover:-rotate-12 transition-transform duration-300" />
        </div>
        <h2 className="font-bold text-lg text-[#0F172A] tracking-tight group-hover:text-[#2563EB] transition-colors">Messages</h2>
        {conversations.length > 0 && (
          <span className="ml-auto text-[11px] font-bold text-[#2563EB] bg-[#EEF2FF] px-2 py-0.5 rounded-full group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300 shadow-sm">
            {conversations.length}
          </span>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-5 py-3 border-b border-[#E8EDF5] bg-white flex-shrink-0">
        <div className="flex items-center bg-[#F8FAFC] rounded-xl px-3.5 py-2 border border-[#E2E8F0] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all duration-200">
          <Search size={15} className="text-[#94A3B8] mr-2 flex-shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full bg-transparent outline-none text-xs text-[#0F172A] placeholder-[#94A3B8]"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="p-0.5 hover:bg-[#E2E8F0] rounded-full text-[#64748B] transition-colors flex-shrink-0"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Start Chat by User ID */}
      <div className="px-5 py-3 border-b border-[#E8EDF5] bg-[#F8FAFC]/50 flex-shrink-0">
        <form onSubmit={handleStartChat} className="flex gap-2">
          <div className="flex-1 flex items-center bg-white rounded-xl px-3.5 py-2 border border-[#E2E8F0] focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all duration-200 shadow-sm">
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Start chat with user ID..."
              className="w-full bg-transparent outline-none text-xs text-[#0F172A] placeholder-[#94A3B8]"
            />
          </div>
          <button
            type="submit"
            disabled={isStartingChat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all flex-shrink-0 disabled:opacity-50"
          >
            {isStartingChat ? '...' : 'Chat'}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingConversations ? (
          <>
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center anim-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-[#4F46E5]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">No conversations yet</p>
            <p className="text-xs text-[#94A3B8] mt-1">Start a new chat with a researcher</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center anim-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
              <Search size={24} className="text-[#94A3B8]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">No matches found</p>
            <p className="text-xs text-[#94A3B8] mt-1">Try searching for a different researcher</p>
          </div>
        ) : (
          filteredConversations.map((conv, i) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
              currentUserId={CURRENT_USER.id}
              onClick={selectConversation}
              animDelay={i * 70}
            />
          ))
        )}
      </div>
    </section>
  );
}
