
/* app.js: teams, matches, directos editable & saved */
document.addEventListener('DOMContentLoaded', function() {
  const ADMIN_PASSWORD = window.APP_ADMIN_PASSWORD || 'admin';

  // nav
  const btnEquipos = document.getElementById('btnEquipos');
  const btnPartidos = document.getElementById('btnPartidos');
  const btnPodio = document.getElementById('btnPodio');
  const btnDirectos = document.getElementById('btnDirectos');
  const btnClasificacion = document.getElementById('btnClasificacion');
  const btnEntrarAdmin = document.getElementById('btnEntrarAdmin');
  const views = { equipos: document.getElementById('teamsView'), partidos: document.getElementById('matchesView'), podio: document.getElementById('podioView'), directos: document.getElementById('directosView'), clasificacion: document.getElementById('clasificacionView') };
  function hideAll(){ Object.values(views).forEach(v=>{ if(v) v.classList.add('hidden'); }); }
  function show(name){ hideAll(); if(views[name]) views[name].classList.remove('hidden'); }
  btnEquipos && btnEquipos.addEventListener('click', ()=> show('equipos'));
  btnPartidos && btnPartidos.addEventListener('click', ()=> show('partidos'));
  btnPodio && btnPodio.addEventListener('click', ()=> show('podio'));
  btnDirectos && btnDirectos.addEventListener('click', ()=> show('directos'));
  btnClasificacion && btnClasificacion.addEventListener('click', ()=> show('clasificacion'));

  // admin modal/panel
  const adminModal = document.getElementById('adminModal');
  const submitLogin = document.getElementById('submitLogin');
  const cancelLogin = document.getElementById('cancelLogin');
  const adminPassword = document.getElementById('adminPassword');
  const adminSection = document.getElementById('adminSection');
  const btnLogout = document.getElementById('btnLogout');
  btnEntrarAdmin && btnEntrarAdmin.addEventListener('click', ()=> adminModal.classList.remove('hidden'));
  cancelLogin && cancelLogin.addEventListener('click', ()=> adminModal.classList.add('hidden'));
  submitLogin && submitLogin.addEventListener('click', function(e){ e.preventDefault(); const pass = adminPassword && adminPassword.value ? adminPassword.value : ''; if(pass === ADMIN_PASSWORD){ adminModal.classList.add('hidden'); adminPassword.value=''; adminSection.classList.remove('hidden'); localStorage.setItem('isAdmin','1'); initAdminUI(); } else { alert('Contraseña incorrecta'); } });
  btnLogout && btnLogout.addEventListener('click', function(){ adminSection.classList.add('hidden'); localStorage.removeItem('isAdmin'); renderTeams(); renderMatches(); renderAdminLists(); });

  // storage helpers
  function safeParse(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ console.error('parse',e); return []; } }
  function safeSet(key,val){ try{ localStorage.setItem(key, JSON.stringify(val)); return true; }catch(e){ console.error('set',e); return false; } }

  // elements teams
  const formAddTeam = document.getElementById('formAddTeam');
  const editingTeamId = document.getElementById('editingTeamId');
  const teamName = document.getElementById('teamName');
  const teamClub = document.getElementById('teamClub');
  const teamCategories = document.getElementById('teamCategories');
  const teamPhoto = document.getElementById('teamPhoto');
  const photoPreview = document.getElementById('photoPreview');
  const photoPreviewContainer = document.getElementById('photoPreviewContainer');
  const cancelEditTeam = document.getElementById('cancelEditTeam');
  const adminTeamsList = document.getElementById('adminTeamsList');
  const teamsContainer = document.getElementById('teamsContainer');

  // elements matches
  const formAddMatch = document.getElementById('formAddMatch');
  const editingMatchId = document.getElementById('editingMatchId');
  const matchHome = document.getElementById('matchHome');
  const matchAway = document.getElementById('matchAway');
  const matchDate = document.getElementById('matchDate');
  const matchVenue = document.getElementById('matchVenue');
  const matchHomeGoals = document.getElementById('matchHomeGoals');
  const matchAwayGoals = document.getElementById('matchAwayGoals');
  const matchResult = document.getElementById('matchResult');
  const adminMatchesList = document.getElementById('adminMatchesList');
  const matchList = document.getElementById('matchList');

  // directos elements
  const formDirectos = document.getElementById('formDirectos');
  const directoUrl = document.getElementById('directoUrl');
  const deleteDirecto = document.getElementById('deleteDirecto');
  const directosDisplay = document.getElementById('directosDisplay');

  // image preview
  teamPhoto && teamPhoto.addEventListener('change', function(e){ const f = e.target.files && e.target.files[0]; if(!f) return; const reader = new FileReader(); reader.onload = function(){ teamPhoto.dataset.dataurl = reader.result; if(photoPreview){ photoPreview.src = reader.result; photoPreviewContainer.classList.remove('hidden'); } }; reader.readAsDataURL(f); });

  // TEAMS CRUD
  formAddTeam && formAddTeam.addEventListener('submit', function(e){ e.preventDefault(); const idEdit = editingTeamId && editingTeamId.value ? Number(editingTeamId.value) : null; const name = teamName && teamName.value ? teamName.value.trim() : ''; if(!name){ alert('El nombre del equipo es obligatorio'); return; } const t = { id: idEdit ? idEdit : Date.now(), name: name, club: teamClub.value || '', categories: teamCategories.value || '', photo: teamPhoto.dataset && teamPhoto.dataset.dataurl ? teamPhoto.dataset.dataurl : null }; let teams = safeParse('teams'); if(idEdit){ teams = teams.map(x => x.id === idEdit ? t : x); } else { teams.push(t); } const ok = safeSet('teams', teams); if(!ok){ alert('No se pudo guardar el equipo'); return; } formAddTeam.reset(); if(teamPhoto) teamPhoto.dataset.dataurl = ''; if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden'); if(editingTeamId) editingTeamId.value = ''; if(cancelEditTeam) cancelEditTeam.classList.add('hidden'); console.log(idEdit ? 'Equipo actualizado' : 'Equipo añadido', t); renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); });

  cancelEditTeam && cancelEditTeam.addEventListener('click', function(){ if(editingTeamId) editingTeamId.value=''; if(formAddTeam) formAddTeam.reset(); if(teamPhoto) teamPhoto.dataset.dataurl = ''; if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden'); cancelEditTeam.classList.add('hidden'); });

  function renderTeams(){ const teams = safeParse('teams'); if(!teamsContainer) return; if(teams.length === 0){ teamsContainer.innerHTML = '<p class="summary">No hay equipos aún.</p>'; return; } const isAdmin = localStorage.getItem('isAdmin') === '1'; teamsContainer.innerHTML = teams.map(t => { const photo = t.photo ? '<img src="'+t.photo+'" alt="'+(t.name||'')+'">' : ''; const adminBtns = isAdmin ? '<div style="display:flex;flex-direction:column;gap:6px"><button class="small-btn edit-team" data-id="'+t.id+'">Editar</button> <button class="small-btn delete-team delete-btn" data-id="'+t.id+'">Eliminar</button></div>' : ''; return '<div class="teamCard" data-id="'+t.id+'">'+photo+'<div style="flex:1"><strong>'+escapeHtml(t.name)+'</strong><br><small style="color:var(--muted)">'+escapeHtml(t.club||'')+'</small><br><small style="color:var(--muted)">'+escapeHtml(t.categories||'')+'</small></div>'+adminBtns+'</div>'; }).join(''); }

  // MATCHES CRUD
  formAddMatch && formAddMatch.addEventListener('submit', function(e){ e.preventDefault(); const idEdit = editingMatchId && editingMatchId.value ? Number(editingMatchId.value) : null; if(!matchHome.value || !matchAway.value){ alert('Selecciona ambos equipos'); return; } if(matchHome.value === matchAway.value){ alert('Los equipos deben ser distintos'); return; } const m = { id: idEdit ? idEdit : Date.now(), homeId: matchHome.value, awayId: matchAway.value, datetime: matchDate.value || null, venue: matchVenue.value || '', homeGoals: matchHomeGoals.value !== '' ? Number(matchHomeGoals.value) : null, awayGoals: matchAwayGoals.value !== '' ? Number(matchAwayGoals.value) : null, result: matchResult.value || null }; let matches = safeParse('matches'); if(idEdit){ matches = matches.map(x => x.id === idEdit ? m : x); } else { matches.push(m); } const ok = safeSet('matches', matches); if(!ok){ alert('No se pudo guardar el partido'); return; } formAddMatch.reset(); if(editingMatchId) editingMatchId.value = ''; if(document.getElementById('cancelEditMatch')) document.getElementById('cancelEditMatch').classList.add('hidden'); console.log(idEdit ? 'Partido actualizado' : 'Partido añadido', m); renderMatches(); renderAdminLists(); });

  function renderMatches(){ const matches = safeParse('matches'); const teams = safeParse('teams'); if(!matchList) return; if(matches.length === 0){ matchList.innerHTML = '<p class="summary">No hay partidos programados.</p>'; return; } matchList.innerHTML = matches.map(m => { const home = teams.find(t => String(t.id) === String(m.homeId)); const away = teams.find(t => String(t.id) === String(m.awayId)); const dateStr = m.datetime ? new Date(m.datetime).toLocaleString() : 'Fecha no asignada'; const venue = m.venue ? '<div style="font-size:13px;color:var(--muted)">Pabellón: '+escapeHtml(m.venue)+'</div>' : ''; const score = (typeof m.homeGoals === 'number' && typeof m.awayGoals === 'number') ? '<div style="font-size:18px;font-weight:700">'+m.homeGoals+' : '+m.awayGoals+'</div>' : (m.result ? '<div style="font-size:16px;font-weight:600">'+escapeHtml(m.result)+'</div>' : '<div style="font-size:13px;color:var(--muted)">Por jugar</div>'); return '<div class="match-item" data-id="'+m.id+'"><div><strong>'+escapeHtml(home?home.name:'--')+'</strong> vs <strong>'+escapeHtml(away?away.name:'--')+'</strong><div style="font-size:13px;color:var(--muted)">'+dateStr+'</div>'+venue+'</div><div style="display:flex;flex-direction:column;align-items:flex-end">'+score+'</div></div>'; }).join(''); }

  // DIRECTOS CRUD
  formDirectos && formDirectos.addEventListener('submit', function(e){ e.preventDefault(); if(directoUrl) { localStorage.setItem('directoUrl', directoUrl.value.trim()); renderDirectos(); alert('URL guardada'); } });
  deleteDirecto && deleteDirecto.addEventListener('click', function(){ if(!confirm('Eliminar URL del directo?')) return; localStorage.removeItem('directoUrl'); renderDirectos(); renderAdminLists(); alert('URL eliminada'); });

  function renderDirectos(){ const url = localStorage.getItem('directoUrl') || ''; if(!directosDisplay) return; directosDisplay.innerHTML = url ? '<a href="'+escapeHtml(url)+'" target="_blank" rel="noopener">'+escapeHtml(url)+'</a>' : '<p class="summary">No hay directo configurado.</p>'; }

  // admin lists & delegation
  function renderAdminLists(){ const teams = safeParse('teams'); const matches = safeParse('matches'); adminTeamsList && (adminTeamsList.innerHTML = teams.map(t => '<div class="teamRow"><div><strong>'+escapeHtml(t.name)+'</strong></div><div><button class="small-btn edit-team" data-id="'+t.id+'">Editar</button> <button class="small-btn delete-team delete-btn" data-id="'+t.id+'">Eliminar</button></div></div>').join('') || '<p class="summary">No hay equipos</p>'); adminMatchesList && (adminMatchesList.innerHTML = matches.map(m => { const home = teams.find(tt => String(tt.id) === String(m.homeId)); const away = teams.find(tt => String(tt.id) === String(m.awayId)); const venue = m.venue ? ' - '+escapeHtml(m.venue) : ''; const score = (typeof m.homeGoals === 'number' && typeof m.awayGoals === 'number') ? ' ('+m.homeGoals+':'+m.awayGoals+')' : (m.result ? ' ('+escapeHtml(m.result)+')' : ''); return '<div class="matchRow"><div>'+escapeHtml(home?home.name:'--')+' vs '+escapeHtml(away?away.name:'--')+' - '+(m.datetime?new Date(m.datetime).toLocaleString():'Fecha no asignada')+venue+score+'</div><div><button class="small-btn edit-match" data-id="'+m.id+'">Editar</button> <button class="small-btn delete-match delete-btn" data-id="'+m.id+'">Eliminar</button></div></div>'; }).join('') || '<p class="summary">No hay partidos</p>'); if(localStorage.getItem('directoUrl') && document.getElementById('directoUrl')) document.getElementById('directoUrl').value = localStorage.getItem('directoUrl'); }

  document.addEventListener('click', function(e){ const target = e.target; if(!target) return;
    if(target.classList.contains('delete-team')){ const id = target.dataset.id; if(!confirm('Eliminar equipo?')) return; let teams = safeParse('teams'); teams = teams.filter(t => String(t.id) !== String(id)); safeSet('teams', teams); renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); renderMatches(); return; }
    if(target.classList.contains('edit-team')){ const id = target.dataset.id; const teams = safeParse('teams'); const t = teams.find(tt => String(tt.id) === String(id)); if(!t) return; editingTeamId.value = t.id; teamName.value = t.name; teamClub.value = t.club || ''; teamCategories.value = t.categories || ''; if(t.photo){ teamPhoto.dataset.dataurl = t.photo; photoPreview && (photoPreview.src = t.photo); photoPreviewContainer && photoPreviewContainer.classList.remove('hidden'); } cancelEditTeam && cancelEditTeam.classList.remove('hidden'); renderTeams(); show('equipos'); return; }
    if(target.classList.contains('delete-match')){ const id = target.dataset.id; if(!confirm('Eliminar partido?')) return; let matches = safeParse('matches'); matches = matches.filter(m => String(m.id) !== String(id)); safeSet('matches', matches); renderMatches(); renderAdminLists(); return; }
    if(target.classList.contains('edit-match')){ const id = target.dataset.id; const matches = safeParse('matches'); const m = matches.find(mm => String(mm.id) === String(id)); if(!m) return; editingMatchId.value = m.id; matchHome.value = m.homeId; matchAway.value = m.awayId; matchDate.value = m.datetime || ''; matchVenue.value = m.venue || ''; matchHomeGoals.value = typeof m.homeGoals === 'number' ? m.homeGoals : (m.homeGoals || ''); matchAwayGoals.value = typeof m.awayGoals === 'number' ? m.awayGoals : (m.awayGoals || ''); matchResult.value = m.result || ''; const remaining = matches.filter(mm => String(mm.id) !== String(id)); safeSet('matches', remaining); renderMatches(); renderAdminLists(); show('partidos'); return; }
  });

  // populate selects
  function populateMatchTeamsSelects(){ const teams = safeParse('teams'); const opts = ['<option value="">-- seleccionar --</option>'].concat(teams.map(t => '<option value="'+t.id+'">'+escapeHtml(t.name)+'</option>')).join(''); if(matchHome) matchHome.innerHTML = opts; if(matchAway) matchAway.innerHTML = opts; }

  // init admin UI
  function initAdminUI(){ populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderAdminLists(); renderDirectos(); }
  populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderAdminLists(); renderDirectos();

  // escape helper
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
});
