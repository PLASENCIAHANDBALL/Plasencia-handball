// src/components/EventManager.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EventManager({ events, setEvents, isAdmin }:{events:string[], setEvents:(e:string[])=>void, isAdmin:boolean}) {
  const [newEvent, setNewEvent] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input placeholder="Añadir evento (ej: Torneo 2)" value={newEvent} onChange={e=>setNewEvent(e.target.value)} disabled={!isAdmin}/>
        <Button onClick={()=>{ if(!newEvent) return; setEvents([...events,newEvent]); setNewEvent(""); }} disabled={!isAdmin}>Añadir</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {events.map(ev=>(
          <Badge key={ev} variant="secondary" className="flex items-center gap-2">
            {ev}{isAdmin && <button onClick={()=>setEvents(events.filter(x=>x!==ev))} className="text-slate-400 hover:text-slate-600">×</button>}
          </Badge>
        ))}
      </div>
    </div>
  );
}
