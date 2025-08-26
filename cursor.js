/* =========================================================
 * MagicTrail: Sparkles + Dust (Canvas)
 * 기존 커서 코드와 독립적으로 동작. 전역 API: window.MagicTrail
 * - pause() / resume() / destroy() / setColors([...])
 * - 페이지에서 비활성화하려면 <body data-magictrail="off"> 사용
 * =======================================================*/
(function () {
  // body에 data-magictrail="off"면 구동 안 함
  if (document.body && document.body.getAttribute('data-magictrail') === 'off') return;

  // 이미 존재하면 중복 생성 방지
  if (window.MagicTrail) return;

  const CONFIG = {
    colors: ['#ffffff', '#ffe8a3', '#ffd3e2', '#d6f0ff', '#e6d6ff'],
    spawnSparkles: [1, 2],
    spawnDust: [2, 4],
    lifeSparkle: [220, 360],
    lifeDust: [360, 680],
    sizeSparkle: [6, 12],
    sizeDust: [2, 4],
    speedSparkle: [1.2, 2.1],
    speedDust: [0.6, 1.2],
    gravity: 0.02,
    maxParticles: 320,
    trailSmoothing: 0.22
  };

  const cvs = document.createElement('canvas');
  cvs.id = 'magicTrail';
  document.body.appendChild(cvs);
  const ctx = cvs.getContext('2d');

  let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let w = 0, h = 0;
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    cvs.width = Math.floor(w * dpr);
    cvs.height = Math.floor(h * dpr);
    cvs.style.width = w + 'px';
    cvs.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // 접근성/모바일 조건에서 자연스레 중단
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;
  if (prefersReduced || isCoarse) {
    // 스타일에서 display:none 처리되지만, 안전하게만 종료
    return;
  }

  // 유틸
  const rand = (min, max) => Math.random() * (max - min) + min;
  const randi = (min, max) => Math.floor(rand(min, max + 1));
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  // 파티클
  const particles = [];
  function spawnAt(x, y) {
    if (particles.length > CONFIG.maxParticles) return;
    const nSpark = randi(CONFIG.spawnSparkles[0], CONFIG.spawnSparkles[1]);
    const nDust = randi(CONFIG.spawnDust[0], CONFIG.spawnDust[1]);
    for (let i = 0; i < nSpark; i++) spawnSparkle(x, y);
    for (let i = 0; i < nDust; i++) spawnDust(x, y);
  }
  function spawnSparkle(x, y) {
    const size = rand(CONFIG.sizeSparkle[0], CONFIG.sizeSparkle[1]);
    const speed = rand(CONFIG.speedSparkle[0], CONFIG.speedSparkle[1]);
    const ang = Math.random() * Math.PI * 2;
    particles.push({
      type: 'spark',
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: rand(CONFIG.lifeSparkle[0], CONFIG.lifeSparkle[1]),
      age: 0,
      size,
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.12, 0.12),
      color: pick(CONFIG.colors)
    });
  }
  function spawnDust(x, y) {
    const size = rand(CONFIG.sizeDust[0], CONFIG.sizeDust[1]);
    const speed = rand(CONFIG.speedDust[0], CONFIG.speedDust[1]);
    const ang = Math.random() * Math.PI * 2;
    particles.push({
      type: 'dust',
      x, y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: rand(CONFIG.lifeDust[0], CONFIG.lifeDust[1]),
      age: 0,
      size,
      color: pick(CONFIG.colors)
    });
  }

  // 마우스 추적 + 부드러운 보정
  let mouseX = w / 2, mouseY = h / 2;
  let targetX = mouseX, targetY = mouseY;
  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX; targetY = e.clientY;
    spawnAt(e.clientX, e.clientY);
  }, { passive: true });

  // 드로잉
  function drawSparkle(p) {
    const t = p.age / p.life;
    const alpha = (1 - t) * 0.95 + 0.05;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const s = p.size;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    // 십자
    ctx.beginPath();
    ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
    ctx.moveTo(0, -s); ctx.lineTo(0, s);
    ctx.stroke();
    // 대각 글린트
    ctx.beginPath();
    const d = s * 0.7;
    ctx.moveTo(-d, -d); ctx.lineTo(d, d);
    ctx.moveTo(-d, d);  ctx.lineTo(d, -d);
    ctx.stroke();
    ctx.restore();
  }
  function drawDust(p) {
    const t = p.age / p.life;
    const alpha = (1 - t) * 0.7;
    const r = p.size * (1 - t * 0.3);
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grd.addColorStop(0, p.color);
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  let rafId = 0;
  function frame() {
    ctx.clearRect(0, 0, w, h);

    // smoothing
    mouseX += (targetX - mouseX) * CONFIG.trailSmoothing;
    mouseY += (targetY - mouseY) * CONFIG.trailSmoothing;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += 16.7; // ~60fps
      if (p.age >= p.life) { particles.splice(i, 1); continue; }
      if (p.type === 'dust') p.vy += CONFIG.gravity;
      p.x += p.vx; p.y += p.vy;
      if (p.type === 'spark') p.rot += p.spin;

      // 화면 밖이면 제거
      if (p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
        particles.splice(i, 1);
        continue;
      }
      if (p.type === 'spark') drawSparkle(p);
      else drawDust(p);
    }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  // 공개 API
  window.MagicTrail = {
    pause() { cancelAnimationFrame(rafId); },
    resume() { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(frame); },
    destroy() { cancelAnimationFrame(rafId); particles.length = 0; ctx.clearRect(0, 0, w, h); cvs.remove(); delete window.MagicTrail; },
    setColors(arr) { CONFIG.colors = arr.slice(); },
    setDensity({ spark = null, dust = null } = {}) {
      if (spark) CONFIG.spawnSparkles = spark;
      if (dust) CONFIG.spawnDust = dust;
    },
    setMaxParticles(n) { CONFIG.maxParticles = n|0; },
  };
})();
