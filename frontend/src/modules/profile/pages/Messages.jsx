import React, { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const Messages = () => {
  const { profile } = useOutletContext();
  const navigate = useNavigate();
  
  // Optional: Automatically start a chat with this user
  // For now, we'll just redirect to messages page
  useEffect(() => {
    // If you want to automatically start a chat, you could navigate to `/messages/${profile.id}`
    // But since the new UI handles conversation creation differently, navigating to `/messages` is safe.
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
      <MessageSquare className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
      <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
        Chat with {profile?.displayName || 'Researcher'}
      </h3>
      <p className="text-sm text-slate-500 max-w-md text-center mb-6">
        The messaging system has been upgraded to a dedicated page for a better experience.
      </p>
      <button 
        onClick={() => navigate('/messages')}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95"
      >
        Open Messages
      </button>
    </div>
  );
};

export default Messages;
