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
      // 仅从环境变量或配置文件加载 API 密钥（内存存储）
      if (typeof window !== 'undefined') {
        // 从环境变量加载
        if (window.env && window.env.github && window.env.github.token) {
          const token = window.env.github.token;
          if (this.validateToken(token)) {
            this.set('github.token', token);
            console.log('API key loaded from environment');
            return;
          } else {
            console.warn('Invalid token format in environment variable');
          }
        }
        
        console.log('No API key found in environment. Please set GITHUB_TOKEN in your environment.');
      }
    } catch (error) {
      console.error('Load API key error:', error);
      // 即使加载API密钥失败，也要确保config实例能正常创建
    }
  }
  
  validateToken(token) {
    // GitHub Token 格式验证
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // 验证 Token 格式：ghp_ 开头，后跟40个字母数字字符
    const tokenPattern = /^ghp_[a-zA-Z0-9]{36}$/;
    
    // 或者验证经典 Token 格式：40个十六进制字符
    const classicTokenPattern = /^[a-f0-9]{40}$/;
    
    // 或者验证 fine-grained Token 格式：github_pat_ 开头
    const fineGrainedPattern = /^github_pat_[a-zA-Z0-9_]{22,}$/;
    
    return tokenPattern.test(token) || 
           classicTokenPattern.test(token) || 
           fineGrainedPattern.test(token);
  }
  
  saveApiKey(token) {
    try {
      if (typeof window !== 'undefined') {
        // 验证 Token 格式
        if (!this.validateToken(token)) {
          console.error('Invalid token format');
          return false;
        }
        
        // 仅存储到内存中，不写入 localStorage 或 sessionStorage
        this.set('github.token', token);
        console.log('API key saved to memory');
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
        // 仅从内存中移除
        this.set('github.token', null);
        console.log('API key removed from memory');
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