/* app.js — organized app with full labels, admin-only edit UI */
const ADMIN_PASSWORD = window.APP_ADMIN_PASSWORD || 'Pl4s3nc1a!Adm1n#2025';

// NAV and views
const btnEquipos = document.getElementById('btnEquipos');
const btnPartidos = document.getElementById('btnPartidos');
const btnPodio = document.getElementById('btnPodio');
const btnDirectos = document.getElementById('btnDirectos');
const btnClasificacion = document.getElementById('btnClasificacion');
const btnEntrarAdmin = document.getElementById('btnEntrarAdmin');

const views = {
  equipos: document.getElementById('teamsView'),
  partidos: document.getElementById('matchesView'),
  podio: document.getElementById('podioView'),
  directos: document.getElementById('directosView'),
  clasificacion: document.getElementById('clasificacionView'),
};

function showView(name){ Object.values(views).forEach(v=>v.classList.add('hidden')); if(views[name]) views[name].classList.remove('hidden'); }
btnEquipos.addEventListener('click', ()=> showView('equipos'));
btnPartidos.addEventListener('click', ()=> showView('partidos'));
btnPodio.addEventListener('click', ()=> showView('podio'));
btnDirectos.addEventListener('click', ()=> showView('directos'));
btnClasificacion.addEventListener('click', ()=> showView('clasificacion'));
showView('equipos');

// ADMIN modal and panel
const adminModal = document.getElementById('adminModal');
const cancelLogin = document.getElementById('cancelLogin');
const submitLogin = document.getElementById('submitLogin');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const adminSection = document.getElementById('adminSection');
const btnLogout = document.getElementById('btnLogout');

btnEntrarAdmin.addEventListener('click', ()=>{ adminModal.classList.remove('hidden'); });
cancelLogin.addEventListener('click', ()=>{ adminModal.classList.add('hidden'); });

submitLogin.addEventListener('click', (e)=>{ e.preventDefault(); if(adminPassword.value === ADMIN_PASSWORD){ adminModal.classList.add('hidden'); adminPassword.value = ''; loginError.classList.add('hidden'); adminSection.classList.remove('hidden'); localStorage.setItem('isAdmin','1'); initAdminUI(); } else { loginError.classList.remove('hidden'); } });

btnLogout.addEventListener('click', ()=>{ adminSection.classList.add('hidden'); localStorage.removeItem('isAdmin'); renderTeams(); renderMatches(); renderDirectos(); renderAdminLists(); });

if(localStorage.getItem('isAdmin') === '1'){ adminSection.classList.remove('hidden'); initAdminUI(); }

// HELPERS
function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>{ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(); r.readAsDataURL(file); }); }

// TEAMS CRUD
const formAddTeam = document.getElementById('formAddTeam');
const editingTeamId = document.getElementById('editingTeamId');
const teamName = document.getElementById('teamName');
const teamClub = document.getElementById('teamClub');
const teamCategories = document.getElementById('teamCategories');
const teamPhoto = document.getElementById('teamPhoto');
const photoPreview = document.getElementById('photoPreview');
const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const cancelEditTeam = document.getElementById('cancelEditTeam');
const saveTeamBtn = document.getElementById('saveTeamBtn');

teamPhoto.addEventListener('change', async ()=>{ const f = teamPhoto.files[0]; if(!f) return; if(f.size > 6*1024*1024){ alert('Imagen mayor a 6MB'); teamPhoto.value=''; return; } const dataUrl = await fileToDataURL(f); teamPhoto.dataset.dataurl = dataUrl; photoPreview.src = dataUrl; photoPreviewContainer.classList.remove('hidden'); });

formAddTeam.addEventListener('submit', (e)=>{ e.preventDefault(); const idEdit = editingTeamId.value; const t = { id: idEdit ? Number(idEdit) : Date.now(), name: teamName.value.trim(), club: teamClub.value.trim(), categories: teamCategories.value.trim(), photo: teamPhoto.dataset.dataurl || null }; if(!t.name){ alert('El nombre del equipo es obligatorio'); return; } let teams = JSON.parse(localStorage.getItem('teams')||'[]'); if(idEdit){ teams = teams.map(tt=> tt.id===t.id ? t : tt); editingTeamId.value=''; cancelEditTeam.classList.add('hidden'); saveTeamBtn.textContent='Guardar equipo'; } else { teams.push(t); } localStorage.setItem('teams', JSON.stringify(teams)); formAddTeam.reset(); teamPhoto.dataset.dataurl=''; photoPreviewContainer.classList.add('hidden'); renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); });

cancelEditTeam.addEventListener('click', ()=>{ editingTeamId.value=''; formAddTeam.reset(); teamPhoto.dataset.dataurl=''; photoPreviewContainer.classList.add('hidden'); cancelEditTeam.classList.add('hidden'); saveTeamBtn.textContent='Guardar equipo'; });

