const C='sn-v2',A=['./','index.html','style.css','app.js','docx.js','worker.js','icon.svg','manifest.webmanifest'];
self.oninstall=e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A)));
self.onfetch=e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
};
