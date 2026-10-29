/* ==========================================================================
   🌌 HIGH-PERFORMANCE CYBER BACKGROUND ENGINE (CANVAS-BG.JS)
   Hardware-Accelerated Canvas Spotlight + Lightweight Cyber Sparks
   Optimized for 60-144 FPS with Zero Global Style Recalculation
   ========================================================================== */

class CyberBackgroundEngine {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;
    this.particles = [];
    this.isRunning = true;
    this.rafId = null;
    
    // Mouse coords & lerp for smooth spotlight
    this.mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.35,
      radius: 130,
      radiusSq: 130 * 130,
      active: false
    };

    // Idle animation timer
    this.idleTime = 0;
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Color palette from TiagoTech official brand
    this.colors = ['#0084FF', '#22C55E', '#38BDF8'];
    this.particleCount = window.innerWidth < 768 ? 14 : 24;

    this.initAurora();
    if (this.canvas) {
      this.initCanvas();
    }
    this.setupEventListeners();
    this.animate();
  }

  initAurora() {
    if (!document.getElementById('aurora-bg')) {
      const container = document.createElement('div');
      container.id = 'aurora-bg';
      container.className = 'aurora-bg-container';
      container.innerHTML = `
        <div class="aurora-orb aurora-orb-blue"></div>
        <div class="aurora-orb aurora-orb-green"></div>
        <div class="aurora-orb aurora-orb-cyan"></div>
      `;
      document.body.prepend(container);
    }
  }

  initCanvas() {
    this.resize();
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const w = this.canvas ? this.canvas.width : window.innerWidth;
    const h = this.canvas ? this.canvas.height : window.innerHeight;

    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 15,
      size: Math.random() * 2 + 1.2,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.45 + 0.25),
      alpha: Math.random() * 0.45 + 0.25,
      pulseSpeed: Math.random() * 0.012 + 0.005,
      pulseDir: Math.random() > 0.5 ? 1 : -1,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.01 + 0.004
    };
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particleCount = window.innerWidth < 768 ? 14 : 24;
  }

  setupEventListeners() {
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
        this.initCanvas();
      }, 150);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    }, { passive: true });

    // Pause rendering when tab is hidden to save 100% of GPU/CPU resources
    document.addEventListener('visibilitychange', () => {
      this.isRunning = !document.hidden;
      if (this.isRunning && !this.rafId) {
        this.animate();
      }
    });
  }

  setTheme(theme) {}

  updateSpotlight() {
    if (this.mouse.active) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.1;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.1;
    } else {
      this.idleTime += 0.008;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.mouse.x = (w * 0.5) + Math.cos(this.idleTime * 0.7) * (w * 0.18);
      this.mouse.y = (h * 0.35) + Math.sin(this.idleTime) * (h * 0.12);
    }
    // High-performance note: Zero setProperty calls on :root to avoid global layout/style recalculation
  }

  draw() {
    if (!this.ctx || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // 1. Draw smooth interactive spotlight directly on the background canvas (ultra-fast, zero CSS recalc)
    const spotGrad = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, 600
    );
    spotGrad.addColorStop(0, 'rgba(0, 132, 255, 0.15)');
    spotGrad.addColorStop(0.35, 'rgba(34, 197, 94, 0.07)');
    spotGrad.addColorStop(0.72, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = spotGrad;
    this.ctx.fillRect(0, 0, w, h);

    // 2. Draw floating cyber particles
    const len = this.particles.length;
    for (let i = 0; i < len; i++) {
      const p = this.particles[i];

      // Organic sway
      p.swayAngle += p.swaySpeed;
      p.x += Math.sin(p.swayAngle) * 0.35 + p.vx;
      p.y += p.vy;

      // Soft mouse repulsion with squared distance to avoid expensive Math.sqrt
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < this.mouse.radiusSq) {
          const dist = Math.sqrt(distSq);
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.6;
          p.y += Math.sin(angle) * force * 1.6;
        }
      }

      // Screen wrap
      if (p.y < -20) {
        Object.assign(p, this.createParticle(false));
      }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      // Subtle pulse
      p.alpha += p.pulseSpeed * p.pulseDir;
      if (p.alpha > 0.8 || p.alpha < 0.2) p.pulseDir *= -1;

      // Render crisp spark without expensive shadowBlur
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0.05, Math.min(0.9, p.alpha));
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
  }

  animate() {
    if (!this.isRunning) {
      this.rafId = null;
      return;
    }
    this.updateSpotlight();
    this.draw();
    this.rafId = requestAnimationFrame(() => this.animate());
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.bgParticleEngine = new CyberBackgroundEngine();
});
