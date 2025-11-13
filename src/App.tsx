import React, { useEffect, useMemo, useState } from 'react'
import BackgroundArt from './components/BackgroundArt'
import TeamForm from './components/TeamForm'
import MatchesTable from './components/MatchesTable'
import CategoriesView from './components/CategoriesView'
function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36) }
export default function App(){
  const [teams,setTeams]=useState<any[]>([])
  const [matches,setMatches]=useState<any[]>([])
  useEffect(()=>{ const raw=localStorage.getItem('plasencia-handball-app-v1'); if(raw){ const p=JSON.parse(raw); if(p?.teams) setTeams(p.teams); if(p?.matches) setMatches(p.matches); } else { const t1={id:uid(),name:'Plasencia HB',logo:'',categories:['Juvenil Femenino'],club:'Plasencia'}; const t2={id:uid(),name:'Coria A',logo:'',categories:['Juvenil Femenino'],club:'Coria'}; const m1={id:uid(),event:'Torneo 1',category:'Juvenil Femenino',group:'Grupo A',phase:'Fase de grupos A',a:t1.id,b:t2.id,datetime:new Date().toISOString(),court:'Pabellón A',scoreA:null,scoreB:null,streamUrl:''}; setTeams([t1,t2]); setMatches([m1]); } },[])
  useEffect(()=> localStorage.setItem('plasencia-handball-app-v1', JSON.stringify({teams,matches})),[teams,matches])
  const teamsById = useMemo(()=>Object.fromEntries(teams.map(t=>[t.id,t])),[teams])
  return (<div className="min-h-screen"><BackgroundArt/><div className="relative z-10 p-6 max-w-5xl mx-auto"><header className="mb-6"><h1 className="text-3xl font-bold">Plasencia Handball · Gestión rápida</h1></header><main className="space-y-6"><div className="grid md:grid-cols-3 gap-4">{/* left form */}<div className="md:col-span-1 bg-white p-4 rounded shadow"><h3 className="font-semibold mb-3">Añadir equipo</h3><TeamForm onSubmit={(t:any)=>setTeams(s=>[...s,{id:uid(),...t}])} /></div><div className="md:col-span-2 bg-white p-4 rounded shadow"><MatchesTable matches={matches} teamsById={teamsById} isAdmin={true} updateMatch={()=>{}} removeMatch={()=>{}}/></div></div><div><CategoriesView matches={matches} teamsById={teamsById} /></div></main></div></div>)
}
