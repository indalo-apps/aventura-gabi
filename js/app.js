// La versión la pone build.py en <meta name="app-version"> (no se toca a mano)
const APP_VERSION = (document.querySelector('meta[name="app-version"]') || {}).content || "dev";
const APP_DATE = (document.querySelector('meta[name="app-date"]') || {}).content || "";
const KID = "Gabi";
// Dentro de Claude, descargas y voz pasan por la plataforma; publicada en una web normal (Netlify), por el navegador
const IN_CLAUDE = !!(window.claude && window.claude.use);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
// ---------- Adela: se dibuja por capas (ropa elegida + cara según el momento) ----------
const WARDROBE = {
  head: { label: "Cabeza", items: [
    ["gafas", "Gafas de corazón", 0], ["sombrero", "Sombrero explorador", 25], ["diadema", "Diadema con lazo", 50],
    ["boina", "Boina", 90], ["flores", "Corona de flores", 140], ["gorra", "Gorra", 200], ["corona", "Corona real", 400]] },
  jacket: { label: "Chaqueta", items: [
    ["morada", "Morada", 0], ["verde", "Verde", 15], ["roja", "Roja", 40], ["azul", "Azul", 70], ["naranja", "Naranja", 110], ["dorada", "Dorada", 300]] },
  hair: { label: "Pelo", items: [
    ["castano", "Castaño", 0], ["rubio", "Rubio", 35], ["pelirrojo", "Pelirrojo", 60], ["negro", "Negro", 80], ["rosa", "Rosa", 180], ["azul", "Azul", 250]] },
  extra: { label: "Complemento", items: [
    ["nada", "Nada", 0], ["bufanda", "Bufanda", 45], ["medalla", "Medalla", 120], ["mochila", "Mochila", 160]] },
};
const JACKETS = { morada: ["#7b5cff", "#5a3fe0"], verde: ["#22b573", "#168a56"], roja: ["#e0485e", "#b8304a"], azul: ["#3f8cff", "#2563c9"], naranja: ["#ff8a3d", "#d96a1f"], dorada: ["#ffc93c", "#d99e00"] };
const HAIRS = { castano: ["#6b3a20", "#d99a5b"], rubio: ["#e8b84a", "#fff0a8"], pelirrojo: ["#c4541f", "#ff9a5c"], negro: ["#2a2230", "#6b5f7a"], rosa: ["#ff7eb6", "#ffd0e6"], azul: ["#3f6fd9", "#9fc4ff"] };
const outfitDefault = { head: "gafas", jacket: "morada", hair: "castano", extra: "nada" };
let outfit = Object.assign({}, outfitDefault, store.get("gabi:outfit") || {});
const totalStars = () => store.get("gabi:totalStars") || 0;
const itemCost = (slot, key) => (WARDROBE[slot].items.find(i => i[0] === key) || [0, 0, 0])[2];
const unlocked = (slot, key) => itemCost(slot, key) <= totalStars();

function adelaSVG(mood, o) {
  o = o || outfit;
  const [jk, jkd] = JACKETS[o.jacket] || JACKETS.morada, [hc, hl] = HAIRS[o.hair] || HAIRS.castano, ink = "#2b2d5c";
  const happyEyes = mood === "happy" || mood === "cheer";
  let s = '<ellipse cx="50" cy="97" rx="24" ry="3" fill="#000" opacity=".12"/>';
  // destellos
  s += '<path d="M10 22 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2z" fill="#ffc93c" stroke="#e09b00" stroke-width="1"/>' +
       '<path d="M88 14 l1.5 -4.5 l1.5 4.5 l4.5 1.5 l-4.5 1.5 l-1.5 4.5 l-1.5 -4.5 l-4.5 -1.5z" fill="#ff5d9e"/>' +
       '<path d="M92 70 l1.2 -3.6 l1.2 3.6 l3.6 1.2 l-3.6 1.2 l-1.2 3.6 l-1.2 -3.6 l-3.6 -1.2z" fill="#3fb8ff"/>';
  // brazos arriba (celebración)
  if (mood === "cheer") s += `<path d="M31 84 L16 58" stroke="${ink}" stroke-width="9" stroke-linecap="round"/><path d="M31 84 L16 58" stroke="${jk}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M69 84 L84 58" stroke="${ink}" stroke-width="9" stroke-linecap="round"/><path d="M69 84 L84 58" stroke="${jk}" stroke-width="6" stroke-linecap="round"/>` +
    `<circle cx="15" cy="56" r="4.6" fill="#ffe0c4" stroke="${ink}" stroke-width="2"/><circle cx="85" cy="56" r="4.6" fill="#ffe0c4" stroke="${ink}" stroke-width="2"/>`;
  // mochila (tirantes por detrás)
  if (o.extra === "mochila") s += `<rect x="24" y="74" width="52" height="24" rx="8" fill="#ff8a3d" stroke="${ink}" stroke-width="2"/>`;
  // chaqueta
  s += `<path d="M25 99 q0 -23 25 -23 q25 0 25 23z" fill="${jk}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>` +
       `<path d="M42 77 l8 12 l8 -12 q-8 -3 -16 0z" fill="#ff8fc0" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>` +
       `<path d="M42 77 l-6 6 l6 6 l8 0z M58 77 l6 6 l-6 6 l-8 0z" fill="#fff" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>` +
       `<circle cx="40" cy="93" r="1.8" fill="${jkd === "#d99e00" ? "#fff" : "#ffc93c"}"/><circle cx="60" cy="93" r="1.8" fill="${jkd === "#d99e00" ? "#fff" : "#ffc93c"}"/>`;
  if (o.extra === "mochila") s += `<path d="M33 80 L37 98 M67 80 L63 98" stroke="${ink}" stroke-width="3.2"/><path d="M33 80 L37 98 M67 80 L63 98" stroke="#ffb27a" stroke-width="1.6"/>`;
  // melena
  s += `<path d="M50 19 C27 19 18 36 19 54 C20 66 14 74 18 84 C22 92 30 92 34 87 C30 82 36 76 36 70 L64 70 C64 76 70 82 66 87 C70 92 78 92 82 84 C86 74 80 66 81 54 C82 36 73 19 50 19Z" fill="${hc}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>` +
       `<path d="M25 50 q-4 16 0 28 M75 50 q4 16 0 28 M30 40 q-3 8 -2 16" fill="none" stroke="${hl}" stroke-width="2.6" stroke-linecap="round"/>`;
  // bufanda / medalla (sobre el cuello)
  if (o.extra === "bufanda") s += `<path d="M34 74 q16 8 32 0 l0 6 q-16 8 -32 0z" fill="#ff5d73" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M58 79 l3 14 l6 -2 l-3 -13z" fill="#ff5d73" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M40 77.5 v5 M46 79 v5 M52 79 v5" stroke="#fff" stroke-width="1.6"/>`;
  if (o.extra === "medalla") s += `<path d="M44 77 l6 13 l6 -13" fill="none" stroke="#3f8cff" stroke-width="3"/><circle cx="50" cy="91" r="5" fill="#ffc93c" stroke="${ink}" stroke-width="1.8"/><path d="M50 88.3 l.9 1.8 2 .3 -1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#fff"/>`;
  // cara y flequillo
  s += `<circle cx="50" cy="54" r="21" fill="#ffe0c4" stroke="${ink}" stroke-width="2.2"/>` +
       `<path d="M29 52 q0 -22 22 -22 q20 0 22 20 q-14 -10 -26 -6 q-10 3 -18 8z" fill="${hc}" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/>` +
       `<path d="M52 32 q10 2 16 10" fill="none" stroke="${hl}" stroke-width="2.2" stroke-linecap="round"/>`;
  // cejas
  if (mood === "think") s += `<path d="M37 47 q4 -1.5 8 0 M55 44 q4 -2.5 8 .5" fill="none" stroke="${hc}" stroke-width="2" stroke-linecap="round"/>`;
  else s += `<path d="M38 47.5 q4 -2.5 8 -.5 M54 47 q4 -2 8 .5" fill="none" stroke="${hc}" stroke-width="1.8" stroke-linecap="round"/>`;
  // ojos
  if (happyEyes) s += `<path d="M37.5 57 q4.5 -5.5 9 0 M53.5 57 q4.5 -5.5 9 0" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  else if (mood === "wink") s += `<circle cx="42" cy="56" r="3.8" fill="${ink}"/><circle cx="43.3" cy="54.7" r="1.3" fill="#fff"/><path d="M38.4 55 l-2.8 -1.2" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/><path d="M53.5 56.5 q4.5 -4 9 0" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
  else if (mood === "think") s += `<circle cx="42" cy="56" r="3.8" fill="${ink}"/><circle cx="58" cy="56" r="3.8" fill="${ink}"/><circle cx="43.6" cy="54.2" r="1.4" fill="#fff"/><circle cx="59.6" cy="54.2" r="1.4" fill="#fff"/>`;
  else s += `<circle cx="42" cy="56" r="3.8" fill="${ink}"/><circle cx="58" cy="56" r="3.8" fill="${ink}"/><circle cx="43.3" cy="54.7" r="1.3" fill="#fff"/><circle cx="59.3" cy="54.7" r="1.3" fill="#fff"/>` +
    `<path d="M38.4 55 l-2.8 -1.2 M61.6 55 l2.8 -1.2" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`;
  // mofletes
  s += `<circle cx="36" cy="63" r="${happyEyes ? 4.4 : 3.6}" fill="#ff9fb0" opacity=".85"/><circle cx="64" cy="63" r="${happyEyes ? 4.4 : 3.6}" fill="#ff9fb0" opacity=".85"/>`;
  // boca
  if (happyEyes) s += `<path d="M42 62.5 q8 11 16 0z" fill="#c2185b" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/><path d="M46 67 q4 -3 8 0 q-4 3 -8 0z" fill="#ff8fa8"/>`;
  else if (mood === "wink") s += `<path d="M43 64 q7 7 14 0" fill="#fff" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M51 67.5 q3 4 5 0" fill="#ff8fa8" stroke="${ink}" stroke-width="1.4"/>`;
  else if (mood === "think") s += `<path d="M45 66 q2.5 -2 5 0 q2.5 2 5 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
  else s += `<path d="M43 64 q7 7 14 0" fill="#fff" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  // pendientes
  const st = (x) => `<path d="M${x} 63 l1.2 2.6 l2.8 .3 l-2.1 1.9 l.6 2.8 l-2.5 -1.4 l-2.5 1.4 l.6 -2.8 l-2.1 -1.9 l2.8 -.3z" fill="#ffc93c" stroke="#e09b00" stroke-width=".8"/>`;
  s += st(29) + st(71);
  // cabeza
  const H = {
    gafas: `<path d="M33 29 c-3 -5 -11 -3 -9 3 c1 3 6 6 9 8 c3 -2 8 -5 9 -8 c2 -6 -6 -8 -9 -3z" fill="#ff5d9e" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M67 29 c-3 -5 -11 -3 -9 3 c1 3 6 6 9 8 c3 -2 8 -5 9 -8 c2 -6 -6 -8 -9 -3z" fill="#ff5d9e" stroke="${ink}" stroke-width="2" stroke-linejoin="round"/><path d="M42 31 q8 -4 16 0" fill="none" stroke="${ink}" stroke-width="2"/><path d="M28 30 l2 -2 M62 30 l2 -2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`,
    sombrero: `<path d="M18 30 q32 -14 64 0 l-5 6 q-27 -9 -54 0z" fill="#3fbf7f" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M30 28 q2 -19 20 -19 q18 0 20 19 q-20 -6 -40 0z" fill="#56d494" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 24 q18 -5 36 0" fill="none" stroke="#ffc93c" stroke-width="3"/>`,
    diadema: `<path d="M29 40 q21 -22 42 0" fill="none" stroke="#ff5d9e" stroke-width="4" stroke-linecap="round"/><path d="M58 27 l-8 -6 v12z M58 27 l8 -6 v12z" fill="#ff5d9e" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="58" cy="27" r="2.6" fill="#ffc93c" stroke="${ink}" stroke-width="1.4"/>`,
    boina: `<path d="M24 37 q-2 -16 26 -18 q30 0 28 14 q-26 -6 -54 4z" fill="#e0485e" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 19 v-5" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/><path d="M33 27 q10 -6 22 -6" fill="none" stroke="#ff8fa8" stroke-width="2" stroke-linecap="round"/>`,
    flores: `<path d="M27 38 q23 -20 46 0" fill="none" stroke="#22b573" stroke-width="3"/>` + [[29, 35, "#ff5d9e"], [37, 28, "#ffc93c"], [46, 24, "#3fb8ff"], [55, 24, "#ff8a3d"], [64, 28, "#ff5d9e"], [71, 35, "#b9a7ff"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4" fill="${c}" stroke="${ink}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join(""),
    gorra: `<path d="M27 36 q0 -19 23 -19 q23 0 23 19z" fill="#3f8cff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 36 q20 -2 32 4 q-6 3 -14 1 q-9 -2 -18 -5z" fill="#2563c9" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="50" cy="18" r="2.4" fill="#ffc93c" stroke="${ink}" stroke-width="1.4"/><path d="M40 28 l4 -4 3 4 3 -4 3 4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>`,
    corona: `<path d="M30 34 l-2 -18 l11 9 l11 -13 l11 13 l11 -9 l-2 18z" fill="#ffc93c" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="28" r="3" fill="#e0485e" stroke="${ink}" stroke-width="1.4"/><circle cx="38" cy="30" r="2.2" fill="#3fb8ff" stroke="${ink}" stroke-width="1.2"/><circle cx="62" cy="30" r="2.2" fill="#22b573" stroke="${ink}" stroke-width="1.2"/>`,
  };
  s += H[o.head] || H.gafas;
  return s;
}
const MOODS = ["normal", "happy", "wink", "think", "cheer"];
function renderAdela() {
  const defs = document.getElementById("adelaDefs");
  defs.innerHTML = MOODS.map(m => `<symbol id="adela-${m}" viewBox="0 0 100 100">${adelaSVG(m)}</symbol>`).join("") +
    `<symbol id="pipo" viewBox="0 0 100 100">${adelaSVG("normal")}</symbol>`;
}
let faceT = null;
function setFace(mood, ms) {
  const u = document.querySelector("#mascot use");
  if (!u) return;
  u.setAttribute("href", "#adela-" + mood);
  clearTimeout(faceT);
  if (mood !== "normal") faceT = setTimeout(() => u.setAttribute("href", "#adela-normal"), ms || 2200);
}
renderAdela();

const ic = n => '<svg class="ic" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
const rnd = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const name = id => P[id][0];
const cap = id => P[id][2];
const ALL = Object.keys(P);
const ZONES = [["all", "Toda España"], ["hard", "Las que más me cuestan"]].concat(
  [...new Set(ALL.map(id => P[id][3]))].filter(c => ALL.filter(id => P[id][3] === c).length > 1)
    .sort((a, b) => a.localeCompare(b, "es")).map(c => [c, c])).concat([["uni", "Comunidades de una sola provincia"]]);

// ---------- Mensajes de ánimo ----------
const MSG = {
  ok: ["¡Muy bien, {n}!", "¡Genial, {n}! 🎉", "¡Eso es!", "¡Perfecto!", "¡Lo sabías, {n}!", "¡Qué crack eres!", "¡Bravo! 👏", "¡Toma ya!",
       "¡Fenomenal!", "¡Eres un explorador de primera!", "¡Correcto, {n}!", "¡Súper!", "¡Así se hace!", "¡De diez! 🌟"],
  ok2: ["¡Bien, {n}! A la segunda también vale 💪", "¡Ahí está! Lo has encontrado", "¡Muy bien! No te has rendido", "¡Eso es! Intentarlo otra vez funciona"],
  ok3: ["¡Ya la tienes! Esta la repasamos luego", "¡Bien! Ahora ya sabes dónde está", "¡Conseguido! Poco a poco se aprende"],
  bad: ["¡Casi, {n}! Prueba otra vez", "Uy, esa no es. ¡Tú puedes!", "No pasa nada, {n}. ¡Otra vez!", "¡Inténtalo de nuevo, que estás cerca!", "Esa no… ¡pero no te rindas!"],
  hint: ["Te doy una pista, {n} 👀", "¡Pista para ti, {n}! 👀", "¡Te ayudo, {n}!"],
  streak: { 3: "¡3 seguidas, {n}! 🔥", 5: "¡5 seguidas! ¡Estás que te sales! 🔥🔥", 8: "¡8 seguidas! ¡Imparable, {n}! 🚀", 12: "¡12 seguidas! ¡Eres una máquina! 🏆", 20: "¡20 seguidas! ¡Leyenda total! 👑" },
  half: "¡Ya vas por la mitad, {n}! Sigue así 💪",
  last: "¡La última! ¡A por ella, {n}!",
};
const fmtMsg = s => s.replace(/\{n\}/g, KID);

// ---------- Sonido sintetizado ----------
const Sound = {
  on: store.get("gabi:sound") !== false, ctx: null,
  tone(f, t0, d, type = "sine", v = .18) {
    if (!this.on) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      // En iPad/iPhone el sonido se "duerme" al salir de la app o bloquear la pantalla: lo despertamos
      if (this.ctx.state !== "running") this.ctx.resume();
      const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + .05);
    } catch (e) {}
  },
  ok() { [523, 659, 784].forEach((f, i) => this.tone(f, i * .08, .25, "triangle")); },
  great() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * .09, .3, "triangle")); this.tone(1568, .4, .4, "sine", .1); },
  bad() { this.tone(220, 0, .25, "square", .06); this.tone(196, .12, .3, "square", .06); },
  tap() { this.tone(880, 0, .08, "sine", .08); },
  win() { [523, 587, 659, 784, 880, 1047].forEach((f, i) => this.tone(f, i * .12, .35, "triangle")); },
};

