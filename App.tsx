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
import { motion } from "framer-motion";

// ============================ CONFIG ============================

const CATEGORIES = [
  "Alevín Femenino", "Alevín Masculino",
  "Infantil Femenino", "Infantil Masculino",
  "Cadete Femenino", "Cadete Masculino",
  "Juvenil Femenino", "Juvenil Masculino",
];

const DEFAULT_PHASES = [
  "Fase de grupos A", "Fase de grupos B", "Fase de grupos C", "Fase de grupos D",
  "Segunda fase", "Cuartos de final", "Semifinal", "Final", "3º y 4º puesto",
  "Torneo paralelo 1", "Torneo paralelo 2", "Torneo paralelo 3"
];

const ALL = "__ALL__";

// ============================ STORAGE KEYS ============================

const LS_KEY = "plasencia-handball-app-v1";
const LS_ADMIN = "plasencia-handball-admin";
const LS_ADMIN_HASH = "plasencia-handball-admin-hash";
const LS_PHASES = "plasencia-handball-phases";
const LS_EVENTS = "plasencia-handball-events";

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
async function sha256Hex(text: string) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ============================ MAIN APP ============================

export default function TournamentApp() {
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [phases, setPhases] = useState(DEFAULT_PHASES);
  const [events, setEvents] = useState(["Torneo 1"]);

  const [filterEvent, setFilterEvent] = useState(ALL);
  const [filterCategory, setFilterCategory] = useState(ALL);
  const [filterGroup, setFilterGroup] = useState(ALL);
  const [search, setSearch] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [adminHash, setAdminHash] = useState("");

  // ============================ LOAD DATA ============================

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.teams) setTeams(parsed.teams);
        if (parsed?.matches) setMatches(parsed.matches);
      } else {
        // Demo inicial
        const ev = "Torneo 1";
        const t1 = { id: uid(), name: "Plasencia HB", logo: "", categories: ["Juvenil Femenino"], club: "Plasencia", notes: "" };
        const t2 = { id: uid(), name: "Coria A", logo: "", categories: ["Juvenil Femenino"], club: "Coria", notes: "" };
        const m1 = { id: uid(), event: ev, category: "Juvenil Femenino", group: "Grupo A", phase: "Fase de grupos A", a: t1.id, b: t2.id, datetime: new Date().toISOString(), court: "Pabellón A", scoreA: null, scoreB: null, streamUrl: "" };
        setTeams([t1, t2]);
        setMatches([m1]);
      }
      const ph = localStorage.getItem(LS_PHASES); if (ph) setPhases(JSON.parse(ph));
      const evs = localStorage.getItem(LS_EVENTS); if (evs) setEvents(JSON.parse(evs));
      const ah = localStorage.getItem(LS_ADMIN_HASH); if (ah) setAdminHash(ah);
      setIsAdmin(localStorage.getItem(LS_ADMIN) === "1");
    } catch { }
  }, []);

  useEffect(() => localStorage.setItem(LS_KEY, JSON.stringify({ teams, matches })), [teams, matches]);
  useEffect(() => localStorage.setItem(LS_PHASES, JSON.stringify(phases)), [phases]);
  useEffect(() => localStorage.setItem(LS_EVENTS, JSON.stringify(events)), [events]);
  useEffect(() => localStorage.setItem(LS_ADMIN, isAdmin ? "1" : "0"), [isAdmin]);

  // ============================ ADMIN PASSWORD ============================

  useEffect(() => {
    (async () => {
      if (!adminHash) {
        const strongDefault = "PHB-2025!Porterias&Redes#98";
        const h = await sha256Hex(strongDefault);
        setAdminHash(h);
        localStorage.setItem(LS_ADMIN_HASH, h);
      }
    })();
  }, [adminHash]);

  async function tryLogin() {
    const hash = await sha256Hex(pass);
    if (hash === adminHash) { setIsAdmin(true); setPass(""); setAdminDialogOpen(false); }
    else alert("Contraseña incorrecta");
  }

  async function changePassword(current: string, next: string, confirm: string) {
    const curHash = await sha256Hex(current);
    const strongOk = /[a-z]/.test(next) && /[A-Z]/.test(next) && /\d/.test(next) && /[^A-Za-z0-9]/.test(next) && next.length >= 10;
    if (curHash !== adminHash) return alert("Contraseña actual incorrecta");
    if (!strongOk) return alert("La nueva contraseña debe tener mayúsculas, minúsculas, números, símbolos y mínimo 10 caracteres");
    if (next !== confirm) return alert("La confirmación no coincide");
    const newHash = await sha256Hex(next);
    setAdminHash(newHash); localStorage.setItem(LS_ADMIN_HASH, newHash);
    alert("Contraseña actualizada");
  }

  // ============================ HELPER COMPONENTS ============================

  const AdminBadge = () => (
    <span className={`text-xs px-2 py-1 rounded-2xl border ${isAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-slate-700'}`}>
      {isAdmin ? 'Admin' : 'Visitante'}
    </span>
  );

  const AdminGate = ({ children, fallback = null }: any) => isAdmin ? children : fallback;

  // ============================ RENDER ============================

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundArt />
      <div className="relative z-10 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-sky-700">
            Plasencia Handball · Gestión rápida
          </motion.h1>

          <div className="flex items-center gap-2">
            <AdminBadge />
            <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button variant={isAdmin ? "secondary" : "default"} className="gap-2">
                  {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isAdmin ? "Salir" : "Entrar"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader><DialogTitle>Acceso administrador</DialogTitle></DialogHeader>
                {!isAdmin ? (
                  <>
                    <Label>Contraseña</Label>
                    <Input type="password" value={pass} onChange={e => setPass(e.target.value)} />
                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={tryLogin}>Entrar</Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p>¿Cerrar sesión de administrador?</p>
                    <Button onClick={() => { setIsAdmin(false); setAdminDialogOpen(false); }}>Cerrar sesión</Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="mt-6">
          {/* Aquí irían tus pestañas de Equipos, Partidos, Directos y Podio */}
          <p className="text-slate-600 text-center mt-10">Interfaz simplificada cargada correctamente 🎉</p>
        </main>
      </div>
    </div>
  );
}

// ============================ BACKGROUND ART ============================

function BackgroundArt() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-200 via-slate-100 to-white" />
      <div className="absolute -top-24 -left-24 w-[60vw] h-[60vw] rounded-full bg-sky-300/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 w-[50vw] h-[50vw] rounded-full bg-indigo-300/20 blur-3xl" />
      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect x="10%" y="15%" width="80%" height="70%" rx="24" fill="#7dd3fc" />
        <rect x="10%"
