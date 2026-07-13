import React from 'react';
import { Camera } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';

/**
 * ProfileAvatar
 * Shows the profile photo with a hover-overlay "Change" button.
 * Clicking the button calls onAvatarChange() — which opens the ImageUploadModal upstream.
 * No file picking logic here; all that lives in ProfileOverview.
 */
const ProfileAvatar = ({ imageUrl, name, onAvatarChange, editable = true, uploading = false }) => {
  return (
    <div className="relative group rounded-full overflow-hidden w-28 h-28 sm:w-36 sm:h-36 border-4 border-white shadow-lg bg-white flex-shrink-0">
      {/* Profile image */}
      <Avatar
        src={imageUrl}
        name={name}
        size="full"
        className="transition-transform duration-500 group-hover:scale-105"
      />

      {/* Upload loading spinner */}
      {uploading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Hover overlay — opens the ImageUploadModal */}
      {editable && !uploading && (
        <button
          type="button"
          onClick={() => onAvatarChange && onAvatarChange()}
          className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar;
