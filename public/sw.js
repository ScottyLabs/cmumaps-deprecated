const cacheName = "MyCache_v0.3";
const cachedResources = ["/cmumaps-data/floorPlanMap.json"];

async function precache() {
  const cache = await caches.open(cacheName);
  return cache.addAll(cachedResources);
}

self.addEventListener("install", (event) => {
  console.log("Service worker install event!");
  precache();
  event.waitUntil(self.skipWaiting());
});

const putInCache = async (request, response) => {
  const cache = await caches.open("v0.3");
  await cache.put(request, response);
};

const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  
  if (responseFromCache) {
    console.log("Cache Hit", request.url);
    return responseFromCache;
  }
  const responseFromNetwork = await fetch(request);
  console.log("Cache Miss", request.url);
  if(request.url.includes("floorPlanMap") || request.url.includes("searchMap") || request.url.includes("apple")) {
    putInCache(request, responseFromNetwork.clone());
  }

  return responseFromNetwork;
};

self.addEventListener("fetch", (event) => {
  console.log("UH oH, fetch event in service worker", event);
  if (!(request.url.includes("floorPlanMap") || request.url.includes("searchMap") || request.url.includes("apple"))) {
    return;
  }

  event.preventDefault();
  event.respondWith(cacheFirst(event.request));
  
});
