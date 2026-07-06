export const CURRENT_USER = {
  id: 'user-me',
  fullName: 'You',
  avatarUrl: 'https://ui-avatars.com/api/?name=You'
};

export const MOCK_USERS = {
  'user-sarah': {
    id: 'user-sarah',
    fullName: 'Sarah Jenkins',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Jenkins'
  }
};

export const SARAH_AUTO_REPLIES = [
  "That sounds interesting! Could you share more details?",
  "I'm currently reviewing the documents, I'll get back to you shortly.",
  "Let's schedule a call to discuss this further.",
  "Thanks for the update, everything looks good on my end."
];

const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
};

export const formatLastSeen = (dateString) => {
  if (!dateString) return 'Offline';
  return 'Last seen recently';
};

export const formatConvTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isToday(date)) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday(date)) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const formatMsgTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
