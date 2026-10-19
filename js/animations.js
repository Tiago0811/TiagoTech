/* ==========================================================================
   🎬 ADVANCED DYNAMIC TEXT EFFECTS & SCROLL REVEALS (ANIMATIONS.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // Inject scroll reveal transition styles dynamically to keep modules isolated
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                  transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }
    /* Simple cursor styling for typewriter */
    .typewriter-cursor::after {
      content: '|';
      margin-left: 2px;
      color: var(--accent-primary);
      animation: blink 0.8s steps(2) infinite;
    }
    @keyframes blink {
      0% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // ==================== 💻 INTERACTIVE TYPEWRITER EFFECT (TECH MODE) ====================
  const techTitleEl = document.getElementById('tech-typed-title');
  const techPhrases = [
    "Sistemas Web Hechos a tu Medida",
    "Soluciones para tu Local Comercial",
    "Controla tu Inventario y Ventas",
    "Sistemas Web 100% Personalizados"
  ];
  
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typewriterActive = true;
  let typingSpeed = 100;

  function runTypewriter() {
    if (!techTitleEl || !typewriterActive) return;

    const currentPhrase = techPhrases[phraseIdx];
    
    if (isDeleting) {
      // Deleting character
      techTitleEl.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 50; // Deletes faster
    } else {
      // Writing character
      techTitleEl.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 120; // Natural typing delay
    }

    // Append cursor class
    techTitleEl.classList.add('typewriter-cursor');

    // Transitions
    if (!isDeleting && charIdx === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at full phrase
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % techPhrases.length;
      typingSpeed = 500; // Pause before typing next phrase
    }

    setTimeout(runTypewriter, typingSpeed);
  }

  // Initialise typewriter
  runTypewriter();



  // ==================== 👁️ SCROLL REVEALS (INTERSECTION OBSERVER) ====================
  const revealElements = document.querySelectorAll(
    '.glass-card, .system-card, .news-card, .game-card, .setup-card, .hud-box, .console-mockup, .skill-pill'
  );

  // Mark all targets with reveal class
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Reveal only once for clean UX
      }
    });
  }, {
    threshold: 0.01, // Trigger instantly when 1% enters the screen
    rootMargin: '0px' // Clean edge triggers
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==================== ✨ 3D TILT & HOLOGRAPHIC GLARE ENGINE ====================
  function init3DTiltCards() {
    // Only run on devices supporting hover/mouse
    const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isTouch) return;

    const tiltCards = document.querySelectorAll(
      '.game-card, .download-card, .news-card, .system-card, .hud-box, .stat-card'
    );

    tiltCards.forEach(card => {
      card.classList.add('tilt-card');

      // Inject glare overlay if not present
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-glare';
        card.appendChild(glare);
      }

      let bounds = null;
      let rafId = null;

      function onMouseEnter() {
        bounds = card.getBoundingClientRect();
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color 0.3s ease';
        if (glare) glare.style.opacity = '1';
      }

      function onMouseMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const width = bounds.width;
        const height = bounds.height;

        const xPct = (mouseX / width - 0.5) * 2; // -1 to 1
        const yPct = (mouseY / height - 0.5) * 2; // -1 to 1

        const maxRotate = 8; // Max tilt degrees
        const rotX = -yPct * maxRotate;
        const rotY = xPct * maxRotate;

        const glareX = (mouseX / width) * 100;
        const glareY = (mouseY / height) * 100;

        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          const primaryAccent = '0, 132, 255';
          const secondaryAccent = '34, 197, 94';

          card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
          card.style.boxShadow = `${-rotY * 2}px ${rotX * 2}px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(${primaryAccent}, 0.25)`;

          if (glare) {
            glare.style.background = `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, rgba(255, 255, 255, 0.35) 0%, rgba(${primaryAccent}, 0.22) 30%, rgba(${secondaryAccent}, 0.12) 60%, transparent 80%)`;
          }
        });
      }

      function onMouseLeave() {
        if (rafId) cancelAnimationFrame(rafId);
        bounds = null;
        card.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.3s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.boxShadow = '';
        if (glare) {
          glare.style.opacity = '0';
        }
      }

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    });
  }

  // Initialize Tilt
  init3DTiltCards();

  // Re-run when switching identity theme so new cards get refreshed bounds
  const themeToggleEl = document.getElementById('theme-toggle');
  if (themeToggleEl) {
    themeToggleEl.addEventListener('click', () => {
      setTimeout(init3DTiltCards, 300);
    });
  }
});
