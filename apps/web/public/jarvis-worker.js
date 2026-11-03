self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || request.mode !== 'navigate' ||
      url.origin !== self.location.origin || !['/', '/index.html'].includes(url.pathname)) return;

  event.respondWith(fetch(request).catch(() => new Response(
    '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JARVIS OS · Offline</title><main><h1>JARVIS is unavailable</h1><p>Start the local JARVIS service, then reload this page.</p><p lang="ar" dir="rtl">شغّل خدمة جارفس المحلية وبعدين حدّث الصفحة.</p><a href="/">Retry / جرّب تاني</a></main></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'" } },
  )));
});
