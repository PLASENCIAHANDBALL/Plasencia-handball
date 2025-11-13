// src/components/BackgroundArt.tsx
import React from "react";

export default function BackgroundArt() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-200 via-slate-100 to-white" />
      <div className="absolute -top-24 -left-24 w-[60vw] h-[60vw] rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 blur-3xl" />
      <svg
        className="absolute inset-0 w-full h-full opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="20" />
          </filter>
        </defs>

        <rect x="10%" y="15%" width="80%" height="70%" rx="24" fill="#7dd3fc" filter="url(#blur)" />
        <rect x="10%" y="49%" width="80%" height="2%" fill="#ffffff" filter="url(#blur)" />
        <rect x="10%" y="42%" width="3%" height="16%" fill="#ef4444" filter="url(#blur)" />
        <rect x="87%" y="42%" width="3%" height="16%" fill="#ef4444" filter="url(#blur)" />
      </svg>
    </div>
  );
}
