/* ==========================================================================
   ⚙️ TIAGOTECH CORE APPLICATION CONTROLLER (APP.JS)
   100% Focused on Business Software, Sistemas a Medida & AI Assistant
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // ==================== 🎯 UNIVERSAL CUSTOM CURSOR CONTROLLER ====================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isInitialized = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isInitialized) {
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '0.5';
        isInitialized = true;
      }

      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    (function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(animateRing);
    })();

    // Hover state for interactive elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, .btn, .glass-card, .chip, input, textarea, select, .system-card, .news-card')) {
        document.body.classList.add('cursor-hover');
      } else {
        document.body.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '0.5';
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
        if (title.includes('pos')) selectDropdown.value = 'pos';
        else if (title.includes('menú') || title.includes('menu')) selectDropdown.value = 'menu_qr';
        else if (title.includes('cita')) selectDropdown.value = 'citas';
        else if (title.includes('facturador') || title.includes('cotizador')) selectDropdown.value = 'cotizador';
        else if (title.includes('gimnasio') || title.includes('gym')) selectDropdown.value = 'gym';
        else if (title.includes('dashboard')) selectDropdown.value = 'dashboard';
        else if (title.includes('e-commerce') || title.includes('tienda')) selectDropdown.value = 'ecommerce';
      }
    });
  });

  // ==================== 📨 WEB3FORMS AJAX SUBMISSION ====================
  const contactForm = document.getElementById('contact-form');
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
          alert('✅ ¡Requerimientos enviados exitosamente! Nos pondremos en contacto contigo a la brevedad posible.');
          contactForm.reset();
        } else {
          alert('⚠️ Ocurrió un inconveniente al enviar: ' + (result.message || 'Inténtalo más tarde o escríbenos por WhatsApp.'));
        }
      } catch (err) {
        console.error('Error al enviar formulario:', err);
        alert('⚠️ Error de conexión. Si lo prefieres, contáctanos directamente a nuestro WhatsApp oficial.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalText;
        }
      }
    });
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

  const TECH_PROMPTS = [
    { label: "🛒 POS & Stock", key: "pos" },
    { label: "🍽️ Menú QR", key: "menu_qr" },
    { label: "✂️ Citas & Agenda", key: "citas" },
    { label: "📄 Facturador PDF", key: "cotizador" },
    { label: "🏋️ Control Gym", key: "gym" },
    { label: "🌐 E-Commerce", key: "ecommerce" },
    { label: "📊 Dashboards", key: "dashboard" },
    { label: "💳 Métodos de Pago", key: "pagos" },
    { label: "💬 WhatsApp Directo", key: "whatsapp" }
  ];

  function renderPrompts() {
    if (!chatbotPrompts) return;
    chatbotPrompts.innerHTML = '';
    TECH_PROMPTS.forEach(p => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chatbot-prompt-chip';
      chip.innerText = p.label;
      chip.addEventListener('click', () => {
        handleUserQuery(p.label, p.key);
      });
      chatbotPrompts.appendChild(chip);
    });
  }

  function appendMessage(sender, text, isHtml = false) {
    if (!chatbotMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chatbot-msg chatbot-msg-${sender}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-msg-content';

    if (isHtml) {
      contentDiv.innerHTML = text;
    } else {
      // Basic markdown parser
      let formatted = text
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/• /g, '&bull; ');
      contentDiv.innerHTML = formatted;
    }

    msgDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
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
        const item = KNOWLEDGE_BASE[directKey];
        appendMessage('bot', `### ${item.title}\n\n${item.text}`);
        return;
      }

      if (directKey === 'whatsapp') {
        const html = `¿Quieres atención inmediata con Tiago para revisar tu proyecto?<br><br>` +
          `<a href="https://wa.me/584247046941?text=%C2%A1Hola%20Tiago!%20Vengo%20del%20asistente%20web%20y%20quiero%20cotizar%20un%20sistema." target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; margin-top:6px;">` +
          `<span>💬</span> Abrir Chat en WhatsApp (+58 424-7046941)</a>`;
        appendMessage('bot', html, true);
        return;
      }

      // Keyword matching NLP
      const clean = userText.toLowerCase();

      if (clean.includes('pos') || clean.includes('inventario') || clean.includes('stock') || clean.includes('caja') || clean.includes('factura')) {
        appendMessage('bot', KNOWLEDGE_BASE.pos.text);
      } else if (clean.includes('menú') || clean.includes('menu') || clean.includes('restaurante') || clean.includes('comida') || clean.includes('qr')) {
        appendMessage('bot', KNOWLEDGE_BASE.menu_qr.text);
      } else if (clean.includes('cita') || clean.includes('agenda') || clean.includes('barber') || clean.includes('peluquer') || clean.includes('spa')) {
        appendMessage('bot', KNOWLEDGE_BASE.citas.text);
      } else if (clean.includes('cotiz') || clean.includes('presupuesto') || clean.includes('recibo') || clean.includes('pdf')) {
        appendMessage('bot', KNOWLEDGE_BASE.cotizador.text);
      } else if (clean.includes('gym') || clean.includes('gimnasio') || clean.includes('socio') || clean.includes('membres')) {
        appendMessage('bot', KNOWLEDGE_BASE.gym.text);
      } else if (clean.includes('dash') || clean.includes('reporte') || clean.includes('excel') || clean.includes('analit')) {
        appendMessage('bot', KNOWLEDGE_BASE.dashboard.text);
      } else if (clean.includes('e-commerce') || clean.includes('ecommerce') || clean.includes('tienda') || clean.includes('carrito') || clean.includes('online')) {
        appendMessage('bot', KNOWLEDGE_BASE.ecommerce.text);
      } else if (clean.includes('pago') || clean.includes('binance') || clean.includes('usdt') || clean.includes('transferencia') || clean.includes('dolar') || clean.includes('bolivar')) {
        appendMessage('bot', KNOWLEDGE_BASE.pagos.text);
      } else if (clean.includes('garant') || clean.includes('soporte') || clean.includes('capacit') || clean.includes('instal')) {
        appendMessage('bot', KNOWLEDGE_BASE.garantias.text);
      } else if (clean.includes('precio') || clean.includes('costo') || clean.includes('cuanto vale') || clean.includes('plan')) {
        appendMessage('bot', "📋 **Planes y Cotización TiagoTech:**\n\n" +
          "Todos nuestros sistemas se cotizan de forma personalizada y accesible según las características y necesidades de tu negocio, sin tarifas ocultas ni comisiones por venta.\n\n" +
          "• **Menú Digital QR + WhatsApp**\n" +
          "• **Citas & Agenda Web 24/7**\n" +
          "• **Facturador & Cotizador Express PDF**\n" +
          "• **POS & Control de Inventario**\n" +
          "• **Control Gym & Membresías**\n" +
          "• **Dashboards & Métricas Analíticas**\n" +
          "• **E-Commerce & Tienda Online**\n\n" +
          "Todos incluyen soporte prioritario vía WhatsApp, hosting seguro y capacitación completa.");
      } else if (clean.includes('hola') || clean.includes('buenas') || clean.includes('saludos') || clean.includes('que tal')) {
        appendMessage('bot', "¡Hola! 👋 Es un placer saludarte. Soy el asistente virtual inteligente de **TiagoTech**.\n\n¿En qué tipo de negocio te gustaría implementar tecnología hoy? Puedes preguntarme por cualquiera de nuestros sistemas o seleccionar uno de los accesos directos abajo.");
      } else if (clean.includes('whatsapp') || clean.includes('contacto') || clean.includes('telefono') || clean.includes('tiago')) {
        const html = `Puedes hablar directamente con Tiago en WhatsApp para una asesoría personalizada:<br><br>` +
          `<a href="https://wa.me/584247046941?text=%C2%A1Hola%20Tiago!%20Quiero%20asesor%C3%ADa%20personalizada%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer" class="btn-whatsapp btn-whatsapp-sm" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">` +
          `<span>💬</span> Abrir WhatsApp (+58 424-7046941)</a>`;
        appendMessage('bot', html, true);
      } else {
        appendMessage('bot', "Entendido. Para darte la mejor recomendación técnica y cotización exacta para tu caso específico, te sugiero pulsar el botón de WhatsApp para coordinar directamente con Tiago, o selecciona uno de nuestros sistemas en las opciones rápidas.");
      }
    });
  }

  function initChatbot() {
    if (!chatbotMessages) return;
    chatbotMessages.innerHTML = '';
    renderPrompts();

    appendMessage('bot', "¡Hola! 👋 Bienvenido a **TiagoTech**.\n\nSoy tu consultor de software especializado. ¿Te gustaría conocer detalles, precios o ver una demo interactiva de alguno de nuestros 7 sistemas a medida?");
  }

  if (chatbotBubble && chatbotWindow) {
    chatbotBubble.addEventListener('click', () => {
      chatbotWindow.classList.toggle('active');
      if (chatbotWindow.classList.contains('active') && chatbotMessages && chatbotMessages.children.length === 0) {
        initChatbot();
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

  // Initialize Chatbot on load
  initChatbot();

});
