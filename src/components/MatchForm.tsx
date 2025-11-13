// src/components/MatchForm.tsx
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MatchForm({ onSubmit, phases, events }:{onSubmit:(m:any)=>void, phases:string[], events:string[]}) {
  const [event,setEvent]=useState(events[0]||"");
  const [category,setCategory]=useState("");
  const [group,setGroup]=useState("");
  const [phase,setPhase]=useState(phases[0]||"");
  const [a,setA]=useState("");
  const [b,setB]=useState("");
  const [datetime,setDatetime]=useState(()=>new Date().toISOString().slice(0,16));
  const [court,setCourt]=useState("");
  useEffect(()=>{ if(events.length && !event) setEvent(events[0]); },[events]);
  return (
    <div className="space-y-2">
      <div><Label>Evento</Label>
        <Select value={event} onValueChange={setEvent}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{events.map(ev=> <SelectItem key={ev} value={ev}>{ev}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><Label>Fecha y hora</Label><Input type="datetime-local" value={datetime} onChange={e=>setDatetime(e.target.value)}/></div>
        <div><Label>Pista</Label><Input value={court} onChange={e=>setCourt(e.target.value)}/></div>
      </div>
      <div className="grid grid-cols-2 gap-2"><div><Label>Grupo</Label><Input value={group} onChange={e=>setGroup(e.target.value)}/></div>
      <div><Label>Fase</Label><Select value={phase} onValueChange={setPhase}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{phases.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="flex gap-2 justify-end"><Button onClick={()=>{ if(!event||!category) return onSubmit({ event, category, group, phase, a, b, datetime: new Date(datetime).toISOString(), court }); }}>Añadir</Button></div>
    </div>
  );
}
