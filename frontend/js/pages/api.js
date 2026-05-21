const ApiPage = (() => {
  const DEFAULT_KEY = 'whats-super-secret-key-2024';
  let currentApiKey = localStorage.getItem('wm_api_key') || DEFAULT_KEY;

  const endpoints = [
    { method: 'GET',    path: '/api/stats',                          desc: 'Estatísticas do dashboard' },
    { method: 'GET',    path: '/api/contatos',                       desc: 'Listar contatos (?lista_id=&search=&page=&limit=)' },
    { method: 'POST',   path: '/api/contatos',                       desc: 'Criar contato { nome, telefone, lista_id }' },
    { method: 'DELETE', path: '/api/contatos/:id',                   desc: 'Excluir contato' },
    { method: 'POST',   path: '/api/contatos/import/:listaId',       desc: 'Importar CSV (multipart: csv)' },
    { method: 'GET',    path: '/api/listas',                         desc: 'Listar listas' },
    { method: 'POST',   path: '/api/listas',                         desc: 'Criar lista { nome }' },
    { method: 'DELETE', path: '/api/listas/:id',                     desc: 'Excluir lista' },
    { method: 'GET',    path: '/api/campanhas',                      desc: 'Listar campanhas' },
    { method: 'POST',   path: '/api/campanhas',                      desc: 'Criar campanha { nome, mensagem, delay_min, delay_max, lista_id }' },
    { method: 'GET',    path: '/api/campanhas/:id',                  desc: 'Detalhes da campanha + fila' },
    { method: 'POST',   path: '/api/campanhas/:id/disparar',         desc: 'Disparar campanha (agenda envios na fila)' },
    { method: 'DELETE', path: '/api/campanhas/:id',                  desc: 'Excluir campanha' },
    { method: 'GET',    path: '/api/fluxos',                         desc: 'Listar fluxos' },
    { method: 'POST',   path: '/api/fluxos',                         desc: 'Criar fluxo { nome, descricao }' },
    { method: 'GET',    path: '/api/fluxos/:id',                     desc: 'Detalhes do fluxo com etapas e execuções' },
    { method: 'PUT',    path: '/api/fluxos/:id',                     desc: 'Atualizar fluxo { nome, descricao, ativo }' },
    { method: 'DELETE', path: '/api/fluxos/:id',                     desc: 'Excluir fluxo' },
    { method: 'POST',   path: '/api/fluxos/:id/etapas',              desc: 'Adicionar etapa { mensagem, delay_minutos, ordem }' },
    { method: 'PUT',    path: '/api/fluxos/etapas/:id',              desc: 'Atualizar etapa { mensagem, delay_minutos }' },
    { method: 'DELETE', path: '/api/fluxos/etapas/:id',              desc: 'Remover etapa' },
    { method: 'POST',   path: '/api/fluxos/:id/adicionar-lista',     desc: 'Adicionar lista ao fluxo { lista_id }' },
    { method: 'GET',    path: '/api/fluxos/:id/execucoes',           desc: 'Listar execuções do fluxo' },
    { method: 'GET',    path: '/api/whatsapp/status',                desc: 'Status da conexão WhatsApp' },
    { method: 'POST',   path: '/api/whatsapp/connect',               desc: 'Iniciar conexão (gerar QR)' },
    { method: 'POST',   path: '/api/whatsapp/scan',                  desc: 'Simular scan do QR Code (mock)' },
    { method: 'POST',   path: '/api/whatsapp/disconnect',            desc: 'Desconectar WhatsApp' },
    { method: 'POST',   path: '/api/whatsapp/send-test',             desc: 'Envio de teste { phone, message }' },
    { method: 'GET',    path: '/api/whatsapp/logs',                  desc: 'Log de mensagens (?page=&limit=)' },
    { method: 'GET',    path: '/api/fila',                           desc: 'Status da fila de envios' },
    { method: 'GET',    path: '/api/keys',                           desc: 'Listar API keys 🔒' },
    { method: 'POST',   path: '/api/keys',                           desc: 'Criar API key { nome, permissoes } 🔒' },
    { method: 'PATCH',  path: '/api/keys/:id',                       desc: 'Atualizar permissões { permissoes } 🔒' },
    { method: 'DELETE', path: '/api/keys/:id',                       desc: 'Excluir API key 🔒' },
  ];

  const PERM_OPTIONS = [
    { value: 'GET',              label: 'GET',              desc: 'Somente leitura' },
    { value: 'POST',             label: 'POST/PUT',         desc: 'Criar e editar' },
    { value: 'DELETE',           label: 'DELETE',           desc: 'Excluir' },
    { value: 'GET,POST',         label: 'GET + POST/PUT',   desc: 'Ler e criar' },
    { value: 'GET,DELETE',       label: 'GET + DELETE',     desc: 'Ler e excluir' },
    { value: 'POST,DELETE',      label: 'POST + DELETE',    desc: 'Criar e excluir' },
    { value: 'GET,POST,DELETE',  label: 'Todas (Full)',     desc: 'Acesso completo' },
  ];

  function methodClass(m) {
    return { GET: 'method-get', POST: 'method-post', PUT: 'method-put', PATCH: 'method-put', DELETE: 'method-delete' }[m] || 'method-get';
  }

  function permBadges(perms) {
    if (!perms) perms = 'GET,POST,DELETE';
    const list = perms.split(',');
    return list.map(p => {
      const cls = { GET: 'method-get', POST: 'method-post', DELETE: 'method-delete' }[p.trim()] || 'method-get';
      return `<span class="method-badge ${cls}" style="font-size:9px;padding:2px 6px">${p.trim()}</span>`;
    }).join(' ');
  }

  function render() {
    const isDefault = currentApiKey === DEFAULT_KEY;
    return `
      <div class="page-header">
        <h2 class="gradient-text">API</h2>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
        <div class="glass-card section-card">
          <div class="section-card-header"><div class="section-card-title">Autenticação</div></div>
          ${isDefault ? `
          <div style="background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.3);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#ffc107">
            ⚠️ Usando a <strong>chave padrão</strong>. Crie uma chave personalizada para produção.
          </div>` : ''}
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
            Todas as rotas requerem autenticação. Envie o header:<br/>
            <code style="color:var(--accent-cyan)">x-api-key: sua-chave</code>
          </p>
          <div class="form-group">
            <label class="form-label">API Key ativa</label>
            <div style="display:flex;gap:8px">
              <input class="form-control" type="text" id="current-api-key" value="${currentApiKey}" placeholder="Cole sua API key aqui..." style="font-family:monospace;font-size:12px" />
              <button class="btn btn-primary btn-sm" id="btn-save-key">Salvar</button>
            </div>
          </div>
          <div style="margin-top:10px;font-size:12px;color:var(--text-secondary)">
            Chave padrão: <code style="color:var(--accent-cyan);cursor:pointer" id="use-default-key">${DEFAULT_KEY}</code>
          </div>
        </div>

        <div class="glass-card section-card">
          <div class="section-card-header">
            <div class="section-card-title">Gerenciar Keys</div>
            <button class="btn btn-primary btn-sm" id="btn-create-key">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nova Key
            </button>
          </div>
          <div id="keys-list"><div class="loading-spinner" style="height:60px"><div class="spinner"></div></div></div>
        </div>
      </div>

      <div class="glass-card section-card">
        <div class="section-card-header">
          <div class="section-card-title">Referência de Endpoints</div>
          <span class="badge badge-purple">${endpoints.length} endpoints</span>
        </div>
        <div id="endpoints-list">
          ${endpoints.map(ep => `
            <div class="api-endpoint">
              <div class="api-endpoint-header">
                <span class="method-badge ${methodClass(ep.method)}">${ep.method}</span>
                <span class="api-endpoint-path">${ep.path}</span>
                <span class="api-endpoint-desc">${ep.desc}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  async function loadKeys() {
    const list = document.getElementById('keys-list');
    if (!list) return;

    try {
      const keys = await api.keys.list(currentApiKey);
      if (!Array.isArray(keys)) {
        const msg = keys.error || 'Erro ao carregar keys';
        list.innerHTML = `<div class="empty-state" style="padding:20px"><p style="color:var(--accent-red)">${msg}</p></div>`;
        return;
      }
      if (keys.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:20px"><p>Nenhuma key criada</p></div>';
        return;
      }

      list.innerHTML = keys.map(k => `
        <div class="api-key-item" style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span style="font-weight:600;color:var(--text-primary);font-size:13px">${k.nome}</span>
              <span style="display:flex;gap:3px">${permBadges(k.permissoes)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
              <code style="font-size:11px;color:var(--text-secondary);background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${k.chave}</code>
              <button class="copy-btn" data-key="${k.chave}" title="Copiar chave" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:2px">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
            <button class="btn btn-ghost btn-sm btn-edit-perms" data-id="${k.id}" data-nome="${k.nome}" data-perms="${k.permissoes || 'GET,POST,DELETE'}" title="Editar permissões">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-delete-key" data-id="${k.id}" data-name="${k.nome}" title="Excluir">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </div>`).join('');

      list.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          navigator.clipboard.writeText(btn.dataset.key)
            .then(() => Toast.success('Copiado!', 'Chave copiada para área de transferência'));
        });
      });

      list.querySelectorAll('.btn-edit-perms').forEach(btn => {
        btn.addEventListener('click', () => openEditPermsModal(btn.dataset.id, btn.dataset.nome, btn.dataset.perms));
      });

      list.querySelectorAll('.btn-delete-key').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Excluir API Key',
            message: `Excluir a key <strong>${btn.dataset.name}</strong>? Qualquer integração usando esta chave deixará de funcionar.`,
            confirmText: 'Excluir',
            danger: true,
            onConfirm: async () => {
              try {
                await api.keys.remove(btn.dataset.id, currentApiKey);
                Toast.success('Excluída', 'API Key removida');
                loadKeys();
              } catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });
    } catch (e) {
      list.innerHTML = `<div class="empty-state" style="padding:20px"><p style="color:var(--accent-red)">Erro: ${e.message}</p></div>`;
    }
  }

  function openCreateModal() {
    // Gera uma prévia da key para o usuário ver antes de criar
    const previewKey = 'wm-' + Array.from({length: 8}, () => Math.random().toString(36)[2]).join('') + '...';

    const permOpts = PERM_OPTIONS.map(p =>
      `<option value="${p.value}" ${p.value === 'GET,POST,DELETE' ? 'selected' : ''}>${p.label} — ${p.desc}</option>`
    ).join('');

    Modal.open({
      title: 'Nova API Key',
      content: `
        <div class="form-group">
          <label class="form-label">Nome <span style="color:var(--accent-red)">*</span></label>
          <input class="form-control" id="new-key-nome" type="text" placeholder="Ex: Integração CRM, App Mobile..." autofocus />
        </div>
        <div class="form-group">
          <label class="form-label">Permissões</label>
          <select class="form-control" id="new-key-perms">
            ${permOpts}
          </select>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:6px">
            <strong>GET</strong> = leitura &nbsp;|&nbsp; <strong>POST/PUT</strong> = criação/edição &nbsp;|&nbsp; <strong>DELETE</strong> = exclusão
          </div>
        </div>
        <div style="background:rgba(6,214,160,0.08);border:1px solid rgba(6,214,160,0.2);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--text-secondary)">
          🔑 A chave será <strong>gerada automaticamente</strong> após confirmar.
        </div>`,
      buttons: [
        { text: 'Cancelar', type: 'ghost', action: 'close' },
        {
          text: 'Gerar e Criar',
          type: 'primary',
          action: async (close) => {
            const nome = document.getElementById('new-key-nome')?.value?.trim();
            const permissoes = document.getElementById('new-key-perms')?.value;

            if (!nome) { Toast.warning('Campo obrigatório', 'Informe um nome para a key'); return; }

            try {
              const res = await api.keys.create(nome, permissoes, currentApiKey);
              if (res.error) throw new Error(res.error);
              close();
              showCreatedKeyModal(res);
              loadKeys();
            } catch (e) { Toast.error('Erro ao criar', e.message); }
          }
        }
      ]
    });
  }

  function showCreatedKeyModal(key) {
    Modal.open({
      title: '✅ Key Criada com Sucesso',
      content: `
        <div style="text-align:center;margin-bottom:16px">
          <p style="color:var(--text-secondary);font-size:13px">Copie sua chave agora. Por segurança, ela não será exibida novamente desta forma.</p>
        </div>
        <div style="background:rgba(6,214,160,0.08);border:1px solid rgba(6,214,160,0.3);border-radius:8px;padding:14px;margin-bottom:16px">
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px">Nome: <strong style="color:var(--text-primary)">${key.nome}</strong></div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px">Permissões: ${permBadges(key.permissoes)}</div>
          <code id="new-key-display" style="display:block;font-size:13px;color:var(--accent-cyan);word-break:break-all;background:rgba(0,0,0,0.3);padding:10px;border-radius:6px;cursor:pointer" title="Clique para copiar">${key.chave}</code>
        </div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button class="btn btn-primary btn-sm" id="btn-copy-new-key">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar Chave
          </button>
          <button class="btn btn-ghost btn-sm" id="btn-use-new-key">Usar como ativa</button>
        </div>`,
      buttons: [{ text: 'Fechar', type: 'ghost', action: 'close' }]
    });

    setTimeout(() => {
      document.getElementById('btn-copy-new-key')?.addEventListener('click', () => {
        navigator.clipboard.writeText(key.chave)
          .then(() => Toast.success('Copiado!', key.chave));
      });
      document.getElementById('new-key-display')?.addEventListener('click', () => {
        navigator.clipboard.writeText(key.chave)
          .then(() => Toast.success('Copiado!', ''));
      });
      document.getElementById('btn-use-new-key')?.addEventListener('click', () => {
        currentApiKey = key.chave;
        localStorage.setItem('wm_api_key', key.chave);
        const input = document.getElementById('current-api-key');
        if (input) input.value = key.chave;
        Toast.success('Key ativa!', 'Agora usando a nova chave');
      });
    }, 50);
  }

  function openEditPermsModal(id, nome, currentPerms) {
    const permOpts = PERM_OPTIONS.map(p =>
      `<option value="${p.value}" ${p.value === currentPerms ? 'selected' : ''}>${p.label} — ${p.desc}</option>`
    ).join('');

    Modal.open({
      title: `Permissões: ${nome}`,
      content: `
        <div class="form-group">
          <label class="form-label">Permissões desta key</label>
          <select class="form-control" id="edit-key-perms">
            ${permOpts}
          </select>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:6px">
            Permissões atuais: ${permBadges(currentPerms)}
          </div>
        </div>`,
      buttons: [
        { text: 'Cancelar', type: 'ghost', action: 'close' },
        {
          text: 'Salvar',
          type: 'primary',
          action: async (close) => {
            const permissoes = document.getElementById('edit-key-perms')?.value;
            try {
              const res = await api.keys.updatePerms(id, permissoes, currentApiKey);
              if (res.error) throw new Error(res.error);
              close();
              Toast.success('Atualizado!', `Permissões: ${res.permissoes}`);
              loadKeys();
            } catch (e) { Toast.error('Erro', e.message); }
          }
        }
      ]
    });
  }

  function init() {
    loadKeys();

    document.getElementById('use-default-key')?.addEventListener('click', () => {
      document.getElementById('current-api-key').value = DEFAULT_KEY;
      currentApiKey = DEFAULT_KEY;
      localStorage.setItem('wm_api_key', DEFAULT_KEY);
      Toast.info('Chave padrão', 'Usando chave padrão');
      loadKeys();
    });

    document.getElementById('btn-save-key')?.addEventListener('click', () => {
      const val = document.getElementById('current-api-key')?.value?.trim();
      if (!val) { Toast.warning('Campo vazio', 'Informe uma chave'); return; }
      currentApiKey = val;
      localStorage.setItem('wm_api_key', val);
      Toast.success('Salvo!', 'API key salva localmente');
      loadKeys();
    });

    document.getElementById('btn-create-key')?.addEventListener('click', openCreateModal);
  }

  return { render, init };
})();

window.ApiPage = ApiPage;
