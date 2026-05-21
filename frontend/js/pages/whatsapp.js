const WhatsAppPage = (() => {
  let logsInterval = null;

  function render() {
    return `
      <div class="page-header">
        <h2 class="gradient-text">WhatsApp</h2>
        <button class="refresh-btn" id="wa-refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Atualizar
        </button>
      </div>
      <div style="display:grid;grid-template-columns:400px 1fr;gap:20px;align-items:start">
        <div>
          <div class="glass-card section-card" id="wa-connection-card">
            <div class="section-card-header">
              <div class="section-card-title">Conexão</div>
            </div>
            <div id="wa-connection-body"><div class="loading-spinner" style="height:120px"><div class="spinner"></div></div></div>
          </div>
          <div class="glass-card section-card" style="margin-top:20px">
            <div class="section-card-header"><div class="section-card-title">Envio de Teste</div></div>
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input class="form-control" type="text" id="test-phone" placeholder="5511999999999" />
            </div>
            <div class="form-group">
              <label class="form-label">Mensagem</label>
              <textarea class="form-control" id="test-message" rows="3" placeholder="Digite sua mensagem..."></textarea>
            </div>
            <button class="btn btn-primary" id="btn-send-test" style="width:100%">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
              Enviar Teste
            </button>
          </div>
        </div>
        <div class="glass-card section-card">
          <div class="section-card-header">
            <div class="section-card-title">Log de Mensagens</div>
            <span class="badge badge-purple" id="logs-count">0 msgs</span>
          </div>
          <div id="wa-logs-area"><div class="loading-spinner" style="height:80px"><div class="spinner"></div></div></div>
        </div>
      </div>`;
  }

  async function loadStatus() {
    try {
      const session = await api.whatsapp.status();
      renderConnectionUI(session);
    } catch (e) {}
  }

  function renderConnectionUI(session) {
    const body = document.getElementById('wa-connection-body');
    if (!body) return;
    if (session.status === 'connected') {
      body.innerHTML = `
        <div class="wa-status-display">
          <div class="wa-status-icon connected">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </div>
          <div style="text-align:center">
            <div style="font-weight:700;font-size:18px;color:var(--accent-green)">Conectado</div>
            <div style="color:var(--text-muted);font-size:14px;margin-top:4px">${session.phone}</div>
            <div style="color:var(--text-muted);font-size:12px;margin-top:2px">desde ${new Date(session.connected_at).toLocaleString('pt-BR')}</div>
          </div>
          <button class="btn btn-danger" id="btn-disconnect" style="margin-top:8px">Desconectar</button>
        </div>`;
      document.getElementById('btn-disconnect')?.addEventListener('click', async () => {
        try { await api.whatsapp.disconnect(); loadStatus(); Toast.info('Desconectado', ''); }
        catch (e) { Toast.error('Erro', e.message); }
      });
    } else if (session.status === 'aguardando_scan') {
      body.innerHTML = `
        <div class="wa-qr-container">
          <div style="font-size:14px;color:var(--text-secondary);text-align:center">Escaneie o QR Code com seu WhatsApp</div>
          <div class="wa-qr-frame"><img src="${session.qr_code}" alt="QR Code" /></div>
          <div style="display:flex;flex-direction:column;gap:10px;width:100%">
            <button class="btn btn-success btn-lg" id="btn-simulate-scan" style="width:100%">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Simular Scan (Mock)
            </button>
            <button class="btn btn-ghost" id="btn-cancel-scan" style="width:100%">Cancelar</button>
          </div>
        </div>`;
      document.getElementById('btn-simulate-scan')?.addEventListener('click', async () => {
        try { await api.whatsapp.scan(); loadStatus(); Toast.success('Conectado!', 'WhatsApp simulado conectado'); }
        catch (e) { Toast.error('Erro', e.message); }
      });
      document.getElementById('btn-cancel-scan')?.addEventListener('click', async () => {
        try { await api.whatsapp.disconnect(); loadStatus(); }
        catch (e) {}
      });
    } else {
      body.innerHTML = `
        <div class="wa-status-display">
          <div class="wa-status-icon disconnected">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div style="text-align:center">
            <div style="font-weight:700;font-size:18px;color:var(--accent-red)">Desconectado</div>
            <div style="color:var(--text-muted);font-size:13px;margin-top:6px;line-height:1.5">Conecte-se para enviar mensagens.<br/>No modo mock, os envios são simulados.</div>
          </div>
          <button class="btn btn-primary btn-lg" id="btn-connect" style="margin-top:8px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
            Gerar QR Code
          </button>
        </div>`;
      document.getElementById('btn-connect')?.addEventListener('click', async () => {
        try { await api.whatsapp.connect(); loadStatus(); }
        catch (e) { Toast.error('Erro', e.message); }
      });
    }
  }

  async function loadLogs() {
    const area = document.getElementById('wa-logs-area');
    const countEl = document.getElementById('logs-count');
    if (!area) return;
    try {
      const res = await api.whatsapp.logs({ limit: 50 });
      const logs = res.data || [];
      if (countEl) countEl.textContent = `${res.total} msgs`;
      if (logs.length === 0) {
        area.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><h3>Sem logs ainda</h3><p>As mensagens enviadas aparecerão aqui</p></div>';
        return;
      }
      area.innerHTML = `<div style="max-height:500px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">
        ${logs.map(l => `
          <div class="log-item">
            <div class="activity-dot ${l.status === 'sent' ? 'sent' : l.status === 'mock_sent' ? 'mock' : 'error'}" style="margin-top:2px"></div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="log-phone">${l.phone}</span>
                ${l.nome_contato ? `<span style="color:var(--text-muted);font-size:11px">${l.nome_contato}</span>` : ''}
                <span class="badge ${l.source === 'flow' ? 'badge-info' : l.source === 'test' ? 'badge-purple' : 'badge-muted'}" style="font-size:10px">${l.source}</span>
                ${l.status === 'mock_sent' ? '<span class="badge badge-warning" style="font-size:10px">mock</span>' : ''}
              </div>
              <div class="log-message">${l.message.substring(0, 100)}${l.message.length > 100 ? '...' : ''}</div>
            </div>
            <div class="log-time">${new Date(l.created_at).toLocaleTimeString('pt-BR')}</div>
          </div>`).join('')}
      </div>`;
    } catch (e) {}
  }

  function init() {
    loadStatus();
    loadLogs();

    document.getElementById('wa-refresh')?.addEventListener('click', function() {
      this.classList.add('spinning');
      Promise.all([loadStatus(), loadLogs()]).finally(() => this.classList.remove('spinning'));
    });

    document.getElementById('btn-send-test')?.addEventListener('click', async () => {
      const phone = document.getElementById('test-phone')?.value?.trim();
      const message = document.getElementById('test-message')?.value?.trim();
      if (!phone || !message) { Toast.warning('Atenção', 'Preencha telefone e mensagem'); return; }
      try {
        const res = await api.whatsapp.sendTest(phone, message);
        Toast.success('Enviado!', res.note || 'Mensagem enviada');
        document.getElementById('test-message').value = '';
        loadLogs();
      } catch (e) { Toast.error('Erro', e.message); }
    });

    logsInterval = setInterval(() => { if (document.getElementById('wa-logs-area')) loadLogs(); }, 5000);
  }

  return { render, init };
})();

window.WhatsAppPage = WhatsAppPage;
