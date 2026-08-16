document.addEventListener('DOMContentLoaded', () => {
  const viewRoot = document.getElementById('viewRoot');
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');

  // Carga una vista (dashboard, prestamos, devolucion, reportes, agregar-implemento)
  // dentro de #viewRoot. Se llama tanto desde el nav inferior como desde botones
  // sueltos dentro de cada vista (Accesos rápidos, etc.) gracias a window.loadView.
  async function loadView(viewName) {
    if (!viewRoot) return;
    try {
      const response = await fetch(`${viewName}.html`);
      if (!response.ok) throw new Error('No se pudo cargar la vista');

      viewRoot.innerHTML = await response.text();

      // Resalta el ítem del nav que corresponde a esta vista. Si la vista no es
      // una de las 4 pestañas principales (ej. "agregar-implemento", que se abre
      // desde Accesos rápidos), ningún ítem queda activo — igual que antes.
      navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
      });
    } catch (error) {
      console.error('Error cargando la vista:', error);
      viewRoot.innerHTML = `<p style="padding:20px;color:#dc3545;">Error al cargar: ${viewName}</p>`;
    }
  }

  // Se expone en window porque el HTML de las vistas (cargado por fetch) sigue
  // usando atributos onclick="loadView('...')" — los atributos inline sí se
  // conectan solos aunque el HTML se inserte con innerHTML, a diferencia de <script>.
  window.loadView = loadView;

  navItems.forEach(button => {
    button.addEventListener('click', () => loadView(button.dataset.view));
  });

  // Vista inicial al entrar a la app.
  loadView('dashboard');
});
