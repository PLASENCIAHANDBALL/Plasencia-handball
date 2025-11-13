// Minimal single-file app (no frameworks) with localStorage backend
const CATEGORIES = [
  "Alevín Femenino","Alevín Masculino",
  "Infantil Femenino","Infantil Masculino",
  "Cadete Femenino","Cadete Masculino",
  "Juvenil Femenino","Juvenil Masculino"
];

function uid(){return Math.random().toString(36).slice(2)+Date.now().toString(36)}

// Storage keys
const LS_KEY = 'plasencia_hb_data_v1';
const LS_ADMIN = 'plasencia_hb_admin';

// default demo data
function defaultData(){
  const t1 = {id:uid(), name:'Plasencia HB', categories:['Juvenil Femenino'], club:'Plasencia', notes:''};
  const t2 = {id:uid(), name:'Coria A', categories:['Juvenil Femenino'], club:'Coria', notes:''};
  const m1 = {id:uid(), event:'Torneo 1', category:'Juvenil Femenino', group:'Grupo A', phase:'Fase de grupos A', a:t1.id, b:t2.id, datetime:new Date().toISOString(), court:'Pabellón A', scoreA:null, scoreB:null, streamUrl:''};
  return {teams:[t1,t2], matches:[m1]};
}

let state = {teams:[], matches:[]};
function load(){ try{ const raw = localStorage.getItem(LS_KEY); if(raw){ state = JSON.parse(raw); } else { state = defaultData(); save(); } }catch(e){ console.error(e); state=defaultData(); save(); } }
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

load();

// Simple routing
const elems = {
  home: document.getElementById('home'),
  viewEquipos: document.getElementById('viewEquipos'),
  viewPodio: document.getElementById('viewPodio'),
  viewDirectos: document.getElementById('viewDirectos'),
  teamsList: document.getElementById('teamsList'),
  streamsList: document.getElementById('streamsList'),
  standings: document.getElementById('standings'),
  adminModal: document.getElementById('adminModal'),
  adminPass: document.getElementById('adminPass'),
  adminPanel: document.getElementById('adminPanel'),
  teamFormWrap: document.getElementById('teamFormWrap'),
  teamCategory: document.getElementById('teamCategory'),
  teamName: document.getElementById('teamName'),
  teamClub: document.getElementById('teamClub'),
  teamNotes: document.getElementById('teamNotes'),
  addTeamBtn: document.getElementById('addTeamBtn'),
  importFile: document.getElementById('importFile')
};

document.getElementById('btnEquipos').addEventListener('click', ()=>show('equipos'));
document.getElementById('btnPodio').addEventListener('click', ()=>show('podio'));
document.getElementById('btnDirectos').addEventListener('click', ()=>show('directos'));
document.getElementById('btnAdmin').addEventListener('click', ()=>openAdminModal());
document.getElementById('closeAdminBtn').addEventListener('click', ()=>closeAdminModal());
document.getElementById('loginBtn').addEventListener('click', tryLogin);
document.getElementById('toggleAddTeam').addEventListener('click', ()=>elems.teamFormWrap.classList.toggle('hidden'));
document.getElementById('exportBtn').addEventListener('click', exportJSON);
document.getElementById('importBtn').addEventListener('click', ()=>elems.importFile.click());
elems.importFile.addEventListener('change', handleImport);
document.getElementById('logoutBtn').addEventListener('click', logout);

elems.addTeamBtn.addEventListener('click', ()=>{
  const name = elems.teamName.value.trim();
  const cat = elems.teamCategory.value;
  const club = elems.teamClub.value.trim();
  const notes = elems.teamNotes.value.trim();
  if(!name || !cat) return alert('Nombre y categoría obligatorios');
  state.teams.push({id:uid(), name, categories:[cat], club, notes});
  save(); elems.teamName.value=''; elems.teamClub.value=''; elems.teamNotes.value=''; renderTeams();
});

function show(v){
  [elems.home, elems.viewEquipos, elems.viewPodio, elems.viewDirectos].forEach(el=>el.classList.add('hidden'));
  if(v==='equipos'){ elems.viewEquipos.classList.remove('hidden'); renderTeams(); }
  else if(v==='podio'){ elems.viewPodio.classList.remove('hidden'); renderStandings(); }
  else if(v==='directos'){ elems.viewDirectos.classList.remove('hidden'); renderStreams(); }
  else elems.home.classList.remove('hidden');
}

function openAdminModal(){ elems.adminModal.classList.remove('hidden'); elems.adminPass.value=''; }
function closeAdminModal(){ elems.adminModal.classList.add('hidden'); }

function tryLogin(){
  const pass = elems.adminPass.value;
  // default strong password (same as README)
  if(!pass) return alert('Introduce contraseña');
  if(pass === 'PHB-2025!Porterias&Redes#98'){ localStorage.setItem(LS_ADMIN, '1'); elems.adminModal.classList.add('hidden'); elems.adminPanel.classList.remove('hidden'); document.getElementById('btnAdmin').textContent='Admin'; alert('Modo administrador activado'); renderTeams(); }
  else alert('Contraseña incorrecta');
}

