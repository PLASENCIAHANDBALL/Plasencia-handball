// Minimal app state + localStorage
const STORAGE_KEY = 'plasencia_app_data_v1';
const ADMIN_PASS = 'PHB-2025'; // kept in code but NOT shown in UI
const stateDefault = {
  upcoming: [
    { id:1, datetime:'2025-11-16T11:30', local:'Plasencia HB', visitor:'Coria A', place:'Pabellón A', url:'' }
  ],
  teams: [
    { id:1, name:'Plasencia HB', category:'Juvenil Femenino' },
    { id:2, name:'Coria A', category:'Juvenil Masculino' }
  ],
  podium: [],
  directos: []
};

function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateDefault));
    return structuredClone(stateDefault);
  }
  try {
    return JSON.parse(raw);
  } catch(e){
    console.error('Invalid stored data, resetting', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateDefault));
    return structuredClone(stateDefault);
  }
}
function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

let STATE = loadState();
let isAdmin = (localStorage.getItem('plasencia_is_admin') === 'true');

// UI helpers
const el = id => document.getElementById(id);

function formatDateLocal(dt){
  const d = new Date(dt);
  return d.toLocaleString();
}

function renderUpcoming(){
  const wrap = el('upcoming');
  if(!wrap) return;
  if(STATE.upcoming.length === 0){
    wrap.innerHTML = '<div class="small">No hay partidos próximos.</div>';
    return;
  }
  const items = STATE.upcoming.map(m=>{
    return `<div class="small">${formatDateLocal(m.datetime)} — <strong>${m.local}</strong> vs <strong>${m.visitor}</strong> · ${m.place} ${m.url ? ' · <a href="'+m.url+'" target="_blank" rel="noreferrer">Ver directo</a>' : ''}</div>`;
  }).join('');
  wrap.innerHTML = items;
}

function renderContent(type='home'){
  const c = el('content');
  if(!c) return;
  if(type==='equipos'){
    c.innerHTML = '<h3>Equipos</h3><div class="list">'+STATE.teams.map(t=>`<div class="team-card"><div class="team-left"><div class="badge">${t.name.split(' ').map(s=>s[0]||'')[0]}</div><div><strong>${t.name}</strong><div class="small">${t.category}</div></div></div><button class="btn" onclick="viewTeam(${t.id})">Ver</button></div>`).join('')+'</div>';
  } else if(type==='podio'){
    c.innerHTML = '<h3>Podio</h3><p class="small">Aquí verás el podio cuando haya resultados.</p>';
  } else if(type==='directos'){
    c.innerHTML = '<h3>Directos</h3>'+(STATE.upcoming.filter(x=>x.url).length ? STATE.upcoming.filter(x=>x.url).map(x=>`<div class="team-card"><div><strong>${x.local} vs ${x.visitor}</strong><div class="small">${formatDateLocal(x.datetime)}</div></div><a class="btn" href="${x.url}" target="_blank">Ir al directo</a></div>`).join(''):'<p class="small">No hay directos activos.</p>');
  } else {
    c.innerHTML = '<h3>Bienvenido</h3><p class="small">Pulsa los botones de arriba para navegar. Si eres administrador podrás editar los partidos próximos.</p>';
    // show summary of next match
    if(STATE.upcoming.length){
      const m = STATE.upcoming[0];
      c.innerHTML += `<div class="team-card"><div><strong>Partidos próximos</strong><div class="small">${formatDateLocal(m.datetime)} — ${m.local} vs ${m.visitor} · ${m.place}</div></div>
      <div>${isAdmin ? '<button id="edit-next" class="btn">Editar</button>' : ''}</div></div>`;
      if(isAdmin){
        setTimeout(()=>{ const btn = document.getElementById('edit-next'); if(btn) btn.addEventListener('click', openEditModalForId.bind(null, m.id)); }, 50);
      }
    }
  }
}

// view team placeholder
function viewTeam(id){
  const t = STATE.teams.find(x=>x.id===id);
  el('content').innerHTML = `<h3>${t.name}</h3><p class="small">${t.category}</p><p class="small">Listado de partidos y clasificación (placeholder)</p>`;
}

// Admin modal controls
function openAdminModal(){
  el('admin-modal').classList.remove('hidden');
  el('admin-modal').setAttribute('aria-hidden','false');
  el('admin-password').value = '';
  el('admin-password').focus();
}
function closeAdminModal(){
  el('admin-modal').classList.add('hidden');
  el('admin-modal').setAttribute('aria-hidden','true');
}

// Edit modal controls
let editTargetId = null;
function openEditModalForId(id){
  editTargetId = id;
  const item = STATE.upcoming.find(x=>x.id===id);
  if(!item) return;
  el('edit-datetime').value = item.datetime;
  el('edit-local').value = item.local;
  el('edit-visitor').value = item.visitor;
  el('edit-place').value = item.place;
  el('edit-url').value = item.url || '';
  el('edit-modal').classList.remove('hidden');
}
function closeEditModal(){ el('edit-modal').classList.add('hidden'); editTargetId = null; }

// Event listeners
document.addEventListener('DOMContentLoaded', ()=>{
  // initial render
  renderUpcoming();
  renderContent('home');

  // nav buttons
  el('btn-equipos').addEventListener('click', ()=>renderContent('equipos'));
  el('btn-podio').addEventListener('click', ()=>renderContent('podio'));
  el('btn-directos').addEventListener('click', ()=>renderContent('directos'));

  // admin open only when button clicked
  el('btn-admin').addEventListener('click', openAdminModal);

  // admin modal actions
  el('cancel-admin').addEventListener('click', closeAdminModal);
  el('confirm-admin').addEventListener('click', ()=>{
    const pass = el('admin-password').value.trim();
    if(pass === ADMIN_PASS){
      isAdmin = true;
      localStorage.setItem('plasencia_is_admin', 'true');
      closeAdminModal();
      renderContent('home');
      renderUpcoming();
      alert('Has entrado como administrador.');
    } else {
      alert('Contraseña incorrecta');
    }
  });

  // edit modal actions
  el('cancel-edit').addEventListener('click', closeEditModal);
  el('save-edit').addEventListener('click', ()=>{
    if(!editTargetId) return;
    const idx = STATE.upcoming.findIndex(x=>x.id===editTargetId);
    if(idx === -1) return;
    STATE.upcoming[idx].datetime = el('edit-datetime').value;
    STATE.upcoming[idx].local = el('edit-local').value;
    STATE.upcoming[idx].visitor = el('edit-visitor').value;
    STATE.upcoming[idx].place = el('edit-place').value;
    STATE.upcoming[idx].url = el('edit-url').value.trim();
    saveState(STATE);
    closeEditModal();
    renderUpcoming();
    renderContent('home');
    alert('Partido actualizado.');
  });

  // hide modal on background click (optional)
  document.querySelectorAll('.modal').forEach(mod => {
    mod.addEventListener('click', (ev)=>{
      if(ev.target === mod){
        mod.classList.add('hidden');
      }
    });
  });
});