function renderTeams(){ const teams = JSON.parse(localStorage.getItem('teams')||'[]'); const container = document.getElementById('teamsContainer'); if(!container) return; if(teams.length===0){ container.innerHTML = '<p class="summary">No hay equipos aún.</p>'; return; } const isAdmin = localStorage.getItem('isAdmin')==='1'; container.innerHTML = teams.map(t=>`<div class="teamCard" data-id="${t.id}">${t.photo?`<img src="${t.photo}">`:''}<div style="flex:1"><strong>${escapeHtml(t.name)}</strong><br><small style="color:var(--muted)">${escapeHtml(t.club)}</small><br><small style="color:var(--muted)">${escapeHtml(t.categories)}</small></div>${ isAdmin?`<div style="display:flex;flex-direction:column;gap:6px"><button class="small-btn edit-team" data-id="${t.id}">Editar</button><button class="small-btn delete-team delete-btn" data-id="${t.id}">Eliminar</button></div>`:''}</div>`).join(''); }

// admin lists
function renderAdminLists(){ const teams = JSON.parse(localStorage.getItem('teams')||'[]'); const matches = JSON.parse(localStorage.getItem('matches')||'[]'); const teamsList = document.getElementById('adminTeamsList'); const matchesList = document.getElementById('adminMatchesList'); if(teamsList){ teamsList.innerHTML = teams.map(t=>`<div class="teamRow"><div><strong>${escapeHtml(t.name)}</strong></div><div><button class="small-btn edit-team" data-id="${t.id}">Editar</button> <button class="small-btn delete-team delete-btn" data-id="${t.id}">Eliminar</button></div></div>`).join('') || '<p class="summary">No hay equipos</p>'; } if(matchesList){ matchesList.innerHTML = matches.map(m=>{ const home = teams.find(tt=>String(tt.id)===String(m.homeId)); const away = teams.find(tt=>String(tt.id)===String(m.awayId)); return `<div class="matchRow"><div>${escapeHtml(home?home.name:'--')} vs ${escapeHtml(away?away.name:'--')} - ${m.datetime?new Date(m.datetime).toLocaleString():'Fecha no asignada'}</div><div><button class="small-btn edit-match" data-id='${m.id}'>Editar</button> <button class="small-btn delete-match delete-btn" data-id='${m.id}'>Eliminar</button></div></div>`; }).join('') || '<p class="summary">No hay partidos</p>'; } }

// delegation handlers
document.addEventListener('click', (e)=>{ // delete team
  if(e.target.classList && e.target.classList.contains('delete-team')){ const id = e.target.dataset.id; if(!confirm('Eliminar equipo?')) return; let teams = JSON.parse(localStorage.getItem('teams')||'[]'); teams = teams.filter(t=>String(t.id)!==String(id)); localStorage.setItem('teams', JSON.stringify(teams)); renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); renderMatches(); return; }
  // edit team
  if(e.target.classList && e.target.classList.contains('edit-team')){ const id = e.target.dataset.id; const teams = JSON.parse(localStorage.getItem('teams')||'[]'); const t = teams.find(tt=>String(tt.id)===String(id)); if(!t) return; editingTeamId.value = t.id; teamName.value = t.name; teamClub.value = t.club; teamCategories.value = t.categories; if(t.photo){ teamPhoto.dataset.dataurl = t.photo; photoPreview.src = t.photo; photoPreviewContainer.classList.remove('hidden'); } cancelEditTeam.classList.remove('hidden'); saveTeamBtn.textContent='Actualizar equipo'; window.scrollTo({top:0, behavior:'smooth'}); showView('equipos'); return; }
  // delete match
  if(e.target.classList && e.target.classList.contains('delete-match')){ const id = e.target.dataset.id; if(!confirm('Eliminar partido?')) return; let matches = JSON.parse(localStorage.getItem('matches')||'[]'); matches = matches.filter(m=>String(m.id)!==String(id)); localStorage.setItem('matches', JSON.stringify(matches)); renderMatches(); renderAdminLists(); return; }
  // edit match
  if(e.target.classList && e.target.classList.contains('edit-match')){ const id = e.target.dataset.id; const matches = JSON.parse(localStorage.getItem('matches')||'[]'); const m = matches.find(mm=>String(mm.id)===String(id)); if(!m) return; document.getElementById('editingMatchId').value = m.id; document.getElementById('matchHome').value = m.homeId; document.getElementById('matchAway').value = m.awayId; document.getElementById('matchDate').value = m.datetime || ''; document.getElementById('matchResult').value = m.result || ''; document.getElementById('cancelEditMatch').classList.remove('hidden'); document.getElementById('saveMatchBtn').textContent = 'Actualizar partido'; const remaining = matches.filter(mm=>String(mm.id)!==String(id)); localStorage.setItem('matches', JSON.stringify(remaining)); renderMatches(); showView('partidos'); window.scrollTo({top:0, behavior:'smooth'); return; } });

