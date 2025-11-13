// admin login, image, render, plus navigation
const ADMIN_PASSWORD='miContraseñaSegura123';

// modal admin
const btnEntrarAdmin=document.getElementById('btnEntrarAdmin');
const adminModal=document.getElementById('adminModal');
const cancelLogin=document.getElementById('cancelLogin');
const submitLogin=document.getElementById('submitLogin');
const adminPassword=document.getElementById('adminPassword');
const loginError=document.getElementById('loginError');
const adminSection=document.getElementById('adminSection');

btnEntrarAdmin.onclick=()=>{adminModal.classList.remove('hidden');};
cancelLogin.onclick=()=>{adminModal.classList.add('hidden');};
submitLogin.onclick=()=>{
  if(adminPassword.value===ADMIN_PASSWORD){
    adminModal.classList.add('hidden');
    adminSection.classList.remove('hidden');
  } else loginError.style.display='block';
};

// team add
const form=document.getElementById('formAddTeam');
const teamPhoto=document.getElementById('teamPhoto');
const previewC=document.getElementById('photoPreviewContainer');
const preview=document.getElementById('photoPreview');

teamPhoto.onchange=async e=>{
  const f=e.target.files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=()=>{preview.src=r.result; previewC.style.display='block'; teamPhoto.dataset.dataurl=r.result;};
  r.readAsDataURL(f);
};

form.onsubmit=e=>{
  e.preventDefault();
  const t={name:teamName.value,club:teamClub.value,categories:teamCategories.value,photo:teamPhoto.dataset.dataurl||null};
  const list=JSON.parse(localStorage.getItem('teams')||'[]');
  list.push(t);
  localStorage.setItem('teams',JSON.stringify(list));
  renderTeams();
  form.reset(); previewC.style.display='none';
};

// render teams
function renderTeams(){
  const list=JSON.parse(localStorage.getItem('teams')||'[]');
  document.getElementById('teamsContainer').innerHTML=list.map(t=>`
    <div class='team-card'>
      ${t.photo?`<img src='${t.photo}' style='width:60px;border-radius:8px;'>`:``}
      <div><b>${t.name}</b><br>${t.club}<br>${t.categories}</div>
    </div>`).join('');
}
renderTeams();

// navigation
const views={
  equipos:document.getElementById('teamsView'),
  podio:document.getElementById('podioView'),
  directos:document.getElementById('directosView'),
  clasificacion:document.getElementById('clasificacionView')
};
function show(v){
  Object.values(views).forEach(s=>s.classList.add('hidden'));
  views[v].classList.remove('hidden');
}
document.getElementById('btnEquipos').onclick=()=>show('equipos');
document.getElementById('btnPodio').onclick=()=>show('podio');
document.getElementById('btnDirectos').onclick=()=>show('directos');
document.getElementById('btnClasificacion').onclick=()=>show('clasificacion');

show('equipos');