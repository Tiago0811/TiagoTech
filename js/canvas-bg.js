/* ==========================================================================
   🌌 MODERN CYBER BACKGROUND ENGINE (CANVAS-BG.JS)
   Cyber Grid + Interactive Spotlight + Aurora Mesh + Floating Cyber Sparks
   ========================================================================== */

class CyberBackgroundEngine {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    
    // Mouse coords & lerp for smooth spotlight
    this.mouse = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
      targetX: window.innerWidth * 0.5,
      targetY: window.innerHeight * 0.35,
      radius: 140,
      active: false
    };

    // Idle animation timer
    this.idleTime = 0;
    this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Color palette from TiagoTech official logo
    this.colors = ['#0084FF', '#22C55E', '#38BDF8'];
    this.particleCount = window.innerWidth < 768 ? 18 : 34;

    this.initAurora();
    if (this.canvas) {
      this.initCanvas();
    }
    this.setupEventListeners();
    this.animate();
  }

  initAurora() {
    // Inject ambient aurora glow orbs if not present in DOM
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
    const w = this.canvas.width;
    const h = this.canvas.height;

    const x = Math.random() * w;
    const y = randomY ? Math.random() * h : h + 15;
    const size = Math.random() * 2.2 + 1.2; // 1.2px - 3.4px
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    return {
      x,
      y,
      size,
      color,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.3), // Slow upward drift
      alpha: Math.random() * 0.5 + 0.25,
      pulseSpeed: Math.random() * 0.015 + 0.006,
      pulseDir: Math.random() > 0.5 ? 1 : -1,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.012 + 0.005
    };
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particleCount = window.innerWidth < 768 ? 18 : 34;
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initCanvas();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
      this.mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
  }

  // Compatibility hook
  setTheme(theme) {
    // Kept for seamless integration
  }

  updateSpotlight() {
    // Smooth interpolation (lerp) for the cursor spotlight
    if (this.mouse.active) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;
    } else {
      // Gentle breathing idle floating path
      this.idleTime += 0.008;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.mouse.x = (w * 0.5) + Math.cos(this.idleTime * 0.7) * (w * 0.18);
      this.mouse.y = (h * 0.35) + Math.sin(this.idleTime) * (h * 0.12);
    }

    // Update CSS variables for body::after radial gradient
    document.documentElement.style.setProperty('--mouse-x', `${this.mouse.x.toFixed(1)}px`);
    document.documentElement.style.setProperty('--mouse-y', `${this.mouse.y.toFixed(1)}px`);
  }

  draw() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;

    this.particles.forEach((p) => {
      // 1. Organic movement: upward drift + gentle sine sway
      p.swayAngle += p.swaySpeed;
      p.x += Math.sin(p.swayAngle) * 0.35 + p.vx;
      p.y += p.vy;

      // 2. Mouse interaction: soft repulsion
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.8;
          p.y += Math.sin(angle) * force * 1.8;
        }
      }

      // 3. Screen wrap (respawn at bottom when fading out at top)
      if (p.y < -20) {
        Object.assign(p, this.createParticle(false));
      }
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      // 4. Subtle pulsing glow
      p.alpha += p.pulseSpeed * p.pulseDir;
      if (p.alpha > 0.85 || p.alpha < 0.2) p.pulseDir *= -1;

      // 5. Draw luminous spark
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = Math.max(0.05, Math.min(1, p.alpha));
      this.ctx.shadowBlur = 6;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
    });

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  animate() {
    this.updateSpotlight();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.bgParticleEngine = new CyberBackgroundEngine();
});
