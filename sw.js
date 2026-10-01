// Service worker: la app abre rápido y se puede instalar.
// La agenda NUNCA se guarda en caché: siempre se consulta en vivo al servidor.
const CACHE = 'turnos-v1';
const SHELL = ['./', './index.html', './manifest.json', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // API y externos: directo a la red
  // Red primero (siempre la última versión); si no hay internet, la copia guardada.
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
