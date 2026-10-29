// Offline app shell. Built assets are content-hashed, so they are cached forever; pages
// are fetched fresh and fall back to the cached shell offline. Spotify, archive.org and
// LRCLIB requests (cross-origin) and audio range requests are never touched.
const CACHE='looproom-v1';
const SHELL=['/','/manifest.webmanifest','/icons/icon-192.png','/icons/apple-touch-icon.png'];

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==location.origin||req.headers.has('range'))return;
 if(req.mode==='navigate'){
  e.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put('/',copy));return res}).catch(()=>caches.match('/')));
  return;
 }
 if(url.pathname.startsWith('/assets/')||url.pathname.startsWith('/icons/')||url.pathname.startsWith('/art/')){
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res})));
 }
});
