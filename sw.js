// ═══════════════════════════════════════════════════════════
// Service Worker — مولَّد تلقائياً بواسطة Mediphera PWA Generator
// ═══════════════════════════════════════════════════════════
const CACHE_NAME = 'store-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// تثبيت: تخزين ملفات التطبيق الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, {cache: 'reload'}))))
      .then(() => self.skipWaiting())
  );
});

// تفعيل: حذف الكاش القديمة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // بيانات المنتجات: Network-First دائماً (نضمن أحدث منتج)
  if (url.includes('cdn.jsdelivr.net') || url.includes('raw.githubusercontent') || url.includes('api.github.com')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request) || new Response('[]', {headers:{'Content-Type':'application/json'}}))
    );
    return;
  }

  // ملفات التطبيق: Cache-First (أسرع)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});