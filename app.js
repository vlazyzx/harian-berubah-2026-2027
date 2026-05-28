// ==============================
//   GRIND MODE — app.js
//   Daily Habit Tracker Logic
// ==============================

// ---- Habit Definitions ----
const HABITS = [
  { id: 'noPMO',     emoji: '🧠', label: 'No PMO'           },
  { id: 'sunscreen', emoji: '🌞', label: 'Sunscreen'        },
  { id: 'pushup',    emoji: '💪', label: 'Push Up 5x'       },
  { id: 'water',     emoji: '💧', label: 'Minum Air 8 Gelas'},
  { id: 'sleep',     emoji: '🌙', label: 'Tidur Tepat Waktu'},
  { id: 'skincare',  emoji: '✨', label: 'Skincare Malam'   },
  { id: 'washface',  emoji: '🫧', label: 'Cuci Muka Malam'  },
];

// ---- Helpers ----
// "Hari ini" berbasis WIB (UTC+7), hari baru mulai jam 06:00 WIB
// Sebelum jam 06:00 WIB masih dianggap hari sebelumnya
const todayKey = () => {
  const now = new Date();
  const wibMs = now.getTime() + 7 * 60 * 60 * 1000; // geser ke WIB
  const wib   = new Date(wibMs);
  // Sebelum jam 06:00 UTC pada tanggal WIB = masih hari kemarin
  if (wib.getUTCHours() < 6) {
    wib.setUTCDate(wib.getUTCDate() - 1);
  }
  return wib.toISOString().slice(0, 10);
};

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
};

const getDayLabel = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'short' });
};

// ---- LocalStorage Helpers ----
const getStorageData = () => {
  try { return JSON.parse(localStorage.getItem('grindmode_data') || '{}'); }
  catch { return {}; }
};

const saveStorageData = (data) => {
  localStorage.setItem('grindmode_data', JSON.stringify(data));
};

const getTodayData = () => {
  const data = getStorageData();
  const key = todayKey();
  if (!data[key]) data[key] = { habits: {}, completedAt: {} };
  return data[key];
};

const saveTodayData = (dayData) => {
  const data = getStorageData();
  data[todayKey()] = dayData;
  saveStorageData(data);
};

// ---- Score Labels ----
const getScoreLabel = (pct) => {
  if (pct === 0)  return "LET'S GO 🚀";
  if (pct < 25)   return 'JUST STARTED';
  if (pct < 50)   return 'KEEP PUSHING';
  if (pct < 75)   return 'HALFWAY THERE 🔥';
  if (pct < 100)  return 'ALMOST DONE!';
  return 'LOCKED IN 👑';
};

// ---- Hitung sisa waktu sampai jam 06:00 WIB ----
const getSecondsUntilUnlock = () => {
  const now   = new Date();
  const wibMs = now.getTime() + 7 * 60 * 60 * 1000;
  const wib   = new Date(wibMs);

  // Jam 06:00 WIB hari ini (dalam UTC)
  const unlock = new Date(wib);
  unlock.setUTCHours(6, 0, 0, 0);

  // Kalau jam WIB sudah lewat jam 06, unlock adalah jam 06 besok
  if (wib.getUTCHours() >= 6) {
    unlock.setUTCDate(unlock.getUTCDate() + 1);
  }

  return Math.max(0, Math.floor((unlock.getTime() - now.getTime()) / 1000));
};

