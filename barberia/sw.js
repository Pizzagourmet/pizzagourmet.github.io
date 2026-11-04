// Necesario para poder instalar la página como app
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){ if (new URL(e.request.url).origin === location.origin) e.respondWith(fetch(e.request)); });