// ---------- Mapa ----------
const svg = d3.select("#map");
const W = 960, H = 600;
const features = topojson.feature(TOPO, TOPO.objects.provinces).features;
const gameFeatures = features.filter(f => P[f.id]);
let projection, composite = false;
try { projection = d3.geoConicConformalSpain().fitExtent([[10, 10], [W - 10, H - 10]], { type: "FeatureCollection", features: gameFeatures }); composite = true; }
catch (e) { projection = d3.geoMercator().fitExtent([[10, 10], [W - 10, H - 10]], { type: "FeatureCollection", features: gameFeatures }); }
const path = d3.geoPath(projection);
const projVec = composite ? d3.geoConicConformal().rotate([5, -38.6]).parallels([0, 60]).scale(projection.scale()).translate(projection.translate()) : projection;
const CAN = ["35", "38"];
const geomsMain = TOPO.objects.provinces.geometries.filter(g => !CAN.includes(g.id));
const geomsCan = TOPO.objects.provinces.geometries.filter(g => CAN.includes(g.id));
const exterior = geoms => topojson.mesh(TOPO, { type: "GeometryCollection", geometries: geoms }, (a, b) => a === b);

svg.append("defs").html(
  '<pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)"><rect width="6" height="6" fill="#ffd0d8"/><line x1="1.5" y1="0" x2="1.5" y2="6" stroke="#e0485e" stroke-width="2"/></pattern>' +
  '<pattern id="dots" patternUnits="userSpaceOnUse" width="6" height="6"><rect width="6" height="6" fill="#ffe3a3"/><circle cx="3" cy="3" r="1.3" fill="#f0a500"/></pattern>');
const gZoom = svg.append("g");
gZoom.append("path").attr("class", "coast").attr("d", path(exterior(geomsMain)));
const gVec = gZoom.append("g");
gVec.selectAll("path").data(VECINOS.features).join("path").attr("class", "vecino").attr("d", d3.geoPath(projVec));
let insetBox = null;
const canEls = []; // todo lo que se mueve con Canarias cuando la pantalla está en vertical
if (composite) {
  const k = projection.scale(), [tx, ty] = projection.translate();
  insetBox = [tx - 0.1331 * k, ty + 0.053457 * k, (0.1331 - 0.0354) * k, (0.08969 - 0.053457) * k];
  canEls.push(gVec.append("rect").attr("class", "insetbg").attr("fill", "var(--sea)").attr("x", insetBox[0]).attr("y", insetBox[1]).attr("width", insetBox[2]).attr("height", insetBox[3]).node());
  canEls.push(gZoom.append("rect").attr("class", "inset").attr("rx", 10).attr("x", insetBox[0]).attr("y", insetBox[1]).attr("width", insetBox[2]).attr("height", insetBox[3]).node());
  canEls.push(gZoom.append("text").attr("class", "insetlbl").attr("x", insetBox[0] + 10).attr("y", insetBox[1] + 20).style("font-size", "14px").text("Islas Canarias").node());
}
gZoom.append("path").attr("class", "landshadow").attr("transform", "translate(1.5,2.5)").attr("d", path(topojson.merge(TOPO, geomsMain)));
canEls.push(gZoom.append("path").attr("class", "coast").attr("d", path(exterior(geomsCan))).node());
canEls.push(gZoom.append("path").attr("class", "landshadow").attr("d", path(topojson.merge(TOPO, geomsCan))).node());
const gPais = gZoom.append("g");
[["Portugal", [-7.75, 40.6]], ["Francia", [0.4, 43.65]], ["Marruecos", [-4.6, 34.95]], ["Argelia", [-0.4, 35.0]]].forEach(([t, ll]) => {
  const p = projVec(ll); if (p) gPais.append("text").attr("class", "pais").attr("x", p[0]).attr("y", p[1]).style("font-size", "13px").text(t);
});
const gLand = gZoom.append("g");
const provPaths = gLand.selectAll("path").data(features).join("path")
  .attr("class", f => "prov" + (P[f.id] ? "" : " nogame")).attr("data-id", f => f.id).attr("d", path);
const byId = {}; provPaths.each(function (f) { byId[f.id] = this; });
// Fronteras entre comunidades autónomas, más marcadas
const ccaaOf = id => P[id] ? P[id][3] : "x" + id;
const ccaaMain = gZoom.append("path").attr("class", "ccaa").attr("d", path(topojson.mesh(TOPO, { type: "GeometryCollection", geometries: geomsMain }, (a, b) => a !== b && ccaaOf(a.id) !== ccaaOf(b.id))));
canEls.push(gZoom.append("path").attr("class", "ccaa").attr("d", path(topojson.mesh(TOPO, { type: "GeometryCollection", geometries: geomsCan }, (a, b) => a !== b && ccaaOf(a.id) !== ccaaOf(b.id)))).node());
canEls.push(byId["35"], byId["38"]);
const featById = {}; features.forEach(f => featById[f.id] = f);
// Ceuta y Melilla: un punto visible y una zona táctil grande
const CM = features.filter(f => f.id === "51" || f.id === "52");
const cmDots = gZoom.append("g").selectAll("circle").data(CM).join("circle").attr("class", "prov cmdot").attr("data-id", f => f.id)
  .attr("cx", f => path.centroid(f)[0]).attr("cy", f => path.centroid(f)[1]).attr("r", 6).style("pointer-events", "none");
const cmHit = gZoom.append("g").selectAll("circle").data(CM).join("circle").attr("class", "cmhit").attr("data-id", f => f.id)
  .attr("cx", f => path.centroid(f)[0]).attr("cy", f => path.centroid(f)[1]).attr("r", 20);
const dotById = {}; cmDots.each(function (f) { dotById[f.id] = this; });
const hitById = {}; cmHit.each(function (f) { hitById[f.id] = this; });
const gFx = gZoom.append("g"), gDone = gZoom.append("g"), gLbl = gZoom.append("g");

// Colorea cada comunidad con un color distinto de sus vecinas
(function () {
  const geoms = TOPO.objects.provinces.geometries, vec = topojson.neighbors(geoms), adj = {};
  geoms.forEach((g, i) => {
    if (!P[g.id]) return; const a = P[g.id][3]; adj[a] = adj[a] || new Set();
    vec[i].forEach(j => { const h = geoms[j]; if (P[h.id] && P[h.id][3] !== a) adj[a].add(P[h.id][3]); });
  });
  const color = {};
  Object.keys(adj).sort((a, b) => adj[b].size - adj[a].size).forEach(a => {
    const used = new Set([...adj[a]].map(b => color[b])); let c = 0; while (used.has(c)) c++; color[a] = c % 6;
  });
  ALL.forEach(id => { const c = color[P[id][3]] ?? 0; if (byId[id]) byId[id].setAttribute("data-c", c); if (dotById[id]) dotById[id].setAttribute("data-c", c); });
})();

