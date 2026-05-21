const App = (() => {
  const pages = {
    dashboard: { title: 'Dashboard', module: () => window.DashboardPage },
    contacts: { title: 'Contatos', module: () => window.ContactsPage },
    lists: { title: 'Listas', module: () => window.ListsPage },
    campaigns: { title: 'Campanhas', module: () => window.CampaignsPage },
    flows: { title: 'Fluxos', module: () => window.FlowsPage },
    whatsapp: { title: 'WhatsApp', module: () => window.WhatsAppPage },
    api: { title: 'API', module: () => window.ApiPage }
  };

  let currentPage = null;
  let waStatusInterval = null;

  function navigate(pageId) {
    if (currentPage === pageId) return;
    currentPage = pageId;
    const page = pages[pageId];
    if (!page) return;
    document.getElementById('page-title').textContent = page.title;
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });
    const content = document.getElementById('page-content');
    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
    setTimeout(() => {
      const mod = page.module();
      if (mod) {
        content.innerHTML = mod.render();
        mod.init && mod.init();
      }
    }, 50);
  }

  function updateWaStatus() {
    api.whatsapp.status().then(session => {
      const dot = document.getElementById('wa-dot');
      const text = document.getElementById('wa-status-text');
      const badge = document.getElementById('wa-status-badge');
      if (!dot) return;
      dot.className = `wa-dot ${session.status === 'connected' ? 'connected' : session.status === 'aguardando_scan' ? 'connecting' : 'disconnected'}`;
      text.textContent = session.status === 'connected' ? session.phone || 'Conectado' : session.status === 'aguardando_scan' ? 'Aguardando scan...' : 'Desconectado';
      if (badge) badge.className = `nav-badge ${session.status === 'connected' ? 'connected' : ''}`;
    }).catch(() => {});
  }

  function init() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.dataset.page);
        if (window.innerWidth <= 768) {
          document.getElementById('sidebar').classList.remove('open');
        }
      });
    });

    document.getElementById('sidebarToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });

    navigate('dashboard');
    updateWaStatus();
    waStatusInterval = setInterval(updateWaStatus, 5000);
  }

  return { navigate, init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
window.App = App;
