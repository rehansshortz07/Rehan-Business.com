// =========================================================
// 1. Firebase Initialization & Authentication
// =========================================================
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCMVD6bTQct-o_OWWvtBwrJOa3DJSWMhv0",
  authDomain: "myhealth-67e39.firebaseapp.com",
  databaseURL: "https://myhealth-67e39-default-rtdb.firebaseio.com",
  projectId: "myhealth-67e39",
  storageBucket: "myhealth-67e39.firebasestorage.app",
  messagingSenderId: "1067008214544",
  appId: "1:1067008214544:web:89775a4b4379aa2f062c95",
  measurementId: "G-5FDQ23216F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// DOM Elements
const authContainer = document.getElementById("authContainer");
const appContainer = document.querySelector(".app");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const tabLoginBtn = document.getElementById("tabLoginBtn");
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const loginError = document.getElementById("loginError");
const regError = document.getElementById("regError");
const logoutBtn = document.getElementById("logoutBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");

// Tab switching between Sign In & Register
function switchAuthTab(tab) {
  if (tab === "login") {
    tabLoginBtn?.classList.add("active");
    tabRegisterBtn?.classList.remove("active");
    loginForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");
  } else {
    tabRegisterBtn?.classList.add("active");
    tabLoginBtn?.classList.remove("active");
    registerForm?.classList.remove("hidden");
    loginForm?.classList.add("hidden");
  }
  if (loginError) loginError.textContent = "";
  if (regError) regError.textContent = "";
}

tabLoginBtn?.addEventListener("click", () => switchAuthTab("login"));
tabRegisterBtn?.addEventListener("click", () => switchAuthTab("register"));

function formatAuthError(error) {
  if (error.code === "auth/operation-not-allowed") {
    return "Email/Password sign-in is disabled. Please enable it in Firebase Console > Authentication > Sign-in method.";
  }
  if (error.code === "auth/email-already-in-use") {
    return "This email is already registered. Please click 'Sign In' above.";
  }
  if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
    return "Invalid email address or password. Please check your credentials.";
  }
  return error.message.replace("Firebase: ", "");
}

// Handle Registration with Email & Password
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (regError) regError.textContent = "";
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
  } catch (err) {
    if (regError) regError.textContent = formatAuthError(err);
  }
});

// Handle Login with Email & Password
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (loginError) loginError.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (loginError) loginError.textContent = formatAuthError(err);
  }
});

// Handle Google Sign In
googleSignInBtn?.addEventListener("click", async () => {
  if (loginError) loginError.textContent = "";
  if (regError) regError.textContent = "";
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (err) {
    const msg = formatAuthError(err);
    if (loginError) loginError.textContent = msg;
  }
});

// Handle Logout
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign out error:", err);
  }
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in -> show application
    authContainer?.classList.add("hidden");
    appContainer?.classList.remove("hidden");

    // Sync authenticated user info to patient chip
    const displayName = user.displayName || user.email.split("@")[0];
    const userBlood = document.getElementById("regBlood")?.value || "O+";
    
    currentPatient.name = displayName;
    currentPatient.id = `PT-${user.uid.substring(0, 6).toUpperCase()}`;
    currentPatient.blood = userBlood;
    renderPatient(currentPatient);
  } else {
    // User is logged out -> show auth container
    authContainer?.classList.remove("hidden");
    appContainer?.classList.add("hidden");
  }
});

