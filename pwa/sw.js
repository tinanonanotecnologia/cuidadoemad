const CACHE='cuidado-em-ad-mvp-v14';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/logo-tight.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached)return cached;
      return fetch(event.request).then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});

