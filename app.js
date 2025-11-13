// Simple client-side app with localStorage for teams, matches and admin
const LS_KEY = 'plasencia_app_v2';
const DEFAULT_PASS = 'PHB-2025!Porterias&Redes#98'; // contraseña admin por defecto (segura)

function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(raw) return JSON.parse(raw);
  const t1 = {id: 't1', name:'Plasencia HB', logo:'', categories:['Juvenil Femenino'], club:'Plasencia', notes:''};
  const t2 = {id: 't2', name:'Coria A', logo:'', categories:['Juvenil Femenino'], club:'Coria', notes:''};
  const m1 = {id:'m1', event:'Torneo 1', category:'Juvenil Femenino', group:'Grupo A', phase:'Fase de grupos A', a:'t1', b:'t2', datetime: new Date().toISOString(), court:'Pabellón A', scoreA:null, scoreB:null, streamUrl:''};
  const state = { teams:[t1,t2], matches:[m1], phases:[], events:['Torneo 1'], adminHash:null };
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  return state;
}

function saveState(s){ localStorage.setItem(LS_KEY, JSON.stringify(s)); }

let state = loadState();
let isAdmin = false;

// helpers
function byId(id){ return state.teams.find(t=>t.id===id) }

// UI refs
const content = document.getElementById('content');
const teamsBtn = document.getElementById('teamsBtn');
const podioBtn = document.getElementById('podioBtn');
const streamsBtn = document.getElementById('streamsBtn');
const adminToggle = document.getElementById('adminToggle');
const adminBadge = document.getElementById('adminBadge');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');

// events
teamsBtn.addEventListener('click', ()=>renderTeams());
podioBtn.addEventListener('click', ()=>renderPodio());
streamsBtn.addEventListener('click', ()=>renderStreams());
adminToggle.addEventListener('click', ()=>openLogin());

closeModal.addEventListener('click', ()=>closeModalFn());
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModalFn(); });

function openLogin(){
  showModal(`<h3>Entrada Administrador</h3>
    <div class="form-row"><label class="small">Contraseña</label><input id="pass" class="input" type="password" placeholder="••••••••"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button id="cancelLogin" class="btn ghost">Cancelar</button><button id="doLogin" class="btn">Entrar</button></div>`);
  document.getElementById('cancelLogin').addEventListener('click', closeModalFn);
  document.getElementById('doLogin').addEventListener('click', ()=>{
    const p = document.getElementById('pass').value;
    if(p===DEFAULT_PASS){ isAdmin=true; adminBadge.style.display='inline-block'; adminToggle.textContent='Salir Admin'; closeModalFn(); renderTeams(); alert('Sesión admin iniciada'); }
    else alert('Contraseña incorrecta');
  });
  // logout if already admin
  if(isAdmin){ isAdmin=false; adminBadge.style.display='none'; adminToggle.textContent='Entrar Admin'; closeModalFn(); renderHome(); }
}

function showModal(html){ modalContent.innerHTML = html; modal.classList.remove('hidden'); }
function closeModalFn(){ modal.classList.add('hidden'); modalContent.innerHTML=''; }

function renderHome(){
  content.innerHTML = '<h2>Bienvenido</h2><p>Usa los botones arriba para navegar: <strong>Equipos</strong>, <strong>Podio</strong>, <strong>Directos</strong>.</p>';
}

