// src/components/DevTests.tsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function DevTests({ teams, matches }:{teams:any[], matches:any[]}) {
  const tests = [
    { name: "Equipos en array", pass: Array.isArray(teams) },
    { name: "Partidos en array", pass: Array.isArray(matches) },
  ];
  return (
    <div className="fixed bottom-3 right-3 z-20">
      <Card className="bg-white/90 backdrop-blur border-slate-200 shadow">
        <CardHeader className="py-2"><CardTitle className="text-sm">Pruebas (admin)</CardTitle></CardHeader>
        <CardContent className="py-2">
          <ul className="text-xs space-y-1">
            {tests.map((t,i)=> <li key={i} className={t.pass? 'text-emerald-700' : 'text-red-700'}>• {t.name} {t.pass? '✅' : '❌'}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
