/*
* @Author: lushijie
* @Date:   2016-12-26 15:32:22
* @Last Modified by:   lushijie
* @Last Modified time: 2017-01-06 15:26:57
*/

var CHACH_NAME = 'my-test-cahce-v1';
var cacheFiles = [
  '/html/www/2017-01-06-55454/sw.js',
  '/html/www/2017-01-06-55454/index.html',
  '/html/www/2017-01-06-55454/index.js'
];
self.addEventListener('install', function (evt) {
  evt.waitUntil(
    caches.open(CHACH_NAME).then(function (cache) {
      return cache.addAll(cacheFiles);
    })
  );
});

self.addEventListener('fetch', function (evt) {
  evt.respondWith(
    caches.match(evt.request).then(function(response) {
      if (response) {
       return response;
      }
      //未命中直接实际请求
      //return fetch(evt.request);

      //未命中
      var request = evt.request.clone();
      return fetch(request).then(function (response) {
        if (!response && response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        //正常接收到请求
        var responseClone = response.clone();
        caches.open('my-test-cache-v1').then(function (cache) {
          cache.put(evt.request, responseClone);
        });
        return response;
      });
    })
  )
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