function cls(id, c, on = true) { if (byId[id]) byId[id].classList.toggle(c, on); if (dotById[id]) dotById[id].classList.toggle(c, on); }
function mainGeom(id) {
  const f = featById[id];
  if (f.geometry.type !== "MultiPolygon" || id === "07") return f;
  let best = null, area = -1;
  f.geometry.coordinates.forEach(poly => { const g = { type: "Polygon", coordinates: poly }; const a = path.area(g); if (a > area) { area = a; best = g; } });
  return best;
}
// Canarias: en pantallas verticales su recuadro baja bajo la península y crece para llenar el hueco
let canT = [1, 0, 0];
const tCan = p => [p[0] * canT[0] + canT[1], p[1] * canT[0] + canT[2]];
const isCan = id => CAN.includes(id);
function centroidOf(id) {
  const f = featById[id];
  let c;
  if (f.geometry.type !== "MultiPolygon" || id === "07") c = path.centroid(f);
  else {
    let best = null, area = -1;
    f.geometry.coordinates.forEach(poly => { const g = { type: "Polygon", coordinates: poly }; const a = path.area(g); if (a > area) { area = a; best = g; } });
    c = path.centroid(best);
  }
  return isCan(id) ? tCan(c) : c;
}
function bOf(id, geom) { const b = path.bounds(geom || featById[id]); return isCan(id) ? [tCan(b[0]), tCan(b[1])] : b; }
// Provincias vecinas (para las pistas)
const NEIGH = (() => {
  const geoms = TOPO.objects.provinces.geometries, vec = topojson.neighbors(geoms), out = {};
  geoms.forEach((g, i) => { out[g.id] = vec[i].map(j => geoms[j].id).filter(id => P[id]); });
  return out;
})();
function whereIn(id, ids) {
  const c = centroidOf(id), cs = ids.map(centroidOf);
  const mx = d3.mean(cs, p => p[0]), my = d3.mean(cs, p => p[1]);
  const w = d3.max(cs, p => p[0]) - d3.min(cs, p => p[0]) || 1, h = d3.max(cs, p => p[1]) - d3.min(cs, p => p[1]) || 1;
  const dx = (c[0] - mx) / w, dy = (c[1] - my) / h;
  const ns = dy < -.15 ? "norte" : dy > .15 ? "sur" : "", eo = dx > .15 ? "este" : dx < -.15 ? "oeste" : "";
  if (!ns && !eo) return "por el centro";
  if (ns && eo) return "al " + (ns === "norte" ? "nor" : "sur") + eo; // noreste, noroeste, sureste, suroeste
  return "al " + (ns || eo);
}
function boundsOf(ids, padK) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  ids.forEach(id => { const b = bOf(id); x0 = Math.min(x0, b[0][0]); y0 = Math.min(y0, b[0][1]); x1 = Math.max(x1, b[1][0]); y1 = Math.max(y1, b[1][1]); });
  const pad = Math.max(x1 - x0, y1 - y0) * padK;
  return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad];
}
const HOME_SIDE = boundsOf(ALL, 0.03);
let HOME = HOME_SIDE.slice(), canMode = "side", canKey = "side1.00";
let vb = HOME.slice();
function setCanaryLayout() {
  const card = document.querySelector(".mapcard");
  const portrait = composite && insetBox && matchMedia("(max-width: 880px)").matches && card.clientWidth / Math.max(1, card.clientHeight) < 1.15;
  const mode = portrait ? "below" : "side";
  let s = 1, dx = 0, dy = 0;
  if (mode === "below") {
    const mb = boundsOf(ALL.filter(id => !isCan(id)), 0), gap = mb[3] * .05, A = card.clientWidth / Math.max(1, card.clientHeight);
    const fill = (mb[2] / (A * .98) - mb[3] - gap) / insetBox[3];
    s = Math.max(1, Math.min(mb[2] / insetBox[2], fill));
    dx = mb[0] + (mb[2] - insetBox[2] * s) / 2 - insetBox[0] * s;
    dy = mb[1] + mb[3] + gap - insetBox[1] * s;
  }
  const key = mode + s.toFixed(2);
  if (key === canKey) return false;
  canKey = key;
  canMode = mode; canT = [s, dx, dy];
  // Con Canarias debajo, los rótulos de África quedarían tapados
  gPais.selectAll("text").attr("display", function () { return mode === "below" && /Marruecos|Argelia/.test(this.textContent) ? "none" : null; });
  const tr = mode === "below" ? "translate(" + dx + "," + dy + ") scale(" + s + ")" : null;
  canEls.forEach(el => { if (!el) return; tr ? el.setAttribute("transform", tr) : el.removeAttribute("transform"); });
  const sh = canEls.find(el => el && el.classList.contains("landshadow"));
  if (sh) sh.setAttribute("transform", (tr ? tr + " " : "") + "translate(1.5,2.5)");
  if (mode === "below") {
    const ib = [tCan([insetBox[0], insetBox[1]]), tCan([insetBox[0] + insetBox[2], insetBox[1] + insetBox[3]])];
    const b = boundsOf(ALL, 0);
    const x0 = Math.min(b[0], ib[0][0]), y0 = Math.min(b[1], ib[0][1]), x1 = Math.max(b[0] + b[2], ib[1][0]), y1 = Math.max(b[1] + b[3], ib[1][1]);
    const pad = (x1 - x0) * .02;
    HOME = [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad];
  } else HOME = HOME_SIDE.slice();
  if (typeof placeExplore === "function") placeExplore();
  // Los nombres fijos de Canarias se recolocan
  gDone.selectAll("text").each(function () { const id = this.getAttribute("data-id"); if (isCan(id)) { const c = centroidOf(id); this.setAttribute("x", c[0]); this.setAttribute("y", c[1]); } });
  return true;
}
svg.attr("viewBox", vb.join(" "));
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// Zoom con dos dedos, rueda (Ctrl) y botones
let curK = 1;
const zoom = d3.zoom().scaleExtent([1, 8]).clickDistance(8)
  .extent(() => [[vb[0], vb[1]], [vb[0] + vb[2], vb[1] + vb[3]]])
  .filter(e => e.type === "wheel" ? (e.ctrlKey || e.metaKey) : (e.type === "touchstart" ? (e.touches.length > 1 || curK > 1.01) : !e.button))
  .on("zoom", e => { gZoom.attr("transform", e.transform); curK = e.transform.k; sizeText(); });
svg.call(zoom).on("dblclick.zoom", null);
$("#zin").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1.6);
$("#zout").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6);
const homeView = () => S.zone === "all" || !S.pool || !S.pool.length ? null : S.pool;
$("#zhome").onclick = () => { S.zoomed = false; zoomTo(homeView()); };
function zoomTo(ids, instant) {
  const target = ids ? boundsOf(ids, 0.12) : HOME;
  const from = vb.join(" "), to = target.join(" ");
  vb = target;
  zoom.translateExtent([[target[0], target[1]], [target[0] + target[2], target[1] + target[3]]]);
  svg.call(zoom.transform, d3.zoomIdentity);
  svg.transition("vb").duration(reduceMotion() || instant ? 0 : 700).attrTween("viewBox", () => d3.interpolateString(from, to)).on("end", sizeText);
  sizeText(target);
}
function fs(base, box) { const b = box || vb; return b[2] / HOME[2] * base / curK; }
function sizeText(box) {
  gLbl.selectAll("text").style("font-size", fs(17, box) + "px");
  gDone.selectAll("text").each(function () { this.style.fontSize = fs(+this.getAttribute("data-r") || 14, box) + "px"; });
  const r = fs(1, box);
  cmDots.attr("r", 6 * r); cmHit.attr("r", 20 * r);
  if (typeof placeExplore === "function" && document.body.dataset.mode === "explore") { placeExplore(); renderTripPinsOnMap(); }
}
function label(id, text, kind, ms) {
  const c = centroidOf(id);
  const t = gLbl.append("text").attr("class", "lbl " + (kind || "")).attr("x", c[0]).attr("y", c[1]).style("font-size", fs(17) + "px").text(text);
  if (ms) setTimeout(() => t.remove(), ms);
  return t;
}
function ring(id) {
  const c = centroidOf(id), b = bOf(id);
  const r = Math.max(14 * fs(1), Math.min(60, Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) * .6));
  gFx.append("circle").attr("class", "ring").attr("cx", c[0]).attr("cy", c[1]).attr("r", r);
}
function clearMarks() {
  ["done", "done2", "target", "flash-bad", "flash-ok", "reveal", "sel", "off", "hint", "r-ok", "r-meh", "r-bad"].forEach(c => provPaths.classed(c, false));
  cmDots.classed("done done2 target flash-bad flash-ok reveal sel off hint r-ok r-meh r-bad", false); $("#legend").hidden = true; cmHit.classed("off", false);
  gFx.selectAll("*").remove(); gLbl.selectAll("*").remove(); gDone.selectAll("*").remove();
}

// ---------- Transiciones entre pantallas ----------
function showScreen(el) {
  if (!el.hidden && !el.classList.contains("leaving")) return;
  el.classList.remove("leaving"); el.hidden = false;
  el.classList.remove("entering"); void el.offsetWidth; el.classList.add("entering");
}
function hideScreen(el) {
  if (el.hidden) return;
  if (reduceMotion()) { el.hidden = true; return; }
  el.classList.add("leaving");
  setTimeout(() => { if (el.classList.contains("leaving")) { el.hidden = true; el.classList.remove("leaving"); } }, 230);
}
function gameIn() {
  document.querySelectorAll(".mapcard, .panel > .card").forEach((el, i) => { el.style.setProperty("--d", i * 70 + "ms"); el.classList.remove("slidein"); void el.offsetWidth; el.classList.add("slidein"); });
}

// ---------- Mascota y bocadillo ----------
let bubbleT = null;
function say(text, kind, mood) {
  const b = $("#bubble");
  b.textContent = fmtMsg(text); b.className = "bubble " + (kind || "");
  void b.offsetWidth; b.classList.add("pop");
  const m = $("#mascot"); m.classList.remove("jump", "sad"); void m.getBoundingClientRect();
  if (mood) m.classList.add(mood);
  // La cara acompaña al mensaje: feliz al acertar, guiño en racha, pensativa al fallar
  if (kind === "ok") setFace(S.streak >= 3 ? "wink" : "happy");
  else if (kind === "bad") setFace("think");
  else if (kind === "cheer") setFace("cheer", 4000);
}

// ---------- Mensajes sobre el mapa y efectos ----------
let toastT = null;
function toast(id, html, kind, ms) {
  const box = $("#toasts"), card = document.querySelector(".mapcard").getBoundingClientRect();
  box.innerHTML = "";
  const [sx, sy] = screenPt(id);
  const t = document.createElement("div"); t.className = "toast " + (kind || ""); t.innerHTML = html;
  box.appendChild(t);
  let x = sx - card.left, y = sy - card.top;
  const w = t.offsetWidth, h = t.offsetHeight;
  x = Math.max(w / 2 + 8, Math.min(card.width - w / 2 - 8, x));
  if (y - h - 14 < 6) t.classList.add("top");
  t.style.left = x + "px"; t.style.top = y + "px";
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, ms || 1400);
}
function ripple(id) {
  const c = centroidOf(id), b = bOf(id), r = Math.max(10 * fs(1), Math.min(36 * fs(1), Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) * .5));
  const el = gFx.append("circle").attr("class", "ripple").attr("cx", c[0]).attr("cy", c[1]).attr("r", r);
  setTimeout(() => el.remove(), 900);
}
function shake(el) { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }

// ---------- Confeti ----------
const cv = $("#confetti"), cx = cv.getContext("2d");
let parts = [], raf = null;
function confetti(n = 60, fromX, fromY) {
  // Siempre se ve, aunque el equipo tenga las animaciones reducidas: es la recompensa del juego
  cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
  const cols = ["#ff8a3d", "#ffc93c", "#7b5cff", "#22b573", "#ff5d73", "#3fb8ff"];
  const x0 = (fromX ?? innerWidth / 2) * devicePixelRatio, y0 = (fromY ?? innerHeight / 3) * devicePixelRatio;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = (4 + Math.random() * 8) * devicePixelRatio;
    parts.push({ x: x0, y: y0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6 * devicePixelRatio, r: (4 + Math.random() * 5) * devicePixelRatio,
      c: rnd(cols), rot: Math.random() * 6, vr: Math.random() * .4 - .2, life: 90 + Math.random() * 40, star: Math.random() < .25 });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => {
    p.vy += .35 * devicePixelRatio; p.vx *= .98; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 30); cx.fillStyle = p.c;
    if (p.star) { cx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? p.r * .45 : p.r; cx.lineTo(Math.cos(i * Math.PI / 5) * r, Math.sin(i * Math.PI / 5) * r); } cx.fill(); }
    else cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
    cx.restore();
  });
  raf = parts.length ? requestAnimationFrame(tick) : (cx.clearRect(0, 0, cv.width, cv.height), null);
}

// ---------- Estado ----------
const S = { mode: store.get("gabi:mode") || "find", zone: store.get("gabi:zone") || "all", len: store.get("gabi:len") || "10",
  pool: [], queue: [], total: 0, done: 0, cur: null, miss: 0, stars: 0, streak: 0, best: 0, first: 0, results: {}, locked: false, opts: [] };
