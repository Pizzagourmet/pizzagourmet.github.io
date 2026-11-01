// Necesario para poder instalar el radar como app (no guarda nada: siempre trae datos frescos)
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).catch(function(){ return new Response('<p style="font-family:sans-serif;padding:24px">Sin internet. Revisa la conexión y vuelve a abrir el radar.</p>', {headers: {'Content-Type': 'text/html; charset=utf-8'}}); }));
});
