// pkm-duel-v41
const CACHE = 'pkm-duel-v41';
const FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      const oldKeys = keys.filter(k => k !== CACHE);
      const hasOldCache = oldKeys.length > 0;
      return Promise.all(oldKeys.map(k => caches.delete(k)))
        .then(() => self.clients.claim())
        .then(() => {
          // Só manda reload se tinha cache antigo (= update real, não primeira instalação)
          if(hasOldCache){
            return self.clients.matchAll({includeUncontrolled:true, type:'window'})
              .then(clients => clients.forEach(c => c.postMessage({type:'SW_RELOAD'})));
          }
        });
    })
  );
});

// Network first
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
