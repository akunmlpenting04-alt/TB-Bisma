const topics = [
  {t:"Money Management",d:"Fondasi mengelola uang supaya penghasilan tidak bocor dan modal bisa tumbuh.",s:["Cash flow pribadi","Budgeting & alokasi uang","Dana darurat","Utang produktif vs konsumtif","Bunga majemuk & opportunity cost"]},
  {t:"Akuntansi & Membaca Angka",d:"Belajar membaca kesehatan bisnis dari angka, bukan perasaan.",s:["Revenue, gross profit, net profit","Margin & operating expense","Cash flow statement","Balance sheet dasar","ROI, break-even & inventory turnover"]},
  {t:"Cara Kerja Bisnis",d:"Pahami bagaimana bisnis menciptakan nilai, menjual, dan menghasilkan profit.",s:["Problem-solution fit","Produk & value proposition","Unit economics","Pricing & distribution","Scalability & recurring revenue"]},
  {t:"Sales, Marketing & Negosiasi",d:"Kemampuan menjual ide, produk, dan diri sendiri dengan etis.",s:["Psikologi pembeli","Positioning & offer","Copywriting dasar","Objection handling & closing","Negosiasi win-win"]},
  {t:"Investing",d:"Bangun cara berpikir investor: probabilitas, waktu, dan manajemen risiko.",s:["Investing vs trading vs gambling","Risk-reward & expected value","Diversifikasi & korelasi","DCA & portfolio allocation","Investment thesis & exit criteria"]},
  {t:"Crypto dari Akar",d:"Pahami crypto dari infrastruktur sampai token, bukan cuma harga.",s:["Bitcoin, block & node","PoW vs PoS","Wallet, seed phrase & gas","L1, L2, bridge & oracle","Smart contract, DeFi & tokenomics"]},
  {t:"On-Chain Analysis",d:"Belajar membaca aktivitas blockchain yang benar-benar terjadi.",s:["Wallet tracking","Exchange inflow/outflow","Whale & holder concentration","TVL, active address & volume","Stablecoin liquidity & realized P/L"]},
  {t:"Market Structure & Trading",d:"Baca market sebagai sistem probabilitas, bukan mesin ramalan.",s:["Trend & market structure","Support/resistance & liquidity","Volume & order flow","Open interest & funding","Position sizing & drawdown control"]},
  {t:"Makroekonomi",d:"Pahami kekuatan besar yang menggerakkan uang dan aset global.",s:["Inflasi & suku bunga","Federal Reserve","Bond yield & DXY","GDP & unemployment","Liquidity cycle & risk assets"]},
  {t:"Psikologi & Behavioral Finance",d:"Latih pikiran agar keputusan uang tidak dikuasai emosi.",s:["FOMO, fear & greed","Confirmation bias","Sunk-cost fallacy","Overconfidence & herd mentality","Trading/investing journal"]},
  {t:"Probabilistic Thinking",d:"Berpikir dalam peluang, skenario, dan expected value.",s:["Probability dasar","Expected value","Base rate","Bayesian thinking dasar","Scenario planning"]},
  {t:"Cybersecurity",d:"Lindungi uang, identitas, akun, dan aset digital.",s:["Password manager & 2FA","Phishing & social engineering","Seed phrase security","Hot vs cold wallet","Approval, drainer & device security"]},
  {t:"Programming + AI + Automation",d:"Gunakan teknologi untuk membuat sistem yang bekerja lebih cepat dan konsisten.",s:["JavaScript/Python dasar","API & webhook","Database & SQL","AI API & agents","Automation, deployment & monitoring"]},
  {t:"Data Analysis",d:"Ubah data menjadi keputusan yang bisa diuji.",s:["Spreadsheet tingkat lanjut","Statistik dasar","Correlation & distribution","SQL query dasar","Visualisasi & dashboard"]},
  {t:"Ekonomi Insentif",d:"Selalu cari siapa mendapat keuntungan, dari mana, dan kenapa.",s:["Incentive design","Principal-agent problem","Founder & investor incentives","Exchange/market-maker incentives","Token & community incentives"]},
  {t:"Communication",d:"Buat pikiranmu mudah dipahami, dipercaya, dan diingat.",s:["Menulis jelas","Storytelling","Public speaking","Presentasi data","Bahasa Inggris profesional"]},
  {t:"Networking",d:"Bangun jaringan berdasarkan value dan reputasi.",s:["Personal reputation","Give value first","Professional outreach","Follow-up & relationship building","Community & collaboration"]},
  {t:"Leadership & Management",d:"Naik dari pekerja menjadi operator yang mampu membangun tim dan sistem.",s:["Delegation","SOP","Hiring dasar","KPI & feedback","Culture & project management"]},
  {t:"Legal & Pajak Dasar",d:"Pahami aturan dasar supaya aset dan bisnis tumbuh dengan aman.",s:["Kontrak dasar","Badan usaha","Pajak pribadi/bisnis dasar","Hak kekayaan intelektual","Regulasi aset digital dasar"]},
  {t:"Capital Allocation",d:"Belajar memilih penggunaan terbaik untuk setiap rupiah modal.",s:["Return on capital","Cash vs productive assets","Business vs investment allocation","Risk-adjusted return","Rebalancing & capital preservation"]}
];