function logout(){ localStorage.removeItem(LS_ADMIN); elems.adminPanel.classList.add('hidden'); document.getElementById('btnAdmin').textContent='Entrar Admin'; alert('Has salido del modo admin'); renderTeams(); }

// render teams
function renderTeams(){
  elems.teamsList.innerHTML = '';
  // admin panel show
  if(localStorage.getItem(LS_ADMIN)==='1'){ elems.adminPanel.classList.remove('hidden'); elems.teamFormWrap.classList.remove('hidden'); }
  else { elems.adminPanel.classList.add('hidden'); elems.teamFormWrap.classList.add('hidden'); }
  // categories
  elems.teamCategory.innerHTML = '<option value="">Selecciona categoría</option>';
  CATEGORIES.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; elems.teamCategory.appendChild(opt); });

  if(state.teams.length===0){ elems.teamsList.innerHTML = '<div class="small">No hay equipos</div>'; return; }
  state.teams.forEach(t=>{
    const div = document.createElement('div'); div.className='team-item';
    const left = document.createElement('div');
    left.innerHTML = '<strong>'+escapeHtml(t.name)+'</strong><div class="small">'+(t.categories||[]).join(', ')+'</div>';
    const right = document.createElement('div');
    const btnShow = document.createElement('button'); btnShow.textContent='Ver'; btnShow.onclick=()=>showTeam(t.id);
    right.appendChild(btnShow);
    if(localStorage.getItem(LS_ADMIN)==='1'){
      const btnDel = document.createElement('button'); btnDel.textContent='Borrar'; btnDel.style.marginLeft='8px';
      btnDel.onclick=()=>{ if(confirm('Borrar equipo?')){ state.teams = state.teams.filter(x=>x.id!==t.id); save(); renderTeams(); } };
      right.appendChild(btnDel);
    }
    div.appendChild(left); div.appendChild(right); elems.teamsList.appendChild(div);
  });
}

function showTeam(id){
  const t = state.teams.find(x=>x.id===id); if(!t) return alert('Equipo no encontrado');
  alert('Equipo: '+t.name+'\nCategorias: '+(t.categories||[]).join(', ')+'\nClub: '+(t.club||'—')+'\nNotas: '+(t.notes||''));
}

// standings
function renderStandings(){
  // simple points calc: 3 win 1 draw
  const cat = CATEGORIES[0]; // show all categories as sections
  elems.standings.innerHTML = '';
  CATEGORIES.forEach(category=>{
    const teams = state.teams.filter(t=> (t.categories||[]).includes(category));
    if(teams.length===0) return;
    const container = document.createElement('div'); container.className='card';
    const title = document.createElement('h3'); title.textContent = category; container.appendChild(title);
    // compute table
    const table = document.createElement('div');
    const rows = teams.map(t=>{
      const matches = state.matches.filter(m=>m.category===category && m.scoreA!=null && m.scoreB!=null);
      let pts=0,pj=0,gf=0,ga=0;
      matches.forEach(m=>{
        if(!m.a || !m.b) return;
        if(m.a===t.id || m.b===t.id){ pj++; if(m.a===t.id){ gf+=m.scoreA; ga+=m.scoreB; if(m.scoreA>m.scoreB) pts+=3; else if(m.scoreA===m.scoreB) pts+=1; } else { gf+=m.scoreB; ga+=m.scoreA; if(m.scoreB>m.scoreA) pts+=3; else if(m.scoreA===m.scoreB) pts+=1; } }
      });
      return {team:t.name, pts, pj, gf, ga};
    }).sort((a,b)=> b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
    // render rows
    rows.forEach((r,i)=>{
      const el = document.createElement('div'); el.className='team-item';
      el.innerHTML = '<div><strong>'+(i+1)+'. '+escapeHtml(r.team)+'</strong><div class="small">PJ '+r.pj+' • GF '+r.gf+' • GA '+r.ga+'</div></div><div class="small">Pts '+r.pts+'</div>';
      table.appendChild(el);
    });
    container.appendChild(table);
    elems.standings.appendChild(container);
  });
}

// streams
function renderStreams(){
  elems.streamsList.innerHTML='';
  state.matches.filter(m=>m.streamUrl).forEach(m=>{
    const div = document.createElement('div'); div.className='team-item';
    div.innerHTML = '<div><strong>'+escapeHtml(m.event||'')+'</strong><div class="small">'+escapeHtml(m.category||'')+' • '+new Date(m.datetime).toLocaleString()+'</div></div><div><a href="'+(m.streamUrl||'#')+'" target="_blank">Abrir</a></div>';
    elems.streamsList.appendChild(div);
  });
  if(elems.streamsList.children.length===0) elems.streamsList.innerHTML = '<div class="small">No hay directos activos.</div>';
}

// export/import
function exportJSON(){
  const blob = new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='plasencia-handball-data.json'; a.click(); URL.revokeObjectURL(url);
}
function handleImport(e){
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader(); r.onload = ()=>{ try{ const data = JSON.parse(String(r.result)); if(data.teams) state.teams = data.teams; if(data.matches) state.matches = data.matches; save(); alert('Importado'); renderTeams(); }catch(err){ alert('JSON inválido') } }; r.readAsText(f);
}

// util
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// initial render
renderTeams();