const DATO = {"01": "Su capital, Vitoria-Gasteiz, es también la capital del País Vasco.", "02": "Es famosa desde hace siglos por sus navajas y cuchillos.", "03": "Frente a su costa está Tabarca, la única isla habitada de la Comunitat Valenciana.", "04": "Tiene el desierto de Tabernas, donde se han rodado muchas películas del Oeste.", "05": "Su muralla medieval rodea toda la ciudad antigua y es una de las mejor conservadas del mundo.", "06": "Es la provincia más grande de España.", "07": "Está formada por islas: Mallorca, Menorca, Ibiza y Formentera son las más grandes.", "08": "Allí está la Sagrada Familia, el templo de Gaudí que lleva más de 140 años construyéndose.", "09": "En la sierra de Atapuerca se han encontrado algunos de los restos humanos más antiguos de Europa.", "10": "Tiene el Parque Nacional de Monfragüe, famoso por sus buitres, águilas y cigüeñas negras.", "11": "Su capital es una de las ciudades más antiguas de Europa occidental: la fundaron los fenicios hace unos 3.000 años.", "12": "Frente a su costa están las islas Columbretes, que son restos de antiguos volcanes.", "13": "Es tierra de Don Quijote: en Campo de Criptana están sus famosos molinos de viento.", "14": "Tiene la Mezquita-Catedral, con un bosque de cientos de columnas y arcos rojos y blancos.", "15": "Tiene la Torre de Hércules, el faro romano más antiguo del mundo que sigue funcionando.", "16": "Sus Casas Colgadas parecen flotar sobre un precipicio.", "17": "En el cabo de Creus está el punto más al este de la península ibérica.", "18": "Tiene la Alhambra y el Mulhacén, el pico más alto de la península ibérica.", "19": "Tiene pueblos de arquitectura negra, con casas hechas de pizarra oscura.", "20": "Es la provincia más pequeña de España.", "21": "Desde el puerto de Palos salió Cristóbal Colón en 1492 rumbo a América.", "22": "Tiene el Aneto, el pico más alto de los Pirineos.", "23": "Tiene tantísimos olivos que es uno de los lugares del mundo donde más aceite de oliva se produce.", "24": "Su catedral es famosa por sus enormes vidrieras de colores.", "25": "Tiene el Parque Nacional de Aigüestortes, el único parque nacional de Cataluña.", "26": "En San Millán de la Cogolla se escribieron algunas de las primeras palabras en español que se conocen.", "27": "Su muralla romana es la única del mundo que se conserva entera.", "28": "En la Puerta del Sol está el kilómetro cero, desde donde se miden las carreteras de España.", "29": "Allí nació el famoso pintor Pablo Picasso.", "30": "Tiene el Mar Menor, una gran laguna de agua salada junto al Mediterráneo.", "31": "En Pamplona se celebran los Sanfermines cada mes de julio.", "32": "Es famosa por sus aguas termales: hay fuentes de agua caliente en plena ciudad.", "33": "Tiene parte de los Picos de Europa y es famosa por la sidra.", "34": "Por ella pasa el Canal de Castilla, por el que antes navegaban barcas cargadas de trigo.", "35": "Incluye Gran Canaria, Lanzarote y Fuerteventura; en Lanzarote hay paisajes volcánicos que parecen de otro planeta.", "36": "Frente a su costa están las islas Cíes, con playas de arena blanca.", "37": "Tiene una de las universidades más antiguas de Europa, y en su fachada se esconde una rana que todo el mundo intenta encontrar.", "38": "En Tenerife está el Teide, el pico más alto de España.", "39": "En la cueva de Altamira hay pinturas de bisontes hechas hace miles de años.", "40": "Tiene un acueducto romano construido sin cemento: sus piedras se sujetan solas.", "41": "Es la capital de Andalucía y tiene la Giralda, la torre de su catedral.", "42": "En sus Picos de Urbión nace el río Duero.", "43": "Tiene un anfiteatro romano junto al mar y el delta del Ebro, lleno de arrozales y aves.", "44": "Es famosa por los Amantes de Teruel y tiene Dinópolis, un parque de dinosaurios.", "45": "La llaman «la ciudad de las tres culturas» porque allí convivieron cristianos, musulmanes y judíos.", "46": "Es la tierra de la paella y de las Fallas, que se queman cada mes de marzo.", "47": "Su capital fue capital de España durante unos años, a principios del siglo XVII.", "48": "Tiene el Museo Guggenheim de Bilbao, forrado de titanio, y el Puente de Bizkaia, el puente transbordador más antiguo del mundo.", "49": "Su capital es conocida como «la ciudad del románico» por sus muchas iglesias antiguas.", "50": "Tiene la basílica del Pilar, a orillas del Ebro, el río más caudaloso de España.", "51": "Está en el norte de África, frente al estrecho de Gibraltar.", "52": "Está en el norte de África y tiene muchísimos edificios modernistas."};
const MODE_TXT = { find: "¿Dónde está?", name: "¿Cuál es?", cap: "Capitales", ccaa: "Comunidades", time: "Contrarreloj", explore: "Explorar" };
// Comunidades de una sola provincia (más Ceuta y Melilla): juntas forman una zona propia
const UNI = ALL.filter(id => ALL.filter(x => P[x][3] === P[id][3]).length === 1);
// "Las que más me cuestan": se recuerdan los fallos de todas las partidas, por juego
const statKey = m => "gabi:stats:" + (m === "time" || m === "explore" ? "find" : m);
const getStats = m => store.get(statKey(m)) || {};
function bumpStat(id, miss) {
  const st = getStats(S.mode), v = st[id] || 0;
  st[id] = miss > 0 ? Math.min(6, v + Math.min(miss, 3)) : Math.max(0, v - 1);
  store.set(statKey(S.mode), st);
}
const hardList = m => { const st = getStats(m); return Object.keys(st).filter(id => st[id] > 0 && P[id]).sort((a, b) => st[b] - st[a]).slice(0, 12); };
const poolFor = z => z === "all" ? ALL.slice() : z === "uni" ? UNI.slice() : z === "hard" ? hardList(S.mode) : ALL.filter(id => P[id][3] === z);
const zoneTag = z => z === "all" ? "Toda España" : z === "uni" ? "Comunidades de una provincia" : z === "hard" ? "Las que más te cuestan" : z;

function setupMap() {
  clearMarks();
  S.pool = poolFor(S.zone);
  ALL.forEach(id => { const on = S.pool.includes(id); cls(id, "off", !on); if (hitById[id]) hitById[id].classList.toggle("off", !on); });
  $("#maptag").textContent = zoneTag(S.zone);
  gPais.attr("display", S.zone === "all" ? null : "none"); // con zoom, los rótulos de países se verían enormes
  zoomTo(S.zone === "all" ? null : S.pool);
}

function startGame(only) {
  clearInterval(S.timer); S.timer = null;
  hideScreen($("#home")); hideScreen($("#end")); $("#legend").hidden = true;
  setCanaryLayout(); gameIn(); gTrips.selectAll("*").remove();
  setupMap();
  document.body.dataset.mode = S.mode;
  const explore = S.mode === "explore", timed = S.mode === "time";
  S.timed = timed;
  $("#qcard").hidden = explore; $("#infocard").hidden = !explore; $("#prog").hidden = explore; $("#helpBtn").hidden = explore;
  $("#starbox").hidden = explore; $("#fact").hidden = true; $("#ifact").hidden = true;
  $("#timer").hidden = !timed; $("#tries").hidden = timed;
  $("#helpBtn").innerHTML = timed ? ic("skip") + "<span>Pasar</span>" : ic("bulb") + "<span>Pista</span>";
  if (explore) {
    $("#opts").hidden = true; setTimeout(() => { placeExplore(); renderTripPinsOnMap(); }, 50);
    say("¡Toca cualquier provincia, " + KID + ", y te cuento cómo se llama!");
    $("#iname").textContent = "—"; $("#icap").textContent = "—"; $("#iccaa").textContent = "—";
    return;
  }
  if (timed) {
    Object.assign(S, { queue: shuffle(S.pool.slice()), total: 0, done: 0, stars: 0, streak: 0, best: 0, first: 0, results: {}, review: false, found: 0 });
    $("#starN").textContent = "0";
    say("¡Tienes un minuto, " + KID + "! ¿Cuántas encuentras? ¡Ya! ⏱️", "", "jump");
    S.deadline = Date.now() + 60000;
    const tick = () => {
      const left = Math.max(0, S.deadline - Date.now());
      $("#timer").textContent = Math.ceil(left / 1000);
      $("#timer").classList.toggle("low", left < 10000);
      $("#barfill").style.width = (left / 600) + "%";
      if (left <= 0) { clearInterval(S.timer); S.timer = null; finishTimed(); }
    };
    S.timer = setInterval(tick, 100); tick();
    updateProg(); next();
    return;
  }
  let q = shuffle(only ? only.slice() : S.pool.slice());
  if (!only && S.len !== "all" && S.zone !== "hard") q = q.slice(0, +S.len);
  Object.assign(S, { queue: q, total: q.length, done: 0, stars: 0, streak: 0, best: 0, first: 0, results: {}, review: !!only, score: 0 });
  $("#starN").textContent = "0";
  say(only ? "¡Vamos a repasar, " + KID + "! Seguro que ahora te salen 💪" : rnd(["¡Allá vamos, " + KID + "! 🚀", "¡A jugar, " + KID + "! Yo te ayudo", "¡Prepárate, " + KID + "! Empezamos"]), "", "jump");
  updateProg();
  next();
}

function next() {
  gFx.selectAll("*").remove();
  ALL.forEach(id => { cls(id, "target", false); cls(id, "hint", false); });
  if (!S.queue.length) {
    if (!S.timed) return finish();
    S.queue = shuffle(S.pool.filter(x => x !== S.cur));
    if (!S.queue.length) S.queue = S.pool.slice();
  }
  if (S.zoomed) { S.zoomed = false; zoomTo(null); }
  S.cur = S.queue.shift(); S.miss = 0; S.locked = false;
  renderTries();
  const id = S.cur, q = $("#qname");
  q.classList.remove("swap"); void q.offsetWidth; q.classList.add("swap");
  $("#hearBtn").hidden = !Voice.can() || S.mode === "name" || S.mode === "ccaa";
  if (S.mode === "find" || S.mode === "time") {
    $("#qlabel").textContent = "¿Dónde está…?";
    q.textContent = name(id);
    $("#qsub").textContent = P[id][1] ? "También se llama " + P[id][1] : "";
    $("#opts").hidden = true;
  } else {
    cls(id, "target"); ring(id);
    if (S.mode === "name") {
      $("#qlabel").textContent = "¿Cómo se llama la provincia que brilla?";
      q.textContent = "❓";
      $("#qsub").textContent = "";
      buildOpts(id, x => name(x));
    } else if (S.mode === "ccaa") {
      $("#qlabel").textContent = "¿En qué comunidad está…";
      q.textContent = name(id) + "?";
      $("#qsub").textContent = "";
      buildOpts(id, x => P[x][3]);
    } else {
      $("#qlabel").textContent = "¿Cuál es la capital de…";
      q.textContent = name(id) + "?";
      $("#qsub").textContent = "";
      buildOpts(id, x => cap(x));
    }
  }
  if (!S.timed && S.queue.length === 0 && S.total > 3) setTimeout(() => !S.locked && say(MSG.last), 900);
}

function buildOpts(id, txt) {
  // Distractores con sentido (vecinas o de la misma comunidad) y sin textos repetidos
  const seen = new Set([txt(id)]), pick = [];
  const add = x => { const t = txt(x); if (pick.length < 2 && x !== id && !seen.has(t)) { seen.add(t); pick.push(x); } };
  const nb = NEIGH[id] || [];
  const near = S.mode === "ccaa" ? [...new Set(nb.concat(nb.flatMap(n => NEIGH[n] || [])))] : ALL.filter(x => P[x][3] === P[id][3]);
  shuffle(near.slice()).forEach(add);
  shuffle(ALL.slice()).forEach(add);
  const ids = shuffle([id, ...pick]);
  const box = $("#opts"); box.innerHTML = ""; box.hidden = false;
  ids.forEach(x => {
    const b = document.createElement("button"); b.className = "opt"; b.textContent = txt(x); b.dataset.id = x;
    b.onclick = () => answer(x, b);
    box.appendChild(b);
  });
}

function renderTries() {
  const left = 3 - Math.min(S.miss, 3);
  $$("#tries svg").forEach((s, i) => s.classList.toggle("lost", i >= left));
}
function updateProg() {
  if (S.timed) { $("#count").textContent = "Encontradas: " + S.found; $("#streak").innerHTML = ic("flame") + "<i>" + S.streak + "</i>"; $("#pts").textContent = ""; return; }
  $("#count").textContent = (S.review ? "Repaso: " : "") + S.done + " de " + S.total;
  $("#barfill").style.width = (S.total ? S.done / S.total * 100 : 0) + "%";
  $("#streak").innerHTML = ic("flame") + "<i>" + S.streak + "</i>";
  $("#pts").textContent = (S.score || 0) + " puntos";
}
function addStars(n) {
  if (!n) return;
  S.stars += n; $("#starN").textContent = S.stars;
  const s = $("#starbox"); s.classList.remove("pop"); void s.offsetWidth; s.classList.add("pop");
}
function screenPt(id) {
  const c = centroidOf(id), m = gZoom.node().getScreenCTM();
  if (!m) return [innerWidth / 2, innerHeight / 3];
  const p = svg.node().createSVGPoint(); p.x = c[0]; p.y = c[1]; const r = p.matrixTransform(m); return [r.x, r.y];
}

function answer(id, btn) {
  if (S.locked || !S.cur) return;
  if (S.timed) return answerTimed(id);
  const target = S.cur;
  if (id === target) {
    S.locked = true;
    const earned = Math.max(0, 3 - S.miss);
    // 3 estrellas a la primera, 2 a la segunda, 1 a la tercera, 0 si hubo que enseñarla
    S.results[target] = earned; addStars(earned);
    bumpStat(target, S.miss);
    showFact(target);
    Voice.say(S.mode === "cap" ? "La capital de " + name(target) + " es " + cap(target) : S.mode === "ccaa" ? name(target) + " está en " + P[target][3] : name(target));
    if (S.miss === 0) { S.first++; S.streak++; S.best = Math.max(S.best, S.streak); } else S.streak = 0;
    // Puntos: más cuanto antes acierte, y un extra por racha
    const pts = [0, 20, 50, 100][earned] + (S.miss === 0 ? Math.min(S.streak, 10) * 10 : 0);
    S.score += pts;
    S.done++; updateProg();
    ripple(target);
    const been = visited(target);
    toast(target, (been ? "📍 " : "✓ ") + name(target) + (S.mode === "cap" ? " — " + cap(target) : "") + (pts ? " <small>+" + pts + "</small>" : ""), "ok", 1300);
    cls(target, "target", false); cls(target, "reveal", false);
    cls(target, "flash-ok");
    setTimeout(() => { cls(target, "flash-ok", false); cls(target, earned >= 3 ? "done" : "done2"); }, 700);
    if (btn) btn.classList.add("ok");
    $$("#opts .opt").forEach(b => b.disabled = true);

    // El nombre se queda en el mapa para el resto de la partida
    setTimeout(() => {
      if (gDone.select('[data-id="' + target + '"]').size()) return;
      const c = centroidOf(target), b = bOf(target, mainGeom(target)), u = fs(1);
      // Tamaño según lo que mide la provincia en pantalla, para que no se monten unos nombres sobre otros
      const r = Math.max(8, Math.min(14, (b[1][0] - b[0][0]) / (name(target).length * .58) / u, (b[1][1] - b[0][1]) * .5 / u));
      gDone.append("text").attr("class", "lbl kept").attr("data-id", target).attr("data-r", r).attr("x", c[0]).attr("y", c[1]).style("font-size", fs(r) + "px").text(name(target));
    }, 1600);
    let msg;
    if (S.miss === 0) {
      msg = MSG.streak[S.streak] || (S.done === Math.ceil(S.total / 2) && S.total >= 6 ? MSG.half : rnd(MSG.ok));
      if (MSG.streak[S.streak]) { Sound.great(); confetti(110); } else { Sound.ok(); const [x, y] = screenPt(target); confetti(70, x, y); }
    } else {
      msg = S.miss === 1 ? rnd(MSG.ok2) : rnd(MSG.ok3); Sound.ok(); if (S.miss === 1) { const [x, y] = screenPt(target); confetti(30, x, y); }
    }
    if (been && S.miss === 0) msg = rnd(["¡Muy bien! ¡Y tú has estado en " + name(target) + "!", "¡Eso es! " + name(target) + "… ¡ahí estuviste tú!", "¡Claro, si has estado allí!"]);
    say(msg, "ok", "jump");
    if (S.mode === "cap") $("#qsub").textContent = "La capital de " + name(target) + " es " + cap(target) + " ✨";
    else if (S.mode === "ccaa") $("#qsub").textContent = name(target) + " está en " + P[target][3] + " ✨";
    else if (S.mode === "name") { $("#qname").textContent = name(target); }
    $("#sr").textContent = "Correcto. " + name(target);
    $("#streak").classList.remove("pop"); void $("#streak").offsetWidth; if (S.streak >= 2) $("#streak").classList.add("pop");
    setTimeout(next, S.miss === 0 ? 1300 : 1700);
    return;
  }
  // Fallo
  S.miss++; S.streak = 0; updateProg(); renderTries();
  Sound.bad();
  if (S.mode === "find") {
    cls(id, "flash-bad"); toast(id, "✗ Esa es " + name(id), "bad", 1500);
    setTimeout(() => cls(id, "flash-bad", false), 900);
    shake($("#qcard"));
  } else if (btn) { btn.classList.add("bad"); btn.disabled = true; shake(btn); }
  if (S.miss === 1) say(rnd(MSG.bad), "bad", "sad");
  else if (S.miss === 2) {
    if (S.mode !== "find" && !$$("#opts .opt").some(b => b.dataset.id !== target && !b.disabled)) answerWrongless();
    else hint();
  }
  else {
    // Tercer fallo: se la enseñamos y hay que tocarla para seguir
    if (S.miss === 3) { cls(target, "reveal"); ring(target); }
    if (S.mode === "find") say("¡Mira, " + KID + "! " + name(target) + " es la que brilla en amarillo. Tócala 👆", "", "jump");
    else {
      const ok = $$("#opts .opt").find(b => b.dataset.id === target);
      if (ok) ok.classList.add("ok");
      say("La respuesta es " + (S.mode === "cap" ? cap(target) : name(target)) + ". ¡La próxima vez te sale! Pulsa para seguir 👇", "", "jump");
    }
  }
}

