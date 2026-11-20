/* ==========================================================================
   🔐 TIAGOTECH — PANEL PRIVADO DE CLIENTES & PAGOS (JS/ADMIN.JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    overview: null,
    filterStatus: 'ALL',
    searchQuery: ''
  };

  // Views
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dash-view');
  const loginForm = document.getElementById('admin-login-form');
  const passInput = document.getElementById('admin-password');
  const loginBtn = document.getElementById('admin-login-btn');
  const loginError = document.getElementById('admin-login-error');

  // Top buttons
  const syncBtn = document.getElementById('btn-sync-sheets');
  const newClientBtn = document.getElementById('btn-new-client');
  const refreshBtn = document.getElementById('btn-refresh-dash');
  const logoutBtn = document.getElementById('btn-logout');

  // KPIs
  const kpiTotal = document.getElementById('kpi-total-clients');
  const kpiUpToDate = document.getElementById('kpi-up-to-date');
  const kpiPending = document.getElementById('kpi-pending');
  const kpiMrr = document.getElementById('kpi-mrr');
  const kpiBcv = document.getElementById('kpi-bcv');
  const kpiVps = document.getElementById('kpi-vps');

  // Containers
  const pendingSection = document.getElementById('pending-payments-section');
  const pendingList = document.getElementById('pending-payments-list');
  const pendingCountBadge = document.getElementById('pending-count-badge');
  const clientsContainer = document.getElementById('clients-list-container');
  const receiptsContainer = document.getElementById('receipts-list-container');
  const searchInput = document.getElementById('client-search-input');
  const filterBtns = document.querySelectorAll('.admin-filter-btn');
  const toastEl = document.getElementById('admin-toast');

  // Modals
  const clientModal = document.getElementById('client-modal');
  const clientModalTitle = document.getElementById('client-modal-title');
  const clientForm = document.getElementById('client-form');
  const clientDeleteBtn = document.getElementById('client-delete-btn');

  const payModal = document.getElementById('manual-pay-modal');
  const payForm = document.getElementById('manual-pay-form');

  const proofModal = document.getElementById('proof-modal');
  const proofModalImg = document.getElementById('proof-modal-img');
  const proofModalMeta = document.getElementById('proof-modal-meta');

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatBs(val) {
    return Number(val || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  let toastTimer = null;
  function showToast(msg, type = 'ok') {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = `admin-toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3600);
  }

  function showLogin() {
    dashView.style.display = 'none';
    loginView.style.display = 'flex';
    setTimeout(() => passInput && passInput.focus(), 100);
  }

  function showDash() {
    loginView.style.display = 'none';
    dashView.style.display = 'block';
  }

  // ==================== 1. AUTENTICACIÓN ====================
  async function loadOverview(silent = false) {
    try {
      const res = await fetch('/api/admin/overview', { credentials: 'same-origin', cache: 'no-store' });
      if (res.status === 401) {
        showLogin();
        return false;
      }
      if (!res.ok) throw new Error('Error cargando datos');
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error');
      state.overview = data;
      showDash();
      renderAll();
      if (!silent) showToast('✅ Datos actualizados en vivo');
      return true;
    } catch (err) {
      if (!silent) showToast('⚠️ Error conectando con el servidor', 'err');
      return false;
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';
      const password = passInput.value;
      if (!password) return;

      const oldText = loginBtn.textContent;
      loginBtn.disabled = true;
      loginBtn.textContent = '⏳ Verificando...';
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          loginError.textContent = data.error || 'Contraseña incorrecta.';
          loginError.style.display = 'block';
          return;
        }
        passInput.value = '';
        await loadOverview(true);
        showToast('🔓 ¡Bienvenido, Tiago!');
      } catch {
        loginError.textContent = 'Error de conexión con el servidor.';
        loginError.style.display = 'block';
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = oldText;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
      state.overview = null;
      showLogin();
    });
  }

  // ==================== 2. RENDER PRINCIPAL ====================
  function renderAll() {
    const d = state.overview;
    if (!d) return;

    const f = d.financial || {};
    kpiTotal.textContent = f.totalClients ?? d.clients.length;
    kpiUpToDate.textContent = f.upToDate ?? 0;
    kpiPending.textContent = f.pendingClients ?? 0;
    kpiMrr.innerHTML = `<span style="color:#4ADE80;">$${f.collectedMrr ?? 0}</span> <span style="color:#64748B;font-size:13px;">/ $${f.mrrProjected ?? 0}</span>`;
    kpiBcv.textContent = d.rates?.bcv_formatted || '—';
    if (d.vps) {
      kpiVps.textContent = `RAM ${d.vps.ram_percent}% • CPU ${d.vps.cpu_load_1m}`;
    }

    renderPendingPayments();
    renderClients();
    renderReceipts();
  }

  function renderPendingPayments() {
    const allWeb = state.overview?.web_payments || [];
    const pending = allWeb.filter(p => p.status === 'PENDING');

    if (pending.length === 0) {
      pendingSection.style.display = 'none';
      return;
    }

    pendingSection.style.display = 'block';
    pendingCountBadge.textContent = pending.length;

    pendingList.innerHTML = pending.map(p => `
      <div class="pending-pay-card">
        <div style="display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap; flex:1; min-width:240px;">
          ${p.proof_filename ? `
            <img src="/api/admin/proof?file=${encodeURIComponent(p.proof_filename)}"
                 alt="Comprobante ${esc(p.id)}"
                 class="proof-thumb"
                 data-proof-file="${esc(p.proof_filename)}"
                 data-proof-meta="${esc(p.business_name)} • $${esc(p.amount_usd)} USD (${esc(p.amount_bs)}) • Ref: ${esc(p.reference)}"
                 title="Clic para ampliar comprobante">
          ` : ''}
          <div style="flex:1; min-width:190px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
              <strong style="color:#fff; font-size:15px;">${esc(p.business_name)}</strong>
              <span class="mini-tag tag-blue">${esc(p.id)}</span>
              <span class="mini-tag tag-amber">${esc(p.months)} ${p.months == 1 ? 'mes' : 'meses'}</span>
            </div>
            <div style="font-size:13px; color:#CBD5E1; margin-bottom:4px;">
              👤 ${esc(p.client_name)} (<code>${esc(p.cedula)}</code>) • 💻 ${esc(p.system_name)}
            </div>
            <div style="font-size:13px; color:#94A3B8; display:flex; flex-wrap:wrap; gap:10px;">
              <span>💵 <strong style="color:#4ADE80;">$${esc(p.amount_usd)} USD</strong> (${esc(p.amount_bs)})</span>
              <span>🏦 ${esc(p.payment_method)}</span>
              <span>🔢 Ref: <code style="color:#38BDF8;">${esc(p.reference)}</code></span>
            </div>
            ${p.payer_note ? `<div style="font-size:12px; color:#FBBF24; margin-top:4px;">📝 Nota: ${esc(p.payer_note)}</div>` : ''}
          </div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <button type="button" class="btn-adm btn-adm-green" data-approve-web="${esc(p.id)}">
            ✅ Aprobar y PDF
          </button>
          <button type="button" class="btn-adm btn-adm-red" data-reject-web="${esc(p.id)}">
            ❌ Rechazar
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderClients() {
    const clients = state.overview?.clients || [];
    const bcvRate = parseFloat(state.overview?.rates?.bcv) || 0;
    const q = state.searchQuery.toLowerCase();

    const filtered = clients.filter(c => {
      if (state.filterStatus === 'AL_DIA' && c.status !== 'AL_DIA') return false;
      if (state.filterStatus === 'PENDIENTE' && c.status === 'AL_DIA') return false;
      if (q) {
        const hay = `${c.client_name} ${c.business_name} ${c.cedula} ${c.clean_cedula} ${c.system_name} ${c.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      clientsContainer.innerHTML = `<div style="text-align:center; padding:32px; color:var(--text-muted);">No hay clientes que coincidan con el filtro actual.</div>`;
      return;
    }

    clientsContainer.innerHTML = filtered.map(c => {
      const isOk = c.status === 'AL_DIA';
      const fee = parseFloat(c.monthly_fee) || 20;
      const feeBs = bcvRate > 0 ? `Bs. ${formatBs(fee * bcvRate)}` : '';
      const cleanPhone = String(c.phone || '').replace(/\D/g, '');
      const waPhone = cleanPhone.startsWith('58') ? cleanPhone : (cleanPhone.startsWith('0') ? '58' + cleanPhone.slice(1) : '58' + cleanPhone);
      const payLink = `https://tiagotechapp.com/pagar?cedula=${encodeURIComponent(c.clean_cedula)}`;
      const waMsg = isOk
        ? `¡Hola ${c.client_name}! Te saluda Santiago de TiagoTech. Te comparto tu portal oficial donde puedes descargar tu recibo o adelantar mensualidades de ${c.business_name}: ${payLink}`
        : `¡Hola ${c.client_name}! Te saluda Santiago de TiagoTech 👋. Te recordamos tu mensualidad de ${c.pending_month} para ${c.business_name} ($${fee} USD / ${feeBs}). Puedes consultar, reportar tu pago y descargar tu recibo PDF aquí: ${payLink}`;

      return `
        <div class="client-row-card ${isOk ? 'is-ok' : 'is-pending'}">
          <div class="client-row-main">
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:4px;">
              <strong style="font-size:16px; color:#fff;">${esc(c.business_name)}</strong>
              <span class="mini-tag ${isOk ? 'tag-green' : 'tag-amber'}">${isOk ? '🟢 AL DÍA' : '🟠 PENDIENTE'}</span>
              <span class="mini-tag tag-blue">Día ${esc(c.due_day || 5)}</span>
            </div>
            <div style="font-size:13px; color:#CBD5E1; display:flex; flex-wrap:wrap; gap:12px; margin-bottom:6px;">
              <span>👤 ${esc(c.client_name)}</span>
              <span>🪪 <code>${esc(c.cedula)}</code></span>
              ${c.phone ? `<span>📞 ${esc(c.phone)}</span>` : ''}
            </div>
            <div style="font-size:12.5px; color:#94A3B8; display:flex; flex-wrap:wrap; gap:14px;">
              <span>💻 <strong style="color:#E2E8F0;">${esc(c.system_name)}</strong></span>
              <span>💵 <strong style="color:#4ADE80;">$${fee} USD</strong> ${feeBs ? `(${feeBs})` : ''}</span>
              <span>📅 Corte: <strong style="color:#38BDF8;">${esc(c.pending_month || 'N/A')}</strong></span>
            </div>
          </div>

          <div class="client-row-actions">
            <button type="button" class="btn-adm btn-adm-green" data-manual-pay="${esc(c.clean_cedula)}" title="Registrar pago y emitir PDF">
              ✅ Cobrar
            </button>
            <a href="/api/admin/receipt?cedula=${encodeURIComponent(c.clean_cedula)}" class="btn-adm btn-adm-blue" title="Descargar último recibo PDF">
              📄 PDF
            </a>
            ${cleanPhone.length >= 7 ? `
              <a href="https://wa.me/${encodeURIComponent(waPhone)}?text=${encodeURIComponent(waMsg)}" target="_blank" rel="noopener noreferrer" class="btn-adm btn-adm-wa" title="Enviar enlace de pago por WhatsApp">
                💬 WhatsApp
              </a>
            ` : ''}
            <button type="button" class="btn-adm btn-adm-ghost" data-edit-client="${esc(c.clean_cedula)}" title="Editar cliente">
              ✏️ Editar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderReceipts() {
    const receipts = state.overview?.receipts || [];
    if (receipts.length === 0) {
      receiptsContainer.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">Aún no se han emitido recibos PDF.</div>`;
      return;
    }

    receiptsContainer.innerHTML = receipts.slice(0, 15).map(r => `
      <div class="receipt-row">
        <div>
          <strong style="color:#38BDF8; font-family:var(--font-code);">${esc(r.receipt_number)}</strong>
          <span style="color:#fff; font-weight:600; margin-left:8px;">${esc(r.business_name)}</span>
          <span style="color:#94A3B8; font-size:12.5px; margin-left:6px;">(${esc(r.client_name)})</span>
          <div style="font-size:12px; color:#94A3B8; margin-top:2px;">
            💵 $${esc(r.amount_usd)} USD (${esc(r.amount_bs)}) • 📅 ${esc(r.period_covered)} • 🔢 Ref: <code>${esc(r.reference)}</code>
          </div>
        </div>
        <a href="/api/admin/receipt?num=${encodeURIComponent(r.receipt_number)}" class="btn-adm btn-adm-blue">
          📥 Descargar PDF
        </a>
      </div>
    `).join('');
  }

  // ==================== 3. EVENTOS DE FILTRO Y DELEGACIÓN ====================
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value || '';
      renderClients();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filterStatus = btn.dataset.filter;
      renderClients();
    });
  });

  if (refreshBtn) refreshBtn.addEventListener('click', () => loadOverview(false));

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      const old = syncBtn.textContent;
      syncBtn.disabled = true;
      syncBtn.textContent = '⏳ Sincronizando...';
      try {
        const res = await fetch('/api/admin/sync', { method: 'POST', credentials: 'same-origin' });
        if (!res.ok) throw new Error();
        await loadOverview(true);
        showToast('✅ Sincronizado con Google Sheets');
      } catch {
        showToast('⚠️ Error sincronizando Sheets', 'err');
      } finally {
        syncBtn.disabled = false;
        syncBtn.textContent = old;
      }
    });
  }

  // Delegación global de clics en listas dinámicas
  document.addEventListener('click', async (e) => {
    // Ampliar foto comprobante
    const thumb = e.target.closest('[data-proof-file]');
    if (thumb) {
      proofModalImg.src = `/api/admin/proof?file=${encodeURIComponent(thumb.dataset.proofFile)}`;
      proofModalMeta.textContent = thumb.dataset.proofMeta || '';
      proofModal.style.display = 'flex';
      return;
    }

    // Aprobar pago web pendiente
    const appBtn = e.target.closest('[data-approve-web]');
    if (appBtn) {
      const payId = appBtn.dataset.approveWeb;
      if (!confirm(`¿Confirmas que recibiste el dinero en tu cuenta para aprobar el ticket ${payId} y emitir el Recibo PDF oficial?`)) return;
      appBtn.disabled = true;
      appBtn.textContent = '⏳...';
      try {
        const res = await fetch('/api/admin/payments/approve', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: payId })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Error');
        showToast(`✅ ¡Pago aprobado! Recibo ${data.receipt_number} emitido.`);
        await loadOverview(true);
      } catch (err) {
        showToast(`⚠️ ${err.message}`, 'err');
        appBtn.disabled = false;
        appBtn.textContent = '✅ Aprobar y PDF';
      }
      return;
    }

    // Rechazar pago web pendiente
    const rejBtn = e.target.closest('[data-reject-web]');
    if (rejBtn) {
      const payId = rejBtn.dataset.rejectWeb;
      const reason = prompt('Motivo del rechazo (opcional, lo verá el cliente):', 'No pudimos ubicar la referencia o el monto en nuestras cuentas.');
      if (reason === null) return;
      rejBtn.disabled = true;
      try {
        const res = await fetch('/api/admin/payments/reject', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_id: payId, reason })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Error');
        showToast('❌ Comprobante rechazado.');
        await loadOverview(true);
      } catch (err) {
        showToast(`⚠️ ${err.message}`, 'err');
        rejBtn.disabled = false;
      }
      return;
    }

    // Abrir modal editar cliente
    const editBtn = e.target.closest('[data-edit-client]');
    if (editBtn) {
      const ced = editBtn.dataset.editClient;
      const c = (state.overview?.clients || []).find(x => x.clean_cedula === ced);
      if (c) openClientModal(c);
      return;
    }

    // Abrir modal registrar pago manual
    const payBtn = e.target.closest('[data-manual-pay]');
    if (payBtn) {
      const ced = payBtn.dataset.manualPay;
      const c = (state.overview?.clients || []).find(x => x.clean_cedula === ced);
      if (c) openManualPayModal(c);
      return;
    }

    // Cerrar modales
    if (e.target.matches('[data-close-modal]') || e.target.classList.contains('adm-modal-backdrop')) {
      clientModal.style.display = 'none';
      payModal.style.display = 'none';
      proofModal.style.display = 'none';
    }
  });

  // ==================== 4. MODAL CLIENTE (CREAR / EDITAR) ====================
  function openClientModal(client = null) {
    clientForm.reset();
    if (client) {
      clientModalTitle.textContent = `✏️ Editar Cliente — ${client.business_name}`;
      clientForm.dataset.mode = 'edit';
      clientForm.elements.cedula.value = client.cedula;
      clientForm.elements.cedula.readOnly = true;
      clientForm.elements.clean_cedula.value = client.clean_cedula;
      clientForm.elements.client_name.value = client.client_name || '';
      clientForm.elements.business_name.value = client.business_name || '';
      clientForm.elements.system_name.value = client.system_name || '';
      clientForm.elements.monthly_fee.value = client.monthly_fee || 20;
      clientForm.elements.due_day.value = client.due_day || 5;
      clientForm.elements.pending_month.value = client.pending_month || 'Noviembre 2026';
      clientForm.elements.status.value = client.status === 'AL_DIA' ? 'AL_DIA' : 'PENDIENTE';
      clientForm.elements.phone.value = client.phone || '';
      clientDeleteBtn.style.display = 'inline-flex';
    } else {
      clientModalTitle.textContent = '➕ Registrar Nuevo Cliente';
      clientForm.dataset.mode = 'create';
      clientForm.elements.cedula.readOnly = false;
      clientForm.elements.clean_cedula.value = '';
      clientForm.elements.monthly_fee.value = 20;
      clientForm.elements.due_day.value = 5;
      clientForm.elements.pending_month.value = 'Noviembre 2026';
      clientForm.elements.status.value = 'PENDIENTE';
      clientDeleteBtn.style.display = 'none';
    }
    clientModal.style.display = 'flex';
  }

  if (newClientBtn) newClientBtn.addEventListener('click', () => openClientModal(null));

  if (clientForm) {
    clientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isEdit = clientForm.dataset.mode === 'edit';
      const payload = {
        cedula: clientForm.elements.cedula.value.trim(),
        clean_cedula: clientForm.elements.clean_cedula.value.trim(),
        client_name: clientForm.elements.client_name.value.trim(),
        business_name: clientForm.elements.business_name.value.trim(),
        system_name: clientForm.elements.system_name.value.trim(),
        monthly_fee: parseFloat(clientForm.elements.monthly_fee.value) || 20,
        due_day: parseInt(clientForm.elements.due_day.value, 10) || 5,
        pending_month: clientForm.elements.pending_month.value.trim(),
        status: clientForm.elements.status.value,
        phone: clientForm.elements.phone.value.trim()
      };

      try {
        const res = await fetch('/api/admin/clients', {
          method: isEdit ? 'PUT' : 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Error guardando cliente');
        clientModal.style.display = 'none';
        showToast(isEdit ? '✅ Cliente actualizado' : '✅ Cliente registrado y sincronizado');
        await loadOverview(true);
      } catch (err) {
        showToast(`⚠️ ${err.message}`, 'err');
      }
    });
  }

  if (clientDeleteBtn) {
    clientDeleteBtn.addEventListener('click', async () => {
      const cleanCed = clientForm.elements.clean_cedula.value;
      const bName = clientForm.elements.business_name.value;
      if (!confirm(`¿Seguro que deseas eliminar a "${bName}" de la base de datos local?`)) return;
      try {
        const res = await fetch('/api/admin/clients', {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clean_cedula: cleanCed })
        });
        if (!res.ok) throw new Error('Error eliminando');
        clientModal.style.display = 'none';
        showToast('🗑️ Cliente eliminado');
        await loadOverview(true);
      } catch (err) {
        showToast(`⚠️ ${err.message}`, 'err');
      }
    });
  }

  // ==================== 5. MODAL PAGO MANUAL DIRECTO ====================
  function openManualPayModal(client) {
    payForm.reset();
    document.getElementById('mp-client-label').textContent = `${client.business_name} (${client.client_name} • ${client.cedula})`;
    payForm.elements.cedula.value = client.clean_cedula;
    payForm.elements.months.value = 1;
    payForm.elements.amount_usd.value = client.monthly_fee || 20;
    payForm.elements.monthly_base.value = client.monthly_fee || 20;
    payForm.elements.payment_method.value = 'Pago Móvil (BDV 0102)';
    payForm.elements.reference.value = '';
    payModal.style.display = 'flex';
  }

  if (payForm) {
    payForm.elements.months.addEventListener('change', () => {
      const base = parseFloat(payForm.elements.monthly_base.value) || 20;
      const m = parseInt(payForm.elements.months.value, 10) || 1;
      payForm.elements.amount_usd.value = (base * m).toFixed(2);
    });

    payForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = payForm.querySelector('button[type="submit"]');
      const old = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Emitiendo recibo PDF...';
      try {
        const res = await fetch('/api/admin/payments/approve', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cedula: payForm.elements.cedula.value,
            months: parseInt(payForm.elements.months.value, 10) || 1,
            amount_usd: parseFloat(payForm.elements.amount_usd.value) || 20,
            payment_method: payForm.elements.payment_method.value,
            reference: payForm.elements.reference.value.trim() || 'Pago Directo'
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Error');
        payModal.style.display = 'none';
        showToast(`✅ ¡Pago registrado! Recibo ${data.receipt_number} generado.`);
        await loadOverview(true);
      } catch (err) {
        showToast(`⚠️ ${err.message}`, 'err');
      } finally {
        btn.disabled = false;
        btn.textContent = old;
      }
    });
  }

  // Arrancar verificando si ya hay sesión activa
  loadOverview(true);
});