// =========================================================
// 2. MedLedger Patient Data Engine & Render Engine
// =========================================================

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260823);
const pick = arr => arr[Math.floor(rand() * arr.length)];
function shuffle(arr) {
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FIRST_M = ['Arjun','Rohan','Vikram','Aditya','Karthik','Suresh','Manoj','Rahul','Sanjay','Naveen','Deepak','Anil','Praveen','Ravi','Ganesh'];
const FIRST_F = ['Ananya','Priya','Sneha','Divya','Meera','Kavya','Pooja','Lakshmi','Neha','Shreya','Anjali','Swathi','Radhika','Nisha','Deepa'];
const LAST    = ['Rao','Sharma','Iyer','Reddy','Nair','Gupta','Menon','Kulkarni','Patel','Verma','Pillai','Bhat','Shetty','Naidu','Joshi'];
const CITIES  = ['Bengaluru','Chennai','Hyderabad','Mumbai','Pune','Delhi','Kochi','Coimbatore'];
const HOSPITALS = ['Apollo Hospitals','Fortis Hospital','Manipal Hospital','Narayana Health','St. John’s Medical College','Columbia Asia','Aster CMI','Sakra World Hospital'];
const DOCTORS = ['Dr. S. Kulkarni','Dr. R. Iyer','Dr. A. Mehta','Dr. N. Rao','Dr. P. Krishnan','Dr. V. Nair','Dr. K. Reddy','Dr. M. Bhat'];
const BLOOD_GROUPS = ['O+','O-','A+','A-','B+','B-','AB+','AB-'];
const CONDITIONS = ['Type 2 Diabetes','Hypertension','Asthma','Hypothyroidism','Seasonal Allergies','Migraine','General Wellness (no chronic condition)'];
const TASK_POOL = ['Blood pressure check','Blood sugar check','Follow-up consultation','Physiotherapy session','Medication refill','Vaccination due','Dietician consultation'];

const DOC_TYPES = [
  {tag:'rx',   label:'Prescription', icon:'💊', titles:['Metformin 500mg','Amoxicillin 500mg','Atorvastatin 10mg','Insulin Glargine','Cetirizine 10mg','Azithromycin 500mg','Losartan 50mg','Salbutamol Inhaler']},
  {tag:'lab',  label:'Lab',          icon:'🩸', titles:['Lipid Profile','HbA1c Test','Complete Blood Count','Thyroid Panel (TSH)','Liver Function Test','Vitamin D Test','Kidney Function Test']},
  {tag:'img',  label:'Imaging',      icon:'🩻', titles:['Chest X-Ray','Abdominal Ultrasound','MRI — Lumbar Spine','CT Scan — Brain','ECG Report','Echocardiogram']},
  {tag:'surg', label:'Surgery',      icon:'🧾', titles:['Appendectomy Report','Gallbladder Removal','Knee Arthroscopy','Cataract Surgery','Hernia Repair']},
  {tag:'vac',  label:'Vaccination',  icon:'💉', titles:['Tetanus Booster','Influenza Vaccine','COVID-19 Booster','Hepatitis B Vaccine','Typhoid Vaccine']},
];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function randomDate(y1, y2) {
  const year = y1 + Math.floor(rand() * (y2 - y1 + 1));
  const month = Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  return {
    label: `${String(day).padStart(2,'0')} ${MONTHS[month]} ${year}`,
    sortKey: new Date(year, month, day).getTime()
  };
}

function generatePatients(count) {
  const patients = [];
  for(let i = 1; i <= count; i++) {
    const gender = rand() > 0.5 ? 'F' : 'M';
    const name = `${gender==='F'?pick(FIRST_F):pick(FIRST_M)} ${pick(LAST)}`;
    const age = 8 + Math.floor(rand() * 77);
    const blood = pick(BLOOD_GROUPS);
    const city = pick(CITIES);
    const condition = pick(CONDITIONS);
    const id = `PT-2024-${String(i).padStart(5,'0')}`;

    const recordCount = 3 + Math.floor(rand() * 7);
    const records = [];
    for(let r = 0; r < recordCount; r++) {
      const type = pick(DOC_TYPES);
      const d = randomDate(2020, 2026);
      records.push({
        tag: type.tag, label: type.label, icon: type.icon,
        title: pick(type.titles),
        doctor: pick(DOCTORS),
        hospital: pick(HOSPITALS),
        date: d.label, sortKey: d.sortKey
      });
    }

    const taskCount = 2 + Math.floor(rand() * 3);
    const tasks = [];
    for(let t = 0; t < taskCount; t++) {
      tasks.push({
        name: pick(TASK_POOL),
        detail: `${pick(DOCTORS)} · ${pick(HOSPITALS)}`,
        done: rand() > 0.5
      });
    }

    const shareCount = Math.min(records.length, 2 + Math.floor(rand() * 3));
    const shared = shuffle(records).slice(0, shareCount).map(r => ({
      name: `${r.title} — ${r.date}`, meta: r.label, on: rand() > 0.4
    }));

    patients.push({ id, name, age, gender, blood, city, condition, records, tasks, shared });
  }
  return patients;
}

const PATIENT_DB = generatePatients(50);
let currentPatient = PATIENT_DB[0];

const CASES = [
  {id:'CASE #A104', title:'Type 2 Diabetes — 3 year management arc', field:'Endocrinology'},
  {id:'CASE #B221', title:'Post-appendectomy recovery timeline', field:'General Surgery'},
  {id:'CASE #C019', title:'Lipid abnormality trend across 4 tests', field:'Cardiology'},
  {id:'CASE #D087', title:'Vaccination adherence over 5 years', field:'Preventive Care'},
];

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
}

