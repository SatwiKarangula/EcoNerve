// ============================================================
// EcoNerve – Particles & Utility Helpers
// ============================================================

/* ── Floating particle system ─────────────────────────────── */
function initParticles(canvasId = 'particle-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.4 + 0.1),
    alpha: Math.random() * 0.5 + 0.1,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 230, 118, ${p.alpha})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });
}

/* ── AQI Gauge (SVG arc) ──────────────────────────────────── */
function drawGauge(svgId, value, max = 300) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const size = 180, cx = size / 2, cy = size / 2, r = 72;
  const pct = Math.min(value / max, 1);
  const startAngle = -225 * (Math.PI / 180);
  const endAngle   = startAngle + pct * 270 * (Math.PI / 180);
  const cat = classifyAQI(value);

  function polar(a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }; }
  const s = polar(startAngle), e = polar(endAngle);
  const large = pct > (270 / 360) ? 1 : (endAngle - startAngle > Math.PI ? 1 : 0);

  svg.innerHTML = `
    <defs>
      <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#00e676"/>
        <stop offset="50%"  stop-color="#1de9b6"/>
        <stop offset="100%" stop-color="${cat.color}"/>
      </linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <!-- Track -->
    <path d="M${polar(-225*(Math.PI/180)).x},${polar(-225*(Math.PI/180)).y}
             A${r},${r} 0 1,1 ${polar(45*(Math.PI/180)).x},${polar(45*(Math.PI/180)).y}"
          fill="none" stroke="rgba(0,200,80,0.12)" stroke-width="10" stroke-linecap="round"/>
    <!-- Arc -->
    ${pct > 0 ? `<path d="M${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y}"
          fill="none" stroke="url(#gGrad)" stroke-width="10"
          stroke-linecap="round" filter="url(#glow)"/>` : ''}
    <!-- Value -->
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="${cat.color}"
          font-family="Syne,sans-serif" font-size="32" font-weight="800">${Math.round(value)}</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#a5d6a7"
          font-family="DM Sans,sans-serif" font-size="11">AQI</text>
    <text x="${cx}" y="${cy + 38}" text-anchor="middle" fill="${cat.color}"
          font-family="Syne,sans-serif" font-size="11" font-weight="700">${cat.label}</text>
  `;
}

/* ── Sidebar toggle (mobile) ──────────────────────────────── */
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target))
      sidebar.classList.remove('open');
  });
}

/* ── Format timestamp ─────────────────────────────────────── */
function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/* ── Number ticker animation ──────────────────────────────── */
function animateTo(el, target, duration = 800) {
  const start = parseFloat(el.textContent) || 0;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    el.textContent = (start + (target - start) * ease).toFixed(1);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target.toFixed(1);
  }
  requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initSidebar();
});
