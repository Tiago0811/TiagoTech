/* ==========================================================================
   🕸️ HIGH-PERFORMANCE DYNAMIC CANVAS PARTICLE ENGINE (CANVAS-BG.JS)
   ========================================================================== */

class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = {
      x: null,
      y: null,
      radius: 120, // Interaction radius
      active: false
    };
    
    // Engine State
    this.theme = 'tech'; // 'tech' or 'gamer'
    this.particleCount = 75; // Balanced for high performance
    
    // Theme configurations
    this.config = {
      tech: {
        color: '#00F0FF',
        speedX: 0.5,
        speedY: 0.5,
        sizeMin: 1.5,
        sizeMax: 3.5,
        connect: true,
        connectDist: 110,
        flowDir: 'random'
      },
      gamer: {
        color: '#39FF14',
        colorAlt: '#00FF88',
        speedX: 0.4,
        speedY: -1.2, // Upward floating spark direction
        sizeMin: 1.0,
        sizeMax: 4.5,
        connect: false,
        flowDir: 'upward'
      }
    };
    
    this.init();
    this.setupEventListeners();
    this.animate();
  }

  init() {
    // Handle retina displays/high DPI
    this.resize();
    
    // Populate particles
    this.particles = [];
    const currentConf = this.config[this.theme];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    const currentConf = this.config[this.theme];
    
    // Dimensions
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Spawn position
    const x = Math.random() * w;
    // For upward flow, gamer mode spawns mostly at the bottom if initialized dynamically
    const y = randomY ? Math.random() * h : (currentConf.flowDir === 'upward' ? h + 10 : Math.random() * h);
    
    // Particle size
    const size = Math.random() * (currentConf.sizeMax - currentConf.sizeMin) + currentConf.sizeMin;
    
    // Base Velocity
    let vx = (Math.random() - 0.5) * currentConf.speedX * 2;
    let vy = (Math.random() - 0.5) * currentConf.speedY * 2;
    
    if (currentConf.flowDir === 'upward') {
      vx = (Math.random() - 0.5) * 0.8;
      vy = Math.random() * currentConf.speedY - 0.4; // Force upward bias
    }
    
    // Particle color selection
    let color = currentConf.color;
    if (this.theme === 'gamer' && Math.random() > 0.45) {
      color = currentConf.colorAlt; // Blend of red and orange
    }

    return {
      x,
      y,
      size,
      vx,
      vy,
      color,
      originalSize: size,
      alpha: Math.random() * 0.5 + 0.3,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseDir: 1,
      angle: Math.random() * Math.PI * 2 // Gamer weave angle
    };
  }

  resize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Re-adjust particle counts on small screen sizes to prevent crowding
    if (window.innerWidth < 768) {
      this.particleCount = 35;
    } else {
      this.particleCount = 75;
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });
    
    // Mouse movement interaction
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
      this.mouse.active = false;
    });
  }

  // Master Switch: Morph behavior fluidly
  setTheme(newTheme) {
    if (newTheme !== 'tech' && newTheme !== 'gamer') return;
    this.theme = newTheme;
    
    // Transition current particles into their new theme properties smoothly
    const currentConf = this.config[this.theme];
    
    this.particles.forEach(p => {
      p.vx = (Math.random() - 0.5) * (this.theme === 'gamer' ? 0.8 : currentConf.speedX * 2);
      p.vy = this.theme === 'gamer' ? (Math.random() * currentConf.speedY - 0.4) : ((Math.random() - 0.5) * currentConf.speedY * 2);
      
      // Interpolate colors
      if (this.theme === 'tech') {
        p.color = currentConf.color;
      } else {
        p.color = Math.random() > 0.5 ? currentConf.color : currentConf.colorAlt;
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const currentConf = this.config[this.theme];
    
    // Update and draw particles
    this.particles.forEach((p, idx) => {
      // 1. Move Particle
      if (this.theme === 'gamer') {
        // Spark floating wave movement
        p.angle += 0.015;
        p.x += Math.sin(p.angle) * 0.25 + p.vx;
        p.y += p.vy;
      } else {
        p.x += p.vx;
        p.y += p.vy;
      }
      
      // 2. Mouse Repulsion Effect
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Push particles slightly away
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;
        }
      }
      
      // 3. Screen Bounds wrapping
      const padding = 15;
      if (p.x < -padding) p.x = this.canvas.width + padding;
      if (p.x > this.canvas.width + padding) p.x = -padding;
      
      if (this.theme === 'gamer') {
        // Spark rises and fades out at top, respawns at bottom
        if (p.y < -padding) {
          Object.assign(p, this.createParticle(false));
          p.y = this.canvas.height + padding;
        }
      } else {
        if (p.y < -padding) p.y = this.canvas.height + padding;
        if (p.y > this.canvas.height + padding) p.y = -padding;
      }
      
      // 4. Glow/Pulse Alpha
      p.alpha += p.pulseSpeed * p.pulseDir;
      if (p.alpha > 0.85 || p.alpha < 0.25) p.pulseDir *= -1;
      
      // 5. Draw Particle Circle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.shadowBlur = this.theme === 'gamer' ? 8 : 4;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      
      // 6. Draw Tech connection webs
      if (currentConf.connect) {
        for (let j = idx + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < currentConf.connectDist) {
            const lineAlpha = (1 - (dist / currentConf.connectDist)) * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = currentConf.color;
            this.ctx.globalAlpha = lineAlpha;
            this.ctx.lineWidth = 0.8;
            this.ctx.shadowBlur = 0; // Prevent performance hit on drawing lines
            this.ctx.stroke();
          }
        }
      }
    });
    
    // Reset global styles for next frame
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialise on load
window.addEventListener('DOMContentLoaded', () => {
  window.bgParticleEngine = new ParticleEngine();
});
