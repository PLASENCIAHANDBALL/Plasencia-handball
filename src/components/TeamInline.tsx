// src/components/TeamInline.tsx
import React from "react";
import TeamChip from "./TeamChip";

export default function TeamInline({a,b}:{a:any,b:any}){
  return (
    <span className="inline-flex items-center gap-2">
      <TeamChip team={a} size={22}/>
      <span className="text-slate-400">vs</span>
      <TeamChip team={b} size={22}/>
    </span>
  );
}
