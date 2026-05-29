"use strict";
/* ══════════════════════════════════════════════════════════════════════════
   HAWKINS RESCUE — COMPLETE CINEMATIC GAME ENGINE v2.0
   ══════════════════════════════════════════════════════════════════════════
   Built for Stranger Things fan-game project.
   Full replacement for the <script> tag in hawkins-rescue.html
   ══════════════════════════════════════════════════════════════════════════ */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §1  AUDIO ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function getACtx() { if (!actx) actx = new AudioCtx(); return actx; }

function playTone(freq, type = 'sine', vol = 0.15, dur = 0.3, attack = 0.01) {
  try {
    const ctx = getACtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + attack);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur + 0.05);
  } catch (e) {}
}

function playNoise(dur = 0.3, vol = 0.08, lowpass = 800) {
  try {
    const ctx = getACtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource();
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass;
    const gn = ctx.createGain(); gn.gain.value = vol;
    s.buffer = buf; s.connect(f); f.connect(gn); gn.connect(ctx.destination);
    s.start();
  } catch (e) {}
}

const SFX = {
  step()        { playNoise(0.06, 0.04, 300); },
  door()        { playTone(80,'square',0.2,0.8); setTimeout(()=>playTone(60,'square',0.1,0.4),300); },
  collect()     { playTone(880,'sine',0.2,0.2); setTimeout(()=>playTone(1100,'sine',0.15,0.15),100); },
  hurt()        { playNoise(0.3,0.25,400); playTone(80,'sawtooth',0.3,0.3); },
  stun()        { for(let i=0;i<5;i++) setTimeout(()=>playTone(200+i*80,'square',0.1,0.2),i*60); },
  demoScream()  { playTone(120,'sawtooth',0.3,0.6); playNoise(0.4,0.2,600); },
  levelUp()     { [440,550,660,880].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.2,0.4),i*120)); },
  heartbeat()   { playTone(60,'sine',0.4,0.15); setTimeout(()=>playTone(50,'sine',0.3,0.1),250); },
  thunder()     { playNoise(1.5,0.3,200); },
  radio()       { playNoise(0.2,0.1,2000); },
  psychicBlast() {
    // Eleven's signature ability sound — low rumble + high shriek
    playNoise(0.5, 0.4, 200);
    playTone(40, 'sawtooth', 0.5, 0.6);
    setTimeout(() => playTone(880, 'sine', 0.3, 0.4), 80);
    setTimeout(() => playTone(1200, 'sine', 0.2, 0.3), 180);
  },
  slingshotPing() {
    playTone(1400, 'triangle', 0.25, 0.15);
    setTimeout(() => playNoise(0.1, 0.1, 500), 100);
  },
  skateDash()   { playTone(300, 'square', 0.15, 0.2); playNoise(0.15, 0.06, 2000); },
  batSwing()    { playNoise(0.2, 0.3, 1000); playTone(150, 'sawtooth', 0.25, 0.3); },
  compassPing() { playTone(660, 'sine', 0.2, 0.5); setTimeout(() => playTone(780, 'sine', 0.15, 0.4), 200); },
  vecnaLaugh()  {
    playTone(55, 'sawtooth', 0.35, 1.2);
    playNoise(0.5, 0.2, 300);
    setTimeout(() => playTone(45, 'square', 0.2, 0.8), 400);
  },
  vecnaShoot()  { playTone(200, 'sawtooth', 0.2, 0.25); playNoise(0.2, 0.12, 600); },
  ambientNode: null,
  startAmbient(level) {
    try {
      const ctx = getACtx();
      if (SFX.ambientNode) { try { SFX.ambientNode.disconnect(); } catch (e) {} }
      const freqSets = [[60,90,120],[55,80],[70,100,140],[40,60],[50,80,110]];
      const lvlFreqs = freqSets[Math.min(level-1,4)];
      const master = ctx.createGain(); master.gain.value = 0.045;
      master.connect(ctx.destination);
      lvlFreqs.forEach(f => {
        const o = ctx.createOscillator();
        const g = ctx.createGain(); g.gain.value = 0.3 + Math.random() * 0.2;
        o.type = 'sine'; o.frequency.value = f;
        o.connect(g); g.connect(master); o.start();
      });
      SFX.ambientNode = master;
    } catch (e) {}
  }
};

