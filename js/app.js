(() => {
'use strict';
const KEY = 'orbita.v5';
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], D3 = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hm = m => m >= 1440 ? '24:00' : pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const toMin = v => { const [h, m] = v.split(':').map(Number); return h * 60 + m; };
const fmtM = m => { const h = Math.floor(m / 60), r = Math.round(m % 60); return h && r ? `${h} h ${r} min` : h ? `${h} h` : `${r} min`; };
const fmtH = h => h < 1 ? Math.round(h * 60) + ' min' : String(Math.round(h * 10) / 10).replace('.', ',') + ' h';
const uid = () => 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
/* fechas (siempre locales, claves 'AAAA-MM-DD') */
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
const ds = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pdt = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dow = d => (d.getDay() + 6) % 7, monday = d => addD(d, -dow(d));
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const DRE = /^\d{4}-\d{2}-\d{2}$/;
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
function range(p, r) {
  if (p === 'w') { const a = monday(r); return [a, addD(a, 6)]; }
  if (p === 'm') return [new Date(r.getFullYear(), r.getMonth(), 1), new Date(r.getFullYear(), r.getMonth() + 1, 0)];
  return [new Date(r.getFullYear(), 0, 1), new Date(r.getFullYear(), 11, 31)];
}
const shift = (p, r, n) => p === 'w' ? addD(r, 7 * n) : p === 'm' ? new Date(r.getFullYear(), r.getMonth() + n, 1) : new Date(r.getFullYear() + n, 0, 1);
function perLabel(p, r) {
  const [a, b] = range(p, r);
  if (p === 'w') return `Semana ${isoWeek(a)} · ${a.getDate()}${a.getMonth() !== b.getMonth() ? ' ' + MES[a.getMonth()] : ''}–${b.getDate()} ${MES[b.getMonth()]}`;
  return p === 'm' ? `${MESL[r.getMonth()]} ${r.getFullYear()}` : `Año ${r.getFullYear()}`;
}

/* ---------- Datos iniciales: semana de ejemplo para el tutorial (Familia al centro) ---------- */
const ACTS = [
  ['fam', 'Familia', '#ffd23f', 1], ['trab', 'Trabajo', '#5aa9ff'], ['est', 'Estudio', '#27f5c9'],
  ['ejer', 'Ejercicio', '#ff3d81'], ['hob', 'Hobby', '#ff9f43'], ['hogar', 'Tareas del hogar', '#c9a27e'],
  ['desc', 'Descanso', '#8795a8'], ['sueno', 'Sueño nocturno', '#cfd8ff']
];
// Lunes a domingo. "inicio-fin:actividad:título" (horas decimales: 20.5 = 20:30). Sin título = nombre de la actividad.
// Es solo un ejemplo para que el tutorial tenga algo armado: se reemplaza por tu propia semana desde la pestaña Semana.
const SEMANA_A = [
  '0-7:sueno;7-7.5:fam:Desayuno;7.5-8:desc:Preparativos;8-13:trab;13-14:fam:Almuerzo en familia;14-16:est;16-17:ejer;17-18:hogar;18-19.5:hob;19.5-21.5:fam:Tiempo en familia;21.5-22.5:fam:Cena en familia;22.5-23:desc:A dormir;23-24:sueno',
  '0-7:sueno;7-7.5:fam:Desayuno;7.5-8:desc:Preparativos;8-13:trab;13-14:fam:Almuerzo en familia;14-16:hob;16-17:ejer;17-18:est;18-19.5:hogar:Orden y limpieza;19.5-21.5:fam:Tiempo en familia;21.5-22.5:fam:Cena en familia;22.5-23:desc:A dormir;23-24:sueno',
  '0-7:sueno;7-7.5:fam:Desayuno;7.5-8:desc:Preparativos;8-13:trab;13-14:fam:Almuerzo en familia;14-15.5:est;15.5-17:ejer:Clase o gimnasio;17-18:hogar;18-19.5:hob;19.5-21.5:fam:Tiempo en familia;21.5-22.5:fam:Cena en familia;22.5-23:desc:A dormir;23-24:sueno',
  '0-7:sueno;7-7.5:fam:Desayuno;7.5-8:desc:Preparativos;8-13:trab;13-14:fam:Almuerzo en familia;14-16:hogar;16-17:ejer;17-18.5:hob:Club o encuentro;18.5-19.5:est;19.5-21.5:fam:Tiempo en familia;21.5-22.5:fam:Cena en familia;22.5-23:desc:A dormir;23-24:sueno',
  '0-7:sueno;7-7.5:fam:Desayuno;7.5-8:desc:Preparativos;8-12.5:trab;12.5-13.5:fam:Almuerzo en familia;13.5-14.5:desc:Descanso;14.5-16.5:hob;16.5-17.5:ejer;17.5-18.5:hogar;18.5-21:fam:Tiempo en familia;21-22.5:fam:Cena y salida;22.5-23:desc:A dormir;23-24:sueno',
  '0-8:sueno;8-8.5:fam:Desayuno;8.5-10:hob;10-13:fam:Tiempo en familia;13-14:fam:Almuerzo en familia;14-15.5:desc:Siesta;15.5-17:ejer;17-18:hogar;18-19.5:hob;19.5-21.5:fam:Tiempo en familia;21.5-22.5:fam:Cena en familia;22.5-23:desc:A dormir;23-24:sueno',
  '0-8:sueno;8-8.5:fam:Desayuno;8.5-10:fam:Tiempo en familia;10-11.5:ejer;11.5-13:hob;13-14:fam:Almuerzo en familia;14-15.5:desc:Siesta;15.5-17:hogar:Orden de la semana;17-19:fam:Tiempo en familia;19-20:fam:Cena en familia;20-21:desc:Revisión de la semana;21-22.5:fam:Tiempo en familia;22.5-23:desc:A dormir;23-24:sueno'
];
const yesterday = () => ds(addD(today(), -1));
function seed() {
  const tpl = [];
  SEMANA_A.forEach((day, d) => day.split(';').forEach(x => {
    const [r, a, t] = x.split(':'), [s, e] = r.split('-').map(v => Math.round(v * 60));
    tpl.push({ id: 'b' + tpl.length, d, s, e, a, t: t || '' });
  }));
  return { activities: ACTS.map(([id, name, color, c]) => ({ id, name, color, center: !!c })), tpl, days: {}, rec: [], frozen: yesterday(), fix: {}, start: ds(today()), notes: [], v: 6 };
}
/* Modelo: tpl = semana regular; days[fecha] = día personalizado o ya registrado; rec = eventos que se repiten (cada mes / cada año) */
function clean(d) {
  if (!d || !Array.isArray(d.activities)) throw new Error('formato');
  const activities = d.activities.map(a => ({ id: String(a.id).replace(/[^\w-]/g, ''), name: String(a.name).slice(0, 40), color: /^#[0-9a-f]{6}$/i.test(a.color) ? a.color : '#888888', center: !!a.center }));
  const ids = new Set(activities.map(a => a.id)), ok = b => b && ids.has(b.a) && b.s >= 0 && b.e <= 1440 && b.s < b.e, tt = b => String(b.t || '').slice(0, 40);
  const tpl = (d.tpl || d.blocks || []).filter(b => ok(b) && b.d >= 0 && b.d < 7).map((b, i) => ({ id: 'b' + i, d: b.d | 0, s: b.s | 0, e: b.e | 0, a: b.a, t: tt(b) }));
  const days = {};
  Object.entries(d.days || {}).forEach(([k, l]) => { if (DRE.test(k) && Array.isArray(l)) days[k] = l.filter(ok).map((b, i) => ({ id: 'k' + i, s: b.s | 0, e: b.e | 0, a: b.a, t: tt(b) })); });
  const rec = (d.rec || []).filter(r => ok(r) && (r.k === 'y' || r.k === 'm')).map((r, i) => ({ id: 'r' + i, k: r.k, m: r.m | 0, dd: r.dd | 0, s: r.s | 0, e: r.e | 0, a: r.a, t: tt(r) }));
  const frozen = DRE.test(d.frozen) ? d.frozen : yesterday(), fix = {}, past = Object.keys(days).filter(k => k <= ds(today())).sort();
  Object.keys(d.fix || {}).forEach(k => { if (DRE.test(k)) fix[k] = 1; });
  const notes = (Array.isArray(d.notes) ? d.notes : []).filter(n => n && Number.isFinite(+n.t) && typeof n.x === 'string' && n.x.trim()).map((n, i) => ({ id: 'q' + i, t: +n.t, x: n.x.slice(0, 4000) }));
  return { activities, tpl, days, rec, notes, frozen, fix, v: (d.v | 0) || 5, start: DRE.test(d.start) ? d.start : (past[0] || ds(addD(pdt(frozen), 1))) };
}
function migrate(s) { // v5 -> v6: suma el planeta de sueño y sus noches en la semana regular (solo si el horario está libre)
  if (s.v >= 6) return s;
  if (!s.activities.some(a => a.id === 'sueno')) {
    s.activities.push({ id: 'sueno', name: 'Sueño nocturno', color: '#cfd8ff', center: false });
    [[0, 0, 420], [0, 1380, 1440], [1, 0, 420], [1, 1380, 1440], [2, 0, 420], [2, 1380, 1440], [3, 0, 420], [3, 1380, 1440], [4, 0, 510], [6, 1380, 1440]]
      .forEach(([d, a, b]) => { if (!s.tpl.some(x => x.d === d && x.s < b && a < x.e)) s.tpl.push({ id: uid(), d, s: a, e: b, a: 'sueno', t: '' }); });
  }
  s.v = 6; return s;
}
function load() {
  for (const k of [KEY, 'orbita.v4']) { try { const s = JSON.parse(localStorage.getItem(k)); if (s && s.activities && (s.tpl || s.blocks)) return migrate(clean(s)); } catch (e) {} }
  return seed();
}
const FIRST_RUN = !localStorage.getItem(KEY) && !localStorage.getItem('orbita.v4');
let S = load(), per = 'w', pref = today(), sel = ds(today()), wd = dow(today()), ctx = null, editA = null, selDays = new Set(), ST = { mins: {}, days: 1, buckets: [] }, lastDay = ds(today()), lastMin = -1, lastNow = '';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const act = id => S.activities.find(a => a.id === id);
const lab = b => b.t || (act(b.a) || {}).name || '';
const planned = id => (ST.mins[id] || 0) / 60;

/* ---------- Lógica de agenda ---------- */
const clone = b => ({ id: b.id, s: b.s, e: b.e, a: b.a, t: b.t || '' });
function place(list, nb) { // el bloque nuevo se hace lugar: recorta o reemplaza lo que haya en su horario
  const out = [];
  list.forEach(b => {
    if (b.e <= nb.s || nb.e <= b.s) { out.push(b); return; }
    const head = b.s < nb.s, tail = b.e > nb.e;
    if (head) out.push({ ...b, e: nb.s });
    if (tail) out.push({ ...b, id: head ? uid() : b.id, s: nb.e });
  });
  out.push(nb); return out.sort((a, b) => a.s - b.s);
}
const tplDay = d => S.tpl.filter(b => b.d === d).sort((a, b) => a.s - b.s);
function tplPlace(d, nb) { S.tpl = S.tpl.filter(b => b.d !== d).concat(place(tplDay(d), { ...nb, d })); }
const recHit = (r, d) => r.dd === d.getDate() && (r.k === 'm' || r.m === d.getMonth() + 1);
function proj(k) { // lo proyectado: semana regular + eventos que se repiten
  const d = pdt(k); let l = tplDay(dow(d)).map(b => ({ ...clone(b), src: 't' }));
  S.rec.forEach(r => { if (recHit(r, d)) l = place(l, { ...clone(r), src: 'r' }); });
  return l;
}
const dayBlocks = k => S.days[k] ? S.days[k].map(b => ({ ...b, src: 'd' })).sort((a, b) => a.s - b.s) : k < S.start ? [] : proj(k);
function custom(k) { if (!S.days[k]) S.days[k] = k < S.start ? [] : proj(k).map(clone); return S.days[k]; }
const markFix = k => { if (k < ds(today())) S.fix[k] = 1; };
const fd = k => k.split('-').reverse().join('/');
function freeze() { // la bitácora registra cada día que pasa tal como estaba planificado
  const y = yesterday(); if (S.frozen >= y) return;
  let d = addD(pdt(S.frozen), 1);
  for (let i = 0; ds(d) <= y && i < 4000; i++, d = addD(d, 1)) { const k = ds(d); if (!S.days[k]) S.days[k] = proj(k).map(clone); }
  S.frozen = y; save();
}
function recalc() {
  const [a, b] = range(per, pref), mins = {}, bk = []; let idx = 0, dn = 0;
  for (let d = a; d <= b; d = addD(d, 1), idx++) {
    const k = ds(d), i = per === 'y' ? d.getMonth() : idx;
    const bb = bk[i] || (bk[i] = { m: {}, label: per === 'y' ? MES[i] : per === 'w' ? 'LMXJVSD'[i] : (i === 0 || (i + 1) % 5 === 0 ? String(i + 1) : ''), title: per === 'y' ? MESL[i] : `${D3[dow(d)]} ${d.getDate()}` });
    if (k < S.start && !S.days[k]) continue; // antes de empezar a usar la bitácora no hay registro
    dn++; dayBlocks(k).forEach(x => { const m = x.e - x.s; mins[x.a] = (mins[x.a] || 0) + m; bb.m[x.a] = (bb.m[x.a] || 0) + m; });
  }
  ST = { mins, days: dn, buckets: bk };
}

/* ---------- Pestañas y periodo ---------- */
function show(v) {
  $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
  $$('.tabs button').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  try { window.scrollTo(0, 0); } catch (e) {} resize(); if (v === 'cos') renderCos(); if (v === 'not') { if (nAuto) $('#nWhen').value = dI(new Date()); renderNotes(); }
}
$('.tabs').onclick = e => { const b = e.target.closest('[data-v]'); if (b) show(b.dataset.v); };
function renderPer() {
  const h = `<div class="seg">${[['w', 'Semana'], ['m', 'Mes'], ['y', 'Año']].map(([k, n]) => `<button data-p="${k}" class="${k === per ? 'on' : ''}">${n}</button>`).join('')}</div>
    <div class="weeknav"><button data-n="-1" aria-label="Anterior">‹</button><span>${perLabel(per, pref)}</span><button data-n="1" aria-label="Siguiente">›</button><button data-n="0">Hoy</button></div>`;
  const [a, b] = range(per, pref), st = pdt(S.start);
  const nt = b < st ? `<p class="hint">Sin registros: la bitácora empezó el ${fd(S.start)}.</p>` : a < st ? `<p class="hint">Se cuenta desde el ${fd(S.start)}, cuando empezó la bitácora.</p>` : '';
  $$('.per').forEach(p => { p.innerHTML = h + nt; });
}
document.addEventListener('click', e => {
  const b = e.target.closest('.per button'); if (!b) return;
  if (b.dataset.p) per = b.dataset.p; else if (b.dataset.n != null) pref = b.dataset.n === '0' ? today() : shift(per, pref, +b.dataset.n); else return;
  recalc(); renderPer(); renderLegend(); renderActs(); renderBal();
});

/* ---------- Listas de bloques (bitácora y semana regular) ---------- */
function blockHTML(b, pl, nl, now) {
  const a = act(b.a) || { name: '?', color: '#888' }, r = b.src === 'r' ? S.rec.find(x => x.id === b.id) : null;
  const prev = b.s === 0 && pl.some(x => x.e === 1440 && x.a === b.a), next = b.e === 1440 && nl.some(x => x.s === 0 && x.a === b.a);
  const extra = [b.t ? esc(a.name) : '', fmtM(b.e - b.s), prev ? 'viene de ayer' : '', next ? 'sigue mañana' : '', r ? (r.k === 'y' ? 'se repite cada año' : 'se repite cada mes') : '', now ? 'ahora' : ''].filter(Boolean).join(' · ');
  return `<button class="blk${now ? ' now' : ''}" data-b="${b.id}" style="border-left-color:${a.color}"><span class="tm">${hm(b.s)}<br>${hm(b.e)}</span><span><b>${esc(lab(b))}</b><small>${extra}</small></span></button>`;
}
function listHTML(bl, pl, nl, isToday) {
  let h = '', cur = 0; const m = nowMin();
  const gap = (s, e) => { if (e - s >= 15) h += `<button class="gap" data-new="${s}-${e}">+ Sin asignar ${hm(s)} – ${hm(e)}<small>${fmtM(e - s)}</small></button>`; };
  bl.forEach(b => { gap(cur, b.s); h += blockHTML(b, pl, nl, isToday && m >= b.s && m < b.e); cur = Math.max(cur, b.e); }); gap(cur, 1440);
  return h;
}
const usedOf = bl => bl.reduce((t, b) => t + b.e - b.s, 0);
const firstGap = bl => { let cur = 0; for (const b of bl) { if (b.s - cur >= 30) return [cur, Math.min(b.s, cur + 60)]; cur = Math.max(cur, b.e); } return 1440 - cur >= 30 ? [cur, Math.min(1440, cur + 60)] : null; };
function nightLine(k) {
  if (!act('sueno')) return null;
  const pre = dayBlocks(ds(addD(pdt(k), -1))).filter(b => b.a === 'sueno' && b.e === 1440), cur = dayBlocks(k).filter(b => b.a === 'sueno' && b.s === 0);
  const mins = pre.concat(cur).reduce((t, b) => t + b.e - b.s, 0), from = pre.length ? pre[0].s : 1380, to = cur.length ? cur[cur.length - 1].e : 420;
  return { mins, from, to, text: mins ? `Noche anterior: ${pre.length ? hm(from) : '00:00'} → ${cur.length ? hm(to) : '00:00'} · ${fmtM(mins)}` : 'Noche anterior: sin sueño registrado' };
}
function renderBit() {
  const sd = pdt(sel), mon = monday(sd), t = ds(today()), cust = !!S.days[sel], past = sel < t;
  $('#bLbl').textContent = perLabel('w', mon); $('#bGo').value = sel; $('#pdfHint').textContent = 'El cronograma PDF usa la semana que ves en Bitácora: ' + perLabel('w', mon) + '.';
  $('#dTabs').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = addD(mon, i), k = ds(d); return `<button data-k="${k}" class="${k === sel ? 'on' : ''}${k === t ? ' hoy' : ''}">${D3[i]}<small>${d.getDate()}${S.days[k] ? (S.fix[k] ? ' ✎' : ' •') : ''}</small></button>`; }).join('');
  const bl = dayBlocks(sel), used = usedOf(bl), nl = nightLine(sel);
  const note = past ? (cust ? (S.fix[sel] ? (sel < S.start ? 'Registro cargado a mano.' : 'Registro corregido: lo que hiciste difiere de lo planificado.') : 'Registrado según lo planificado. Si hiciste otra cosa, tocá el bloque y corregilo.') : `Sin registro: la bitácora empezó el ${fd(S.start)}. Podés cargar lo que hiciste ese día.`)
    : cust ? 'Día personalizado: ya no sigue los cambios de la semana regular.' : 'Sigue la semana regular. Si agregás o cambiás un bloque, este día queda personalizado.';
  $('#blocks').innerHTML = `<div class="dayhead"><h2>${DAYS[dow(sd)]} ${sd.getDate()} de ${MESL[sd.getMonth()].toLowerCase()}${sel === t ? ' · hoy' : ''}</h2><span>${fmtM(used)} asignadas · ${fmtM(1440 - used)} libres</span></div><p class="hint">${note}</p>`
    + (nl ? `<div class="sleep"><span>${nl.text}</span><button data-sl="1">${nl.mins ? 'Corregir sueño' : 'Registrar sueño'}</button></div>` : '')
    + (cust && !past ? '<button class="ghost rst" data-r="1">Volver a la semana regular</button>' : '')
    + (past && !cust ? '<button class="ghost rst" data-cp="1">Copiar la semana regular a este día</button>' : '')
    + listHTML(bl, dayBlocks(ds(addD(sd, -1))), dayBlocks(ds(addD(sd, 1))), sel === t);
}
function renderTpl() {
  const t = dow(today()), bl = tplDay(wd), used = usedOf(bl);
  $('#wTabs').innerHTML = D3.map((n, i) => `<button data-d="${i}" class="${i === wd ? 'on' : ''}${i === t ? ' hoy' : ''}">${n}</button>`).join('');
  $('#wBlocks').innerHTML = `<div class="dayhead"><h2>${DAYS[wd]}</h2><span>${fmtM(used)} asignadas · ${fmtM(1440 - used)} libres</span></div>` + listHTML(bl, tplDay((wd + 6) % 7), tplDay((wd + 1) % 7), false);
}
$('#bPrev').onclick = () => { sel = ds(addD(pdt(sel), -7)); renderBit(); };
$('#bNext').onclick = () => { sel = ds(addD(pdt(sel), 7)); renderBit(); };
$('#bHoy').onclick = () => { sel = ds(today()); renderBit(); };
$('#bGo').onchange = e => { if (DRE.test(e.target.value)) { sel = e.target.value; renderBit(); } };
$('#dTabs').onclick = e => { const b = e.target.closest('[data-k]'); if (b) { sel = b.dataset.k; renderBit(); } };
$('#wTabs').onclick = e => { if (e.target.dataset.d != null) { wd = +e.target.dataset.d; renderTpl(); } };
$('#blocks').onclick = e => {
  const g = e.target.closest('[data-new]'), b = e.target.closest('[data-b]');
  if (e.target.closest('[data-sl]')) { const n = nightLine(sel); openBlock('d', null, [n.from, n.to], { date: ds(addD(pdt(sel), -1)), a: 'sueno' }); }
  else if (e.target.closest('[data-cp]')) { S.days[sel] = proj(sel).map(clone); markFix(sel); save(); renderAll(); }
  else if (e.target.closest('[data-r]')) { if (confirm('¿Volver a la semana regular para este día? Se pierden sus cambios.')) { delete S.days[sel]; save(); renderAll(); } }
  else if (g) openBlock('d', null, g.dataset.new.split('-').map(Number));
  else if (b) openBlock('d', dayBlocks(sel).find(x => x.id === b.dataset.b));
};
$('#wBlocks').onclick = e => {
  const g = e.target.closest('[data-new]'), b = e.target.closest('[data-b]');
  if (g) openBlock('t', null, g.dataset.new.split('-').map(Number)); else if (b) openBlock('t', S.tpl.find(x => x.id === b.dataset.b));
};
$('#addD').onclick = () => openBlock('d', null, firstGap(dayBlocks(sel)));
$('#addW').onclick = () => openBlock('t', null, firstGap(tplDay(wd)));

/* ---------- Editor de bloques ---------- */
const dB = $('#dB');
const chips = () => { $('#bD').innerHTML = D3.map((n, i) => `<button type="button" data-d="${i}" class="${selDays.has(i) ? 'on' : ''}">${n}</button>`).join(''); };
function openBlock(mode, b, pre, opt) {
  ctx = { mode, b: b || null, date: (opt && opt.date) || sel, keep: !!opt }; const s = b ? b.s : pre ? pre[0] : 480, e = b ? b.e : pre ? pre[1] : 540;
  $('#dBt').textContent = b ? 'Editar bloque' : 'Nuevo bloque';
  $('#bA').innerHTML = S.activities.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join('');
  $('#bA').value = b ? b.a : (opt && opt.a) || (S.activities.find(a => !a.center && a.id !== 'sueno') || S.activities[0] || {}).id;
  $('#bT').value = b ? b.t || '' : ''; $('#bS').value = hm(s); $('#bE').value = e >= 1440 ? '00:00' : hm(e);
  $('#bWK').hidden = mode !== 't'; $('#bDT').hidden = mode !== 'd';
  const r = b && b.src === 'r' ? S.rec.find(x => x.id === b.id) : null;
  if (mode === 't') { selDays = new Set([b ? b.d : wd]); chips(); } else { $('#bF').value = ctx.date; $('#bU').value = ''; $('#bR').value = r ? r.k : ''; }
  const past = mode === 'd' && ctx.date < ds(today()); $('#bUw').hidden = past; $('#bRw').hidden = past;
  const h = $('#bH'); h.classList.remove('err');
  h.textContent = (mode === 't' ? 'Reemplaza lo que haya en ese horario de la semana regular.' : past ? 'Corregí lo que realmente hiciste: reemplaza lo que haya en ese horario de ese día.' : r ? 'Es un evento que se repite: al guardar cambia en todas sus repeticiones.' : 'Reemplaza lo que haya en ese horario, solo en la fecha elegida.') + ' Si "Hasta" es anterior a "Desde", el bloque sigue después de medianoche.';
  $('#bDel').hidden = !b; dB.showModal();
}
$('#bD').onclick = e => {
  if (e.target.dataset.d == null) return; const d = +e.target.dataset.d;
  if (selDays.has(d)) { if (selDays.size > 1) selDays.delete(d); } else selDays.add(d); chips();
};
$('#bX').onclick = () => dB.close();
function bErr(m) { const h = $('#bH'); h.textContent = m; h.classList.add('err'); }
function removeOrig() {
  const b = ctx.b; if (!b) return;
  if (b.src === 'r') S.rec = S.rec.filter(r => r.id !== b.id); else { S.days[ctx.date] = custom(ctx.date).filter(x => x.id !== b.id); markFix(ctx.date); }
}
const put = (k, nb) => { S.days[k] = place(custom(k), nb); markFix(k); };
$('#fB').onsubmit = e => {
  e.preventDefault();
  const a = $('#bA').value, t = $('#bT').value.trim(), s = toMin($('#bS').value); let en = toMin($('#bE').value);
  if (en === 0 && s > 0) en = 1440;
  if (en === s) return bErr('El inicio y el fin no pueden ser iguales.');
  const cross = en < s;
  if (ctx.mode === 't') {
    if (ctx.b) S.tpl = S.tpl.filter(x => x.id !== ctx.b.id);
    selDays.forEach(d => { if (cross) { tplPlace(d, { id: uid(), s, e: 1440, a, t }); tplPlace((d + 1) % 7, { id: uid(), s: 0, e: en, a, t }); } else tplPlace(d, { id: uid(), s, e: en, a, t }); });
  } else {
    const f = $('#bF').value, u = $('#bU').value, rep = $('#bR').value;
    if (!f) return bErr('Elegí una fecha.');
    if (u && u < f) return bErr('La fecha final es anterior a la inicial.');
    if (rep && (u || cross)) return bErr('Un evento que se repite no puede abarcar varios días ni cruzar la medianoche.');
    removeOrig();
    if (rep) { const d = pdt(f); S.rec.push({ id: uid(), k: rep, m: d.getMonth() + 1, dd: d.getDate(), s, e: en, a, t }); }
    else for (let d = pdt(f); ds(d) <= (u || f); d = addD(d, 1)) {
      put(ds(d), { id: uid(), s, e: cross ? 1440 : en, a, t });
      if (cross) put(ds(addD(d, 1)), { id: uid(), s: 0, e: en, a, t });
    }
    if (!ctx.keep) sel = f;
  }
  save(); dB.close(); renderAll();
};
$('#bDel').onclick = () => {
  const b = ctx && ctx.b; if (!b) return;
  if (!confirm(b.src === 'r' ? 'Es un evento que se repite: se elimina de todas sus repeticiones. ¿Seguir?' : '¿Eliminar este bloque?')) return;
  if (ctx.mode === 't') S.tpl = S.tpl.filter(x => x.id !== b.id); else removeOrig();
  save(); dB.close(); renderAll();
};

/* ---------- Planetas ---------- */
function renderActs() {
  $('#actHint').textContent = `Horas de ${perLabel(per, pref).toLowerCase()}. Tocá un planeta para editarlo.`;
  $('#acts').innerHTML = S.activities.map(a => `<li><button class="arow" data-e="${a.id}"><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i><span><b>${esc(a.name)}${a.center ? ' · centro' : ''}</b><small>${fmtH(planned(a.id))}</small></span></button></li>`).join('');
}
$('#acts').onclick = e => { const r = e.target.closest('[data-e]'); if (r) openAct(r.dataset.e); };
$('#addA').onclick = () => openAct(null);
const dA = $('#dA');
function openAct(id) {
  editA = id ? act(id) : null; $('#dAt').textContent = editA ? 'Editar planeta' : 'Nuevo planeta';
  $('#aN').value = editA ? editA.name : ''; $('#aC').value = editA ? editA.color : '#27f5c9'; $('#aK').checked = !!(editA && editA.center);
  $('#aDel').hidden = !editA; dA.showModal();
}
$('#aX').onclick = () => dA.close();
$('#fA').onsubmit = e => {
  e.preventDefault();
  const name = $('#aN').value.trim(), color = $('#aC').value, center = $('#aK').checked; if (!name) return;
  if (center) S.activities.forEach(a => { a.center = false; });
  if (editA) Object.assign(editA, { name, color, center }); else S.activities.push({ id: uid(), name, color, center });
  save(); dA.close(); renderAll();
};
$('#aDel').onclick = () => {
  if (!editA || !confirm('¿Eliminar este planeta? También se borran sus bloques de la semana regular y de la bitácora.')) return;
  const id = editA.id; S.activities = S.activities.filter(a => a.id !== id); S.tpl = S.tpl.filter(b => b.a !== id); S.rec = S.rec.filter(r => r.a !== id);
  Object.keys(S.days).forEach(k => { S.days[k] = S.days[k].filter(b => b.a !== id); });
  save(); dA.close(); renderAll();
};

/* ---------- Balance (según lo proyectado en cada periodo) ---------- */
function renderBal() {
  const total = ST.days * 1440, rows = S.activities.map(a => ({ a, m: ST.mins[a.id] || 0 })), asg = rows.reduce((t, r) => t + r.m, 0);
  rows.push({ a: { name: 'Sin asignar', color: '#4a5870' }, m: Math.max(0, total - asg) });
  $('#review').innerHTML = rows.map(({ a, m }) => { const p = total ? m / total * 100 : 0; return `<div class="rev"><b><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i>${esc(a.name)}</b><div class="bar"><span style="width:${p}%;background:${a.color}"></span></div><small>${fmtH(m / 60)} · ${Math.round(p)}%</small></div>`; }).join('');
  const bk = ST.buckets.filter(Boolean), mx = Math.max(1, ...bk.map(b => Object.values(b.m).reduce((t, v) => t + v, 0)));
  $('#stack').innerHTML = bk.map(b => `<div class="col" title="${esc(b.title)}"><div class="seg2">${S.activities.map(a => b.m[a.id] ? `<span style="height:${b.m[a.id] / mx * 100}%;background:${a.color}" title="${esc(a.name)}: ${fmtH(b.m[a.id] / 60)}"></span>` : '').join('')}</div><small>${b.label}</small></div>`).join('');
}
$('#exp').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }));
  a.download = 'orbita-' + ds(today()) + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
