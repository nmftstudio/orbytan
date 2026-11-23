/* Órbita · generador mínimo de PDF (sin dependencias).
   OrbitaPDF.weekly({ title, subtitle, days, legend, footer }) -> Uint8Array
   days:   [{ label, today, blocks: [{ s, e, label, color }] }]   (s/e en minutos, 0-1440)
   legend: [{ name, color, hours }]                               */
(function (root) {
'use strict';
const PW = 842, PH = 595, M = 28; // A4 apaisado, en puntos

// Los textos se codifican en WinAnsi (Latin-1 alcanza para el español).
const MAP = { '–': '-', '—': '-', '‒': '-', '→': '->', '←': '<-', '“': '"', '”': '"', '‘': "'", '’': "'", '…': '...', '•': '*', '✎': '' };
function enc(s) {
  let o = '';
  for (const ch of String(s)) {
    const c = MAP[ch] !== undefined ? MAP[ch] : ch, code = c.length === 1 ? c.charCodeAt(0) : 63;
    o += c.length > 1 ? c : code > 255 ? '?' : c;
  }
  return o.replace(/[\\()]/g, m => '\\' + m).replace(/[\r\n]+/g, ' ');
}
const num = n => (Math.round(n * 100) / 100).toString();
function rgb(hex, mix) { // mix 0..1 hacia blanco
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888', k = mix || 0;
  return [1, 3, 5].map(i => { const v = parseInt(h.slice(i, i + 2), 16) / 255; return num(v + (1 - v) * k); }).join(' ');
}
const tw = (s, size, bold) => String(s).length * size * (bold ? 0.56 : 0.52); // ancho aproximado (Helvetica)
const hm = m => (m >= 1440 ? '24:00' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0'));

function weekly(o) {
  const ops = [];
  const fill = c => ops.push(c + ' rg'), stroke = c => ops.push(c + ' RG');
  const rect = (x, y, w, h, mode) => ops.push(`${num(x)} ${num(y)} ${num(w)} ${num(h)} re ${mode || 'f'}`);
  const line = (x1, y1, x2, y2, w) => ops.push(`${num(w || .4)} w ${num(x1)} ${num(y1)} m ${num(x2)} ${num(y2)} l S`);
  const text = (s, x, y, size, bold) => ops.push(`BT /F${bold ? 2 : 1} ${num(size)} Tf 1 0 0 1 ${num(x)} ${num(y)} Tm (${enc(s)}) Tj ET`);

  // Encabezado
  fill('0.04 0.06 0.09'); text(o.title || 'ÓRBITA · Cronograma semanal', M, PH - M - 12, 17, true);
  fill('0.45 0.5 0.58'); text(o.subtitle || '', M, PH - M - 27, 9.5);

  // Grilla
  const gx = M + 26, gw = PW - M - gx, cw = gw / 7, headH = 16, gTop = PH - M - 50 - headH, hh = 18.4, gBot = gTop - 24 * hh;
  const days = (o.days || []).slice(0, 7);
  days.forEach((d, i) => {
    const x = gx + i * cw;
    fill(d.today ? '1 0.82 0.25' : '0.04 0.06 0.09'); rect(x + .5, gTop, cw - 1, headH);
    fill(d.today ? '0.1 0.08 0' : '1 1 1'); text(d.label, x + 6, gTop + 5, 8.5, true);
  });
  for (let h = 0; h <= 24; h++) { // líneas horarias
    const y = gTop - h * hh; stroke(h % 6 === 0 ? '0.62 0.66 0.72' : '0.87 0.89 0.92'); line(gx, y, gx + gw, y, h % 6 === 0 ? .6 : .3);
    if (h < 24) { fill('0.45 0.5 0.58'); text(String(h).padStart(2, '0'), M + 8, y - 7, 6.5); }
  }
  stroke('0.75 0.78 0.83'); for (let i = 0; i <= 7; i++) line(gx + i * cw, gTop, gx + i * cw, gBot, .4);

  // Bloques
  days.forEach((d, i) => (d.blocks || []).forEach(b => {
    const x = gx + i * cw + 1.5, w = cw - 3, top = gTop - b.s / 60 * hh, h = (b.e - b.s) / 60 * hh - .6, y = top - h;
    if (h <= 0) return;
    fill(rgb(b.color, .68)); rect(x, y, w, h);
    fill(rgb(b.color, 0)); rect(x, y, 2.6, h);
    ops.push('q'); rect(x + 4.5, y, w - 5.5, h, 'W n');
    fill('0.06 0.08 0.11');
    if (h >= 10) text(b.label, x + 6, top - 8.4, 7, true); else if (h >= 5.5) text(b.label, x + 6, top - 5.2, 5.5, true);
    if (h >= 24) { fill('0.3 0.34 0.4'); text(hm(b.s) + ' - ' + hm(b.e), x + 6, top - 16.4, 6); }
    ops.push('Q');
  }));

  // Leyenda: horas de la semana por planeta
  let lx = M, ly = gBot - 14;
  (o.legend || []).forEach(g => {
    const label = `${g.name} ${g.hours}`, w = 12 + tw(label, 7) + 12;
    if (lx + w > PW - M) { lx = M; ly -= 11; }
    if (ly < 22) return;
    fill(rgb(g.color, 0)); rect(lx, ly - .5, 7, 7); fill('0.2 0.24 0.3'); text(label, lx + 11, ly, 7);
    lx += w;
  });
  fill('0.6 0.64 0.7'); text(o.footer || '', M, 14, 6.5);

  // Ensamblado del archivo
  const stream = ops.join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Title (${enc(String(o.docTitle || 'Cronograma semanal Orbita').replace(/[^\x20-\x7e]/g, ''))}) /Producer (Orbita) >>`
  ];
  let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offs = [];
  objs.forEach((b, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${b}\nendobj\n`; });
  const xr = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xr}\n%%EOF\n`;
  const u = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255;
  return u;
}

const api = { weekly };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.OrbitaPDF = api;
})(typeof window !== 'undefined' ? window : globalThis);
