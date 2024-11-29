const cacheName = "MyCache_1";
const cachedResources = ["/cmumaps-data/floorPlanMap.json"];

async function precache() {
  const cache = await caches.open(cacheName);
  return cache.addAll(cachedResources);
}

self.addEventListener("install", (event) => {
  console.log("Service worker install event!");
  event.waitUntil(precache());
});

const putInCache = async (request, response) => {
  const cache = await caches.open("v1");
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
  event.respondWith(cacheFirst(event.request));
});
