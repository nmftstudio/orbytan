/* Órbita · motor astronómico offline (sin dependencias).
   Sol, Luna, planetas visibles a ojo desnudo, crepúsculos, fases, estaciones y estrellas brillantes.
   Precisión de baja resolución: minutos para el Sol, unos 10-30 min para la Luna. */
(function (root) {
'use strict';
const R = Math.PI / 180, D = 180 / Math.PI, mod = (x, n) => ((x % n) + n) % n;
const jd = t => t / 86400000 + 2440587.5, cent = j => (j - 2451545) / 36525;
const MIN = 60000;

/* Elementos keplerianos (JPL, "Approximate Positions of the Planets", 1800-2050): a, e, I, L, long.perihelio, long.nodo (valor + tasa por siglo) */
const EL = {
  mercurio: [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
  venus: [0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
  tierra: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
  marte: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343],
  jupiter: [5.20288700, -0.00011607, 0.04838624, -0.00013253, 1.30439695, -0.00183714, 34.39644051, 3034.74612775, 14.72847983, 0.21252668, 100.47390909, 0.20469106],
  saturno: [9.53667594, -0.00125060, 0.05386179, -0.00050991, 2.48599187, 0.00193609, 49.95424423, 1222.49362201, 92.59887831, -0.41897216, 113.66242448, -0.28867794]
};
const PLANETS = [
  { id: 'mercurio', name: 'Mercurio', color: '#c9c3b6' }, { id: 'venus', name: 'Venus', color: '#fff2c4' }, { id: 'marte', name: 'Marte', color: '#ff6a4d' },
  { id: 'jupiter', name: 'Júpiter', color: '#ffcf9e' }, { id: 'saturno', name: 'Saturno', color: '#e8d28a' }
];

function helio(id, Tc) {
  const p = EL[id], a = p[0] + p[1] * Tc, e = p[2] + p[3] * Tc, I = (p[4] + p[5] * Tc) * R, L = p[6] + p[7] * Tc, w = p[8] + p[9] * Tc, O = (p[10] + p[11] * Tc) * R;
  const M = mod(L - w, 360) * R; let E = M + e * Math.sin(M);
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  const xp = a * (Math.cos(E) - e), yp = a * Math.sqrt(1 - e * e) * Math.sin(E), om = w * R - O;
  const co = Math.cos(om), so = Math.sin(om), cO = Math.cos(O), sO = Math.sin(O), cI = Math.cos(I), sI = Math.sin(I);
  return [(co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp, (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp, so * sI * xp + co * sI * yp];
}
const sd = x => Math.sin(x * R), cd = x => Math.cos(x * R);
const moonLon = T => 218.32 + 481267.881 * T + 6.29 * sd(135.0 + 477198.87 * T) - 1.27 * sd(259.3 - 413335.36 * T) + 0.66 * sd(235.7 + 890534.22 * T) + 0.21 * sd(269.9 + 954397.74 * T) - 0.19 * sd(357.5 + 35999.05 * T) - 0.11 * sd(186.5 + 966404.03 * T);
const moonLat = T => 5.13 * sd(93.3 + 483202.02 * T) + 0.28 * sd(228.2 + 960400.89 * T) - 0.28 * sd(318.3 + 6003.15 * T) - 0.17 * sd(217.6 - 407332.21 * T);
const moonPar = T => 0.9508 + 0.0518 * cd(135.0 + 477198.87 * T) + 0.0095 * cd(259.3 - 413335.36 * T) + 0.0078 * cd(235.7 + 890534.22 * T) + 0.0028 * cd(269.9 + 954397.74 * T);

function ecl2eq(lon, lat, eps) {
  const ra = Math.atan2(sd(lon) * cd(eps) - Math.tan(lat * R) * sd(eps), cd(lon)) * D;
  const dec = Math.asin(sd(lat) * cd(eps) + cd(lat) * sd(eps) * sd(lon)) * D;
  return { ra: mod(ra, 360), dec };
}
/* Posición geocéntrica de 'sol', 'luna' o un planeta. lon = eclíptica de la fecha; lon2000 sirve para ubicar la constelación. */
function pos(id, t) {
  const Tc = cent(jd(t)), eps = 23.439291 - 0.0130042 * Tc, p = 1.39697 * Tc; let lon, lat, l2000, plx = 0;
  if (id === 'luna') { lon = mod(moonLon(Tc), 360); lat = moonLat(Tc); plx = moonPar(Tc); l2000 = lon - p; }
  else {
    const e = helio('tierra', Tc); let g;
    if (id === 'sol') g = [-e[0], -e[1], -e[2]]; else { const h = helio(id, Tc); g = [h[0] - e[0], h[1] - e[1], h[2] - e[2]]; }
    l2000 = mod(Math.atan2(g[1], g[0]) * D, 360); lat = Math.atan2(g[2], Math.hypot(g[0], g[1])) * D; lon = l2000 + p;
  }
  const q = ecl2eq(lon, lat, eps);
  return { id, lon: mod(lon, 360), lat, lon2000: mod(l2000, 360), ra: q.ra, dec: q.dec, plx };
}
const gmst = j => mod(280.46061837 + 360.98564736629 * (j - 2451545), 360);
function altaz(ra, dec, j, lat, lon) {
  const H = (gmst(j) + lon - ra) * R, f = lat * R, d = dec * R;
  const alt = Math.asin(Math.sin(f) * Math.sin(d) + Math.cos(f) * Math.cos(d) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H) * Math.cos(d), Math.sin(d) * Math.cos(f) - Math.cos(d) * Math.cos(H) * Math.sin(f));
  return { alt: alt * D, az: mod(az * D, 360) };
}
function altOf(id, t, lat, lon) { // altura topocéntrica (la Luna incluye paralaje)
  const b = pos(id, t), a = altaz(b.ra, b.dec, jd(t), lat, lon);
  return id === 'luna' ? a.alt - b.plx * cd(a.alt) : a.alt;
}
const HZ = { sol: -0.833, luna: -0.833 }; const horizon = id => HZ[id] !== undefined ? HZ[id] : -0.6;

/* Cruces de un umbral entre muestras, refinados por bisección. */
function cross(alts, t0, step, thr, f) {
  const out = [];
  for (let i = 0; i < alts.length - 1; i++) {
    const a = alts[i] - thr, b = alts[i + 1] - thr;
    if ((a < 0) !== (b < 0)) {
      let lo = t0 + i * step, hi = lo + step; const below = a < 0;
      for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if ((f(m) - thr < 0) === below) lo = m; else hi = m; }
      out.push({ t: (lo + hi) / 2, up: b >= 0 });
    }
  }
  return out;
}
const first = (c, up) => { const x = c.find(v => v.up === up); return x ? x.t : null; };

/* Información de un día local [t0, t1) (ms) en (lat, lon): eventos del Sol, la Luna y los planetas, y muestras de altura cada 10 min. */
function day(t0, t1, lat, lon) {
  const step = 10 * MIN, n = Math.max(1, Math.round((t1 - t0) / step)), ids = ['sol', 'luna'].concat(PLANETS.map(p => p.id));
  const alts = {}; ids.forEach(id => { const a = new Array(n + 1); for (let i = 0; i <= n; i++) a[i] = altOf(id, t0 + i * step, lat, lon); alts[id] = a; });
  const sf = t => altOf('sol', t, lat, lon), sc = thr => cross(alts.sol, t0, step, thr, sf);
  const rs = sc(-0.833), civ = sc(-6), nau = sc(-12), ast = sc(-18);
  let mi = 0; alts.sol.forEach((v, i) => { if (v > alts.sol[mi]) mi = i; });
  let noon = null, noonAlt = alts.sol[mi];
  if (mi > 0 && mi < n) {
    let lo = t0 + (mi - 1) * step, hi = t0 + (mi + 1) * step;
    for (let k = 0; k < 40; k++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (sf(a) < sf(b)) lo = a; else hi = b; }
    noon = (lo + hi) / 2; noonAlt = sf(noon);
  }
  const rise = first(rs, true), set = first(rs, false);
  const upAll = alts.sol.every(v => v > -0.833), downAll = alts.sol.every(v => v <= -0.833);
  const sun = {
    rise, set, noon, noonAlt, civilDawn: first(civ, true), civilDusk: first(civ, false), nautDawn: first(nau, true), nautDusk: first(nau, false),
    astroDawn: first(ast, true), astroDusk: first(ast, false), len: rise !== null && set !== null ? (set > rise ? set - rise : set - rise + 86400000) : upAll ? 86400000 : downAll ? 0 : null
  };
  const bodies = {};
  ['luna'].concat(PLANETS.map(p => p.id)).forEach(id => {
    const c = cross(alts[id], t0, step, horizon(id), t => altOf(id, t, lat, lon));
    const up = alts[id].filter(v => v > horizon(id)).length;
    bodies[id] = { rise: first(c, true), set: first(c, false), always: up === alts[id].length, never: up === 0 };
  });
  return { t0, step, n, alts, sun, bodies };
}

/* Fase lunar */
const elong = t => mod(pos('luna', t).lon - pos('sol', t).lon, 360);
const PH = [[11.25, 'Luna nueva'], [78.75, 'Creciente'], [101.25, 'Cuarto creciente'], [168.75, 'Gibosa creciente'], [191.25, 'Luna llena'], [258.75, 'Gibosa menguante'], [281.25, 'Cuarto menguante'], [348.75, 'Menguante'], [361, 'Luna nueva']];
function moonPhase(t) {
  const e = elong(t), name = PH.find(p => e < p[0])[1];
  return { elong: e, k: (1 - cd(e)) / 2, age: e / 360 * 29.530588, name, waxing: e < 180 };
}
const PHN = { 0: 'Luna nueva', 90: 'Cuarto creciente', 180: 'Luna llena', 270: 'Cuarto menguante' };
function nextPhases(t, count) {
  const out = []; let a = t, ea = elong(a);
  for (let i = 0; i < 240 && out.length < (count || 4); i++) {
    const b = a + 3 * 3600000, eb = elong(b), qa = Math.floor(ea / 90), qb = Math.floor(eb / 90);
    if (qa !== qb || eb < ea) {
      const tgt = qb * 90;
      let lo = a, hi = b; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2, em = elong(m); if (mod(em - tgt + 180, 360) - 180 < 0) lo = m; else hi = m; }
      out.push({ t: (lo + hi) / 2, name: PHN[tgt], ang: tgt });
    }
    a = b; ea = eb;
  }
  return out;
}
/* Próximo equinoccio o solsticio: ang = 0 (marzo), 90 (junio), 180 (septiembre), 270 (diciembre) */
function nextSeason(t) {
  let a = t, la = pos('sol', a).lon;
  for (let i = 0; i < 400; i++) {
    const b = a + 12 * 3600000, lb = pos('sol', b).lon, qa = Math.floor(la / 90), qb = Math.floor(lb / 90);
    if (qa !== qb) {
      const tgt = qb * 90; let lo = a, hi = b;
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (mod(pos('sol', m).lon - tgt + 180, 360) - 180 < 0) lo = m; else hi = m; }
      return { t: (lo + hi) / 2, ang: tgt };
    }
    a = b; la = lb;
  }
  return null;
}

/* Constelaciones zodiacales por longitud eclíptica J2000 (límites IAU, aproximados) */
const ZOD = [[29.1, 'Aries'], [53.5, 'Tauro'], [90.4, 'Géminis'], [118.2, 'Cáncer'], [138.2, 'Leo'], [174.1, 'Virgo'], [217.8, 'Libra'], [241.1, 'Escorpio'], [247.7, 'Ofiuco'], [266.3, 'Sagitario'], [299.7, 'Capricornio'], [327.5, 'Acuario'], [351.6, 'Piscis']];
function zodiac(lon2000) { let n = 'Piscis'; for (const [l, nm] of ZOD) if (lon2000 >= l) n = nm; return n; }

/* Estrellas brillantes: [id, nombre, constelación, AR (h), Dec (°), magnitud] */
const CON = { CMa: 'Can Mayor', Car: 'Carina', Boo: 'Boyero', Cen: 'Centauro', Lyr: 'Lira', Aur: 'Cochero', Ori: 'Orión', CMi: 'Can Menor', Eri: 'Erídano', Aql: 'Águila', Cru: 'Cruz del Sur', Tau: 'Tauro', Sco: 'Escorpio', Vir: 'Virgo', Gem: 'Géminis', PsA: 'Pez Austral', Cyg: 'Cisne', Leo: 'Leo', UMa: 'Osa Mayor', Sgr: 'Sagitario', Hya: 'Hidra', Pav: 'Pavo', And: 'Andrómeda', Ari: 'Aries', Cet: 'Ballena', Oph: 'Ofiuco', Dra: 'Dragón', Peg: 'Pegaso', Lib: 'Libra', Cap: 'Capricornio', Aqr: 'Acuario', Psc: 'Piscis', Cnc: 'Cáncer', UMi: 'Osa Menor', TrA: 'Triángulo Austral', Gru: 'Grulla', Phe: 'Fénix', Vel: 'Vela' };
const STARS = [
  ['sirio', 'Sirio', 'CMa', 6.7525, -16.7161, -1.46], ['canopus', 'Canopus', 'Car', 6.3992, -52.6957, -0.74], ['arturo', 'Arturo', 'Boo', 14.2610, 19.1824, -0.05],
  ['acen', 'Alfa Centauri', 'Cen', 14.6600, -60.8350, -0.27], ['vega', 'Vega', 'Lyr', 18.6156, 38.7837, 0.03], ['capella', 'Capella', 'Aur', 5.2782, 45.9980, 0.08],
  ['rigel', 'Rigel', 'Ori', 5.2423, -8.2016, 0.13], ['procyon', 'Proción', 'CMi', 7.6550, 5.2250, 0.34], ['achernar', 'Achernar', 'Eri', 1.6286, -57.2367, 0.46],
  ['betelgeuse', 'Betelgeuse', 'Ori', 5.9195, 7.4071, 0.5], ['hadar', 'Hadar', 'Cen', 14.0637, -60.3730, 0.61], ['altair', 'Altair', 'Aql', 19.8464, 8.8683, 0.77],
  ['acrux', 'Acrux', 'Cru', 12.4433, -63.0991, 0.76], ['aldebaran', 'Aldebarán', 'Tau', 4.5987, 16.5093, 0.85], ['antares', 'Antares', 'Sco', 16.4901, -26.4320, 1.06],
  ['spica', 'Spica', 'Vir', 13.4199, -11.1613, 0.97], ['polux', 'Pólux', 'Gem', 7.7553, 28.0262, 1.14], ['fomalhaut', 'Fomalhaut', 'PsA', 22.9608, -29.6222, 1.16],
  ['deneb', 'Deneb', 'Cyg', 20.6905, 45.2803, 1.25], ['mimosa', 'Mimosa', 'Cru', 12.7953, -59.6888, 1.25], ['regulo', 'Régulo', 'Leo', 10.1395, 11.9672, 1.35],
  ['adhara', 'Adhara', 'CMa', 6.9771, -28.9721, 1.5], ['castor', 'Cástor', 'Gem', 7.5767, 31.8883, 1.58], ['gacrux', 'Gacrux', 'Cru', 12.5194, -57.1132, 1.64],
  ['shaula', 'Shaula', 'Sco', 17.5601, -37.1038, 1.62], ['bellatrix', 'Bellatrix', 'Ori', 5.4189, 6.3497, 1.64], ['elnath', 'Elnath', 'Tau', 5.4382, 28.6075, 1.65],
  ['miaplacidus', 'Miaplacidus', 'Car', 9.2200, -69.7172, 1.67], ['alnilam', 'Alnilam', 'Ori', 5.6036, -1.2019, 1.69], ['alnitak', 'Alnitak', 'Ori', 5.6793, -1.9426, 1.77],
  ['mintaka', 'Mintaka', 'Ori', 5.5334, -0.2991, 2.23], ['saiph', 'Saiph', 'Ori', 5.7959, -9.6696, 2.07], ['dubhe', 'Dubhe', 'UMa', 11.0621, 61.7508, 1.79],
  ['alioth', 'Alioth', 'UMa', 12.9005, 55.9598, 1.77], ['mizar', 'Mizar', 'UMa', 13.3988, 54.9254, 2.04], ['alkaid', 'Alkaid', 'UMa', 13.7923, 49.3133, 1.86],
  ['sargas', 'Sargas', 'Sco', 17.6220, -42.9978, 1.87], ['kaus', 'Kaus Australis', 'Sgr', 18.4029, -34.3846, 1.85], ['nunki', 'Nunki', 'Sgr', 18.9211, -26.2967, 2.05],
  ['alphard', 'Alphard', 'Hya', 9.4598, -8.6586, 1.98], ['peacock', 'Peacock', 'Pav', 20.4275, -56.7351, 1.94], ['alpheratz', 'Alpheratz', 'And', 0.1398, 29.0905, 2.06],
  ['mirach', 'Mirach', 'And', 1.1622, 35.6206, 2.05], ['hamal', 'Hamal', 'Ari', 2.1196, 23.4624, 2.0], ['diphda', 'Diphda', 'Cet', 0.7265, -17.9866, 2.04],
  ['rasalhague', 'Rasalhague', 'Oph', 17.5822, 12.5600, 2.07], ['eltanin', 'Eltanin', 'Dra', 17.9434, 51.4889, 2.23], ['markab', 'Markab', 'Peg', 23.0793, 15.2053, 2.49],
  ['denebola', 'Denébola', 'Leo', 11.8177, 14.5721, 2.14], ['zubenesch', 'Zubeneschamali', 'Lib', 15.2835, -9.3829, 2.61], ['denebalgedi', 'Deneb Algedi', 'Cap', 21.7839, -16.1273, 2.87],
  ['sadalsuud', 'Sadalsuud', 'Aqr', 21.5259, -5.5712, 2.9], ['alrescha', 'Alrescha', 'Psc', 2.0340, 2.7637, 3.8], ['altarf', 'Altarf', 'Cnc', 8.2752, 9.1857, 3.5],
  ['polaris', 'Polaris', 'UMi', 2.5303, 89.2641, 2.0], ['imai', 'Imai', 'Cru', 12.2523, -58.7489, 2.8], ['menkent', 'Menkent', 'Cen', 14.1114, -36.3700, 2.06],
  ['atria', 'Atria', 'TrA', 16.8111, -69.0277, 1.92], ['alnair', 'Alnair', 'Gru', 22.1372, -46.9610, 1.74], ['ankaa', 'Ankaa', 'Phe', 0.4381, -42.3060, 2.4],
  ['avior', 'Avior', 'Car', 8.3752, -59.5095, 1.86], ['suhail', 'Suhail', 'Vel', 9.1331, -43.4326, 2.2], ['pleyades', 'Pléyades', 'Tau', 3.7914, 24.1051, 2.9]
];
const LINES = { // figuras reconocibles: pares de ids de estrellas
  'Orión': [['betelgeuse', 'bellatrix'], ['bellatrix', 'mintaka'], ['mintaka', 'alnilam'], ['alnilam', 'alnitak'], ['alnitak', 'betelgeuse'], ['alnitak', 'saiph'], ['mintaka', 'rigel']],
  'Cruz del Sur': [['acrux', 'gacrux'], ['mimosa', 'imai']],
  'Triángulo de verano': [['vega', 'deneb'], ['deneb', 'altair'], ['altair', 'vega']],
  'Punteros': [['acen', 'hadar']]
};
const SIDX = {}; STARS.forEach((s, i) => { SIDX[s[0]] = i; });

/* Cielo completo en un instante: alturas y acimuts */
function skyAt(t, lat, lon) {
  const j = jd(t), yrs = (j - 2451545) / 365.25, out = { t, sun: null, moon: null, planets: [], stars: [] };
  const mk = id => { const b = pos(id, t), a = altaz(b.ra, b.dec, j, lat, lon); if (id === 'luna') a.alt -= b.plx * cd(a.alt); return { id, alt: a.alt, az: a.az, lon2000: b.lon2000, lat: b.lat }; };
  out.sun = mk('sol'); out.moon = mk('luna'); out.moon.phase = moonPhase(t);
  PLANETS.forEach(p => { const o = mk(p.id); o.name = p.name; o.color = p.color; out.planets.push(o); });
  STARS.forEach(s => {
    const ra0 = s[3] * 15, dec0 = s[4], t1 = Math.tan(dec0 * R);
    const ra = ra0 + (3.07496 + 1.33621 * sd(ra0) * t1) * 15 / 3600 * yrs, dec = dec0 + 20.0431 / 3600 * cd(ra0) * yrs, a = altaz(ra, dec, j, lat, lon);
    out.stars.push({ id: s[0], name: s[1], con: s[2], mag: s[5], alt: a.alt, az: a.az });
  });
  return out;
}

const api = { PLANETS, CON, STARS, LINES, SIDX, pos, altOf, altaz, day, moonPhase, nextPhases, nextSeason, zodiac, skyAt, elong };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Cosmos = api;
})(typeof window !== 'undefined' ? window : globalThis);