function hint() {
  const t = S.cur;
  if (S.mode === "find") {
    // La pista marca la zona hasta que acierte (antes se borraba al segundo y medio)
    const ccaa = ALL.filter(x => P[x][3] === P[t][3]);
    let group, msg;
    if (S.zone === "all" && ccaa.length > 1) {
      group = ccaa; msg = " Está en " + P[t][3] + ".";
      zoomTo(group); S.zoomed = true;
    } else {
      // Dentro de una comunidad, decir la comunidad no ayuda: marcamos sus vecinas y decimos hacia dónde mirar
      group = [t].concat((NEIGH[t] || []).filter(x => S.pool.includes(x)));
      if (group.length < 2 || group.length >= S.pool.length) group = []; // nunca marcar solo la buena
      msg = " Está " + whereIn(t, S.pool) + (group.length ? ". Está entre las que se han puesto moradas." : ".");
    }
    say(rnd(MSG.hint) + msg, "", "jump");
    group.forEach(x => cls(x, "hint"));
  } else {
    // Quita una opción incorrecta
    const wrong = $$("#opts .opt").filter(b => b.dataset.id !== t && !b.disabled);
    if (!wrong.length) return answerWrongless();
    wrong[0].classList.add("bad"); wrong[0].disabled = true;
    say("¡Te quito una que no es! Ya solo queda elegir bien 😉", "", "jump");
  }
}
$("#helpBtn").onclick = () => {
  if (S.timed) { if (S.cur && !S.locked) { S.streak = 0; updateProg(); next(); } return; }
  if (S.locked || !S.cur || S.mode === "explore") return;
  if (S.miss < 2) { S.miss = 2; renderTries(); S.streak = 0; updateProg(); hint(); }
  else if (S.miss === 2) { answerWrongless(); }
};
function answerWrongless() { // pide ayuda otra vez: se enseña la respuesta
  S.miss = 3; renderTries(); const t = S.cur; cls(t, "reveal"); ring(t);
  if (S.mode === "find") say("Es la que brilla en amarillo, " + KID + ". ¡Tócala! 👆", "", "jump");
  else { const ok = $$("#opts .opt").find(b => b.dataset.id === t); if (ok) { ok.classList.add("ok"); } say("¡Es esta! Púlsala para seguir 👇", "", "jump"); }
}

function onMapClick(id) {
  if (!P[id] || !S.pool.includes(id)) return;
  if (S.mode === "explore") {
    Sound.tap();
    ALL.forEach(x => cls(x, "sel", false)); gLbl.selectAll("*").remove(); cls(id, "sel");
    label(id, name(id));
    $("#iname").textContent = name(id); $("#icap").textContent = cap(id); $("#iccaa").textContent = P[id][3];
    const alt = P[id][1] ? " (o " + P[id][1] + ")" : "";
    say(name(id) + alt + ". Su capital es " + cap(id) + (cap(id) === name(id) ? ", ¡igual que la provincia!" : "."), "", "jump");
    const trip = getTrips()[id];
    $("#ifact").hidden = false; $("#ifact").innerHTML = (trip ? '<span class="been">' + ic("pin") + "<b>¡Aquí estuviste" + (trip.note ? " (" + trip.note.replace(/[<>&]/g, "") + ")" : "") + "!</b></span>" + "" : "") +
      ic("bulb") + "<b>¿Sabías que…?</b> " + DATO[id];
    if (trip) say("¡En " + name(id) + " estuviste tú, " + KID + "! Su capital es " + cap(id) + ".", "ok", "jump");
    Voice.say(name(id) + ". Su capital es " + cap(id) + ". " + DATO[id]);
    return;
  }
  if (S.mode === "find" || S.mode === "time") answer(id);
}
provPaths.on("click", (e, f) => onMapClick(f.id));
cmHit.on("click", (e, f) => onMapClick(f.id));

// ---------- Final ----------
function finish() {
  S.cur = null;
  const max = S.total * 3, ratio = max ? S.stars / max : 0;
  const big = ratio >= .9 ? 3 : ratio >= .65 ? 2 : 1;
  $("#bigstars").innerHTML = '<svg><use href="#star"/></svg>'.repeat(big);
  countUp($("#eStars"), S.score, 900); $("#eFirst").textContent = S.first + "/" + S.total; $("#eStreak").textContent = S.best;
  // Mapa de resultados: verde a la primera, puntos con algún fallo, rayas para repasar
  ALL.forEach(id => { cls(id, "done", false); cls(id, "done2", false); });
  Object.keys(S.results).forEach(id => cls(id, S.results[id] === 3 ? "r-ok" : S.results[id] > 0 ? "r-meh" : "r-bad"));
  const titles = big === 3 ? ["¡Increíble, " + KID + "! 🏆", "¡Campeón, " + KID + "! 🏆"] : big === 2 ? ["¡Muy bien, " + KID + "! 🎉", "¡Buen trabajo, " + KID + "! 🎉"] : ["¡Bien hecho, " + KID + "! 💪"];
  $("#endTitle").textContent = rnd(titles);
  $("#endMsg").textContent = big === 3 ? "¡Te las sabes casi todas! Eres un auténtico explorador de España."
    : big === 2 ? "¡Cada vez te sabes más! Con un repasito vas a ser imbatible."
    : "Has aprendido un montón hoy. ¡Repasamos las difíciles y verás qué rápido mejoras!";
  $("#endMsg").textContent += " Has ganado " + S.stars + " estrellas.";
  $("#mapBtn").hidden = false;
  const fails = Object.keys(S.results).filter(id => S.results[id] < 3);
  $("#reviewWrap").hidden = !fails.length; $("#reviewBtn").hidden = !fails.length;
  $("#eFails").innerHTML = fails.map(id => "<span>" + (S.mode === "cap" ? name(id) + " → " + cap(id) : name(id)) + "</span>").join("");
  S.lastFails = fails;
  // Récord por juego y zona
  if (!S.review) {
    const k = "gabi:pts:" + S.mode + ":" + S.zone + ":" + S.len, prev = store.get(k) || 0;
    if (S.score > prev) store.set(k, S.score);
    $("#endRecord").innerHTML = S.score > prev ? ic("trophy") + (prev ? "¡Nuevo récord! Antes tenías " + prev + " puntos." : "¡Primer récord en este juego y zona!") : "Tu récord aquí: " + prev + " puntos. ¡A por él!";
    const tot = (store.get("gabi:totalStars") || 0) + S.stars; store.set("gabi:totalStars", tot);
  } else { const tot = (store.get("gabi:totalStars") || 0) + S.stars; store.set("gabi:totalStars", tot); $("#endRecord").textContent = "Partida de repaso: no cuenta para el récord."; }
  // ¿Diploma? Toda la zona, sin repaso y todas a la primera
  $("#eStarsL").textContent = "puntos"; $("#eFirstL").textContent = "a la primera"; $("#eStreakL").textContent = "mejor racha";
  const perfect = !S.review && S.zone !== "hard" && S.total === S.pool.length && S.total > 0 && Object.keys(S.results).every(id => S.results[id] === 3);
  S.lastDiploma = perfect ? { zone: S.zone, mode: S.mode, date: Date.now() } : null;
  if (perfect) addDiploma(S.lastDiploma);
  $("#endDipBtn").hidden = !perfect; $("#endDipMsg").hidden = !perfect;
  showScreen($("#end"));
  if (perfect) setTimeout(() => { showDiploma(S.lastDiploma); confetti(200); Sound.great(); say("¡Un diploma para ti, " + KID + "! ¡Toda " + zoneName(S.zone) + " sin fallos! 🎓", "ok", "jump"); }, 1800);
  Sound.win(); confetti(160); setTimeout(() => confetti(120, innerWidth * .2, innerHeight * .4), 500); setTimeout(() => confetti(120, innerWidth * .8, innerHeight * .4), 900);
  say(rnd(titles), "cheer", "jump");
  announceUnlocks();
}
$("#againBtn").onclick = () => startGame();
$("#mapBtn").onclick = () => { hideScreen($("#end")); $("#legend").hidden = false; S.zoomed = false; zoomTo(homeView()); say("¡Mira tu mapa, " + KID + "! En verde, las que has acertado a la primera.", "", "jump"); };
$("#legendBack").onclick = () => { $("#legend").hidden = true; showScreen($("#end")); };
function countUp(el, to, ms) {
  if (reduceMotion() || !to) { el.textContent = to; return; }
  const t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
$("#reviewBtn").onclick = () => startGame(S.lastFails);
$("#menuBtn").onclick = showHome;
$("#homeBtn").onclick = showHome;
// ---------- Diploma: se gana acertando a la primera todas las provincias de una zona ----------
const DIP_VERB = {
  find: "por encontrar en el mapa, sin ningún fallo,",
  name: "por reconocer en el mapa, sin ningún fallo,",
  cap: "por acertar, sin ningún fallo, las capitales de",
  ccaa: "por acertar, sin ningún fallo, la comunidad autónoma de",
};
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaLarga = d => d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
const zoneName = z => z === "all" ? "España" : z === "uni" ? "Comunidades de una provincia" : z;
function diplomaReason(d) {
  const l2 = d.zone === "uni" ? "las comunidades de una sola provincia" : d.zone === "all" ? "todas las provincias de España" : "todas las provincias de " + d.zone;
  return [DIP_VERB[d.mode] || DIP_VERB.find, l2];
}
// Adela en el diploma: con la ropa que lleve y cara de celebración
function loadPipo() {
  const PIPO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + adelaSVG("happy") + "</svg>";
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(im); im.onerror = () => res(null);
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(PIPO_SVG);
  });
}
function starPath(c, x, y, r, rot = -Math.PI / 2) {
  c.beginPath();
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = rot + i * Math.PI / 5; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath();
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function fitText(c, text, max, size, weight) {
  let s = size; do { c.font = weight + " " + s + "px Fredoka, sans-serif"; s -= 4; } while (c.measureText(text).width > max && s > 20); return s + 4;
}
async function drawDiploma(d) {
  try { await Promise.all([document.fonts.load("700 80px Fredoka"), document.fonts.load("500 40px Fredoka"), document.fonts.load("600 40px Fredoka")]); } catch (e) {}
  const pipo = await loadPipo();
  const W = 2480, H = 1754, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  // Fondo y marcos
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#fffaf0"); g.addColorStop(1, "#fff3dc");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.lineWidth = 34; c.strokeStyle = "#7b5cff"; roundRect(c, 50, 50, W - 100, H - 100, 60); c.stroke();
  c.lineWidth = 8; c.strokeStyle = "#ffc93c"; c.setLineDash([30, 18]); roundRect(c, 110, 110, W - 220, H - 220, 40); c.stroke(); c.setLineDash([]);
  // Estrellas en las esquinas
  [[170, 170], [W - 170, 170], [170, H - 170], [W - 170, H - 170]].forEach(([x, y]) => {
    starPath(c, x, y, 62); c.fillStyle = "#ffc93c"; c.fill(); c.lineWidth = 6; c.strokeStyle = "#e09b00"; c.stroke();
  });
  // Confeti decorativo
  const cols = ["#ff8a3d", "#ffc93c", "#7b5cff", "#22b573", "#ff5d73", "#3fb8ff"];
  let seed = 7; const r01 = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 70; i++) {
    const side = i % 2, x = side ? 1700 + r01() * 640 : 160 + r01() * 2160, y = side ? 160 + r01() * 380 : 160 + r01() * 120;
    c.save(); c.translate(x, y); c.rotate(r01() * 6); c.fillStyle = cols[i % cols.length]; c.globalAlpha = .55;
    if (i % 4 === 0) { starPath(c, 0, 0, 14); c.fill(); } else c.fillRect(-12, -5, 24, 10);
    c.restore();
  }
  // Mapa de la zona (columna derecha)
  const ids = d.zone === "all" ? ALL : d.zone === "uni" ? UNI : ALL.filter(id => P[id][3] === d.zone);
  const fc = { type: "FeatureCollection", features: ids.map(id => featById[id]) };
  const box = [1580, 430, 720, 760];
  c.save();
  roundRect(c, box[0] - 30, box[1] - 30, box[2] + 60, box[3] + 60, 50); c.fillStyle = "#cfeeff"; c.fill();
  c.lineWidth = 8; c.strokeStyle = "#ffffff"; c.stroke(); c.clip();
  let proj;
  try { proj = (d.zone === "all" && d3.geoConicConformalSpain ? d3.geoConicConformalSpain() : d3.geoMercator()).fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], fc); }
  catch (e) { proj = d3.geoMercator().fitExtent([[box[0], box[1]], [box[0] + box[2], box[1] + box[3]]], fc); }
  const gp = d3.geoPath(proj, c);
  const pal = ["#ffe08a", "#b9f0c8", "#ffc6d9", "#bfe1ff", "#dccbff", "#ffd4b0"];
  ids.forEach((id, i) => {
    c.beginPath(); gp(featById[id]);
    c.fillStyle = d.zone === "all" ? pal[(+byId[id]?.getAttribute("data-c") || 0) % 6] : pal[i % 6]; c.fill();
    c.lineWidth = 3; c.strokeStyle = "#2b2d5c"; c.lineJoin = "round"; c.stroke();
  });
  if (d.zone !== "all") {
    c.font = "600 30px Fredoka, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 8; c.strokeStyle = "#fff"; c.fillStyle = "#2b2d5c";
    ids.forEach(id => {
      const f = featById[id]; let cen = gp.centroid(f);
      if (f.geometry.type === "MultiPolygon") { let best = null, a = -1; f.geometry.coordinates.forEach(p => { const gg = { type: "Polygon", coordinates: p }, ar = gp.area(gg); if (ar > a) { a = ar; best = gg; } }); cen = gp.centroid(best); }
      if (!isFinite(cen[0])) return;
      c.strokeText(name(id), cen[0], cen[1]); c.fillText(name(id), cen[0], cen[1]);
    });
  }
  c.restore();
  // Textos (columna izquierda)
  const cx = 830; c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.fillStyle = "#7b5cff"; c.font = "700 190px Fredoka, sans-serif"; c.fillText("DIPLOMA", cx, 400);
  c.fillStyle = "#ff8a3d"; c.font = "600 74px Fredoka, sans-serif"; c.fillText("de Gran Explorador", cx, 500);
  c.fillStyle = "#6a6f9c"; c.font = "500 56px Fredoka, sans-serif"; c.fillText("Se concede a", cx, 640);
  // Nombre con cinta
  c.save(); c.fillStyle = "#7b5cff"; roundRect(c, cx - 430, 680, 860, 220, 50); c.fill();
  c.fillStyle = "#5a3fe0"; roundRect(c, cx - 430, 870, 860, 30, 15); c.fill(); c.restore();
  c.fillStyle = "#fff"; c.font = "700 170px Fredoka, sans-serif"; c.fillText(KID.toUpperCase(), cx, 850);
  const [l1, l2] = diplomaReason(d);
  c.fillStyle = "#2b2d5c"; fitText(c, l1, 1300, 62, "500"); c.fillText(l1, cx, 1010);
  fitText(c, l2, 1300, 76, "700"); c.fillStyle = "#2b2d5c"; c.fillText(l2, cx, 1105);
  c.fillStyle = "#6a6f9c"; c.font = "500 50px Fredoka, sans-serif"; c.fillText("en el juego «" + MODE_TXT[d.mode] + "»", cx, 1190);
  // Sello
  const sx = 830, sy = 1430;
  c.save(); c.translate(sx, sy);
  for (let i = 0; i < 24; i++) { c.rotate(Math.PI / 12); c.fillStyle = "#ffb000"; c.beginPath(); c.moveTo(0, -150); c.lineTo(22, -120); c.lineTo(-22, -120); c.fill(); }
  c.restore();
  c.beginPath(); c.arc(sx, sy, 128, 0, Math.PI * 2); c.fillStyle = "#ffc93c"; c.fill(); c.lineWidth = 8; c.strokeStyle = "#e09b00"; c.stroke();
  c.beginPath(); c.arc(sx, sy, 104, 0, Math.PI * 2); c.lineWidth = 4; c.setLineDash([10, 8]); c.strokeStyle = "#fff"; c.stroke(); c.setLineDash([]);
  starPath(c, sx, sy - 28, 50); c.fillStyle = "#fff"; c.fill();
  c.fillStyle = "#7a4a00"; fitText(c, "¡SIN FALLOS!", 170, 30, "700"); c.fillText("¡SIN FALLOS!", sx, sy + 58);
  // Fecha y firma
  c.textAlign = "center"; c.fillStyle = "#2b2d5c";
  fitText(c, fechaLarga(new Date(d.date)), 440, 44, "600"); c.fillText(fechaLarga(new Date(d.date)), 400, 1460);
  c.lineWidth = 4; c.strokeStyle = "#2b2d5c"; c.beginPath(); c.moveTo(220, 1490); c.lineTo(580, 1490); c.stroke();
  c.fillStyle = "#6a6f9c"; c.font = "500 38px Fredoka, sans-serif"; c.fillText("Fecha", 400, 1545);
  if (pipo) c.drawImage(pipo, 1180, 1300, 190, 190);
  c.fillStyle = "#ff8a3d"; c.font = "italic 600 70px Fredoka, sans-serif"; c.fillText("Adela", 1500, 1440);
  c.strokeStyle = "#2b2d5c"; c.beginPath(); c.moveTo(1380, 1490); c.lineTo(1640, 1490); c.stroke();
  c.fillStyle = "#6a6f9c"; c.font = "500 38px Fredoka, sans-serif"; c.fillText("Exploradora jefa", 1510, 1545);
  // Estrellas bajo el mapa
  [1790, 1940, 2090].forEach((x, i) => { starPath(c, x, 1340 + (i === 1 ? -20 : 0), 60); c.fillStyle = "#ffc93c"; c.fill(); c.lineWidth = 6; c.strokeStyle = "#e09b00"; c.stroke(); });
  c.fillStyle = "#7b5cff"; c.font = "700 54px Fredoka, sans-serif"; c.fillText(zoneName(d.zone), 1940, 1480);
  return cv;
}