const KEY = "bisma_growth_v1";
const todayKey = () => {
  const d = new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
};
const defaultState = () => ({attendance:{},checks:{},notes:{},minutes:{},created:Date.now()});
let state;
try{ state = Object.assign(defaultState(), JSON.parse(localStorage.getItem(KEY)||"{}")); }catch(e){ state=defaultState(); }
state.attendance ||= {}; state.checks ||= {}; state.notes ||= {}; state.minutes ||= {};

function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function esc(v){ return String(v??"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
function doneCount(i){ return (state.checks[i]||[]).filter(Boolean).length; }
function topicPct(i){ return Math.round(doneCount(i)/topics[i].s.length*100); }
function totalChecks(){ return topics.reduce((n,_,i)=>n+doneCount(i),0); }
function totalPossible(){ return topics.reduce((n,x)=>n+x.s.length,0); }
function totalMinutes(){ return Object.values(state.minutes).reduce((a,b)=>a+(Number(b)||0),0); }
function completedTopics(){ return topics.filter((_,i)=>topicPct(i)===100).length; }
function allProgress(){ return Math.round(totalChecks()/totalPossible()*100); }
function totalXP(){ return totalChecks()*100 + Object.keys(state.attendance).length*50 + totalMinutes()*2; }
function level(){ return Math.floor(totalXP()/500)+1; }

function addDays(date,delta){ const d=new Date(date); d.setDate(d.getDate()+delta); return d; }
function ymd(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function streak(){
  let n=0, d=new Date();
  if(!state.attendance[ymd(d)]) d=addDays(d,-1);
  while(state.attendance[ymd(d)]){ n++; d=addDays(d,-1); }
  return n;
}
function weekDays(){
  const names=["Min","Sen","Sel","Rab","Kam","Jum","Sab"], out=[];
  for(let i=6;i>=0;i--){ const d=addDays(new Date(),-i); out.push({k:ymd(d),name:names[d.getDay()],num:d.getDate()}); }
  return out;
}
function nextTopic(){
  const idx=topics.findIndex((_,i)=>topicPct(i)<100);
  return idx===-1?0:idx;
}
function toast(msg){
  const x=document.createElement("div"); x.className="toast"; x.textContent=msg; document.body.appendChild(x);
  setTimeout(()=>x.remove(),1800);
}

function render(){
  const tkey=todayKey(), checked=!!state.attendance[tkey], focus=nextTopic();
  document.getElementById("app").innerHTML =
  '<main class="app">'+
    '<div class="topbar"><div class="brand"><small>BUILD YOURSELF DAILY</small><h1>BISMA GROWTH</h1><p>20 Skill Mastery • belajar sedikit, konsisten, jadi kuat.</p></div>'+
    '<div class="level"><b>LV '+level()+'</b><span>'+totalXP()+' XP</span></div></div>'+
    '<section class="hero"><div class="hero-row"><div><div class="eyebrow">ABSEN HARI INI</div><h2>'+new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long"}).format(new Date())+'</h2><p>Target sederhana: hadir, belajar, catat, ulangi.</p></div>'+
    '<button class="checkin '+(checked?'done':'')+'" id="checkin">'+(checked?'✓ Sudah Absen':'Absen Belajar')+'</button></div>'+
    '<div class="stats">'+
      '<div class="stat"><strong>'+streak()+'</strong><span>Streak hari</span></div>'+
      '<div class="stat"><strong>'+completedTopics()+'/20</strong><span>Topik tamat</span></div>'+
      '<div class="stat"><strong>'+totalChecks()+'/'+totalPossible()+'</strong><span>Checkpoint</span></div>'+
      '<div class="stat"><strong>'+totalMinutes()+'</strong><span>Menit fokus</span></div>'+
    '</div></section>'+
    '<section class="section"><div class="section-title"><h3>Progress keseluruhan</h3><span>'+allProgress()+'%</span></div><div class="progress-wrap"><div class="progress-bar" style="width:'+allProgress()+'%"></div></div></section>'+
    '<section class="section"><div class="section-title"><h3>Fokus berikutnya</h3><span>lanjutkan yang belum 100%</span></div>'+
      '<div class="focus"><div class="num">'+(focus+1)+'</div><div class="focus-content"><b>'+topics[focus].t+'</b><span>'+doneCount(focus)+' dari '+topics[focus].s.length+' checkpoint selesai</span></div><button class="open-btn" data-open="'+focus+'">Buka</button></div>'+
    '</section>'+
    '<section class="section"><div class="section-title"><h3>7 hari terakhir</h3><span>'+Object.keys(state.attendance).length+' total kehadiran</span></div><div class="week">'+weekDays().map(x=>'<div class="day '+(state.attendance[x.k]?'on':'')+'"><b>'+x.name+'</b><span>'+x.num+(state.attendance[x.k]?' ✓':'')+'</span></div>').join("")+'</div></section>'+
    '<section class="section"><div class="section-title"><h3>20 hal yang harus aku dalami</h3><span>tap untuk belajar</span></div><div class="topic-grid">'+
      topics.map((x,i)=>'<div class="topic '+(topicPct(i)===100?'done':'')+'" data-open="'+i+'"><div class="topic-num">'+(topicPct(i)===100?'✓':i+1)+'</div><div class="topic-body"><div class="topic-name">'+x.t+'</div><div class="topic-meta"><div class="mini"><i style="width:'+topicPct(i)+'%"></i></div><div class="pct">'+topicPct(i)+'%</div></div></div></div>').join("")+
    '</div></section>'+
    '<button class="reset" id="reset">Reset semua progres</button>'+
    '<div class="footer">BISMA GROWTH • offline-first • data tersimpan di perangkat</div>'+
  '</main>';

  document.getElementById("checkin").onclick=()=>{
    if(!state.attendance[tkey]){ state.attendance[tkey]=Date.now(); save(); toast("Absen tercatat. +50 XP"); render(); }
    else toast("Hari ini kamu sudah absen.");
  };
  document.querySelectorAll("[data-open]").forEach(el=>el.onclick=()=>openTopic(Number(el.dataset.open)));
  document.getElementById("reset").onclick=()=>{
    if(confirm("Reset seluruh absen, progres, menit belajar, dan catatan?")){
      state=defaultState(); save(); render(); toast("Semua progres direset.");
    }
  };
}

function openTopic(i){
  const x=topics[i], arr=state.checks[i]||Array(x.s.length).fill(false);
  state.checks[i]=arr;
  const bg=document.createElement("div"); bg.className="modal-bg";
  bg.innerHTML='<div class="modal"><div class="modal-head"><div><div class="modal-kicker">TOPIK '+(i+1)+' • '+topicPct(i)+'%</div><h3>'+x.t+'</h3><div class="desc">'+x.d+'</div></div><button class="close">×</button></div>'+
    '<div class="checklist">'+x.s.map((s,j)=>'<label class="check-row"><input type="checkbox" data-check="'+j+'" '+(arr[j]?'checked':'')+'><span>'+s+'</span></label>').join("")+'</div>'+
    '<label class="notes-label">CATATAN BELAJAR</label><textarea class="notes" placeholder="Tulis insight, rumus, ide, link penting, atau kesimpulanmu...">'+esc(state.notes[i]||"")+'</textarea>'+
    '<div class="actions"><button class="action" id="saveNote">Simpan catatan</button><button class="action gold" id="focus25">+25 menit fokus</button></div></div>';
  document.body.appendChild(bg);
  const close=()=>bg.remove();
  bg.querySelector(".close").onclick=close;
  bg.onclick=e=>{if(e.target===bg)close();};
  bg.querySelectorAll("[data-check]").forEach(c=>c.onchange=()=>{
    const j=Number(c.dataset.check); state.checks[i][j]=c.checked; save(); toast(c.checked?"+100 XP • checkpoint selesai":"Checkpoint dibuka lagi");
    const kicker=bg.querySelector(".modal-kicker"); kicker.textContent="TOPIK "+(i+1)+" • "+topicPct(i)+"%";
  });
  bg.querySelector("#saveNote").onclick=()=>{ state.notes[i]=bg.querySelector(".notes").value; save(); toast("Catatan disimpan."); };
  bg.querySelector("#focus25").onclick=()=>{ const k=todayKey(); state.minutes[k]=(Number(state.minutes[k])||0)+25; state.attendance[k] ||= Date.now(); save(); toast("+25 menit fokus tercatat."); };
}
render();