function renderPatientChip(p) {
  const chip = document.querySelector('.patient-chip');
  if(!chip) return;
  const avatar = chip.querySelector('.avatar');
  const who = chip.querySelector('.who');
  const idEl = chip.querySelector('.id');
  if(avatar) avatar.textContent = initials(p.name);
  if(who) who.textContent = p.name;
  if(idEl) idEl.textContent = `${p.id} · ${p.blood}`;
}

function renderStats(p) {
  const nums = document.querySelectorAll('.grid-stats .stat-num');
  if(nums.length < 4) return;
  const years = p.records.map(r => new Date(r.sortKey).getFullYear());
  const span = years.length ? (Math.max(...years) - Math.min(...years)) : 0;
  nums[0].textContent = p.records.length;
  nums[1].textContent = span > 0 ? `${span} yrs` : '<1 yr';
  nums[2].textContent = p.tasks.filter(t => !t.done).length;
  nums[3].textContent = p.shared.filter(s => s.on).length;
}

function docCardHTML(r) {
  return `
    <div class="doc-card">
      <div class="doc-top">
        <div class="doc-icon">${r.icon}</div>
        <span class="tag ${r.tag}">${r.label}</span>
      </div>
      <div class="doc-title">${r.title}</div>
      <div class="doc-meta">${r.doctor} · ${r.hospital}</div>
      <div class="doc-date mono">${r.date}</div>
    </div>`;
}

function timelineItemHTML(r) {
  return `
    <div class="t-item"><div class="t-dot"></div>
      <div class="t-date mono">${r.date}</div>
      <div class="t-card">
        <div><div class="t-title">${r.title}</div><div class="t-sub">${r.doctor} · ${r.hospital}</div></div>
        <span class="tag ${r.tag}">${r.label}</span>
      </div>
    </div>`;
}

function renderVault(p) {
  const grid = document.getElementById('vaultGrid');
  if(!grid) return;
  grid.innerHTML = p.records.slice().sort((a,b) => b.sortKey - a.sortKey).map(docCardHTML).join('');
}

function renderTimeline(p) {
  const el = document.getElementById('timelineFull');
  if(!el) return;
  el.innerHTML = p.records.slice().sort((a,b) => a.sortKey - b.sortKey).map(timelineItemHTML).join('');
}

function renderRecentActivity(p) {
  const el = document.getElementById('recentActivity');
  if(!el) return;
  const top4 = p.records.slice().sort((a,b) => b.sortKey - a.sortKey).slice(0,4);
  el.innerHTML = top4.map(timelineItemHTML).join('') || '<div class="t-sub">No records yet.</div>';
}

function renderTracker(p) {
  const list = document.getElementById('trackList');
  if(!list) return;
  list.innerHTML = p.tasks.map((t,i) => `
    <div class="track-item ${t.done?'done':''}" data-i="${i}">
      <div class="chk ${t.done?'checked':''}">${t.done?'✓':''}</div>
      <div><div class="t-name">${t.name}</div><div class="t-detail">${t.detail}</div></div>
      <span class="badge ${t.done?'ok':'due'}">${t.done?'Done today':'Pending'}</span>
    </div>`).join('');
  
  list.querySelectorAll('.track-item').forEach(el => {
    el.addEventListener('click', () => {
      const i = el.dataset.i;
      currentPatient.tasks[i].done = !currentPatient.tasks[i].done;
      renderTracker(currentPatient);
      renderReminders(currentPatient);
      renderStats(currentPatient);
    });
  });
}

function renderReminders(p) {
  const el = document.getElementById('remList');
  if(!el) return;
  const pending = p.tasks.filter(t => !t.done);
  if(pending.length === 0) {
    el.innerHTML = `<div class="rem-sub">Nothing pending — all caught up.</div>`;
    return;
  }
  el.innerHTML = pending.map((t,i) => `
    <div class="rem-item">
      <div class="rem-dot ${i===0?'overdue':'soon'}"></div>
      <div><div class="rem-title">${t.name}</div><div class="rem-sub">${t.detail} · ${i===0?'overdue by 1 day':'due today'}</div></div>
    </div>`).join('');
}

