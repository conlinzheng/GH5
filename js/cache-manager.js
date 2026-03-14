class CacheManager {
    constructor() {
        this.defaultTTL = 3600000;
    }

    get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const { value, timestamp, ttl } = JSON.parse(item);
            const now = Date.now();

            if (ttl && now - timestamp > ttl) {
                localStorage.removeItem(key);
                return null;
            }

            return value;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    set(key, value, ttl = this.defaultTTL) {
        try {
            const item = {
                value,
                timestamp: Date.now(),
                ttl
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    clear(key) {
        localStorage.removeItem(key);
    }

    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    getSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return size;
    }
}

const cacheManager = new CacheManager();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = cacheManager;
} else {
    window.cacheManager = cacheManager;
}