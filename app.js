// app.js updated: teams CRUD, matches, classification per category, admin-only editing
(() => {
  const CATEGORIES = [
    'Alevín Femenino','Alevín Masculino',
    'Infantil Femenino','Infantil Masculino',
    'Cadete Femenino','Cadete Masculino',
    'Juvenil Femenino','Juvenil Masculino'
  ];

  const STORAGE_KEY = 'ph_state_v2';
  const ADMIN_PW = 'PHB-2025';

  // DOM references
  const DOM = {
    btnEquipo: document.getElementById('btn-equipo'),
    btnPodio: document.getElementById('btn-podio'),
    btnDirectos: document.getElementById('btn-directos'),
    btnClas: document.getElementById('btn-clasificacion'),
    btnAdmin: document.getElementById('btn-admin'),
    panel: document.getElementById('panel'),
    welcome: document.getElementById('welcome'),
    nextMatches: document.getElementById('nextMatches'),
    adminModal: document.getElementById('adminModal'),
    adminForm: document.getElementById('adminForm'),
    adminPassword: document.getElementById('adminPassword'),
    adminCancel: document.getElementById('adminCancel'),
    editModal: document.getElementById('editModal'),
    editForm: document.getElementById('editForm'),
    editCancel: document.getElementById('editCancel'),
    teamModal: document.getElementById('teamModal'),
    teamForm: document.getElementById('teamForm'),
    teamCategories: document.getElementById('teamCategories'),
    teamCancel: document.getElementById('teamCancel')
  };

  // initial sample data (teams with categories)
  const SAMPLE = {
    teams: [
      { id: 't1', name: 'Plasencia HB', categories: ['Juvenil Femenino'], club:'Plasencia' },
      { id: 't2', name: 'Coria A', categories: ['Juvenil Masculino'], club:'Coria' }
    ],
    matches: [
      { id:'m1', date:'2025-11-16T11:30', home:'Plasencia HB', away:'Coria A', venue:'Pabellón A', status:'pendiente', liveUrl:'' }
    ],
    tournaments: ['Torneo 1']
  };

  function load(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){ localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE)); return JSON.parse(JSON.stringify(SAMPLE)); }
    try{ return JSON.parse(raw); }catch(e){ localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE)); return JSON.parse(JSON.stringify(SAMPLE)); }
  }
  function save(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  let state = load();
  let isAdmin = sessionStorage.getItem('ph_admin') === '1';

  // Utilities
  function uid(prefix='id'){ return prefix + Math.random().toString(36).slice(2,9); }
  function q(selector){ return document.querySelector(selector); }
  function formatDate(d){ try{ return new Date(d).toLocaleString(); }catch(e){return d} }

  // Render next matches
  function renderNextMatches(){
    const el = DOM.nextMatches;
    el.innerHTML = '';
    const upcoming = (state.matches||[]).slice().sort((a,b)=> new Date(a.date)-new Date(b.date));
    if(upcoming.length===0){ el.textContent = 'No hay partidos próximos.'; return; }
    upcoming.slice(0,5).forEach(m => {
      const div = document.createElement('div'); div.className = 'match';
      div.innerHTML = `<div><div style="font-weight:700">${formatDate(m.date)}</div><div class="small">${m.home} vs ${m.away} · ${m.venue}</div></div>
        <div>${m.liveUrl?'<a href="'+m.liveUrl+'" target="_blank">Ver directo</a>':''} ${isAdmin?'<button class="edit-btn small" data-id="'+m.id+'">Editar</button>':''}</div>`;
      el.appendChild(div);
    });
    el.querySelectorAll('.edit-btn').forEach(b=> b.addEventListener('click', e=> openEditModal(b.dataset.id)));
  }

  // Render teams list (public view)
  function renderTeams(){
    DOM.panel.classList.remove('hidden'); DOM.panel.innerHTML='';
    const header = document.createElement('div'); header.className='panel-header';
    header.innerHTML = '<h3>Equipos</h3>' + (isAdmin? '<div><button id="addTeamBtn">+ Añadir equipo</button></div>':'');
    DOM.panel.appendChild(header);
    const list = document.createElement('div'); list.className='list';
    (state.teams||[]).forEach(t=>{
      const item = document.createElement('div'); item.className='match-row';
      item.innerHTML = `<div><div style="font-weight:700">${t.name}</div><div class="small">${t.club || ''} · ${t.categories.join(', ')}</div></div>
        <div>${isAdmin?'<button class="edit-team-btn small" data-id="'+t.id+'">Editar</button> <button class="del-team-btn small" data-id="'+t.id+'">Borrar</button>':''}</div>`;
      list.appendChild(item);
    });
    DOM.panel.appendChild(list);
    if(isAdmin){
      document.getElementById('addTeamBtn').addEventListener('click', ()=> openTeamModal());
      DOM.panel.querySelectorAll('.edit-team-btn').forEach(b=> b.addEventListener('click', ()=> openTeamModal(b.dataset.id)));
      DOM.panel.querySelectorAll('.del-team-btn').forEach(b=> b.addEventListener('click', ()=> { if(confirm('Borrar equipo?')){ state.teams = state.teams.filter(x=>x.id!==b.dataset.id); save(state); renderTeams(); } }));
    }
  }

  // Render classification by tournaments (simple points calc)
  function renderClassification(){
    DOM.panel.classList.remove('hidden'); DOM.panel.innerHTML='';
    const header = document.createElement('div'); header.className='panel-header';
    header.innerHTML = '<h3>Clasificación por categoría</h3>';
    DOM.panel.appendChild(header);
    // show each category table
    CATEGORIES.forEach(cat=>{
      const section = document.createElement('div'); section.style.marginBottom='12px';
      section.innerHTML = '<h4>'+cat+'</h4>';
      // compute simple table: count wins from matches where status==='jugado' and match.categories? We'll just mock: list teams in this category
      const teams = (state.teams||[]).filter(t=> t.categories && t.categories.includes(cat));
      if(teams.length===0){ section.innerHTML += '<div class="small">No hay equipos en esta categoría.</div>'; DOM.panel.appendChild(section); return; }
      const table = document.createElement('div');
      // mock points: 3 for win, 1 draw - we don't have results structure; show placeholder order
      teams.forEach((tm,i)=> table.innerHTML += `<div class="match-row"><div><strong>${i+1}. ${tm.name}</strong><div class="small">${tm.club || ''}</div></div><div class="small">Pts: ${Math.max(0,10-i)}</div></div>`);
      section.appendChild(table); DOM.panel.appendChild(section);
    });
  }

  // Render directos
  function renderDirects(){
    DOM.panel.classList.remove('hidden'); DOM.panel.innerHTML='';
    const header = document.createElement('div'); header.className='panel-header'; header.innerHTML = '<h3>Directos</h3>';
    DOM.panel.appendChild(header);
    const cont = document.createElement('div');
    const withUrl = (state.matches||[]).filter(m=> m.liveUrl && m.liveUrl.trim());
    if(withUrl.length===0) cont.innerHTML = '<div class="small">No hay directos activos.</div>'; else {
      withUrl.forEach(m=> {
        const el = document.createElement('div'); el.className='match';
        el.innerHTML = `<div><strong>${m.home} vs ${m.away}</strong><div class="small">${formatDate(m.date)}</div></div><div><a href="${m.liveUrl}" target="_blank">Abrir directo</a>${isAdmin? ' <button class="edit-btn small" data-id="'+m.id+'">Editar</button>': ''}</div>`;
        cont.appendChild(el);
      });
    }
    DOM.panel.appendChild(cont);
    DOM.panel.querySelectorAll('.edit-btn').forEach(b=> b.addEventListener('click', ()=> openEditModal(b.dataset.id)));
  }

  // Edit match modal functions
  function openEditModal(id){
    const modal = document.getElementById('editModal'); const form = DOM.editForm || document.getElementById('editForm');
    modal.classList.remove('hidden');
    if(id){
      const m = (state.matches||[]).find(x=>x.id===id);
      if(m){ form.elements['id'].value = m.id; form.elements['date'].value = m.date; form.elements['home'].value = m.home; form.elements['away'].value = m.away; form.elements['venue'].value = m.venue; form.elements['status'].value = m.status||'pendiente'; form.elements['liveUrl'].value = m.liveUrl||''; }
    } else { form.reset(); form.elements['id'].value = 'm'+Date.now(); }
  }
  function closeEditModal(){ document.getElementById('editModal').classList.add('hidden'); }
  DOM.editCancel.addEventListener('click', closeEditModal);
  document.getElementById('editForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = e.target; const id = f.elements['id'].value;
    const match = { id, date: f.elements['date'].value, home: f.elements['home'].value, away: f.elements['away'].value, venue: f.elements['venue'].value, status: f.elements['status'].value, liveUrl: f.elements['liveUrl'].value };
    const idx = (state.matches||[]).findIndex(x=>x.id===id);
    if(idx>=0) state.matches[idx]=match; else state.matches.unshift(match);
    save(state); closeEditModal(); renderNextMatches(); if(!DOM.panel.classList.contains('hidden')){ const h = document.querySelector('.panel-header h3'); if(h){ const name=h.textContent.toLowerCase(); if(name.includes('categor')) renderCategories(); else if(name.includes('podio')) renderPodio(); else if(name.includes('direct')) renderDirects(); } }
  });

  // Team modal functions (add/edit team, categories as checkboxes)
  function openTeamModal(id){
    const modal = document.getElementById('teamModal'); const form = document.getElementById('teamForm');
    modal.classList.remove('hidden');
    const container = DOM.teamCategories; container.innerHTML='';
    CATEGORIES.forEach(cat=>{
      const idc = 'chk_'+cat.replace(/\s+/g,'_');
      const label = document.createElement('label'); label.style.display='inline-flex'; label.style.alignItems='center'; label.style.gap='6px';
      label.innerHTML = `<input type="checkbox" name="categories" value="${cat}" id="${idc}"> ${cat}`;
      container.appendChild(label);
    });
    if(id){
      const t = (state.teams||[]).find(x=>x.id===id);
      if(t){ form.elements['id'].value = t.id; form.elements['name'].value = t.name; form.elements['club'].value = t.club || ''; (t.categories||[]).forEach(c=>{ const el = document.querySelector('[value="'+c+'"][name="categories"]'); if(el) el.checked = true; }); }
    } else { form.reset(); form.elements['id'].value = 't'+Date.now(); }
  }
  function closeTeamModal(){ document.getElementById('teamModal').classList.add('hidden'); }
  DOM.teamCancel.addEventListener('click', closeTeamModal);
  document.getElementById('teamForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = e.target; const id = f.elements['id'].value; const name = f.elements['name'].value.trim(); const club = f.elements['club'].value.trim();
    const cats = Array.from(f.querySelectorAll('[name="categories"]:checked')).map(x=>x.value);
    if(!name || cats.length===0){ alert('Nombre y al menos una categoría'); return; }
    const t = { id, name, club, categories: cats };
    const idx = (state.teams||[]).findIndex(x=>x.id===id);
    if(idx>=0) state.teams[idx]=t; else state.teams.unshift(t);
    save(state); closeTeamModal(); renderTeams();
  });

  // Render categories (for panel nav)
  function renderCategories(){
    DOM.panel.classList.remove('hidden'); DOM.panel.innerHTML='';
    const header = document.createElement('div'); header.className='panel-header';
    header.innerHTML = '<h3>Categorías</h3>';
    DOM.panel.appendChild(header);
    const cats = document.createElement('div'); cats.className='categories';
    CATEGORIES.forEach(cat=>{
      const b = document.createElement('button'); b.className='cat-btn'; b.textContent = cat; b.addEventListener('click', ()=> renderCategoryPage(cat)); cats.appendChild(b);
    });
    DOM.panel.appendChild(cats);
  }

  function renderCategoryPage(cat){
    DOM.panel.classList.remove('hidden'); DOM.panel.innerHTML='';
    const header = document.createElement('div'); header.className='panel-header';
    header.innerHTML = '<h3>'+cat+'</h3>' + (isAdmin? '<div><button id="addMatchHere">+ Añadir partido</button></div>' : '');
    DOM.panel.appendChild(header);
    const matches = (state.matches||[]).filter(m=> (state.teams.find(t=>t.name===m.home && t.categories.includes(cat)) || state.teams.find(t=>t.name===m.away && t.categories.includes(cat))));
    const list = document.createElement('div'); list.className='list';
    if(matches.length===0) list.innerHTML = '<div class="small">No hay partidos en esta categoría.</div>'; else matches.forEach(m=>{
      const row = document.createElement('div'); row.className='match-row'; row.innerHTML = `<div><div style="font-weight:700">${formatDate(m.date)}</div><div class="small">${m.home} — ${m.away} · ${m.venue}</div></div><div>${isAdmin?'<button class="edit-btn" data-id="'+m.id+'">Editar</button>':''}</div>`;
      list.appendChild(row);
    });
    DOM.panel.appendChild(list);
    if(isAdmin){
      const addBtn = document.getElementById('addMatchHere'); addBtn && addBtn.addEventListener('click', ()=> openEditModal());
      DOM.panel.querySelectorAll('.edit-btn').forEach(b=> b.addEventListener('click', ()=> openEditModal(b.dataset.id)));
    }
  }

  // Navigation handlers
  DOM.btnEquipo.addEventListener('click', ()=> renderTeams());
  DOM.btnPodio.addEventListener('click', ()=> { renderPodio(); });
  DOM.btnDirectos.addEventListener('click', ()=> renderDirects());
  if(DOM.btnClas) DOM.btnClas.addEventListener('click', ()=> renderClassification());

  // Admin modal handlers
  DOM.btnAdmin.addEventListener('click', ()=> { DOM.adminModal.classList.remove('hidden'); DOM.adminPassword.value=''; DOM.adminPassword.focus(); });
  DOM.adminCancel.addEventListener('click', ()=> DOM.adminModal.classList.add('hidden'));
  DOM.adminForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(DOM.adminPassword.value === ADMIN_PW){ isAdmin = true; sessionStorage.setItem('ph_admin','1'); DOM.adminModal.classList.add('hidden'); renderNextMatches(); showToast('Entrado como administrador'); renderTeams(); } else alert('Contraseña incorrecta');
  });

  // Podio (placeholder)
  function renderPodio(){ DOM.panel.classList.remove('hidden'); DOM.panel.innerHTML = '<h3>Podio</h3><p class="small">Podio por torneo (placeholder)</p>'; }

  // initial render
  renderNextMatches();

  // small toast
  function showToast(msg){
    const t = document.createElement('div'); t.textContent = msg; t.style.position='fixed'; t.style.right='18px'; t.style.bottom='18px'; t.style.background='rgba(0,0,0,0.8)'; t.style.color='#fff'; t.style.padding='10px 14px'; t.style.borderRadius='10px'; t.style.zIndex=9999; document.body.appendChild(t);
    setTimeout(()=> t.style.opacity='0.0', 2200); setTimeout(()=> t.remove(), 2800);
  }
})();