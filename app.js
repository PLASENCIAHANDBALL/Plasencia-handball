
/* Simple client-only app. Data stored in local JS for demo. */
const categories = [
  { id: 'alevin-m', title: 'Alevín Masculina' },
  { id: 'alevin-f', title: 'Alevín Femenina' },
  { id: 'infantil-m', title: 'Infantil Masculina' },
  { id: 'infantil-f', title: 'Infantil Femenina' },
  { id: 'cadete-m', title: 'Cadete Masculina' },
  { id: 'cadete-f', title: 'Cadete Femenina' },
  { id: 'juvenil-m', title: 'Juvenil Masculina' },
  { id: 'juvenil-f', title: 'Juvenil Femenina' }
];

const sampleMatches = {
  'alevin-m': [
    { date: '2025-11-20 10:00', match: 'Plasencia HB vs Coria A', place: 'Pabellón A' }
  ],
  'alevin-f': [],
  'juvenil-f': [
    { date: '2025-11-16 11:30', match: 'Plasencia HB vs Coria A', place:'Pabellón A' }
  ]
};

const sampleResults = {
  'juvenil-f': [
    { date: '2025-11-10', match: 'Plasencia HB 24 - 20 Coria A' }
  ]
};

const sampleTable = {
  'juvenil-f': [
    'Plasencia HB - 6 pts',
    'Coria A - 3 pts'
  ]
};

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

function showSection(id){
  $all('.panel').forEach(p=>p.classList.add('hidden'));
  $('#welcome').classList.add('hidden');
  const el = $('#'+id);
  if(el) el.classList.remove('hidden')
}

/* nav buttons */
$('#btn-equipos').addEventListener('click', e=>{
  showSection('equipos');
  buildCategories();
});
$('#btn-podio').addEventListener('click', e=>{
  showSection('podio');
  buildPodio();
});
$('#btn-directos').addEventListener('click', e=>{
  showSection('directos');
});
$('#btn-admin').addEventListener('click', e=>{
  showSection('admin');
});

/* build categories */
function buildCategories(){
  const wrap = document.querySelector('.categories');
  wrap.innerHTML = '';
  categories.forEach(cat=>{
    const btn = document.createElement('button');
    btn.className = 'cat-btn';
    btn.innerHTML = `<div class="cat-title">${cat.title}</div><div class="muted">Ver categoría</div>`;
    btn.addEventListener('click', ()=> openCategory(cat.id));
    wrap.appendChild(btn);
  });
}

/* open category detail */
function openCategory(id){
  document.querySelector('.categories').classList.add('hidden');
  const det = $('#categoria-detail');
  det.classList.remove('hidden');
  $('#cat-title').textContent = categories.find(c=>c.id===id).title;
  // matches
  const ml = $('#matches-list'); ml.innerHTML='';
  (sampleMatches[id]||[]).forEach(m=>{
    const li = document.createElement('li'); li.textContent = `${m.date} — ${m.match} · ${m.place}`;
    ml.appendChild(li);
  });
  if((sampleMatches[id]||[]).length===0){
    ml.innerHTML = '<li>No hay próximos partidos.</li>'
  }
  // results
  const rl = $('#results-list'); rl.innerHTML='';
  (sampleResults[id]||[]).forEach(r=>{
    const li = document.createElement('li'); li.textContent = `${r.date} — ${r.match}`;
    rl.appendChild(li);
  });
  if((sampleResults[id]||[]).length===0) rl.innerHTML = '<li>No hay resultados.</li>';
  // table
  const tl = $('#table-list'); tl.innerHTML='';
  (sampleTable[id]||[]).forEach(t=>{
    const li = document.createElement('li'); li.textContent = t;
    tl.appendChild(li);
  });
  if((sampleTable[id]||[]).length===0) tl.innerHTML = '<li>No hay clasificación.</li>';
}

/* back to categories */
$('#back-cats').addEventListener('click', ()=>{
  $('#categoria-detail').classList.add('hidden');
  document.querySelector('.categories').classList.remove('hidden');
});

/* Admin login */
$('#admin-login').addEventListener('click', ()=>{
  const pass = $('#admin-pass').value;
  if(pass === 'PHB-2025!Porterias&Redes#98'){
    $('#admin-area').classList.remove('hidden');
    alert('Has entrado en modo Admin (demo).');
  } else {
    alert('Contraseña incorrecta.');
  }
});

/* Build podio demo */
function buildPodio(){
  const container = $('#podio-list');
  container.innerHTML = '';
  const demo = ['Plasencia HB','Coria A','Union Pacense'];
  demo.forEach((d,i)=>{
    const el = document.createElement('div');
    el.className='podio-item';
    el.innerHTML = `<strong>#${i+1} ${d}</strong><div class="muted">Demo</div>`;
    container.appendChild(el);
  })
}

/* initial */
(function init(){
  // keep welcome visible until user clicks
})();