const formatCountdown = (secs) => {
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

let countdownInterval = null;

const startCountdown = () => {
  const el = document.getElementById('unlock-countdown');
  const info = document.getElementById('unlock-info');
  if (!el || !info) return;
  info.classList.remove('hidden');

  const tick = () => {
    const secs = getSecondsUntilUnlock();
    el.textContent = formatCountdown(secs);
    if (secs === 0) {
      clearInterval(countdownInterval);
      location.reload();
    }
  };
  tick();
  countdownInterval = setInterval(tick, 1000);
};

// ---- Lock UI setelah submit ----
const applySubmitLock = (submittedAt) => {
  const submitBtn = document.getElementById('submit-btn');
  const statusEl  = document.getElementById('submit-status');

  // Disable semua habit item
  document.querySelectorAll('.habit-item').forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.6';
  });

  // Disable reset button
  const resetBtn = document.getElementById('reset-btn');
  resetBtn.disabled = true;
  resetBtn.style.opacity = '0.3';
  resetBtn.style.cursor = 'not-allowed';

  // Ganti tombol submit jadi locked
  submitBtn.disabled = true;
  submitBtn.textContent = '🔒 SUDAH DISIMPAN';
  submitBtn.style.borderColor = '#4b5563';
  submitBtn.style.color = '#4b5563';
  submitBtn.style.cursor = 'not-allowed';
  submitBtn.style.background = 'none';

  // Tampilkan info waktu submit permanen
  statusEl.textContent = `🔒 LOCKED — disimpan pukul ${submittedAt}`;
  statusEl.classList.remove('hidden');
  statusEl.style.color = '#6b6b8a';

  // Mulai countdown unlock
  startCountdown();
};

// ---- Render Habit List ----
const renderHabits = () => {
  const dayData = getTodayData();
  const isLocked = !!dayData.submittedAt;
  const list = document.getElementById('habit-list');
  list.innerHTML = '';

  HABITS.forEach((habit) => {
    const done = !!dayData.habits[habit.id];
    const time = dayData.completedAt[habit.id] || '';

    const item = document.createElement('div');
    item.className = `habit-item${done ? ' completed' : ''}`;
    item.dataset.id = habit.id;
    item.innerHTML = `
      <div class="habit-check">${done ? '✓' : ''}</div>
      <span class="habit-emoji">${habit.emoji}</span>
      <span class="habit-label">${habit.label}</span>
      ${time ? `<span class="habit-time">${time}</span>` : ''}
    `;

    if (!isLocked) {
      item.addEventListener('click', (e) => toggleHabit(habit.id, e));
    }
    list.appendChild(item);
  });

  updateStats();

  // Kalau sudah pernah submit hari ini, langsung lock
  if (isLocked) {
    applySubmitLock(dayData.submittedAt);
  }
};

// ---- Toggle Habit ----
const toggleHabit = (habitId, e) => {
  const dayData = getTodayData();
  if (dayData.submittedAt) return; // extra guard
  const wasChecked = !!dayData.habits[habitId];

  const item = document.querySelector(`.habit-item[data-id="${habitId}"]`);
  if (item) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = item.getBoundingClientRect();
    const size = 40;
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
    item.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  }

  if (wasChecked) {
    delete dayData.habits[habitId];
    delete dayData.completedAt[habitId];
  } else {
    dayData.habits[habitId] = true;
    dayData.completedAt[habitId] = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  saveTodayData(dayData);
  renderHabits();
};

// ---- Update Stats ----
const updateStats = () => {
  const dayData = getTodayData();
  const done  = Object.keys(dayData.habits).length;
  const total = HABITS.length;
  const pct   = Math.round((done / total) * 100);

  document.getElementById('progress-bar').style.width  = pct + '%';
  document.getElementById('progress-text').textContent = `${done}/${total} COMPLETED`;
  document.getElementById('progress-percent').textContent = pct + '%';

  document.getElementById('score-display').textContent = pct + '%';
  document.getElementById('score-label').textContent   = getScoreLabel(pct);

  const circumference = 238.76;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('donut-circle').style.strokeDashoffset = offset;
  document.getElementById('donut-text').textContent = pct + '%';

  updateStreak();
  renderBarChart();
  renderTable();
};

// ---- Streak Calculation ----
const updateStreak = () => {
  const data = getStorageData();
  let streak = 0;
  let d = new Date();

  while (true) {
    const key = d.toISOString().slice(0, 10);
    const day = data[key];
    if (!day) break;
    const done = Object.keys(day.habits || {}).length;
    if (done < HABITS.length) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }

  document.getElementById('streak-count').textContent = streak;
};