$('#imp').onchange = e => {
  const f = e.target.files[0]; if (!f) return; const rd = new FileReader();
  rd.onload = () => { try { S = clean(JSON.parse(rd.result)); freeze(); save(); renderAll(); } catch (x) { alert('El archivo no es un respaldo válido de Órbita.'); } };
  rd.readAsText(f); e.target.value = '';
};

$('#expPdf').onclick = () => { // cronograma semanal en PDF: la semana que se ve en la Bitácora
  if (!window.OrbitaPDF) { alert('No se pudo cargar el generador de PDF.'); return; }
  const mon = monday(pdt(sel)), t = ds(today()), mins = {}, days = [];
  for (let i = 0; i < 7; i++) {
    const d = addD(mon, i), k = ds(d), bl = !S.days[k] && k < S.start ? proj(k) : dayBlocks(k); // antes del inicio de la bitácora se muestra la semana regular
    days.push({ label: `${D3[i]} ${d.getDate()}`, today: k === t, blocks: bl.map(b => ({ s: b.s, e: b.e, label: lab(b), color: (act(b.a) || {}).color || '#888888' })) });
    bl.forEach(b => { mins[b.a] = (mins[b.a] || 0) + b.e - b.s; });
  }
  const sun = addD(mon, 6), span = `${mon.getDate()}${mon.getMonth() !== sun.getMonth() ? ' ' + MES[mon.getMonth()] : ''}–${sun.getDate()} ${MES[sun.getMonth()]} ${sun.getFullYear()}`;
  const bytes = OrbitaPDF.weekly({
    title: 'ÓRBITA · Cronograma semanal', subtitle: `Semana ${isoWeek(mon)} · ${span}`, days,
    legend: S.activities.filter(a => mins[a.id]).map(a => ({ name: a.name, color: a.color, hours: fmtH(mins[a.id] / 60) })),
    footer: `Órbita · Studio NMFT · generado el ${fd(t)}`, docTitle: `Cronograma semanal ${ds(mon)}`
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  a.download = 'orbita-cronograma-' + ds(mon) + '.pdf'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

/* ---------- Cielo ---------- */
function renderNow() {
  const l = dayBlocks(ds(today())), m = nowMin(), b = l.find(x => x.s <= m && m < x.e), n = l.find(x => x.s > m);
  const h = b ? `Ahora: <b>${esc(lab(b))}</b> hasta ${hm(b.e)}${n && n.s === b.e ? ` · luego ${esc(lab(n))}` : ''}` : n ? `Libre hasta ${hm(n.s)} · luego <b>${esc(lab(n))}</b>` : 'Sin más bloques por hoy';
  if (h !== lastNow) { lastNow = h; $('#now').innerHTML = `<span>${h}</span>`; }
}
function renderHead() { const t = today(); $('#score b').textContent = 'Semana ' + isoWeek(t); $('#score span').textContent = `${D3[dow(t)].toLowerCase()} ${t.getDate()} ${MES[t.getMonth()]} ${t.getFullYear()}`; }
function renderLegend() {
  $('#legend').innerHTML = S.activities.slice().sort((a, b) => (b.center ? 1 : 0) - (a.center ? 1 : 0)).map(a => `<li><i style="background:${a.color};box-shadow:0 0 8px ${a.color}"></i>${esc(a.name)}<b>${fmtH(planned(a.id))}</b></li>`).join('');
}
const cv = $('#sky'), cx = cv.getContext('2d'), MONO = 'ui-monospace,Menlo,Consolas,monospace';
let W = 0, H = 0, stars = [], shot = null, nextShot = 2500;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize() {
  const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1; if (!r.width || !r.height) return;
  W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: 90 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3, t: Math.random() * 6 }));
}
if (window.ResizeObserver) new ResizeObserver(resize).observe(cv);
window.addEventListener('resize', resize);
function paint(t) {
  cx.clearRect(0, 0, W, H); cx.textAlign = 'center';
  stars.forEach(s => { cx.globalAlpha = .3 + .5 * Math.abs(Math.sin(t / 1300 + s.t)); cx.fillStyle = s.r > 1.3 ? '#27f5c9' : '#e6f1ff'; const z = s.r > 1.3 ? 2 : 1; cx.fillRect(Math.round(s.x), Math.round(s.y), z, z); });
  cx.globalAlpha = 1;
  if (!still) {
    if (!shot && t > nextShot) shot = { x: W * (.3 + Math.random() * .7), y: Math.random() * H * .35, t0: t };
    if (shot) {
      const k = (t - shot.t0) / 900;
      if (k > 1) { shot = null; nextShot = t + 5000 + Math.random() * 6000; }
      else {
        const x = shot.x - k * 240, y = shot.y + k * 120, g = cx.createLinearGradient(x, y, x + 70, y - 35);
        g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)');
        cx.strokeStyle = g; cx.lineWidth = 2; cx.globalAlpha = 1 - k; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + 70, y - 35); cx.stroke(); cx.globalAlpha = 1;
      }
    }
  }
  const core = S.activities.find(a => a.center), acts = S.activities.filter(a => !a.center), n = acts.length, x0 = W / 2, y0 = H / 2;
  const ax = W / 2 - 12, ay = H / 2 - 12, avail = Math.min(ax, ay), k = Math.min(1.7, Math.max(1, ax / ay)), sunR = Math.max(26, avail * .13);
  const maxH = Math.max(1, ...acts.map(a => planned(a.id)));
  const spacing = (avail - sunR - 6) / Math.max(n, 1), cap = Math.min(spacing * .8, 40), wide = W > 560;
  const pr = h => h <= 0 ? 0 : cap * (.3 + .7 * Math.sqrt(h / maxH));
  const g = cx.createRadialGradient(x0, y0, 2, x0, y0, sunR * 2.2);
  g.addColorStop(0, '#fff7c2'); g.addColorStop(.4, core ? core.color : '#ffd23f'); g.addColorStop(.5, 'rgba(255,210,63,.22)'); g.addColorStop(1, 'rgba(255,210,63,0)');
  cx.fillStyle = g; cx.beginPath(); cx.arc(x0, y0, sunR * 2.2, 0, 7); cx.fill();
  cx.fillStyle = '#1a1300'; cx.font = '700 11px ' + MONO;
  if (core) { cx.fillText(core.name.slice(0, 9), x0, y0 - 1); cx.fillText(fmtH(planned(core.id)), x0, y0 + 12); }
  acts.forEach((a, i) => {
    const o = sunR + spacing * (i + .5), v = planned(a.id), r = pr(v);
    const ang = i * 2.1 + (still ? 0 : t / 1000 * .35 / Math.pow(i + 1, .7)), ux = Math.cos(ang), uy = Math.sin(ang);
    const x = x0 + ux * o * k, y = y0 + uy * o;
    cx.strokeStyle = 'rgba(39,245,201,.14)'; cx.lineWidth = 1; cx.beginPath(); cx.ellipse(x0, y0, o * k, o, 0, 0, 7); cx.stroke();
    const rr = Math.max(r, 3);
    cx.globalAlpha = r ? 1 : .4; cx.shadowColor = a.color; cx.shadowBlur = 12; cx.fillStyle = a.color;
    cx.beginPath(); cx.arc(x, y, rr, 0, 7); cx.fill(); cx.shadowBlur = 0;
    cx.save(); cx.beginPath(); cx.arc(x, y, rr, 0, 7); cx.clip();
    cx.fillStyle = 'rgba(3,5,10,.5)'; cx.beginPath(); cx.arc(x + ux * rr * .5, y + uy * rr * .5, rr, 0, 7); cx.fill(); cx.restore();
    cx.globalAlpha = 1; cx.fillStyle = '#cfe3f5'; cx.font = (wide ? 11 : 10) + 'px ' + MONO;
    cx.fillText(wide ? `${a.name} · ${fmtH(v)}` : fmtH(v), x, y + rr + 12);
  });
  if (n) {
    const sa = still ? 1 : t / 2600, sx = x0 + Math.cos(sa) * avail * k, sy = y0 + Math.sin(sa) * avail;
    cx.fillStyle = '#e6f1ff'; cx.fillRect(sx - 2, sy - 2, 4, 4); cx.fillRect(sx - 6, sy - 1, 3, 2); cx.fillRect(sx + 3, sy - 1, 3, 2);
  } else { cx.fillStyle = '#8b9bb0'; cx.font = '13px ' + MONO; cx.fillText('Agregá un planeta para empezar', x0, y0 + sunR * 2.4); }
}
function draw(t) {
  requestAnimationFrame(draw);
  if (W && H && cv.offsetParent !== null) { try { paint(t); } catch (e) { console.error(e); } }
}

