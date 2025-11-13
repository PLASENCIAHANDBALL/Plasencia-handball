// app.js - UI + localStorage persistence (simple SPA)
const $ = sel => document.querySelector(sel);
const sampleKey = 'plasencia_handball_data_v1';

const defaultData = {
  categories: [
    { id: 'alevin_f', label: 'Alevín Femenino', teams: ['Equipo Alevín F 1','Equipo Alevín F 2']},
    { id: 'alevin_m', label: 'Alevín Masculino', teams: ['Alevín M 1','Alevín M 2']},
    { id: 'infantil_f', label: 'Infantil Femenino', teams: ['Infantil F 1']},
    { id: 'cadete_m', label: 'Cadete Masculino', teams: ['Cadete M 1','Cadete M 2']},
    { id: 'juvenil_f', label: 'Juvenil Femenino', teams: ['Plasencia HB','Coria A']},
  ],
  matches: [
    { id: 'm1', date: '2025-11-16T11:30', home: 'Plasencia HB', away: 'Coria A', place: 'Pabellón A' }
  ],
  directs: [],
  podium: ['Plasencia HB','Coria A','Union Pacense']
};

function loadData(){
  try{
    const raw = localStorage.getItem(sampleKey);
    if(!raw) { localStorage.setItem(sampleKey, JSON.stringify(defaultData)); return defaultData; }
    return JSON.parse(raw);
  }catch(e){
    localStorage.setItem(sampleKey, JSON.stringify(defaultData));
    return defaultData;
  }
}
function saveData(data){ localStorage.setItem(sampleKey, JSON.stringify(data)); }

let data = loadData();

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function clearMain(){ hide($('#home')); hide($('#equipos')); hide($('#podio')); hide($('#directos')); hide($('#admin-panel')); }

function buildCategories(){
  const container = document.querySelector('.categories');
  container.innerHTML = '';
  data.categories.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'cat-btn';
    b.textContent = cat.label;
    b.onclick = ()=> openCategory(cat.id);
    container.appendChild(b);
  });
}

