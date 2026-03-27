import config from './config.js';

class CacheManager {
  constructor() {
    this.prefix = config.get('cache.prefix', 'gh5_');
    this.defaultTTL = config.get('cache.defaultTTL', 3600000);
  }

  get(key, ttl = this.defaultTTL) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const data = JSON.parse(item);
      const now = Date.now();

      if (data.expiry && data.expiry < now) {
        this.clear(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  set(key, data, ttl = this.defaultTTL) {
    try {
      const fullKey = this.prefix + key;
      const expiry = Date.now() + ttl;
      const item = {
        value: data,
        expiry: expiry,
        timestamp: Date.now()
      };

      localStorage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  clear(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      const gh5Keys = keys.filter(key => key.startsWith(this.prefix));
      
      gh5Keys.forEach(key => {
        localStorage.removeItem(key);
      });

      return true;
    } catch (error) {
      console.error('Cache clearAll error:', error);
      return false;
    }
  }

  getSize() {
    try {
      const keys = Object.keys(localStorage);
      const gh5Keys = keys.filter(key => key.startsWith(this.prefix));
      
      let totalSize = 0;
      gh5Keys.forEach(key => {
        const item = localStorage.getItem(key);
        totalSize += item.length;
      });

      return {
        count: gh5Keys.length,
        size: totalSize,
        sizeKB: (totalSize / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Cache getSize error:', error);
      return { count: 0, size: 0, sizeKB: '0' };
    }
  }

  exists(key) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      return item !== null;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  getKeys() {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.startsWith(this.prefix));
    } catch (error) {
      console.error('Cache getKeys error:', error);
      return [];
    }
  }

  cleanup() {
    try {
      const keys = this.getKeys();
      const now = Date.now();
      let cleaned = 0;

      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          const data = JSON.parse(item);
          if (data.expiry && data.expiry < now) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      });

      return cleaned;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  getInfo(key) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const data = JSON.parse(item);
      const now = Date.now();
      const remainingTime = data.expiry ? Math.max(0, data.expiry - now) : 0;

      return {
        key: key,
        exists: true,
        expiry: data.expiry,
        remainingTime: remainingTime,
        remainingMinutes: Math.floor(remainingTime / 60000),
        timestamp: data.timestamp,
        age: now - data.timestamp,
        ageMinutes: Math.floor((now - data.timestamp) / 60000)
      };
    } catch (error) {
      console.error('Cache getInfo error:', error);
      return null;
    }
  }
}

const cacheManager = new CacheManager();
export default cacheManager;