const Toast = (() => {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#10b981"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#ef4444"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#f59e0b"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#06b6d4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };

  function show(type, title, message, duration = 4000) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-icon">${icons[type] || icons.info}</div><div class="toast-body"><div class="toast-title">${title}</div>${message ? `<div class="toast-msg">${message}</div>` : ''}</div>`;
    container.appendChild(el);
    const timer = setTimeout(() => remove(el), duration);
    el.addEventListener('click', () => { clearTimeout(timer); remove(el); });
    return el;
  }

  function remove(el) {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  return {
    success: (title, msg) => show('success', title, msg),
    error: (title, msg) => show('error', title, msg),
    warning: (title, msg) => show('warning', title, msg),
    info: (title, msg) => show('info', title, msg)
  };
})();

window.Toast = Toast;
