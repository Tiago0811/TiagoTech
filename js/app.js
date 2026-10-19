/* ==========================================================================
   ⚙️ TIAGOTECH CORE APPLICATION CONTROLLER (APP.JS)
   100% Focused on Business Software, Sistemas a Medida & AI Assistant
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // ==================== 🏹 TIAGOTECH ARROW CURSOR CONTROLLER (OPCIÓN 1) ====================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing) {
    // Limpiar estilos inline remanentes para que las transiciones CSS tengan prioridad total
    cursorRing.style.width = '';
    cursorRing.style.height = '';
    cursorRing.style.borderRadius = '';

    // Inyectar el SVG de la flecha tecnológica con los colores de marca de TiagoTech
    cursorDot.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tiagoArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0084FF" />
            <stop offset="60%" stop-color="#0ea5e9" />
            <stop offset="100%" stop-color="#22C55E" />
          </linearGradient>
          <filter id="tiagoArrowGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2.5" flood-color="#0084FF" flood-opacity="0.6"/>
          </filter>
        </defs>
        <path d="M2 2L8.5 22.5L12.5 13.5L21.5 9.5L2 2Z" fill="url(#tiagoArrowGrad)" stroke="#FFFFFF" stroke-width="1.3" stroke-linejoin="round" filter="url(#tiagoArrowGlow)"/>
        <circle cx="12.5" cy="13.5" r="1.8" fill="#FFFFFF"/>
      </svg>
    `;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isInitialized = false;

    // Seguimiento 1:1 inmediato en tiempo real (cero retraso en la punta de la flecha)
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isInitialized) {
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.4';
        isInitialized = true;
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Seguimiento suave de la retícula orbital HUD (60/120 FPS lerp)
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(animateRing);
    })();

    // Elementos interactivos que activan la retícula HUD "Target Locked"
    const TARGETS = 'a, button, .btn, .btn-whatsapp, .chatbot-bubble, .chatbot-system-row, .chatbot-back-btn, .mobile-menu-btn, .glass-card, .system-card, .faq-item summary, .step-option-btn, .chip, input, select, textarea';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(TARGETS)) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    });

    // Feedback táctil instantáneo al hacer clic (efecto recoil)
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

    // Gestión de entrada y salida de la ventana
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.4';
    });
  }

  // ==================== 🍔 MOBILE MENU INTERACTIVITY ====================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavMenu = document.getElementById('mobile-nav-menu');

  window.toggleMobileMenu = function() {
    if (mobileNavMenu) {
      mobileNavMenu.classList.toggle('active');
      if (mobileMenuBtn) {
        mobileMenuBtn.classList.toggle('active');
      }
      document.body.style.overflow = mobileNavMenu.classList.contains('active') ? 'hidden' : '';
    }
  };

  if (mobileMenuBtn && mobileNavMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.toggleMobileMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (mobileNavMenu.classList.contains('active') && !mobileNavMenu.contains(e.target) && e.target !== mobileMenuBtn) {
        window.toggleMobileMenu();
      }
    });
  }

  // ==================== 🎛️ SMART CATALOG AUTO-FILL ====================
  const selectDropdown = document.getElementById('form-service');
  document.querySelectorAll('a[href^="#contacto"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.system-card');
      if (card && selectDropdown) {
        const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
        if (title.includes('personalizado') || title.includes('medida')) selectDropdown.value = 'custom';
        else if (title.includes('pos')) selectDropdown.value = 'pos';
        else if (title.includes('menú') || title.includes('menu')) selectDropdown.value = 'menu_qr';
        else if (title.includes('cita')) selectDropdown.value = 'citas';
        else if (title.includes('facturador') || title.includes('cotizador')) selectDropdown.value = 'cotizador';
        else if (title.includes('gimnasio') || title.includes('gym')) selectDropdown.value = 'gym';
        else if (title.includes('dashboard')) selectDropdown.value = 'dashboard';
        else if (title.includes('e-commerce') || title.includes('tienda')) selectDropdown.value = 'ecommerce';
      }
    });
  });

  // ==================== 📨 WEB3FORMS AJAX SUBMISSION & SUCCESS FLOW ====================
  const contactForm = document.getElementById('contact-form');
  const contactSuccessCard = document.getElementById('contact-form-success');
  const formSuccessWaBtn = document.getElementById('form-success-wa-btn');
  const formResetBtn = document.getElementById('form-reset-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Enviar';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando requerimientos...';
      }

      const formData = new FormData(contactForm);
      const jsonObject = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(jsonObject)
        });

        const result = await response.json();

        if (response.status === 200) {
          // Personalizar botón de WhatsApp de seguimiento
          const clientName = (jsonObject.name || '').trim();
          const serviceSelect = contactForm.querySelector('select[name="service"]');
          const serviceName = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : 'un sistema';

          if (formSuccessWaBtn) {
            const waText = encodeURIComponent(`¡Hola Tiago! Acabo de enviar el formulario web sobre ${serviceName}. Mi nombre o negocio es "${clientName}". Me gustaría consultar detalles y disponibilidad.`);
            formSuccessWaBtn.href = `https://wa.me/584247046941?text=${waText}`;
          }

          // Transición elegante en pantalla
          contactForm.style.display = 'none';
          if (contactSuccessCard) {
            contactSuccessCard.style.display = 'block';
            contactSuccessCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          contactForm.reset();
        } else {
          alert('⚠️ Ocurrió un inconveniente al enviar: ' + (result.message || 'Inténtalo más tarde o escríbenos por WhatsApp.'));
        }
      } catch (err) {
        console.error('Error al enviar formulario:', err);
        alert('⚠️ Error de conexión. Si lo prefieres, contáctanos directamente a nuestro WhatsApp oficial (+58 424-7046941).');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      }
    });

    if (formResetBtn && contactSuccessCard) {
      formResetBtn.addEventListener('click', () => {
        contactSuccessCard.style.display = 'none';
        contactForm.style.display = 'block';
      });
    }
  }

  // ==================== 🤖 TIAGOTECH AI CHATBOT ENGINE ====================
  const chatbotBubble = document.getElementById('chatbot-bubble');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotReset = document.getElementById('chatbot-reset-btn');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotTyping = document.getElementById('chatbot-typing');
  const chatbotPrompts = document.getElementById('chatbot-prompts');

  const KNOWLEDGE_BASE = {
    custom: {
      title: "💻 Software & Sistemas Web 100% a la Medida (Personalizado)",
      text: "¡El servicio más solicitado y de mayor impacto de TiagoTech! Desarrollamos cualquier solución web o software creada desde cero para adaptarse a los flujos únicos de tu empresa.\n\n" +
            "✨ **¿Cómo trabajamos tu proyecto?**\n" +
            "• **Levantamiento 1 a 1:** Analizamos cómo opera tu negocio y qué procesos deseas automatizar.\n" +
            "• **Diseño & Desarrollo Exclusivo:** Construimos tu sistema a prueba de errores para ti y tus empleados.\n" +
            "• **Base de Datos Privada:** 100% de tu propiedad, sin comisiones ni intermediarios.\n" +
            "• **Entrega con Instalación y Capacitación:** Todo listo y operativo en tu red o en la nube.\n\n" +
            "💼 **Cotización:** Presupuestos justos y accesibles adaptados a la magnitud de tu proyecto.\n" +
            "👉 Escríbeme a WhatsApp para contarnos tu idea y recibir asesoría inicial sin costo."
    },
    pos: {
      title: "🛒 TiagoTech POS & Control de Inventario",
      text: "El sistema definitivo para puntos de venta locales (tiendas de ropa, mini-markets, cafeterías, boutiques y reposterías).\n\n" +
            "✨ **Características principales:**\n" +
            "• Facturación y emisión de recibos ágiles en mostrador.\n" +
            "• Control de stock con alertas automáticas de agotamiento.\n" +
            "• Arqueo y cierre diario de caja (efectivo, Pago Móvil, divisas, transferencias).\n" +
            "• Módulo de apartados y cuentas por cobrar.\n\n" +
            "💼 **Planes y Cotización:** Adaptados a las necesidades y tamaño de tu comercio.\n" +
            "👉 Puedes probar la demo interactiva o solicitar instalación guiada 1 a 1 por WhatsApp."
    },
    menu_qr: {
      title: "🍽️ Menú Digital QR + WhatsApp",
      text: "Carta interactiva de alta velocidad para restaurantes, pizzerías, cafeterías y food trucks.\n\n" +
            "✨ **Características:**\n" +
            "• Cero descargas de apps: tus comensales escanean el código QR en la mesa y abren el menú al instante.\n" +
            "• Fotos en alta resolución, descripciones y platos actualizables en segundos.\n" +
            "• Carrito express que genera el pedido ordenado y lo envía directo al WhatsApp de tu cocina o delivery.\n" +
            "• Cero comisiones por pedido: el 100% de la venta es tuyo.\n\n" +
            "💼 **Planes y Cotización:** Tarifa accesible adaptada a tu local o restaurante."
    },
    citas: {
      title: "✂️ TiagoTech Citas & Agenda Web",
      text: "Plataforma de auto-reserva 24/7 en piloto automático para barberías, peluquerías, salones de belleza y spas.\n\n" +
            "✨ **Características:**\n" +
            "• Selección de barbero / estilista / especialista preferido.\n" +
            "• Calendario interactivo con horarios libres en tiempo real (evita cruces y huecos vacíos).\n" +
            "• Envío automático de confirmación y recordatorio directo al WhatsApp del cliente.\n" +
            "• Panel administrativo para ver la agenda del día desde cualquier celular.\n\n" +
            "💼 **Planes y Cotización:** Planes a tu medida según la cantidad de especialistas o sillones."
    },
    cotizador: {
      title: "📄 Facturador & Cotizador Express PDF",
      text: "Herramienta ágil para talleres, técnicos, consultores, carpinterías y profesionales independientes.\n\n" +
            "✨ **Características:**\n" +
            "• Genera cotizaciones, presupuestos y notas de entrega ejecutivas en PDF en menos de 60 segundos.\n" +
            "• Personalizado con el logo y datos de tu empresa.\n" +
            "• Cálculo automático de IVA, descuentos y subtotales en Bs y Divisas.\n" +
            "• Botón de compartir PDF directo a WhatsApp o correo del cliente.\n\n" +
            "💼 **Planes y Cotización:** Licencia o suscripción flexible según tus requerimientos."
    },
    gym: {
      title: "🏋️ Control de Membresías & Gimnasios",
      text: "Sistema de recepción y socios para gimnasios, dojos de artes marciales, academias de baile y crossfit.\n\n" +
            "✨ **Características:**\n" +
            "• Búsqueda y control de acceso en puerta por cédula o escaneo de código QR.\n" +
            "• Semáforo visual de estado de cuenta: Verde (Al día) / Rojo (Vencido).\n" +
            "• Notificación automática de cobro y recordatorio de vencimiento vía WhatsApp al socio.\n" +
            "• Reporte financiero mensual de socios activos e ingresos totales.\n\n" +
            "💼 **Planes y Cotización:** Adaptado al volumen de socios y sedes de tu gimnasio."
    },
    dashboard: {
      title: "📊 Dashboards & Reportes Analíticos",
      text: "Transforma tus registros de Excel, CSV o bases de datos en paneles ejecutivos en tiempo real.\n\n" +
            "✨ **Características:**\n" +
            "• Gráficos dinámicos e interactivos (ventas por día, productos más rentables, evolución de gastos).\n" +
            "• Exportación de balances a PDF con un solo clic.\n" +
            "• Privacidad total y arquitectura ligera sin depender de servidores pesados.\n\n" +
            "💼 **Planes y Cotización:** Ajustado al volumen de datos y métricas requeridas."
    },
    ecommerce: {
      title: "🌐 E-Commerce & Tienda Online",
      text: "Portales de comercio electrónico ultra-rápidos para vender tus productos en toda la región.\n\n" +
            "✨ **Características:**\n" +
            "• Catálogo interactivo con filtros por categoría y búsqueda instantánea.\n" +
            "• Carrito de compras con checkout express conectado a WhatsApp o pasarela de pagos.\n" +
            "• Panel de control para cargar nuevos productos y fotos desde tu celular.\n" +
            "• 0% comisiones por transacción.\n\n" +
            "💼 **Planes y Cotización:** Cotización personalizada según catálogo y módulos requeridos."
    },
    pagos: {
      title: "💳 Métodos de Pago Disponibles",
      text: "Para la contratación de cualquiera de los sistemas, aceptamos:\n\n" +
            "1. 🇻🇪 **Pago Móvil (Bs)**: A tasa oficial del día.\n" +
            "2. 🟡 **Binance Pay / USDT**: Pagos instantáneos sin comisiones vía criptoactivos estables.\n" +
            "3. 🏦 **Transferencia Bancaria Nacional**: Cuentas bancarias venezolanas disponibles.\n\n" +
            "La activación y configuración de tu sistema se inicia inmediatamente tras la confirmación del pago."
    },
    garantias: {
      title: "🛡️ Garantías y Soporte TiagoTech",
      text: "Todos los servicios y licencias de TiagoTech incluyen:\n\n" +
            "• 🛠️ **Instalación Guiada 1 a 1**: Conexión remota vía AnyDesk o despliegue en la nube para dejar el sistema listo.\n" +
            "• 🎓 **Capacitación Incluida**: Te enseñamos paso a paso a ti y a tus empleados a operar el software.\n" +
            "• ⚡ **Sin Comisiones por Venta**: Todo lo que factures en tu negocio es 100% tuyo.\n" +
            "• 💬 **Soporte Directo por WhatsApp**: Canal prioritario directo con el desarrollador (+58 424-7046941)."
    }
  };

  function getSystemsMenuHtml() {
    return `
      <div class="chatbot-systems-menu">
        <div class="chatbot-menu-header">📋 Sistemas disponibles (toca uno para ver detalles):</div>
        <div class="chatbot-systems-vertical-list">
          <button type="button" class="chatbot-system-row chatbot-sys-featured" data-key="custom" style="border-color: rgba(0, 132, 255, 0.45); background: linear-gradient(135deg, rgba(0, 132, 255, 0.12) 0%, rgba(34, 197, 94, 0.08) 100%);">
            <span class="chatbot-sys-icon">⭐</span>
            <span class="chatbot-sys-info">
              <strong style="color: #38BDF8;">Software & Sistema a la Medida</strong>
              <small style="color: #4ADE80; font-weight: 600;">🔥 EL MÁS POPULAR // 100% Personalizado</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="pos">
            <span class="chatbot-sys-icon">🛒</span>
            <span class="chatbot-sys-info">
              <strong>POS & Control de Stock</strong>
              <small>Caja, inventario y facturación ágil</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="menu_qr">
            <span class="chatbot-sys-icon">🍽️</span>
            <span class="chatbot-sys-info">
              <strong>Menú Digital QR + WhatsApp</strong>
              <small>Restaurantes y delivery sin comisiones</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="citas">
            <span class="chatbot-sys-icon">✂️</span>
            <span class="chatbot-sys-info">
              <strong>Citas & Agenda Web 24/7</strong>
              <small>Barberías, salones y spas</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="cotizador">
            <span class="chatbot-sys-icon">📄</span>
            <span class="chatbot-sys-info">
              <strong>Facturador & Cotizador PDF</strong>
              <small>Presupuestos y notas express en 60s</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="gym">
            <span class="chatbot-sys-icon">🏋️</span>
            <span class="chatbot-sys-info">
              <strong>Control Gym & Membresías</strong>
              <small>Acceso en puerta y control de socios</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="ecommerce">
            <span class="chatbot-sys-icon">🌐</span>
            <span class="chatbot-sys-info">
              <strong>E-Commerce & Tienda Online</strong>
              <small>Catálogo y pedidos directo a WhatsApp</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="dashboard">
            <span class="chatbot-sys-icon">📊</span>
            <span class="chatbot-sys-info">
              <strong>Dashboards & Reportes Analíticos</strong>
              <small>Gráficos y métricas clave en tiempo real</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row" data-key="pagos">
            <span class="chatbot-sys-icon">💳</span>
            <span class="chatbot-sys-info">
              <strong>Métodos de Pago Disponibles</strong>
              <small>Pago Móvil, Binance USDT, Transferencias</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>

          <button type="button" class="chatbot-system-row chatbot-sys-whatsapp" data-key="whatsapp">
            <span class="chatbot-sys-icon"><img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon" style="width:16px;height:16px;"></span>
            <span class="chatbot-sys-info">
              <strong>Hablar con Tiago en WhatsApp</strong>
              <small>Asesoría personalizada directa</small>
            </span>
            <span class="chatbot-sys-arrow">›</span>
          </button>
        </div>
      </div>
    `;
  }

  function formatSystemResponse(item) {
    const waText = encodeURIComponent(`¡Hola Tiago! Me interesa cotizar y conocer más detalles sobre ${item.title}.`);
    const waUrl = `https://wa.me/584247046941?text=${waText}`;

    let bodyHtml = item.text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/• /g, '&bull; ');

    return `
      <div style="font-weight:700; font-size:13px; color:var(--accent-primary); margin-bottom:8px;">${item.title}</div>
      <div style="color:#e2e8f0; font-size:12px; line-height:1.5;">${bodyHtml}</div>
      <div style="display:flex; flex-direction:column; gap:7px; margin-top:12px;">
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; padding:8px 12px; font-size:11.5px; width:100%; box-sizing:border-box;">
          <img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Cotizar en WhatsApp (+58 424-7046941)
        </a>
        <button type="button" class="chatbot-back-btn">📋 Ver lista de otros sistemas</button>
      </div>
    `;
  }

  function attachMenuClickHandlers() {
    if (!chatbotMessages) return;

    chatbotMessages.querySelectorAll('.chatbot-system-row:not([data-bound])').forEach(btn => {
      btn.setAttribute('data-bound', 'true');
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const strong = btn.querySelector('strong');
        const label = strong ? strong.innerText : key;
        handleUserQuery(label, key);
      });
    });

    chatbotMessages.querySelectorAll('.chatbot-back-btn:not([data-bound])').forEach(btn => {
      btn.setAttribute('data-bound', 'true');
      btn.addEventListener('click', () => {
        appendMessage('user', 'Ver lista de sistemas');
        showTyping(() => {
          appendMessage('bot', getSystemsMenuHtml(), true);
        }, 350);
      });
    });
  }

  function appendMessage(sender, text, isHtml = false, autoScroll = true) {
    if (!chatbotMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-msg chatbot-msg-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-msg-content';

    if (isHtml) {
      contentDiv.innerHTML = text;
    } else {
      let formatted = text
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/• /g, '&bull; ');
      contentDiv.innerHTML = formatted;
    }

    msgDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(msgDiv);
    if (autoScroll) {
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    attachMenuClickHandlers();
  }

  function showTyping(callback, delay = 600) {
    if (chatbotTyping) chatbotTyping.style.display = 'flex';
    if (chatbotMessages) chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    setTimeout(() => {
      if (chatbotTyping) chatbotTyping.style.display = 'none';
      callback();
    }, delay);
  }

  function handleUserQuery(userText, directKey = null) {
    appendMessage('user', userText);

    showTyping(() => {
      if (directKey && KNOWLEDGE_BASE[directKey]) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE[directKey]), true);
        return;
      }

      if (directKey === 'whatsapp') {
        const html = `¿Quieres atención inmediata con Tiago para revisar o cotizar tu proyecto?<br><br>` +
          `<a href="https://wa.me/584247046941?text=%C2%A1Hola%20Tiago!%20Vengo%20del%20asistente%20web%20y%20quiero%20cotizar%20un%20sistema." target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; padding:8px 12px; font-size:11.5px; width:100%; box-sizing:border-box;">` +
          `<img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Abrir Chat en WhatsApp (+58 424-7046941)</a>` +
          `<button type="button" class="chatbot-back-btn" style="margin-top:8px;">📋 Ver lista de otros sistemas</button>`;
        appendMessage('bot', html, true);
        return;
      }

      // Keyword matching NLP
      const clean = userText.toLowerCase();

      if (clean.includes('personaliz') || clean.includes('a la medida') || clean.includes('medida') || clean.includes('custom') || clean.includes('software a medida') || clean.includes('sistema a la medida') || clean.includes('crear sistema') || clean.includes('programar') || clean.includes('desarrollo') || clean.includes('popular')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.custom), true);
      } else if (clean.includes('pos') || clean.includes('inventario') || clean.includes('stock') || clean.includes('caja') || clean.includes('factura')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.pos), true);
      } else if (clean.includes('menú') || clean.includes('menu') || clean.includes('restaurante') || clean.includes('comida') || clean.includes('qr')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.menu_qr), true);
      } else if (clean.includes('cita') || clean.includes('agenda') || clean.includes('barber') || clean.includes('peluquer') || clean.includes('spa')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.citas), true);
      } else if (clean.includes('cotiz') || clean.includes('presupuesto') || clean.includes('recibo') || clean.includes('pdf')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.cotizador), true);
      } else if (clean.includes('gym') || clean.includes('gimnasio') || clean.includes('socio') || clean.includes('membres')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.gym), true);
      } else if (clean.includes('dash') || clean.includes('reporte') || clean.includes('excel') || clean.includes('analit')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.dashboard), true);
      } else if (clean.includes('e-commerce') || clean.includes('ecommerce') || clean.includes('tienda') || clean.includes('carrito') || clean.includes('online')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.ecommerce), true);
      } else if (clean.includes('pago') || clean.includes('binance') || clean.includes('usdt') || clean.includes('transferencia') || clean.includes('dolar') || clean.includes('bolivar')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.pagos), true);
      } else if (clean.includes('garant') || clean.includes('soporte') || clean.includes('capacit') || clean.includes('instal')) {
        appendMessage('bot', formatSystemResponse(KNOWLEDGE_BASE.garantias), true);
      } else if (clean.includes('sistema') || clean.includes('lista') || clean.includes('opciones')) {
        appendMessage('bot', getSystemsMenuHtml(), true);
      } else if (clean.includes('precio') || clean.includes('costo') || clean.includes('cuanto vale') || clean.includes('plan')) {
        const html = `<strong>📋 Planes y Cotización TiagoTech:</strong><br><br>` +
          `Todos nuestros sistemas se cotizan de forma personalizada y accesible según las características y necesidades de tu negocio, sin tarifas ocultas ni comisiones por venta.<br><br>` +
          `Todos incluyen soporte prioritario vía WhatsApp, hosting seguro y capacitación completa.<br><br>` +
          `<div style="display:flex; flex-direction:column; gap:7px;">` +
            `<a href="https://wa.me/584247046941?text=%C2%A1Hola%20Tiago!%20Quiero%20una%20cotizaci%C3%B3n%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; padding:8px 12px; font-size:11.5px; width:100%; box-sizing:border-box;">` +
              `<img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Solicitar Cotización en WhatsApp</a>` +
            `<button type="button" class="chatbot-back-btn">📋 Ver lista de sistemas</button>` +
          `</div>`;
        appendMessage('bot', html, true);
      } else if (clean.includes('hola') || clean.includes('buenas') || clean.includes('saludos') || clean.includes('que tal')) {
        const html = `¡Hola! 👋 Es un placer saludarte. Soy el asistente virtual inteligente de <strong>TiagoTech</strong>.<br><br>` +
          getSystemsMenuHtml();
        appendMessage('bot', html, true);
      } else if (clean.includes('whatsapp') || clean.includes('contacto') || clean.includes('telefono') || clean.includes('tiago')) {
        const html = `Puedes hablar directamente con Tiago en WhatsApp para una asesoría personalizada:<br><br>` +
          `<a href="https://wa.me/584247046941?text=%C2%A1Hola%20Tiago!%20Quiero%20asesor%C3%ADa%20personalizada%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; padding:8px 12px; font-size:11.5px; width:100%; box-sizing:border-box;">` +
          `<img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Abrir WhatsApp (+58 424-7046941)</a>` +
          `<button type="button" class="chatbot-back-btn" style="margin-top:8px;">📋 Ver lista de otros sistemas</button>`;
        appendMessage('bot', html, true);
      } else {
        const html = `Entendido. Para darte la mejor recomendación y cotización exacta para tu caso específico, puedes hablar directamente con Tiago en WhatsApp o elegir uno de nuestros sistemas:<br><br>` +
          `<div style="display:flex; flex-direction:column; gap:7px;">` +
            `<a href="https://wa.me/584247046941?text=%C2%A1Hola%20Tiago!%20Quiero%20asesor%C3%ADa%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; justify-content:center; gap:6px; text-decoration:none; padding:8px 12px; font-size:11.5px; width:100%; box-sizing:border-box;">` +
              `<img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Escribir a Tiago en WhatsApp</a>` +
            `<button type="button" class="chatbot-back-btn">📋 Ver lista de sistemas</button>` +
          `</div>`;
        appendMessage('bot', html, true);
      }
    });
  }

  function initChatbot() {
    if (!chatbotMessages) return;
    chatbotMessages.innerHTML = '';
    if (chatbotPrompts) chatbotPrompts.innerHTML = '';

    const welcomeHtml = `
      <div style="margin-bottom: 6px;">
        ¡Hola! 👋 Bienvenido a <strong style="color: #FFFFFF;">Tiago<span style="color: var(--accent-secondary);">Tech</span></strong>.<br><br>
        Soy tu consultor de software especializado. Te presento nuestros sistemas a medida desarrollados para impulsar tu negocio:
      </div>` +
      getSystemsMenuHtml();

    // autoScroll = false para que el usuario empiece arriba viendo el mensaje de saludo
    appendMessage('bot', welcomeHtml, true, false);

    chatbotMessages.scrollTop = 0;
    setTimeout(() => {
      if (chatbotMessages) chatbotMessages.scrollTop = 0;
    }, 50);
  }

  if (chatbotBubble && chatbotWindow) {
    chatbotBubble.addEventListener('click', () => {
      chatbotWindow.classList.toggle('active');
      if (chatbotWindow.classList.contains('active')) {
        if (chatbotMessages && chatbotMessages.children.length === 0) {
          initChatbot();
        } else if (chatbotMessages && chatbotMessages.children.length === 1) {
          chatbotMessages.scrollTop = 0;
          setTimeout(() => {
            if (chatbotMessages) chatbotMessages.scrollTop = 0;
          }, 50);
        }
      }
    });

    if (chatbotClose) {
      chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
      });
    }

    if (chatbotReset) {
      chatbotReset.addEventListener('click', () => {
        initChatbot();
      });
    }

    if (chatbotForm && chatbotInput) {
      chatbotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatbotInput.value.trim();
        if (text) {
          handleUserQuery(text);
          chatbotInput.value = '';
        }
      });
    }
  }

  // ==========================================
  // 💬 WIDGET FLOTANTE DE WHATSAPP CON POPUP
  // ==========================================
  const waPopup = document.getElementById('wa-popup');
  const waPopupClose = document.getElementById('wa-popup-close');
  let waAutoCloseTimer = null;

  if (waPopup) {
    // Show popup after 3 seconds only if not dismissed before
    const isDismissed = sessionStorage.getItem('wa_popup_dismissed');

    if (!isDismissed) {
      setTimeout(() => {
        waPopup.classList.add('active');

        // Auto-close after 6 seconds so it NEVER blocks client reading
        waAutoCloseTimer = setTimeout(() => {
          waPopup.classList.remove('active');
        }, 6000);
      }, 3000);

      // Hide immediately as soon as the user starts scrolling to read
      let scrolled = false;
      window.addEventListener('scroll', () => {
        if (!scrolled && waPopup.classList.contains('active')) {
          scrolled = true;
          waPopup.classList.remove('active');
          if (waAutoCloseTimer) clearTimeout(waAutoCloseTimer);
        }
      }, { passive: true });

      // Pause auto-close if the user hovers over the popup
      waPopup.addEventListener('mouseenter', () => {
        if (waAutoCloseTimer) clearTimeout(waAutoCloseTimer);
      });

      // Resume auto-close if user leaves the popup
      waPopup.addEventListener('mouseleave', () => {
        waAutoCloseTimer = setTimeout(() => {
          waPopup.classList.remove('active');
        }, 2000);
      });
    }

    if (waPopupClose) {
      waPopupClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        waPopup.classList.remove('active');
        sessionStorage.setItem('wa_popup_dismissed', 'true');
        if (waAutoCloseTimer) clearTimeout(waAutoCloseTimer);
      });
    }
  }

  // ==========================================
  // ❓ FAQ ACORDEÓN INTERACTIVO
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(other => other.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // ==========================================
  // 🧭 ASESOR INTERACTIVO EN 3 PASOS (WIZARD)
  // ==========================================
  const wizardStep1 = document.getElementById('wizard-step-1');
  const wizardStep2 = document.getElementById('wizard-step-2');
  const wizardStep3 = document.getElementById('wizard-step-3');
  const node1 = document.getElementById('wizard-node-1');
  const node2 = document.getElementById('wizard-node-2');
  const node3 = document.getElementById('wizard-node-3');
  const goalsGrid = document.getElementById('wizard-goals-grid');
  const backBtn = document.getElementById('wizard-back-btn');
  const resultBox = document.getElementById('wizard-result-box');

  let selectedBusiness = null;
  let selectedBusinessLabel = '';

  const BUSINESS_GOALS = {
    custom: [
      { goal: 'custom_full', title: 'Crear un software desde cero para mi empresa', desc: 'Reglas de negocio propias, bases de datos exclusivas y automatización integral.', system: 'Software & Sistemas Web Personalizados (A la Medida)', icon: '⭐', url: 'sistema-personalizado.html' },
      { goal: 'custom_rubro', title: 'Digitalizar clínica, distribuidora, logística o colegio', desc: 'Sistemas especializados para sectores específicos que no resuelven apps genéricas.', system: 'Software & Sistemas Web Personalizados (A la Medida)', icon: '💻', url: 'sistema-personalizado.html' },
      { goal: 'custom_portal', title: 'Portal web exclusivo para clientes y personal', desc: 'Panel privado con accesos por rol, reportes avanzados y sincronización en la nube.', system: 'Software & Sistemas Web Personalizados (A la Medida)', icon: '🌐', url: 'sistema-personalizado.html' }
    ],
    comercio: [
      { goal: 'pos', title: 'Cobrar rápido y controlar inventario', desc: 'Registrar ventas de mostrador, arqueos de caja y alertas de stock bajo.', system: 'TiagoTech POS & Inventario', icon: '🛒', url: 'sistema-pos.html' },
      { goal: 'online', title: 'Vender por internet las 24 horas', desc: 'Catálogo web propio con carrito de compra y pagos automatizados.', system: 'E-Commerce & Tienda Online', icon: '🌐', url: 'sistema-ecommerce.html' },
      { goal: 'facturas', title: 'Emitir presupuestos formales', desc: 'Cotizaciones en PDF con logo y datos bancarios para clientes mayoristas.', system: 'Facturador & Cotizador Express PDF', icon: '📄', url: 'sistema-cotizador.html' }
    ],
    gastronomia: [
      { goal: 'menu_qr', title: 'Carta interactiva con pedidos a WhatsApp', desc: 'Clientes escanean el QR en la mesa y envían el pedido directo a tu cocina.', system: 'Menú Digital QR + WhatsApp', icon: '🍽️', url: 'sistema-menu-qr.html' },
      { goal: 'pos_food', title: 'Punto de venta y caja rápida', desc: 'Cobrar mesas, tickets de consumo y control de stock de insumos.', system: 'TiagoTech POS & Inventario', icon: '🛒', url: 'sistema-pos.html' },
      { goal: 'analytics_food', title: 'Controlar costos, mermas y ganancias', desc: 'Dashboards con gráficos de ventas semanales y balance mensual.', system: 'Dashboards & Analytics', icon: '📊', url: 'sistema-dashboard.html' }
    ],
    citas: [
      { goal: 'agenda', title: 'Agendamiento online de turnos', desc: 'Clientes eligen especialista, servicio y hora sin llamadas ni desorden.', system: 'Sistema de Citas & Agenda Online', icon: '📅', url: 'sistema-citas.html' },
      { goal: 'caja_citas', title: 'Cobro de servicios y comisiones', desc: 'Llevar la cuenta de lo que produjo cada barbero, estilista o doctor.', system: 'TiagoTech POS & Inventario', icon: '🛒', url: 'sistema-pos.html' }
    ],
    servicios: [
      { goal: 'cotizador', title: 'Cotizaciones en PDF en 60 segundos', desc: 'Presupuestos ejecutivos con membrete listos para enviar por WhatsApp al cliente.', system: 'Facturador & Cotizador Express PDF', icon: '📄', url: 'sistema-cotizador.html' },
      { goal: 'dash_servicios', title: 'Control de proyectos y cobranzas', desc: 'Saber exactamente cuánto dinero tienes por cobrar de trabajos pendientes.', system: 'Dashboards & Analytics', icon: '📊', url: 'sistema-dashboard.html' }
    ],
    fitness: [
      { goal: 'gym', title: 'Control de accesos y mensualidades', desc: 'Saber quién pagó y avisar por WhatsApp cuando la cuota está por vencer.', system: 'Control de Membresías & Gimnasios', icon: '🏋️', url: 'sistema-gym.html' },
      { goal: 'citas_fit', title: 'Reserva de clases y cupos limitados', desc: 'Gestionar horarios de spinning, yoga, crossfit o artes marciales.', system: 'Sistema de Citas & Agenda Online', icon: '📅', url: 'sistema-citas.html' }
    ],
    ecommerce: [
      { goal: 'store', title: 'Tienda virtual rápida con catálogo propio', desc: 'Vende sin comisiones de terceros con pasarelas de pago listas.', system: 'E-Commerce & Tienda Online', icon: '🌐', url: 'sistema-ecommerce.html' },
      { goal: 'dash_ecom', title: 'Métricas de pedidos y conversión', desc: 'Gráficos de ventas diarias, clientes recurrentes y productos estrella.', system: 'Dashboards & Analytics', icon: '📊', url: 'sistema-dashboard.html' }
    ]
  };

  const choiceBtns = document.querySelectorAll('#wizard-step-1 .wizard-choice-btn');
  choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBusiness = btn.getAttribute('data-business');
      selectedBusinessLabel = btn.getAttribute('data-label');

      choiceBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      renderWizardStep2();
    });
  });

  function renderWizardStep2() {
    if (!goalsGrid || !selectedBusiness) return;
    const goals = BUSINESS_GOALS[selectedBusiness] || BUSINESS_GOALS.comercio;

    goalsGrid.innerHTML = goals.map(item => `
      <button type="button" class="wizard-choice-btn" data-system="${item.system}" data-url="${item.url}" data-title="${item.title}">
        <span class="wizard-choice-icon">${item.icon}</span>
        <span class="wizard-choice-title">${item.title}</span>
        <span class="wizard-choice-desc">${item.desc}</span>
      </button>
    `).join('');

    goalsGrid.querySelectorAll('.wizard-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const systemName = btn.getAttribute('data-system');
        const systemUrl = btn.getAttribute('data-url');
        const goalTitle = btn.getAttribute('data-title');
        renderWizardStep3(systemName, systemUrl, goalTitle);
      });
    });

    wizardStep1.classList.remove('active');
    wizardStep2.classList.add('active');
    node1.classList.add('done');
    node2.classList.add('active');
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      wizardStep2.classList.remove('active');
      wizardStep1.classList.add('active');
      node2.classList.remove('active');
      node1.classList.remove('done');
      node1.classList.add('active');
    });
  }

  function renderWizardStep3(systemName, systemUrl, goalTitle) {
    if (!resultBox) return;

    const waText = encodeURIComponent(`¡Hola Tiago! Hice el asesor express en tu web:\n• Mi tipo de negocio: ${selectedBusinessLabel}\n• Mi objetivo principal: ${goalTitle}\n• Sistema recomendado: ${systemName}\n\nMe gustaría cotizar la instalación y ver una demostración para mi local...`);
    const waLink = `https://wa.me/584247046941?text=${waText}`;

    resultBox.innerHTML = `
      <div style="display: inline-block; background: rgba(39, 201, 63, 0.15); border: 1px solid #27C93F; color: #27C93F; font-size: 11px; font-weight: 800; font-family: var(--font-code); padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;">
        🎯 SISTEMA 100% RECOMENDADO PARA TI
      </div>
      <h3 style="font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px; font-family: var(--font-accent);">
        ${systemName}
      </h3>
      <p style="color: var(--text-secondary); font-size: 14px; max-width: 600px; margin: 0 auto 18px auto; line-height: 1.6;">
        Basado en tu rubro (<strong>${selectedBusinessLabel}</strong>) y tu meta de <strong>${goalTitle.toLowerCase()}</strong>, esta es la plataforma exacta que resolverá tus tareas diarias sin complicaciones.
      </p>

      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="font-size: 15px; padding: 12px 24px;">
          <img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Cotizar e Instalar por WhatsApp
        </a>
        <a href="${systemUrl}" class="btn btn-outline" style="font-size: 14px;">
          ${systemUrl.startsWith('#') ? 'Ver en Sistemas Destacados &darr;' : 'Ver Detalles & Demo en Vivo &rarr;'}
        </a>
        <button type="button" class="btn" id="wizard-restart-btn" style="background: var(--bg-tertiary); border-color: var(--card-border); color: var(--text-muted); font-size: 13px;">
          🔄 Probar con otro rubro
        </button>
      </div>
    `;

    const restartBtn = document.getElementById('wizard-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        wizardStep3.classList.remove('active');
        wizardStep1.classList.add('active');
        node1.className = 'wizard-step-node active';
        node2.className = 'wizard-step-node';
        node3.className = 'wizard-step-node';
        selectedBusiness = null;
        choiceBtns.forEach(b => b.classList.remove('selected'));
      });
    }

    wizardStep2.classList.remove('active');
    wizardStep3.classList.add('active');
    node2.classList.remove('active');
    node2.classList.add('done');
    node3.classList.add('active');
  }

});
