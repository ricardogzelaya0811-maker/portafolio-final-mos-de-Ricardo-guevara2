// MOSBOT Academy - Main Logic
let mosbotState = null;
let mosbotCurrentTab = 'missions';

function mosbotMissionCounts() {
  return {
    total: MOSBOT_MISSIONS.length,
    excel: MOSBOT_MISSIONS.filter(m => m.type === 'excel').length,
    word: MOSBOT_MISSIONS.filter(m => m.type === 'word').length
  };
}

function mosbotLoadState() {
  const name = localStorage.getItem('mosbot_player');
  if (!name) return null;
  const raw = localStorage.getItem('mosbot_state_' + name);
  if (!raw) return { name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString(), missionVersion: MOSBOT_DATA_VERSION };
  const parsed = JSON.parse(raw);
  if (parsed.missionVersion !== MOSBOT_DATA_VERSION) {
    return { name: parsed.name || name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString(), missionVersion: MOSBOT_DATA_VERSION };
  }
  return parsed;
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
        missionVersion: MOSBOT_DATA_VERSION,
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
    else if (b.req === 'allMissions') earned = MOSBOT_MISSIONS.every(m => mosbotState.completed.includes(m.id));
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
          if (d.missionVersion !== MOSBOT_DATA_VERSION) {
            mosbotState.xp = 0;
            mosbotState.completed = [];
            mosbotState.badges = [];
            mosbotState.streak = 0;
            mosbotState.missionVersion = MOSBOT_DATA_VERSION;
          }
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
  
  mosbotState = { name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString(), missionVersion: MOSBOT_DATA_VERSION };
  
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
        if (d.missionVersion !== MOSBOT_DATA_VERSION) {
          mosbotState.xp = 0;
          mosbotState.completed = [];
          mosbotState.badges = [];
          mosbotState.streak = 0;
          mosbotState.missionVersion = MOSBOT_DATA_VERSION;
        }
      }
    } catch(e) {}
  } else {
    const existing = localStorage.getItem('mosbot_state_' + name);
    if (existing) {
      const parsed = JSON.parse(existing);
      mosbotState = parsed.missionVersion === MOSBOT_DATA_VERSION
        ? parsed
        : { name: parsed.name || name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString(), missionVersion: MOSBOT_DATA_VERSION };
    }
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
  const streakColor = streak === 0 ? '#a1a1aa' : streak < 3 ? '#f59e0b' : '#ff6b6b';
  const streakMsg = streak === 0 ? 'Empieza tu racha' : streak < 3 ? 'Buen ritmo' : 'Racha encendida';
  
  document.getElementById('mosbotPlayerLabel').textContent = '👤 ' + mosbotState.name;
  document.getElementById('mosbotRankBadge').innerHTML = rank.icon + ' ' + rank.name;
  document.getElementById('mosbotXPValue').innerHTML = '<span>' + mosbotState.xp + '</span> XP';
  document.getElementById('mosbotProgressFill').style.width = pct + '%';
  document.getElementById('mosbotProgressLeft').textContent = rank.icon + ' ' + rank.name;
  document.getElementById('mosbotProgressRight').textContent = next ? (next.icon + ' ' + next.name + ' (' + next.minXP + ' XP)') : '🏆 ¡Máximo!';
  
  // Add streak indicator
  const streakEl = document.getElementById('mosbotStreakIndicator');
  if (streakEl) {
    streakEl.style.borderColor = streakColor;
    streakEl.style.background = streak === 0 ? 'rgba(255,255,255,.05)' : 'rgba(255,107,107,.15)';
    streakEl.innerHTML = `<div class="streak-fire" style="color:${streakColor}">🔥</div><div class="streak-copy"><strong style="color:${streakColor}">${streak} en racha</strong><span>${streakMsg}</span></div>`;
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
  const blockName = m.type === 'word' ? '📄 BLOQUE: WORD - TABLAS' : '📊 BLOQUE: EXCEL';
  
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
        <h2 class="mission-title">${m.title}</h2>
        <p class="mission-desc">${m.desc}</p>
        
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

function mosbotShowAnswerScreen(correct, mission, chosen, xpChange) {
  let overlay = document.getElementById('mosbotAnswerOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mosbotAnswerOverlay';
    overlay.className = 'mosbot-answer-overlay';
    document.body.appendChild(overlay);
  }
  const correctOpt = mission.opts[mission.ans];
  const chosenOpt = mission.opts[chosen];
  const tip = mission.tip || (correct ? 'Sigue leyendo con calma cada opción antes de responder.' : 'Revisa la explicación y vuelve a intentar sin prisa.');
  overlay.className = 'mosbot-answer-overlay show ' + (correct ? 'is-correct' : 'is-wrong');
  overlay.innerHTML = `
    <div class="answer-card">
      <div class="answer-burst">${correct ? '🎉' : '💡'}</div>
      <p class="answer-kicker">${mission.title}</p>
      <h2>${correct ? '¡Respuesta correcta!' : 'Casi. Revisa este detalle.'}</h2>
      <div class="answer-xp ${correct ? 'good' : 'bad'}">${xpChange > 0 ? '+' : ''}${xpChange} XP</div>
      <p class="answer-line"><strong>Tu respuesta:</strong> ${chosenOpt}</p>
      <p class="answer-line"><strong>Respuesta correcta:</strong> ${correctOpt}</p>
      <p class="answer-exp">${mission.exp || 'Buen avance en la misión.'}</p>
      <div class="answer-tip"><strong>Tip:</strong> ${tip}</div>
      <button class="answer-next-btn" onclick="mosbotCloseAnswerScreen(${correct ? 'true' : 'false'})">${correct ? 'Continuar' : 'Intentar otra opción'}</button>
    </div>
  `;
}

function mosbotCloseAnswerScreen(advance) {
  const overlay = document.getElementById('mosbotAnswerOverlay');
  if (overlay) overlay.classList.remove('show');
  if (advance) mosbotRenderDashboard();
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
    mosbotShowAnswerScreen(true, m, chosen, 100);
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
    const streakEl = document.getElementById('mosbotStreakIndicator');
    if (streakEl) {
      streakEl.style.borderColor = '#a1a1aa';
      streakEl.style.background = 'rgba(255,255,255,.05)';
      streakEl.innerHTML = '<div class="streak-fire" style="color:#a1a1aa">🔥</div><div class="streak-copy"><strong style="color:#a1a1aa">0 en racha</strong><span>Vuelve a levantarla</span></div>';
    }
    mosbotShowAnswerScreen(false, m, chosen, -20);
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
  const counts = mosbotMissionCounts();
  const done = mosbotState.completed.length;
  const excelDone = mosbotState.completed.filter(id => id.startsWith('ex')).length;
  const wordDone = mosbotState.completed.filter(id => id.startsWith('wd')).length;
  const pct = Math.round((done / total) * 100);
  area.innerHTML = `<div class="mosbot-stats-grid">
    <div class="stat-card"><div class="stat-icon">⚡</div><div class="stat-value">${mosbotState.xp}</div><div class="stat-label">XP Total</div></div>
    <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-value">${done}/${total}</div><div class="stat-label">Misiones Completadas</div></div>
    <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-value">${excelDone}/${counts.excel}</div><div class="stat-label">Misiones Excel</div></div>
    <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-value">${wordDone}/${counts.word}</div><div class="stat-label">Misiones Word Tablas</div></div>
    <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value">${mosbotGetRank().icon} ${mosbotGetRank().name}</div><div class="stat-label">Rango Actual</div></div>
    <div class="stat-card"><div class="stat-icon">🏅</div><div class="stat-value">${mosbotState.badges.length}/${MOSBOT_BADGES.length}</div><div class="stat-label">Insignias</div></div>
    <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-value">${pct}%</div><div class="stat-label">Progreso Total</div></div>
    <div class="stat-card"><div class="stat-icon">🔥</div><div class="stat-value">${mosbotState.streak || 0}</div><div class="stat-label">Racha Actual</div></div>
  </div>
  <div style="text-align:center"><button class="mosbot-reset-btn" onclick="mosbotReset()">🗑️ Reiniciar mi progreso</button></div>`;
}

function mosbotRenderRanking(area) {
  const ranking = JSON.parse(localStorage.getItem('mosbot_ranking') || '[]');
  const total = MOSBOT_MISSIONS.length;
  if (!ranking.length) { area.innerHTML = '<p style="text-align:center;color:var(--muted);padding:3rem">No hay estudiantes en el ranking aún.</p>'; return; }
  const medals = ['🥇','🥈','🥉'];
  const rows = ranking.map((r, i) => {
    const rank = MOSBOT_RANKS.slice().reverse().find(rk => r.xp >= rk.minXP) || MOSBOT_RANKS[0];
    return `<tr><td><span class="rank-pos">${i + 1}</span> <span class="rank-medal">${medals[i] || ''}</span></td>
      <td>${r.name}</td><td>${rank.icon} ${rank.name}</td><td style="color:var(--gold);font-weight:700">${r.xp} XP</td>
      <td>${r.completed}/${total}</td></tr>`;
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

function mosbotGetVerificationCode() {
  const raw = `${mosbotState.name}-${mosbotState.xp}-${mosbotState.startDate}`;
  const safe = encodeURIComponent(raw);
  return 'MOS-' + btoa(safe).replace(/[^A-Z0-9]/gi, '').slice(0, 10).toUpperCase();
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
  const badgeNames = MOSBOT_BADGES.filter(b => mosbotState.badges.includes(b.id)).map(b => b.name);
  const completedTopics = MOSBOT_MISSIONS
    .filter(m => mosbotState.completed.includes(m.id))
    .map(m => m.type === 'word' ? 'Word: ' + m.title : 'Excel: ' + m.title);
  const verifyCode = mosbotGetVerificationCode();
  const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  const colorHex = `rgb(${certData.accentColor[0]}, ${certData.accentColor[1]}, ${certData.accentColor[2]})`;
  const badgePreview = badgeNames.length ? badgeNames.slice(0, 4).join(' • ') : 'Aún sin insignias';
  const topicPreview = completedTopics.length ? completedTopics.slice(0, 5).join(' • ') + (completedTopics.length > 5 ? ' • ...' : '') : 'En progreso';
  
  area.innerHTML = `<div class="mosbot-cert-section">
    <div class="cert-preview" id="certPreview" style="--cert-accent:${colorHex};">
      <div class="cert-corner cert-corner-tl"></div>
      <div class="cert-corner cert-corner-tr"></div>
      <div class="cert-corner cert-corner-bl"></div>
      <div class="cert-corner cert-corner-br"></div>
      <div class="cert-watermark">MOS</div>
      <div class="cert-ribbon">MOSBOT Academy Ultimate</div>
      <div class="cert-inner">
        <div class="cert-topline">
          <span>Portal MOS 2026</span>
          <span>Código ${verifyCode}</span>
        </div>
        <div class="cert-seal" aria-hidden="true"><span>${certData.logo}</span></div>
        <p class="cert-kicker">Certificado digital de logro</p>
        <h2>${certData.title}</h2>
        <h3>${certData.subtitle}</h3>
        <p class="cert-awarded">Se otorga a</p>
        <div class="cert-name">${mosbotState.name}</div>
        <p class="cert-desc">${certData.description}</p>
        <div class="cert-metrics">
          <div><strong>${mosbotState.xp}</strong><span>XP total</span></div>
          <div><strong>${rank.icon} ${rank.name}</strong><span>Rango alcanzado</span></div>
          <div><strong>${mosbotState.completed.length}/${MOSBOT_MISSIONS.length}</strong><span>Misiones</span></div>
        </div>
        <div class="cert-detail-grid">
          <div><strong>Insignias ganadas</strong><span>${badgePreview}</span></div>
          <div><strong>Temas completados</strong><span>${topicPreview}</span></div>
        </div>
        <div class="cert-signatures">
          <div><span>Ricardo Zelaya</span><small>Instructor MOS</small></div>
          <div><span>${date}</span><small>Fecha de emisión</small></div>
        </div>
      </div>
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
    const badgeNames = MOSBOT_BADGES.filter(b => mosbotState.badges.includes(b.id)).map(b => b.name);
    const completedTopics = MOSBOT_MISSIONS
      .filter(m => mosbotState.completed.includes(m.id))
      .map(m => m.type === 'word' ? 'Word: ' + m.title : 'Excel: ' + m.title);
    const verifyCode = mosbotGetVerificationCode();
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const w = 297, h = 210;
    const gold = [192, 147, 57];
    const goldDark = [123, 85, 32];
    const navy = [23, 32, 51];
    const ink = [28, 36, 54];
    const muted = [92, 101, 120];
    const paper = [248, 241, 223];
    
    // Premium paper background
    doc.setFillColor(paper[0], paper[1], paper[2]);
    doc.rect(0, 0, w, h, 'F');
    doc.setFillColor(255, 251, 240);
    doc.rect(10, 10, w - 20, h - 20, 'F');
    
    // Decorative frame
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(3);
    doc.rect(8, 8, w - 16, h - 16);
    doc.setLineWidth(0.6);
    doc.rect(14, 14, w - 28, h - 28);
    doc.setDrawColor(goldDark[0], goldDark[1], goldDark[2]);
    doc.setLineWidth(0.35);
    doc.rect(18, 18, w - 36, h - 36);
    
    // Corner accents
    doc.setLineWidth(1.2);
    [[21, 21, 36, 21, 21, 36], [276, 21, 261, 21, 276, 36], [21, 189, 36, 189, 21, 174], [276, 189, 261, 189, 276, 174]].forEach(c => {
      doc.line(c[0], c[1], c[2], c[3]);
      doc.line(c[0], c[1], c[4], c[5]);
    });
    
    // Header ribbon
    doc.setFillColor(navy[0], navy[1], navy[2]);
    doc.roundedRect(88, 14, 121, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(248, 231, 173);
    doc.text('MOSBOT ACADEMY ULTIMATE', w / 2, 23, { align: 'center' });
    
    // Top metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(109, 90, 53);
    doc.text('PORTAL MOS 2026', 24, 32);
    doc.text('CODIGO ' + verifyCode, w - 24, 32, { align: 'right' });
    
    // Watermark
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(72);
    doc.setTextColor(235, 220, 184);
    doc.text('MOS', w / 2, 120, { align: 'center' });
    
    // Seal
    doc.setFillColor(211, 168, 79);
    doc.circle(w / 2, 47, 15, 'F');
    doc.setFillColor(255, 246, 215);
    doc.circle(w / 2, 47, 11, 'F');
    doc.setDrawColor(goldDark[0], goldDark[1], goldDark[2]);
    doc.setLineWidth(0.8);
    doc.circle(w / 2, 47, 15, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text('MOS', w / 2, 50, { align: 'center' });
    
    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(30);
    doc.setTextColor(ink[0], ink[1], ink[2]);
    doc.text(certData.title, w / 2, 72, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(goldDark[0], goldDark[1], goldDark[2]);
    doc.text(certData.subtitle.toUpperCase(), w / 2, 82, { align: 'center' });
    
    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(muted[0], muted[1], muted[2]);
    doc.text('Se otorga a', w / 2, 96, { align: 'center' });
    
    // Name
    doc.setFont('times', 'bold'); doc.setFontSize(32);
    doc.setTextColor(16, 24, 40);
    doc.text(mosbotState.name, w / 2, 111, { align: 'center' });
    
    // Line
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(1);
    const nameW = doc.getTextWidth(mosbotState.name);
    doc.line(Math.max(74, w / 2 - nameW / 2), 116, Math.min(223, w / 2 + nameW / 2), 116);
    
    // Desc
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.setTextColor(77, 86, 104);
    const descLines = doc.splitTextToSize(certData.description, 210);
    doc.text(descLines, w / 2, 128, { align: 'center' });
    
    // Metrics
    const metricY = 148;
    const metricW = 58;
    const metricX = [58, 119.5, 181];
    const metricValues = [String(mosbotState.xp), rank.name, mosbotState.completed.length + '/' + MOSBOT_MISSIONS.length];
    const metricLabels = ['XP TOTAL', 'RANGO ALCANZADO', 'MISIONES'];
    metricX.forEach((x, i) => {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, metricY, metricW, 18, 2, 2, 'F');
      doc.setDrawColor(214, 176, 94);
      doc.roundedRect(x, metricY, metricW, 18, 2, 2, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(i === 1 ? 8 : 12);
      doc.setTextColor(23, 32, 51);
      doc.text(metricValues[i], x + metricW / 2, metricY + 7, { align: 'center' });
      doc.setFontSize(6.5);
      doc.setTextColor(123, 107, 75);
      doc.text(metricLabels[i], x + metricW / 2, metricY + 14, { align: 'center' });
    });
    
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(63, 71, 88);
    const badgeText = 'Insignias: ' + (badgeNames.length ? badgeNames.join(', ') : 'Aún sin insignias');
    const topicText = 'Temas completados: ' + (completedTopics.length ? completedTopics.slice(0, 8).join(', ') + (completedTopics.length > 8 ? '...' : '') : 'En progreso');
    doc.text(doc.splitTextToSize(badgeText, 230), w / 2, 176, { align: 'center' });
    doc.text(doc.splitTextToSize(topicText, 230), w / 2, 184, { align: 'center' });
    
    // Signatures and date
    const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setDrawColor(23, 32, 51);
    doc.setLineWidth(0.35);
    doc.line(62, 193, 122, 193);
    doc.line(175, 193, 235, 193);
    doc.setFont('times', 'bold'); doc.setFontSize(11);
    doc.setTextColor(23, 32, 51);
    doc.text('Ricardo Zelaya', 92, 198, { align: 'center' });
    doc.text(dateStr, 205, 198, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
    doc.setTextColor(118, 106, 85);
    doc.text('INSTRUCTOR MOS', 92, 202, { align: 'center' });
    doc.text('FECHA DE EMISION', 205, 202, { align: 'center' });
    
    // Footer
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(109, 90, 53);
    doc.text('Verificacion: ' + verifyCode + '  |  Ricardo Zelaya - Portal MOS 2026', w / 2, 207, { align: 'center' });
    
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
  mosbotState = { name, xp: 0, completed: [], streak: 0, badges: [], startDate: new Date().toISOString(), missionVersion: MOSBOT_DATA_VERSION };
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
