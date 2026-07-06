import React, { useState } from 'react';
import { Building2, Eye, Quote, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MinimalResultCard = ({ result, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Default mock data if result is incomplete
  const data = {
    id: result?.id,
    profileSlug: result?.profileSlug,
    name: result?.name || 'Researcher Name',
    initials: result?.initials || 'RN',
    role: result?.role || 'Researcher (academic) at Research Connect',
    affiliation: result?.affiliation || 'sds - cse - ggsipu',
    type: result?.type || 'RESEARCHER',
    verified: result?.verified !== false,
    views: result?.views || 0,
    citations: result?.citations || 0,
    avatar: result?.avatar || null
  };

  const handleCardClick = () => {
    if (data.profileSlug) {
      navigate(`/profile/${data.profileSlug}`);
    } else if (data.id) {
      navigate(`/profile/${data.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative w-full bg-white rounded-[28px] p-6 border transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer opacity-0 animate-card-rise group/card
        ${isHovered ? 'border-[#2563EB] shadow-[0_12px_40px_rgba(37,99,235,0.12)] -translate-y-[4px]' : 'border-[#E2E8F0] shadow-sm hover:shadow-md'}
      `}
      style={{ animationDelay: `${index * 120}ms`, animationFillMode: 'forwards' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top right - Verified Badge */}
      {data.verified && (
        <div className="absolute top-6 right-6 transition-transform duration-300 group-hover/card:scale-105 group-hover/card:-translate-y-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#DCFCE7] to-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0] text-[10px] font-extrabold tracking-widest uppercase shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </div>
        </div>
      )}

      <div className="flex items-start gap-5 mb-8">
        {/* Avatar */}
        <div className="relative w-[56px] h-[56px] rounded-full flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.2,0.64,1)] group-hover/card:scale-[1.15] group-hover/card:rotate-3 group-hover/card:shadow-md">
          {data.avatar ? (
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover rounded-full border-2 border-white shadow-sm ring-1 ring-[#BFDBFE]"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm ring-1 ring-[#BFDBFE]">
              {data.initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 pr-24 pt-0.5">
          <div className="inline-block px-3 py-1 bg-[#DBEAFE] text-[#2563EB] rounded-full text-[10px] font-extrabold tracking-widest uppercase mb-2.5 transition-all duration-300 group-hover/card:bg-[#2563EB] group-hover/card:text-white shadow-sm">
            {data.type}
          </div>
          <h3 className={`text-[22px] font-black mb-1.5 transition-colors duration-300 ${isHovered ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
            {data.name}
          </h3>
          <p className="text-[#475569] text-[14.5px] leading-relaxed font-medium transition-colors duration-300 group-hover/card:text-[#334155]">
            {data.role}
          </p>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#F1F5F9] transition-colors duration-300 group-hover/card:border-[#E2E8F0]">
        <div className="flex items-center gap-2.5 text-[13px] font-semibold text-[#64748B] transition-colors duration-300 group-hover/card:text-[#475569]">
          <div className="w-7 h-7 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center transition-all duration-300 group-hover/card:bg-[#DBEAFE] group-hover/card:border-[#BFDBFE] group-hover/card:rotate-[-5deg] group-hover/card:scale-110">
            <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
          </div>
          {data.affiliation}
        </div>

        <div className="flex items-center gap-3 text-[13px] font-bold text-[#2563EB]">
          <div className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] transition-all duration-300 group-hover/card:border-[#BFDBFE] group-hover/card:shadow-sm hover:!border-[#2563EB] cursor-pointer">
            <Eye className="w-4 h-4 opacity-70" />
            <span>{data.views} Views</span>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] hover:bg-white px-3.5 py-2 rounded-xl border border-[#E2E8F0] transition-all duration-300 group-hover/card:border-[#BFDBFE] group-hover/card:shadow-sm hover:!border-[#2563EB] cursor-pointer">
            <Quote className="w-4 h-4 opacity-70" />
            <span>{data.citations} Citations</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalResultCard;
