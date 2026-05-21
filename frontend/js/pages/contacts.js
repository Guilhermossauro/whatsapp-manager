const ContactsPage = (() => {
  let currentListId = null;
  let currentSearch = '';
  let currentPage = 1;

  function render() {
    return `
      <div class="page-header">
        <h2 class="gradient-text">Contatos</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="btn-import-csv">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar CSV
          </button>
          <button class="btn btn-primary" id="btn-new-contact">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Contato
          </button>
        </div>
      </div>
      <div class="glass-card section-card">
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
          <div class="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar contato..." id="contact-search" />
          </div>
          <select class="form-control" id="list-filter" style="width:auto;min-width:160px">
            <option value="">Todas as listas</option>
          </select>
          <button class="refresh-btn" id="contacts-refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Nome</th><th>Telefone</th><th>Lista</th><th>Criado em</th><th></th></tr></thead>
            <tbody id="contacts-tbody"><tr><td colspan="5"><div class="loading-spinner" style="height:60px"><div class="spinner"></div></div></td></tr></tbody>
          </table>
        </div>
        <div id="contacts-pagination" style="margin-top:16px;display:flex;gap:8px;align-items:center;justify-content:flex-end;flex-wrap:wrap"></div>
      </div>`;
  }

  async function loadLists() {
    try {
      const lists = await api.listas.list();
      const sel = document.getElementById('list-filter');
      if (!sel) return;
      lists.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = `${l.nome} (${l.total_contatos})`;
        sel.appendChild(opt);
      });
      if (currentListId) sel.value = currentListId;
    } catch (e) {}
  }

  async function loadContacts() {
    const tbody = document.getElementById('contacts-tbody');
    if (!tbody) return;
    try {
      const res = await api.contatos.list({ lista_id: currentListId || '', search: currentSearch, page: currentPage, limit: 50 });
      const contacts = res.data || [];
      if (contacts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><h3>Nenhum contato encontrado</h3><p>Importe um CSV ou adicione manualmente</p></div></td></tr>`;
        return;
      }
      tbody.innerHTML = contacts.map(c => `
        <tr>
          <td><strong style="color:var(--text-primary)">${c.nome}</strong></td>
          <td>${c.telefone}</td>
          <td>${c.lista_nome ? `<span class="badge badge-purple">${c.lista_nome}</span>` : '<span class="badge badge-muted">Sem lista</span>'}</td>
          <td style="font-size:12px">${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
          <td>
            <button class="btn btn-ghost btn-sm btn-delete-contact" data-id="${c.id}" data-name="${c.nome}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </td>
        </tr>`).join('');

      tbody.querySelectorAll('.btn-delete-contact').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Excluir Contato',
            message: `Tem certeza que deseja excluir <strong>${btn.dataset.name}</strong>?`,
            confirmText: 'Excluir',
            danger: true,
            onConfirm: async () => {
              try {
                await api.contatos.remove(btn.dataset.id);
                Toast.success('Excluído', 'Contato removido');
                loadContacts();
              } catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });

      const pagination = document.getElementById('contacts-pagination');
      if (pagination) {
        const totalPages = Math.ceil(res.total / 50);
        pagination.innerHTML = `<span style="color:var(--text-muted);font-size:13px">${res.total} contatos</span>`;
        if (totalPages > 1) {
          for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-ghost'}`;
            btn.textContent = i;
            btn.addEventListener('click', () => { currentPage = i; loadContacts(); });
            pagination.appendChild(btn);
          }
        }
      }
    } catch (e) { Toast.error('Erro', e.message); }
  }

  function openImportModal() {
    Modal.open({
      title: 'Importar CSV',
      body: `
        <div class="form-group">
          <label class="form-label">Lista de destino <span style="color:var(--accent-red)">*</span></label>
          <select class="form-control" id="import-list-id" required></select>
        </div>
        <div class="upload-zone" id="upload-zone">
          <input type="file" accept=".csv" id="csv-file-input" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <h3>Arraste o CSV aqui</h3>
          <p>ou clique para selecionar · Formato: nome,telefone</p>
          <div id="file-name-display" style="margin-top:8px;color:var(--accent-cyan);font-size:13px"></div>
        </div>`,
      footer: `<button class="btn btn-ghost" id="import-cancel">Cancelar</button><button class="btn btn-primary" id="import-submit">Importar</button>`
    });

    api.listas.list().then(lists => {
      const sel = document.getElementById('import-list-id');
      if (!sel) return;
      lists.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.nome;
        sel.appendChild(opt);
      });
    });

    document.getElementById('csv-file-input')?.addEventListener('change', function() {
      document.getElementById('file-name-display').textContent = this.files[0]?.name || '';
    });

    document.getElementById('import-cancel')?.addEventListener('click', () => document.querySelector('.modal-overlay')?.remove());
    document.getElementById('import-submit')?.addEventListener('click', async () => {
      const listaId = document.getElementById('import-list-id')?.value;
      const fileInput = document.getElementById('csv-file-input');
      if (!listaId) { Toast.warning('Atenção', 'Selecione uma lista'); return; }
      if (!fileInput?.files[0]) { Toast.warning('Atenção', 'Selecione um arquivo CSV'); return; }
      const formData = new FormData();
      formData.append('csv', fileInput.files[0]);
      try {
        const res = await api.contatos.import(listaId, formData);
        document.querySelector('.modal-overlay')?.remove();
        Toast.success('Importado!', `${res.imported} contatos importados`);
        loadContacts();
      } catch (e) { Toast.error('Erro na importação', e.message); }
    });
  }

  function init() {
    loadLists();
    loadContacts();

    document.getElementById('btn-new-contact')?.addEventListener('click', () => {
      api.listas.list().then(lists => {
        Modal.form({
          title: 'Novo Contato',
          fields: [
            { name: 'nome', label: 'Nome', required: true, placeholder: 'João Silva' },
            { name: 'telefone', label: 'Telefone', required: true, placeholder: '5511999999999' },
            { name: 'lista_id', label: 'Lista (opcional)', type: 'select', options: lists.map(l => ({ value: l.id, label: l.nome })) }
          ],
          submitText: 'Criar Contato',
          onSubmit: async (data, close) => {
            try {
              await api.contatos.create(data);
              close();
              Toast.success('Criado!', 'Contato adicionado');
              loadContacts();
            } catch (e) { Toast.error('Erro', e.message); }
          }
        });
      });
    });

    document.getElementById('btn-import-csv')?.addEventListener('click', openImportModal);

    let searchTimeout;
    document.getElementById('contact-search')?.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => { currentSearch = this.value; currentPage = 1; loadContacts(); }, 400);
    });

    document.getElementById('list-filter')?.addEventListener('change', function() {
      currentListId = this.value || null;
      currentPage = 1;
      loadContacts();
    });

    document.getElementById('contacts-refresh')?.addEventListener('click', function() {
      this.classList.add('spinning');
      loadContacts().finally(() => this.classList.remove('spinning'));
    });
  }

  return { render, init };
})();

