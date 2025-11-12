
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Plus, Save, Settings, Upload, Download, Trash2, Link as LinkIcon, ExternalLink, Calendar, Users2, Trophy, Video, Lock, Unlock, Layers, LayoutGrid, Image as ImageIcon } from "lucide-react";

const CATEGORIES = ["Alevín Femenino","Alevín Masculino","Infantil Femenino","Infantil Masculino","Cadete Femenino","Cadete Masculino","Juvenil Femenino","Juvenil Masculino"];
const DEFAULT_PHASES = ["Fase de grupos A","Fase de grupos B","Segunda fase","Cuartos de final","Semifinal","Final"];
const ALL="__ALL__";
const LS_KEY="plasencia-handball-app-v1"; const LS_ADMIN="plasencia-handball-admin"; const LS_ADMIN_HASH="plasencia-handball-admin-hash"; const LS_PHASES="plasencia-handball-phases"; const LS_EVENTS="plasencia-handball-events";

function uid(){return Math.random().toString(36).slice(2)+Date.now().toString(36);}
async function sha256Hex(text:string){const enc=new TextEncoder();const buf=await crypto.subtle.digest("SHA-256",enc.encode(text));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");}

export default function TournamentApp(){
  const [teams,setTeams]=useState<any[]>([]);
  const [matches,setMatches]=useState<any[]>([]);
  const [phases,setPhases]=useState<string[]>(DEFAULT_PHASES);
  const [events,setEvents]=useState<string[]>(["Torneo 1"]);
  const [filterEvent,setFilterEvent]=useState<string>(ALL);
  const [filterCategory,setFilterCategory]=useState<string>(ALL);
  const [filterGroup,setFilterGroup]=useState<string>(ALL);
  const [search,setSearch]=useState<string>("");
  const [isAdmin,setIsAdmin]=useState(false);
  const [adminDialogOpen,setAdminDialogOpen]=useState(false);
  const [pass,setPass]=useState(""); const [adminHash,setAdminHash]=useState("");

  useEffect(()=>{ try{ const raw=localStorage.getItem(LS_KEY); if(raw){ const p=JSON.parse(raw); if(p?.teams) setTeams(p.teams); if(p?.matches) setMatches(p.matches);} else { const ev="Torneo 1"; const t1={id:uid(),name:"Plasencia HB",logo:"",categories:["Juvenil Femenino"],club:"Plasencia",notes:""}; const t2={id:uid(),name:"Coria A",logo:"",categories:["Juvenil Femenino"],club:"Coria",notes:""}; const m1={id:uid(),event:ev,category:"Juvenil Femenino",group:"Grupo A",phase:"Fase de grupos A",a:t1.id,b:t2.id,datetime:new Date().toISOString(),court:"Pabellón A",scoreA:null,scoreB:null,streamUrl:""}; setTeams([t1,t2]); setMatches([m1]); } const ph=localStorage.getItem(LS_PHASES); if(ph) setPhases(JSON.parse(ph)); const evs=localStorage.getItem(LS_EVENTS); if(evs) setEvents(JSON.parse(evs)); const ah=localStorage.getItem(LS_ADMIN_HASH); if(ah) setAdminHash(ah); setIsAdmin(localStorage.getItem(LS_ADMIN)==="1"); }catch{} },[]);

  useEffect(()=>localStorage.setItem(LS_KEY,JSON.stringify({teams,matches})),[teams,matches]);
  useEffect(()=>localStorage.setItem(LS_PHASES,JSON.stringify(phases)),[phases]);
  useEffect(()=>localStorage.setItem(LS_EVENTS,JSON.stringify(events)),[events]);
  useEffect(()=>localStorage.setItem(LS_ADMIN,isAdmin?"1":"0"),[isAdmin]);

  useEffect(()=>{(async()=>{ if(!adminHash){ const s="PHB-2025!Porterias&Redes#98"; const h=await sha256Hex(s); setAdminHash(h); localStorage.setItem(LS_ADMIN_HASH,h);} })();},[adminHash]);

  const teamsById=useMemo(()=>Object.fromEntries(teams.map((t:any)=>[t.id,t])),[teams]);
  const allGroups=useMemo(()=>[ALL,...Array.from(new Set(matches.map(m=>m.group).filter(Boolean)))],[matches]);

  const baseFilter=(m:any)=>(filterEvent===ALL||m.event===filterEvent)&&(filterCategory===ALL||m.category===filterCategory)&&(filterGroup===ALL||m.group===filterGroup);
  const filteredMatches=useMemo(()=>matches.filter(baseFilter).filter(m=>{ if(!search) return true; const a=teamsById[m.a]?.name||""; const b=teamsById[m.b]?.name||""; return `${a} ${b} ${m.event} ${m.category} ${m.group||""} ${m.phase} ${m.court}`.toLowerCase().includes(search.toLowerCase()); }).sort((x,y)=>new Date(x.datetime).getTime()-new Date(y.datetime).getTime()),[matches,filterEvent,filterCategory,filterGroup,search,teamsById]);

  const upcomingMatches=useMemo(()=>filteredMatches.filter(m=>new Date(m.datetime)>=new Date()),[filteredMatches]);

  const addTeam=(team:any)=>setTeams(t=>[...t,{id:uid(),...team}]);
  const removeTeam=(id:string)=>setTeams(t=>t.filter(x=>x.id!==id));
  const addMatch=(nm:any)=>setMatches(p=>[...p,{id:uid(),scoreA:null,scoreB:null,streamUrl:"",notes:"",group:"",...nm}]);
  const updateMatch=(id:string,patch:any)=>setMatches(p=>p.map(m=>m.id===id?{...m,...patch}:m));
  const removeMatch=(id:string)=>setMatches(p=>p.filter(m=>m.id!==id));

  async function tryLogin(){ const h=await sha256Hex(pass); if(h===adminHash){ setIsAdmin(true); setPass(""); setAdminDialogOpen(false);} else alert("Contraseña incorrecta"); }
  async function changePassword(cur:string,next:string,cf:string){ const ch=await sha256Hex(cur); const ok=/[a-z]/.test(next)&&/[A-Z]/.test(next)&&/\\d/.test(next)&&/[^A-Za-z0-9]/.test(next)&&next.length>=10; if(ch!==adminHash) return alert("Contraseña actual no coincide"); if(!ok) return alert("Nueva contraseña débil"); if(next!==cf) return alert("Confirmación no coincide"); const nh=await sha256Hex(next); setAdminHash(nh); localStorage.setItem(LS_ADMIN_HASH,nh); alert("Contraseña actualizada"); }

  return (<div className="p-4"><h1 className="text-2xl font-bold">Plasencia Handball</h1><p className="text-sm">App lista (modo admin: ajustes)</p></div>);
}
