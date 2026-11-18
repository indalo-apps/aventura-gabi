// Service worker de La aventura de Gabi: permite jugar sin conexión.
// Versión 1.8: al subir una versión nueva cambia el nombre de la caché y se limpia la anterior.
const CACHE = "aventura-gabi-1.8";
const PRECACHE = ["./", "index.html", "css/style.css?v=1.8", "js/data.js?v=1.8", "js/app.js?v=1.8", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js", "https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js", "https://cdn.jsdelivr.net/npm/d3-composite-projections@1.4.0/d3-composite-projections.min.js", "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js", "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u =>
    c.add(new Request(u, { mode: u.startsWith("http") ? "cors" : "same-origin" })).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("aventura-gabi-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  // Comprobación de versión nueva: siempre a la red
  if (url.origin === location.origin && url.searchParams.has("v") && /^\d{10,}$/.test(url.searchParams.get("v"))) return;
  // La página: primero la red (para tener lo último) y, sin conexión, la copia guardada
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("index.html", cp)); return r; })
      .catch(() => caches.match("index.html").then(r => r || caches.match("./"))));
    return;
  }
  // Todo lo demás (librerías, letra, iconos): primero la copia guardada y, si no está, la red (y se guarda)
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  })));
});