let dipCanvas = null, dipData = null, downloadsNS = null;
(async () => { try { downloadsNS = window.claude && claude.use ? await claude.use("downloads") : null; } catch (e) { downloadsNS = null; } renderDipButtons(); })();
function canShareFiles() {
  try { return !IN_CLAUDE && !!navigator.canShare && navigator.canShare({ files: [new File([new Blob(["x"], { type: "image/png" })], "x.png", { type: "image/png" })] }); } catch (e) { return false; }
}
function renderDipButtons() {
  const can = !!downloadsNS || !IN_CLAUDE;
  $("#dipShare").hidden = !canShareFiles();
  $("#dipPdf").hidden = !can; $("#dipPng").hidden = !can;
  $("#dipNote").textContent = can
    ? "Puedes enviar la imagen por WhatsApp o por correo. El PDF se imprime en un folio A4 apaisado."
    : "Para guardarlo, mantén pulsado el diploma (o haz clic derecho sobre él) y elige «Guardar imagen». Luego puedes imprimirlo o enviarlo.";
}
const dipFile = (d, ext) => "Diploma de " + KID + " - " + zoneName(d.zone) + " - " + MODE_TXT[d.mode].replace(/[¿?]/g, "") + "." + ext;
async function showDiploma(d) {
  dipData = d;
  dipCanvas = await drawDiploma(d);
  $("#dipImg").src = dipCanvas.toDataURL("image/png");
  $("#dipTitle").textContent = "¡Diploma para " + KID + "!";
  showScreen($("#dip"));
  renderDipButtons();
}
const pngBlob = () => new Promise(res => dipCanvas.toBlob(res, "image/png"));
async function saveFile(filename, data) {
  if (!downloadsNS) { // web normal: descarga del navegador
    const blob = data instanceof Blob ? data : new Blob([data], { type: filename.endsWith(".pdf") ? "application/pdf" : "image/png" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    say("¡Diploma guardado, " + KID + "! 🎓", "ok", "jump");
    return;
  }
  try { await downloadsNS.save({ filename, data }); say("¡Diploma guardado, " + KID + "! 🎓", "ok", "jump"); }
  catch (e) {
    if (e && e.code === "declined") return;
    say("No he podido guardarlo. Prueba a mantener pulsada la imagen y «Guardar imagen».", "bad");
  }
}
$("#dipShare").onclick = async () => {
  if (!dipCanvas) return;
  try {
    const file = new File([await pngBlob()], dipFile(dipData, "png"), { type: "image/png" });
    await navigator.share({ files: [file], title: "Diploma de " + KID, text: "¡" + KID + " ha ganado un diploma de Gran Explorador! 🎓" });
  } catch (e) {}
};
$("#dipPng").onclick = async () => { if (!dipCanvas || (!downloadsNS && IN_CLAUDE)) return; await saveFile(dipFile(dipData, "png"), await pngBlob()); };
$("#dipPdf").onclick = async () => {
  if (!dipCanvas || (!downloadsNS && IN_CLAUDE)) return;
  try {
    const pdf = await PDFLib.PDFDocument.create();
    pdf.setTitle("Diploma de " + KID);
    const img = await pdf.embedPng(await (await pngBlob()).arrayBuffer());
    const page = pdf.addPage([841.89, 595.28]); // A4 apaisado
    page.drawImage(img, { x: 0, y: 0, width: 841.89, height: 595.28 });
    await saveFile(dipFile(dipData, "pdf"), await pdf.save());
  } catch (e) { say("No he podido preparar el PDF. Usa «Imagen para enviar» y la imprimes desde ahí.", "bad"); }
};
$("#dipCopy").onclick = async () => {
  try { await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob() })]); $("#dipCopy span").textContent = "¡Copiada!"; setTimeout(() => $("#dipCopy span").textContent = "Copiar imagen", 2000); }
  catch (e) { $("#dipCopy span").textContent = "No se pudo copiar"; setTimeout(() => $("#dipCopy span").textContent = "Copiar imagen", 2500); }
};
$("#dipClose").onclick = () => hideScreen($("#dip"));
$("#endDipBtn").onclick = () => S.lastDiploma && showDiploma(S.lastDiploma);

function getDiplomas() { return store.get("gabi:diplomas") || []; }
function addDiploma(d) {
  const list = getDiplomas().filter(x => !(x.zone === d.zone && x.mode === d.mode));
  list.push(d); store.set("gabi:diplomas", list);
}
function renderShelf() {
  const list = getDiplomas(), shelf = $("#shelf");
  shelf.innerHTML = "";
  $("#shelfTitle").hidden = !list.length;
  list.forEach(d => {
    const b = document.createElement("button");
    b.innerHTML = ic("cap") + zoneName(d.zone) + " · " + MODE_TXT[d.mode];
    b.onclick = () => showDiploma(d);
    shelf.appendChild(b);
  });
}


// ---------- Inicio ----------
const zoneSel = $("#zone");
ZONES.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; zoneSel.appendChild(o); });
function renderHome() {
  $$(".mode").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === S.mode));
  $$(".seg button").forEach(b => b.setAttribute("aria-pressed", b.dataset.len === S.len));
  zoneSel.value = S.zone;
  // En «Comunidades» solo tiene sentido toda España (dentro de una comunidad la respuesta sería siempre la misma)
  [...zoneSel.options].forEach(o => o.disabled = S.mode === "ccaa" && !["all", "hard"].includes(o.value));
  if (S.mode === "ccaa" && !["all", "hard"].includes(S.zone)) { S.zone = "all"; zoneSel.value = "all"; }
  $("#lenfield").style.visibility = ["explore", "time"].includes(S.mode) || S.zone === "hard" ? "hidden" : "visible";
  const hardN = hardList(S.mode).length;
  $("#goBtn").disabled = S.zone === "hard" && !hardN;
  $("#goBtn").style.opacity = $("#goBtn").disabled ? .45 : 1;
  const n = poolFor(S.zone).length;
  $$(".seg button").forEach(b => { if (b.dataset.len !== "all") b.disabled = +b.dataset.len >= n; b.style.opacity = b.disabled ? .35 : 1; });
  const effLen = S.len !== "all" && +S.len >= n ? "all" : S.len;
  if (effLen !== S.len) { S.len = effLen; $$(".seg button").forEach(b => b.setAttribute("aria-pressed", b.dataset.len === S.len)); }
  const tot = store.get("gabi:totalStars") || 0;
  const best = store.get("gabi:pts:" + S.mode + ":" + S.zone + ":" + S.len);
  const tbest = store.get("gabi:time:" + S.zone);
  $("#record").innerHTML = S.zone === "hard" && !hardN ? "Todavía no hay provincias difíciles en este juego. ¡Juega un poco y aquí aparecerán las que más te cuesten!"
    : (tot ? '<svg class="ic"><use href="#star"/></svg>Llevas ' + tot + " estrellas en total" : "¡Cada acierto te da estrellas!") +
      (S.mode === "time" ? (tbest ? " · Tu récord: " + tbest + " en un minuto" : "") : best && S.mode !== "explore" ? " · Tu récord aquí: " + best + " puntos" : "");
}
function showHome() {
  clearInterval(S.timer); S.timer = null; S.timed = false;
  try { Voice.stop(); } catch (e) {}
  hideScreen($("#end")); hideScreen($("#dip")); showScreen($("#home")); S.cur = null;
  renderHome(); renderShelf(); renderAlbum(); renderPrizes();
  say("¡Hola, " + KID + "! Elige un juego 😊");
}
$$(".mode").forEach(b => b.onclick = () => { S.mode = b.dataset.mode; store.set("gabi:mode", S.mode); Sound.tap(); renderHome(); });
$$(".seg button").forEach(b => b.onclick = () => { S.len = b.dataset.len; store.set("gabi:len", S.len); Sound.tap(); renderHome(); });
zoneSel.onchange = () => { S.zone = zoneSel.value; store.set("gabi:zone", S.zone); renderHome(); };
$("#goBtn").onclick = () => { Sound.tap(); startGame(); };

