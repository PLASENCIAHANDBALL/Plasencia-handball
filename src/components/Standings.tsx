// src/components/Standings.tsx
import React, { useMemo } from "react";
import TeamChip from "./TeamChip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Standings({ category, teams, matches }:{category:string, teams:any[], matches:any[]}) {
  const rows = useMemo(()=>{
    if(!category) return [];
    const pts=new Map(), gf=new Map(), ga=new Map(), pj=new Map();
    teams.filter(t=>Array.isArray(t.categories)&&t.categories.includes(category)).forEach(t=>{pts.set(t.id,0); gf.set(t.id,0); ga.set(t.id,0); pj.set(t.id,0);});
    matches.filter(m=>m.category===category && m.scoreA!=null && m.scoreB!=null).forEach(m=>{
      pj.set(m.a,(pj.get(m.a)||0)+1); pj.set(m.b,(pj.get(m.b)||0)+1);
      gf.set(m.a,(gf.get(m.a)||0)+m.scoreA); ga.set(m.a,(ga.get(m.a)||0)+m.scoreB);
      gf.set(m.b,(gf.get(m.b)||0)+m.scoreB); ga.set(m.b,(ga.get(m.b)||0)+m.scoreA);
      if(m.scoreA>m.scoreB) pts.set(m.a,(pts.get(m.a)||0)+3); else if(m.scoreB>m.scoreA) pts.set(m.b,(pts.get(m.b)||0)+3); else { pts.set(m.a,(pts.get(m.a)||0)+1); pts.set(m.b,(pts.get(m.b)||0)+1); }
    });
    const list=Array.from(pts.keys()).map(id=>({ id, team: teams.find(t=>t.id===id)?.name||'—', logo: teams.find(t=>t.id===id)?.logo||'', pj: pj.get(id)||0, gf: gf.get(id)||0, ga: ga.get(id)||0, dg: (gf.get(id)||0)-(ga.get(id)||0), pts: pts.get(id)||0 }));
    return list.sort((a,b)=> b.pts-a.pts || b.dg-a.dg || b.gf-a.gf || a.team.localeCompare(b.team));
  },[category,teams,matches]);
  if(!category) return <div className="text-slate-500">Selecciona una categoría arriba para ver la tabla.</div>;
  if(rows.length===0) return <div className="text-slate-500">Sin datos aún para {category}.</div>;
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Equipo</TableHead><TableHead className="text-right">PJ</TableHead><TableHead className="text-right">GF</TableHead><TableHead className="text-right">GC</TableHead><TableHead className="text-right">DG</TableHead><TableHead className="text-right">Pts</TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.map((r:any,i:number)=>(
            <TableRow key={r.id} className={i<3? 'bg-amber-50/60' : ''}><TableCell>{i+1}</TableCell><TableCell className="font-medium"><TeamChip team={{name:r.team, logo:r.logo}}/></TableCell><TableCell className="text-right">{r.pj}</TableCell><TableCell className="text-right">{r.gf}</TableCell><TableCell className="text-right">{r.ga}</TableCell><TableCell className="text-right">{r.dg}</TableCell><TableCell className="text-right font-semibold">{r.pts}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
