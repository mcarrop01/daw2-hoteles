// Ayuda personal del curso 26–27: no consulta cuentas ni transmite datos a Moodle.
// Los identificadores estables permiten cambiar el texto sin perder las marcas.
(() => {
  'use strict';
  const key = 'hoteles:checklist:2.1.5:2026-2027:v1';
  const inputs = [...document.querySelectorAll('[data-check]')];
  const reset = document.querySelector('#reset-checklist');
  const progress = document.querySelector('#checklist-progress');
  const note = document.querySelector('#checklist-storage-note');
  note.textContent = 'Revisión personal · Curso 26–27. Las marcas se guardan solo en este navegador; en un equipo compartido, reinícialas antes de empezar. No se envían a Moodle ni al docente y se pierden si borras los datos del navegador.';
  const undoPanel = document.querySelector('#checklist-undo');
  const undo = document.querySelector('#undo-checklist');
  let previousMarks = null;
  function dismissUndo() { previousMarks = null; undoPanel.hidden = true; }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(inputs.filter(item => item.checked).map(item => item.dataset.check))); }
    catch { storageUnavailable(); }
  }
  function storageUnavailable() {
    note.textContent = 'Revisión personal · Curso 26–27. El navegador no permite guardar las marcas: solo se conservarán durante esta visita. No se envían a Moodle ni al docente.';
  }
  function update() {
    const count = inputs.filter(input => input.checked).length;
    document.querySelector('#checklist-badge').textContent = `${count}/${inputs.length}`;
    document.querySelector('#checklist-status').textContent = count === inputs.length
      ? `Revisión completada: ${count} de ${inputs.length}. Recuerda realizar la entrega en Moodle.`
      : `${count} de ${inputs.length} comprobaciones marcadas.`;
    progress.setAttribute('aria-valuenow', String(count));
    progress.setAttribute('aria-valuemax', String(inputs.length));
    progress.querySelector('.progress-bar').style.width = `${count / inputs.length * 100}%`;
    reset.disabled = count === 0;
  }
  function restore() {
    let saved = [];
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(value)) saved = value;
    } catch { storageUnavailable(); }
    inputs.forEach(input => { input.checked = saved.includes(input.dataset.check); });
    update();
  }
  inputs.forEach(input => input.addEventListener('change', () => {
    dismissUndo();
    update();
    persist();
  }));
  // Reiniciar solo elimina las marcas de esta actividad y curso, no otros datos.
  reset.addEventListener('click', () => {
    previousMarks = inputs.filter(input => input.checked).map(input => input.dataset.check);
    inputs.forEach(input => { input.checked = false; });
    try { localStorage.removeItem(key); } catch { storageUnavailable(); }
    update();
    undoPanel.hidden = false;
    undo.focus({preventScroll:true});
  });
  // Recuperación reversible, disponible hasta editar otra casilla o recargar.
  undo.addEventListener('click', () => {
    if (!previousMarks) return;
    inputs.forEach(input => {input.checked = previousMarks.includes(input.dataset.check);});
    dismissUndo();
    update();
    persist();
    reset.focus({preventScroll:true});
  });
  // Mantiene coherentes dos pestañas abiertas en el mismo navegador.
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) {dismissUndo();restore();} });
  document.querySelector('#checklist-badge').hidden = false;
  progress.hidden = false;
  document.querySelector('#checklist-status').hidden = false;
  reset.hidden = false;
  restore();
})();
