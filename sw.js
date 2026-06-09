const CACHE_NAME = 'ahriknow-wpa-v3';

// 获取基础路径（兼容本地和GitHub Pages）
function getBasePath() {
    const path = self.location.pathname;
    // 移除sw.js文件名，获取目录路径
    return path.replace(/sw\.js$/, '');
}

const BASE_PATH = getBasePath();
const urlsToCache = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'css/style.css',
    BASE_PATH + 'js/app.js',
    BASE_PATH + 'manifest.json'
];

// 安装Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 激活Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});

// 推送通知
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '你有新的通知',
        icon: 'icons/icon-192.png',
        badge: 'icons/icon-72.png'
    };
    event.waitUntil(
        self.registration.showNotification('AhriKnow WPA', options)
    );
});

// 通知点击
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
