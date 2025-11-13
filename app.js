
/* Minimal, robust app.js for debugging */
document.addEventListener('DOMContentLoaded', function() {
  const ADMIN_PASSWORD = window.APP_ADMIN_PASSWORD || 'admin';

  // NAV buttons
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
    clasificacion: document.getElementById('clasificacionView')
  };

  function hideAll() { Object.keys(views).forEach(k => { if(views[k]) views[k].classList.add('hidden'); }); }
  function show(name) { hideAll(); if(views[name]) views[name].classList.remove('hidden'); }

  // attach nav events
  btnEquipos && btnEquipos.addEventListener('click', function(){ show('equipos'); console.log('NAV: equipos'); });
  btnPartidos && btnPartidos.addEventListener('click', function(){ show('partidos'); console.log('NAV: partidos'); });
  btnPodio && btnPodio.addEventListener('click', function(){ show('podio'); console.log('NAV: podio'); });
  btnDirectos && btnDirectos.addEventListener('click', function(){ show('directos'); console.log('NAV: directos'); });
  btnClasificacion && btnClasificacion.addEventListener('click', function(){ show('clasificacion'); console.log('NAV: clasificación'); });

  // show default
  show('equipos');

  // admin modal and panel
  const adminModal = document.getElementById('adminModal');
  const submitLogin = document.getElementById('submitLogin');
  const cancelLogin = document.getElementById('cancelLogin');
  const adminPassword = document.getElementById('adminPassword');
  const adminSection = document.getElementById('adminSection');
  const btnLogout = document.getElementById('btnLogout');

  btnEntrarAdmin && btnEntrarAdmin.addEventListener('click', function(){ adminModal.classList.remove('hidden'); });
  cancelLogin && cancelLogin.addEventListener('click', function(){ adminModal.classList.add('hidden'); });
  submitLogin && submitLogin.addEventListener('click', function(e){ e.preventDefault(); const pass = adminPassword && adminPassword.value ? adminPassword.value : ''; if(pass === ADMIN_PASSWORD){ adminModal.classList.add('hidden'); adminPassword.value=''; adminSection.classList.remove('hidden'); localStorage.setItem('isAdmin','1'); initAdminUI(); } else { alert('Contraseña incorrecta'); } });
  btnLogout && btnLogout.addEventListener('click', function(){ adminSection.classList.add('hidden'); localStorage.removeItem('isAdmin'); renderTeams(); renderMatches(); renderAdminLists(); });

  // helpers for storage
  function safeParse(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ console.error('parse error', e); return []; } }
  function safeSet(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e){ console.error('set error', e); return false; } }

  // elements for teams
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

  // image preview handler
  teamPhoto && teamPhoto.addEventListener('change', function(evt){
    const f = evt.target.files && evt.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(){ teamPhoto.dataset.dataurl = reader.result; if(photoPreview){ photoPreview.src = reader.result; photoPreviewContainer.classList.remove('hidden'); } };
    reader.readAsDataURL(f);
  });

  // submit team
  formAddTeam && formAddTeam.addEventListener('submit', function(e){
    e.preventDefault();
    const idEdit = editingTeamId && editingTeamId.value ? Number(editingTeamId.value) : null;
    const name = teamName && teamName.value ? teamName.value.trim() : '';
    if(!name){ alert('El nombre del equipo es obligatorio'); return; }
    const team = { id: idEdit ? idEdit : Date.now(), name: name, club: teamClub.value || '', categories: teamCategories.value || '', photo: teamPhoto.dataset && teamPhoto.dataset.dataurl ? teamPhoto.dataset.dataurl : null };
    let teams = safeParse('teams');
    if(idEdit){ teams = teams.map(t => t.id === idEdit ? team : t); console.log('Updating team', team); } else { teams.push(team); console.log('Adding team', team); }
    const ok = safeSet('teams', teams);
    if(!ok){ alert('No se pudo guardar en localStorage'); return; }
    formAddTeam.reset(); if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden'); if(editingTeamId) editingTeamId.value = ''; if(cancelEditTeam) cancelEditTeam.classList.add('hidden');
    renderTeams(); populateMatchTeamsSelects(); renderAdminLists();
  });

  cancelEditTeam && cancelEditTeam.addEventListener('click', function(){ if(editingTeamId) editingTeamId.value=''; formAddTeam.reset(); if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden'); cancelEditTeam.classList.add('hidden'); });

  function renderTeams(){
    const teams = safeParse('teams');
    if(!teamsContainer) return;
    if(teams.length === 0){ teamsContainer.innerHTML = '<p class="summary">No hay equipos aún.</p>'; return; }
    const isAdmin = localStorage.getItem('isAdmin') === '1';
    teamsContainer.innerHTML = teams.map(t => {
      const photoHtml = t.photo ? '<img src="'+t.photo+'" alt="'+(t.name||'')+'">' : '';
      const adminButtons = isAdmin ? '<div style="display:flex;flex-direction:column;gap:6px"><button class="small-btn edit-team" data-id="'+t.id+'">Editar</button> <button class="small-btn delete-team delete-btn" data-id="'+t.id+'">Eliminar</button></div>' : '';
      return '<div class="teamCard" data-id="'+t.id+'">'+photoHtml+'<div style="flex:1"><strong>'+escapeHtml(t.name)+'</strong><br><small style="color:var(--muted)">'+escapeHtml(t.club||'')+'</small><br><small style="color:var(--muted)">'+escapeHtml(t.categories||'')+'</small></div>'+adminButtons+'</div>';
    }).join('');
    console.log('renderTeams: mostrados', teams.length);
  }

  function populateMatchTeamsSelects(){
    const teams = safeParse('teams');
    const options = ['<option value="">-- seleccionar --</option>'].concat(teams.map(t => '<option value="'+t.id+'">'+escapeHtml(t.name)+'</option>')).join('');
    const matchHome = document.getElementById('matchHome');
    const matchAway = document.getElementById('matchAway');
    if(matchHome) matchHome.innerHTML = options;
    if(matchAway) matchAway.innerHTML = options;
  }

  function renderAdminLists(){
    const teams = safeParse('teams');
    adminTeamsList && (adminTeamsList.innerHTML = teams.map(t => '<div class="teamRow"><div><strong>'+escapeHtml(t.name)+'</strong></div><div><button class="small-btn edit-team" data-id="'+t.id+'">Editar</button> <button class="small-btn delete-team delete-btn" data-id="'+t.id+'">Eliminar</button></div></div>').join('') || '<p class="summary">No hay equipos</p>');
  }

  // generic click delegation for edit/delete
  document.addEventListener('click', function(e){
    const target = e.target;
    if(!target) return;
    if(target.classList.contains('delete-team')){
      const id = target.dataset.id;
      if(!confirm('Eliminar equipo?')) return;
      let teams = safeParse('teams');
      teams = teams.filter(t => String(t.id) !== String(id));
      safeSet('teams', teams);
      renderTeams(); populateMatchTeamsSelects(); renderAdminLists();
      return;
    }
    if(target.classList.contains('edit-team')){
      const id = target.dataset.id;
      const teams = safeParse('teams');
      const t = teams.find(x => String(x.id) === String(id));
      if(!t) return;
      editingTeamId.value = t.id;
      teamName.value = t.name;
      teamClub.value = t.club || '';
      teamCategories.value = t.categories || '';
      if(t.photo){ teamPhoto.dataset.dataurl = t.photo; photoPreview && (photoPreview.src = t.photo); photoPreviewContainer && photoPreviewContainer.classList.remove('hidden'); }
      cancelEditTeam && cancelEditTeam.classList.remove('hidden');
      renderTeams();
      show('equipos');
      return;
    }
  });

  // minimal matches render to avoid errors
  function renderMatches(){ const matchList = document.getElementById('matchList'); const matches = safeParse('matches'); if(!matchList) return; if(matches.length === 0){ matchList.innerHTML = '<p class="summary">No hay partidos programados.</p>'; return; } matchList.innerHTML = matches.map(m => '<div class="match-item">'+(m.homeId||'')+' vs '+(m.awayId||'')+'</div>').join(''); }

  // init admin UI
  function initAdminUI(){ populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderAdminLists(); }

  // initial render
  populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderAdminLists();

}); // DOMContentLoaded
