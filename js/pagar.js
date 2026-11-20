/* ==========================================================================
   💳 TIAGOTECH — PORTAL OFICIAL DE PAGOS & RECIBOS (JS/PAGAR.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    rates: null,
    methods: null,
    client: null,
    latestReceipt: null,
    selectedMonths: 1,
    selectedMethod: 'Pago Móvil',
    proofBase64: null,
    proofMime: null,
    pollingTimer: null,
    activePaymentId: null,
    activeStatusToken: null
  };

  // DOM refs
  const bcvRatePill = document.getElementById('live-bcv-rate');
  const bcvRateDate = document.getElementById('live-bcv-date');
  const lookupForm = document.getElementById('lookup-form');
  const cedulaInput = document.getElementById('cedula-input');
  const lookupBtn = document.getElementById('lookup-btn');
  const lookupError = document.getElementById('lookup-error');

  const accountSection = document.getElementById('account-section');
  const trackingSection = document.getElementById('tracking-section');

  // Account DOM refs
  const accBusiness = document.getElementById('acc-business');
  const accHolder = document.getElementById('acc-holder');
  const accCedula = document.getElementById('acc-cedula');
  const accSystem = document.getElementById('acc-system');
  const accStatusBadge = document.getElementById('acc-status-badge');
  const accMonthlyUsd = document.getElementById('acc-monthly-usd');
  const accMonthlyBs = document.getElementById('acc-monthly-bs');
  const accNextDue = document.getElementById('acc-next-due');
  const changeClientBtn = document.getElementById('change-client-btn');

  // Receipt Box
  const receiptBox = document.getElementById('latest-receipt-box');
  const receiptMeta = document.getElementById('latest-receipt-meta');
  const receiptDownloadLink = document.getElementById('latest-receipt-download');

  // Payment config DOM refs
  const payHeading = document.getElementById('pay-section-heading');
  const monthBtns = document.querySelectorAll('.month-pill-btn');
  const summaryUsd = document.getElementById('summary-total-usd');
  const summaryBs = document.getElementById('summary-total-bs');
  const summaryRateNote = document.getElementById('summary-rate-note');

  const methodTabs = document.querySelectorAll('.pay-method-tab');
  const panelPagoMovil = document.getElementById('panel-pago-movil');
  const panelBinance = document.getElementById('panel-binance');
  const pmAmountDisplay = document.getElementById('pm-amount-display');
  const bnAmountDisplay = document.getElementById('bn-amount-display');

  // Proof Form
  const submitPayForm = document.getElementById('submit-pay-form');
  const refInput = document.getElementById('ref-input');
  const noteInput = document.getElementById('note-input');
  const proofInput = document.getElementById('proof-input');
  const proofDropzone = document.getElementById('proof-dropzone');
  const proofPreviewWrap = document.getElementById('proof-preview-wrap');
  const proofPreviewImg = document.getElementById('proof-preview-img');
  const proofFileInfo = document.getElementById('proof-file-info');
  const proofRemoveBtn = document.getElementById('proof-remove-btn');
  const submitPayBtn = document.getElementById('submit-pay-btn');
  const submitError = document.getElementById('submit-error');

  // Tracking DOM refs
  const trackIcon = document.getElementById('track-icon');
  const trackTitle = document.getElementById('track-title');
  const trackSubtitle = document.getElementById('track-subtitle');
  const trackTicketId = document.getElementById('track-ticket-id');
  const trackAmount = document.getElementById('track-amount');
  const trackActions = document.getElementById('track-actions');

  function formatBsVE(num) {
    return Number(num || 0).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }

  function hideError(el) {
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
  }

  // ==================== 1. CARGAR TASA BCV EN VIVO ====================
  async function loadRates() {
    try {
      const res = await fetch('/api/pay/rates', { cache: 'no-store' });
      if (!res.ok) throw new Error('Error consultando BCV');
      const data = await res.json();
      if (data.success) {
        state.rates = data;
        state.methods = data.methods;
        if (bcvRatePill) bcvRatePill.textContent = `${data.bcv_formatted} / USD`;
        if (bcvRateDate && data.fecha) {
          const d = new Date(data.fecha);
          const dateStr = isNaN(d.getTime()) ? 'Hoy' : d.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
          bcvRateDate.textContent = `Actualizada: ${dateStr}`;
        }
      }
    } catch (e) {
      if (bcvRatePill) bcvRatePill.textContent = 'Tasa BCV en vivo';
    }
  }

  loadRates();

  // ==================== 2. CONSULTAR CÉDULA / RIF ====================
  if (lookupForm) {
    lookupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError(lookupError);
      const cedula = (cedulaInput.value || '').trim();
      if (cedula.replace(/\D/g, '').length < 6) {
        return showError(lookupError, 'Ingresa una Cédula o RIF válido (ej: V-28515043 o 28515043).');
      }

      const originalBtn = lookupBtn.innerHTML;
      lookupBtn.disabled = true;
      lookupBtn.innerHTML = '⏳ Consultando ficha en vivo...';

      try {
        const res = await fetch('/api/pay/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cedula })
        });
        const data = await res.json();
        if (!res.ok || !data.found) {
          showError(lookupError, data.error || 'No se encontró un cliente con esa Cédula o RIF.');
          return;
        }

        state.client = data.client;
        state.rates = { ...state.rates, ...data.rates };
        state.methods = data.methods || state.methods;
        state.latestReceipt = data.latest_receipt || null;
        state.selectedMonths = 1;

        renderAccountView(data);

        // Si ya tiene un pago web pendiente de revisión, mostrar el tracker
        if (data.pending_payment && data.pending_payment.status === 'PENDING') {
          startTracking(
            data.pending_payment.id,
            data.pending_payment.status_token,
            data.pending_payment.amount_usd,
            data.pending_payment.amount_bs
          );
        }
      } catch (err) {
        showError(lookupError, 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
      } finally {
        lookupBtn.disabled = false;
        lookupBtn.innerHTML = originalBtn;
      }
    });
  }

  // Soporte URL directa ?cedula=28515043
  const urlParams = new URLSearchParams(window.location.search);
  const prefillCedula = urlParams.get('cedula');
  if (prefillCedula && cedulaInput) {
    cedulaInput.value = prefillCedula;
    setTimeout(() => lookupForm && lookupForm.dispatchEvent(new Event('submit')), 200);
  }

  function renderAccountView(data) {
    const c = data.client;
    accBusiness.textContent = c.business_name;
    accHolder.textContent = c.client_name_masked;
    accCedula.textContent = c.cedula_masked;
    accSystem.textContent = c.system_name;
    accMonthlyUsd.textContent = `$${c.monthly_fee} USD`;
    accMonthlyBs.textContent = data.rates.monthly_bs_formatted;
    accNextDue.textContent = `${c.pending_month} (Día ${c.due_day})`;

    if (c.status === 'AL_DIA') {
      accStatusBadge.className = 'pay-status-badge status-ok';
      accStatusBadge.textContent = '🟢 AL DÍA';
      payHeading.textContent = '¿Deseas adelantar mensualidades?';
    } else {
      accStatusBadge.className = 'pay-status-badge status-pending';
      accStatusBadge.textContent = '🟠 PENDIENTE DE PAGO';
      payHeading.textContent = 'Reportar Pago de Mensualidad';
    }

    // Mostrar tarjeta de descarga de último recibo PDF si existe
    if (data.latest_receipt) {
      const r = data.latest_receipt;
      receiptBox.style.display = 'flex';
      const numLabel = r.receipt_number === 'ACTUAL' ? 'Comprobante Vigente' : `Recibo #${r.receipt_number}`;
      receiptMeta.textContent = `${numLabel} • Período: ${r.period_covered || c.pending_month} • $${r.amount_usd} USD (${r.amount_bs})`;
      receiptDownloadLink.href = `/api/pay/receipt?num=${encodeURIComponent(r.receipt_number)}&token=${encodeURIComponent(r.download_token)}`;
    } else {
      receiptBox.style.display = 'none';
    }

    // Reset selector meses a 1
    monthBtns.forEach(b => b.classList.toggle('active', b.dataset.months === '1'));
    updateTotals();

    document.getElementById('lookup-card').style.display = 'none';
    trackingSection.style.display = 'none';
    accountSection.style.display = 'block';
    accountSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (changeClientBtn) {
    changeClientBtn.addEventListener('click', () => {
      stopPolling();
      accountSection.style.display = 'none';
      trackingSection.style.display = 'none';
      document.getElementById('lookup-card').style.display = 'block';
      cedulaInput.focus();
      cedulaInput.select();
    });
  }

  // ==================== 3. SELECTOR DE MESES Y MÉTODOS ====================
  function updateTotals() {
    if (!state.client || !state.rates) return;
    const totalUsd = parseFloat(((state.client.monthly_fee || 20) * state.selectedMonths).toFixed(2));
    const bcvVal = parseFloat(state.rates.bcv) || 0;
    const totalBs = totalUsd * bcvVal;
    const bsFormatted = `Bs. ${formatBsVE(totalBs)}`;

    summaryUsd.textContent = `$${totalUsd} USD`;
    summaryBs.textContent = bsFormatted;
    summaryRateNote.textContent = `Cálculo exacto a tasa oficial BCV (${state.rates.bcv_formatted})`;

    if (pmAmountDisplay) pmAmountDisplay.textContent = bsFormatted;
    if (bnAmountDisplay) bnAmountDisplay.textContent = `${totalUsd} USDT`;
  }

  monthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      monthBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedMonths = parseInt(btn.dataset.months, 10) || 1;
      updateTotals();
    });
  });

  methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      methodTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const m = tab.dataset.method;
      if (m === 'binance') {
        state.selectedMethod = 'Binance Pay (USDT)';
        panelPagoMovil.style.display = 'none';
        panelBinance.style.display = 'block';
      } else {
        state.selectedMethod = 'Pago Móvil (BDV 0102)';
        panelPagoMovil.style.display = 'block';
        panelBinance.style.display = 'none';
      }
    });
  });

  // Botones de Copiar en 1 clic
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      let textToCopy = btn.dataset.copy;
      if (textToCopy === '__PM_AMOUNT__') {
        const totalUsd = parseFloat(((state.client?.monthly_fee || 20) * state.selectedMonths).toFixed(2));
        textToCopy = (totalUsd * (parseFloat(state.rates?.bcv) || 0)).toFixed(2);
      } else if (textToCopy === '__BN_AMOUNT__') {
        textToCopy = String(parseFloat(((state.client?.monthly_fee || 20) * state.selectedMonths).toFixed(2)));
      } else if (textToCopy === '__PM_ALL__') {
        const totalUsd = parseFloat(((state.client?.monthly_fee || 20) * state.selectedMonths).toFixed(2));
        const bs = formatBsVE(totalUsd * (parseFloat(state.rates?.bcv) || 0));
        textToCopy = `Pago Móvil TiagoTech\nBanco: Banco de Venezuela (0102)\nTeléfono: 04247046941\nCédula: 28515043\nMonto: Bs. ${bs}`;
      }
      try {
        await navigator.clipboard.writeText(textToCopy);
        const old = btn.textContent;
        btn.textContent = '✅ Copiado';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = old;
          btn.classList.remove('copied');
        }, 1600);
      } catch {
        alert('Dato para copiar: ' + textToCopy);
      }
    });
  });

  // ==================== 4. CARGA Y COMPRESIÓN DE COMPROBANTE ====================
  function handleImageFile(file) {
    hideError(submitError);
    if (!file) return;
    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
      return showError(submitError, 'Solo se aceptan capturas o fotos en formato JPG, PNG o WEBP.');
    }
    if (file.size > 15 * 1024 * 1024) {
      return showError(submitError, 'La foto pesa más de 15 MB. Intenta con una captura más ligera.');
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Comprimir suavemente en canvas (máx 1400px) para subida instantánea desde celular
        const MAX_DIM = 1400;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
        state.proofBase64 = dataUrl;
        state.proofMime = 'image/jpeg';

        const approxKb = Math.round((dataUrl.length * 0.75) / 1024);
        proofPreviewImg.src = dataUrl;
        proofFileInfo.textContent = `${file.name} (optimizado a ${approxKb} KB)`;
        proofDropzone.style.display = 'none';
        proofPreviewWrap.style.display = 'flex';
      };
      img.onerror = () => showError(submitError, 'No pudimos leer esa imagen. Intenta con otra captura.');
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (proofDropzone && proofInput) {
    proofDropzone.addEventListener('click', () => proofInput.click());
    proofDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      proofDropzone.classList.add('dragover');
    });
    proofDropzone.addEventListener('dragleave', () => proofDropzone.classList.remove('dragover'));
    proofDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      proofDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
    proofInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) handleImageFile(e.target.files[0]);
    });
  }

  if (proofRemoveBtn) {
    proofRemoveBtn.addEventListener('click', () => {
      state.proofBase64 = null;
      state.proofMime = null;
      proofInput.value = '';
      proofPreviewImg.src = '';
      proofPreviewWrap.style.display = 'none';
      proofDropzone.style.display = 'flex';
    });
  }

  // ==================== 5. ENVIAR COMPROBANTE AL VPS ====================
  if (submitPayForm) {
    submitPayForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideError(submitError);

      if (!state.client) return;
      const reference = (refInput.value || '').trim();
      if (reference.length < 4) {
        return showError(submitError, 'Ingresa el número de referencia o ID de operación (mínimo 4 dígitos).');
      }
      if (!state.proofBase64) {
        return showError(submitError, 'Adjunta la foto o captura de tu comprobante de pago para poder verificarlo.');
      }

      const oldText = submitPayBtn.innerHTML;
      submitPayBtn.disabled = true;
      submitPayBtn.innerHTML = '⏳ Enviando comprobante seguro...';

      try {
        const res = await fetch('/api/pay/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cedula: state.client.clean_cedula,
            months: state.selectedMonths,
            payment_method: state.selectedMethod,
            reference,
            payer_note: (noteInput.value || '').trim(),
            proof_base64: state.proofBase64,
            proof_mime: state.proofMime
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showError(submitError, data.error || 'Ocurrió un error al enviar tu pago.');
          return;
        }

        // Limpiar formulario
        refInput.value = '';
        noteInput.value = '';
        if (proofRemoveBtn) proofRemoveBtn.click();

        startTracking(data.payment_id, data.status_token, data.amount_usd, data.amount_bs);
      } catch (err) {
        showError(submitError, 'Error de conexión al enviar el comprobante. Intenta nuevamente.');
      } finally {
        submitPayBtn.disabled = false;
        submitPayBtn.innerHTML = oldText;
      }
    });
  }

  // ==================== 6. VERIFICACIÓN EN TIEMPO REAL ====================
  function stopPolling() {
    if (state.pollingTimer) {
      clearInterval(state.pollingTimer);
      state.pollingTimer = null;
    }
  }

  function startTracking(paymentId, statusToken, amountUsd, amountBs) {
    stopPolling();
    state.activePaymentId = paymentId;
    state.activeStatusToken = statusToken;

    accountSection.style.display = 'none';
    trackingSection.style.display = 'block';
    trackingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    trackIcon.textContent = '⏳';
    trackIcon.className = 'track-icon-circle pending';
    trackTitle.textContent = 'Comprobante Recibido — En Verificación';
    trackSubtitle.textContent = 'Acabamos de notificar en vivo a Santiago Lozada. Mantén esta pantalla abierta: apenas se valide en el banco, aquí aparecerá tu Recibo Oficial en PDF al instante.';
    trackTicketId.textContent = paymentId;
    trackAmount.textContent = `$${amountUsd} USD (${amountBs})`;
    trackActions.innerHTML = `
      <a href="https://wa.me/584247046941?text=${encodeURIComponent(`¡Hola Tiago! Acabo de reportar mi pago en el portal web (Ticket ${paymentId}).`)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="justify-content:center;">
        <img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Avisar a Tiago por WhatsApp
      </a>
    `;

    // Polling cada 4 segundos
    state.pollingTimer = setInterval(pollPaymentStatus, 4000);
    setTimeout(pollPaymentStatus, 1800);
  }

  async function pollPaymentStatus() {
    if (!state.activePaymentId || !state.activeStatusToken) return;
    try {
      const res = await fetch(
        `/api/pay/status?id=${encodeURIComponent(state.activePaymentId)}&token=${encodeURIComponent(state.activeStatusToken)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      if (data.status === 'APPROVED') {
        stopPolling();
        trackIcon.textContent = '✅';
        trackIcon.className = 'track-icon-circle approved';
        trackTitle.textContent = '¡Pago Aprobado y Registrado!';
        trackSubtitle.textContent = `Tu suscripción en TiagoTech ya está al día. Tu Recibo Oficial #${data.receipt_number} ha sido emitido con sello digital.`;
        const pdfUrl = `/api/pay/receipt?num=${encodeURIComponent(data.receipt_number)}&token=${encodeURIComponent(data.download_token)}`;
        trackActions.innerHTML = `
          <a href="${pdfUrl}" class="btn" style="background:linear-gradient(135deg,#22C55E,#16A34A); width:100%; justify-content:center; text-align:center;">
            📥 Descargar Recibo Oficial (PDF)
          </a>
          <button type="button" id="track-back-btn" class="btn btn-outline" style="width:100%; justify-content:center;">
            ← Volver a mi Estado de Cuenta
          </button>
        `;
        const backBtn = document.getElementById('track-back-btn');
        if (backBtn) {
          backBtn.addEventListener('click', () => {
            trackingSection.style.display = 'none';
            document.getElementById('lookup-card').style.display = 'block';
            if (state.client) {
              cedulaInput.value = state.client.clean_cedula;
              lookupForm.dispatchEvent(new Event('submit'));
            }
          });
        }
      } else if (data.status === 'REJECTED') {
        stopPolling();
        trackIcon.textContent = '⚠️';
        trackIcon.className = 'track-icon-circle rejected';
        trackTitle.textContent = 'No pudimos validar el comprobante';
        trackSubtitle.textContent = data.reject_reason || 'Verifica que la referencia y el monto coincidan con el pago realizado e intenta nuevamente.';
        trackActions.innerHTML = `
          <button type="button" id="track-retry-btn" class="btn" style="width:100%; justify-content:center;">
            🔄 Subir Nuevo Comprobante
          </button>
          <a href="https://wa.me/584247046941?text=${encodeURIComponent(`Hola Tiago, necesito ayuda verificando mi pago web (Ticket ${state.activePaymentId}).`)}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp" style="justify-content:center;">
            <img src="assets/img/whatsapp.svg" alt="WhatsApp" class="btn-whatsapp-icon"> Verificar con Soporte en WhatsApp
          </a>
        `;
        const retryBtn = document.getElementById('track-retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            trackingSection.style.display = 'none';
            accountSection.style.display = 'block';
          });
        }
      }
    } catch (e) {
      // Silencioso en caso de micro-corte de red
    }
  }
});
