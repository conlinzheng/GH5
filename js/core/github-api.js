import config from './config.js';

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

  setToken(token) {
    this.token = token;
    if (token) {
      // 保存到配置中
      if (typeof config !== 'undefined') {
        config.saveApiKey(token);
      }
    }
  }

  getToken() {
    if (this.token) {
      return this.token;
    }
    // 从配置中获取
    if (typeof config !== 'undefined') {
      return config.get('github.token');
    }
    return null;
  }

  async fetchDirectory(path = '') {
    try {
      // 对路径进行URL编码，确保中文字符正确处理
      const encodedPath = encodeURIComponent(path);
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${encodedPath}`;
      console.log('Fetching directory:', url);
      const response = await this._fetch(url);
      
      if (response && Array.isArray(response)) {
        const result = response.map(item => ({
          name: item.name,
          type: item.type,
          path: item.path,
          size: item.size
        }));
        console.log('Directory fetch successful:', path, 'found', result.length, 'items');
        return result;
      }

      console.log('Directory fetch returned empty result:', path);
      return [];
    } catch (error) {
      console.error('Fetch directory error:', error);
      // 增强错误信息
      const enhancedError = new Error(`Failed to fetch directory ${path}: ${error.message}`);
      enhancedError.status = error.status;
      throw enhancedError;
    }
  }

  async fetchFile(path) {
    try {
      // 对路径进行URL编码，确保中文字符正确处理
      const encodedPath = encodeURIComponent(path);
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${encodedPath}`;
      console.log('Fetching file:', url);
      const response = await this._fetch(url);
      
      if (response && response.content) {
        const content = this._base64Decode(response.content);
        try {
          const jsonContent = JSON.parse(content);
          console.log('File fetch successful (JSON):', path);
          return jsonContent;
        } catch {
          console.log('File fetch successful (raw):', path);
          return content;
        }
      }

      console.log('File fetch returned no content:', path);
      return null;
    } catch (error) {
      console.error('Fetch file error:', error);
      // 增强错误信息
      const enhancedError = new Error(`Failed to fetch file ${path}: ${error.message}`);
      enhancedError.status = error.status;
      throw enhancedError;
    }
  }

  async commitFile(path, content, message = 'Update file') {
    try {
      // 对路径进行URL编码，确保中文字符正确处理
      const encodedPath = encodeURIComponent(path);
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${encodedPath}`;
      const base64Content = this._base64Encode(content);

      const body = {
        message: message,
        content: base64Content
      };

      // 尝试获取文件的 SHA 值
      try {
        const fileInfo = await this._fetch(url);
        if (fileInfo && fileInfo.sha) {
          body.sha = fileInfo.sha;
        }
      } catch (error) {
        // 如果文件不存在，继续执行（创建新文件）
        if (error.status !== 404) {
          throw error;
        }
      }

      const response = await this._fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      return response;
    } catch (error) {
      console.error('Commit file error:', error);
      throw error;
    }
  }

  async getFileSHA(path) {
    try {
      // 对路径进行URL编码，确保中文字符正确处理
      const encodedPath = encodeURIComponent(path);
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${encodedPath}`;
      const response = await this._fetch(url);
      return response ? response.sha : null;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteFile(path, message = 'Delete file') {
    try {
      const sha = await this.getFileSHA(path);
      if (!sha) {
        throw new Error('File not found');
      }

      // 对路径进行URL编码，确保中文字符正确处理
      const encodedPath = encodeURIComponent(path);
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${encodedPath}`;
      const body = {
        message: message,
        sha: sha
      };

      const response = await this._fetch(url, {
        method: 'DELETE',
        body: JSON.stringify(body)
      });

      return response;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  async uploadImage(seriesId, file) {
    try {
      const fileName = file.name;
      const path = `产品图/${seriesId}/${fileName}`;
      const content = await this.fileToBase64(file);

      return await this.commitFile(path, content, `Upload ${fileName}`);
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  }

  async scanForNewImages(seriesId) {
    try {
      const path = `产品图/${seriesId}`;
      const files = await this.fetchDirectory(path);
      
      return files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      });
    } catch (error) {
      console.error('Scan images error:', error);
      return [];
    }
  }

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  _base64Decode(base64) {
    try {
      const decoded = atob(base64);
      const bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      console.error('Base64 decode error:', error);
      return '';
    }
  }

  _base64Encode(content) {
    try {
      const bytes = new TextEncoder().encode(content);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('Base64 encode error:', error);
      return '';
    }
  }

  async _fetch(url, options = {}) {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      };

      // 详细日志：检查令牌获取过程
      console.log('Getting token for API request...');
      const token = this.getToken();
      console.log('Token obtained:', token ? token.substring(0, 10) + '...' : 'No token');
      
      // 直接使用无授权头的请求，避免401错误
      console.log('Using public access for read-only operations');

      console.log('Making API request to:', url);
      console.log('Request method:', options.method || 'GET');
      console.log('Request headers:', headers);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers));

      this._updateRateLimit(response);

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const responseData = await response.json();
      console.log('API response data received:', responseData);
      return responseData;
    } catch (error) {
      console.error('Fetch error:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      // 网络错误或其他错误，抛出错误
      throw error;
    }
  }

  _updateRateLimit(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (remaining !== null) {
      this.rateLimit.remaining = parseInt(remaining);
    }

    if (reset !== null) {
      this.rateLimit.reset = parseInt(reset) * 1000;
    }
  }

  getRateLimitInfo() {
    const now = Date.now();
    const resetIn = Math.max(0, this.rateLimit.reset - now);
    
    return {
      remaining: this.rateLimit.remaining,
      reset: this.rateLimit.reset,
      resetIn: resetIn,
      resetInMinutes: Math.floor(resetIn / 60000),
      isLimited: this.rateLimit.remaining === 0 && resetIn > 0
    };
  }

  async waitForRateLimitReset() {
    const info = this.getRateLimitInfo();
    
    if (info.isLimited) {
      console.log(`Rate limit reached. Waiting ${info.resetInMinutes} minutes...`);
      await new Promise(resolve => setTimeout(resolve, info.resetIn));
    }
  }
}

const githubAPI = new GitHubAPI();

// 初始化时设置token
if (typeof config !== 'undefined') {
  const token = config.get('github.token');
  if (token) {
    githubAPI.setToken(token);
  }
}

export default githubAPI;