// app.js - manejo del modal admin, subida de imagen y guardado local
const ADMIN_PASSWORD = 'miContraseñaSegura123'; // cámbiala

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

function openModal(){
  adminModal.classList.remove('hidden');
  adminPassword.value = '';
  loginError.style.display = 'none';
  adminPassword.focus();
}
function closeModal(){
  adminModal.classList.add('hidden');
}
function showAdminSection(){
  adminSection.classList.remove('hidden');
  adminSection.setAttribute('aria-hidden','false');
  localStorage.setItem('isAdmin', '1');
}
function hideAdminSection(){
  adminSection.classList.add('hidden');
  adminSection.setAttribute('aria-hidden','true');
  localStorage.removeItem('isAdmin');
}
if(localStorage.getItem('isAdmin') === '1'){
  showAdminSection();
}

teamPhotoInput.addEventListener('change', async (e)=>{
  const file = e.target.files && e.target.files[0];
  if(!file) {
    photoPreviewContainer.style.display = 'none';
    photoPreview.src = '';
    return;
  }
  if(file.size > 3*1024*1024) {
    alert('La imagen es demasiado grande (máx 3MB). Recorta o elige otra.');
    e.target.value = '';
    return;
  }
  const dataUrl = await fileToDataURL(file);
  photoPreview.src = dataUrl;
  photoPreviewContainer.style.display = 'block';
  teamPhotoInput.dataset.dataurl = dataUrl;
});

function fileToDataURL(file){
  return new Promise((res, rej)=>{
    const reader = new FileReader();
    reader.onload = ()=> res(reader.result);
    reader.onerror = ()=> rej('error leyendo fichero');
    reader.readAsDataURL(file);
  });
}

formAddTeam.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('teamName').value.trim();
  const club = document.getElementById('teamClub').value.trim();
  const cats = document.getElementById('teamCategories').value.trim();
  const photoData = teamPhotoInput.dataset.dataurl || null;

  if(!name){
    alert('El nombre es obligatorio');
    return;
  }

  const team = { id: Date.now(), name, club, categories: cats, photo: photoData };
  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  teams.push(team);
  localStorage.setItem('teams', JSON.stringify(teams));

  formAddTeam.reset();
  photoPreviewContainer.style.display = 'none';
  teamPhotoInput.dataset.dataurl = '';

  renderTeams();
  alert('Equipo guardado (localStorage).');
});

function renderTeams(){
  const teams = JSON.parse(localStorage.getItem('teams') || '[]');
  const container = document.getElementById('teamsContainer');
  if(!container) return;
  if(teams.length===0){
    container.innerHTML = '<p class="muted">No hay equipos aún.</p>';
    return;
  }
  container.innerHTML = teams.map(t => `
    <article class="team-card">
      ${t.photo ? `<img src="${t.photo}" alt="${escapeHtml(t.name)}">` : `<div style="width:72px;height:72px;border-radius:8px;background:#eef2f7;"></div>`}
      <div>
        <h4>${escapeHtml(t.name)}</h4>
        <p>${escapeHtml(t.club || '')}</p>
        <small>${escapeHtml(t.categories || '')}</small>
      </div>
    </article>
  `).join('');
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

renderTeams();
