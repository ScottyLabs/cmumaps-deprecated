// Choose a cache name
const cacheName = 'cache-v2';
// List the files to precache
// const precacheResources = [
//   "/manifest.json", 
//   "main.js", 
//   "/_next/static/chunks/main.js",
//   "/_next/static/chunks/pages/_app.js",
//   "/_next/static/chunks/react-refresh.js",
//   "/_next/static/chunks/pages/%5B%5B...slug%5D%5D.js",
//   "/_next/static/development/_buildManifest.js",
//   "/_next/static/development/_ssgManifest.js",
//   "/favicons/smapslogo.png",
//   "/_next/static/development/_devMiddlewareManifest.json",
//   "/favicons/favicon.ico",
//   "https://wise-pika-28.clerk.accounts.dev/npm/@clerk/clerk-js@4/dist/clerk.browser.js",
//   // "https://cdn.apple-mapkit.com/ti/csr/1.x.x/mk-csr.js?mapkitVersion=5.77.54",
//   // "https://cdn.apple-mapkit.com/ma/bootstrap?apiVersion=2&mkjsVersion=5.77.54&poi=1",
//   "/_next/static/development/_devPagesManifest.json",

// ];

console.log("service worker")

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('Service worker install event!');
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activate event!');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       return cachedResponse || fetch(event.request).then((response) => {
//         return caches.open(cacheName).then((cache) => {
//           cache.put(event.request, response.clone());
//           return response;
//         });
//       });
//     })
//   );
// });