// src/components/TeamForm.tsx
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

const CATS = [
  "Alevín Femenino","Alevín Masculino","Infantil Femenino","Infantil Masculino",
  "Cadete Femenino","Cadete Masculino","Juvenil Femenino","Juvenil Masculino"
];

export default function TeamForm({ onSubmit }:{onSubmit:(t:any)=>void}) {
  const [name,setName]=useState(""); const [cats,setCats]=useState<string[]>([]); const [club,setClub]=useState(""); const [notes,setNotes]=useState(""); const [logo,setLogo]=useState("");
  const toggle = (c:string)=> setCats(prev=> prev.includes(c)? prev.filter(x=>x!==c): [...prev,c]);
  function onLogoFile(e:any){ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>setLogo(String(r.result)); r.readAsDataURL(f); }
  return (
    <div className="space-y-2">
      <div><Label>Nombre</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Plasencia HB"/></div>
      <div><Label>Escudo (URL)</Label><Input value={logo} onChange={e=>setLogo(e.target.value)} placeholder="https://..." /></div>
      <div><Label>Categorías</Label>
        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-auto p-2 border rounded">{CATS.map(c=>(
          <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cats.includes(c)} onChange={()=>toggle(c)}/> {c}</label>
        ))}</div>
      </div>
      <div><Label>Club</Label><Input value={club} onChange={e=>setClub(e.target.value)}/></div>
      <div><Label>Notas</Label><Textarea value={notes} onChange={e=>setNotes(e.target.value)}/></div>
      <div className="flex gap-2"><Button onClick={()=>{ if(!name||cats.length===0) return alert('Nombre y categoría'); onSubmit({name,logo,categories:cats,club,notes}); setName(''); setCats([]); setClub(''); setNotes(''); setLogo('');}}><ImageIcon className="w-4 h-4"/> Añadir</Button></div>
    </div>
  );
}
