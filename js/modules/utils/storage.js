class StorageUtils {
  constructor() {
    this.prefix = 'gh5_';
  }

  get(key) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  set(key, value) {
    try {
      const fullKey = this.prefix + key;
      localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  remove(key) {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      const gh5Keys = keys.filter(key => key.startsWith(this.prefix));
      gh5Keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  getSession(key) {
    try {
      const fullKey = this.prefix + key;
      const item = sessionStorage.getItem(fullKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Session storage get error:', error);
      return null;
    }
  }

  setSession(key, value) {
    try {
      const fullKey = this.prefix + key;
      sessionStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  }

  removeSession(key) {
    try {
      const fullKey = this.prefix + key;
      sessionStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  }

  clearSession() {
    try {
      const keys = Object.keys(sessionStorage);
      const gh5Keys = keys.filter(key => key.startsWith(this.prefix));
      gh5Keys.forEach(key => sessionStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Session storage clear error:', error);
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
      console.error('Storage getSize error:', error);
      return { count: 0, size: 0, sizeKB: '0' };
    }
  }

  exists(key) {
    try {
      const fullKey = this.prefix + key;
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.error('Storage exists error:', error);
      return false;
    }
  }

  getKeys() {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Storage getKeys error:', error);
      return [];
    }
  }
}

const storageUtils = new StorageUtils();
export default storageUtils;