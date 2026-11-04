// Se ejecuta antes de cargar los estilos para evitar un destello del tema incorrecto.
// Bootstrap 5.3 aplica sus variantes mediante el atributo data-bs-theme del <html>.
(() => {
  const storageKey = 'hoteles-theme';
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => value === 'light' || value === 'dark';
  let selected = null;
  try { selected = localStorage.getItem(storageKey); } catch { /* El tema funciona también si el navegador bloquea el almacenamiento. */ }
  function apply(theme) {
    document.documentElement.dataset.bsTheme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14231F' : '#183D36');
    window.dispatchEvent(new Event('themechange'));
  }
  apply(valid(selected) ? selected : (preference.matches ? 'dark' : 'light'));
  window.siteTheme = {
    set(theme) {
      if (!valid(theme)) return;
      selected = theme;
      try { localStorage.setItem(storageKey, theme); } catch { /* Preferencia limitada a esta visita. */ }
      apply(theme);
    }
  };
  // Sin elección manual se sigue el tema del dispositivo, también si cambia durante la visita.
  preference.addEventListener('change', () => {
    if (!valid(selected)) apply(preference.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    selected = event.newValue;
    apply(valid(selected) ? selected : (preference.matches ? 'dark' : 'light'));
  });
})();