// ── Background Music ──
const bgTheme = document.getElementById('bgTheme');
let musicMuted = false;
function startTheme() {
  if (!bgTheme) return;
  bgTheme.volume = 0.45;
  bgTheme.play().catch(() => {});
}
const muteBtn = document.getElementById('muteBtn');
if (muteBtn) {
  muteBtn.addEventListener('click', () => {
    musicMuted = !musicMuted;
    if (bgTheme) bgTheme.muted = musicMuted;
    muteBtn.textContent = musicMuted ? '🔇 MUSIC' : '🔊 MUSIC';
    muteBtn.style.color = musicMuted ? '#333' : '#555';
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §2  CHARACTER DEFINITIONS  (6 characters including Eleven)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARS = {
  eleven: {
    name: 'ELEVEN', ability: 'PSYCHIC BLAST', desc: 'Telekinetically hurls all\nnearby enemies outward',
    color: '#ff4488', cooldown: 5000, hp: 90,
    sprite: 'eleven.png', glowColor: 'rgba(255,68,136,0.8)',
    use(gs) {
      SFX.psychicBlast();
      // White radial flash at player position
      triggerPsychicFlash(gs.px + 36, gs.py + 45);
      triggerShake(14, 600);
      // Push ALL enemies away violently
      gs.enemies.forEach(e => {
        const dx = e.x - (gs.px + 36);
        const dy = e.y - (gs.py + 45);
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        e.knockVx = (dx / d) * 14;
        e.knockVy = (dy / d) * 14;
        e.knockTimer = 400;
        e.hp -= 1;
        spawnParticle(e.x, e.y, 'explosion');
      });
      // Also push Vecna
      if (gs.bossHp > 0 && vecnaSprite.style.display !== 'none') {
        const dx = vecnaX - (gs.px + 36);
        const dy = vecnaY - (gs.py + 45);
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        vecnaKnockVx = (dx / d) * 8;
        vecnaKnockVy = (dy / d) * 8;
        vecnaKnockTimer = 600;
        gs.bossHp = Math.max(0, gs.bossHp - 3);
        bossFill.style.width = (gs.bossHp / gs.maxBossHp * 100) + '%';
      }
      showMsg('🧠 ELEVEN — PSYCHIC BLAST! EVERYTHING FLIES!');
    }
  },
  dustin: {
    name: 'DUSTIN', ability: 'COMPASS PULSE', desc: 'Highlights the nearest\nclue for 2 seconds',
    color: '#4fc3f7', cooldown: 4000, hp: 100,
    sprite: 'dustin.png', glowColor: 'rgba(79,195,247,0.7)',
    use(gs) {
      SFX.compassPing();
      // Find nearest un-collected clue and pulse it
      let nearest = null, nearDist = Infinity;
      clueEls.forEach(c => {
        if (c._collected) return;
        const cx = parseFloat(c.style.left) + 50;
        const cy = parseFloat(c.style.top) + 10;
        const d = dist(gs.px + 36, gs.py + 45, cx, cy);
        if (d < nearDist) { nearDist = d; nearest = c; }
      });
      if (nearest) {
        nearest.classList.add('revealed');
        nearest.style.textShadow = '0 0 20px #fff, 0 0 40px #4fc3f7';
        setTimeout(() => {
          nearest.style.textShadow = '';
          nearest.classList.remove('revealed');
        }, 2000);
        showMsg('📡 DUSTIN — COMPASS PULSE! Nearest clue lit up!');
      } else {
        showMsg('📡 DUSTIN — No clues remaining!');
      }
    }
  },
  lucas: {
    name: 'LUCAS', ability: 'SLINGSHOT', desc: 'Stuns the nearest\nenemy for 3 seconds',
    color: '#8d6e63', cooldown: 3500, hp: 95,
    sprite: 'lucas.png', glowColor: 'rgba(141,110,99,0.7)',
    use(gs) {
      SFX.slingshotPing();
      let nearest = null, nearDist = Infinity;
      gs.enemies.forEach(e => {
        const d = dist(gs.px + 36, gs.py + 45, e.x, e.y);
        if (d < nearDist) { nearDist = d; nearest = e; }
      });
      if (nearest) {
        nearest.stunTimer = 3000;
        spawnParticle(nearest.x, nearest.y, 'spore');
        triggerShake(3, 200);
        showMsg('🪨 LUCAS — SLINGSHOT! Direct hit, stunned 3s!');
      } else {
        showMsg('🪨 LUCAS — No targets in range!');
      }
    }
  },
  mike: {
    name: 'MIKE', ability: 'WALKIE-TALKIE', desc: 'Calls backup, slowing\nall enemies temporarily',
    color: '#66bb6a', cooldown: 4500, hp: 85,
    sprite: 'mike.png', glowColor: 'rgba(102,187,106,0.7)',
    use(gs) {
      SFX.radio();
      gs.enemySlowTimer = 3000;
      showMsg('📡 MIKE — BACKUP CALLED! Enemies slowed!');
    }
  },
  nancy: {
    name: 'NANCY', ability: 'SHOTGUN BLAST', desc: 'Destroys all nearby\nenemies within 120px',
    color: '#ef9a9a', cooldown: 6000, hp: 90,
    sprite: 'nancy.png', glowColor: 'rgba(239,154,154,0.7)',
    use(gs) {
      SFX.demoScream(); SFX.stun();
      const toRemove = [];
      gs.enemies.forEach((e, i) => {
        if (dist(gs.px + 36, gs.py + 45, e.x, e.y) < 120) {
          toRemove.push(i);
          spawnParticle(e.x, e.y, 'explosion');
          if (e.el) e.el.remove();
          if (e.shadow) e.shadow.remove();
        }
      });
      toRemove.reverse().forEach(i => gs.enemies.splice(i, 1));
      triggerShake(6, 300);
      showMsg(`🔫 NANCY — SHOTGUN! ${toRemove.length} enemies down!`);
    }
  },
  steve: {
    name: 'STEVE', ability: 'NAIl BAT SWEEP', desc: 'Physical knockback in\nthe direction he faces',
    color: '#ffcc02', cooldown: 3000, hp: 110,
    sprite: 'steve.png', glowColor: 'rgba(255,204,2,0.7)',
    use(gs) {
      SFX.batSwing();
      // knockback enemies in the direction Steve is facing
      const faceDir = gs.facingLeft ? -1 : 1;
      const toRemove = [];
      gs.enemies.forEach((e, i) => {
        const dx = e.x - (gs.px + 36);
        const dy = e.y - (gs.py + 45);
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        // Only hit enemies in the facing half-plane (within 90px)
        if (d < 90 && Math.sign(dx) === faceDir) {
          e.knockVx = (dx / d) * 12;
          e.knockVy = (dy / d) * 12;
          e.knockTimer = 350;
          e.hp -= 1;
          spawnParticle(e.x, e.y, 'blood');
          if (e.hp <= 0) { toRemove.push(i); if (e.el) e.el.remove(); if (e.shadow) e.shadow.remove(); }
        }
      });
      toRemove.reverse().forEach(i => gs.enemies.splice(i, 1));
      triggerShake(5, 250);
      // Bat swing visual arc
      triggerBatArc(gs.px + 36, gs.py + 45, faceDir);
      showMsg('🏏 STEVE — NAIL BAT! ENEMIES SENT FLYING!');
    }
  },
  max: {
    name: 'MAX', ability: 'SKATE BOOST', desc: 'Double movement speed\nfor 4 seconds',
    color: '#ff7043', cooldown: 5500, hp: 85,
    sprite: 'max.png', glowColor: 'rgba(255,112,67,0.8)',
    use(gs) {
      SFX.skateDash();
      gs.skateBoostTimer = 4000;
      showMsg('🛹 MAX — SKATE BOOST! Speed x2 for 4 seconds!');
    }
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §3  LEVEL DEFINITIONS  (5 fully painted levels)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LEVELS = [
  // ── Level 1 — Will's House ──────────────────────────────────────────────
  {
    name: "WILL'S HOUSE", level: 1,
    desc: 'Dark wood-panelled interior.\nChristmas lights pulse on the wall.\nSomething has been here.',
    bg: '#08050c', ambient: 'indoor',
    paintEnv(ctx, w, h, t) {
      // ── floor boards ──
      ctx.fillStyle = '#0c0810'; ctx.fillRect(0, 0, w, h);
      const grd = ctx.createLinearGradient(0, h * 0.55, 0, h);
      grd.addColorStop(0, '#110c18'); grd.addColorStop(1, '#0a0812');
      ctx.fillStyle = grd; ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.strokeStyle = '#140f1a'; ctx.lineWidth = 1.5;
      for (let i = 0; i < w; i += 72) {
        ctx.beginPath(); ctx.moveTo(i, h * 0.55); ctx.lineTo(i + 30, h); ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, h * 0.55 + i * 0.45); ctx.lineTo(w, h * 0.55 + i * 0.45); ctx.stroke();
      }
      // ── wood-panel walls ──
      const wallGrd = ctx.createLinearGradient(0, 0, 0, h * 0.58);
      wallGrd.addColorStop(0, '#1a1020'); wallGrd.addColorStop(1, '#120c1a');
      ctx.fillStyle = wallGrd; ctx.fillRect(0, 0, w, h * 0.58);
      ctx.strokeStyle = '#1e1428'; ctx.lineWidth = 2;
      for (let i = 0; i < w; i += 48) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h * 0.58); ctx.stroke();
      }
      // baseboard
      ctx.fillStyle = '#0f0b16'; ctx.fillRect(0, h * 0.56, w, 6);
      // ── christmas lights string ──
      ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(w, 34); ctx.stroke();
      const lightColors = ['#ff2222','#00cc44','#2266ff','#ffdd00','#ff44cc','#00ccff'];
      for (let i = 0; i < w; i += 38) {
        const lc = lightColors[Math.floor(i / 38) % lightColors.length];
        const pct = (i / 38 * 1.7) % 1;
        const on = Math.sin(t * 2.5 + i * 0.9) > 0.1;
        // cord droop
        ctx.strokeStyle = '#111'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(i, 34); ctx.quadraticCurveTo(i + 19, 44, i + 38, 34); ctx.stroke();
        // bulb
        ctx.fillStyle = on ? lc : '#1a1020';
        ctx.beginPath(); ctx.ellipse(i + 19, 46, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
        if (on) {
          ctx.shadowColor = lc; ctx.shadowBlur = 18;
          ctx.fillStyle = lc + '55';
          ctx.beginPath(); ctx.arc(i + 19, 46, 16, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      // ── family photo frames ──
      [[50,90],[w-90,90],[80,160],[w-100,165]].forEach(([fx, fy]) => {
        ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
        ctx.strokeRect(fx, fy, 40, 30);
        ctx.fillStyle = '#1a0d0a'; ctx.fillRect(fx + 1, fy + 1, 38, 28);
        // blurry silhouette family
        ctx.fillStyle = '#2a1a10'; ctx.fillRect(fx + 4, fy + 8, 12, 18);
        ctx.fillStyle = '#1f1208'; ctx.fillRect(fx + 20, fy + 11, 10, 15);
        ctx.fillStyle = '#251508'; ctx.fillRect(fx + 12, fy + 14, 8, 12);
      });
      // ── overturned furniture ──
      ctx.fillStyle = '#0e0b18';
      ctx.fillRect(w * 0.62, h * 0.58, 130, 70); // couch silhouette
      ctx.fillRect(w * 0.18, h * 0.62, 80, 50);  // table
      ctx.save(); ctx.translate(w * 0.42, h * 0.7); ctx.rotate(0.55);
      ctx.fillStyle = '#0c0916'; ctx.fillRect(0, 0, 28, 42); ctx.restore();
      // ── subtle TV static glow ──
      const tvGrd = ctx.createRadialGradient(w * 0.85, h * 0.35, 0, w * 0.85, h * 0.35, 60);
      tvGrd.addColorStop(0, `rgba(150,170,200,${0.06 + Math.sin(t * 30) * 0.03})`);
      tvGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tvGrd; ctx.fillRect(0, 0, w, h);
    },
    objective: "Find clues about Will's disappearance",
    clueTexts: ['MOM I AM ALIVE','IN THE WALLS','THEY ARE COMING','DON\'T TURN OFF THE LIGHTS','RUN'],
    enemyCount: 2, bossHp: 0, collectCount: 3
  },

  // ── Level 2 — Hawkins Woods ──────────────────────────────────────────────
  {
    name: 'HAWKINS WOODS', level: 2,
    desc: 'Dense shifting fog fills the forest.\nMoving tree silhouettes hide creatures.\nFollow the sounds to navigate.',
    bg: '#040a03', ambient: 'outdoor',
    paintEnv(ctx, w, h, t) {
      // ── night sky gradient ──
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, '#020604'); sky.addColorStop(1, '#060d04');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      // ── stars ──
      for (let i = 0; i < 90; i++) {
        const sx = (i * 137.508) % w, sy = (i * 91.3) % (h * 0.55);
        const blink = Math.sin(t * 1.5 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${0.15 + blink * 0.5})`;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }
      // ── moon with halo ──
      const moonX = w * 0.83, moonY = h * 0.1;
      ctx.fillStyle = 'rgba(210,210,190,0.06)';
      ctx.beginPath(); ctx.arc(moonX, moonY, 52, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(210,210,190,0.12)';
      ctx.beginPath(); ctx.arc(moonX, moonY, 34, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(220,215,200,0.82)';
      ctx.beginPath(); ctx.arc(moonX, moonY, 22, 0, Math.PI * 2); ctx.fill();
      // ── ground ──
      const grnd = ctx.createLinearGradient(0, h * 0.62, 0, h);
      grnd.addColorStop(0, '#050d04'); grnd.addColorStop(1, '#030803');
      ctx.fillStyle = grnd; ctx.fillRect(0, h * 0.62, w, h * 0.38);
      // ── tree silhouettes (swaying) ──
      for (let i = 0; i < 18; i++) {
        const tx = (i * (w / 18) + 10) % w;
        const baseY = h * 0.6 + (i % 4) * 14;
        const treeH = 130 + (i % 5) * 28;
        const sw = Math.sin(t * 0.4 + i * 0.8) * 4; // sway
        const wid = 18 + (i % 3) * 8;
        ctx.fillStyle = '#050d03';
        // trunk
        ctx.fillRect(tx - 4 + sw * 0.3, baseY, 8, 28);
        // layered canopy triangles
        for (let layer = 0; layer < 3; layer++) {
          const ly = baseY - treeH * 0.35 * (layer + 1) * 0.6;
          const lw = wid * (1.3 - layer * 0.25);
          ctx.beginPath();
          ctx.moveTo(tx + sw, ly);
          ctx.lineTo(tx - lw + sw * 0.7, baseY - treeH * 0.35 * layer * 0.6);
          ctx.lineTo(tx + lw + sw * 0.7, baseY - treeH * 0.35 * layer * 0.6);
          ctx.closePath(); ctx.fill();
        }
      }
      // ── fireflies ──
      for (let i = 0; i < 35; i++) {
        const fx = (i * (w / 35) + Math.sin(t * 1.2 + i) * 25) % w;
        const fy = h * 0.3 + (i % 12) * (h * 0.025) + Math.sin(t * 2.5 + i * 0.9) * 12;
        const fo = Math.sin(t * 3.5 + i * 1.1) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(220,255,140,${fo * 0.55})`;
        ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      // ── path light ──
      const pathGrd = ctx.createRadialGradient(w * 0.5, h * 0.75, 0, w * 0.5, h * 0.75, 180);
      pathGrd.addColorStop(0, 'rgba(40,80,40,0.08)');
      pathGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pathGrd; ctx.fillRect(0, 0, w, h);
    },
    objective: 'Navigate through the woods to the lab',
    clueTexts: ['THE GATE IS OPEN','FOLLOW THE LIGHTS','THEY HUNT BY HEAT','STAY ON THE PATH','IT\'S GETTING CLOSER'],
    enemyCount: 4, bossHp: 0, collectCount: 4
  },

  // ── Level 3 — Starcourt Mall ──────────────────────────────────────────────
  {
    name: 'STARCOURT MALL', level: 3,
    desc: 'Broken flickering neon.\nAbandoned stores. Pink and blue light.\nSomething lurks between the shops.',
    bg: '#060a10', ambient: 'mall',
    paintEnv(ctx, w, h, t) {
      ctx.fillStyle = '#060a10'; ctx.fillRect(0, 0, w, h);
      // ── tiled floor with reflections ──
      const floorY = h * 0.6;
      ctx.fillStyle = '#080c14'; ctx.fillRect(0, floorY, w, h - floorY);
      ctx.strokeStyle = '#0d1220'; ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 80) {
        ctx.beginPath(); ctx.moveTo(i, floorY); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let j = floorY; j < h; j += 60) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
      }
      // ── neon sign panels ──
      const signs = [
        { x: w * 0.05, y: 50, label: 'SCOOPS AHOY', color1: '#ff1aff', color2: '#ff66ff' },
        { x: w * 0.38, y: 40, label: 'HAWKINS JEWEL', color1: '#1affff', color2: '#66ffff' },
        { x: w * 0.68, y: 55, label: 'PALACE ARCADE', color1: '#ff8800', color2: '#ffcc44' },
      ];
      signs.forEach(s => {
        const flicker = Math.sin(t * 6 + s.x) > -0.4;
        const grd = ctx.createLinearGradient(s.x, s.y, s.x + 180, s.y);
        grd.addColorStop(0, flicker ? s.color1 : '#111');
        grd.addColorStop(1, flicker ? s.color2 : '#0a0a0a');
        ctx.font = '900 18px "Bebas Neue", serif';
        if (flicker) {
          ctx.shadowColor = s.color1; ctx.shadowBlur = 22;
          ctx.fillStyle = grd; ctx.fillText(s.label, s.x, s.y + 20);
          // reflection on floor
          ctx.save();
          ctx.globalAlpha = 0.12;
          ctx.scale(1, -0.25);
          ctx.fillStyle = s.color1;
          ctx.fillText(s.label, s.x, -(floorY + 10));
          ctx.restore();
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#1a1a1a'; ctx.fillText(s.label, s.x, s.y + 20);
        }
        ctx.shadowBlur = 0;
      });
      // ── store shutters ──
      [[0.02, 0.12, 0.28],[0.33, 0.12, 0.20],[0.57, 0.12, 0.24],[0.84, 0.12, 0.14]].forEach(([rx, ry, rw]) => {
        ctx.fillStyle = '#07090f'; ctx.fillRect(rx * w, ry * h, rw * w, h * 0.48);
        ctx.strokeStyle = '#0d1018'; ctx.lineWidth = 2;
        for (let gy = ry * h; gy < (ry + 0.48) * h; gy += 16) {
          ctx.beginPath(); ctx.moveTo(rx * w, gy); ctx.lineTo((rx + rw) * w, gy); ctx.stroke();
        }
      });
      // ── pink / blue neon floor glow ──
      const neonPink = ctx.createRadialGradient(w * 0.25, floorY, 0, w * 0.25, floorY, 200);
      neonPink.addColorStop(0, `rgba(255,0,200,${0.06 + Math.sin(t * 1.8) * 0.02})`);
      neonPink.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = neonPink; ctx.fillRect(0, 0, w, h);
      const neonBlue = ctx.createRadialGradient(w * 0.75, floorY, 0, w * 0.75, floorY, 200);
      neonBlue.addColorStop(0, `rgba(0,180,255,${0.06 + Math.cos(t * 2.2) * 0.02})`);
      neonBlue.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = neonBlue; ctx.fillRect(0, 0, w, h);
      // ── overturned mall carts ──
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(w * 0.44, h * 0.5, 60, 40);
      ctx.save(); ctx.translate(w * 0.7, h * 0.58); ctx.rotate(0.4);
      ctx.fillRect(0, 0, 50, 35); ctx.restore();
      // ── flickering overhead lights ──
      for (let lx = 60; lx < w; lx += 160) {
        const lon = Math.sin(t * 8 + lx) > 0.5;
        const lGrd = ctx.createRadialGradient(lx, 0, 0, lx, 0, lon ? 200 : 50);
        lGrd.addColorStop(0, `rgba(200,220,255,${lon ? 0.07 : 0.01})`);
        lGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = lGrd; ctx.fillRect(0, 0, w, h);
      }
    },
    objective: 'Escape Starcourt before the gate consumes it',
    clueTexts: ['THE MIND FLAYER IS HERE','RUSSIAN BASE BELOW US','SCOOPS TROOPS UNITE','TRUST YOUR FRIENDS','THE KEY IS BELOW'],
    enemyCount: 5, bossHp: 15, collectCount: 5
  },

  // ── Level 4 — Hawkins Lab ──────────────────────────────────────────────
  {
    name: 'HAWKINS NATIONAL LAB', level: 4,
    desc: 'Sterile blue tiles with creeping vines.\nBroken experiments. Brenner\'s notes.\nThe gate tears the walls apart.',
    bg: '#030810', ambient: 'lab',
    paintEnv(ctx, w, h, t) {
      ctx.fillStyle = '#030810'; ctx.fillRect(0, 0, w, h);
      // ── sterile tile floor ──
      ctx.strokeStyle = '#060d1a'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for (let y = 0; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      // ── creeping vines from edges ──
      ctx.strokeStyle = '#091a06'; ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const startX = i < 6 ? 0 : w;
        const startY = (i % 6) * (h / 6) + Math.sin(t * 0.2 + i) * 10;
        ctx.beginPath(); ctx.moveTo(startX, startY);
        let vx = startX, vy = startY;
        for (let s = 0; s < 12; s++) {
          vx += (startX === 0 ? 1 : -1) * (18 + Math.random() * 15);
          vy += Math.sin(t * 0.3 + i + s * 0.5) * 12;
          ctx.lineTo(vx, vy);
        }
        ctx.stroke();
        // ── vine tendrils ──
        ctx.lineWidth = 1; ctx.strokeStyle = '#0a2008';
        for (let bud = 0; bud < 3; bud++) {
          const budX = startX + (startX === 0 ? 1 : -1) * (bud + 1) * 22;
          const budY = startY + Math.sin(t * 0.3 + i + bud) * 10;
          ctx.beginPath(); ctx.moveTo(budX, budY); ctx.lineTo(budX + (Math.random() - 0.5) * 20, budY - 15); ctx.stroke();
        }
        ctx.lineWidth = 3; ctx.strokeStyle = '#091a06';
      }
      // ── control panel walls ──
      ctx.fillStyle = '#040a16';
      ctx.fillRect(0, h * 0.25, 36, h * 0.5);
      ctx.fillRect(w - 36, h * 0.25, 36, h * 0.5);
      // ── blinking panel indicators ──
      for (let i = 0; i < 9; i++) {
        const on = Math.sin(t * 2 + i * 1.4) > 0;
        ctx.fillStyle = on ? '#ff2222' : '#2a0505'; ctx.fillRect(6, h * 0.27 + i * 20, 10, 8);
        ctx.fillStyle = on ? '#22ff44' : '#052a0a'; ctx.fillRect(20, h * 0.27 + i * 20, 10, 8);
        ctx.fillStyle = (Math.sin(t * 1.5 + i) > 0.5) ? '#2244ff' : '#050a2a';
        ctx.fillRect(6, h * 0.27 + i * 20 + 1, 10, 4);
      }
      // ── warning red strobe ──
      const strobe = Math.sin(t * 1.8) > 0.85 ? 0.12 : 0;
      if (strobe > 0) { ctx.fillStyle = `rgba(255,0,0,${strobe})`; ctx.fillRect(0, 0, w, h); }
      // ── gate glow center (portal hint) ──
      const gateGrd = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, 100);
      gateGrd.addColorStop(0, `rgba(60,0,120,${0.15 + Math.sin(t) * 0.06})`);
      gateGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gateGrd; ctx.fillRect(0, 0, w, h);
      // ── broken glass shards ──
      ctx.strokeStyle = 'rgba(80,100,255,0.15)'; ctx.lineWidth = 1;
      [[w*0.3,h*0.2],[w*0.65,h*0.45],[w*0.5,h*0.72]].forEach(([gx, gy]) => {
        for (let s = 0; s < 8; s++) {
          const a = (s / 8) * Math.PI * 2;
          const r = 20 + Math.random() * 20;
          ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(a)*r, gy + Math.sin(a)*r); ctx.stroke();
        }
      });
    },
    objective: 'Find Brenner\'s files and escape the lab',
    clueTexts: ['EXPERIMENT 011','GATE COORDINATES: 41.7°N','WARNING: LEVEL 6 QUARANTINE','BRENNER\'S NOTES — FOLDER C','IT FEEDS ON FEAR AND TRAUMA'],
    enemyCount: 6, bossHp: 20, collectCount: 5
  },

  // ── Level 5 — The Upside Down (Final Battle) ──────────────────────────────
  {
    name: 'THE UPSIDE DOWN', level: 5,
    desc: 'Heavy red tint. Floating spores.\nVines pulse with life. VECNA awaits.\nClose the gate — or die trying.',
    bg: '#090003', ambient: 'battle',
    paintEnv(ctx, w, h, t) {
      // ── deep red atmosphere ──
      const atm = ctx.createLinearGradient(0, 0, 0, h);
      atm.addColorStop(0, '#0a0003'); atm.addColorStop(0.5, '#0e0004'); atm.addColorStop(1, '#07000a');
      ctx.fillStyle = atm; ctx.fillRect(0, 0, w, h);
      // ── cracked ground lava cracks ──
      const cracks = [[0.15,0.85,0.35,0.65],[0.5,0.92,0.65,0.72],[0.28,0.55,0.5,0.8],[0.72,0.62,0.92,0.88],[0.08,0.7,0.28,0.52]];
      cracks.forEach(([x1,y1,x2,y2]) => {
        ctx.strokeStyle = '#1c0000'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1*w,y1*h); ctx.lineTo(x2*w,y2*h); ctx.stroke();
        // lava glow inside crack
        const lg = ctx.createLinearGradient(x1*w,y1*h,x2*w,y2*h);
        lg.addColorStop(0, `rgba(255,60,0,${0.18 + Math.sin(t*2+x1*10)*0.08})`);
        lg.addColorStop(1, 'rgba(255,20,0,0.04)');
        ctx.strokeStyle = lg; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x1*w,y1*h); ctx.lineTo(x2*w,y2*h); ctx.stroke();
      });
      // ── pulsing vines ──
      ctx.lineWidth = 5;
      for (let i = 0; i < 10; i++) {
        const vine_r = `rgba(${40+i*3},${8+i},0,0.8)`;
        ctx.strokeStyle = vine_r;
        const vx0 = (i % 2 === 0 ? -10 : w + 10);
        ctx.beginPath(); ctx.moveTo(vx0, i * (h / 10));
        for (let s = 0; s < 14; s++) {
          const px = vx0 + (i % 2 === 0 ? 1 : -1) * s * (w / 14);
          const py = i * (h / 10) + Math.sin(t * 0.5 + i + s * 0.4) * 22;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // ── organic wall mass ──
      ctx.fillStyle = '#0d0003';
      ctx.fillRect(0, 0, 50, h); ctx.fillRect(w - 50, 0, 50, h);
      // ── red lightning ──
      if (Math.sin(t * 8) > 0.88) {
        ctx.strokeStyle = `rgba(255,30,0,${0.7 + Math.random()*0.3})`; ctx.lineWidth = 2;
        let lx = Math.random() * w * 0.8 + w * 0.1, ly = 0;
        ctx.beginPath(); ctx.moveTo(lx, ly);
        while (ly < h) { ly += 25; lx += (Math.random() - 0.5) * 70; ctx.lineTo(lx, ly); }
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,80,0,0.15)'; ctx.lineWidth = 12; ctx.stroke();
        triggerShake(2, 80); // subtle shake with lightning
      }
      // ── destroyed pillars ──
      [[0.12,0.55],[0.88,0.45],[0.14,0.82],[0.86,0.75]].forEach(([px,py]) => {
        ctx.fillStyle = '#100000';
        ctx.fillRect(px*w - 18, 0, 36, py*h);
        ctx.strokeStyle = '#1e0500'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px*w, py*h * 0.3); ctx.lineTo(px*w + 10, py*h * 0.7); ctx.stroke();
      });
      // ── portal glow ──
      const portalR = 120 + Math.sin(t) * 20;
      const portalGrd = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, portalR);
      portalGrd.addColorStop(0, `rgba(180,0,0,${0.18 + Math.sin(t*1.5)*0.06})`);
      portalGrd.addColorStop(0.5, `rgba(100,0,50,${0.08})`);
      portalGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = portalGrd; ctx.fillRect(0, 0, w, h);
      // ── heavy red atmosphere overlay ──
      ctx.fillStyle = `rgba(80,0,0,${0.08 + Math.sin(t * 0.8) * 0.03})`;
      ctx.fillRect(0, 0, w, h);
    },
    objective: 'Defeat VECNA and close the gate!',
    clueTexts: ['VECNA WAS HENRY CREEL','HE FEEDS ON TRAUMA','PLAY KATE BUSH — RUNNING UP THAT HILL','LOVE IS HIS WEAKNESS','CLOSE THE GATE — NOW'],
    enemyCount: 8, bossHp: 30, collectCount: 5
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §4  DOM REFERENCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cursor        = document.getElementById('cursor');
const arena         = document.getElementById('arena');
const envCanvas     = document.getElementById('envCanvas');
const fogCanvas     = document.getElementById('fogCanvas');
const ptCanvas      = document.getElementById('particleCanvas');
const flashCanvas   = document.getElementById('flashlightCanvas');
const playerSprite  = document.getElementById('playerSprite');
const vecnaSprite   = document.getElementById('vecnaSprite');
const playerShadowEl= document.getElementById('playerShadowEl');

const eCtx  = envCanvas.getContext('2d');
const fCtx  = fogCanvas.getContext('2d');
const ptCtx = ptCanvas.getContext('2d');
const flCtx = flashCanvas.getContext('2d');

const msgBox      = document.getElementById('msgBox');
const hScore      = document.getElementById('hScore');
const hLevel      = document.getElementById('hLevel');
const healthFill  = document.getElementById('healthFill');
const torchFill   = document.getElementById('torchFill');
const powerFill   = document.getElementById('powerFill');
const hClues      = document.getElementById('hClues');
const hObj        = document.getElementById('hObj');
const bossBar     = document.getElementById('bossBar');
const bossFill    = document.getElementById('bossFill');
const curseOverlay= document.getElementById('curseOverlay');
const dmgFlash    = document.getElementById('dmgFlash');
const heartbeat   = document.getElementById('heartbeat');
const abilityLabel= document.getElementById('abilityLabel');
const loadFill    = document.getElementById('loadFill');
const loadMsg     = document.getElementById('loadMsg');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §5  GAME STATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let gs           = {};
let keys         = {};
let mouseX       = 0, mouseY = 0;
let arenaMouseX  = 0, arenaMouseY = 0;
let highScore    = 0;
let selectedChar = 'eleven';
let rafId        = null;
let lastTs       = 0;
let animFrame    = 0;
let wallEls      = [];
let clueEls      = [];

// Vecna state
let vecnaX = 0, vecnaY = 0;
let vecnaKnockVx = 0, vecnaKnockVy = 0, vecnaKnockTimer = 0;
let vecnaProjectiles = []; // { x, y, vx, vy, el }

// Floating effect elements
let batArcEl    = null;
let psychicFlashEl = null;
let sporeEls    = []; // level-5 ambient spores on canvas (handled in paintEnv)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §6  UTILITIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dist   = (ax, ay, bx, by) => Math.sqrt((ax-bx)**2 + (ay-by)**2);
const aw     = () => arena.clientWidth;
const ah     = () => arena.clientHeight;

let msgTimerId = null;
function showMsg(text, dur = 2200) {
  msgBox.textContent = text;
  msgBox.classList.add('show');
  clearTimeout(msgTimerId);
  msgTimerId = setTimeout(() => msgBox.classList.remove('show'), dur);
}

// ── Screen Shake ──
let shakeTimer = 0, shakeIntensity = 0;
function triggerShake(intensity = 6, dur = 400) {
  shakeIntensity = Math.max(shakeIntensity, intensity);
  shakeTimer = Math.max(shakeTimer, dur);
}
function applyShake(dt) {
  if (shakeTimer > 0) {
    shakeTimer -= dt;
    const dx = (Math.random() - 0.5) * shakeIntensity;
    const dy = (Math.random() - 0.5) * shakeIntensity;
    arena.style.transform = `translate(${dx}px,${dy}px)`;
  } else {
    shakeIntensity = 0;
    arena.style.transform = '';
  }
}

// ── Psychic Flash (Eleven) ──
function triggerPsychicFlash(cx, cy) {
  if (psychicFlashEl) psychicFlashEl.remove();
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;z-index:300;pointer-events:none;border-radius:50%;
    left:${cx - 160}px;top:${cy - 160}px;width:320px;height:320px;
    background:radial-gradient(circle,rgba(255,255,255,0.95) 0%,rgba(200,160,255,0.7) 40%,rgba(255,60,160,0.1) 80%,transparent 100%);
    animation:psychicPop 0.6s ease-out forwards;
  `;
  if (!document.getElementById('psychicKeyframe')) {
    const st = document.createElement('style');
    st.id = 'psychicKeyframe';
    st.textContent = `@keyframes psychicPop{0%{transform:scale(0);opacity:1}60%{transform:scale(1.2);opacity:0.9}100%{transform:scale(2);opacity:0}}`;
    document.head.appendChild(st);
  }
  arena.appendChild(el);
  psychicFlashEl = el;
  setTimeout(() => { if (el.parentNode) el.remove(); }, 700);
}

// ── Bat Arc (Steve) ──
function triggerBatArc(cx, cy, dir) {
  if (batArcEl) batArcEl.remove();
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;z-index:290;pointer-events:none;
    left:${cx + dir * 10 - 50}px;top:${cy - 40}px;width:100px;height:80px;
    border:3px solid rgba(255,204,2,0.9);
    border-radius:${dir > 0 ? '0 60px 60px 0' : '60px 0 0 60px'};
    border-left:${dir > 0 ? 'none' : '3px solid rgba(255,204,2,0.9)'};
    border-right:${dir > 0 ? '3px solid rgba(255,204,2,0.9)' : 'none'};
    box-shadow:0 0 12px rgba(255,204,2,0.7),0 0 24px rgba(255,120,0,0.4);
    animation:batArcPop 0.25s ease-out forwards;
  `;
  if (!document.getElementById('batKeyframe')) {
    const st = document.createElement('style');
    st.id = 'batKeyframe';
    st.textContent = `@keyframes batArcPop{0%{transform:scale(0.3) rotate(-30deg);opacity:1}60%{transform:scale(1.1);opacity:0.8}100%{transform:scale(1.3);opacity:0}}`;
    document.head.appendChild(st);
  }
  arena.appendChild(el);
  batArcEl = el;
  setTimeout(() => { if (el.parentNode) el.remove(); }, 280);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §7  CANVAS RESIZE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function resizeCanvases() {
  [envCanvas, fogCanvas, ptCanvas, flashCanvas].forEach(c => {
    c.width  = aw();
    c.height = ah();
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §8  CHARACTER GRID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildCharGrid() {
  const grid = document.getElementById('charGrid');
  grid.innerHTML = '';
  Object.entries(CHARS).forEach(([key, ch]) => {
    const card = document.createElement('div');
    card.className = 'char-card' + (key === selectedChar ? ' active' : '');
    card.dataset.char = key;

    const av = document.createElement('div');
    av.className = 'char-avatar';

    const img = document.createElement('img');
    img.src = ch.sprite;
    img.alt = ch.name;
    img.draggable = false;
    av.appendChild(img);

    const nm  = document.createElement('span'); nm.className  = 'char-name';  nm.textContent  = ch.name;
    const pw  = document.createElement('span'); pw.className  = 'char-power'; pw.textContent  = ch.ability;
    const dsc = document.createElement('div');  dsc.className = 'char-desc';  dsc.textContent = ch.desc.replace('\n',' ');

    card.appendChild(av); card.appendChild(nm); card.appendChild(pw); card.appendChild(dsc);

    card.addEventListener('click', () => {
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectedChar = key;
    });
    // 3D tilt
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = (e.clientY - r.top  - r.height / 2) / 9;
      const ry = -(e.clientX - r.left - r.width  / 2) / 9;
      card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      img.style.transform  = `scale(1.1) translateZ(10px) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      img.style.transform  = '';
    });
    grid.appendChild(card);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §9  WALL LAYOUTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WALL_LAYOUTS = [
  // Level 1 — Will's house rooms
  [{rx:0,ry:0,rw:1,rh:0.02},{rx:0,ry:0,rw:0.02,rh:1},{rx:0.98,ry:0,rw:0.02,rh:1},
   {rx:0.3,ry:0.1,rw:0.02,rh:0.5},{rx:0.6,ry:0.3,rw:0.02,rh:0.6},
   {rx:0.3,ry:0.6,rw:0.3,rh:0.02},{rx:0.1,ry:0.35,rw:0.2,rh:0.02},
   {rx:0.65,ry:0.1,rw:0.35,rh:0.02},{rx:0.65,ry:0.1,rw:0.02,rh:0.25}],
  // Level 2 — woods (tree trunks as walls)
  [{rx:0,ry:0,rw:1,rh:0.02},
   {rx:0.15,ry:0.2,rw:0.06,rh:0.4},{rx:0.35,ry:0.1,rw:0.05,rh:0.35},
   {rx:0.55,ry:0.3,rw:0.06,rh:0.45},{rx:0.75,ry:0.15,rw:0.05,rh:0.3},
   {rx:0.85,ry:0.5,rw:0.06,rh:0.4},{rx:0.1,ry:0.65,rw:0.25,rh:0.03},
   {rx:0.45,ry:0.75,rw:0.2,rh:0.03}],
  // Level 3 — mall corridors
  [{rx:0,ry:0,rw:0.02,rh:1},{rx:0.98,ry:0,rw:0.02,rh:1},
   {rx:0.2,ry:0.1,rw:0.6,rh:0.03},{rx:0.2,ry:0.1,rw:0.03,rh:0.45},
   {rx:0.77,ry:0.1,rw:0.03,rh:0.45},{rx:0.35,ry:0.58,rw:0.3,rh:0.03},
   {rx:0.1,ry:0.42,rw:0.12,rh:0.03},{rx:0.78,ry:0.42,rw:0.12,rh:0.03}],
  // Level 4 — lab corridors
  [{rx:0,ry:0,rw:0.04,rh:1},{rx:0.96,ry:0,rw:0.04,rh:1},
   {rx:0.15,ry:0.3,rw:0.2,rh:0.05},{rx:0.65,ry:0.2,rw:0.2,rh:0.05},
   {rx:0.3,ry:0.55,rw:0.14,rh:0.05},{rx:0.56,ry:0.7,rw:0.14,rh:0.05},
   {rx:0.2,ry:0.8,rw:0.6,rh:0.05}],
  // Level 5 — open battle arena
  [{rx:0,ry:0,rw:0.03,rh:1},{rx:0.97,ry:0,rw:0.03,rh:1},
   {rx:0.08,ry:0.28,rw:0.07,rh:0.05},{rx:0.85,ry:0.23,rw:0.07,rh:0.05},
   {rx:0.08,ry:0.63,rw:0.07,rh:0.05},{rx:0.85,ry:0.66,rw:0.07,rh:0.05}]
];

function buildWalls(levelIdx) {
  wallEls.forEach(w => w.remove()); wallEls = [];
  const layout = WALL_LAYOUTS[levelIdx] || WALL_LAYOUTS[0];
  const W = aw(), H = ah(), lvl = levelIdx + 1;
  layout.forEach(def => {
    const el = document.createElement('div');
    el.className = `wall lvl${lvl}`;
    el.style.left   = Math.round(def.rx * W) + 'px';
    el.style.top    = Math.round(def.ry * H) + 'px';
    el.style.width  = Math.round(def.rw * W) + 'px';
    el.style.height = Math.round(def.rh * H) + 'px';
    arena.appendChild(el); wallEls.push(el);
  });
}

function hitsWall(nx, ny, sw, sh) {
  for (const w of wallEls) {
    const wx = parseFloat(w.style.left),  wy = parseFloat(w.style.top);
    const ww = parseFloat(w.style.width), wh = parseFloat(w.style.height);
    if (nx < wx + ww && nx + sw > wx && ny < wy + wh && ny + sh > wy) return true;
  }
  return false;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §10  CLUE SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function spawnClues(levelDef) {
  clueEls.forEach(c => c.remove()); clueEls = [];
  (levelDef.clueTexts || ['???']).forEach(txt => {
    const el = document.createElement('div');
    el.className = 'clue-obj';
    el.textContent = txt;
    el.style.left       = Math.round(90  + Math.random() * (aw() - 200)) + 'px';
    el.style.top        = Math.round(70  + Math.random() * (ah() - 140)) + 'px';
    el.style.transform  = `rotate(${(Math.random() - 0.5) * 14}deg)`;
    el._collected = false;
    el._text      = txt;
    arena.appendChild(el);
    clueEls.push(el);
  });
}

function revealClues() {
  clueEls.forEach(c => { if (!c._collected) c.classList.add('revealed'); });
  setTimeout(() => { clueEls.forEach(c => { if (!c._collected) c.classList.remove('revealed'); }); }, 3000);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §11  PARTICLE SYSTEM  (on #particleCanvas)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const particles = [];
function spawnParticle(x, y, type = 'dust') {
  const count = (type === 'explosion') ? 18 : (type === 'spore') ? 10 : 3;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (type === 'explosion') ? 2 + Math.random() * 5
                : (type === 'spore')     ? 0.5 + Math.random() * 1.5
                :                          0.4 + Math.random() * 1;
    const color = (type === 'blood')     ? `hsl(0,80%,${20 + Math.random() * 20}%)`
                : (type === 'explosion') ? `hsl(${20 + Math.random() * 40},90%,${40 + Math.random() * 30}%)`
                : (type === 'spore')     ? `rgba(${200+Math.random()*55},${160+Math.random()*40},255,${0.6+Math.random()*0.4})`
                :                          `rgba(100,80,60,${0.3 + Math.random() * 0.4})`;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'spore' ? 1.5 : 0),
      life: 1, maxLife: 0.4 + Math.random() * 1.2,
      color, size: 1.5 + Math.random() * 3.5, type
    });
  }
}

function updateParticles(dt) {
  ptCtx.clearRect(0, 0, ptCanvas.width, ptCanvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.04;
    p.life -= dt / 1000 / p.maxLife;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ptCtx.globalAlpha = p.life;
    ptCtx.fillStyle   = p.color;
    ptCtx.beginPath(); ptCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ptCtx.fill();
  }
  ptCtx.globalAlpha = 1;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §12  ENEMY SYSTEM  (demogorgon.png sprites with full AI)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function spawnEnemy() {
  if (!gs.running || gs.enemies.length >= 10) return;
  const side = Math.floor(Math.random() * 4);
  let x, y;
  if      (side === 0) { x = Math.random() * aw(); y = -10; }
  else if (side === 1) { x = aw() + 10; y = Math.random() * ah(); }
  else if (side === 2) { x = Math.random() * aw(); y = ah() + 10; }
  else                 { x = -10; y = Math.random() * ah(); }

  const speed = 0.65 + Math.random() * 0.45 + gs.levelIdx * 0.12;

  const img = document.createElement('img');
  img.src       = 'demogorgon.png';
  img.className = 'enemy-sprite';
  img.alt       = 'demogorgon';
  img.draggable = false;
  img.style.left = (x - 36) + 'px';
  img.style.top  = (y - 43) + 'px';
  arena.appendChild(img);

  const shd = document.createElement('div');
  shd.className  = 'enemy-shadow';
  shd.style.left = (x - 29) + 'px';
  shd.style.top  = (y + 38) + 'px';
  arena.appendChild(shd);

  gs.enemies.push({
    x, y, speed, hp: 2,
    el: img, shadow: shd,
    phase: Math.random() * 100,
    stunTimer: 0,
    knockVx: 0, knockVy: 0, knockTimer: 0
  });

  setTimeout(() => {
    if (!gs.running) return;
    SFX.demoScream();
    gs.torchFlicker = true;
    setTimeout(() => { gs.torchFlicker = false; }, 900);
  }, 250);
  triggerShake(3, 200);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §13  VECNA BOSS SYSTEM  (vecna.png sprite + projectiles)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function initVecna() {
  const ld = LEVELS[gs.levelIdx];
  if (ld.bossHp <= 0) { vecnaSprite.style.display = 'none'; bossBar.style.display = 'none'; return; }
  vecnaX = aw() * 0.78; vecnaY = 60;
  vecnaSprite.style.display = 'block';
  vecnaSprite.style.left    = vecnaX + 'px';
  vecnaSprite.style.top     = vecnaY + 'px';
  vecnaSprite.classList.remove('stunned');
  bossBar.style.display = 'flex';
  gs.bossHp    = ld.bossHp;
  gs.maxBossHp = ld.bossHp;
  bossFill.style.width = '100%';
  vecnaKnockVx = 0; vecnaKnockVy = 0; vecnaKnockTimer = 0;
  vecnaProjectiles = [];
  gs.vecnaShootTimer = 2500;
  SFX.vecnaLaugh();
  showMsg('👁️ VECNA HAS AWAKENED — Survive!', 3000);
}

function spawnVecnaProjectile() {
  if (vecnaSprite.style.display === 'none') return;
  const dx = (gs.px + 36) - (vecnaX + 50);
  const dy = (gs.py + 45) - (vecnaY + 60);
  const d  = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 3.5 + gs.levelIdx * 0.3;
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;z-index:120;width:18px;height:18px;border-radius:50%;
    background:radial-gradient(circle,#ff44ff,#660088);
    box-shadow:0 0 12px #aa00ff,0 0 24px #660066;
    pointer-events:none;
    left:${vecnaX + 41}px;top:${vecnaY + 51}px;
  `;
  arena.appendChild(el);
  vecnaProjectiles.push({ x: vecnaX+50, y: vecnaY+60, vx: (dx/d)*speed, vy: (dy/d)*speed, el });
  SFX.vecnaShoot();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §14  COLLECTIBLE SYSTEM  (🔦 flashlight tokens)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function spawnCollectible() {
  if (!gs.running) return;
  const el = document.createElement('div');
  el.className = 'collectible-el';
  el.style.cssText = `
    position:absolute;z-index:85;pointer-events:none;font-size:24px;
    animation:bob 1.2s ease-in-out infinite,popIn 0.35s forwards;
  `;
  el.textContent = '🔦';
  const cx = 70 + Math.random() * (aw() - 140);
  const cy = 50 + Math.random() * (ah() - 100);
  el.style.left = cx + 'px';
  el.style.top  = cy + 'px';
  arena.appendChild(el);
  gs.collectibles.push({ el, x: cx, y: cy });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §15  FLASHLIGHT RENDERER  (destination-out punch-through darkness)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderFlashlight(px, py, mx, my, torchPct, flicker) {
  const w = flashCanvas.width, h = flashCanvas.height;
  flCtx.clearRect(0, 0, w, h);

  // Full-screen darkness
  flCtx.fillStyle = 'rgba(0,0,0,0.88)';
  flCtx.fillRect(0, 0, w, h);

  const angle  = Math.atan2(my - py, mx - px);
  const spread = 0.58;
  const reach  = (280 + torchPct * 60) * (flicker ? (0.55 + Math.random() * 0.65) : 1);

  // ── punch the cone through darkness ──
  flCtx.save();
  flCtx.globalCompositeOperation = 'destination-out';

  const coneGrad = flCtx.createRadialGradient(px, py, 0, px, py, reach);
  coneGrad.addColorStop(0,   'rgba(0,0,0,1)');
  coneGrad.addColorStop(0.55,'rgba(0,0,0,0.8)');
  coneGrad.addColorStop(0.85,'rgba(0,0,0,0.3)');
  coneGrad.addColorStop(1,   'rgba(0,0,0,0)');

  flCtx.beginPath();
  flCtx.moveTo(px, py);
  flCtx.arc(px, py, reach, angle - spread, angle + spread);
  flCtx.closePath();
  flCtx.fillStyle = coneGrad;
  flCtx.fill();

  // Small ambient circle around player so they're always visible
  const ambGrad = flCtx.createRadialGradient(px, py, 0, px, py, 55);
  ambGrad.addColorStop(0,   'rgba(0,0,0,0.95)');
  ambGrad.addColorStop(0.7, 'rgba(0,0,0,0.5)');
  ambGrad.addColorStop(1,   'rgba(0,0,0,0)');
  flCtx.beginPath(); flCtx.arc(px, py, 55, 0, Math.PI * 2);
  flCtx.fillStyle = ambGrad; flCtx.fill();

  flCtx.restore();

  // ── warm torch tint overlay on top ──
  flCtx.save();
  flCtx.globalCompositeOperation = 'source-atop';
  const warmGrad = flCtx.createRadialGradient(px, py, 0, px, py, reach);
  warmGrad.addColorStop(0,   `rgba(255,190,60,${flicker ? 0.18 : 0.12})`);
  warmGrad.addColorStop(0.5, 'rgba(255,160,40,0.06)');
  warmGrad.addColorStop(1,   'rgba(0,0,0,0)');
  flCtx.fillStyle = warmGrad; flCtx.fillRect(0, 0, w, h);
  flCtx.restore();

  // ── reveal clues that are in the flashlight cone ──
  clueEls.forEach(c => {
    if (c._collected) return;
    const cx = parseFloat(c.style.left) + 50;
    const cy = parseFloat(c.style.top)  + 10;
    const cd = dist(px, py, cx, cy);
    const ca = Math.atan2(cy - py, cx - px);
    const da = Math.abs(((ca - angle) + Math.PI * 3) % (Math.PI * 2) - Math.PI);
    if (cd < reach && da < spread + 0.15) { c.classList.add('revealed'); }
    else { c.classList.remove('revealed'); }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §16  FOG RENDERER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderFog(t, levelIdx) {
  const w = fogCanvas.width, h = fogCanvas.height;
  fCtx.clearRect(0, 0, w, h);
  const density = [0.07, 0.28, 0.06, 0.15, 0.38][levelIdx] || 0.1;
  if (density < 0.04) return;
  for (let i = 0; i < 9; i++) {
    const fx = (Math.sin(t * 0.18 + i * 0.9) * w * 0.35 + w / 2 + (i * w / 9)) % w;
    const fy =  Math.cos(t * 0.14 + i * 0.6) * h * 0.22 + h / 2;
    const fr = 90 + i * 28;
    const fg = fCtx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    fg.addColorStop(0, `rgba(${levelIdx === 4 ? '255,100,100' : '180,200,255'},${density * 0.55})`);
    fg.addColorStop(1, 'rgba(0,0,0,0)');
    fCtx.fillStyle = fg;
    fCtx.beginPath(); fCtx.arc(fx, fy, fr, 0, Math.PI * 2); fCtx.fill();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §17  HUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function updateHud() {
  hScore.textContent = gs.score;
  hLevel.textContent = `LEVEL ${gs.levelIdx + 1} — ${LEVELS[gs.levelIdx].name}`;
  healthFill.style.width = gs.hp + '%';
  healthFill.style.background =
    gs.hp > 60 ? 'linear-gradient(90deg,#ff2222,#ff6666)' :
    gs.hp > 30 ? 'linear-gradient(90deg,#ff8800,#ffcc00)' :
                 'linear-gradient(90deg,#ff0000,#ff4400)';
  torchFill.style.width = gs.torchBattery + '%';
  const cdFrac = gs.cooldown > 0 ? (1 - gs.cooldown / gs.maxCooldown) : 1;
  powerFill.style.width = Math.round(cdFrac * 100) + '%';
  hClues.textContent = gs.cluesFound + '/' + (LEVELS[gs.levelIdx].clueTexts || []).length;
  hObj.textContent   = LEVELS[gs.levelIdx].objective;
  // Heartbeat warning
  const anyClose = gs.enemies.some(e => dist(gs.px + 36, gs.py + 45, e.x, e.y) < 200);
  const vecnaClose = gs.bossHp > 0 && dist(gs.px, gs.py, vecnaX, vecnaY) < 260;
  heartbeat.classList.toggle('on', anyClose || vecnaClose);
  // Curse overlay
  curseOverlay.classList.toggle('on', vecnaClose);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §18  DAMAGE & END STATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function takeDamage(src) {
  if (gs.invincible || gs.shielded) { showMsg('🛡️ BLOCKED!'); return; }
  gs.hp = Math.max(0, gs.hp - 25);
  gs.invincible = true;
  gs.invTimer   = 2000;
  dmgFlash.classList.add('on');
  playerSprite.classList.add('hurt');
  setTimeout(() => { dmgFlash.classList.remove('on'); playerSprite.classList.remove('hurt'); }, 180);
  SFX.hurt();
  triggerShake(9, 350);
  spawnParticle(gs.px + 36, gs.py + 45, 'blood');
  if (gs.hp <= 0) { endGame(); return; }
  showMsg(`💔 HIT from ${src.toUpperCase()}! HP: ${gs.hp}`);
}

function cleanupLevel() {
  curseOverlay.classList.remove('on');
  heartbeat.classList.remove('on');
  bossBar.style.display  = 'none';
  vecnaSprite.style.display = 'none';
  gs.enemies.forEach(e => { if (e.el) e.el.remove(); if (e.shadow) e.shadow.remove(); });
  gs.collectibles.forEach(c => c.el.remove());
  vecnaProjectiles.forEach(p => p.el.remove());
  vecnaProjectiles = [];
  wallEls.forEach(w => w.remove()); wallEls = [];
  clueEls.forEach(c => c.remove()); clueEls = [];
  particles.length = 0;
  if (psychicFlashEl) { psychicFlashEl.remove(); psychicFlashEl = null; }
  if (batArcEl)       { batArcEl.remove(); batArcEl = null; }
}

function endGame() {
  gs.running = false;
  cancelAnimationFrame(rafId);
  cleanupLevel();
  if (gs.score > highScore) highScore = gs.score;
  document.getElementById('finalScore').textContent = `SCORE: ${gs.score}  |  REACHED LEVEL ${gs.levelIdx + 1}`;
  document.getElementById('goHiScore').textContent  = `HIGH SCORE: ${highScore}`;
  document.getElementById('gameOverScreen').style.display = 'flex';
}

function winGame() {
  gs.running = false;
  cancelAnimationFrame(rafId);
  cleanupLevel();
  const bonus = Math.floor(gs.hp / 25) * 250;
  gs.score += bonus;
  if (gs.score > highScore) highScore = gs.score;
  document.getElementById('winScore').textContent   = `FINAL SCORE: ${gs.score}  (+${bonus} SURVIVAL BONUS)`;
  document.getElementById('winHiScore').textContent = `HIGH SCORE: ${highScore}`;
  document.getElementById('winScreen').style.display = 'flex';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §19  LEVEL TRANSITION & INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showLevelTransition(levelIdx, cb) {
  const ld = LEVELS[levelIdx];
  const tr = document.getElementById('levelTransition');
  document.getElementById('ltLevel').textContent = `LEVEL ${levelIdx + 1}`;
  document.getElementById('ltName').textContent  = ld.name;
  document.getElementById('ltDesc').textContent  = ld.desc.replace(/\n/g, ' • ');
  tr.style.display = 'flex';
  const bar = document.getElementById('ltBar');
  bar.style.transition = 'none'; bar.style.width = '0%';
  setTimeout(() => { bar.style.transition = 'width 2.5s linear'; bar.style.width = '100%'; }, 60);
  SFX.levelUp(); SFX.door();
  setTimeout(() => { tr.style.display = 'none'; if (cb) cb(); }, 3000);
}

function initLevel(levelIdx) {
  const ld        = LEVELS[levelIdx];
  gs.levelIdx     = levelIdx;
  gs.enemies      = [];
  gs.collectibles = [];
  gs.cluesFound   = 0;
  gs.torchFlicker = false;
  gs.enemySlowTimer  = 0;
  gs.mindSightTimer  = 0;
  gs.skateBoostTimer = 0;
  gs.demoSpawnTimer  = 7000;
  gs.collectSpawnTimer = 2500;
  gs.envTime      = 0;
  gs.vecnaShootTimer = 2500;

  resizeCanvases();
  buildWalls(levelIdx);
  spawnClues(ld);

  // Map player sprite to selected character
  playerSprite.src = CHARS[gs.char].sprite;
  playerSprite.style.left = Math.round(gs.px) + 'px';
  playerSprite.style.top  = Math.round(gs.py) + 'px';
  playerSprite.classList.remove('invincible','shielded','hurt','moving');
  playerSprite.style.opacity   = '1';
  playerSprite.style.transform = '';

  // Shadow
  playerShadowEl.style.left = (gs.px + 6) + 'px';
  playerShadowEl.style.top  = (gs.py + 78) + 'px';

  initVecna();

  // Staggered enemy spawns
  const ld2 = LEVELS[levelIdx];
  for (let i = 0; i < ld2.enemyCount; i++) {
    setTimeout(() => spawnEnemy(), 2200 + i * 1600);
  }
  // Staggered collectible spawns
  for (let i = 0; i < ld2.collectCount; i++) {
    setTimeout(() => spawnCollectible(), 900 + i * 700);
  }

  SFX.startAmbient(levelIdx + 1);
  abilityLabel.textContent = `${CHARS[gs.char].name} — ${CHARS[gs.char].ability}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §20  ABILITY ACTIVATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useAbility() {
  if (gs.cooldown > 0 || !gs.running) return;
  const ch = CHARS[gs.char];
  gs.cooldown    = ch.cooldown;
  gs.maxCooldown = ch.cooldown;
  ch.use(gs);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §21  MAIN GAME LOOP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function tick(ts) {
  if (!gs.running) return;
  const dt = Math.min(ts - lastTs, 50); lastTs = ts;
  animFrame++;
  gs.envTime += dt / 1000;

  // ── Player movement ──────────────────────────────────────────────────────
  const isSkating = gs.skateBoostTimer > 0;
  const baseSpeed = isSkating ? 400 : 205 + gs.levelIdx * 6;
  let dx = 0, dy = 0;
  if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
  if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
  if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;
  const moving = dx !== 0 || dy !== 0;
  if (moving) { const mg = Math.sqrt(dx*dx + dy*dy); dx /= mg; dy /= mg; }

  const step = baseSpeed * dt / 1000;
  const nx   = gs.px + dx * step;
  const ny   = gs.py + dy * step;
  if (!hitsWall(nx, gs.py, 52, 56)) gs.px = clamp(nx, 4, aw() - 60);
  if (!hitsWall(gs.px, ny, 52, 56)) gs.py = clamp(ny, 4, ah() - 64);

  // Footstep SFX
  if (moving && animFrame % 20 === 0) SFX.step();

  // Facing direction (for Steve's bat)
  if (dx !== 0) gs.facingLeft = dx < 0;

  // ── Update player sprite ──────────────────────────────────────────────────
  playerSprite.style.left      = Math.round(gs.px) + 'px';
  playerSprite.style.top       = Math.round(gs.py) + 'px';
  playerSprite.style.transform = (gs.facingLeft ? 'scaleX(-1)' : '');
  moving ? playerSprite.classList.add('moving') : playerSprite.classList.remove('moving');

  // Skate boost glow
  if (isSkating) {
    playerSprite.style.filter = `drop-shadow(0 0 16px ${CHARS[gs.char].glowColor}) drop-shadow(0 14px 10px rgba(0,0,0,0.8)) contrast(1.1) saturate(1.4)`;
  } else {
    playerSprite.style.filter = `drop-shadow(0 14px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 6px ${CHARS[gs.char].glowColor}) contrast(1.05) saturate(1.1)`;
  }

  // Shadow
  playerShadowEl.style.left = (gs.px + 6) + 'px';
  playerShadowEl.style.top  = (gs.py + 78) + 'px';

  // ── Timers ────────────────────────────────────────────────────────────────
  if (gs.cooldown > 0)    gs.cooldown     = Math.max(0, gs.cooldown     - dt);
  if (gs.stunDuration > 0)gs.stunDuration = Math.max(0, gs.stunDuration - dt);
  if (gs.enemySlowTimer>0)gs.enemySlowTimer= Math.max(0,gs.enemySlowTimer-dt);
  if (gs.mindSightTimer>0){gs.mindSightTimer=Math.max(0,gs.mindSightTimer-dt);revealClues();}
  if (gs.skateBoostTimer>0)gs.skateBoostTimer=Math.max(0,gs.skateBoostTimer-dt);

  // Invincibility
  if (gs.invincible && gs.invTimer > 0) {
    gs.invTimer -= dt;
    if (gs.invTimer <= 0) {
      gs.invincible = false;
      playerSprite.classList.remove('invincible');
      playerSprite.style.opacity = '1';
    } else {
      playerSprite.classList.add('invincible');
    }
  }

  // ── Torch battery drain ───────────────────────────────────────────────────
  const drainRate = gs.levelIdx === 4 ? 0.009 : 0.005; // faster in Upside Down
  gs.torchBattery = Math.max(0, gs.torchBattery - dt * drainRate);
  if (gs.torchBattery < 15 && animFrame % 35 === 0) SFX.radio(); // dying battery warning

  // ── Vecna AI (boss) ───────────────────────────────────────────────────────
  const ld = LEVELS[gs.levelIdx];
  if (ld.bossHp > 0 && vecnaSprite.style.display !== 'none') {
    // Knockback physics
    if (vecnaKnockTimer > 0) {
      vecnaKnockTimer -= dt;
      vecnaX = clamp(vecnaX + vecnaKnockVx, 0, aw() - 100);
      vecnaY = clamp(vecnaY + vecnaKnockVy, 0, ah() - 120);
      vecnaKnockVx *= 0.85; vecnaKnockVy *= 0.85;
    } else if (gs.stunDuration <= 0) {
      // Chase player with increasing aggression as HP drops
      const aggro  = 0.5 + (1 - gs.bossHp / gs.maxBossHp) * 0.6 + gs.levelIdx * 0.08;
      const vSpeed = aggro * dt / 1000 * 120;
      const vdx    = (gs.px + 36) - (vecnaX + 50);
      const vdy    = (gs.py + 45) - (vecnaY + 60);
      const vd     = Math.sqrt(vdx * vdx + vdy * vdy) || 1;
      // Circle-strafe at < 200px
      let mvx = (vdx / vd) * vSpeed;
      let mvy = (vdy / vd) * vSpeed;
      if (vd < 200) {
        mvx += Math.cos(gs.envTime * 1.4) * vSpeed * 0.5;
        mvy += Math.sin(gs.envTime * 1.4) * vSpeed * 0.5;
      }
      const nvx = vecnaX + mvx, nvy = vecnaY + mvy;
      if (!hitsWall(nvx, vecnaY, 100, 120)) vecnaX = clamp(nvx, 0, aw() - 100);
      if (!hitsWall(vecnaX, nvy, 100, 120)) vecnaY = clamp(nvy, 0, ah() - 120);
    }
    // Update sprite
    vecnaSprite.style.left      = Math.round(vecnaX) + 'px';
    vecnaSprite.style.top       = Math.round(vecnaY) + 'px';
    vecnaSprite.style.transform = ((gs.px + 36) < (vecnaX + 50)) ? 'scaleX(-1)' : '';
    vecnaSprite.classList.toggle('stunned', gs.stunDuration > 0);

    // Melee damage
    if (!gs.invincible && dist(gs.px + 36, gs.py + 45, vecnaX + 50, vecnaY + 60) < 68) {
      takeDamage('vecna');
    }

    // Torch flicker when Vecna is near
    if (dist(gs.px, gs.py, vecnaX, vecnaY) < 230) gs.torchFlicker = true;

    // Projectile fire
    if (gs.stunDuration <= 0) {
      gs.vecnaShootTimer -= dt;
      const shootInterval = Math.max(900, 2800 - (1 - gs.bossHp / gs.maxBossHp) * 1800);
      if (gs.vecnaShootTimer <= 0) {
        gs.vecnaShootTimer = shootInterval;
        spawnVecnaProjectile();
        // Enrage at < 30% HP: double shot
        if (gs.bossHp / gs.maxBossHp < 0.3) {
          setTimeout(spawnVecnaProjectile, 250);
        }
      }
    }
  }

  // ── Vecna projectile update ───────────────────────────────────────────────
  for (let i = vecnaProjectiles.length - 1; i >= 0; i--) {
    const p = vecnaProjectiles[i];
    p.x += p.vx; p.y += p.vy;
    p.el.style.left = (p.x - 9) + 'px';
    p.el.style.top  = (p.y - 9) + 'px';
    // Off-screen removal
    if (p.x < -20 || p.x > aw() + 20 || p.y < -20 || p.y > ah() + 20) {
      p.el.remove(); vecnaProjectiles.splice(i, 1); continue;
    }
    // Player hit
    if (!gs.invincible && dist(p.x, p.y, gs.px + 36, gs.py + 45) < 40) {
      spawnParticle(p.x, p.y, 'explosion');
      p.el.remove(); vecnaProjectiles.splice(i, 1);
      takeDamage('vecna projectile');
    }
  }

  // ── Enemy AI (demogorgon images) ──────────────────────────────────────────
  const slowFactor = gs.enemySlowTimer > 0 ? 0.28 : 1;
  for (let i = gs.enemies.length - 1; i >= 0; i--) {
    const e = gs.enemies[i];
    e.phase += 1;

    // Per-enemy stun
    if (e.stunTimer > 0) {
      e.stunTimer -= dt;
      if (e.el) e.el.classList.add('stunned');
      continue;
    }
    if (e.el) e.el.classList.remove('stunned');

    // Global stun (Joyce / Eleven area)
    if (gs.stunDuration > 0) {
      if (e.el) e.el.classList.add('stunned');
      continue;
    }
    if (e.el) e.el.classList.remove('stunned');

    // Knockback from abilities
    if (e.knockTimer > 0) {
      e.knockTimer -= dt;
      e.x = clamp(e.x + e.knockVx, 20, aw() - 20);
      e.y = clamp(e.y + e.knockVy, 20, ah() - 20);
      e.knockVx *= 0.82; e.knockVy *= 0.82;
    } else {
      // Chase player
      const edx = (gs.px + 36) - e.x;
      const edy = (gs.py + 45) - e.y;
      const ed  = Math.sqrt(edx * edx + edy * edy) || 1;
      const es  = e.speed * slowFactor * dt / 1000 * 120;
      e.x += (edx / ed) * es;
      e.y += (edy / ed) * es;
    }

    // Update DOM sprite
    if (e.el) {
      e.el.style.left      = (e.x - 35) + 'px';
      e.el.style.top       = (e.y - 43) + 'px';
      e.el.style.transform = (e.x < gs.px + 36) ? 'scaleX(-1)' : '';
    }
    if (e.shadow) {
      e.shadow.style.left = (e.x - 29) + 'px';
      e.shadow.style.top  = (e.y + 38) + 'px';
    }

    // Torch flicker proximity
    if (dist(gs.px, gs.py, e.x, e.y) < 160) gs.torchFlicker = true;

    // Collision with player → take damage, remove enemy
    if (!gs.invincible && dist(gs.px + 36, gs.py + 45, e.x, e.y) < 48) {
      spawnParticle(e.x, e.y, 'explosion');
      if (e.el) e.el.remove();
      if (e.shadow) e.shadow.remove();
      gs.enemies.splice(i, 1);
      takeDamage('demogorgon');
      continue;
    }

    // Dead from ability damage
    if (e.hp <= 0) {
      spawnParticle(e.x, e.y, 'explosion');
      if (e.el) e.el.remove();
      if (e.shadow) e.shadow.remove();
      gs.enemies.splice(i, 1);
      gs.score += 60 + gs.levelIdx * 15;
      continue;
    }
  }

  // Torch flicker: reset if no enemies close (unless Vecna near)
  const vecnaClose2 = ld.bossHp > 0 && dist(gs.px, gs.py, vecnaX, vecnaY) < 230;
  if (!vecnaClose2 && !gs.enemies.some(e => dist(gs.px, gs.py, e.x, e.y) < 160)) {
    gs.torchFlicker = false;
  }

  // ── Collectibles (🔦 tokens) ───────────────────────────────────────────────
  for (let i = gs.collectibles.length - 1; i >= 0; i--) {
    const c = gs.collectibles[i];
    if (dist(gs.px + 32, gs.py + 32, c.x + 12, c.y + 12) < 52) {
      c.el.remove();
      gs.collectibles.splice(i, 1);
      gs.score     += 80 + gs.levelIdx * 25;
      gs.torchBattery = Math.min(100, gs.torchBattery + 22); // recharge torch
      gs.cluesFound = Math.min(gs.cluesFound + 1, (ld.clueTexts || []).length);
      SFX.collect();
      spawnParticle(c.x, c.y, 'spore');
      showMsg('🔦 +FLASHLIGHT CHARGED  +SCORE!');
      // Boss flashlight damage
      if (gs.bossHp > 0) {
        gs.bossHp = Math.max(0, gs.bossHp - 2);
        bossFill.style.width = (gs.bossHp / gs.maxBossHp * 100) + '%';
        if (gs.bossHp === 0) { triggerShake(16, 600); advanceLevel(); return; }
      }
      // Respawn with delay
      setTimeout(() => spawnCollectible(), 2800);
    }
  }

  // ── Clue interaction (walk into a revealed clue) ──────────────────────────
  clueEls.forEach(c => {
    if (c._collected) return;
    const cx = parseFloat(c.style.left) + 60;
    const cy = parseFloat(c.style.top)  + 10;
    if (dist(gs.px + 32, gs.py + 32, cx, cy) < 55 && c.classList.contains('revealed')) {
      c._collected = true;
      c.style.opacity = '0.25';
      gs.score += 120;
      gs.cluesFound++;
      const popup = document.getElementById('cluePopup');
      document.getElementById('clueText').textContent = c._text;
      popup.style.display = 'flex';
      gs.running = false;
      cancelAnimationFrame(rafId);
      SFX.collect();
    }
  });

  // ── Level advancement ─────────────────────────────────────────────────────
  if (ld.bossHp === 0 && gs.score >= gs.levelThreshold && gs.levelIdx < LEVELS.length - 1) {
    advanceLevel(); return;
  }

  // ── Spawn timers ──────────────────────────────────────────────────────────
  gs.demoSpawnTimer   -= dt;
  if (gs.demoSpawnTimer <= 0) {
    gs.demoSpawnTimer = 9000 + Math.random() * 5000;
    spawnEnemy();
  }
  gs.collectSpawnTimer -= dt;
  if (gs.collectSpawnTimer <= 0 && gs.collectibles.length < 4) {
    gs.collectSpawnTimer = 3800;
    spawnCollectible();
  }

  // ── Score trickle ─────────────────────────────────────────────────────────
  gs.scoreTick = (gs.scoreTick || 0) + dt;
  if (gs.scoreTick > 700) { gs.score += gs.levelIdx + 1; gs.scoreTick = 0; }

  // ── Draw environment background ───────────────────────────────────────────
  LEVELS[gs.levelIdx].paintEnv(eCtx, envCanvas.width, envCanvas.height, gs.envTime);

  // ── Fog layer ─────────────────────────────────────────────────────────────
  renderFog(gs.envTime, gs.levelIdx);

  // ── Flashlight (destination-out punch through dark overlay) ──────────────
  renderFlashlight(gs.px + 36, gs.py + 45, arenaMouseX, arenaMouseY, gs.torchBattery / 100, gs.torchFlicker);

  // ── Particles ─────────────────────────────────────────────────────────────
  updateParticles(dt);

  // ── Screen shake ──────────────────────────────────────────────────────────
  applyShake(dt);

  // ── HUD ───────────────────────────────────────────────────────────────────
  updateHud();

  rafId = requestAnimationFrame(tick);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §22  ADVANCE LEVEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function advanceLevel() {
  gs.running = false;
  cancelAnimationFrame(rafId);
  const nextIdx = gs.levelIdx + 1;
  if (nextIdx >= LEVELS.length) { winGame(); return; }
  cleanupLevel();
  showLevelTransition(nextIdx, () => {
    gs.running  = true;
    gs.px = aw() / 2 - 26;
    gs.py = ah() / 2 - 26;
    gs.levelThreshold = gs.score + (nextIdx + 1) * 450;
    initLevel(nextIdx);
    lastTs = performance.now();
    rafId  = requestAnimationFrame(tick);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §23  START GAME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function startGame() {
  document.getElementById('startScreen').style.display    = 'none';
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('winScreen').style.display      = 'none';
  document.getElementById('gameArea').style.display       = 'block';
  cancelAnimationFrame(rafId);
  resizeCanvases();

  gs = {
    running: true, char: selectedChar, levelIdx: 0,
    px: aw() / 2 - 26, py: ah() / 2 - 26,
    hp: CHARS[selectedChar].hp, score: 0,
    cooldown: 0, maxCooldown: CHARS[selectedChar].cooldown,
    stunDuration: 0, invincible: false, invTimer: 0,
    shielded: false, facingLeft: false,
    torchBattery: 100, torchFlicker: false,
    enemies: [], collectibles: [], cluesFound: 0,
    bossHp: 0, maxBossHp: 0,
    enemySlowTimer: 0, mindSightTimer: 0, skateBoostTimer: 0,
    demoSpawnTimer: 5000, collectSpawnTimer: 2200,
    envTime: 0, scoreTick: 0,
    levelThreshold: 380,
    vecnaShootTimer: 3000
  };

  particles.length    = 0;
  vecnaProjectiles    = [];
  shakeTimer          = 0;
  shakeIntensity      = 0;

  startTheme();

  showLevelTransition(0, () => {
    initLevel(0);
    lastTs = performance.now();
    rafId  = requestAnimationFrame(tick);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §24  HELP OVERLAY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function toggleHelp() {
  const h       = document.getElementById('helpOverlay');
  if (!h) return;
  const showing = h.style.display === 'flex';
  h.style.display = showing ? 'none' : 'flex';
  if (!showing) { gs._helpPaused = gs.running; gs.running = false; cancelAnimationFrame(rafId); }
  else if (gs._helpPaused) { gs.running = true; lastTs = performance.now(); rafId = requestAnimationFrame(tick); }
}

const helpBtn = document.getElementById('helpBtn');
if (helpBtn) helpBtn.addEventListener('click', toggleHelp);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §25  EVENT LISTENERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', () => {
  document.getElementById('gameOverScreen').style.display = 'none'; startGame();
});
document.getElementById('winRestartBtn').addEventListener('click', () => {
  document.getElementById('winScreen').style.display = 'none'; startGame();
});
document.getElementById('clueClose').addEventListener('click', () => {
  document.getElementById('cluePopup').style.display = 'none';
  gs.running = true; lastTs = performance.now(); rafId = requestAnimationFrame(tick);
});

document.addEventListener('keydown', e => {
  if (e.key === 'h' || e.key === 'H') { toggleHelp(); return; }
  if (e.key === 'Escape') {
    const h = document.getElementById('helpOverlay');
    if (h && h.style.display === 'flex') { toggleHelp(); return; }
  }
  keys[e.key] = true;
  if (e.key === ' ') { e.preventDefault(); useAbility(); }
  if (e.key === 'f' || e.key === 'F') {
    gs.torchBattery = Math.min(100, gs.torchBattery + 35);
    showMsg('🔦 BATTERY RECHARGED (+35%)');
  }
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  const rect = arena ? arena.getBoundingClientRect() : null;
  if (rect) { arenaMouseX = e.clientX - rect.left; arenaMouseY = e.clientY - rect.top; }
  mouseX = e.clientX; mouseY = e.clientY;
});

window.addEventListener('resize', () => { if (gs.running) resizeCanvases(); });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// §26  LOADING SEQUENCE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LOAD_STEPS = [
  'LOADING HAWKINS, INDIANA...',
  'ESTABLISHING UPSIDE DOWN LINK...',
  'CALIBRATING FLASHLIGHT SYSTEMS...',
  'SUMMONING CHARACTERS...',
  'DETECTING DEMOGORGONS ON RADAR...',
  'OPENING THE GATE...',
  'VECNA IS WATCHING...',
  '— READY —'
];
let loadStep = 0;
function doLoad() {
  if (loadStep >= LOAD_STEPS.length) {
    loadFill.style.width = '100%';
    loadMsg.textContent  = '— READY —';
    setTimeout(() => {
      document.getElementById('loadScreen').style.display = 'none';
      document.getElementById('startScreen').style.display = 'flex';
      buildCharGrid();
    }, 600);
    return;
  }
  loadFill.style.width  = ((loadStep + 1) / LOAD_STEPS.length * 100) + '%';
  loadMsg.textContent   = LOAD_STEPS[loadStep];
  loadStep++;
  setTimeout(doLoad, 360 + Math.random() * 180);
}
setTimeout(doLoad, 400);

// Export internal refs for help-overlay close button (inline onclick in HTML)
window._gs         = gs;
window._rafResume  = () => { gs.running = true; lastTs = performance.now(); rafId = requestAnimationFrame(tick); };
