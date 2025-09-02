// Dev stub service worker to satisfy /sw.js during Vite dev
// The production build uses vite-plugin-pwa to generate a real SW.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', () => {
  // no-op: let network handle everything in dev
});