function openCategory(catId){
  const cat = data.categories.find(c=>c.id===catId);
  if(!cat) return;
  document.getElementById('teams-title').textContent = 'Equipos — ' + cat.label;
  const ul = document.getElementById('teams-ul');
  ul.innerHTML = '';
  cat.teams.forEach(t=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${t}</span><div><button class="btn" onclick="alert('Ver equipo: ${t}')">Ver</button></div>`;
    ul.appendChild(li);
  });
  show($('.teams-list'));
}

// Live list (directos) render
function renderDirects(){
  const el = $('#live-list');
  el.innerHTML = '';
  if(data.directs.length === 0){ el.innerHTML = '<p>No hay directos activos.</p>'; return; }
  data.directs.forEach(d=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = '8px';
    card.innerHTML = `<strong>${d.title}</strong><div><a href="${d.url}" target="_blank">${d.url}</a></div>`;
    el.appendChild(card);
  });
}

// Podium render
function renderPodium(){
  $('#pod1').textContent = data.podium[0] || '';
  $('#pod2').textContent = data.podium[1] || '';
  $('#pod3').textContent = data.podium[2] || '';
}

// Admin UI helpers
function populateAdminCatSelect(){
  const s = $('#admin-cat-select');
  s.innerHTML = '';
  data.categories.forEach(c=>{
    const o = document.createElement('option'); o.value = c.id; o.textContent = c.label;
    s.appendChild(o);
  });
}
function renderAdminMatches(){
  const wrap = $('#admin-matches');
  wrap.innerHTML = '';
  (data.matches||[]).forEach(m=>{
    const node = document.createElement('div');
    node.style.padding='8px';node.style.border='1px solid #eef6fb';node.style.marginTop='6px';
    node.innerHTML = `<strong>${m.home} vs ${m.away}</strong> — ${m.date.replace('T',' ')} <br/><small>${m.place}</small>
      <div style="margin-top:6px"><button class="btn" onclick="editMatch('${m.id}')">Editar</button>
      <button class="btn" onclick="removeMatch('${m.id}')">Eliminar</button></div>`;
    wrap.appendChild(node);
  });
}
function renderAdminDirects(){
  const w = $('#admin-directs'); w.innerHTML = '';
  data.directs.forEach((d, i)=>{
    const el = document.createElement('div'); el.style.marginTop='6px';
    el.innerHTML = `<strong>${d.title}</strong> — <a href="${d.url}" target="_blank">${d.url}</a>
      <div><button class="btn" onclick="removeDirect(${i})">Eliminar</button></div>`;
    w.appendChild(el);
  });
}

// Exposed functions for inline onclick
window.editMatch = function(id){
  const m = data.matches.find(x=>x.id===id); if(!m) return alert('No encontrado');
  const d = prompt('Fecha (YYYY-MM-DDTHH:MM)', m.date) || m.date;
  const h = prompt('Local', m.home) || m.home;
  const a = prompt('Visitante', m.away) || m.away;
  const p = prompt('Lugar', m.place) || m.place;
  m.date = d; m.home = h; m.away = a; m.place = p;
  saveData(data); renderAdminMatches(); renderMatchesList();
}
window.removeMatch = function(id){
  if(!confirm('Eliminar partido?')) return;
  data.matches = data.matches.filter(x=>x.id!==id);
  saveData(data); renderAdminMatches(); renderMatchesList();
}
window.removeDirect = function(i){
  if(!confirm('Eliminar directo?')) return;
  data.directs.splice(i,1); saveData(data); renderDirects(); renderAdminDirects();
}

// Render matches in front (small list)
function renderMatchesList(){
  // place upcoming matches in home -> simple card
  const frag = document.createDocumentFragment();
  const upcoming = data.matches.slice().sort((a,b)=> a.date > b.date ? 1 : -1);
  // remove any previous small list
  const old = document.querySelector('.match-small-wrapper'); if(old) old.remove();
  const wrap = document.createElement('div'); wrap.className='card match-small-wrapper'; wrap.style.marginTop='12px';
  const h = document.createElement('h4'); h.textContent = 'Partidos próximos';
  wrap.appendChild(h);
  upcoming.slice(0,5).forEach(m=>{
    const p = document.createElement('div');
    p.style.padding='8px'; p.style.borderTop='1px solid #f1f5f9';
    p.innerHTML = `<strong>${m.date.replace('T',' ')} — ${m.home} vs ${m.away}</strong><div>${m.place}</div>`;
    wrap.appendChild(p);
  });
  $('#home').appendChild(wrap);
}

// Nav handlers
$('#btn-equipos').addEventListener('click', ()=>{
  clearMain();
  show($('#equipos'));
  hide($('.teams-list'));
  buildCategories();
});
$('#btn-podio').addEventListener('click', ()=>{ clearMain(); show($('#podio')); renderPodium(); });
$('#btn-directos').addEventListener('click', ()=>{ clearMain(); show($('#directos')); renderDirects(); });

// admin modal behavior
$('#btn-admin').addEventListener('click', ()=> show($('#modal-admin')));
$('#admin-cancel').addEventListener('click', ()=> hide($('#modal-admin')));
$('#admin-enter').addEventListener('click', ()=> {
  const pass = $('#admin-pass').value.trim();
  if(pass === 'PHB-2025'){
    hide($('#modal-admin'));
    enterAdminMode();
  } else {
    alert('Contraseña incorrecta');
  }
});

function enterAdminMode(){
  const btn = $('#btn-admin'); btn.textContent = 'Admin ✓'; btn.classList.remove('ghost');
  btn.onclick = ()=> { if(confirm('Cerrar sesión de admin?')) location.reload(); };
  // show admin panel
  show($('#admin-panel'));
  populateAdminCatSelect();
  renderAdminMatches();
  renderAdminDirects();
  // add admin quick actions
  const nav = document.querySelector('.nav-buttons');
  const a = document.createElement('button'); a.className='nav-btn ghost'; a.textContent='Listado equipos';
  a.onclick = ()=> { $('#btn-equipos').click(); setTimeout(()=> openCategory(data.categories[0].id),120); };
  nav.insertBefore(a, nav.firstChild);

  const editPod = document.createElement('button'); editPod.className='nav-btn ghost'; editPod.textContent='Editar Podio';
  editPod.onclick = ()=> {
    const p1 = prompt('1º lugar', data.podium[0]) || '';
    const p2 = prompt('2º lugar', data.podium[1]) || '';
    const p3 = prompt('3º lugar', data.podium[2]) || '';
    data.podium = [p1,p2,p3]; saveData(data); renderPodium();
  };
  nav.appendChild(editPod);
}

// admin actions (listeners)
$('#add-cat').addEventListener('click', ()=>{
  const label = $('#new-cat-label').value.trim();
  if(!label) return alert('Escribe etiqueta');
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g,'_') + '_' + Date.now().toString(36).slice(-4);
  data.categories.push({id, label, teams:[]});
  saveData(data); $('#new-cat-label').value=''; populateAdminCatSelect(); buildCategories();
});

$('#admin-add-team').addEventListener('click', ()=>{
  const selectId = $('#admin-cat-select').value;
  const team = $('#admin-new-team').value.trim();
  if(!team) return alert('Escribe el nombre del equipo');
  const cat = data.categories.find(c=>c.id===selectId); if(!cat) return;
  cat.teams.push(team); saveData(data); $('#admin-new-team').value=''; buildCategories();
});

$('#admin-add-match').addEventListener('click', ()=>{
  const d = $('#m-date').value; const h = $('#m-home').value.trim(); const a = $('#m-away').value.trim(); const p = $('#m-place').value.trim();
  if(!d || !h || !a) return alert('Rellena fecha/local/visitante');
  const id = 'm' + Date.now().toString(36);
  data.matches.push({id, date:d, home:h, away:a, place:p});
  saveData(data); $('#m-date').value=''; $('#m-home').value=''; $('#m-away').value=''; $('#m-place').value='';
  renderAdminMatches(); renderMatchesList();
});

$('#admin-add-direct').addEventListener('click', ()=>{
  const t = $('#d-title').value.trim(); const u = $('#d-url').value.trim();
  if(!t || !u) return alert('Rellena titulo y URL');
  data.directs.push({title:t, url:u}); saveData(data); $('#d-title').value=''; $('#d-url').value='';
  renderDirects(); renderAdminDirects();
});

$('#admin-logout').addEventListener('click', ()=> location.reload());

$('#back-from-teams').addEventListener('click', ()=> hide($('.teams-list')));

// initial render
buildCategories();
renderPodium();
renderDirects();
renderMatchesList();
