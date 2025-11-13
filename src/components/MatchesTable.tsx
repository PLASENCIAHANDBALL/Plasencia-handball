// src/components/MatchesTable.tsx
import React from "react";
import TeamInline from "./TeamInline";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Save, Play, ExternalLink } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StreamEmbed from "./StreamEmbed";

export default function MatchesTable({ matches, teamsById, isAdmin, updateMatch, removeMatch }:{matches:any[], teamsById:any, isAdmin:boolean, updateMatch:(id:string,p:any)=>void, removeMatch:(id:string)=>void}) {
  return (
    <Card className="backdrop-blur-xl bg-white/70 border-slate-200/60 shadow-lg">
      <CardHeader className="flex-row items-center justify-between">
        <div>Partidos ({matches.length})</div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead><TableHead>Partido</TableHead><TableHead>Marcador</TableHead><TableHead>Directo</TableHead><TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((m:any)=>(
              <TableRow key={m.id}>
                <TableCell>{new Date(m.datetime).toLocaleString()}</TableCell>
                <TableCell><TeamInline a={teamsById[m.a]} b={teamsById[m.b]} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={m.scoreA ?? ""} onChange={e=>updateMatch(m.id,{scoreA: e.currentTarget.value===""? null : Number(e.currentTarget.value)})} className="w-16" disabled={!isAdmin}/>
                    <span>-</span>
                    <Input type="number" value={m.scoreB ?? ""} onChange={e=>updateMatch(m.id,{scoreB: e.currentTarget.value===""? null : Number(e.currentTarget.value)})} className="w-16" disabled={!isAdmin}/>
                    {isAdmin && <Button variant="outline" size="icon" onClick={()=>updateMatch(m.id,{scoreA:null,scoreB:null})}><Save className="w-4 h-4"/></Button>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isAdmin ? <Input placeholder="URL" value={m.streamUrl||""} onChange={e=>updateMatch(m.id,{streamUrl:e.currentTarget.value})} className="w-60"/> : <Input value={m.streamUrl||""} className="w-60" readOnly/>}
                    <Dialog><DialogTrigger asChild><Button variant="secondary" size="sm" className="gap-2"><Play className="w-4 h-4"/>Ver</Button></DialogTrigger><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>Directo</DialogTitle></DialogHeader><StreamEmbed url={m.streamUrl}/></DialogContent></Dialog>
                    {!!m.streamUrl && <a href={m.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm underline"><ExternalLink className="w-4 h-4"/>Abrir</a>}
                  </div>
                </TableCell>
                <TableCell className="text-right">{isAdmin? <Button variant="destructive" size="sm" onClick={()=>removeMatch(m.id)}><Trash2 className="w-4 h-4"/> Borrar</Button> : <span className="text-slate-400 text-xs">—</span>}</TableCell>
              </TableRow>
            ))}
            {matches.length===0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-500">No hay partidos</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
