class Config {
  constructor() {
    this.config = {
      // 项目配置
      project: {
        name: 'GH5',
        version: '1.0.0',
        description: '产品展示网站'
      },
      
      // GitHub 配置
      github: {
        owner: 'conlinzheng',
        repo: 'GH5',
        productsPath: '产品图',
        apiBaseUrl: 'https://api.github.com'
      },
      
      // 缓存配置
      cache: {
        prefix: 'gh5_',
        defaultTTL: 3600000 // 1 hour
      },
      
      // 国际化配置
      i18n: {
        defaultLang: 'zh',
        supportedLangs: ['zh', 'en', 'ko']
      },
      
      // 性能配置
      performance: {
        maxParallelRequests: 5,
        batchSize: 10
      },
      
      // API 配置
      api: {
        useProxy: false,
        proxyUrl: '/api/github',
        maxRetries: 3,
        retryDelay: 1000
      }
    };
    
    this.loadFromEnv();
    this.loadApiKey();
  }
  
  loadFromEnv() {
    try {
      // 尝试从环境变量加载配置
      if (typeof window !== 'undefined' && window.env) {
        this.config = {
          ...this.config,
          ...window.env
        };
      }
    } catch (error) {
      console.error('Load config from env error:', error);
    }
  }
  
  loadApiKey() {
    try {
      // 尝试从安全存储加载 API 密钥
      if (typeof window !== 'undefined') {
        // 优先从 sessionStorage 加载
        const sessionKey = sessionStorage.getItem('gh5_github_token');
        if (sessionKey) {
          this.set('github.token', sessionKey);
          console.log('API key loaded from sessionStorage:', sessionKey.substring(0, 10) + '...');
          return;
        }
        
        // 然后从 localStorage 加载
        const localKey = localStorage.getItem('gh5_github_token');
        if (localKey) {
          this.set('github.token', localKey);
          console.log('API key loaded from localStorage:', localKey.substring(0, 10) + '...');
          return;
        }
        
        // 最后从环境变量加载
        if (window.env && window.env.github && window.env.github.token) {
          this.set('github.token', window.env.github.token);
          console.log('API key loaded from environment:', window.env.github.token.substring(0, 10) + '...');
          return;
        }
        
        // 使用默认令牌
        const defaultToken = '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';
        this.set('github.token', defaultToken);
        console.log('API key loaded from default:', defaultToken.substring(0, 10) + '...');
      }
    } catch (error) {
      console.error('Load API key error:', error);
    }
  }
  
  saveApiKey(token) {
    try {
      if (typeof window !== 'undefined') {
        // 存储到 sessionStorage
        sessionStorage.setItem('gh5_github_token', token);
        console.log('API key saved to sessionStorage:', token.substring(0, 10) + '...');
        // 同时存储到 localStorage 作为备份
        localStorage.setItem('gh5_github_token', token);
        console.log('API key saved to localStorage:', token.substring(0, 10) + '...');
        // 更新配置
        this.set('github.token', token);
        console.log('API key updated in config:', token.substring(0, 10) + '...');
        return true;
      }
    } catch (error) {
      console.error('Save API key error:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
  
  removeApiKey() {
    try {
      if (typeof window !== 'undefined') {
        // 从存储中移除
        sessionStorage.removeItem('gh5_github_token');
        localStorage.removeItem('gh5_github_token');
        // 从配置中移除
        this.set('github.token', null);
        return true;
      }
    } catch (error) {
      console.error('Remove API key error:', error);
    }
    return false;
  }
  
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  }
  
  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!obj[k]) {
        obj[k] = {};
      }
      obj = obj[k];
    }
    
    obj[keys[keys.length - 1]] = value;
  }
  
  getAll() {
    return JSON.parse(JSON.stringify(this.config));
  }
}

const config = new Config();
export default config;