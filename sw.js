const CORE_CACHE = 'muecti-core-v3';
const UNIT_CACHE = 'muecti-unidades-v1';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await cache.addAll([
      './index.html', './datos_unidades.js', './manifest.webmanifest', './icon.svg',
      './vendor/pdfjs/pdf.min.mjs', './vendor/pdfjs/pdf.worker.min.mjs'
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('muecti-') &&
      name !== CORE_CACHE && name !== UNIT_CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

async function cachedRange(response, rangeHeader) {
  const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return response;
  const bytes = await response.arrayBuffer();
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), bytes.byteLength - 1) : bytes.byteLength - 1;
  if (start > end || start >= bytes.byteLength) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${bytes.byteLength}` }
    });
  }
  return new Response(bytes.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${bytes.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const isCoreUpdate = request.mode === 'navigate' || new URL(request.url).pathname.endsWith('/datos_unidades.js');
    if (isCoreUpdate) {
      try {
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(CORE_CACHE);
          await cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const fallback = await caches.match(request, { ignoreSearch: true });
        if (fallback) return fallback;
      }
    }
    const cached = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
    if (cached) return cachedRange(cached, request.headers.get('Range'));
    try {
      return await fetch(request);
    } catch (err) {
      if (request.mode === 'navigate') {
        const shell = await caches.match(new URL('./index.html', self.registration.scope).href);
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
