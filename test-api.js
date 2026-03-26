// 模拟浏览器环境和config对象
const https = require('https');

// 模拟fetch函数
global.fetch = function(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        // 模拟Response对象
        const response = {
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          headers: {
            get: (name) => res.headers[name.toLowerCase()]
          },
          json: () => Promise.resolve(JSON.parse(data))
        };
        resolve(response);
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
};

// 模拟FileReader
global.FileReader = function() {
  this.onload = null;
  this.onerror = null;
  this.readAsDataURL = function() {
    // 模拟实现
  };
};

// 模拟atob和btoa
global.atob = function(str) {
  return Buffer.from(str, 'base64').toString('binary');
};

global.btoa = function(str) {
  return Buffer.from(str, 'binary').toString('base64');
};

// 模拟TextDecoder和TextEncoder
global.TextDecoder = class {
  constructor() {}
  decode(bytes) {
    return String.fromCharCode(...bytes);
  }
};

global.TextEncoder = class {
  constructor() {}
  encode(str) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }
};

global.Uint8Array = Uint8Array;

// 模拟config对象
global.config = {
  get: function(key, defaultValue) {
    const configMap = {
      'github.owner': 'conlinzheng',
      'github.repo': 'GH5',
      'github.apiBaseUrl': 'https://api.github.com'
    };
    return configMap[key] || defaultValue;
  },
  saveApiKey: function() {}
};

// 直接定义GitHubAPI类
class GitHubAPI {
  constructor(owner = config.get('github.owner'), repo = config.get('github.repo')) {
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = config.get('github.apiBaseUrl', 'https://api.github.com');
    this.token = null;
    this.rateLimit = {
      remaining: 60,
      reset: Date.now() + 3600000
    };
  }

  async fetchDirectory(path = '') {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
      const response = await fetch(url);
      
      if (response && response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map(item => ({
            name: item.name,
            type: item.type,
            path: item.path,
            size: item.size
          }));
        }
      }

      return [];
    } catch (error) {
      console.error('Fetch directory error:', error);
      throw error;
    }
  }
}

// 手动创建githubAPI对象
const githubAPI = new GitHubAPI();

// 测试GitHub API
console.log('开始测试GitHub API...');
githubAPI.fetchDirectory('产品图')
  .then(data => {
    console.log('API测试成功，获取到目录内容:', data);
  })
  .catch(error => {
    console.error('API测试失败:', error.message);
    console.error('错误详情:', error);
  })
  .finally(() => {
    console.log('测试完成');
  });