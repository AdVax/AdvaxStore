const CACHE='store-v2';
const SHELL=['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=e.request.url;
  if(u.includes('cdn.jsdelivr.net')||u.includes('raw.githubusercontent')||u.includes('api.github.com')){
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)||new Response('[]',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>{
    if(c)return c;
    return fetch(e.request).then(r=>{if(r&&r.status===200&&r.type==='basic'){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));}return r;}).catch(()=>caches.match('./index.html'));
  }));
});
