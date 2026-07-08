// public/sw.js
// Service worker mínimo: no cachea nada todavía, su único propósito es
// cumplir el requisito de "instalabilidad" de Chrome/Android para que al
// agregar la app a la pantalla de inicio tome el ícono del manifest en vez
// de crear solo un acceso directo genérico.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // No-op: deja pasar todas las peticiones normalmente.
});
