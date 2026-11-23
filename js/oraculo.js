/* Órbita · Oráculo: lectura simbólica del momento cósmico (sin dependencias; usa Cosmos).
   Combina fase lunar, signo de la Luna y del Sol (zodíaco tropical), regente del día, hora planetaria,
   aspectos de la Luna a los planetas y retrogradaciones, y las traduce en "qué es propicio" y "qué conviene con cuidado".
   Es una lectura simbólica para reflexionar, no una predicción. */
(function (root) {
'use strict';
const mod = (x, n) => ((x % n) + n) % n, R = Math.PI / 180, DAY = 86400000;

const SIGNS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];
const GLYPH = '♈♉♊♋♌♍♎♏♐♑♒♓'.split('').map(g => g + '\uFE0E');
const sign = lon => Math.floor(mod(lon, 360) / 30);

/* Fases: [nombre, propicio[], con cuidado[]] — se elige por elongación Luna-Sol en tramos de 45° */
const PHASES = [
  ['Luna nueva', ['Sembrar intenciones y planear en silencio', 'Descansar y hacer lugar para lo nuevo'], ['Lanzamientos ruidosos o decisiones grandes apuradas']],
  ['Luna creciente', ['Dar los primeros pasos de lo que intencionaste', 'Proponer, pedir y empezar contactos'], ['Abandonar a mitad de camino por dudar de tu ritmo']],
  ['Cuarto creciente', ['Tomar decisiones y resolver obstáculos con acción', 'Ajustar el rumbo sin esperar más'], ['Postergar esa conversación o tarea incómoda']],
  ['Gibosa creciente', ['Pulir, revisar y afinar detalles', 'Sostener el esfuerzo: ya falta poco'], ['Cambiar todo a último momento', 'Caer en el perfeccionismo que traba']],
  ['Luna llena', ['Mostrar lo hecho, celebrar y compartir', 'Cerrar ciclos con claridad'], ['Discutir por cansancio o sobreestímulo', 'Decidir con la emoción al máximo']],
  ['Gibosa menguante', ['Agradecer, enseñar y compartir lo aprendido', 'Ordenar y repartir lo que sobra'], ['Arrancar proyectos enormes', 'Acumular lo que ya no sirve']],
  ['Cuarto menguante', ['Soltar hábitos y desarmar lo que no funciona', 'Perdonar, limpiar y hacer balance'], ['Aferrarte a lo viejo', 'Forzar lo que ya cumplió su ciclo']],
  ['Luna menguante', ['Descansar, cuidar el cuerpo y hacer silencio', 'Cerrar pendientes chicos'], ['Asumir compromisos nuevos', 'Sobreexigirte']]
];
const phaseIdx = e => Math.floor(mod(e + 22.5, 360) / 45);

/* Luna en cada signo: [propicio, con cuidado] */
const MOON_SIGN = [
  ['Tomar la iniciativa, mover el cuerpo y arrancar', 'La impulsividad y discutir por impaciencia'],
  ['Trabajo manual, cocinar y ocuparte de lo concreto y del cuerpo', 'Los cambios bruscos y gastar por antojo'],
  ['Escribir, conversar, hacer trámites y aprender', 'Dispersarte en diez cosas a la vez'],
  ['El hogar, la familia, la comida y dejarte cuidar', 'Reaccionar desde la sensibilidad en una confrontación dura'],
  ['Crear, mostrarte y dar la cara con tus proyectos', 'El orgullo en las discusiones'],
  ['Ordenar, depurar, revisar detalles y cuidar la rutina', 'Criticar de más, a vos o a otros'],
  ['Negociar, acordar y cuidar vínculos y socios', 'Decidir por complacer o quedarte en la indecisión'],
  ['Investigar a fondo, soltar lo que pesa y mirar hacia adentro', 'Los rencores y remover heridas sin necesidad'],
  ['Viajar, estudiar, planear en grande y hablar claro', 'Prometer de más o ser brusco con la verdad'],
  ['Trabajo serio, estructura, metas largas y trámites formales', 'La rigidez y no darte descanso'],
  ['Ideas nuevas, tecnología, comunidad y proyectos colectivos', 'La distancia emocional y cambiar por simple rebeldía'],
  ['La intuición, el arte, la música y el descanso', 'Cerrar contratos o decisiones prácticas importantes']
];
const THEME = ['inicio y coraje', 'construir y disfrutar lo concreto', 'curiosidad y conversación', 'hogar y cuidado', 'creatividad y brillo propio', 'orden y servicio',
  'equilibrio y acuerdos', 'profundidad y transformación', 'búsqueda y expansión', 'estructura y logro', 'ideas y comunidad', 'intuición y cierre de ciclo'];

/* Regente del día de la semana (0 = domingo) y orden caldeo para las horas planetarias */
const DAYR = ['Sol', 'Luna', 'Marte', 'Mercurio', 'Júpiter', 'Venus', 'Saturno'];
const CH = ['Saturno', 'Júpiter', 'Marte', 'Sol', 'Venus', 'Mercurio', 'Luna'];
const DAYT = {
  Sol: ['Dar la cara, liderar y cuidar tu vitalidad', 'El ego y la ostentación'],
  Luna: ['El hogar, las emociones y las rutinas cotidianas', 'Decidir solo desde el ánimo del momento'],
  Marte: ['La acción, el esfuerzo físico y enfrentar lo pendiente', 'Pelear, apurarte o manejar con enojo'],
  Mercurio: ['Comunicar, estudiar, hacer trámites y programar', 'Dispersarte o firmar sin leer'],
  'Júpiter': ['Pedir, enseñar, proponer y pensar en grande', 'Los excesos y las promesas de más'],
  Venus: ['Los vínculos, el arte, la belleza y las reconciliaciones', 'Gastar por impulso o complacer de más'],
  Saturno: ['La disciplina, el orden y las tareas pesadas', 'Exigirte de más o aislarte']
};
const HOURT = {
  Sol: ['Hora del Sol: ideal para lo importante y visible', 'Imponerte por la fuerza'],
  Luna: ['Hora de la Luna: escuchar la intuición y cuidar', 'Tomar decisiones duras'],
  Marte: ['Hora de Marte: destrabar y actuar', 'Discutir'],
  Mercurio: ['Hora de Mercurio: escribir, estudiar y gestionar', 'Firmar sin releer'],
  'Júpiter': ['Hora de Júpiter: pedir y proponer', 'Prometer de más'],
  Venus: ['Hora de Venus: vínculos, arte y disfrute', 'Gastar por impulso'],
  Saturno: ['Hora de Saturno: tareas serias y de orden', 'Exigirte de más']
};

/* Planetas retrógrados */
const RETRO = {
  mercurio: ['Mercurio', 'Revisar, repasar, corregir y retomar lo que quedó pendiente; respaldar datos', 'Firmar, lanzar o comprar tecnología sin revisar dos veces'],
  venus: ['Venus', 'Revisar tus valores y tus vínculos', 'Empezar vínculos nuevos, cambios de imagen drásticos o compras grandes'],
  marte: ['Marte', 'Recuperar energía y repensar la estrategia', 'Arrancar proyectos que exijan mucho empuje'],
  jupiter: ['Júpiter', 'Revisar tus creencias y planes de crecimiento', 'Apostar fuerte o expandirte sin revisar'],
  saturno: ['Saturno', 'Revisar estructuras y compromisos', 'Cargar con nuevas responsabilidades de golpe']
};

/* Aspectos de la Luna a los planetas: [ángulo, nombre, orbe, tipo] */
const ASP = [[0, 'conjunción', 6, 'c'], [60, 'sextil', 4, 'h'], [90, 'cuadratura', 5, 't'], [120, 'trígono', 5, 'h'], [180, 'oposición', 6, 't']];
const PNAME = { mercurio: 'Mercurio', venus: 'Venus', marte: 'Marte', jupiter: 'Júpiter', saturno: 'Saturno' };
const ASP_H = {
  mercurio: 'la mente y la palabra fluyen: buen momento para hablar, escribir o negociar',
  venus: 'armonía y afecto: acercate a quienes querés y disfrutá',
  marte: 'energía bien canalizada: hacé lo que requiere empuje',
  jupiter: 'optimismo y apertura: pedí, proponé y avanzá',
  saturno: 'constancia y calma: sostené lo que de verdad importa'
};
const ASP_T = {
  mercurio: 'los malentendidos se dan fácil: pensá dos veces antes de escribir o responder',
  venus: 'ánimo caprichoso o antojos: cuidado con los gastos y los reclamos afectivos',
  marte: 'tensión e irritabilidad: evitá discutir y manejá con calma',
  jupiter: 'tendencia al exceso: moderá gastos y expectativas',
  saturno: 'pesadez o desgano: no te exijas de más ni decidas desde el cansancio'
};
const ASP_C = { // conjunción: [bueno?, texto]
  mercurio: [1, 'mente muy activa: aprovechala para pensar y escribir'],
  venus: [1, 'sensibilidad y afecto a flor de piel: bueno para vínculos y arte'],
  marte: [0, 'impulso fuerte: canalizalo en movimiento y no en discusiones'],
  jupiter: [1, 'generosidad y entusiasmo: buen momento para proponer'],
  saturno: [0, 'ánimo serio y cargado: priorizá y descansá']
};

const pos = (id, t) => root.Cosmos.pos(id, t);
const phaseName = e => PHASES[phaseIdx(e)][0];
const elongAt = t => mod(pos('luna', t).lon - pos('sol', t).lon, 360);

/* Etiqueta corta para una nota: "Luna creciente · Luna en Leo" */
function moonTag(t) { const m = pos('luna', t); return `${phaseName(elongAt(t))} · Luna en ${SIGNS[sign(m.lon)]}`; }

/* Lectura de un instante. o = { t (ms), rise, set (ms del Sol ese día, o null) } */
function read(o) {
  const t = o.t, sun = pos('sol', t), moon = pos('luna', t), e = mod(moon.lon - sun.lon, 360), k = (1 - Math.cos(e * R)) / 2;
  const pi = phaseIdx(e), ph = PHASES[pi], ms = sign(moon.lon), ss = sign(sun.lon);
  const si = [], no = [], chips = []; let score = 0;

  /* Aspectos de la Luna (lo más específico del momento) */
  const asp = [];
  Object.keys(PNAME).forEach(id => {
    const d = Math.abs(mod(moon.lon - pos(id, t).lon + 180, 360) - 180);
    let best = null; ASP.forEach(a => { const orb = Math.abs(d - a[0]); if (orb <= a[2] && (!best || orb < best.orb)) best = { id, name: a[1], type: a[3], orb }; });
    if (best) asp.push(best);
  });
  asp.sort((a, b) => a.orb - b.orb).slice(0, 3).forEach(a => {
    const head = `Luna en ${a.name} con ${PNAME[a.id]}: `;
    if (a.type === 'h') { si.push(head + ASP_H[a.id]); score++; }
    else if (a.type === 't') { no.push(head + ASP_T[a.id]); score--; }
    else { const c = ASP_C[a.id]; (c[0] ? si : no).push(head + c[1]); score += c[0] ? 1 : -1; }
  });

  /* Retrogradaciones */
  const retro = [];
  Object.keys(RETRO).forEach(id => {
    const d = mod(pos(id, t + DAY).lon - pos(id, t - DAY).lon + 180, 360) - 180;
    if (d < 0) { retro.push(id); const r = RETRO[id]; si.push(`${r[0]} retrógrado: ${r[1].charAt(0).toLowerCase() + r[1].slice(1)}`); no.push(`${r[2]} (${r[0]} retrógrado)`); if (id !== 'jupiter' && id !== 'saturno') score--; } // los lentos (meses retrógrados) no cambian el clima del momento
  });

  /* Fase y signo de la Luna */
  ph[1].forEach(x => si.push(x)); ph[2].forEach(x => no.push(x));
  si.push(MOON_SIGN[ms][0].charAt(0).toUpperCase() + MOON_SIGN[ms][0].slice(1) + ' (Luna en ' + SIGNS[ms] + ')'); no.push(MOON_SIGN[ms][1].charAt(0).toUpperCase() + MOON_SIGN[ms][1].slice(1) + ' (Luna en ' + SIGNS[ms] + ')');

  /* Regente del día (el día astrológico empieza al amanecer) y hora planetaria */
  let dayIdx = new Date(t).getDay(), hour = null;
  if (o.rise != null && o.set != null && o.set > o.rise) {
    let len, n;
    if (t < o.rise) { dayIdx = (dayIdx + 6) % 7; const s = o.set - DAY; len = (o.rise - s) / 12; n = 12 + Math.floor((t - s) / len); }
    else if (t >= o.set) { len = (o.rise + DAY - o.set) / 12; n = 12 + Math.floor((t - o.set) / len); }
    else { len = (o.set - o.rise) / 12; n = Math.floor((t - o.rise) / len); }
    n = Math.max(0, Math.min(23, n));
    hour = { n: n + 1, ruler: CH[(CH.indexOf(DAYR[dayIdx]) + n) % 7] };
  }
  const dr = DAYR[dayIdx], dt = DAYT[dr];
  si.push(dt[0].charAt(0).toUpperCase() + dt[0].slice(1) + ` (día de ${dr})`); no.push(dt[1].charAt(0).toUpperCase() + dt[1].slice(1) + ` (día de ${dr})`);
  if (hour && hour.ruler !== dr) { const h = HOURT[hour.ruler]; si.push(h[0]); no.push(h[1] + ` (hora de ${hour.ruler})`); }

  chips.push({ t: `${ph[0]} · ${Math.round(k * 100)} %` }, { t: `Luna en ${SIGNS[ms]} ${GLYPH[ms]}` }, { t: `Sol en ${SIGNS[ss]} ${GLYPH[ss]}` }, { t: `Día de ${dr}` });
  if (hour) chips.push({ t: `Hora de ${hour.ruler}${hour.ruler === dr ? ' (refuerza el día)' : ''}` });
  retro.forEach(id => chips.push({ t: `${RETRO[id][0]} retrógrado`, bad: 1 }));

  const tone = score >= 1 ? { id: 'ok', title: 'Clima fluido', text: 'Hay varios factores a favor: buen momento para avanzar con lo importante.' }
    : score <= -2 ? { id: 'low', title: 'Clima exigente', text: 'Conviene bajar un cambio, revisar y evitar las decisiones grandes.' }
      : { id: 'mix', title: 'Clima mixto', text: 'Hay luces y sombras: elegí bien qué hacer ahora y qué dejar para otro momento.' };
  return { t, tone, chips, si: si.slice(0, 7), no: no.slice(0, 7), theme: `El Sol en ${SIGNS[ss]} marca el tema de fondo: ${THEME[ss]}.`, score };
}

const api = { read, moonTag, SIGNS, GLYPH, sign };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Oraculo = api;
})(typeof window !== 'undefined' ? window : globalThis);
