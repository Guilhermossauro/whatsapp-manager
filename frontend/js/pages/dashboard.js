const DashboardPage = (() => {
  function render() {
    return `
      <div class="page-header">
        <h2 class="gradient-text">Dashboard</h2>
        <button class="refresh-btn" id="dash-refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Atualizar
        </button>
      </div>
      <div class="stats-grid" id="stats-grid">
        ${renderSkeletonStats()}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="glass-card section-card">
          <div class="section-card-header">
            <div class="section-card-title">Fila de Envio</div>
            <span class="badge badge-purple" id="queue-total-badge">—</span>
          </div>
          <div id="queue-stats-area"><div class="loading-spinner" style="height:80px"><div class="spinner"></div></div></div>
        </div>
        <div class="glass-card section-card">
          <div class="section-card-header">
            <div class="section-card-title">Execuções de Fluxo</div>
            <span class="badge badge-info" id="exec-total-badge">—</span>
          </div>
          <div id="exec-stats-area"><div class="loading-spinner" style="height:80px"><div class="spinner"></div></div></div>
        </div>
      </div>
      <div class="glass-card section-card" style="margin-top:20px">
        <div class="section-card-header">
          <div class="section-card-title">Atividade Recente</div>
        </div>
        <div id="recent-logs-area"><div class="loading-spinner" style="height:80px"><div class="spinner"></div></div></div>
      </div>`;
  }

  function renderSkeletonStats() {
    return Array(6).fill(0).map(() => `
      <div class="glass-card stat-card">
        <div style="width:40px;height:40px;border-radius:10px;background:var(--glass-bg);margin-bottom:12px"></div>
        <div style="width:60px;height:28px;background:var(--glass-bg);border-radius:6px;margin-bottom:8px"></div>
        <div style="width:100px;height:14px;background:var(--glass-bg);border-radius:6px"></div>
      </div>`).join('');
  }

  const statDefs = [
    { key: 'totalContatos', label: 'Contatos', color: 'var(--accent-purple)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-purple)"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
    { key: 'totalListas', label: 'Listas', color: 'var(--accent-cyan)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-cyan)"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>` },
    { key: 'totalCampanhas', label: 'Campanhas', color: 'var(--accent-green)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-green)"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>` },
    { key: 'totalFluxos', label: 'Fluxos', color: '#6366f1', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#6366f1"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>` },
    { key: 'totalMensagens', label: 'Mensagens Enviadas', color: 'var(--accent-amber)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-amber)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
    { key: 'campanhasAtivas', label: 'Campanhas Ativas', color: 'var(--accent-red)', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent-red)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` }
  ];

  function animateCount(el, target) {
    const start = 0;
    const duration = 800;
    const startTime = performance.now();
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target - start) * eased).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  async function loadData() {
    try {
      const stats = await api.stats.get();
      const grid = document.getElementById('stats-grid');
      if (!grid) return;
      grid.innerHTML = statDefs.map(def => `
        <div class="glass-card stat-card" style="--card-accent:linear-gradient(90deg,${def.color},transparent);--icon-bg:${def.color}20">
          <div class="stat-icon">${def.icon}</div>
          <div class="stat-value" data-target="${stats[def.key] || 0}">0</div>
          <div class="stat-label">${def.label}</div>
        </div>`).join('');
      grid.querySelectorAll('.stat-value').forEach(el => animateCount(el, parseInt(el.dataset.target)));

      const qs = stats.queue || {};
      document.getElementById('queue-total-badge').textContent = (qs.total || 0) + ' itens';
      document.getElementById('queue-stats-area').innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          ${[['Pendentes', qs.pendentes || 0, 'badge-warning'], ['Enviados', qs.enviados || 0, 'badge-success'], ['Erros', qs.erros || 0, 'badge-danger'], ['Processando', qs.processando || 0, 'badge-info']].map(([l, v, c]) =>
            `<div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--text-primary)">${v}</div><div class="badge ${c}" style="margin-top:4px">${l}</div></div>`).join('')}
        </div>`;

      const es = stats.execucoes || {};
      document.getElementById('exec-total-badge').textContent = (es.total || 0) + ' total';
      document.getElementById('exec-stats-area').innerHTML = `
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          ${[['Ativos', es.ativos || 0, 'badge-info'], ['Concluídos', es.concluidos || 0, 'badge-success'], ['Erros', es.erros || 0, 'badge-danger']].map(([l, v, c]) =>
            `<div style="text-align:center"><div style="font-size:24px;font-weight:700;color:var(--text-primary)">${v}</div><div class="badge ${c}" style="margin-top:4px">${l}</div></div>`).join('')}
        </div>`;

      const logs = stats.recentLogs || [];
      document.getElementById('recent-logs-area').innerHTML = logs.length === 0
        ? '<div class="empty-state"><p>Nenhuma atividade ainda</p></div>'
        : `<div class="activity-list">${logs.map(l => `
          <div class="activity-item">
            <div class="activity-dot ${l.status === 'sent' ? 'sent' : l.status === 'mock_sent' ? 'mock' : 'error'}"></div>
            <div style="flex:1">
              <span class="log-phone">${l.phone}</span>
              ${l.nome_contato ? `<span style="color:var(--text-muted);font-size:12px"> · ${l.nome_contato}</span>` : ''}
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${l.message.substring(0, 80)}${l.message.length > 80 ? '...' : ''}</div>
            </div>
            <div style="font-size:11px;color:var(--text-muted)">${new Date(l.created_at).toLocaleTimeString('pt-BR')}</div>
          </div>`).join('')}</div>`;
    } catch (e) {
      Toast.error('Erro', 'Falha ao carregar dashboard: ' + e.message);
    }
  }

  function init() {
    loadData();
    document.getElementById('dash-refresh')?.addEventListener('click', function() {
      this.classList.add('spinning');
      loadData().finally(() => this.classList.remove('spinning'));
    });
  }

  return { render, init };
})();

window.DashboardPage = DashboardPage;
