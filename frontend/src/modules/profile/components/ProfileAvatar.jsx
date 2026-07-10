import React, { useRef } from 'react';
import { Camera } from 'lucide-react';

const ProfileAvatar = ({ imageUrl, onAvatarChange, editable = true }) => {
  const fallbackUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250&h=250';
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="relative group rounded-full overflow-hidden w-28 h-28 sm:w-36 sm:h-36 border-4 border-white shadow-lg bg-white flex-shrink-0">
      <img
        src={imageUrl || fallbackUrl}
        alt="Profile Avatar"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {editable && (
        <>
          <button
            type="button"
            onClick={handleButtonClick}
            className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </>
      )}
    </div>
  );
};

export default ProfileAvatar;
