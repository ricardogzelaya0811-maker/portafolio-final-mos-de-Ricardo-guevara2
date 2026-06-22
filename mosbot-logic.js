// MOSBOT Academy - Main Logic
let mosbotState = null;
let mosbotCurrentTab = 'missions';

function mosbotLoadState() {
  const name = localStorage.getItem('mosbot_player');
  if (!name) return null;
  const raw = localStorage.getItem('mosbot_state_' + name);
  return raw ? JSON.parse(raw) : { name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString() };
}

async function mosbotSaveState() {
  if (!mosbotState) return;
  localStorage.setItem('mosbot_player', mosbotState.name);
  localStorage.setItem('mosbot_state_' + mosbotState.name, JSON.stringify(mosbotState));
  
  if (window.firebaseInitialized && window.db) {
    try {
      const docId = window.firebaseUserUid || mosbotState.name;
      await db.collection("mosbot_students").doc(docId).set({
        nombre: mosbotState.name,
        uid: window.firebaseUserUid || null,
        xp: mosbotState.xp,
        completedMissions: mosbotState.completed,
        badges: mosbotState.badges,
        fechaUltimoAcceso: new Date().toISOString()
      }, { merge: true });
    } catch(e) { console.error("Error guardando en Firebase:", e); }
  }
  
  mosbotUpdateRanking();
}

async function mosbotUpdateRanking() {
  if (!mosbotState) return;
  let ranking = JSON.parse(localStorage.getItem('mosbot_ranking') || '[]');
  const idx = ranking.findIndex(r => r.name === mosbotState.name);
  const entry = { name: mosbotState.name, xp: mosbotState.xp, completed: mosbotState.completed.length, date: new Date().toISOString() };
  if (idx >= 0) ranking[idx] = entry; else ranking.push(entry);
  ranking.sort((a, b) => b.xp - a.xp);
  localStorage.setItem('mosbot_ranking', JSON.stringify(ranking));

  if (window.firebaseInitialized && window.db) {
    try {
      const snap = await db.collection("mosbot_students").orderBy("xp", "desc").get();
      ranking = snap.docs.map(doc => {
        const d = doc.data();
        return { name: d.nombre, xp: d.xp || 0, completed: d.completedMissions ? d.completedMissions.length : 0 };
      });
      localStorage.setItem('mosbot_ranking', JSON.stringify(ranking));
    } catch(e) { console.error("Error cargando ranking de Firebase:", e); }
  }
  
  if (mosbotCurrentTab === 'missions') {
    const rankingList = document.querySelector('.ranking-list');
    if (rankingList) {
      rankingList.innerHTML = ranking.slice(0, 5).map((r, i) => `
        <li><span class="r-name">#${i+1} ${r.name}</span> <span class="r-xp">${r.xp} XP</span></li>
      `).join('') || '<li><span class="r-name" style="color:var(--muted)">Sin registros aún</span></li>';
    }
  } else if (mosbotCurrentTab === 'ranking') {
    const area = document.getElementById('mosbotContentArea');
    if (area) mosbotRenderRanking(area);
  }
}

function mosbotGetRank() {
  const xp = mosbotState ? mosbotState.xp : 0;
  let rank = MOSBOT_RANKS[0];
  for (const r of MOSBOT_RANKS) { if (xp >= r.minXP) rank = r; }
  return rank;
}

function mosbotGetNextRank() {
  const xp = mosbotState ? mosbotState.xp : 0;
  for (const r of MOSBOT_RANKS) { if (xp < r.minXP) return r; }
  return null;
}

function mosbotPlaySound(correct) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.value = 0.15;
    if (correct) {
      osc.frequency.value = 523; osc.type = 'sine'; osc.start(); osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); gain.gain.setValueAtTime(0, ctx.currentTime + 0.4); osc.stop(ctx.currentTime + 0.4);
    } else {
      osc.frequency.value = 330; osc.type = 'square'; osc.start();
      osc.frequency.setValueAtTime(260, ctx.currentTime + 0.15); gain.gain.setValueAtTime(0, ctx.currentTime + 0.3); osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {}
}

