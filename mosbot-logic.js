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
      await window.db.collection("mosbot_students").doc(docId).set({
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
      const snap = await window.db.collection("mosbot_students").orderBy("xp", "desc").get();
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
        const doc = await window.db.collection("mosbot_students").doc(docId).get();
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
      const doc = await window.db.collection("mosbot_students").doc(docId).get();
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
  const streak = mosbotState.streak || 0;
  const streakColor = streak === 0 ? '#666' : streak < 3 ? '#f59e0b' : '#ff6b6b';
  
  document.getElementById('mosbotPlayerLabel').textContent = '👤 ' + mosbotState.name;
  document.getElementById('mosbotRankBadge').innerHTML = rank.icon + ' ' + rank.name;
  document.getElementById('mosbotXPValue').innerHTML = '<span>' + mosbotState.xp + '</span> XP';
  document.getElementById('mosbotProgressFill').style.width = pct + '%';
  document.getElementById('mosbotProgressLeft').textContent = rank.icon + ' ' + rank.name;
  document.getElementById('mosbotProgressRight').textContent = next ? (next.icon + ' ' + next.name + ' (' + next.minXP + ' XP)') : '🏆 ¡Máximo!';
  
  // Add streak indicator
  const streakEl = document.getElementById('mosbotStreakIndicator');
  if (streakEl) {
    streakEl.innerHTML = `<div style="color: ${streakColor}; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">🔥 ${streak}</div>`;
  }
  
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
    fb.innerHTML = `<div class="feedback-header">🎉 ¡Respuesta Correcta! <span style="color:#22c55e">+100 XP</span></div><div class="feedback-explanation">${m.exp || 'Excelente trabajo.'}</div>`;
    optEl.classList.add('correct');
    
    // Disable all options
    document.querySelectorAll(`input[name="q-${missionId}"]`).forEach(inp => {
      inp.disabled = true;
      inp.parentElement.classList.add('disabled');
    });
    
    mosbotCheckBadges();
    setTimeout(() => { 
      mosbotRenderDashboard(); 
    }, 2500);
  } else {
    mosbotState.streak = 0;
    mosbotState.xp = Math.max(0, mosbotState.xp - 20);
    mosbotSaveState();
    mosbotPlaySound(false);
    
    const correctOpt = m.opts[m.ans];
    fb.className = 'mission-feedback wrong-fb';
    fb.innerHTML = `<div class="feedback-header">❌ Incorrecto. <span style="color:#ef4444">-20 XP</span></div><div class="feedback-explanation">La respuesta correcta es: <strong>${correctOpt}</strong><br>${m.exp || 'Intenta de nuevo con otra opción.'}</div>`;
    optEl.classList.add('wrong', 'disabled');
    sel.disabled = true;
    sel.checked = false;
    
    const fill = document.getElementById('missionProgressFill');
    if (fill) {
      fill.classList.add('decreasing');
      setTimeout(() => fill.classList.remove('decreasing'), 600);
    }
    
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

function mosbotGetCertData() {
  const rank = mosbotGetRank();
  const certTypes = {
    0: { // Practicante
      title: 'CERTIFICADO DE INICIACIÓN',
      subtitle: 'MOSBOT Academy Básico',
      bgColor: [76, 175, 80], // Verde
      accentColor: [139, 195, 74],
      textColor: [255, 255, 255],
      borderColor: [139, 195, 74],
      logo: '🌱',
      description: 'Ha iniciado su jornada en el programa MOSBOT Academy demostrando compromiso con el aprendizaje de Microsoft Office.'
    },
    1: { // Aprendiz
      title: 'CERTIFICADO DE APRENDIZ',
      subtitle: 'MOSBOT Academy Aprendizaje',
      bgColor: [33, 150, 243], // Azul
      accentColor: [100, 181, 246],
      textColor: [255, 255, 255],
      borderColor: [100, 181, 246],
      logo: '📘',
      description: 'Ha completado satisfactoriamente el nivel de Aprendiz del programa MOSBOT Academy demostrando conocimientos en Microsoft Excel y Word.'
    },
    2: { // Técnico
      title: 'CERTIFICADO TÉCNICO',
      subtitle: 'MOSBOT Academy Técnico Digital',
      bgColor: [158, 158, 158], // Gris
      accentColor: [189, 189, 189],
      textColor: [255, 255, 255],
      borderColor: [189, 189, 189],
      logo: '💻',
      description: 'Ha alcanzado el nivel de Técnico Digital en MOSBOT Academy demostrando competencia avanzada en herramientas de Microsoft Office.'
    },
    3: { // Especialista
      title: 'CERTIFICADO DE ESPECIALISTA',
      subtitle: 'MOSBOT Academy Especialista',
      bgColor: [255, 193, 7], // Dorado
      accentColor: [255, 213, 79],
      textColor: [33, 33, 33],
      borderColor: [255, 193, 7],
      logo: '⭐',
      description: 'Ha conseguido el rango de Especialista en MOSBOT Academy demostrando dominio experto en Excel y Word.'
    },
    4: { // Experto
      title: 'CERTIFICADO DE EXPERTO',
      subtitle: 'MOSBOT Academy Experto Office',
      bgColor: [192, 192, 192], // Plateado
      accentColor: [224, 224, 224],
      textColor: [33, 33, 33],
      borderColor: [255, 215, 0],
      logo: '🏆',
      description: 'Ha obtenido el rango de Experto en MOSBOT Academy demostrando maestría profesional en todas las herramientas de Microsoft Office.'
    },
    5: { // Master
      title: 'CERTIFICADO DE EXCELENCIA',
      subtitle: 'MOSBOT Academy Master',
      bgColor: [26, 16, 58], // Morado oscuro
      accentColor: [139, 92, 246],
      textColor: [244, 244, 245],
      borderColor: [139, 92, 246],
      logo: '👑',
      description: 'Ha alcanzado el máximo rango de Office Master en MOSBOT Academy demostrando dominio completo y excelencia en Microsoft Excel, Word y todas las competencias del programa.'
    }
  };
  
  let rankIndex = 0;
  for (let i = 0; i < MOSBOT_RANKS.length; i++) {
    if (mosbotState.xp >= MOSBOT_RANKS[i].minXP) rankIndex = i;
  }
  return certTypes[rankIndex] || certTypes[5];
}

function mosbotRenderCert(area) {
  const minXP = MOSBOT_RANKS[0].minXP + 300; // 300 XP para desbloquear
  if (mosbotState.xp < minXP) {
    const nextRank = mosbotGetNextRank();
    const xpNeeded = nextRank ? nextRank.minXP - mosbotState.xp : 300 - mosbotState.xp;
    area.innerHTML = `<div class="mosbot-cert-section"><div class="cert-locked"><div class="big">🔒</div>
      <p>Alcanza <strong>300 XP</strong> para desbloquear tu certificado digital.<br>
      Progreso: <strong>${mosbotState.xp}/300 XP</strong> · Faltan <strong>${xpNeeded} XP</strong></p></div></div>`;
    return;
  }
  
  const certData = mosbotGetCertData();
  const rank = mosbotGetRank();
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const colorHex = `rgb(${certData.accentColor[0]}, ${certData.accentColor[1]}, ${certData.accentColor[2]})`;
  
  area.innerHTML = `<div class="mosbot-cert-section">
    <div class="cert-preview" id="certPreview" style="border-color: ${colorHex};">
      <div class="cert-logo">${certData.logo}</div>
      <h2 style="color: ${colorHex};">${certData.title}</h2>
      <h3 style="color: ${colorHex};">${certData.subtitle}</h3>
      <p>Se certifica que</p>
      <div class="cert-name">${mosbotState.name}</div>
      <p>${certData.description}</p>
      <p>XP Total: <strong style="color: ${colorHex}">${mosbotState.xp}</strong> · Rango: <strong style="color: ${colorHex}">${rank.icon} ${rank.name}</strong></p>
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
    const certData = mosbotGetCertData();
    const rank = mosbotGetRank();
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const w = 297, h = 210;
    
    // Background
    doc.setFillColor(certData.bgColor[0], certData.bgColor[1], certData.bgColor[2]);
    doc.rect(0, 0, w, h, 'F');
    
    // Border
    doc.setDrawColor(certData.borderColor[0], certData.borderColor[1], certData.borderColor[2]);
    doc.setLineWidth(2); doc.rect(8, 8, w - 16, h - 16);
    doc.setLineWidth(0.5); doc.rect(12, 12, w - 24, h - 24);
    
    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(32);
    doc.setTextColor(certData.accentColor[0], certData.accentColor[1], certData.accentColor[2]);
    doc.text(certData.title, w / 2, 45, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(18);
    doc.text(certData.subtitle, w / 2, 58, { align: 'center' });
    
    // Body
    doc.setFontSize(14); doc.setTextColor(certData.textColor[0], certData.textColor[1], certData.textColor[2]);
    doc.text('Se certifica que', w / 2, 78, { align: 'center' });
    
    // Name
    doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
    doc.setTextColor(certData.accentColor[0], certData.accentColor[1], certData.accentColor[2]);
    doc.text(mosbotState.name, w / 2, 95, { align: 'center' });
    
    // Line
    doc.setDrawColor(certData.borderColor[0], certData.borderColor[1], certData.borderColor[2]);
    doc.setLineWidth(1);
    const nameW = doc.getTextWidth(mosbotState.name);
    doc.line(w / 2 - nameW / 2, 98, w / 2 + nameW / 2, 98);
    
    // Desc
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.setTextColor(certData.textColor[0], certData.textColor[1], certData.textColor[2]);
    const descLines = doc.splitTextToSize(certData.description, 250);
    doc.text(descLines, w / 2, 115, { align: 'center' });
    
    // Stats
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.setTextColor(certData.accentColor[0], certData.accentColor[1], certData.accentColor[2]);
    doc.text('XP Total: ' + mosbotState.xp + '  ·  Rango: ' + rank.name, w / 2, 155, { align: 'center' });
    
    // Date
    const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.setTextColor(certData.textColor[0] * 0.7, certData.textColor[1] * 0.7, certData.textColor[2] * 0.7);
    doc.text(dateStr, w / 2, 175, { align: 'center' });
    
    // Footer
    doc.setFontSize(9);
    doc.text('Ricardo Zelaya - Portal MOS 2026', w / 2, 195, { align: 'center' });
    
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
