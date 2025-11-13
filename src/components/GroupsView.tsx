// src/components/GroupsView.tsx
import React, { useMemo } from "react";
import { buildGroupTree } from "@/App";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Layers, ExternalLink } from "lucide-react";

export default function GroupsView({ matches, teamsById }:{matches:any[], teamsById:any}) {
  const tree = useMemo(()=> buildGroupTree(matches), [matches]);
  const events = Object.keys(tree);
  if(events.length===0) return <div className="text-slate-500">No hay partidos para mostrar por grupos.</div>;
  return (
    <div className="space-y-8">
      {events.map(ev=>(
        <div key={ev} className="space-y-4">
          <div className="text-base font-semibold flex items-center gap-2"><Layers className="w-4 h-4"/> {ev}</div>
          {Object.keys(tree[ev]).map(cat=>(
            <Card key={cat}><CardHeader><CardTitle className="text-sm">{cat}</CardTitle></CardHeader><CardContent>
              {Object.keys(tree[ev][cat]).map(g=>(
                <div key={g} className="mb-4">
                  <div className="text-sm font-medium mb-2">{g}</div>
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Fase</TableHead><TableHead>Partido</TableHead><TableHead>Marcador</TableHead><TableHead>Streaming</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {tree[ev][cat][g].map((m:any)=>(
                          <TableRow key={m.id}><TableCell>{new Date(m.datetime).toLocaleString()}</TableCell><TableCell>{m.phase}</TableCell><TableCell>{teamsById[m.a]?.name} vs {teamsById[m.b]?.name}</TableCell><TableCell>{m.scoreA==null||m.scoreB==null? '—' : `${m.scoreA} - ${m.scoreB}`}</TableCell><TableCell>{m.streamUrl? <a href={m.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm underline"><ExternalLink className="w-4 h-4"/>Abrir</a> : '—'}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </CardContent></Card>
          ))}
        </div>
      ))}
    </div>
  );
}
