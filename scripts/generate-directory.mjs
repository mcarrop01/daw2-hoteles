// Genera el directorio base a partir de projects.js para que sus enlaces no dependan de JavaScript.
// Ejecutar después de editar los proyectos: node scripts/generate-directory.mjs
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
// Admite tanto el proyecto de trabajo como el ZIP, cuyo index.html está en la raíz.
const root = existsSync(fileURLToPath(new URL('../dist/index.html',import.meta.url)))
  ? new URL('../dist/', import.meta.url) : new URL('../',import.meta.url);
const context = {window:{}};
vm.runInNewContext(readFileSync(new URL('projects.js',root),'utf8'),context,{timeout:1000});
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe = value => {try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:'';}catch{return '';}};
const link = (url,text,name) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(name)} (se abre en otra pestaña)">${text} ↗</a>`;
const cards = context.window.PROJECTS.map(p=>`<div class="col-12 col-md-6 col-lg-4"><article class="card project-card"><div class="project-body"><p class="student">${escape(p.student)} · ${escape(p.course.replace('-','–'))}</p><h3>${escape(p.hotel)}</h3><p>${link(safe(p.reference),'Hotel de referencia',`Hotel de referencia de ${p.student}`)}</p>${safe(p.web)?`<p>${link(safe(p.web),'Visitar proyecto',`Visitar proyecto de ${p.student}`)}</p>`:'<p class="catalog-help">Enlace pendiente</p>'}${safe(p.figma)?`<p>${link(safe(p.figma),'Figma',`Figma: prototipo de ${p.student}`)}</p>`:''}</div></article></div>`).join('\n');
const index = new URL('index.html',root);
const html = readFileSync(index,'utf8').replace(/<!-- STATIC_PROJECTS_START -->[\s\S]*?<!-- STATIC_PROJECTS_END -->/,`<!-- STATIC_PROJECTS_START -->\n${cards}\n<!-- STATIC_PROJECTS_END -->`);
writeFileSync(index,html,'utf8');
process.stdout.write(`Directorio básico actualizado: ${context.window.PROJECTS.length} proyectos.\n`);
