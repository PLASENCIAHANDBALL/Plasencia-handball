// src/components/TeamOptions.tsx
import React, { useEffect, useState } from "react";
import { SelectItem } from "@/components/ui/select";

export default function TeamOptions({ category }:{category:string}) {
  const [list,setList]=useState<any[]>([]);
  useEffect(()=>{
    if(!category) { setList([]); return; }
    try{
      const raw = localStorage.getItem("plasencia-handball-app-v1");
      const parsed = raw? JSON.parse(raw): { teams: [] };
      const t = (parsed.teams||[]).filter((x:any)=> Array.isArray(x.categories) ? x.categories.includes(category) : x.category===category).filter((x:any)=>x.id);
      setList(t);
    }catch{ setList([]); }
  },[category]);
  return (
    <>
      {list.map(t=> <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
      {list.length===0 && <div className="px-2 py-1 text-sm text-slate-500">{category? 'No hay equipos en esta categoría' : 'Selecciona una categoría'}</div>}
    </>
  );
}
