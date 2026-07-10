import React from "react";
import { AVATAR_COLORS, avatarInitials } from "../data";

export default function Avatar({ seed, index }) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white text-[11px] font-semibold text-white ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
      title={seed}
    >
      {avatarInitials(seed)}
    </div>
  );
}