function renderShare(p) {
  const el = document.getElementById('shareList');
  if(!el) return;
  el.innerHTML = p.shared.map((d,i) => `
    <div class="share-row">
      <button class="switch ${d.on?'on':''}" data-i="${i}"></button>
      <div style="flex:1;">
        <div class="share-name">${d.name}</div>
        <div class="share-meta">${d.meta}</div>
      </div>
    </div>`).join('');
  
  el.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => {
      const i = sw.dataset.i;
      currentPatient.shared[i].on = !currentPatient.shared[i].on;
      renderShare(currentPatient);
      renderStats(currentPatient);
    });
  });
  const codeBox = document.getElementById('codeBox');
  if(codeBox) codeBox.classList.remove('show');
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for(let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  const codeText = document.getElementById('codeText');
  if(codeText) codeText.textContent = code;
  const qr = document.getElementById('qrGrid');
  if(qr) {
    qr.innerHTML = '';
    for(let i = 0; i < 36; i++) {
      const cell = document.createElement('div');
      cell.style.background = Math.random() > 0.55 ? 'var(--ink)' : 'transparent';
      qr.appendChild(cell);
    }
  }
  const codeBox = document.getElementById('codeBox');
  if(codeBox) codeBox.classList.add('show');
}

document.getElementById('generateCodeBtn')?.addEventListener('click', generateCode);

function renderSummary(p) {
  const el = document.getElementById('summaryText');
  if(!el) return;
  const lastLab = p.records.filter(r => r.tag==='lab').sort((a,b) => b.sortKey - a.sortKey)[0];
  const lastImg = p.records.filter(r => r.tag==='img').sort((a,b) => b.sortKey - a.sortKey)[0];
  const firstName = p.name.split(' ')[0];
  const conditionLine = p.condition === 'General Wellness (no chronic condition)'
    ? `${firstName}'s records show no ongoing chronic condition — recent visits relate to routine checkups.`
    : `${firstName}'s records show a history of ${p.condition}, tracked through regular visits and lab work.`;
  const labLine = lastLab ? ` The most recent lab work (${lastLab.title}, ${lastLab.date}) is on file from ${lastLab.hospital}.` : '';
  const imgLine = lastImg ? ` Imaging on record includes a ${lastImg.title} from ${lastImg.date}.` : '';
  el.textContent = conditionLine + labLine + imgLine;
}

function renderLearningHub() {
  const grid = document.getElementById('caseGrid');
  if(!grid) return;
  grid.innerHTML = CASES.map(c => `
    <div class="case-card">
      <div class="case-id mono">${c.id} · ${c.field}</div>
      <div class="case-title">${c.title}</div>
      <div class="case-foot"><span class="consent-tag">Anonymised · Consented</span></div>
    </div>`).join('');
}

function renderPatient(p) {
  currentPatient = p;
  renderPatientChip(p);
  renderStats(p);
  renderVault(p);
  renderTimeline(p);
  renderRecentActivity(p);
  renderTracker(p);
  renderReminders(p);
  renderShare(p);
  renderSummary(p);
}

// Section navigation setup
const TITLES = {
  dashboard: ["Dashboard","Your medical history, organized in one place."],
  vault: ["Medical Vault","Every prescription, scan and report, in one folder."],
  timeline: ["Medical Timeline","Your full history, arranged by date."],
  scanner: ["AI Document Scanner","Upload a photo — AI reads it, you confirm it."],
  tracker: ["Daily Health Tracker","Medicines, injections and appointments, tracked day to day."],
  reminders: ["Reminders","Nothing scheduled gets missed."],
  sharing: ["Privacy & Doctor Sharing","You decide exactly what's visible, and for how long."],
  summary: ["AI Health Summary","A plain-language overview — never a diagnosis."],
  learning: ["Medical Learning Hub","Anonymised, consent-based cases for medical students."]
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    const targetEl = document.getElementById(target);
    if(targetEl) targetEl.classList.add('active');
    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSub');
    if(TITLES[target]) {
      if(titleEl) titleEl.textContent = TITLES[target][0];
      if(subEl) subEl.textContent = TITLES[target][1];
    }
  });
});

// AI Scanner Demo Setup
const scanZone = document.getElementById('scanZone');
const extractBox = document.getElementById('extractBox');
if(scanZone && extractBox) {
  scanZone.addEventListener('click', () => {
    scanZone.innerHTML = `<span class="ic">⏳</span><div>Reading document…</div>`;
    setTimeout(() => {
      scanZone.innerHTML = `<span class="ic">✅</span><div><strong>Scan complete</strong> — review the extracted details below</div>`;
      extractBox.classList.add('show');
    }, 900);
  });
}

function resetScanner() {
  if(!scanZone || !extractBox) return;
  extractBox.classList.remove('show');
  scanZone.innerHTML = `<span class="ic">🤖</span><div><strong>Drop a prescription or report here</strong> — or click to simulate a scan</div>`;
}
document.getElementById('resetScannerBtn')?.addEventListener('click', resetScanner);

// Initial bootstrap
renderLearningHub();
renderPatient(PATIENT_DB[0]);
