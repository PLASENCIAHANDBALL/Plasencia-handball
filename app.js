
/* app.js — corrected: robust team saving and overall app behavior */
document.addEventListener('DOMContentLoaded', function() {
  const ADMIN_PASSWORD = window.APP_ADMIN_PASSWORD || 'Pl4s3nc1a!Adm1n#2025';

  // NAV
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

  function hideAll(){ Object.values(views).forEach(v=>{ if(v) v.classList.add('hidden'); }); }
  function show(name){ hideAll(); if(views[name]) views[name].classList.remove('hidden'); }

  if(btnEquipos) btnEquipos.addEventListener('click', ()=> show('equipos'));
  if(btnPartidos) btnPartidos.addEventListener('click', ()=> show('partidos'));
  if(btnPodio) btnPodio.addEventListener('click', ()=> show('podio'));
  if(btnDirectos) btnDirectos.addEventListener('click', ()=> show('directos'));
  if(btnClasificacion) btnClasificacion.addEventListener('click', ()=> show('clasificacion'));
  show('equipos');

  // ADMIN
  const adminModal = document.getElementById('adminModal');
  const cancelLogin = document.getElementById('cancelLogin');
  const submitLogin = document.getElementById('submitLogin');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const adminSection = document.getElementById('adminSection');
  const btnLogout = document.getElementById('btnLogout');

  if(btnEntrarAdmin) btnEntrarAdmin.addEventListener('click', ()=>{ if(adminModal) adminModal.classList.remove('hidden'); });
  if(cancelLogin) cancelLogin.addEventListener('click', ()=>{ if(adminModal) adminModal.classList.add('hidden'); });
  if(submitLogin) submitLogin.addEventListener('click', function(e){ e.preventDefault(); const pass = adminPassword && adminPassword.value ? adminPassword.value : ''; if(pass === ADMIN_PASSWORD){ if(adminModal) adminModal.classList.add('hidden'); if(adminPassword) adminPassword.value=''; if(loginError) loginError.classList.add('hidden'); if(adminSection) adminSection.classList.remove('hidden'); localStorage.setItem('isAdmin','1'); initAdminUI(); } else { if(loginError) loginError.classList.remove('hidden'); } });
  if(btnLogout) btnLogout.addEventListener('click', ()=>{ if(adminSection) adminSection.classList.add('hidden'); localStorage.removeItem('isAdmin'); renderTeams(); renderMatches(); renderDirectos(); renderAdminLists(); });
  if(localStorage.getItem('isAdmin') === '1'){ if(adminSection) adminSection.classList.remove('hidden'); initAdminUI(); }

  // helpers
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }
  function fileToDataURL(file){ return new Promise((res, rej)=>{ const r = new FileReader(); r.onload = ()=> res(r.result); r.onerror = ()=> rej(); r.readAsDataURL(file); }); }
  function safeParse(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ console.warn('Error parseando ' + key, e); return []; } }
  function safeSet(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); return true; }catch(e){ console.error('Error guardando ' + key, e); return false; } }

  // ELEMENTS - Teams
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
  const teamsContainer = document.getElementById('teamsContainer');
  const adminTeamsList = document.getElementById('adminTeamsList');

  // team photo preview
  if(teamPhoto){ teamPhoto.addEventListener('change', async ()=>{ const f = teamPhoto.files[0]; if(!f) return; if(f.size > 6*1024*1024){ alert('Imagen mayor a 6MB'); teamPhoto.value=''; return; } try{ const dataUrl = await fileToDataURL(f); teamPhoto.dataset.dataurl = dataUrl; if(photoPreview) photoPreview.src = dataUrl; if(photoPreviewContainer) photoPreviewContainer.classList.remove('hidden'); }catch(err){ console.error('Error leyendo imagen', err); } }); }

  // save team handler (robust)
  if(formAddTeam){ formAddTeam.addEventListener('submit', (e)=>{ e.preventDefault(); try{ const idEdit = editingTeamId && editingTeamId.value ? editingTeamId.value : null; const name = teamName && teamName.value ? teamName.value.trim() : ''; const club = teamClub && teamClub.value ? teamClub.value.trim() : ''; const categories = teamCategories && teamCategories.value ? teamCategories.value.trim() : ''; const photo = teamPhoto && teamPhoto.dataset && teamPhoto.dataset.dataurl ? teamPhoto.dataset.dataurl : null; if(!name){ alert('El nombre del equipo es obligatorio'); return; } const teamObj = { id: idEdit ? Number(idEdit) : Date.now(), name: name, club: club, categories: categories, photo: photo }; let teams = safeParse('teams'); if(idEdit){ teams = teams.map(t => t.id === teamObj.id ? teamObj : t); } else { teams.push(teamObj); } const ok = safeSet('teams', teams); if(!ok){ alert('No se pudo guardar el equipo en localStorage'); return; } formAddTeam.reset(); if(teamPhoto) teamPhoto.dataset.dataurl = ''; if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden'); if(editingTeamId) editingTeamId.value = ''; if(cancelEditTeam) cancelEditTeam.classList.add('hidden'); if(saveTeamBtn) saveTeamBtn.textContent = 'Guardar equipo'; console.log(idEdit ? 'Equipo actualizado:' : 'Equipo añadido:', teamObj); renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); }catch(err){ console.error('Error en submit equipo', err); alert('Ha ocurrido un error al guardar el equipo. Revisa la consola.'); } }); }

  if(cancelEditTeam){ cancelEditTeam.addEventListener('click', ()=>{ if(editingTeamId) editingTeamId.value = ''; if(formAddTeam) formAddTeam.reset(); if(teamPhoto) teamPhoto.dataset.dataurl = ''; if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden'); cancelEditTeam.classList.add('hidden'); if(saveTeamBtn) saveTeamBtn.textContent = 'Guardar equipo'; }); }

  function renderTeams(){ try{ const teams = safeParse('teams'); if(!teamsContainer) return; if(teams.length === 0){ teamsContainer.innerHTML = '<p class=\"summary\">No hay equipos aún.</p>'; return; } const isAdmin = localStorage.getItem('isAdmin') === '1'; teamsContainer.innerHTML = teams.map(t => { const photoHtml = t.photo ? `<img src=\"${t.photo}\" alt=\"${escapeHtml(t.name)}\">` : ''; const adminButtons = isAdmin ? `<div style=\"display:flex;flex-direction:column;gap:6px\"><button class=\"small-btn edit-team\" data-id=\"${t.id}\">Editar</button><button class=\"small-btn delete-team delete-btn\" data-id=\"${t.id}\">Eliminar</button></div>` : ''; return `<div class=\"teamCard\" data-id=\"${t.id}\">${photoHtml}<div style=\"flex:1\"><strong>${escapeHtml(t.name)}</strong><br><small style=\"color:var(--muted)\">${escapeHtml(t.club||'')}</small><br><small style=\"color:var(--muted)\">${escapeHtml(t.categories||'')}</small></div>${adminButtons}</div>`; }).join(''); console.log('renderTeams: mostrados', teams.length); }catch(err){ console.error('Error renderTeams', err); } }

  // Matches & Directos simplified (use previous logic, focusing on teams issue)
  const formAddMatch = document.getElementById('formAddMatch');
  const editingMatchId = document.getElementById('editingMatchId');
  const matchHome = document.getElementById('matchHome');
  const matchAway = document.getElementById('matchAway');
  const matchDateEl = document.getElementById('matchDate');
  const matchVenueEl = document.getElementById('matchVenue');
  const matchHomeGoalsEl = document.getElementById('matchHomeGoals');
  const matchAwayGoalsEl = document.getElementById('matchAwayGoals');
  const matchResultEl = document.getElementById('matchResult');
  const matchList = document.getElementById('matchList');
  const cancelEditMatchEl = document.getElementById('cancelEditMatch');
  const saveMatchBtnEl = document.getElementById('saveMatchBtn');

  function populateMatchTeamsSelects(){ const teams = safeParse('teams'); const options = ['<option value=\"\">-- seleccionar --</option>'].concat(teams.map(t=>`<option value=\"${t.id}\">${escapeHtml(t.name)}</option>`)).join(''); if(matchHome) matchHome.innerHTML = options; if(matchAway) matchAway.innerHTML = options; }

  if(formAddMatch){ formAddMatch.addEventListener('submit', function(e){ e.preventDefault(); if(!matchHome.value || !matchAway.value){ alert('Selecciona ambos equipos'); return; } if(matchHome.value === matchAway.value){ alert('Los equipos deben ser distintos'); return; } const idEdit = editingMatchId && editingMatchId.value ? editingMatchId.value : null; const homeGoals = matchHomeGoalsEl && matchHomeGoalsEl.value !== '' ? Number(matchHomeGoalsEl.value) : null; const awayGoals = matchAwayGoalsEl && matchAwayGoalsEl.value !== '' ? Number(matchAwayGoalsEl.value) : null; const m = { id: idEdit ? Number(idEdit) : Date.now(), homeId: matchHome.value, awayId: matchAway.value, datetime: matchDateEl.value || null, venue: matchVenueEl && matchVenueEl.value ? matchVenueEl.value.trim() : '', homeGoals: homeGoals, awayGoals: awayGoals, result: matchResultEl && matchResultEl.value ? matchResultEl.value.trim() : null }; let matches = safeParse('matches'); if(idEdit){ matches = matches.map(mm => mm.id === m.id ? m : mm); } else { matches.push(m); } const ok = safeSet('matches', matches); if(!ok){ alert('No se pudo guardar el partido'); return; } if(formAddMatch) formAddMatch.reset(); if(cancelEditMatchEl) cancelEditMatchEl.classList.add('hidden'); if(saveMatchBtnEl) saveMatchBtnEl.textContent = 'Guardar partido'; renderMatches(); renderAdminLists(); }); }

  function renderMatches(){ const matches = safeParse('matches'); const teams = safeParse('teams'); if(!matchList) return; if(matches.length === 0){ matchList.innerHTML = '<p class=\"summary\">No hay partidos programados.</p>'; return; } const isAdmin = localStorage.getItem('isAdmin') === '1'; matchList.innerHTML = matches.map(m => { const home = teams.find(t => String(t.id) === String(m.homeId)); const away = teams.find(t => String(t.id) === String(m.awayId)); const dateStr = m.datetime ? new Date(m.datetime).toLocaleString() : 'Fecha no asignada'; const venue = m.venue ? `<div style=\"font-size:13px;color:var(--muted)\">Pabellón: ${escapeHtml(m.venue)}</div>` : ''; const score = (typeof m.homeGoals === 'number' && typeof m.awayGoals === 'number') ? `<div style=\"font-size:18px;font-weight:700\">${m.homeGoals} : ${m.awayGoals}</div>` : (m.result ? `<div style=\"font-size:16px;font-weight:600\">${escapeHtml(m.result)}</div>` : '<div style=\"font-size:13px;color:var(--muted)\">Por jugar</div>'); return `<div class=\"match-item\" data-id=\"${m.id}\"><div class=\"match-left\"><div><strong>${escapeHtml(home?home.name:'--')}</strong> vs <strong>${escapeHtml(away?away.name:'--')}</strong></div><div style=\"font-size:13px;color:var(--muted)\">${dateStr}</div>${venue}</div><div style=\"display:flex;gap:8px;align-items:center;flex-direction:column\">${score}${ isAdmin ? `<div style=\"display:flex;gap:6px;margin-top:6px\"><button class=\"small-btn edit-match\" data-id='${m.id}'>Editar</button> <button class=\"small-btn delete-match delete-btn\" data-id='${m.id}'>Eliminar</button></div>` : ''}</div></div>`; }).join(''); }

  // Admin lists rendering and delegation for edit/delete
  function renderAdminLists(){ const teams = safeParse('teams'); const matches = safeParse('matches'); if(adminTeamsList){ adminTeamsList.innerHTML = teams.map(t => `<div class=\"teamRow\"><div><strong>${escapeHtml(t.name)}</strong></div><div><button class=\"small-btn edit-team\" data-id=\"${t.id}\">Editar</button> <button class=\"small-btn delete-team delete-btn\" data-id=\"${t.id}\">Eliminar</button></div></div>`).join('') || '<p class=\"summary\">No hay equipos</p>'; } const adminMatchesList = document.getElementById('adminMatchesList'); if(adminMatchesList){ adminMatchesList.innerHTML = matches.map(m => { const home = teams.find(tt => String(tt.id) === String(m.homeId)); const away = teams.find(tt => String(tt.id) === String(m.awayId)); const venue = m.venue ? ` - ${escapeHtml(m.venue)}` : ''; const score = (typeof m.homeGoals === 'number' && typeof m.awayGoals === 'number') ? ` (${m.homeGoals}:${m.awayGoals})` : (m.result ? ` (${escapeHtml(m.result)})` : ''); return `<div class=\"matchRow\"><div>${escapeHtml(home?home.name:'--')} vs ${escapeHtml(away?away.name:'--')} - ${m.datetime?new Date(m.datetime).toLocaleString():'Fecha no asignada'}${venue}${score}</div><div><button class=\"small-btn edit-match\" data-id='${m.id}'>Editar</button> <button class=\"small-btn delete-match delete-btn\" data-id='${m.id}'>Eliminar</button></div></div>`; }).join('') || '<p class=\"summary\">No hay partidos</p>'; } }

  document.addEventListener('click', function(e){ const target = e.target; if(!target) return;
    if(target.classList.contains('delete-team')){ const id = target.dataset.id; if(!confirm('Eliminar equipo?')) return; let teams = safeParse('teams'); teams = teams.filter(t => String(t.id) !== String(id)); safeSet('teams', teams); renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); renderMatches(); return; }
    if(target.classList.contains('edit-team')){ const id = target.dataset.id; const teams = safeParse('teams'); const t = teams.find(tt => String(tt.id) === String(id)); if(!t) return; if(editingTeamId) editingTeamId.value = t.id; if(teamName) teamName.value = t.name; if(teamClub) teamClub.value = t.club; if(teamCategories) teamCategories.value = t.categories; if(t.photo){ if(teamPhoto) teamPhoto.dataset.dataurl = t.photo; if(photoPreview) photoPreview.src = t.photo; if(photoPreviewContainer) photoPreviewContainer.classList.remove('hidden'); } if(cancelEditTeam) cancelEditTeam.classList.remove('hidden'); if(saveTeamBtn) saveTeamBtn.textContent = 'Actualizar equipo'; window.scrollTo({top:0, behavior:'smooth'}); show('equipos'); return; }
    if(target.classList.contains('delete-match')){ const id = target.dataset.id; if(!confirm('Eliminar partido?')) return; let matches = safeParse('matches'); matches = matches.filter(m => String(m.id) !== String(id)); safeSet('matches', matches); renderMatches(); renderAdminLists(); return; }
    if(target.classList.contains('edit-match')){ const id = target.dataset.id; const matches = safeParse('matches'); const m = matches.find(mm => String(mm.id) === String(id)); if(!m) return; if(editingMatchId) editingMatchId.value = m.id; if(matchHome) matchHome.value = m.homeId; if(matchAway) matchAway.value = m.awayId; if(matchDateEl) matchDateEl.value = m.datetime || ''; if(matchVenueEl) matchVenueEl.value = m.venue || ''; if(matchHomeGoalsEl) matchHomeGoalsEl.value = typeof m.homeGoals === 'number' ? m.homeGoals : (m.homeGoals || ''); if(matchAwayGoalsEl) matchAwayGoalsEl.value = typeof m.awayGoals === 'number' ? m.awayGoals : (m.awayGoals || ''); if(matchResultEl) matchResultEl.value = m.result || ''; if(cancelEditMatchEl) cancelEditMatchEl.classList.remove('hidden'); if(saveMatchBtnEl) saveMatchBtnEl.textContent = 'Actualizar partido'; const remaining = matches.filter(mm => String(mm.id) !== String(id)); safeSet('matches', remaining); renderMatches(); renderAdminLists(); show('partidos'); window.scrollTo({top:0, behavior:'smooth'}); return; }
  });

  // Directos
  const formDirectos = document.getElementById('formDirectos');
  const directoUrl = document.getElementById('directoUrl');
  const directosDisplay = document.getElementById('directosDisplay');
  const deleteDirectoBtn = document.getElementById('deleteDirecto');
  if(formDirectos){ formDirectos.addEventListener('submit', function(e){ e.preventDefault(); if(directoUrl) localStorage.setItem('directoUrl', directoUrl.value.trim()); renderDirectos(); alert('URL de directos guardada'); }); }
  if(deleteDirectoBtn){ deleteDirectoBtn.addEventListener('click', function(){ if(!confirm('Eliminar URL del directo?')) return; localStorage.removeItem('directoUrl'); renderDirectos(); renderAdminLists(); alert('URL eliminada'); }); }
  function renderDirectos(){ const url = localStorage.getItem('directoUrl') || ''; if(!directosDisplay) return; directosDisplay.innerHTML = url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>` : '<p class="summary">No hay directo configurado.</p>'; }

  // export/import
  const exportDataBtn = document.getElementById('exportData');
  const importFile = document.getElementById('importFile');
  if(exportDataBtn){ exportDataBtn.addEventListener('click', function(){ const data = { teams: safeParse('teams'), matches: safeParse('matches'), directoUrl: localStorage.getItem('directoUrl')||'' }; const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'plasencia_backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }); }
  if(importFile){ importFile.addEventListener('change', function(e){ const f = e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = function(){ try{ const data = JSON.parse(reader.result); if(Array.isArray(data.teams)) safeSet('teams', data.teams); if(Array.isArray(data.matches)) safeSet('matches', data.matches); if(typeof data.directoUrl === 'string') localStorage.setItem('directoUrl', data.directoUrl); alert('Importación completada'); renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists(); }catch(err){ alert('Fichero JSON inválido'); } }; reader.readAsText(f); }); }

  // init
  function initAdminUI(){ populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderDirectos(); renderAdminLists(); }
  populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderDirectos(); renderAdminLists();

});