function renderSound() { const b = $("#soundBtn"); b.innerHTML = Sound.on ? ic("sound") + "<span>Sonido</span>" : ic("mute") + "<span>Sin sonido</span>"; b.setAttribute("aria-pressed", Sound.on); }
$("#soundBtn").onclick = () => { Sound.on = !Sound.on; store.set("gabi:sound", Sound.on); renderSound(); Sound.tap(); };
renderSound();


// ---------- Voz: Adela lee los nombres ----------
const Voice = {
  on: store.get("gabi:voice") !== false, tts: null, blocked: false,
  can() { return !this.blocked && (!!this.tts || "speechSynthesis" in window); },
  say(text) {
    if (!this.on || !this.can()) return;
    if (this.tts) {
      this.tts.speak(text, { language: "es" }).catch(e => { if (e && (e.code === "not_granted" || e.code === "unavailable")) { this.blocked = true; renderVoice(); } });
      return;
    }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = "es-ES"; u.rate = .95;
      const v = speechSynthesis.getVoices().find(v => /^es[-_]ES/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^es/i.test(v.lang));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  stop() { if (this.tts) this.tts.stop().catch(() => {}); else if ("speechSynthesis" in window) speechSynthesis.cancel(); },
};
function renderVoice() {
  const b = $("#voiceBtn"); b.hidden = !Voice.can();
  b.innerHTML = Voice.on ? ic("voice") + "<span>Voz</span>" : ic("novoice") + "<span>Sin voz</span>"; b.setAttribute("aria-pressed", Voice.on);
  if (!Voice.can()) $("#hearBtn").hidden = true;
}
$("#voiceBtn").onclick = () => { Voice.on = !Voice.on; store.set("gabi:voice", Voice.on); if (!Voice.on) Voice.stop(); renderVoice(); };
$("#hearBtn").onclick = () => { if (!S.cur) return; const on = Voice.on; Voice.on = true; Voice.say(name(S.cur)); Voice.on = on; };
(async () => {
  try { Voice.tts = window.claude && claude.use ? await claude.use("tts") : null; } catch (e) { Voice.tts = null; }
  if (Voice.tts && Voice.tts.onState) Voice.tts.onState(e => { if (e.reason === "not_granted" || e.reason === "unavailable") { Voice.blocked = true; renderVoice(); } });
  renderVoice();
})();
renderVoice();

// ---------- Datos curiosos ----------
function showFact(id) {
  if (!DATO[id] || S.timed) return;
  const f = $("#fact"); f.hidden = false;
  f.innerHTML = ic("bulb") + "<b>" + name(id) + ":</b> " + DATO[id];
}

// ---------- Contrarreloj ----------
function answerTimed(id) {
  const target = S.cur;
  if (id === target) {
    S.locked = true; S.found++; S.streak++; S.best = Math.max(S.best, S.streak);
    addStars(1); updateProg(); Sound.ok();
    cls(target, "flash-ok"); setTimeout(() => cls(target, "flash-ok", false), 450);
    ripple(target); toast(target, "✓ " + name(target), "ok", 800);
    const [x, y] = screenPt(target); confetti(25, x, y);
    say(MSG.streak[S.streak] || rnd(["¡Sí!", "¡Bien!", "¡Otra!", "¡Rapidísimo!", "¡Eso es!", "¡Toma!"]), "ok", "jump");
    Voice.say(name(target));
    setTimeout(next, 450);
  } else {
    S.streak = 0; updateProg(); Sound.bad();
    cls(id, "flash-bad"); toast(id, "✗ Esa es " + name(id), "bad", 900); shake($("#qcard"));
    setTimeout(() => cls(id, "flash-bad", false), 600);
    say(rnd(["¡Uy! Esa no. ¡Rápido, otra vez!", "¡Casi! Sigue buscando", "Esa no es, ¡corre!"]), "bad", "sad");
  }
}
function finishTimed() {
  S.cur = null; S.locked = true;
  const n = S.found, k = "gabi:time:" + S.zone, prev = store.get(k) || 0, record = n > prev;
  if (record) store.set(k, n);
  store.set("gabi:totalStars", (store.get("gabi:totalStars") || 0) + n);
  $("#endDipBtn").hidden = true; $("#endDipMsg").hidden = true; $("#reviewWrap").hidden = true; $("#reviewBtn").hidden = true; $("#mapBtn").hidden = true; $("#endRecord").textContent = "";
  const big = n >= 15 ? 3 : n >= 8 ? 2 : 1;
  $("#bigstars").innerHTML = '<svg><use href="#star"/></svg>'.repeat(big);
  $("#endTitle").textContent = record && prev ? "¡Nuevo récord, " + KID + "! 🏆" : "¡Tiempo, " + KID + "! ⏱️";
  $("#endMsg").textContent = "Has encontrado " + n + (n === 1 ? " provincia" : " provincias") + " en un minuto." +
    (record && prev ? " ¡Has superado tu récord de " + prev + "!" : prev && !record ? " Tu récord es " + prev + ". ¡A por él!" : "");
  $("#eStars").textContent = n; $("#eStarsL").textContent = "encontradas";
  $("#eFirst").textContent = Math.max(n, prev); $("#eFirstL").textContent = "tu récord";
  $("#eStreak").textContent = S.best; $("#eStreakL").textContent = "mejor racha";
  showScreen($("#end"));
  Sound.win(); confetti(record ? 200 : 120);
  say($("#endTitle").textContent, "cheer", "jump");
  announceUnlocks();
}

// ---------- Álbum de diplomas ----------
const ALBUM_ZONES = ZONES.map(z => z[0]).filter(z => z !== "all" && z !== "hard");
const zoneOf = id => UNI.includes(id) ? "uni" : P[id][3];
const albumSvg = d3.select("#albumMap").attr("viewBox", HOME_SIDE.join(" "));
const albumPaths = albumSvg.selectAll("path.ap").data(features.filter(f => P[f.id])).join("path").attr("class", "ap").attr("d", path);
albumSvg.append("path").attr("class", "ab").attr("d", path(topojson.mesh(TOPO, TOPO.objects.provinces, (a, b) => a === b || (P[a.id] && P[b.id] && zoneOf(a.id) !== zoneOf(b.id)))));
albumSvg.selectAll("circle").data(CM).join("circle").attr("cx", f => path.centroid(f)[0]).attr("cy", f => path.centroid(f)[1]).attr("r", HOME[2] * .009)
  .attr("class", "cmA").style("stroke", "#2b2d5c").style("stroke-width", 1).style("vector-effect", "non-scaling-stroke");
function renderAlbum() {
  const list = getDiplomas(), got = new Set(list.map(d => d.zone));
  const has = z => got.has(z) || got.has("all");
  albumPaths.attr("class", f => "ap " + (has(zoneOf(f.id)) ? "got" : "no"));
  albumSvg.selectAll("circle.cmA").style("fill", f => has("uni") ? "#ffc93c" : "#dfe3ee");
  const n = ALBUM_ZONES.filter(has).length;
  $("#albumCount").textContent = n + " de " + ALBUM_ZONES.length + " zonas" + (n === ALBUM_ZONES.length ? " ¡completo!" : "");
}
albumPaths.on("click", (e, f) => {
  const z = zoneOf(f.id), list = getDiplomas();
  const d = list.filter(x => x.zone === z || x.zone === "all").sort((a, b) => b.date - a.date)[0];
  if (d) return showDiploma(d);
  if (S.mode === "ccaa" || S.mode === "time" || S.mode === "explore") { S.mode = "find"; store.set("gabi:mode", "find"); }
  S.zone = z; store.set("gabi:zone", z); Sound.tap(); renderHome();
  say("¡Vamos a por " + (z === "uni" ? "las comunidades de una sola provincia" : z) + ", " + KID + "! Pulsa Empezar 🚀", "", "jump");
});

// La provincia que muestra el mapa cabe siempre: en móvil la caja del mapa cambia de forma
let resizeT = null;
addEventListener("resize", () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => { if (setCanaryLayout() && !S.zoomed) zoomTo(homeView(), true); sizeText(); }, 150);
});


// ---------- Pestañas del inicio: Jugar / Mis premios ----------
function setTab(t) {
  const prizes = t === "prizes";
  $("#tabPlay").setAttribute("aria-selected", !prizes); $("#tabPrizes").setAttribute("aria-selected", prizes);
  const show = prizes ? $("#panelPrizes") : $("#panelPlay"), hide = prizes ? $("#panelPlay") : $("#panelPrizes");
  hide.hidden = true; show.hidden = false; show.classList.remove("tabin"); void show.offsetWidth; show.classList.add("tabin");
  if (prizes) { renderPrizes(); store.set("gabi:seenPrizes", totalStars()); $("#newBadge").hidden = true; say("¡Mira todo lo que has conseguido, " + KID + "!", "", "jump"); }
  Sound.tap();
}
$("#tabPlay").onclick = () => setTab("play");
$("#tabPrizes").onclick = () => setTab("prizes");

// ---------- El armario de Adela ----------
function renderPrizes() {
  const tot = totalStars();
  if (typeof renderRank === "function") { renderRank(); renderTrips(); }
  $("#totalN").textContent = tot;
  $("#closetAdela").innerHTML = adelaSVG("happy");
  const box = $("#slots"); box.innerHTML = "";
  Object.entries(WARDROBE).forEach(([slot, def]) => {
    const row = document.createElement("div"); row.className = "slot";
    row.innerHTML = "<b>" + def.label + "</b>";
    const items = document.createElement("div"); items.className = "items";
    def.items.forEach(([key, label, cost]) => {
      const b = document.createElement("button"); const free = cost <= tot;
      b.className = "item" + (outfit[slot] === key ? " on" : "") + (free ? "" : " locked");
      b.innerHTML = free ? label : ic("lock") + label + ' <small><svg class="ic"><use href="#star"/></svg>' + cost + "</small>";
      b.setAttribute("aria-pressed", outfit[slot] === key);
      b.onclick = () => {
        if (!free) { Sound.bad(); say("¡Te faltan " + (cost - tot) + " estrellas para " + label.toLowerCase() + ", " + KID + "! ¡A jugar!", "", "sad"); return; }
        outfit[slot] = key; store.set("gabi:outfit", outfit); renderAdela(); renderPrizes(); Sound.ok();
        say(rnd(["¡Me encanta! 😍", "¡Qué guapa me has puesto!", "¡Superfashion! ✨", "¡Gracias, " + KID + "!"]), "ok", "jump");
      };
      items.appendChild(b);
    });
    row.appendChild(items); box.appendChild(row);
  });
  const seen = store.get("gabi:seenPrizes") || 0;
  $("#newBadge").hidden = !newUnlocks(seen, tot).length;
}
function newUnlocks(from, to) {
  const out = [];
  Object.values(WARDROBE).forEach(d => d.items.forEach(([k, label, cost]) => { if (cost > from && cost <= to) out.push(label); }));
  return out;
}
function announceUnlocks() {
  const lvl = announceLevel();
  const tot = totalStars(), before = store.get("gabi:announced") || 0;
  const got = newUnlocks(before, tot);
  store.set("gabi:announced", tot);
  if (!got.length) return;
  setTimeout(() => {
    say("¡Has desbloqueado " + got.join(", ").toLowerCase() + " para mi armario! Míralo en «Mis premios» 🎁", "cheer", "jump");
    Sound.great(); confetti(90);
  }, lvl ? 6500 : 2600);
}