// populate selects
function populateMatchTeamsSelects(){ const teams = JSON.parse(localStorage.getItem('teams')||'[]'); const options = ['<option value="">-- seleccionar --</option>'].concat(teams.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`)).join(''); document.getElementById('matchHome').innerHTML = options; document.getElementById('matchAway').innerHTML = options; }

// MATCHES CRUD
const formAddMatch = document.getElementById('formAddMatch');
const editingMatchId = document.getElementById('editingMatchId');
const matchHome = document.getElementById('matchHome');
const matchAway = document.getElementById('matchAway');
const matchDate = document.getElementById('matchDate');
const matchResult = document.getElementById('matchResult');
const matchList = document.getElementById('matchList');
const cancelEditMatch = document.getElementById('cancelEditMatch');
const saveMatchBtn = document.getElementById('saveMatchBtn');

formAddMatch.addEventListener('submit', (e)=>{ e.preventDefault(); if(matchDate.value){ const picked = new Date(matchDate.value); if(picked < new Date()){ alert('La fecha no puede ser en el pasado'); return; } } if(!matchHome.value || !matchAway.value){ alert('Selecciona ambos equipos'); return; } if(matchHome.value === matchAway.value){ alert('Los equipos deben ser distintos'); return; } const idEdit = editingMatchId.value; const m = { id: idEdit ? Number(idEdit) : Date.now(), homeId: matchHome.value, awayId: matchAway.value, datetime: matchDate.value || null, result: matchResult.value || null }; let matches = JSON.parse(localStorage.getItem('matches')||'[]'); if(idEdit){ matches = matches.map(mm=> mm.id===m.id ? m : mm); editingMatchId.value=''; cancelEditMatch.classList.add('hidden'); saveMatchBtn.textContent='Guardar partido'; } else { matches.push(m); } localStorage.setItem('matches', JSON.stringify(matches)); formAddMatch.reset(); renderMatches(); renderAdminLists(); });

cancelEditMatch.addEventListener('click', ()=>{ editingMatchId.value=''; formAddMatch.reset(); cancelEditMatch.classList.add('hidden'); saveMatchBtn.textContent='Guardar partido'; });

// renderMatches
function renderMatches(){ const matches = JSON.parse(localStorage.getItem('matches')||'[]'); const teams = JSON.parse(localStorage.getItem('teams')||'[]'); if(matches.length===0){ matchList.innerHTML = '<p class="summary">No hay partidos programados.</p>'; return; } const isAdmin = localStorage.getItem('isAdmin')==='1'; matchList.innerHTML = matches.map(m=>{ const home = teams.find(t=>String(t.id)===String(m.homeId)); const away = teams.find(t=>String(t.id)===String(m.awayId)); const dateStr = m.datetime ? new Date(m.datetime).toLocaleString() : 'Fecha no asignada'; const res = m.result ? `<strong>${escapeHtml(m.result)}</strong>` : '<em>Por jugar</em>'; return `<div class="match-item" data-id="${m.id}"><div class="match-left"><div><strong>${escapeHtml(home?home.name:'--')}</strong> vs <strong>${escapeHtml(away?away.name:'--')}</strong></div><div style="font-size:13px;color:var(--muted)">${dateStr}</div></div><div style="display:flex;gap:8px;align-items:center"><div>${res}</div>${ isAdmin ? `<button class="small-btn edit-match" data-id='${m.id}'>Editar</button> <button class="small-btn delete-match delete-btn" data-id='${m.id}'>Eliminar</button>` : ''}</div></div>`; }).join(''); }

// DIRECTOS
const formDirectos = document.getElementById('formDirectos');
const directoUrl = document.getElementById('directoUrl');
const directosDisplay = document.getElementById('directosDisplay');

formDirectos.addEventListener('submit', (e)=>{ e.preventDefault(); localStorage.setItem('directoUrl', directoUrl.value.trim()); renderDirectos(); alert('URL de directos guardada'); });
function renderDirectos(){ const url = localStorage.getItem('directoUrl') || ''; directosDisplay.innerHTML = url ? `<a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a>` : '<p class="summary">No hay directo configurado.</p>'; }

// EXPORT / IMPORT
document.getElementById('exportData').addEventListener('click', ()=>{ const data = { teams: JSON.parse(localStorage.getItem('teams')||'[]'), matches: JSON.parse(localStorage.getItem('matches')||'[]'), directoUrl: localStorage.getItem('directoUrl')||'' }; const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'plasencia_backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });

document.getElementById('importFile').addEventListener('change', (e)=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ()=>{ try{ const data = JSON.parse(r.result); if(Array.isArray(data.teams)) localStorage.setItem('teams', JSON.stringify(data.teams)); if(Array.isArray(data.matches)) localStorage.setItem('matches', JSON.stringify(data.matches)); if(typeof data.directoUrl==='string') localStorage.setItem('directoUrl', data.directoUrl); alert('Importación completada'); renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists(); }catch(err){ alert('Fichero JSON inválido'); } }; r.readAsText(f); });

// CLEAR ALL
document.getElementById('clearAll').addEventListener('click', ()=>{ if(!confirm('Eliminar todos los datos guardados?')) return; localStorage.removeItem('teams'); localStorage.removeItem('matches'); localStorage.removeItem('directoUrl'); renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists(); alert('Datos eliminados'); });

// INIT admin lists and selects
function initAdminUI(){ populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderDirectos(); renderAdminLists(); }

// initial render on load
renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists();