// ---- Bar Chart (7 days) ----
const renderBarChart = () => {
  const data = getStorageData();
  const today = todayKey();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const day = data[key];
    const done = day ? Object.keys(day.habits || {}).length : 0;
    days.push({ key, done, label: getDayLabel(key), isToday: key === today });
  }

  const barChart  = document.getElementById('bar-chart');
  const barLabels = document.getElementById('bar-labels');
  barChart.innerHTML  = '';
  barLabels.innerHTML = '';

  days.forEach(({ done, label, isToday }) => {
    const pct = (done / HABITS.length) * 100;
    const bar = document.createElement('div');
    bar.className = `bar-item${isToday ? ' today' : ''}${done === 0 ? ' empty' : ''}`;
    bar.style.height = Math.max(pct, 5) + '%';
    bar.title = `${done}/${HABITS.length} habits`;
    barChart.appendChild(bar);

    const lbl = document.createElement('span');
    lbl.textContent = label;
    lbl.className = isToday ? 'text-neon-cyan' : '';
    barLabels.appendChild(lbl);
  });
};

// ---- History Table ----
const renderTable = () => {
  const data = getStorageData();
  const today = todayKey();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const thead = document.getElementById('table-header');
  thead.innerHTML = `<th>TANGGAL</th>` +
    HABITS.map(h => `<th title="${h.label}">${h.emoji}</th>`).join('') +
    `<th>%</th>`;

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  days.forEach(dateKey => {
    const day = data[dateKey] || { habits: {} };
    const done = Object.keys(day.habits || {}).length;
    const pct  = Math.round((done / HABITS.length) * 100);
    const isToday = dateKey === today;

    let pctClass = 'pct-zero';
    if (pct >= 80) pctClass = 'pct-high';
    else if (pct >= 50) pctClass = 'pct-mid';
    else if (pct > 0)   pctClass = 'pct-low';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="${isToday ? 'text-neon-cyan font-bold' : 'text-gray-300'}">
        ${isToday ? '▶ ' : ''}${formatDateLabel(dateKey)}
      </td>
      ${HABITS.map(h => `
        <td class="cell-check">
          ${(day.habits || {})[h.id] ? '✅' : '<span style="color:#333">—</span>'}
        </td>
      `).join('')}
      <td><span class="pct-pill ${pctClass}">${pct}%</span></td>
    `;
    tbody.appendChild(tr);
  });
};

// ---- Submit / Save Today ----
document.getElementById('submit-btn').addEventListener('click', () => {
  const dayData = getTodayData();
  if (dayData.submittedAt) return; // Sudah disimpan hari ini, block

  const done  = Object.keys(dayData.habits).length;
  const total = HABITS.length;
  const time  = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  dayData.submittedAt = time;
  saveTodayData(dayData);

  const statusEl  = document.getElementById('submit-status');
  const submitBtn = document.getElementById('submit-btn');

  statusEl.textContent = `✓ TERSIMPAN — ${done}/${total} habits — ${time}`;
  statusEl.classList.remove('hidden');

  // Flash hijau sebentar, lalu lock permanen
  submitBtn.classList.add('bg-neon-cyan', 'text-black');
  setTimeout(() => {
    submitBtn.classList.remove('bg-neon-cyan', 'text-black');
    applySubmitLock(time);
  }, 600);
});

// ---- Reset Today ----
document.getElementById('reset-btn').addEventListener('click', () => {
  const confirmed = confirm('Reset semua habit hari ini? Data akan dihapus!');
  if (confirmed) {
    const data = getStorageData();
    data[todayKey()] = { habits: {}, completedAt: {} };
    saveStorageData(data);
    renderHabits();
  }
});

// ---- Live Clock ----
const updateClock = () => {
  const now = new Date();
  document.getElementById('current-date').textContent =
    now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('current-time').textContent =
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ---- Auto-unlock check: setiap menit cek apakah sudah jam 06:00 WIB ----
const checkAutoUnlock = () => {
  const now    = new Date();
  const wibMs  = now.getTime() + 7 * 60 * 60 * 1000;
  const wib    = new Date(wibMs);
  const h = wib.getUTCHours();
  const m = wib.getUTCMinutes();
  // Tepat jam 06:00 WIB (h=6, m=0) reload halaman supaya hari baru dimulai
  if (h === 6 && m === 0) {
    location.reload();
  }
};

// ---- Init ----
updateClock();
setInterval(updateClock, 1000);
setInterval(checkAutoUnlock, 60 * 1000); // cek tiap menit
renderHabits();