// ---------- Copia de seguridad del progreso ----------
// Safari puede borrar los datos de las webs que no se abren en unos días: pedimos que los conserve y permitimos guardar una copia
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
function backupData() {
  const data = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith("gabi:")) data[k] = localStorage.getItem(k); } } catch (e) {}
  return { app: "aventura-gabi", version: APP_VERSION, date: new Date().toISOString(), data };
}
const toCode = obj => "GABI1-" + btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))));
function fromCode(txt) {
  txt = (txt || "").trim();
  let obj;
  if (txt.startsWith("{")) obj = JSON.parse(txt);
  else { const b = atob(txt.replace(/^GABI1-/, "").replace(/\s+/g, "")); obj = JSON.parse(new TextDecoder().decode(Uint8Array.from(b, c => c.charCodeAt(0)))); }
  if (!obj || obj.app !== "aventura-gabi" || !obj.data) throw new Error("no es una copia");
  return obj;
}
function bkMsg(t, ok) { const m = $("#bkMsg"); m.textContent = t; m.style.color = ok === false ? "#c22a42" : ok ? "#10804f" : ""; }
$("#bkSave").onclick = async () => {
  const obj = backupData(), d = new Date();
  const fname = "Copia aventura Gabi " + d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0") + ".json";
  const txt = JSON.stringify(obj, null, 1);
  try {
    if (downloadsNS) await downloadsNS.save({ filename: fname, data: txt });
    else if (!IN_CLAUDE) {
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "application/json" })); a.download = fname;
      document.body.appendChild(a); a.click(); a.remove();
    } else throw new Error("sin descargas");
    store.set("gabi:lastBackup", Date.now()); bkMsg("Copia guardada. Guárdala en un sitio seguro (por ejemplo, en tu correo).", true);
  } catch (e) { if (!(e && e.code === "declined")) bkMsg("No se pudo descargar. Usa «Copiar código» y pégalo en una nota o un correo.", false); }
};
$("#bkCopy").onclick = async () => {
  try { await navigator.clipboard.writeText(toCode(backupData())); store.set("gabi:lastBackup", Date.now()); bkMsg("Código copiado. Pégalo en una nota o mándatelo por correo para guardarlo.", true); }
  catch (e) { $("#restoreBox").hidden = false; $("#bkCode").value = toCode(backupData()); $("#bkCode").select(); bkMsg("Este es tu código: cópialo a mano desde el recuadro.", null); }
};
$("#bkRestore").onclick = () => { $("#restoreBox").hidden = !$("#restoreBox").hidden; $("#bkCode").value = ""; bkMsg(""); };
function restore(obj) {
  const n = Object.keys(obj.data).length;
  try { Object.entries(obj.data).forEach(([k, v]) => localStorage.setItem(k, v)); } catch (e) { bkMsg("No se pudo restaurar en este navegador.", false); return; }
  outfit = Object.assign({}, outfitDefault, store.get("gabi:outfit") || {}); renderAdela();
  S.mode = store.get("gabi:mode") || S.mode; S.zone = store.get("gabi:zone") || S.zone; S.len = store.get("gabi:len") || S.len;
  renderHome(); renderShelf(); renderAlbum(); renderPrizes();
  $("#restoreBox").hidden = true; bkMsg("¡Copia restaurada! (" + n + " datos del " + new Date(obj.date).toLocaleDateString("es-ES") + ")", true);
  say("¡Ya lo tienes todo otra vez, " + KID + "! 🎉", "cheer", "jump"); confetti(80);
}
$("#bkApply").onclick = () => { try { restore(fromCode($("#bkCode").value)); } catch (e) { bkMsg("Ese código no parece una copia válida del juego.", false); } };
$("#bkFile").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { restore(fromCode(await f.text())); } catch (er) { bkMsg("Ese archivo no parece una copia válida del juego.", false); }
  e.target.value = "";
};

// ---------- Explorar: comunidades con su nombre y un dibujo típico ----------
const EMBLEM = { "Andalucía": "andalucia", "Aragón": "aragon", "Principado de Asturias": "asturias", "Illes Balears": "baleares", "Canarias": "canarias",
  "Cantabria": "cantabria", "Castilla-La Mancha": "clm", "Castilla y León": "cyl", "Cataluña": "cataluna", "Comunitat Valenciana": "valencia",
  "Extremadura": "extremadura", "Galicia": "galicia", "Comunidad de Madrid": "madrid", "Región de Murcia": "murcia", "Navarra": "navarra",
  "País Vasco": "paisvasco", "La Rioja": "rioja" };
const SHORTCC = { "Principado de Asturias": "Asturias", "Illes Balears": "Baleares", "Comunidad de Madrid": "Madrid", "Región de Murcia": "Murcia", "Comunitat Valenciana": "C. Valenciana" };
const gExplore = gZoom.append("g").attr("class", "explore-layer");
const exploreItems = Object.keys(EMBLEM).map(cc => {
  const ids = ALL.filter(id => P[id][3] === cc);
  const merged = topojson.merge(TOPO, TOPO.objects.provinces.geometries.filter(g => ids.includes(g.id)));
  let best = null, area = -1;
  (merged.type === "MultiPolygon" ? merged.coordinates : [merged.coordinates]).forEach(poly => { const g = { type: "Polygon", coordinates: poly }; const a = path.area(g); if (a > area) { area = a; best = g; } });
  const c = cc === "Canarias" ? path.centroid(merged) : path.centroid(best || merged);
  // Comunidades pequeñas, dibujo más pequeño (para que no se monten en el norte)
  const f = Math.max(.6, Math.min(1, Math.sqrt(path.area(merged)) / 75));
  const g = gExplore.append("g").attr("class", "emb").datum({ cc, c, f, can: cc === "Canarias" });
  g.append("use").attr("href", "#e-" + EMBLEM[cc]);
  g.append("text").attr("class", "emb-lbl").text(SHORTCC[cc] || cc);
  return g;
});
function placeExplore() {
  const k = fs(1);
  exploreItems.forEach(g => {
    const d = g.datum(), p = d.can ? tCan(d.c) : d.c, sz = 34 * k * d.f;
    g.select("use").attr("x", p[0] - sz / 2).attr("y", p[1] - sz * .75).attr("width", sz).attr("height", sz);
    g.select("text").attr("x", p[0]).attr("y", p[1] + sz * .55).style("font-size", 12 * k * Math.max(.8, d.f) + "px");
  });
}


// ---------- Niveles: el título de Gabi sube con las estrellas ----------
const LEVELS = [
  [0, "Explorador novato", "#9fd3ff"], [40, "Aventurero", "#22b573"], [100, "Viajero", "#ff8a3d"],
  [200, "Capitán", "#7b5cff"], [350, "Gran Explorador de España", "#ffc93c"], [600, "Leyenda de los mapas", "#ff5d9e"]];
const levelOf = n => { let i = 0; LEVELS.forEach((l, k) => { if (n >= l[0]) i = k; }); return i; };
function renderRank() {
  const tot = totalStars(), i = levelOf(tot), [, title, col] = LEVELS[i], next = LEVELS[i + 1];
  const pct = next ? Math.round((tot - LEVELS[i][0]) / (next[0] - LEVELS[i][0]) * 100) : 100;
  $("#rank").innerHTML = '<svg class="shield" style="color:' + col + '"><use href="#i-shield"/></svg><span><small>Nivel ' + (i + 1) + '</small><b>' + title + '</b>' +
    '<i class="rankbar"><i style="width:' + pct + '%;background:' + col + '"></i></i>' +
    '<small>' + (next ? "Te faltan " + (next[0] - tot) + " estrellas para " + next[1] : "¡Has llegado a lo más alto!") + '</small></span>';
  $("#levels").innerHTML = LEVELS.map((l, k) => '<div class="lvl' + (k <= i ? " got" : "") + (k === i ? " now" : "") + '"><svg class="shield" style="color:' + (k <= i ? l[2] : "#dfe3ee") + '"><use href="#i-shield"/></svg><b>' + l[1] + '</b><small>' +
    (k <= i ? (k === i ? "Tu nivel" : "Conseguido") : l[0] + " estrellas") + '</small></div>').join("");
}
$("#rank").onclick = () => setTab("prizes");
function announceLevel() {
  const tot = totalStars(), seen = store.get("gabi:rankSeen") ?? levelOf(tot), now = levelOf(tot);
  store.set("gabi:rankSeen", now);
  if (now <= seen) return false;
  setTimeout(() => {
    say("¡HAS SUBIDO DE NIVEL! Ahora eres " + LEVELS[now][1] + ", " + KID + " 🎉", "cheer", "jump");
    Sound.win(); confetti(200); setTimeout(() => confetti(150, innerWidth * .25, innerHeight * .4), 400); setTimeout(() => confetti(150, innerWidth * .75, innerHeight * .4), 800);
  }, 2400);
  return true;
}

// ---------- Mis viajes: las provincias donde Gabi ha estado de verdad ----------
const getTrips = () => store.get("gabi:trips") || {};
const setTrips = t => { try { localStorage.setItem("gabi:trips", JSON.stringify(t)); return true; } catch (e) { return false; } };
const visited = id => !!getTrips()[id];
const tripSvg = d3.select("#tripMap").attr("viewBox", HOME_SIDE.join(" "));
const tripPaths = tripSvg.selectAll("path.tp").data(features.filter(f => P[f.id])).join("path").attr("class", "tp").attr("d", path);
tripSvg.append("path").attr("class", "ab").attr("d", path(topojson.mesh(TOPO, TOPO.objects.provinces, (a, b) => a === b || (P[a.id] && P[b.id] && P[a.id][3] !== P[b.id][3]))));
const tripCM = tripSvg.selectAll("circle.tcm").data(CM).join("circle").attr("class", "tcm").attr("cx", f => path.centroid(f)[0]).attr("cy", f => path.centroid(f)[1]).attr("r", HOME_SIDE[2] * .012);
const tripPins = tripSvg.append("g");
function renderTrips() {
  const t = getTrips(), n = Object.keys(t).length;
  tripPaths.attr("class", f => "tp" + (t[f.id] ? " been" : ""));
  tripCM.attr("class", f => "tcm" + (t[f.id] ? " been" : ""));
  tripPins.selectAll("*").remove();
  Object.keys(t).forEach(id => {
    if (!featById[id]) return;
    const c = path.centroid(mainGeom(id)), s = HOME_SIDE[2] * .045;
    tripPins.append("use").attr("href", "#i-pin").attr("x", c[0] - s / 2).attr("y", c[1] - s).attr("width", s).attr("height", s);
  });
  $("#tripCount").textContent = n ? "Has estado en " + n + " de 52" : "Aún no has marcado ninguna";
  renderTripPinsOnMap();
}
let tripId = null;
function openTrip(id) {
  tripId = id; const t = getTrips()[id];
  $("#tripTitle").textContent = name(id);
  $("#tripToggle").innerHTML = t ? '<svg class="ic"><use href="#i-pin"/></svg>He estado aquí ✓ (toca para quitar)' : '<svg class="ic"><use href="#i-pin"/></svg>Sí, he estado aquí';
  $("#tripToggle").className = "btn " + (t ? "primary" : "sun");
  $("#tripMore").hidden = !t;
  $("#tripNote").value = (t && t.note) || "";
  showScreen($("#tripDlg"));
}
tripPaths.on("click", (e, f) => { Sound.tap(); openTrip(f.id); });
tripCM.on("click", (e, f) => { Sound.tap(); openTrip(f.id); });
$("#tripToggle").onclick = () => {
  const t = getTrips();
  if (t[tripId]) delete t[tripId];
  else { t[tripId] = { note: "" }; Sound.ok(); say("¡Qué bien, " + KID + "! Has estado en " + name(tripId) + ". " + DATO[tripId], "ok", "jump"); }
  setTrips(t); renderTrips(); openTrip(tripId);
};
$("#tripNote").oninput = () => { const t = getTrips(); if (t[tripId]) { t[tripId].note = $("#tripNote").value; setTrips(t); } };
$("#tripClose").onclick = () => hideScreen($("#tripDlg"));

// En el mapa del juego: chinchetas en Explorar
const gTrips = gZoom.append("g").attr("class", "trip-layer");
function renderTripPinsOnMap() {
  gTrips.selectAll("*").remove();
  if (document.body.dataset.mode !== "explore") return;
  const k = fs(1);
  Object.keys(getTrips()).forEach(id => {
    if (!featById[id]) return;
    const c = centroidOf(id), s = 22 * k;
    gTrips.append("use").attr("href", "#i-pin").attr("x", c[0] + 4 * k).attr("y", c[1] - s - 2 * k).attr("width", s).attr("height", s);
  });
}

// ---------- Aviso de versión nueva (solo publicada en una web, p. ej. Netlify) ----------
async function checkUpdate() {
  if (IN_CLAUDE || !/^https?:/.test(location.protocol)) return;
  try {
    const txt = await (await fetch(location.pathname + "?v=" + Date.now(), { cache: "no-store" })).text();
    const m = txt.match(/name="app-version" content="([^"]+)"/);
    if (m && m[1] !== APP_VERSION) { $("#updateBar").innerHTML = ic("gift") + "Hay una versión nueva del juego (" + m[1] + "). Toca aquí para actualizar"; $("#updateBar").hidden = false; }
  } catch (e) {}
}
$("#updateBar").onclick = () => location.reload();
// Sin internet: en la web (Netlify) un service worker guarda el juego y sus librerías para que funcione sin conexión
if (!IN_CLAUDE && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
$("#version").textContent = "Versión " + APP_VERSION + " · " + APP_DATE;
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkUpdate(); });
setInterval(checkUpdate, 10 * 60 * 1000);
setTimeout(checkUpdate, 3000);
if (!ZONES.some(z => z[0] === S.zone)) S.zone = "all";
// Las fotos de viajes se retiraron en la v1.7: se borran las que hubiera guardadas
(() => { const t = getTrips(); let ch = false; Object.values(t).forEach(v => { if (v && v.photo) { delete v.photo; ch = true; } }); if (ch) setTrips(t); })();
// Primera vez con niveles/armario: se parte del total actual para no anunciar como «nuevo» lo que ya tenía
if (store.get("gabi:rankSeen") == null) store.set("gabi:rankSeen", levelOf(totalStars()));
if (store.get("gabi:announced") == null) store.set("gabi:announced", totalStars());
renderPrizes();
showHome();
