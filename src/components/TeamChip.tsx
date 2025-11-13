// src/components/TeamChip.tsx
import React from "react";

export default function TeamChip({team, size=28}:{team:any, size?:number}){
  const src = team?.logo || "";
  const initials = (team?.name||"?").split(" ").map((w:string)=>w[0]).slice(0,2).join("").toUpperCase();
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center justify-center bg-white/80 rounded-full border shadow-sm" style={{width:size, height:size}}>
        {src? (<img src={src} alt={team?.name||'escudo'} className="w-full h-full rounded-full object-cover"/>) : (
          <span className="text-[10px] font-semibold text-slate-700">{initials}</span>
        )}
      </span>
      <span className="truncate max-w-[180px]">{team?.name||'—'}</span>
    </span>
  );
}
