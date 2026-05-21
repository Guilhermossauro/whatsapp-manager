const FlowsPage = (() => {
  let selectedFlow = null;

  function render() {
    return `
      <div class="page-header">
        <h2 class="gradient-text">Fluxos de Mensagens</h2>
        <button class="btn btn-primary" id="btn-new-flow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Fluxo
        </button>
      </div>
      <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;align-items:start">
        <div>
          <div class="glass-card section-card">
            <div class="section-card-header"><div class="section-card-title">Meus Fluxos</div></div>
            <div id="flows-list"><div class="loading-spinner" style="height:80px"><div class="spinner"></div></div></div>
          </div>
        </div>
        <div id="flow-detail-area">
          <div class="glass-card section-card" style="text-align:center;padding:60px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto 16px;color:var(--text-muted)"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
            <p style="color:var(--text-muted)">Selecione um fluxo para editar</p>
          </div>
        </div>
      </div>`;
  }

  async function loadFlows() {
    const list = document.getElementById('flows-list');
    if (!list) return;
    try {
      const flows = await api.fluxos.list();
      if (flows.length === 0) {
        list.innerHTML = `<div class="empty-state" style="padding:30px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/></svg><p>Nenhum fluxo criado</p></div>`;
        return;
      }
      list.innerHTML = flows.map(f => `
        <div class="flow-list-item" data-id="${f.id}" style="padding:12px;border-radius:var(--radius-md);cursor:pointer;transition:var(--transition);border:1px solid ${selectedFlow === f.id ? 'rgba(124,58,237,0.4)' : 'transparent'};background:${selectedFlow === f.id ? 'rgba(124,58,237,0.1)' : 'transparent'};margin-bottom:6px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div>
              <div style="font-weight:600;color:var(--text-primary);font-size:14px">${f.nome}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${f.total_etapas} etapas · ${f.execucoes_ativas || 0} ativos</div>
            </div>
            <div style="display:flex;gap:4px">
              <span class="badge ${f.ativo ? 'badge-success' : 'badge-muted'}" style="font-size:10px">${f.ativo ? 'Ativo' : 'Inativo'}</span>
            </div>
          </div>
        </div>`).join('');
      list.querySelectorAll('.flow-list-item').forEach(item => {
        item.addEventListener('click', () => { selectedFlow = item.dataset.id; loadFlowDetail(item.dataset.id); loadFlows(); });
      });
    } catch (e) { Toast.error('Erro', e.message); }
  }

  async function loadFlowDetail(id) {
    const area = document.getElementById('flow-detail-area');
    if (!area) return;
    area.innerHTML = '<div class="loading-spinner" style="height:200px"><div class="spinner"></div></div>';
    try {
      const flow = await api.fluxos.get(id);
      const etapas = flow.etapas || [];
      area.innerHTML = `
        <div class="glass-card section-card">
          <div class="section-card-header">
            <div>
              <div class="section-card-title">${flow.nome}</div>
              ${flow.descricao ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px">${flow.descricao}</div>` : ''}
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" id="btn-enroll-list">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                Adicionar Lista
              </button>
              <button class="btn btn-ghost btn-sm btn-delete-flow" data-id="${flow.id}" data-name="${flow.nome}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px">
            <div style="text-align:center;padding:14px;background:rgba(124,58,237,0.08);border-radius:var(--radius-md);border:1px solid rgba(124,58,237,0.2)">
              <div style="font-size:22px;font-weight:700">${etapas.length}</div>
              <div style="font-size:12px;color:var(--text-muted)">Etapas</div>
            </div>
            <div style="text-align:center;padding:14px;background:rgba(6,182,212,0.08);border-radius:var(--radius-md);border:1px solid rgba(6,182,212,0.2)">
              <div style="font-size:22px;font-weight:700">${flow.execucoes?.filter(e => e.status === 'ativo').length || 0}</div>
              <div style="font-size:12px;color:var(--text-muted)">Em Execução</div>
            </div>
            <div style="text-align:center;padding:14px;background:rgba(16,185,129,0.08);border-radius:var(--radius-md);border:1px solid rgba(16,185,129,0.2)">
              <div style="font-size:22px;font-weight:700">${flow.execucoes?.filter(e => e.status === 'concluido').length || 0}</div>
              <div style="font-size:12px;color:var(--text-muted)">Concluídos</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div style="font-weight:600;color:var(--text-primary)">Etapas do Fluxo</div>
            <button class="btn btn-primary btn-sm" id="btn-add-step">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar Etapa
            </button>
          </div>

          <div class="flow-steps-list" id="steps-container">
            ${etapas.length === 0 ? '<div class="empty-state" style="padding:30px"><p>Nenhuma etapa. Adicione etapas ao fluxo.</p></div>' :
              etapas.map((step, idx) => `
                ${idx > 0 ? `<div class="step-connector"><span>+${step.delay_minutos} min</span></div>` : ''}
                <div class="flow-step-item" data-step-id="${step.id}">
                  <div class="step-number">${idx + 1}</div>
                  <div class="step-content">
                    <div class="step-message">${step.mensagem}</div>
                    <div class="step-delay">${idx === 0 ? 'Enviada imediatamente ao entrar no fluxo' : `Aguarda ${step.delay_minutos} min após etapa anterior`}</div>
                  </div>
                  <div style="display:flex;gap:4px">
                    <button class="btn btn-ghost btn-sm btn-edit-step" data-step-id="${step.id}" data-message="${step.mensagem.replace(/"/g,'&quot;')}" data-delay="${step.delay_minutos}" data-ordem="${step.ordem}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn btn-ghost btn-sm btn-delete-step" data-step-id="${step.id}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>`).join('')}
          </div>
        </div>`;

      document.getElementById('btn-add-step')?.addEventListener('click', () => {
        const isFirst = etapas.length === 0;
        Modal.form({
          title: 'Nova Etapa',
          fields: [
            { name: 'mensagem', label: 'Mensagem (use {nome} para personalizar)', type: 'textarea', required: true, placeholder: 'Olá {nome}! Bem-vindo ao nosso fluxo.' },
            ...(isFirst ? [] : [{ name: 'delay_minutos', label: 'Delay após etapa anterior (minutos)', type: 'number', value: '2', min: '0' }])
          ],
          submitText: 'Adicionar Etapa',
          onSubmit: async (data, close) => {
            try {
              await api.fluxos.addStep(id, { mensagem: data.mensagem, delay_minutos: parseInt(data.delay_minutos) || 0, ordem: etapas.length });
              close();
              Toast.success('Etapa adicionada!', '');
              loadFlowDetail(id);
              loadFlows();
            } catch (e) { Toast.error('Erro', e.message); }
          }
        });
      });

      document.getElementById('btn-enroll-list')?.addEventListener('click', () => {
        api.listas.list().then(lists => {
          if (lists.length === 0) { Toast.warning('Sem listas', 'Crie uma lista primeiro'); return; }
          Modal.form({
            title: 'Adicionar Lista ao Fluxo',
            fields: [{ name: 'lista_id', label: 'Selecione a lista', type: 'select', required: true, options: lists.map(l => ({ value: l.id, label: `${l.nome} (${l.total_contatos} contatos)` })) }],
            submitText: 'Adicionar ao Fluxo',
            onSubmit: async (data, close) => {
              try {
                const res = await api.fluxos.enrollList(id, data.lista_id);
                close();
                Toast.success('Adicionados!', `${res.enrolled} contatos adicionados ao fluxo. ${res.skipped > 0 ? res.skipped + ' já estavam no fluxo.' : ''}`);
                loadFlowDetail(id);
                loadFlows();
              } catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });

      document.getElementById('btn-delete-flow')?.addEventListener('click', function() {
        Modal.confirm({
          title: 'Excluir Fluxo',
          message: `Excluir o fluxo <strong>${this.dataset.name}</strong>? Todas as execuções serão canceladas.`,
          confirmText: 'Excluir',
          danger: true,
          onConfirm: async () => {
            try {
              await api.fluxos.remove(this.dataset.id);
              selectedFlow = null;
              document.getElementById('flow-detail-area').innerHTML = `<div class="glass-card section-card" style="text-align:center;padding:60px"><p style="color:var(--text-muted)">Selecione um fluxo para editar</p></div>`;
              Toast.success('Excluído', 'Fluxo removido');
              loadFlows();
            } catch (e) { Toast.error('Erro', e.message); }
          }
        });
      });

      document.querySelectorAll('.btn-edit-step').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.form({
            title: 'Editar Etapa',
            fields: [
              { name: 'mensagem', label: 'Mensagem', type: 'textarea', required: true, value: btn.dataset.message.replace(/&quot;/g, '"') },
              { name: 'delay_minutos', label: 'Delay (minutos)', type: 'number', value: btn.dataset.delay, min: '0' }
            ],
            submitText: 'Salvar',
            onSubmit: async (data, close) => {
              try {
                await api.fluxos.updateStep(btn.dataset.stepId, { mensagem: data.mensagem, delay_minutos: parseInt(data.delay_minutos) || 0 });
                close();
                Toast.success('Salvo!', '');
                loadFlowDetail(id);
              } catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });

      document.querySelectorAll('.btn-delete-step').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Remover Etapa',
            message: 'Remover esta etapa do fluxo?',
            confirmText: 'Remover',
            danger: true,
            onConfirm: async () => {
              try { await api.fluxos.removeStep(btn.dataset.stepId); Toast.success('Removida', ''); loadFlowDetail(id); loadFlows(); }
              catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });
    } catch (e) { Toast.error('Erro', e.message); }
  }

  function init() {
    loadFlows();
    document.getElementById('btn-new-flow')?.addEventListener('click', () => {
      Modal.form({
        title: 'Novo Fluxo',
        fields: [
          { name: 'nome', label: 'Nome do fluxo', required: true, placeholder: 'Ex: Onboarding de Clientes' },
          { name: 'descricao', label: 'Descrição (opcional)', placeholder: 'Descreva o objetivo deste fluxo' }
        ],
        submitText: 'Criar Fluxo',
        onSubmit: async (data, close) => {
          try { const f = await api.fluxos.create(data); close(); Toast.success('Criado!', 'Fluxo criado'); loadFlows(); selectedFlow = f.id; loadFlowDetail(f.id); }
          catch (e) { Toast.error('Erro', e.message); }
        }
      });
    });
  }

  return { render, init };
})();

window.FlowsPage = FlowsPage;