/* ---------- Cosmos: el cielo situado en tu ubicación ---------- */
const GEOK = 'orbita.geo', DEFGEO = { lat: -31.42, lon: -64.19, name: 'Córdoba, Argentina (aprox.)', def: 1 };
function loadGeo() {
  try { const g = JSON.parse(localStorage.getItem(GEOK)); if (g && Math.abs(g.lat) <= 90 && Math.abs(g.lon) <= 180) return { lat: +g.lat, lon: +g.lon, name: String(g.name || '').slice(0, 40) }; } catch (e) {}
  return DEFGEO;
}
let geo = loadGeo(), cdate = ds(today()), cmin = null, CD = null, lastCos = -1;
const tm = ms => { if (ms == null) return '—'; const d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const tmd = ms => { const d = new Date(ms); return `${d.getDate()} ${MES[d.getMonth()]} ${tm(ms)}`; };
const mix = (a, b, k) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const geoTxt = () => geo.name || `${Math.abs(geo.lat).toFixed(2)}° ${geo.lat < 0 ? 'S' : 'N'}, ${Math.abs(geo.lon).toFixed(2)}° ${geo.lon < 0 ? 'O' : 'E'}`;
const hz = id => id === 'luna' ? -0.833 : -0.6;
const SKYC = ['#3a76ad', '#6b5ea8', '#37366f', '#1a1d44', '#070914'];
const skyCls = a => a > -0.833 ? 0 : a > -6 ? 1 : a > -12 ? 2 : a > -18 ? 3 : 4;
const runs = (n, f) => { const o = []; let a = -1; for (let i = 0; i < n; i++) { if (f(i)) { if (a < 0) a = i; } else if (a >= 0) { o.push([a, i]); a = -1; } } if (a >= 0) o.push([a, n]); return o; };
const kv = rows => `<div class="kv">${rows.map(([k, v]) => `<span>${k}</span><b>${v}</b>`).join('')}</div>`;
function rsText(b) {
  const a = [['Sale', b.rise], ['Se pone', b.set]].filter(x => x[1] != null).sort((x, y) => x[1] - y[1]);
  return a.length ? a.map(x => `${x[0]} ${tm(x[1])}`).join(' · ') : b.always ? 'Todo el día sobre el horizonte' : 'No sale este día';
}
function moonShape(c, x, y, r, ph) { // la Luna vista desde tu hemisferio (en el sur se ve "invertida")
  const e = ph.elong * Math.PI / 180, a = r * Math.abs(Math.cos(e)), crescent = Math.cos(e) > 0, right = ph.waxing !== (geo.lat < 0);
  c.save(); c.fillStyle = '#1b2433'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.fillStyle = '#f4efdc'; c.beginPath();
  if (right) { c.arc(x, y, r, -Math.PI / 2, Math.PI / 2, false); c.ellipse(x, y, a, r, 0, Math.PI / 2, -Math.PI / 2, crescent); }
  else { c.arc(x, y, r, Math.PI / 2, Math.PI * 1.5, false); c.ellipse(x, y, a, r, 0, Math.PI * 1.5, Math.PI / 2, crescent); }
  c.fill(); c.restore();
}
function renderCos() {
  if (!window.Cosmos) { $('#cPlace').textContent = 'No se pudo cargar el módulo astronómico.'; return; }
  const d0 = pdt(cdate), t0 = d0.getTime(), t1 = addD(d0, 1).getTime(), isT = cdate === ds(today()), ref = isT ? Date.now() : t0 + 12 * 3600000;
  CD = Cosmos.day(t0, t1, geo.lat, geo.lon);
  const n = CD.n, A = CD.alts;
  $('#cPlace').innerHTML = `${esc(geoTxt())}${geo.def ? ' · tocá <b>Ubicación</b> para ajustarla a tu lugar' : ''}`;
  $('#cLbl').textContent = `${D3[dow(d0)]} ${d0.getDate()} ${MES[d0.getMonth()]} ${d0.getFullYear()}`;
  /* Sol */
  const s = CD.sun, z = Cosmos.zodiac(Cosmos.pos('sol', ref).lon2000), ns = Cosmos.nextSeason(ref);
  const SN = geo.lat < 0 ? { 0: 'otoño', 90: 'invierno', 180: 'primavera', 270: 'verano' } : { 0: 'primavera', 90: 'verano', 180: 'otoño', 270: 'invierno' };
  $('#cSun').innerHTML = `<h4>SOL</h4>` + kv([['Primera luz', tm(s.civilDawn)], ['Amanecer', tm(s.rise)], ['Mediodía solar', s.noon ? `${tm(s.noon)} · ${Math.round(s.noonAlt)}°` : '—'], ['Atardecer', tm(s.set)], ['Última luz', tm(s.civilDusk)],
    ['Duración del día', s.len == null ? '—' : fmtM(s.len / 60000)], ['Noche cerrada', `hasta ${tm(s.astroDawn)} · desde ${tm(s.astroDusk)}`]])
    + `<p class="hint">El Sol está en ${z}.${ns ? ` Próximo ${ns.ang % 180 ? 'solsticio' : 'equinoccio'}: ${tmd(ns.t)}, empieza el ${SN[ns.ang]}.` : ''}</p>`;
  /* Luna */
  const mp = Cosmos.moonPhase(ref), mb = CD.bodies.luna, np = Cosmos.nextPhases(ref, 4);
  $('#cMoon').innerHTML = `<h4>LUNA</h4><div class="moonrow"><canvas id="cMoonC" aria-label="Fase lunar"></canvas><div><b>${mp.name}</b><span class="mut">Iluminada ${Math.round(mp.k * 100)} % · ${mp.age.toFixed(1).replace('.', ',')} días</span><span class="mut">En la zona de ${Cosmos.zodiac(Cosmos.pos('luna', ref).lon2000)}</span></div></div>`
    + `<p class="hint">${rsText(mb)}</p>` + kv(np.map(p => [p.name, tmd(p.t)]));
  const mc = $('#cMoonC'), dpr = devicePixelRatio || 1; mc.width = mc.height = Math.round(76 * dpr);
  const mx = mc.getContext('2d'); mx.setTransform(dpr, 0, 0, dpr, 0, 0); moonShape(mx, 38, 38, 32, mp);
  /* Planetas */
  $('#cPl').innerHTML = Cosmos.PLANETS.map(p => {
    const b = CD.bodies[p.id], al = A[p.id], r = runs(n, i => al[i] > hz(p.id) && A.sol[i] < -6), at = i => t0 + i * CD.step;
    const vis = r.length ? 'Visible ' + r.map(([a, c]) => `${tm(at(a))}–${tm(at(c))}`).join(' y ') : b.never ? 'No sale este día' : 'No se ve: sale y se pone con el cielo claro';
    return `<div class="pl"><i style="background:${p.color};box-shadow:0 0 8px ${p.color}"></i><span><b>${p.name}</b> · en ${Cosmos.zodiac(Cosmos.pos(p.id, ref).lon2000)}<small>${vis}</small><small>${rsText(b)}</small></span></div>`;
  }).join('');
  /* Un día bajo el cielo: tu agenda y el cielo en la misma línea de tiempo */
  const now = isT ? `<span class="tnow" style="left:${(Date.now() - t0) / (t1 - t0) * 100}%"></span>` : '';
  const row = (label, inner) => `<div class="trow"><span>${label}</span><div class="tr">${inner}${now}</div></div>`;
  const seg = (a, b, st, ti) => `<span style="left:${a / n * 100}%;width:${(b - a) / n * 100}%;${st}"${ti ? ` title="${esc(ti)}"` : ''}></span>`;
  const agenda = dayBlocks(cdate).map(b => `<span style="left:${b.s / 14.4}%;width:${(b.e - b.s) / 14.4}%;background:${(act(b.a) || {}).color || '#888'}" title="${esc(hm(b.s) + '–' + hm(b.e) + ' ' + lab(b))}"></span>`).join('');
  let sky = '', i = 0; const cls = A.sol.slice(0, n).map(skyCls);
  while (i < n) { let j = i; while (j < n && cls[j] === cls[i]) j++; sky += seg(i, j, `background:${SKYC[cls[i]]}`); i = j; }
  const body = (id, color) => { let h = ''; i = 0; const st = k => A[id][k] > hz(id) ? (A.sol[k] < -6 ? 2 : 1) : 0; while (i < n) { let j = i; while (j < n && st(j) === st(i)) j++; if (st(i)) h += seg(i, j, `background:${color};opacity:${st(i) === 2 ? 1 : .35}`); i = j; } return h; };
  $('#cTl').innerHTML = row('Agenda', agenda) + row('Cielo', sky) + row('Luna', body('luna', '#e9e4cf')) + Cosmos.PLANETS.map(p => row(p.name, body(p.id, p.color))).join('')
    + `<div class="trow"><span></span><div class="ax">${[0, 6, 12, 18, 24].map(h => `<i style="left:${h / 24 * 100}%">${pad(h)}</i>`).join('')}</div></div>`
    + `<p class="hint">Cielo: azul = día, violeta = crepúsculo, oscuro = noche. En la Luna y los planetas, el color pleno indica que están sobre el horizonte con el cielo oscuro; el tenue, que es de día.</p>`;
  $('#cT').value = Math.min(1435, curMapMin());
  drawMap();
}
const curMapMin = () => cmin !== null ? cmin : cdate === ds(today()) ? nowMin() : 1320;
const cm = $('#cmap');
function drawMap() {
  if (!window.Cosmos || !CD) return;
  const w = cm.clientWidth; if (!w) return; const dpr = devicePixelRatio || 1;
  if (cm.width !== Math.round(w * dpr)) { cm.width = Math.round(w * dpr); cm.height = cm.width; }
  const c = cm.getContext('2d'), min = curMapMin(), follow = cmin === null && cdate === ds(today()), t = follow ? Date.now() : pdt(cdate).getTime() + min * 60000;
  const sk = Cosmos.skyAt(t, geo.lat, geo.lon), x0 = w / 2, y0 = w / 2, Rr = w / 2 - 24, dayk = Math.max(0, Math.min(1, (sk.sun.alt + 12) / 14)), sv = 1 - dayk * .88;
  const P = (alt, az, rad) => { const r = (90 - alt) / 90 * (rad || Rr), a = az * Math.PI / 180; return [x0 - r * Math.sin(a), y0 - r * Math.cos(a)]; };
  $('#cTl2').textContent = hm(min); $('#cT').value = Math.min(1435, min);
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, w);
  c.fillStyle = mix('#03050a', '#3a76ad', dayk); c.beginPath(); c.arc(x0, y0, Rr, 0, 7); c.fill();
  c.strokeStyle = 'rgba(39,245,201,.4)'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; [30, 60].forEach(a => { c.beginPath(); c.arc(x0, y0, (90 - a) / 90 * Rr, 0, 7); c.stroke(); });
  c.fillStyle = '#8b9bb0'; c.font = '700 12px ' + MONO; c.textAlign = 'center'; c.textBaseline = 'middle';
  [['N', 0], ['E', 90], ['S', 180], ['O', 270]].forEach(([l, az]) => { const [x, y] = P(0, az, Rr + 13); c.fillText(l, x, y); });
  c.globalAlpha = sv; c.strokeStyle = 'rgba(39,245,201,.4)'; c.lineWidth = 1;
  Object.values(Cosmos.LINES).forEach(ls => ls.forEach(([a, b]) => {
    const A1 = sk.stars[Cosmos.SIDX[a]], B1 = sk.stars[Cosmos.SIDX[b]]; if (A1.alt <= 0 || B1.alt <= 0) return;
    const [x1, y1] = P(A1.alt, A1.az), [x2, y2] = P(B1.alt, B1.az); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  }));
  const groups = {};
  sk.stars.forEach(st => {
    if (st.alt <= 0) return; const [x, y] = P(st.alt, st.az);
    c.fillStyle = st.mag < 1 ? '#fff6dc' : '#e6f1ff'; c.beginPath(); c.arc(x, y, Math.max(.9, 2.5 - .45 * st.mag), 0, 7); c.fill();
    if (st.alt > 5) { const g = groups[st.con] || (groups[st.con] = { x: 0, y: 0, k: 0, m: 9 }); g.x += x; g.y += y; g.k++; g.m = Math.min(g.m, st.mag); }
    if (st.mag < 1 && st.alt > 5 && sv > .3) { c.fillStyle = 'rgba(207,227,245,.9)'; c.font = '10px ' + MONO; c.textAlign = 'left'; c.fillText(st.name, x + 6, y - 5); }
  });
  c.fillStyle = 'rgba(39,245,201,.75)'; c.font = 'italic 10px ' + MONO; c.textAlign = 'center';
  Object.entries(groups).forEach(([k, g]) => { if (g.m <= 2.3 && sv > .3) c.fillText(Cosmos.CON[k], g.x / g.k, g.y / g.k + 14); });
  c.globalAlpha = 1; c.textAlign = 'left';
  sk.planets.forEach(p => {
    if (p.alt <= 0) return; const [x, y] = P(p.alt, p.az); c.globalAlpha = dayk > .6 ? .5 : 1;
    c.shadowColor = p.color; c.shadowBlur = 10; c.fillStyle = p.color; c.beginPath(); c.arc(x, y, 3.6, 0, 7); c.fill(); c.shadowBlur = 0;
    c.fillStyle = '#e6f1ff'; c.font = '11px ' + MONO; c.fillText(p.name, x + 7, y + 4);
  });
  c.globalAlpha = 1;
  if (sk.moon.alt > 0) { const [x, y] = P(sk.moon.alt, sk.moon.az); c.shadowColor = '#f4efdc'; c.shadowBlur = 12; moonShape(c, x, y, 8, sk.moon.phase); c.shadowBlur = 0; c.fillStyle = '#e6f1ff'; c.font = '11px ' + MONO; c.fillText('Luna', x + 12, y + 4); }
  if (sk.sun.alt > -1) { const [x, y] = P(Math.max(sk.sun.alt, 0), sk.sun.az); const g = c.createRadialGradient(x, y, 1, x, y, 20); g.addColorStop(0, '#fff7c2'); g.addColorStop(.35, '#ffd23f'); g.addColorStop(1, 'rgba(255,210,63,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 20, 0, 7); c.fill(); c.fillStyle = '#e6f1ff'; c.font = '11px ' + MONO; c.fillText('Sol', x + 14, y + 4); }
  const a = sk.sun.alt, up = (sk.moon.alt > 0 ? ['la Luna'] : []).concat(sk.planets.filter(p => p.alt > 0).map(p => p.name));
  $('#cInfo').textContent = `${hm(min)} · ${a > 0 ? 'de día' : a > -6 ? 'crepúsculo civil' : a > -12 ? 'crepúsculo náutico' : a > -18 ? 'crepúsculo astronómico' : 'noche cerrada'}. Sobre el horizonte: ${up.length ? up.join(', ') : 'ni la Luna ni los planetas'}.`;
  renderOracle(t);
}
if (window.ResizeObserver) new ResizeObserver(drawMap).observe(cm);
const cgo = k => { cdate = k; cmin = null; renderCos(); };
$('#cPrev').onclick = () => cgo(ds(addD(pdt(cdate), -1)));
$('#cNext').onclick = () => cgo(ds(addD(pdt(cdate), 1)));
$('#cHoy').onclick = () => cgo(ds(today()));
$('#cNow').onclick = () => cgo(ds(today()));
$('#cT').oninput = e => { cmin = +e.target.value; drawMap(); };
const dL = $('#dL');
$('#cLoc').onclick = () => { $('#lLa').value = geo.lat; $('#lLo').value = geo.lon; $('#lN').value = geo.def ? '' : geo.name; const h = $('#lH'); h.classList.remove('err'); h.textContent = 'Latitud negativa = sur, longitud negativa = oeste.'; dL.showModal(); };
$('#lX').onclick = () => dL.close();
$('#lGps').onclick = () => {
  const h = $('#lH'); h.classList.remove('err');
  if (!navigator.geolocation) { h.textContent = 'Este dispositivo no ofrece geolocalización: cargá las coordenadas a mano.'; return; }
  h.textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(p => { $('#lLa').value = p.coords.latitude.toFixed(4); $('#lLo').value = p.coords.longitude.toFixed(4); $('#lN').value = ''; h.textContent = 'Listo: tocá Guardar.'; },
    () => { h.classList.add('err'); h.textContent = 'No se pudo obtener la ubicación (permiso denegado o sin señal). Cargala a mano.'; }, { timeout: 10000, maximumAge: 600000 });
};
$('#fL').onsubmit = e => {
  e.preventDefault(); const la = parseFloat($('#lLa').value), lo = parseFloat($('#lLo').value), h = $('#lH');
  if (!(Math.abs(la) <= 90 && Math.abs(lo) <= 180)) { h.classList.add('err'); h.textContent = 'La latitud va de −90 a 90 y la longitud de −180 a 180.'; return; }
  geo = { lat: la, lon: lo, name: $('#lN').value.trim().slice(0, 40) };
  try { localStorage.setItem(GEOK, JSON.stringify(geo)); } catch (x) {}
  dL.close(); renderCos();
};

/* ---------- Oráculo: lectura simbólica del momento elegido en Cosmos ---------- */
let lastOr = '';
function renderOracle(t) {
  const box = $('#cOr'); if (!box) return;
  if (!window.Oraculo || !CD) { box.innerHTML = '<p class="hint">No se pudo cargar el oráculo.</p>'; return; }
  let r; try { r = Oraculo.read({ t, rise: CD.sun.rise, set: CD.sun.set }); } catch (e) { console.error(e); box.innerHTML = '<p class="hint">No se pudo calcular la lectura de este momento.</p>'; return; }
  const d = new Date(t), li = a => a.map(x => `<li>${esc(x)}</li>`).join('');
  const h = `<div class="orc-head ${r.tone.id}"><b>${esc(r.tone.title)} · ${D3[dow(d)]} ${d.getDate()} ${MES[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}</b><span>${esc(r.tone.text)}</span></div>`
    + `<div class="orc-chips">${r.chips.map(c => `<span${c.bad ? ' class="bad"' : ''}>${esc(c.t)}</span>`).join('')}</div>`
    + `<div class="orc-cols"><div class="orc-col si"><h4>PROPICIO</h4><ul>${li(r.si)}</ul></div><div class="orc-col no"><h4>MEJOR CON CUIDADO</h4><ul>${li(r.no)}</ul></div></div>`
    + `<p class="hint">${esc(r.theme)}</p><p class="hint">Lectura simbólica para reflexionar, no una predicción. Usa los signos del zodíaco tropical y el cielo calculado para tu ubicación.</p>`;
  if (h !== lastOr) { lastOr = h; box.innerHTML = h; }
}

/* ---------- Notas: registro con fecha, hora y minuto, en línea de tiempo ---------- */
const dI = d => `${ds(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const NMAX = 4000, NPAGE = 60;
let nAuto = true, nFilter = '', nDay = '', nLimit = NPAGE, nEdit = null;
const moonTag = t => { if (!window.Cosmos || !window.Oraculo) return ''; try { return Oraculo.moonTag(t); } catch (e) { return ''; } };
function noteList() {
  const q = norm(nFilter.trim());
  return S.notes.filter(n => (!nDay || ds(new Date(n.t)) === nDay) && (!q || norm(n.x).includes(q))).sort((a, b) => b.t - a.t);
}
function renderNotes() {
  const all = S.notes, list = noteList(), shown = list.slice(0, nLimit), tk = ds(today()), yk = yesterday(), yr = today().getFullYear(), per = {}, cnt = {};
  list.forEach(n => { const k = ds(new Date(n.t)); per[k] = (per[k] || 0) + 1; });
  all.forEach(n => { const k = ds(new Date(n.t)); cnt[k] = (cnt[k] || 0) + 1; });
  $('#nCount').textContent = all.length ? `${all.length} ${all.length === 1 ? 'nota' : 'notas'}${list.length !== all.length ? ` · ${list.length} con este filtro` : ''}` : '';
  $('#nMap').innerHTML = Array.from({ length: 30 }, (_, i) => {
    const d = addD(today(), i - 29), k = ds(d), c = cnt[k] || 0;
    return `<button type="button" data-k="${k}" class="${c ? 'l' + Math.min(3, c) : ''}${k === nDay ? ' on' : ''}" title="${d.getDate()} ${MES[d.getMonth()]}${c ? ' · ' + c + (c === 1 ? ' nota' : ' notas') : ''}" aria-label="${d.getDate()} de ${MESL[d.getMonth()].toLowerCase()}${c ? ', ' + c + (c === 1 ? ' nota' : ' notas') : ''}"></button>`;
  }).join('');
  let h = '', lastK = '';
  shown.forEach(n => {
    const d = new Date(n.t), k = ds(d), mt = moonTag(n.t);
    if (k !== lastK) {
      if (lastK) h += '</div>'; lastK = k;
      h += `<div class="ngrp"><div class="nday"><span>${DAYS[dow(d)]} ${d.getDate()} de ${MESL[d.getMonth()].toLowerCase()}${d.getFullYear() !== yr ? ' de ' + d.getFullYear() : ''}${k === tk ? ' · hoy' : k === yk ? ' · ayer' : ''}</span><small>${per[k]} ${per[k] === 1 ? 'nota' : 'notas'}</small></div>`;
    }
    h += `<button type="button" class="nitem" data-n="${n.id}"><span class="nt">${pad(d.getHours())}:${pad(d.getMinutes())}</span><span class="nb"><span class="nx">${esc(n.x)}</span>${mt ? `<span class="nm">${esc(mt)}</span>` : ''}</span></button>`;
  });
  if (lastK) h += '</div>';
  if (list.length > shown.length) h += `<button type="button" id="nMore">Mostrar más (${list.length - shown.length})</button>`;
  if (!list.length) h = `<p class="hint">${all.length ? 'Ninguna nota coincide con este filtro.' : 'Todavía no hay notas. Escribí la primera arriba: queda guardada con su fecha, hora y minuto.'}</p>`;
  $('#nTl').innerHTML = h;
}
$('#nForm').onsubmit = e => {
  e.preventDefault(); const x = $('#nText').value.trim(); if (!x) { $('#nText').focus(); return; }
  let t = Date.now(); if (!nAuto) { const v = new Date($('#nWhen').value).getTime(); if (Number.isFinite(v)) t = v; }
  S.notes.push({ id: uid(), t, x: x.slice(0, NMAX) }); save();
  $('#nText').value = ''; nAuto = true; $('#nWhen').value = dI(new Date());
  nFilter = ''; nDay = ''; nLimit = NPAGE; $('#nQ').value = ''; $('#nD').value = ''; renderNotes();
};
$('#nText').onkeydown = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); $('#nAdd').click(); } };
$('#nWhen').oninput = () => { nAuto = false; };
$('#nNow').onclick = () => { nAuto = true; $('#nWhen').value = dI(new Date()); };
$('#nQ').oninput = e => { nFilter = e.target.value; nLimit = NPAGE; renderNotes(); };
$('#nD').onchange = e => { nDay = DRE.test(e.target.value) ? e.target.value : ''; nLimit = NPAGE; renderNotes(); };
$('#nClr').onclick = () => { nFilter = ''; nDay = ''; nLimit = NPAGE; $('#nQ').value = ''; $('#nD').value = ''; renderNotes(); };
$('#nMap').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; nDay = nDay === b.dataset.k ? '' : b.dataset.k; $('#nD').value = nDay; nLimit = NPAGE; renderNotes(); };
$('#nTl').onclick = e => {
  if (e.target.closest('#nMore')) { nLimit += NPAGE; renderNotes(); return; }
  const b = e.target.closest('[data-n]'); if (b) openNote(b.dataset.n);
};
const dN = $('#dN');
function openNote(id) {
  const n = S.notes.find(x => x.id === id); if (!n) return; nEdit = n;
  $('#eT').value = n.x; $('#eW').value = dI(new Date(n.t)); $('#eM').textContent = moonTag(n.t); dN.showModal();
}
$('#eX').onclick = () => dN.close();
$('#fN').onsubmit = e => {
  e.preventDefault(); const x = $('#eT').value.trim(), v = new Date($('#eW').value).getTime(); if (!x || !nEdit) return;
  nEdit.x = x.slice(0, NMAX); if (Number.isFinite(v)) nEdit.t = v; save(); dN.close(); renderNotes();
};
$('#eDel').onclick = () => { if (!nEdit || !confirm('¿Eliminar esta nota?')) return; S.notes = S.notes.filter(n => n !== nEdit); save(); dN.close(); renderNotes(); };
$('#nTxt').onclick = () => {
  if (!S.notes.length) { alert('Todavía no hay notas para exportar.'); return; }
  const txt = S.notes.slice().sort((a, b) => a.t - b.t).map(n => { const d = new Date(n.t); return `[${ds(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}] ${n.x}`; }).join('\n\n') + '\n';
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
  a.download = 'orbita-notas-' + ds(today()) + '.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

/* ---------- Tutorial ---------- */
const dT = $('#dT');
const TUT = [
  { t: 'Bienvenido a Órbita', b: 'Tu semana como sistema solar: cada actividad de tu vida es un <b>planeta</b>, y la que elijas como más importante va al <b>centro, como el sol</b>. Todo lo demás gira a su alrededor según las horas que le dedicás. Cargamos una semana de ejemplo para que veas cómo funciona; este tutorial te muestra cómo reemplazarla por la tuya.' },
  { t: 'Creá tus planetas', b: 'Andá a la pestaña <b>Planetas</b> y tocá <b>+ Nuevo</b> para cargar las actividades de tu vida: trabajo, estudio, familia, descanso... lo que sea. Elegí un color para cada una y marcá <b>"Va en el centro (el sol)"</b> en la que más te importa; solo puede haber una.' },
  { t: 'Armá tu semana regular', b: 'En <b>Semana</b> definís tu semana tipo, día por día. Tocá un hueco <b>"Sin asignar"</b> (o <b>+ Nuevo bloque</b>) para asignarle un horario a un planeta: por ejemplo Sueño de 23 a 7, Desayuno a las 8, Trabajo de 9 a 13. Podés aplicar un mismo bloque a varios días a la vez.' },
  { t: 'Viví tu semana', b: 'La <b>Bitácora</b> proyecta tu semana regular a cada fecha concreta. Si un día hacés algo distinto, tocá el bloque y corregilo: ese día queda marcado como personalizado o corregido, sin tocar tu semana regular. En <b>Cielo</b> ves tu sistema solar animado, con el tamaño de cada planeta según las horas reales que le dedicás.' },
  { t: 'Balance y respaldo', b: 'En <b>Balance</b> mirás cuánto tiempo le dedicaste a cada planeta y podés descargar tu semana en PDF. Como todo se guarda en el dispositivo, usá <b>Exportar datos</b> cada tanto para tener una copia de tu agenda — sobre todo antes de cambiar de dispositivo o borrar datos del navegador — y <b>Importar datos</b> para recuperarla desde ese archivo.' }
];
let tStep = 0;
function renderTut() {
  const n = TUT.length, s = TUT[tStep];
  $('#tCount').textContent = `Paso ${tStep + 1} de ${n}`;
  $('#tTitle').textContent = s.t;
  $('#tBody').innerHTML = s.b;
  $('#tPrev').hidden = tStep === 0;
  $('#tNext').textContent = tStep === n - 1 ? 'Empezar' : 'Siguiente';
}
function openTut() { tStep = 0; renderTut(); dT.showModal(); }
$('#help').onclick = openTut;
$('#tPrev').onclick = () => { tStep = Math.max(0, tStep - 1); renderTut(); };
$('#tNext').onclick = () => { if (tStep === TUT.length - 1) dT.close(); else { tStep++; renderTut(); } };
$('#tSkip').onclick = () => dT.close();

/* ---------- Arranque ---------- */
function renderAll() { recalc(); renderHead(); renderPer(); renderLegend(); renderActs(); renderBal(); renderBit(); renderTpl(); lastNow = ''; renderNow(); if ($('#v-cos').classList.contains('on')) renderCos(); if ($('#v-not').classList.contains('on')) renderNotes(); }
function tick() {
  const k = ds(today()), busy = document.querySelector('dialog[open]');
  if (k !== lastDay && !busy) { lastDay = k; freeze(); renderAll(); return; }
  renderNow(); const m = nowMin();
  if (nAuto && !busy && $('#v-not').classList.contains('on') && document.activeElement !== $('#nWhen')) { const v = dI(new Date()); if ($('#nWhen').value !== v) $('#nWhen').value = v; }
  if (m !== lastMin && !busy) { lastMin = m; renderBit(); }
  if (m !== lastCos && !busy && $('#v-cos').classList.contains('on')) { lastCos = m; if (cmin === null && cdate === k) renderCos(); }
}
$('#nWhen').value = dI(new Date()); freeze(); save(); renderAll(); resize(); setInterval(tick, 1000); requestAnimationFrame(draw);
if (FIRST_RUN) openTut();
})();