function renderTeams(){
  let html = '<h2>Equipos</h2>';
  if(isAdmin){
    html += `<div style="display:flex;gap:8px;margin-bottom:12px"><input id="newTeamName" class="input" placeholder="Nombre equipo"><input id="newTeamClub" class="input" placeholder="Club/ciudad"><button id="addTeamBtn" class="btn">Añadir equipo</button></div>`;
  }
  html += '<ul class="team-list">';
  for(const t of state.teams){
    html += `<li class="team-item"><div class="team-logo">${(t.name||'?').slice(0,2).toUpperCase()}</div><div style="flex:1"><strong>${t.name}</strong><div class="small">${(t.categories||[]).join(', ')} — ${t.club||'—'}</div></div>`;
    if(isAdmin) html += `<div><button class="btn ghost" onclick="window.__removeTeam('${t.id}')">Borrar</button></div>`;
    html += '</li>';
  }
  html += '</ul>';
  content.innerHTML = html;
  if(isAdmin){
    document.getElementById('addTeamBtn').addEventListener('click', ()=>{
      const name = document.getElementById('newTeamName').value.trim();
      const club = document.getElementById('newTeamClub').value.trim();
      if(!name) return alert('Nombre obligatorio');
      const id = 't'+Math.random().toString(36).slice(2,8);
      state.teams.push({id, name, logo:'', categories:['Juvenil Femenino'], club, notes:''});
      saveState(state);
      renderTeams();
    });
    window.__removeTeam = function(id){
      if(!confirm('Borrar equipo?')) return;
      state.teams = state.teams.filter(x=>x.id!==id);
      saveState(state); renderTeams();
    }
  }
}

function renderStreams(){
  let html = '<h2>Directos</h2>';
  const has = state.matches.filter(m=>m.streamUrl).length;
  html += has? '<p>Enlaces de directo:</p><ul>' : '<p>No hay directos activos.</p>';
  for(const m of state.matches.filter(m=>m.streamUrl)){
    html += `<li>${m.event} • ${m.category} • ${new Date(m.datetime).toLocaleString()} — <a target="_blank" href="${m.streamUrl}">Abrir</a></li>`;
  }
  html += '</ul>';
  content.innerHTML = html;
}

function renderPodio(){
  // compute standings for all categories, show first category or all aggregated
  const cats = [...new Set(state.matches.map(m=>m.category).filter(Boolean))];
  let html = '<h2>Podio / Clasificación</h2>';
  if(cats.length===0){ html += '<p>No hay categorías con partidos.</p>'; content.innerHTML = html; return; }
  for(const cat of cats){
    html += `<h3 class="small" style="margin-top:12px">${cat}</h3>`;
    const rows = computeStandings(cat);
    if(rows.length===0){ html += '<p class="small">Sin resultados aún</p>'; continue; }
    html += '<table class="table"><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead><tbody>';
    rows.forEach((r,i)=>{
      html += `<tr><td>${i+1}</td><td>${r.team}</td><td>${r.pj}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.dg}</td><td>${r.pts}</td></tr>`;
    });
    html += '</tbody></table>';
  }
  content.innerHTML = html;
}

function computeStandings(category){
  const teamsIn = state.teams.filter(t=> (t.categories||[]).includes(category) || true ); // include all if not assigned
  const ids = teamsIn.map(t=>t.id);
  const pts = new Map(), gf=new Map(), ga=new Map(), pj=new Map();
  teamsIn.forEach(t=>{ pts.set(t.id,0); gf.set(t.id,0); ga.set(t.id,0); pj.set(t.id,0); });
  state.matches.filter(m=>m.category===category && m.scoreA!=null && m.scoreB!=null).forEach(m=>{
    pj.set(m.a,(pj.get(m.a)||0)+1); pj.set(m.b,(pj.get(m.b)||0)+1);
    gf.set(m.a,(gf.get(m.a)||0)+m.scoreA); ga.set(m.a,(ga.get(m.a)||0)+m.scoreB);
    gf.set(m.b,(gf.get(m.b)||0)+m.scoreB); ga.set(m.b,(ga.get(m.b)||0)+m.scoreA);
    if(m.scoreA>m.scoreB) pts.set(m.a,(pts.get(m.a)||0)+3); else if(m.scoreB>m.scoreA) pts.set(m.b,(pts.get(m.b)||0)+3); else { pts.set(m.a,(pts.get(m.a)||0)+1); pts.set(m.b,(pts.get(m.b)||0)+1); }
  });
  const list = Array.from(pts.keys()).map(id=>({ id, team: state.teams.find(t=>t.id===id)?.name||'—', pj: pj.get(id)||0, gf: gf.get(id)||0, ga: ga.get(id)||0, dg: (gf.get(id)||0)-(ga.get(id)||0), pts: pts.get(id)||0 }));
  return list.sort((a,b)=> b.pts-a.pts || b.dg-a.dg || b.gf-a.gf || a.team.localeCompare(b.team));
}

// initial render
renderHome();