const ListsPage = (() => {
  function render() {
    return `
      <div class="page-header">
        <h2 class="gradient-text">Listas</h2>
        <button class="btn btn-primary" id="btn-new-list">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova Lista
        </button>
      </div>
      <div class="glass-card section-card">
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Nome</th><th>Total Contatos</th><th>Criado em</th><th></th></tr></thead>
            <tbody id="lists-tbody"><tr><td colspan="4"><div class="loading-spinner" style="height:60px"><div class="spinner"></div></div></td></tr></tbody>
          </table>
        </div>
      </div>`;
  }

  async function loadLists() {
    const tbody = document.getElementById('lists-tbody');
    if (!tbody) return;
    try {
      const lists = await api.listas.list();
      if (lists.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg><h3>Nenhuma lista</h3><p>Crie uma lista para organizar seus contatos</p></div></td></tr>`;
        return;
      }
      tbody.innerHTML = lists.map(l => `
        <tr>
          <td><strong style="color:var(--text-primary)">${l.nome}</strong></td>
          <td><span class="badge badge-purple">${l.total_contatos} contatos</span></td>
          <td style="font-size:12px">${new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="App.navigate('contacts')" title="Ver contatos">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn btn-ghost btn-sm btn-delete-list" data-id="${l.id}" data-name="${l.nome}" style="margin-left:4px">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </td>
        </tr>`).join('');
      tbody.querySelectorAll('.btn-delete-list').forEach(btn => {
        btn.addEventListener('click', () => {
          Modal.confirm({
            title: 'Excluir Lista',
            message: `Excluir a lista <strong>${btn.dataset.name}</strong>? Os contatos serão desvinculados.`,
            confirmText: 'Excluir',
            danger: true,
            onConfirm: async () => {
              try { await api.listas.remove(btn.dataset.id); Toast.success('Excluída', 'Lista removida'); loadLists(); }
              catch (e) { Toast.error('Erro', e.message); }
            }
          });
        });
      });
    } catch (e) { Toast.error('Erro', e.message); }
  }

  function init() {
    loadLists();
    document.getElementById('btn-new-list')?.addEventListener('click', () => {
      Modal.form({
        title: 'Nova Lista',
        fields: [{ name: 'nome', label: 'Nome da lista', required: true, placeholder: 'Ex: Clientes VIP' }],
        submitText: 'Criar Lista',
        onSubmit: async (data, close) => {
          try { await api.listas.create(data); close(); Toast.success('Criada!', 'Lista criada'); loadLists(); }
          catch (e) { Toast.error('Erro', e.message); }
        }
      });
    });
  }

  return { render, init };
})();

window.ContactsPage = ContactsPage;
window.ListsPage = ListsPage;
