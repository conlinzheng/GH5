class CacheManager {
    constructor() {
        this.defaultTTL = 3600000;
    }

    get(key, ttl = this.defaultTTL) {
        try {
            if (!window.localStorage) return null;
            const item = localStorage.getItem(key);
            if (!item) return null;
            const parsedItem = JSON.parse(item);
            const now = Date.now();
            if (now - parsedItem.timestamp > ttl) {
                this.clear(key);
                return null;
            }
            return parsedItem.data;
        } catch (error) {
            return null;
        }
    }

    set(key, data) {
        try {
            if (!window.localStorage) return false;
            const item = { data, timestamp: Date.now() };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            return false;
        }
    }

    clear(key) {
        try {
            if (!window.localStorage) return false;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    }

    clearAll() {
        try {
            if (!window.localStorage) return false;
            localStorage.clear();
            return true;
        } catch (error) {
            return false;
        }
    }

    getSize() {
        let size = 0;
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    size += localStorage[key].length;
                }
            }
        } catch (e) {}
        return size;
    }

    exists(key, ttl = this.defaultTTL) {
        return this.get(key, ttl) !== null;
    }
}

const cacheManager = new CacheManager();
if (typeof module !== 'undefined' && module.exports) { module.exports = cacheManager; }
else { window.cacheManager = cacheManager; }