function mosbotShowToast(icon, title, text) {
  let toast = document.getElementById('mosbotToast');
  if (!toast) {
    toast = document.createElement('div'); toast.id = 'mosbotToast'; toast.className = 'mosbot-toast';
    toast.innerHTML = '<div class="toast-icon"></div><div class="toast-text"><h4></h4><p></p></div>';
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-icon').textContent = icon;
  toast.querySelector('.toast-text h4').textContent = title;
  toast.querySelector('.toast-text p').textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function mosbotCheckBadges() {
  if (!mosbotState) return;
  const c = mosbotState.completed.length;
  const excelDone = MOSBOT_MISSIONS.filter(m => m.type === 'excel').every(m => mosbotState.completed.includes(m.id));
  const wordDone = MOSBOT_MISSIONS.filter(m => m.type === 'word').every(m => mosbotState.completed.includes(m.id));
  MOSBOT_BADGES.forEach(b => {
    if (mosbotState.badges.includes(b.id)) return;
    let earned = false;
    if (typeof b.req === 'number') earned = c >= b.req;
    else if (b.req === 'allExcel') earned = excelDone;
    else if (b.req === 'allWord') earned = wordDone;
    else if (b.req === 'streak3') earned = mosbotState.streak >= 3;
    if (earned) {
      mosbotState.badges.push(b.id);
      mosbotSaveState();
      mosbotShowToast(b.icon, '¡Insignia Desbloqueada!', b.name);
      mosbotPlaySound(true);
    }
  });
}

// ── INIT ──
async function mosbotInit() {
  const saved = mosbotLoadState();
  if (saved && saved.name) {
    mosbotState = saved;
    if (window.firebaseInitialized && window.db) {
      try {
        const docId = window.firebaseUserUid || mosbotState.name;
        const doc = await db.collection("mosbot_students").doc(docId).get();
        if (doc.exists) {
          const d = doc.data();
          mosbotState.xp = d.xp || 0;
          mosbotState.completed = d.completedMissions || [];
          mosbotState.badges = d.badges || [];
          mosbotState.name = d.nombre || mosbotState.name;
        }
      } catch(e) {}
    }
    document.getElementById('mosbotWelcome').style.display = 'none';
    document.getElementById('mosbotDashboard').style.display = 'block';
    mosbotRenderDashboard();
    mosbotUpdateRanking();
  }
}

async function mosbotStartGame() {
  const input = document.getElementById('mosbotNameInput');
  const name = input.value.trim();
  if (!name) { input.style.borderColor = '#ef4444'; return; }
  
  mosbotState = { name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString() };
  
  if (window.firebaseInitialized && window.db) {
    try {
      const docId = window.firebaseUserUid || name;
      const doc = await db.collection("mosbot_students").doc(docId).get();
      if (doc.exists) {
        const d = doc.data();
        mosbotState.xp = d.xp || 0;
        mosbotState.completed = d.completedMissions || [];
        mosbotState.badges = d.badges || [];
        // if the server has a stored name, prefer it
        mosbotState.name = d.nombre || name;
      }
    } catch(e) {}
  } else {
    const existing = localStorage.getItem('mosbot_state_' + name);
    if (existing) mosbotState = JSON.parse(existing);
  }
  
  await mosbotSaveState();
  document.getElementById('mosbotWelcome').style.display = 'none';
  document.getElementById('mosbotDashboard').style.display = 'block';
  mosbotRenderDashboard();
}

function mosbotSwitchTab(tab, btn) {
  mosbotCurrentTab = tab;
  document.querySelectorAll('.mosbot-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  mosbotRenderContent();
}

function mosbotRenderDashboard() {
  const rank = mosbotGetRank();
  const next = mosbotGetNextRank();
  const pct = next ? Math.min(100, ((mosbotState.xp - rank.minXP) / (next.minXP - rank.minXP)) * 100) : 100;
  document.getElementById('mosbotPlayerLabel').textContent = '👤 ' + mosbotState.name;
  document.getElementById('mosbotRankBadge').innerHTML = rank.icon + ' ' + rank.name;
  document.getElementById('mosbotXPValue').innerHTML = '<span>' + mosbotState.xp + '</span> XP';
  document.getElementById('mosbotProgressFill').style.width = pct + '%';
  document.getElementById('mosbotProgressLeft').textContent = rank.icon + ' ' + rank.name;
  document.getElementById('mosbotProgressRight').textContent = next ? (next.icon + ' ' + next.name + ' (' + next.minXP + ' XP)') : '🏆 ¡Máximo!';
  mosbotRenderContent();
}

function mosbotRenderContent() {
  const area = document.getElementById('mosbotContentArea');
  if (mosbotCurrentTab === 'missions') mosbotRenderMissions(area);
  else if (mosbotCurrentTab === 'badges') mosbotRenderBadges(area);
  else if (mosbotCurrentTab === 'stats') mosbotRenderStats(area);
  else if (mosbotCurrentTab === 'ranking') mosbotRenderRanking(area);
  else if (mosbotCurrentTab === 'cert') mosbotRenderCert(area);
}

function mosbotRenderMissions(area) {
  const currentIdx = mosbotState.completed.length;
  
  if (currentIdx >= MOSBOT_MISSIONS.length) {
    area.innerHTML = `
      <div style="text-align:center; padding: 4rem 2rem; background: var(--card); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--shadow);">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎓</div>
        <h2 style="color: #2dd4bf; margin-bottom: 1rem; font-family: 'Playfair Display', serif;">¡Programa Completado!</h2>
        <p style="color: var(--muted); margin-bottom: 2rem;">Has superado todas las misiones de MOSBOT Academy Ultimate.</p>
        <button class="mosbot-start-btn" style="max-width: 250px;" onclick="mosbotSwitchTab('cert', document.querySelectorAll('.mosbot-tab')[4])">Ver Certificado</button>
      </div>
    `;
    return;
  }

  const m = MOSBOT_MISSIONS[currentIdx];
  const progressPct = Math.round((currentIdx / MOSBOT_MISSIONS.length) * 100);
  const blockName = m.type === 'word' ? '📄 BLOQUE: WORD' : '📊 BLOQUE: EXCEL';
  
  const optionsHtml = m.opts.map((o, oi) => {
    const letter = ['A', 'B', 'C', 'D'][oi];
    return `<label class="mission-opt" id="opt-${m.id}-${oi}">
      <input type="radio" name="q-${m.id}" value="${oi}" onchange="mosbotAnswer('${m.id}')"/>
      <span class="opt-letter">${letter})</span> ${o}
    </label>`;
  }).join('');

  const ranking = JSON.parse(localStorage.getItem('mosbot_ranking') || '[]');
  const rankingHtml = ranking.slice(0, 5).map((r, i) => `
    <li><span class="r-name">#${i+1} ${r.name}</span> <span class="r-xp">${r.xp} XP</span></li>
  `).join('') || '<li><span class="r-name" style="color:var(--muted)">Sin registros aún</span></li>';

  const badgesHtml = MOSBOT_BADGES.slice(0, 5).map(b => 
    `<span class="sidebar-badge ${mosbotState.badges.includes(b.id) ? 'earned' : ''}" title="${b.name}">${b.icon}</span>`
  ).join('');

  area.innerHTML = `
    <div class="mosbot-mission-layout">
      <div class="mosbot-mission-main">
        <div class="mission-progress-header">
          <span>Misión ${currentIdx + 1} de ${MOSBOT_MISSIONS.length}</span>
          <span>${progressPct}%</span>
        </div>
        <div class="mission-progress-bar">
          <div class="mission-progress-fill" id="missionProgressFill" style="width: ${progressPct}%"></div>
        </div>
        
        <div class="mission-block-label">${blockName}</div>
        
        <div class="mission-question-text">${currentIdx + 1}. ${m.q}</div>
        
        <div class="mission-options">${optionsHtml}</div>
        
        <div class="mission-feedback" id="fb-${m.id}"></div>
      </div>
      
      <div class="mosbot-sidebar">
        <div class="sidebar-panel">
          <h3>👨‍🏫 Panel del Docente</h3>
          <ul class="sidebar-stats">
            <li><span>Estudiantes Registrados:</span> <strong>${Math.max(1, ranking.length)}</strong></li>
            <li><span>Misiones Realizadas:</span> <strong>${currentIdx}</strong></li>
            <li><span>Misiones Pendientes:</span> <strong>${MOSBOT_MISSIONS.length - currentIdx}</strong></li>
            <li><span>Fecha de Realización:</span> <strong>${new Date().toLocaleDateString('es-ES')}</strong></li>
          </ul>
          <div class="sidebar-badges-title">Insignias Ganadas:</div>
          <div class="sidebar-badges">${badgesHtml}</div>
        </div>
        
        <div class="sidebar-panel">
          <h3>🏆 Ranking General</h3>
          <ul class="ranking-list">${rankingHtml}</ul>
        </div>
      </div>
    </div>
  `;
}

function mosbotAnswer(missionId) {
  const m = MOSBOT_MISSIONS.find(x => x.id === missionId);
  if (!m || mosbotState.completed.includes(m.id)) return;
  const sel = document.querySelector(`input[name="q-${missionId}"]:checked`);
  if (!sel) return;
  
  const chosen = parseInt(sel.value);
  const fb = document.getElementById('fb-' + missionId);
  const optEl = document.getElementById('opt-' + missionId + '-' + chosen);
  
  if (chosen === m.ans) {
    mosbotState.xp += 100;
    mosbotState.completed.push(m.id);
    mosbotState.streak = (mosbotState.streak || 0) + 1;
    mosbotSaveState();
    mosbotPlaySound(true);
    
    fb.className = 'mission-feedback correct-fb';
    fb.innerHTML = '🎉 ¡Respuesta Correcta! <span style="color:#22c55e">+100 XP</span>';
    optEl.classList.add('correct');
    
    // Disable all options
    document.querySelectorAll(`input[name="q-${missionId}"]`).forEach(inp => {
      inp.disabled = true;
      inp.parentElement.classList.add('disabled');
    });
    
    mosbotCheckBadges();
    setTimeout(() => { 
      mosbotRenderDashboard(); 
    }, 1500);
  } else {
    mosbotState.streak = 0;
    mosbotState.xp = Math.max(0, mosbotState.xp - 20); // Penalty for wrong answer
    mosbotSaveState();
    mosbotPlaySound(false);
    
    fb.className = 'mission-feedback wrong-fb';
    fb.innerHTML = '❌ Incorrecto. <span style="color:#ef4444">-20 XP</span> ¡Intenta de nuevo!';
    optEl.classList.add('wrong', 'disabled');
    sel.disabled = true;
    sel.checked = false; // allow trying another
    
    const fill = document.getElementById('missionProgressFill');
    if (fill) {
      fill.classList.add('decreasing');
      setTimeout(() => fill.classList.remove('decreasing'), 600);
    }
    
    // update dashboard XP without full re-render
    document.getElementById('mosbotXPValue').innerHTML = '<span>' + mosbotState.xp + '</span> XP';
    const rank = mosbotGetRank();
    document.getElementById('mosbotRankBadge').innerHTML = rank.icon + ' ' + rank.name;
    document.getElementById('mosbotPlayerLabel').textContent = '👤 ' + mosbotState.name;
  }
}

function mosbotRenderBadges(area) {
  const html = MOSBOT_BADGES.map(b => {
    const unlocked = mosbotState.badges.includes(b.id);
    return `<div class="badge-card ${unlocked ? 'unlocked' : 'locked-badge'}">
      <span class="badge-icon ${unlocked ? 'badge-unlocking' : ''}">${b.icon}</span>
      <h4>${b.name}</h4><p>${b.desc}</p>
    </div>`;
  }).join('');
  area.innerHTML = '<div class="mosbot-badges-grid">' + html + '</div>';
}

function mosbotRenderStats(area) {
  const total = MOSBOT_MISSIONS.length;
  const done = mosbotState.completed.length;
  const excelDone = mosbotState.completed.filter(id => id.startsWith('ex')).length;
  const wordDone = mosbotState.completed.filter(id => id.startsWith('wd')).length;
  const pct = Math.round((done / total) * 100);
  area.innerHTML = `<div class="mosbot-stats-grid">
    <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-value">${mosbotState.xp}</div><div class="stat-label">XP Total</div></div>
    <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-value">${done}/${total}</div><div class="stat-label">Misiones Completadas</div></div>
    <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-value">${excelDone}/10</div><div class="stat-label">Misiones Excel</div></div>
    <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${wordDone}/10</div><div class="stat-label">Misiones Word</div></div>
    <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${mosbotGetRank().icon} ${mosbotGetRank().name}</div><div class="stat-label">Rango Actual</div></div>
    <div class="stat-card"><div class="stat-icon">🏅</div><div class="stat-value">${mosbotState.badges.length}/${MOSBOT_BADGES.length}</div><div class="stat-label">Insignias</div></div>
    <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-value">${pct}%</div><div class="stat-label">Progreso Total</div></div>
    <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-value">${mosbotState.streak || 0}</div><div class="stat-label">Racha Actual</div></div>
  </div>
  <div style="text-align:center"><button class="mosbot-reset-btn" onclick="mosbotReset()">🗑️ Reiniciar mi progreso</button></div>`;
}

function mosbotRenderRanking(area) {
  const ranking = JSON.parse(localStorage.getItem('mosbot_ranking') || '[]');
  if (!ranking.length) { area.innerHTML = '<p style="text-align:center;color:var(--muted);padding:3rem">No hay estudiantes en el ranking aún.</p>'; return; }
  const medals = ['🥇','🥈','🥉'];
  const rows = ranking.map((r, i) => {
    const rank = MOSBOT_RANKS.slice().reverse().find(rk => r.xp >= rk.minXP) || MOSBOT_RANKS[0];
    return `<tr><td><span class="rank-pos">${i + 1}</span> <span class="rank-medal">${medals[i] || ''}</span></td>
      <td>${r.name}</td><td>${rank.icon} ${rank.name}</td><td style="color:var(--gold);font-weight:700">${r.xp} XP</td>
      <td>${r.completed}/20</td></tr>`;
  }).join('');
  area.innerHTML = `<table class="mosbot-ranking-table"><thead><tr><th>#</th><th>Estudiante</th><th>Rango</th><th>XP</th><th>Misiones</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function mosbotRenderCert(area) {
  const allDone = mosbotState.completed.length >= MOSBOT_MISSIONS.length;
  if (!allDone) {
    area.innerHTML = `<div class="mosbot-cert-section"><div class="cert-locked"><div class="big">🔒</div>
      <p>Completa las <strong>20 misiones</strong> para desbloquear tu certificado digital.<br>
      Progreso: <strong>${mosbotState.completed.length}/20</strong></p></div></div>`;
    return;
  }
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  area.innerHTML = `<div class="mosbot-cert-section">
    <div class="cert-preview" id="certPreview">
      <div class="cert-logo">🎓</div>
      <h2>CERTIFICADO DE EXCELENCIA</h2>
      <h3>MOSBOT Academy Ultimate</h3>
      <p>Se certifica que</p>
      <div class="cert-name">${mosbotState.name}</div>
      <p>Ha completado satisfactoriamente las 20 misiones del programa<br>
      <strong>MOSBOT Academy Ultimate</strong> demostrando dominio en<br>
      Microsoft Excel y Microsoft Word.</p>
      <p>XP Total: <strong style="color:var(--gold)">${mosbotState.xp}</strong> · Rango: <strong style="color:var(--gold)">${mosbotGetRank().icon} ${mosbotGetRank().name}</strong></p>
      <p class="cert-date">📅 ${date}</p>
    </div>
    <button class="cert-download-btn" onclick="mosbotDownloadCert()">📥 Descargar Certificado PDF</button>
  </div>`;
}

function mosbotDownloadCert() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  script.onload = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const w = 297, h = 210;
    // Background
    doc.setFillColor(26, 16, 58); doc.rect(0, 0, w, h, 'F');
    // Border
    doc.setDrawColor(139, 92, 246); doc.setLineWidth(2); doc.rect(8, 8, w - 16, h - 16);
    doc.setDrawColor(139, 92, 246); doc.setLineWidth(0.5); doc.rect(12, 12, w - 24, h - 24);
    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(32); doc.setTextColor(251, 191, 36);
    doc.text('CERTIFICADO DE EXCELENCIA', w / 2, 45, { align: 'center' });
    // Subtitle
    doc.setFontSize(18); doc.setTextColor(167, 139, 250);
    doc.text('MOSBOT Academy Ultimate', w / 2, 58, { align: 'center' });
    // Body
    doc.setFontSize(14); doc.setTextColor(244, 244, 245);
    doc.text('Se certifica que', w / 2, 78, { align: 'center' });
    // Name
    doc.setFontSize(28); doc.setTextColor(167, 139, 250);
    doc.text(mosbotState.name, w / 2, 95, { align: 'center' });
    // Line
    doc.setDrawColor(139, 92, 246); doc.setLineWidth(1);
    const nameW = doc.getTextWidth(mosbotState.name);
    doc.line(w / 2 - nameW / 2, 98, w / 2 + nameW / 2, 98);
    // Desc
    doc.setFontSize(12); doc.setTextColor(200, 200, 210);
    doc.text('Ha completado satisfactoriamente las 20 misiones del programa', w / 2, 115, { align: 'center' });
    doc.text('MOSBOT Academy Ultimate demostrando dominio en', w / 2, 123, { align: 'center' });
    doc.text('Microsoft Excel y Microsoft Word.', w / 2, 131, { align: 'center' });
    // Stats
    doc.setFontSize(13); doc.setTextColor(139, 92, 246);
    doc.text('XP Total: ' + mosbotState.xp + '  ·  Rango: ' + mosbotGetRank().name, w / 2, 150, { align: 'center' });
    // Date
    const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(10); doc.setTextColor(161, 161, 170);
    doc.text(dateStr, w / 2, 170, { align: 'center' });
    // Footer
    doc.setFontSize(9); doc.text('Ricardo Zelaya - Portal MOS 2026', w / 2, 190, { align: 'center' });
    doc.save('Certificado_MOSBOT_' + mosbotState.name + '.pdf');
  };
  document.head.appendChild(script);
}

function mosbotReset() {
  if (!confirm('¿Seguro que deseas reiniciar TODO tu progreso? Esta acción no se puede deshacer.')) return;
  const name = mosbotState.name;
  localStorage.removeItem('mosbot_state_' + name);
  let ranking = JSON.parse(localStorage.getItem('mosbot_ranking') || '[]');
  ranking = ranking.filter(r => r.name !== name);
  localStorage.setItem('mosbot_ranking', JSON.stringify(ranking));
  mosbotState = { name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString() };
  mosbotSaveState();
  mosbotRenderDashboard();
}

function mosbotLogout() {
  localStorage.removeItem('mosbot_player');
  mosbotState = null;
  document.getElementById('mosbotDashboard').style.display = 'none';
  document.getElementById('mosbotWelcome').style.display = 'block';
  document.getElementById('mosbotNameInput').value = '';
}
