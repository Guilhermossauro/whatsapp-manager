const CampaignsPage = (() => {
  function statusBadge(status) {
    const map = { rascunho: 'badge-muted', enviando: 'badge-warning', concluida: 'badge-success', pausada: 'badge-danger' };
    const labels = { rascunho: 'Rascunho', enviando: 'Enviando', concluida: 'Concluída', pausada: 'Pausada' };
    return `<span class="badge ${map[status] || 'badge-muted'}">${labels[status] || status}</span>`;
  }

  function render() {
    return `
      <div class="page-header">
        <h2 class="gradient-text">Campanhas</h2>
        <button class="btn btn-primary" id="btn-new-campaign">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Campanha
        </button>
      </div>
      <div class="glass-card section-card">
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Nome</th><th>Lista</th><th>Status</th><th>Progresso</th><th>Delay</th><th></th></tr></thead>
            <tbody id="campaigns-tbody"><tr><td colspan="6"><div class="loading-spinner" style="height:60px"><div class="spinner"></div></div></td></tr></tbody>
          </table>
        </div>
      </div>`;
  }

  async function loadCampaigns() {
    const tbody = document.getElementById('campaigns-tbody');
    if (!tbody) return;
    try {
      const campaigns = await api.campanhas.list();
      if (campaigns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg><h3>Nenhuma campanha</h3><p>Crie sua primeira campanha de disparo</p></div></td></tr>`;
        return;
      }
      tbody.innerHTML = campaigns.map(c => {
        const pct = c.total_contatos > 0 ? Math.round((c.enviados / c.total_contatos) * 100) : 0;
        return `
          <tr>
            <td><strong style="color:var(--text-primary)">${c.nome}</strong><div style="font-size:11px;color:var(--text-muted);margin-top:2px">${c.mensagem.substring(0, 50)}${c.mensagem.length > 50 ? '...' : ''}</div></td>
            <td>${c.lista_nome ? `<span class="badge badge-purple">${c.lista_nome}</span>` : '<span class="badge badge-muted">—</span>'}</td>
            <td>${statusBadge(c.status)}</td>
            <td style="min-width:140px">
              <div class="campaign-progress-info"><span>${c.enviados}/${c.total_contatos}</span><span>${pct}%</span></div>
              <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            </td>
            <td style="font-size:12px;color:var(--text-muted)">${c.delay_min}–${c.delay_max}s</td>
            <td>
              <div style="display:flex;gap:6px">
                ${c.status === 'rascunho' && c.lista_id ? `<button class="btn btn-success btn-sm btn-dispatch" data-id="${c.id}" data-name="${c.nome}" title="Disparar">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                </button>` : ''}
                <button class="btn btn-ghost btn-sm btn-view-campaign" data-id="${c.id}" title="Detalhes">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn btn-ghost btn-sm btn-delete-campaign" data-id="${c.id}" data-name="${c.nome}" title="Excluir">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </td>
          </tr>`;
      }).join('');

      tbody.querySelectorAll('.btn-dispatch').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Disparar Campanha',
            message: `Disparar a campanha <strong>${btn.dataset.name}</strong>? Os envios serão agendados e processados pelo worker.`,
            confirmText: 'Disparar',
            onConfirm: async () => {
              try {
                const res = await api.campanhas.disparar(btn.dataset.id);
                Toast.success('Disparada!', `${res.total} mensagens agendadas`);
                loadCampaigns();
              } catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });

      tbody.querySelectorAll('.btn-view-campaign').forEach(btn => {
        btn.addEventListener('click', () => showDetails(btn.dataset.id));
      });

      tbody.querySelectorAll('.btn-delete-campaign').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Excluir Campanha',
            message: `Excluir <strong>${btn.dataset.name}</strong>? Isso removerá todos os dados da fila.`,
            confirmText: 'Excluir',
            danger: true,
            onConfirm: async () => {
              try { await api.campanhas.remove(btn.dataset.id); Toast.success('Excluída', 'Campanha removida'); loadCampaigns(); }
              catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });
    } catch (e) { Toast.error('Erro', e.message); }
  }

  async function showDetails(id) {
    try {
      const c = await api.campanhas.get(id);
      const pct = c.total_contatos > 0 ? Math.round((c.enviados / c.total_contatos) * 100) : 0;
      const fila = (c.fila || []).slice(0, 20);
      Modal.open({
        title: c.nome,
        size: 'lg',
        body: `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            <div style="padding:14px;background:var(--glass-bg);border-radius:var(--radius-md);border:1px solid var(--glass-border)">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">STATUS</div>
              <div>${statusBadge(c.status)}</div>
            </div>
            <div style="padding:14px;background:var(--glass-bg);border-radius:var(--radius-md);border:1px solid var(--glass-border)">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">PROGRESSO</div>
              <div style="font-weight:600">${c.enviados}/${c.total_contatos} (${pct}%)</div>
              <div class="progress-bar-wrap" style="margin-top:6px"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
            </div>
          </div>
          <div style="padding:14px;background:var(--glass-bg);border-radius:var(--radius-md);border:1px solid var(--glass-border);margin-bottom:20px">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">MENSAGEM</div>
            <div style="color:var(--text-primary);line-height:1.6">${c.mensagem}</div>
          </div>
          <div style="font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:10px">FILA (últimos 20)</div>
          <div style="max-height:300px;overflow-y:auto">
            ${fila.map(f => `<div class="log-item"><span class="badge ${f.status === 'enviado' ? 'badge-success' : f.status === 'erro' ? 'badge-danger' : f.status === 'processando' ? 'badge-warning' : 'badge-muted'}" style="min-width:80px">${f.status}</span><div style="flex:1"><div class="log-phone">${f.telefone}</div><div class="log-message">${f.mensagem.substring(0, 60)}</div></div><div class="log-time">${new Date(f.agendado_para).toLocaleString('pt-BR')}</div></div>`).join('') || '<div class="empty-state" style="padding:20px"><p>Nenhum item na fila</p></div>'}
          </div>`
      });
    } catch (e) { Toast.error('Erro', e.message); }
  }

  function init() {
    loadCampaigns();
    document.getElementById('btn-new-campaign')?.addEventListener('click', () => {
      api.listas.list().then(lists => {
        Modal.form({
          title: 'Nova Campanha',
          fields: [
            { name: 'nome', label: 'Nome da campanha', required: true, placeholder: 'Ex: Promoção de Verão' },
            { name: 'mensagem', label: 'Mensagem (use {nome} para personalizar)', type: 'textarea', required: true, placeholder: 'Olá {nome}, temos uma oferta especial para você!' },
            { name: 'lista_id', label: 'Lista de contatos', type: 'select', options: lists.map(l => ({ value: l.id, label: `${l.nome} (${l.total_contatos} contatos)` })), required: true },
            { type: 'row', fields: [
              { name: 'delay_min', label: 'Delay mínimo (seg)', type: 'number', value: '5', min: '1' },
              { name: 'delay_max', label: 'Delay máximo (seg)', type: 'number', value: '15', min: '1' }
            ]}
          ],
          submitText: 'Criar Campanha',
          onSubmit: async (data, close) => {
            try { await api.campanhas.create(data); close(); Toast.success('Criada!', 'Campanha criada'); loadCampaigns(); }
            catch (e) { Toast.error('Erro', e.message); }
          }
        });
      });
    });

    setInterval(() => { if (document.getElementById('campaigns-tbody')) loadCampaigns(); }, 10000);
  }

  return { render, init };
})();

window.CampaignsPage = CampaignsPage;
