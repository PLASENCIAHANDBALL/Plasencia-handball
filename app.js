
/* app.js - fixed and robust script: DOMContentLoaded safe initialization */

document.addEventListener('DOMContentLoaded', function() {

  const ADMIN_PASSWORD = window.APP_ADMIN_PASSWORD || 'miContraseñaSegura123';

  // NAV buttons and views
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

  function hideAll(){ Object.values(views).forEach(v=> { if(v) v.classList.add('hidden'); }); }
  function show(name){ hideAll(); if(views[name]) views[name].classList.remove('hidden'); }

  if(btnEquipos) btnEquipos.addEventListener('click', ()=> show('equipos'));
  if(btnPartidos) btnPartidos.addEventListener('click', ()=> show('partidos'));
  if(btnPodio) btnPodio.addEventListener('click', ()=> show('podio'));
  if(btnDirectos) btnDirectos.addEventListener('click', ()=> show('directos'));
  if(btnClasificacion) btnClasificacion.addEventListener('click', ()=> show('clasificacion'));

  // show default view
  show('equipos');

  // Admin modal and admin section
  const adminModal = document.getElementById('adminModal');
  const cancelLogin = document.getElementById('cancelLogin');
  const submitLogin = document.getElementById('submitLogin');
  const adminPassword = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  const adminSection = document.getElementById('adminSection');
  const btnLogout = document.getElementById('btnLogout');

  if(btnEntrarAdmin){
    btnEntrarAdmin.addEventListener('click', ()=> {
      if(adminModal) adminModal.classList.remove('hidden');
    });
  }
  if(cancelLogin){
    cancelLogin.addEventListener('click', ()=> {
      if(adminModal) adminModal.classList.add('hidden');
    });
  }
  if(submitLogin){
    submitLogin.addEventListener('click', function(e){
      e.preventDefault();
      const pass = adminPassword && adminPassword.value ? adminPassword.value : '';
      if(pass === ADMIN_PASSWORD){
        if(adminModal) adminModal.classList.add('hidden');
        if(adminPassword) adminPassword.value = '';
        if(loginError) loginError.classList.add('hidden');
        if(adminSection) adminSection.classList.remove('hidden');
        localStorage.setItem('isAdmin','1');
        initAdminUI(); // populate lists and selects
      } else {
        if(loginError) loginError.classList.remove('hidden');
      }
    });
  }

  if(btnLogout){
    btnLogout.addEventListener('click', ()=> {
      if(adminSection) adminSection.classList.add('hidden');
      localStorage.removeItem('isAdmin');
      renderTeams(); renderMatches(); renderDirectos(); renderAdminLists();
    });
  }

  // Helper functions
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function fileToDataURL(file){ return new Promise((res, rej)=>{ const r = new FileReader(); r.onload = ()=> res(r.result); r.onerror = ()=> rej(); r.readAsDataURL(file); }); }

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
  const adminTeamsList = document.getElementById('adminTeamsList');
  const teamsContainer = document.getElementById('teamsContainer');
  const matchHome = document.getElementById('matchHome');
  const matchAway = document.getElementById('matchAway');

  if(teamPhoto){
    teamPhoto.addEventListener('change', async ()=>{
      const f = teamPhoto.files[0];
      if(!f) return;
      if(f.size > 6*1024*1024){ alert('Imagen mayor a 6MB'); teamPhoto.value=''; return; }
      const dataUrl = await fileToDataURL(f);
      teamPhoto.dataset.dataurl = dataUrl;
      if(photoPreview) photoPreview.src = dataUrl;
      if(photoPreviewContainer) photoPreviewContainer.classList.remove('hidden');
    });
  }

  if(formAddTeam){
    formAddTeam.addEventListener('submit', (e)=>{
      e.preventDefault();
      const idEdit = editingTeamId && editingTeamId.value ? editingTeamId.value : null;
      const t = { id: idEdit ? Number(idEdit) : Date.now(), name: teamName.value.trim(), club: teamClub.value.trim(), categories: teamCategories.value.trim(), photo: (teamPhoto && teamPhoto.dataset && teamPhoto.dataset.dataurl) ? teamPhoto.dataset.dataurl : null };
      if(!t.name){ alert('El nombre del equipo es obligatorio'); return; }
      let teams = JSON.parse(localStorage.getItem('teams') || '[]');
      if(idEdit){
        teams = teams.map(tt => tt.id === t.id ? t : tt);
        if(editingTeamId) editingTeamId.value = '';
        if(cancelEditTeam) cancelEditTeam.classList.add('hidden');
        if(saveTeamBtn) saveTeamBtn.textContent = 'Guardar equipo';
      } else {
        teams.push(t);
      }
      localStorage.setItem('teams', JSON.stringify(teams));
      if(formAddTeam) formAddTeam.reset();
      if(teamPhoto) teamPhoto.dataset.dataurl = '';
      if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden');
      renderTeams(); populateMatchTeamsSelects(); renderAdminLists();
    });
  }

  if(cancelEditTeam){
    cancelEditTeam.addEventListener('click', ()=>{
      if(editingTeamId) editingTeamId.value = '';
      if(formAddTeam) formAddTeam.reset();
      if(teamPhoto) teamPhoto.dataset.dataurl = '';
      if(photoPreviewContainer) photoPreviewContainer.classList.add('hidden');
      cancelEditTeam.classList.add('hidden'); if(saveTeamBtn) saveTeamBtn.textContent = 'Guardar equipo';
    });
  }

  function renderTeams(){
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    if(!teamsContainer) return;
    if(teams.length === 0){ teamsContainer.innerHTML = '<p class="summary">No hay equipos aún.</p>'; return; }
    const isAdmin = localStorage.getItem('isAdmin') === '1';
    teamsContainer.innerHTML = teams.map(t => `
      <div class="teamCard" data-id="${t.id}">
        ${t.photo ? `<img src="${t.photo}" alt="${escapeHtml(t.name)}">` : ''}
        <div style="flex:1">
          <strong>${escapeHtml(t.name)}</strong><br><small style="color:var(--muted)">${escapeHtml(t.club)}</small><br><small style="color:var(--muted)">${escapeHtml(t.categories)}</small>
        </div>
        ${ isAdmin ? `<div style="display:flex;flex-direction:column;gap:6px"><button class="small-btn edit-team" data-id="${t.id}">Editar</button><button class="small-btn delete-team delete-btn" data-id="${t.id}">Eliminar</button></div>` : ''}
      </div>
    `).join('');
  }

  // admin lists (for easier editing)
  function renderAdminLists(){
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    if(adminTeamsList){
      adminTeamsList.innerHTML = teams.map(t => `<div class="teamRow"><div><strong>${escapeHtml(t.name)}</strong></div><div><button class="small-btn edit-team" data-id="${t.id}">Editar</button> <button class="small-btn delete-team delete-btn" data-id="${t.id}">Eliminar</button></div></div>`).join('') || '<p class="summary">No hay equipos</p>';
    }
    const adminMatchesList = document.getElementById('adminMatchesList');
    if(adminMatchesList){
      adminMatchesList.innerHTML = matches.map(m => {
        const home = teams.find(tt => String(tt.id) === String(m.homeId));
        const away = teams.find(tt => String(tt.id) === String(m.awayId));
        return `<div class="matchRow"><div>${escapeHtml(home?home.name:'--')} vs ${escapeHtml(away?away.name:'--')} - ${m.datetime?new Date(m.datetime).toLocaleString():'Fecha no asignada'}</div><div><button class="small-btn edit-match" data-id='${m.id}'>Editar</button> <button class="small-btn delete-match delete-btn" data-id='${m.id}'>Eliminar</button></div></div>`;
      }).join('') || '<p class="summary">No hay partidos</p>';
    }
  }

  // delegation: edit/delete teams & matches from lists or cards
  document.addEventListener('click', function(e){
    const target = e.target;
    if(!target) return;
    // delete team
    if(target.classList.contains('delete-team')){
      const id = target.dataset.id;
      if(!confirm('Eliminar equipo?')) return;
      let teams = JSON.parse(localStorage.getItem('teams') || '[]');
      teams = teams.filter(t => String(t.id) !== String(id));
      localStorage.setItem('teams', JSON.stringify(teams));
      renderTeams(); populateMatchTeamsSelects(); renderAdminLists(); renderMatches();
      return;
    }
    // edit team
    if(target.classList.contains('edit-team')){
      const id = target.dataset.id;
      const teams = JSON.parse(localStorage.getItem('teams') || '[]');
      const t = teams.find(tt => String(tt.id) === String(id));
      if(!t) return;
      if(editingTeamId) editingTeamId.value = t.id;
      if(teamName) teamName.value = t.name;
      if(teamClub) teamClub.value = t.club;
      if(teamCategories) teamCategories.value = t.categories;
      if(t.photo){ if(teamPhoto) teamPhoto.dataset.dataurl = t.photo; if(photoPreview) photoPreview.src = t.photo; if(photoPreviewContainer) photoPreviewContainer.classList.remove('hidden'); }
      if(cancelEditTeam) cancelEditTeam.classList.remove('hidden');
      if(saveTeamBtn) saveTeamBtn.textContent = 'Actualizar equipo';
      window.scrollTo({top:0, behavior:'smooth'}); show('equipos');
      return;
    }
    // delete match
    if(target.classList.contains('delete-match')){
      const id = target.dataset.id;
      if(!confirm('Eliminar partido?')) return;
      let matches = JSON.parse(localStorage.getItem('matches') || '[]');
      matches = matches.filter(m => String(m.id) !== String(id));
      localStorage.setItem('matches', JSON.stringify(matches));
      renderMatches(); renderAdminLists();
      return;
    }
    // edit match
    if(target.classList.contains('edit-match')){
      const id = target.dataset.id;
      const matches = JSON.parse(localStorage.getItem('matches') || '[]');
      const m = matches.find(mm => String(mm.id) === String(id));
      if(!m) return;
      document.getElementById('editingMatchId').value = m.id;
      document.getElementById('matchHome').value = m.homeId;
      document.getElementById('matchAway').value = m.awayId;
      document.getElementById('matchDate').value = m.datetime || '';
      document.getElementById('matchResult').value = m.result || '';
      document.getElementById('cancelEditMatch').classList.remove('hidden');
      document.getElementById('saveMatchBtn').textContent = 'Actualizar partido';
      const remaining = matches.filter(mm => String(mm.id) !== String(id));
      localStorage.setItem('matches', JSON.stringify(remaining));
      renderMatches(); show('partidos'); window.scrollTo({top:0, behavior:'smooth'});
      return;
    }
  });

  // MATCHES CRUD + validation
  const formAddMatch = document.getElementById('formAddMatch');
  const editingMatchId = document.getElementById('editingMatchId');
  const matchDate = document.getElementById('matchDate');
  const matchResult = document.getElementById('matchResult');
  const matchList = document.getElementById('matchList');
  const cancelEditMatch = document.getElementById('cancelEditMatch');
  const saveMatchBtn = document.getElementById('saveMatchBtn');

  function populateMatchTeamsSelects(){
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const options = ['<option value="">-- seleccionar --</option>'].concat(teams.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`)).join('');
    if(matchHome) matchHome.innerHTML = options;
    if(matchAway) matchAway.innerHTML = options;
  }

  if(formAddMatch){
    formAddMatch.addEventListener('submit', function(e){
      e.preventDefault();
      if(matchDate && matchDate.value){
        const picked = new Date(matchDate.value);
        if(picked < new Date()){ alert('La fecha no puede ser en el pasado'); return; }
      }
      if(!matchHome.value || !matchAway.value){ alert('Selecciona ambos equipos'); return; }
      if(matchHome.value === matchAway.value){ alert('Los equipos deben ser distintos'); return; }
      const idEdit = editingMatchId && editingMatchId.value ? editingMatchId.value : null;
      const m = { id: idEdit ? Number(idEdit) : Date.now(), homeId: matchHome.value, awayId: matchAway.value, datetime: matchDate.value || null, result: matchResult.value || null };
      let matches = JSON.parse(localStorage.getItem('matches') || '[]');
      if(idEdit){
        matches = matches.map(mm => mm.id === m.id ? m : mm);
        if(editingMatchId) editingMatchId.value = '';
        if(cancelEditMatch) cancelEditMatch.classList.add('hidden');
        if(saveMatchBtn) saveMatchBtn.textContent = 'Guardar partido';
      } else {
        matches.push(m);
      }
      localStorage.setItem('matches', JSON.stringify(matches));
      if(formAddMatch) formAddMatch.reset();
      renderMatches(); renderAdminLists();
    });
  }

  if(cancelEditMatch){
    cancelEditMatch.addEventListener('click', ()=>{ if(editingMatchId) editingMatchId.value = ''; if(formAddMatch) formAddMatch.reset(); cancelEditMatch.classList.add('hidden'); if(saveMatchBtn) saveMatchBtn.textContent = 'Guardar partido'; });
  }

  function renderMatches(){
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    if(!matchList) return;
    if(matches.length === 0){ matchList.innerHTML = '<p class="summary">No hay partidos programados.</p>'; return; }
    const isAdmin = localStorage.getItem('isAdmin') === '1';
    matchList.innerHTML = matches.map(m => {
      const home = teams.find(t => String(t.id) === String(m.homeId));
      const away = teams.find(t => String(t.id) === String(m.awayId));
      const dateStr = m.datetime ? new Date(m.datetime).toLocaleString() : 'Fecha no asignada';
      const res = m.result ? `<strong>${escapeHtml(m.result)}</strong>` : '<em>Por jugar</em>';
      return `<div class="match-item" data-id="${m.id}">
        <div class="match-left">
          <div><strong>${escapeHtml(home?home.name:'--')}</strong> vs <strong>${escapeHtml(away?away.name:'--')}</strong></div>
          <div style="font-size:13px;color:var(--muted)">${dateStr}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <div>${res}</div>
          ${ isAdmin ? `<button class="small-btn edit-match" data-id='${m.id}'>Editar</button> <button class="small-btn delete-match delete-btn" data-id='${m.id}'>Eliminar</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  // DIRECTOS
  const formDirectos = document.getElementById('formDirectos');
  const directoUrl = document.getElementById('directoUrl');
  const directosDisplay = document.getElementById('directosDisplay');

  if(formDirectos){
    formDirectos.addEventListener('submit', function(e){
      e.preventDefault();
      if(directoUrl) localStorage.setItem('directoUrl', directoUrl.value.trim());
      renderDirectos();
      alert('URL de directos guardada');
    });
  }
  function renderDirectos(){
    const url = localStorage.getItem('directoUrl') || '';
    if(!directosDisplay) return;
    directosDisplay.innerHTML = url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>` : '<p class="summary">No hay directo configurado.</p>';
  }

  // EXPORT / IMPORT
  const exportDataBtn = document.getElementById('exportData');
  const importFile = document.getElementById('importFile');
  if(exportDataBtn){
    exportDataBtn.addEventListener('click', function(){
      const data = { teams: JSON.parse(localStorage.getItem('teams')||'[]'), matches: JSON.parse(localStorage.getItem('matches')||'[]'), directoUrl: localStorage.getItem('directoUrl')||'' };
      const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'plasencia_backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
  }
  if(importFile){
    importFile.addEventListener('change', function(e){
      const f = e.target.files[0]; if(!f) return;
      const reader = new FileReader();
      reader.onload = function(){ try{ const data = JSON.parse(reader.result); if(Array.isArray(data.teams)) localStorage.setItem('teams', JSON.stringify(data.teams)); if(Array.isArray(data.matches)) localStorage.setItem('matches', JSON.stringify(data.matches)); if(typeof data.directoUrl === 'string') localStorage.setItem('directoUrl', data.directoUrl); alert('Importación completada'); renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists(); }catch(err){ alert('Fichero JSON inválido'); } };
      reader.readAsText(f);
    });
  }

  // CLEAR ALL
  const clearAllBtn = document.getElementById('clearAll');
  if(clearAllBtn){
    clearAllBtn.addEventListener('click', function(){ if(!confirm('Eliminar todos los datos guardados?')) return; localStorage.removeItem('teams'); localStorage.removeItem('matches'); localStorage.removeItem('directoUrl'); renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists(); alert('Datos eliminados'); });
  }

  // init helpers
  function initAdminUI(){ populateMatchTeamsSelects(); renderTeams(); renderMatches(); renderDirectos(); renderAdminLists(); }
  function populateMatchTeamsSelects(){ const teams = JSON.parse(localStorage.getItem('teams')||'[]'); const options = ['<option value="">-- seleccionar --</option>'].concat(teams.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`)).join(''); if(matchHome) matchHome.innerHTML = options; if(matchAway) matchAway.innerHTML = options; }

  // initial render
  renderTeams(); renderMatches(); renderDirectos(); populateMatchTeamsSelects(); renderAdminLists();

}); // DOMContentLoaded
