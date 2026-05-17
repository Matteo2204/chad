const CACHE_NAME = 'chad-v1';
const ASSETS = ['./'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Notification scheduling
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    // Store notification times
    self.notifTimes = e.data.times;
  }
});

// Periodic check for notifications (when browser allows)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'snack-reminder') {
    e.waitUntil(showSnackReminder());
  }
});

async function showSnackReminder() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if ((h === 10 && m >= 25 && m <= 35) || (h === 16 && m >= 0 && m <= 10)) {
    await self.registration.showNotification('Chad 💪', {
      body: h === 10 ? 'Ora dello spuntino mattina! 🥜' : 'Ora dello spuntino pomeriggio! 🍫',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231a1a2e"/><text x="50" y="62" text-anchor="middle" font-size="50" fill="white">💪</text></svg>',
      tag: 'snack-' + h
    });
  }
}
