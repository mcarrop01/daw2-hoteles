(() => {
  'use strict';
  // Solo se generan enlaces HTTP(S); se escapan los textos antes de crear las tarjetas.
  const safeUrl = value => { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const courseLabel = course => course.split('-').map(year => year.slice(-2)).join('–');
  const projects = window.PROJECTS.map((p, i) => ({...p, index:i + 1, web:safeUrl(p.web), figma:safeUrl(p.figma), reference:safeUrl(p.reference)}));
  const grid = document.querySelector('#project-grid');
  const search = document.querySelector('#search');
  const sort = document.querySelector('#sort');
  const courseFilter = document.querySelector('#course-filter');
  // El desplegable crece automáticamente al añadir proyectos con un nuevo course.
  const courses = [...new Set(projects.map(project => project.course))].sort((a,b) => b.localeCompare(a));
  courseFilter.innerHTML = '<option value="all">Todos los cursos</option>' + courses.map(course => `<option value="${escape(course)}">${escape(course.replace('-', '–'))}</option>`).join('');
  courseFilter.value = courses[0] || 'all';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let resultsAnimation;
  let scrollSpy;
  let filter = 'all';
  const palettes = [['#e3e8da','#476653','#f3efdb'],['#e4d8c9','#86604c','#f0e8dc'],['#dce3e6','#4c6776','#eaf0ec'],['#e7ddcf','#92754c','#f2ecdc'],['#e5dccf','#6d7453','#f4efdd'],['#e0e4d6','#626f50','#f1ead3']];
  // Ilustraciones decorativas: no representan las fachadas reales de los hoteles.
  function illustration(i) {
    const [bg, ink, wall] = palettes[(i - 1) % palettes.length];
    const modern = i % 3 === 0;
    let windows = '';
    for (let row=0;row<2;row++) for(let col=0;col<5;col++) {
      const x=106+col*38, y=54+row*47;
      windows += modern ? `<rect x="${x}" y="${y}" width="19" height="31" fill="${ink}"/><path d="M${x+10} ${y}v31" stroke="${wall}"/>` : `<path d="M${x} ${y+31}v-21a10 10 0 0 1 20 0v21Z" fill="${ink}"/><path d="M${x+10} ${y+2}v29" stroke="${wall}"/>`;
    }
    return `<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="180" fill="${bg}"/><circle cx="318" cy="43" r="22" fill="${wall}"/><path d="M89 173V42H311V173Z" fill="${wall}" stroke="${ink}"/><path d="M80 42L200 ${modern?'24':'8'} 320 42Z" fill="${ink}"/>${windows}<path d="M184 174v-34a16 16 0 0 1 32 0v34Z" fill="${ink}"/><path d="M80 92H320M85 99H315M50 174H350" stroke="${ink}"/><g fill="${ink}" opacity=".75"><ellipse cx="63" cy="145" rx="12" ry="22"/><ellipse cx="337" cy="145" rx="12" ry="22"/></g><path d="M63 145v29m274-29v29" stroke="${ink}"/></svg>`;
  }
  function link(url, text, className, label) {
    return `<a class="${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(label)} (se abre en otra pestaña)">${text}</a>`;
  }
  // La búsqueda ignora tildes y mayúsculas; los filtros y el orden se combinan.
  function render(animate = true) {
    const query = normalize(search.value.trim());
    const courseProjects = projects.filter(p => courseFilter.value === 'all' || p.course === courseFilter.value);
    const linked = courseProjects.filter(p => p.web).length;
    document.querySelector('#linked-count').textContent = linked;
    document.querySelector('#pending-count').textContent = courseProjects.length - linked;
    document.querySelector('[data-filter="all"] span').textContent = courseProjects.length;
    const visible = courseProjects.filter(p => (filter === 'all' || (filter === 'linked' ? p.web : !p.web)) && normalize(`${p.student} ${p.hotel}`).includes(query));
    if (sort.value !== 'original') visible.sort((a,b) => a[sort.value].localeCompare(b[sort.value], 'es'));
    grid.innerHTML = visible.map(p => `<div class="col-12 col-md-6 col-lg-4"><article class="card project-card"><div class="project-cover">${illustration(p.index)}<span class="project-number">${String(p.index).padStart(2,'0')} /</span><span class="cover-label">${escape(courseLabel(p.course))} · 2º DAW</span></div><div class="project-body"><div class="student-row"><span class="student"><span class="avatar" aria-hidden="true">${escape(p.student.slice(0,1))}</span>${escape(p.student)}</span><span class="status ${p.web?'linked':''}">${p.web?'Con enlace':'Enlace pendiente'}</span></div><h3>${escape(p.hotel)}</h3>${link(p.reference, 'Hotel de referencia <span aria-hidden="true">↗</span>', 'reference-link', `Hotel de referencia de ${p.student}`)}<div class="project-actions">${p.web ? link(p.web,'Visitar proyecto <span aria-hidden="true">↗</span>','btn btn-primary',`Visitar proyecto de ${p.student}`) : '<span class="pending-project">Proyecto pendiente de enlazar</span>'}${p.figma ? link(p.figma, 'Figma ↗', 'figma-link',`Figma: prototipo de ${p.student}`):''}</div></div></article></div>`).join('');
    const courseName = courseFilter.value === 'all' ? 'todos los cursos' : `curso ${courseLabel(courseFilter.value)}`;
    document.querySelector('#result-count').textContent = `${visible.length} de ${courseProjects.length} proyectos · ${courseName}`;
    document.querySelector('#empty-state').hidden = visible.length > 0;
    // Actualiza los resultados sin retrasar la búsqueda. Cancela la transición anterior
    // al escribir deprisa y respeta la preferencia de movimiento reducido del sistema.
    resultsAnimation?.cancel();
    if (animate && !reducedMotion.matches) {
      const target = visible.length ? grid : document.querySelector('#empty-state');
      resultsAnimation = target.animate(
        [{opacity:0.35, transform:'translateY(5px)'}, {opacity:1, transform:'translateY(0)'}],
        {duration:180, easing:'ease-out'}
      );
    }
    scrollSpy?.refresh();
  }
  function setFilter(value) {
    filter = value;
    document.querySelectorAll('[data-filter]').forEach(button => {const active = button.dataset.filter === filter;button.classList.toggle('active', active);button.setAttribute('aria-pressed', String(active));});
    render();
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',()=>setFilter(button.dataset.filter)));
  search.addEventListener('input',()=>render());
  sort.addEventListener('change',()=>render());
  courseFilter.addEventListener('change',()=>render());
  reducedMotion.addEventListener('change',()=>{ if (reducedMotion.matches) resultsAnimation?.cancel(); });
  document.querySelector('#reset').addEventListener('click',()=>{search.value='';sort.value='original';if (!courseFilter.disabled) courseFilter.value='all';setFilter('all');search.focus();});
  document.querySelectorAll('#navigation a').forEach(a=>a.addEventListener('click',()=>{if(window.bootstrap) bootstrap.Collapse.getOrCreateInstance(document.querySelector('#navigation'),{toggle:false}).hide();}));
  // Switch de Bootstrap: conserva la elección y actualiza la guía de estilo.
  const themeToggle = document.querySelector('#theme-toggle');
  const copyFeedback = new Map();
  function resetCopyFeedback(button) {
    const feedback = copyFeedback.get(button);
    if (!feedback) return;
    clearTimeout(feedback.timer);
    button.innerHTML = feedback.icon;
    button.classList.remove('copied');
    copyFeedback.delete(button);
  }
  function restoreCopyLabel(button) {
    const label = button.parentElement.querySelector('[data-color]');
    const name = label.closest('.swatch-card').querySelector('h4').textContent;
    button.setAttribute('aria-label', `Copiar color ${name}: ${label.textContent}`);
    button.title = `Copiar ${label.textContent}`;
  }
  function syncThemeUI() {
    themeToggle.checked = document.documentElement.dataset.bsTheme === 'dark';
    themeToggle.title = themeToggle.checked ? 'Desactivar modo oscuro' : 'Activar modo oscuro';
    document.querySelector('#palette-mode').textContent = themeToggle.checked ? 'oscuro' : 'claro';
    const tokens = getComputedStyle(document.documentElement);
    document.querySelectorAll('[data-color]').forEach(label => {
      label.textContent = tokens.getPropertyValue(label.dataset.color).trim().toUpperCase();
      const button = label.parentElement.querySelector('[data-copy-color]');
      resetCopyFeedback(button);
      restoreCopyLabel(button);
    });
  }
  themeToggle.addEventListener('change', () => {
    window.siteTheme.set(themeToggle.checked ? 'dark' : 'light');
    syncThemeUI();
  });
  window.addEventListener('themechange', syncThemeUI);
  // El alto real de la cabecera deja libres los títulos al navegar por las anclas.
  const header = document.querySelector('.site-header');
  const navigation = document.querySelector('#navigation');
  // ScrollSpy nativo de Bootstrap: la zona observada empieza bajo la cabecera.
  // Se recalcula tras cambiar el tamaño del menú o el contenido de los resultados.
  let spyHeaderHeight = 0;
  let spyViewportHeight = 0;
  function updateScrollSpy() {
    if (navigation.classList.contains('show') || navigation.classList.contains('collapsing')) return;
    const height = header.offsetHeight;
    if (scrollSpy && height === spyHeaderHeight && window.innerHeight === spyViewportHeight) return;
    spyHeaderHeight = height;
    spyViewportHeight = window.innerHeight;
    scrollSpy?.dispose();
    scrollSpy = new bootstrap.ScrollSpy(document.body, {
      target: '#navigation',
      // Una franja próxima a la cabecera evita marcar la sección siguiente antes de tiempo.
      rootMargin: `-${height + 20}px 0px -${Math.max(0, window.innerHeight - height - 160)}px`,
      threshold:[0, 0.1, 0.5, 1]
    });
  }
  document.body.addEventListener('activate.bs.scrollspy', () => {
    navigation.querySelectorAll('.nav-link').forEach(link => {
      if (link.classList.contains('active')) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  });
  navigation.addEventListener('hidden.bs.collapse', updateScrollSpy);
  window.addEventListener('resize', updateScrollSpy);
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--nav-height', `${header.offsetHeight}px`);
    updateScrollSpy();
  }).observe(header);

  // Copia el valor del tema activo. El aviso de éxito solo aparece si se ha copiado.
  // El método alternativo permite usar también el HTML abierto como archivo local.
  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(value); return; } catch { /* Probar el método compatible con archivos locales. */ }
    }
    const previousFocus = document.activeElement;
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.append(field);
    try {
      field.select();
      if (!document.execCommand('copy')) throw new Error('No se pudo copiar');
    } finally {
      field.remove();
      previousFocus?.focus({preventScroll:true});
    }
  }
  const toastElement = document.querySelector('#copy-toast');
  let toast = bootstrap.Toast.getOrCreateInstance(toastElement, {delay:6000});
  document.querySelectorAll('[data-copy-color]').forEach(button => {
    button.addEventListener('click', async () => {
      if (button.getAttribute('aria-busy') === 'true') return;
      const value = button.parentElement.querySelector('[data-color]').textContent.trim();
      resetCopyFeedback(button);
      restoreCopyLabel(button);
      // aria-busy evita perder el foco de teclado durante la operación.
      button.setAttribute('aria-busy','true');
      let message;
      let failed = false;
      try {
        await copyText(value);
        message = `Elemento copiado: ${value}`;
        // El icono de confirmación se restaura al repetir la copia o cambiar de tema.
        const feedback = {icon:button.innerHTML, timer:null};
        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
        button.classList.add('copied');
        button.setAttribute('aria-label', `Copiado: ${value}`);
        button.title = `Copiado: ${value}`;
        feedback.timer = setTimeout(() => { resetCopyFeedback(button); restoreCopyLabel(button); }, 1800);
        copyFeedback.set(button, feedback);
      } catch {
        failed = true;
        message = `No se ha podido copiar. Selecciona el valor ${value} y cópialo manualmente.`;
      } finally {
        button.removeAttribute('aria-busy');
      }
      document.querySelector('#copy-toast-message').textContent = message;
      // El resultado permanece junto a la paleta; los errores no desaparecen con el toast.
      const feedback = document.querySelector('#copy-feedback');
      feedback.hidden = false;
      feedback.textContent = message;
      toast.dispose();
      toast = new bootstrap.Toast(toastElement, {delay:6000, autohide:!failed});
      toast.show();
    });
  });
  syncThemeUI();
  render(false);
  // Mejora progresiva: activar controles solo después de inicializar la galería.
  document.querySelector('#catalog-toolbar').hidden = false;
  document.querySelector('#catalog-results').hidden = false;
  document.querySelector('.theme-switch').hidden = false;
  document.querySelector('.navbar-toggler').hidden = false;
  navigation.classList.remove('show');
  document.querySelectorAll('#brief .accordion-button').forEach(button => {
    const panel = document.querySelector(button.dataset.bsTarget);
    const open = panel.id === 'views';
    button.disabled = false;
    button.classList.toggle('collapsed', !open);
    button.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('show', open);
  });
  document.querySelectorAll('[data-copy-color]').forEach(button => {button.hidden = false;});
  document.querySelector('.style-details').addEventListener('toggle',()=>scrollSpy?.refresh());
  document.documentElement.classList.add('is-enhanced');
})();

