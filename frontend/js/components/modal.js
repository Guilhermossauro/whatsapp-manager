const Modal = (() => {
  function open({ title, body, footer, onClose, size = 'default' }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const maxWidth = size === 'lg' ? '720px' : size === 'sm' ? '380px' : '520px';
    overlay.innerHTML = `
      <div class="modal-box" style="max-width:${maxWidth}">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>`;
    document.getElementById('modal-container').appendChild(overlay);

    const closeModal = () => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        onClose && onClose();
      }, 180);
    };

    overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    return { close: closeModal, overlay };
  }

  function confirm({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, danger = false }) {
    const { close } = open({
      title,
      body: `<p style="color:var(--text-secondary);font-size:15px;line-height:1.6">${message}</p>`,
      footer: `
        <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm">${confirmText}</button>
      `
    });
    document.getElementById('modal-cancel').addEventListener('click', close);
    document.getElementById('modal-confirm').addEventListener('click', () => { close(); onConfirm && onConfirm(); });
  }

  function form({ title, fields, submitText = 'Salvar', onSubmit }) {
    const fieldsHtml = fields.map(f => {
      if (f.type === 'textarea') {
        return `<div class="form-group"><label class="form-label">${f.label}</label><textarea class="form-control" name="${f.name}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}>${f.value || ''}</textarea></div>`;
      }
      if (f.type === 'select') {
        const opts = f.options.map(o => `<option value="${o.value}" ${f.value === o.value ? 'selected' : ''}>${o.label}</option>`).join('');
        return `<div class="form-group"><label class="form-label">${f.label}</label><select class="form-control" name="${f.name}" ${f.required ? 'required' : ''}><option value="">Selecione...</option>${opts}</select></div>`;
      }
      if (f.type === 'row') {
        const inner = f.fields.map(rf => `<div class="form-group"><label class="form-label">${rf.label}</label><input class="form-control" type="${rf.type || 'text'}" name="${rf.name}" placeholder="${rf.placeholder || ''}" value="${rf.value || ''}" ${rf.required ? 'required' : ''} min="${rf.min || ''}" /></div>`).join('');
        return `<div class="form-row">${inner}</div>`;
      }
      return `<div class="form-group"><label class="form-label">${f.label}</label><input class="form-control" type="${f.type || 'text'}" name="${f.name}" placeholder="${f.placeholder || ''}" value="${f.value || ''}" ${f.required ? 'required' : ''} /></div>`;
    }).join('');

    const { close } = open({
      title,
      body: `<form id="modal-form">${fieldsHtml}</form>`,
      footer: `<button class="btn btn-ghost" id="modal-cancel">${'Cancelar'}</button><button class="btn btn-primary" id="modal-submit">${submitText}</button>`
    });

    document.getElementById('modal-cancel').addEventListener('click', close);
    document.getElementById('modal-submit').addEventListener('click', () => {
      const formEl = document.getElementById('modal-form');
      if (!formEl.checkValidity()) { formEl.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(formEl).entries());
      onSubmit(data, close);
    });
  }

  return { open, confirm, form };
})();

window.Modal = Modal;
