/* app.js - restored dark layout + features */
const ADMIN_PASSWORD = 'miContraseñaSegura123'; // cambia si quieres

// DOM refs
const btnEntrarAdmin = document.getElementById('btnEntrarAdmin');
const adminModal = document.getElementById('adminModal');
const cancelLogin = document.getElementById('cancelLogin');
const submitLogin = document.getElementById('submitLogin');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const adminSection = document.getElementById('adminSection');

const formAddTeam = document.getElementById('formAddTeam');
const teamPhotoInput = document.getElementById('teamPhoto');
const photoPreviewContainer = document.getElementById('photoPreviewContainer');
const photoPreview = document.getElementById('photoPreview');

const btnEquipos = document.getElementById('btnEquipos');
const btnPodio = document.getElementById('btnPodio');
const btnDirectos = document.getElementById('btnDirectos');
const btnClasificacion = document.getElementById('btnClasificacion');

const views = {
  equipos: document.getElementById('teamsView'),
  podio: document.getElementById('podioView'),
  directos: document.getElementById('directosView'),
  clasificacion: document.getElementById('clasificacionView'),
};

function openModal(){ adminModal.classList.remove('hidden'); adminPassword.value=''; loginError.style.display='none'; adminPassword.focus(); }
function closeModal(){ adminModal.classList.add('hidden'); }

btnEntrarAdmin.addEventListener('click', openModal);
cancelLogin.addEventListener('click', closeModal);

submitLogin.addEventListener('click', (e)=>{
  e.preventDefault();
  const val = adminPassword.value || '';
  if(val === ADMIN_PASSWORD){
    closeModal();
    showAdminSection();
  } else {
    loginError.style.display = 'block';
  }
});

function showAdminSection(){
  adminSection.classList.remove('hidden');
  adminSection.setAttribute('aria-hidden','false');
  localStorage.setItem('isAdmin','1');
}
function hideAdminSection(){
  adminSection.classList.add('hidden');
  adminSection.setAttribute('aria-hidden','true');
  localStorage.removeItem('isAdmin');
}
if(localStorage.getItem('isAdmin')==='1') showAdminSection();

// image handling
teamPhotoInput.addEventListener('change', async (e)=>{
  const file = e.target.files && e.target.files[0];
  if(!file){ photoPreviewContainer.classList.add('hidden'); photoPreview.src=''; return; }
  if(file.size > 5*1024*1024){ alert('La imagen es demasiado grande (máx 5MB).'); e.target.value=''; return; }
  const dataUrl = await fileToDataURL(file);
  photoPreview.src = dataUrl;
  photoPreviewContainer.classList.remove('hidden');
  teamPhotoInput.dataset.dataurl = dataUrl;
});

function fileToDataURL(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = ()=> res(reader.result);
    reader.onerror = ()=> rej('error');
    reader.readAsDataURL(file);
  });
}

// save team
formAddTeam.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('teamName').value.trim();
  const club = document.getElementById('teamClub').value.trim();
  const cats = document.getElementById('teamCategories').value.trim();
  const photo = teamPhotoInput.dataset.dataurl || null;
  if(!name){ alert('El nombre es obligatorio'); return; }
  const team = { id: Date.now(), name, club, categories: cats, photo };
  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  teams.push(team);
  localStorage.setItem('teams', JSON.stringify(teams));
  formAddTeam.reset();
  photoPreviewContainer.classList.add('hidden');
  teamPhotoInput.dataset.dataurl = '';
  renderTeams();
  alert('Equipo guardado (localStorage).');
});

// render teams
function renderTeams(){
  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  const container = document.getElementById('teamsContainer');
  if(!container) return;
  if(teams.length === 0){
    container.innerHTML = '<p class="muted">No hay equipos aún.</p>';
    return;
  }
  container.innerHTML = teams.map(t => `
    <article class="team-card">
      ${t.photo ? `<img src="${t.photo}" alt="${escapeHtml(t.name)}">` : `<div style="width:72px;height:72px;border-radius:8px;background:rgba(255,255,255,0.03)"></div>`}
      <div>
        <h4 style="margin:0 0 4px 0;">${escapeHtml(t.name)}</h4>
        <div style="font-size:13px; color:var(--muted)">${escapeHtml(t.club || '')}</div>
        <small style="color:var(--muted)">${escapeHtml(t.categories || '')}</small>
      </div>
    </article>
  `).join('');
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

renderTeams();

// navigation
function hideAllViews(){ Object.values(views).forEach(v=>v.classList.add('hidden')); }
function showView(name){ hideAllViews(); const v=views[name]; if(v) v.classList.remove('hidden'); v.scrollIntoView({behavior:'smooth'}); }
btnEquipos.addEventListener('click', ()=> showView('equipos'));
btnPodio.addEventListener('click', ()=> showView('podio'));
btnDirectos.addEventListener('click', ()=> showView('directos'));
btnClasificacion.addEventListener('click', ()=> showView('clasificacion'));
showView('equipos');
