// src/components/PhaseManager.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PhaseManager({ phases, setPhases, isAdmin }:{phases:string[], setPhases:(p:string[])=>void, isAdmin:boolean}) {
  const [newPhase,setNewPhase]=useState("");
  return (
    <div className="space-y-2">
      <div className="flex gap-2"><Input placeholder="Añadir fase (ej: Fase de grupos E)" value={newPhase} onChange={e=>setNewPhase(e.target.value)} disabled={!isAdmin}/><Button onClick={()=>{ if(!newPhase) return; setPhases([...phases,newPhase]); setNewPhase(""); }} disabled={!isAdmin}>Añadir</Button></div>
      <div className="flex flex-wrap gap-2">{phases.map(p=> <Badge key={p} variant="secondary" className="flex items-center gap-2">{p}{isAdmin && <button onClick={()=>setPhases(phases.filter(x=>x!==p))} className="text-slate-400 hover:text-slate-600">×</button>}</Badge>)}</div>
    </div>
  );
}
