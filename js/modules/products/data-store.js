import cacheManager from '../../core/cache.js';
import githubAPI from '../../core/github-api.js';

class ProductDataStore {
  constructor() {
    this.cacheTTL = 3600000; // 1 hour
    this.products = [];
    this.allProducts = [];
    this.series = [];
    this.seriesNameMap = {};
    this.seriesOrder = [];
  }

  async loadProductsData(productsPath, getImageUrl, processProductData) {
    try {
      // 清除缓存以确保获取最新数据
      cacheManager.clearAll();
      console.log('Cache cleared, loading fresh data from GitHub API');

      // 重新加载系列名称映射和系列列表
      await this.loadSeriesNameMap();
      
      // 从GitHub API获取最新的系列列表
      this.series = await this.fetchSeriesList(productsPath);
      console.log('Loading products from GitHub API');
      
      // 串行请求所有系列的产品数据，避免API限流
      const products = [];
      
      // 限制并发请求数量
      const maxConcurrentRequests = 2;
      const seriesBatches = [];
      
      // 将系列分成批次
      for (let i = 0; i < this.series.length; i += maxConcurrentRequests) {
        seriesBatches.push(this.series.slice(i, i + maxConcurrentRequests));
      }
      
      // 按批次处理系列
      for (const batch of seriesBatches) {
        const batchPromises = batch.map(async (seriesItem) => {
          try {
            // 获取系列产品数据
            const rawData = await this.fetchSeriesProducts(seriesItem);
            // 处理产品数据
            const seriesProducts = processProductData(rawData, getImageUrl);
            // 添加到产品列表
            products.push(...seriesProducts);
            
            // 添加请求间隔，避免API限流
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.warn(`Failed to load products for ${seriesItem.name}:`, error);
          }
        });
        
        // 等待批次请求完成
        await Promise.all(batchPromises);
      }

      console.log('产品数据加载完成，产品数量:', products.length);
      console.log('产品数据示例:', products[0]);
      
      this.products = products;
      this.allProducts = products; // 保存所有产品，用于搜索

      // 缓存数据
      cacheManager.set('products_data', {
        products: this.products,
        series: this.series,
        seriesNameMap: this.seriesNameMap
      }, this.cacheTTL);

      return this.products;
    } catch (error) {
      console.error('Load products data error:', error);
      // 加载本地回退数据
      this._loadLocalFallbackData();
      return this.products;
    }
  }

  async loadSeriesNameMap() {
    try {
      // 清除 config.json 的缓存以确保获取最新数据
      cacheManager.clear('config.json');
      console.log('Config.json cache cleared in loadSeriesNameMap');
      
      // 尝试从配置文件加载系列名称映射和排序信息
      let configFile;
      try {
        configFile = await githubAPI.fetchFile('config.json');
        if (configFile && configFile.seriesNameMap) {
          this.seriesNameMap = configFile.seriesNameMap;
        }
        if (configFile && configFile.seriesOrder) {
          this.seriesOrder = configFile.seriesOrder;
        }
        return;
      } catch (error) {
        console.log('Config file not found, using default series name map');
      }
      
      // 使用默认映射
      this.seriesNameMap = this._getDefaultSeriesNameMap();
    } catch (error) {
      console.error('Load series name map error:', error);
      // 使用默认映射
      this.seriesNameMap = this._getDefaultSeriesNameMap();
    }
  }

  async fetchSeriesList(productsPath) {
    try {
      const series = await githubAPI.fetchDirectory(productsPath);
      return series.filter(item => item.type === 'dir');
    } catch (error) {
      console.error('Failed to fetch series directory:', error);
      return [];
    }
  }

  async fetchSeriesProducts(seriesItem) {
    try {
      // 检查API限流状态
      const rateLimitInfo = githubAPI.getRateLimitInfo();
      if (rateLimitInfo.isLimited) {
        const waitTime = rateLimitInfo.resetInMinutes;
        console.log(`API rate limit reached, waiting ${waitTime} minutes...`);
        await githubAPI.waitForRateLimitReset();
      }

      // 获取系列目录下的所有文件
      const files = await githubAPI.fetchDirectory(seriesItem.path);
      const imageFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      });

      // 获取产品数据文件
      let productsFile;
      try {
        // 只有在缓存不存在时才请求API
        const cachedData = cacheManager.get(`${seriesItem.path}/products.json`);
        if (cachedData) {
          productsFile = cachedData;
          console.log(`Using cached data for ${seriesItem.path}/products.json`);
        } else {
          productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
          // 缓存数据
          cacheManager.set(`${seriesItem.path}/products.json`, productsFile, this.cacheTTL);
        }
      } catch (error) {
        productsFile = { products: {} };
      }

      return {
        seriesId: seriesItem.name,
        imageFiles: imageFiles,
        productsFile: productsFile
      };
    } catch (error) {
      console.warn(`Failed to load products for ${seriesItem.name}:`, error);
      return {
        seriesId: seriesItem.name,
        imageFiles: [],
        productsFile: { products: {} }
      };
    }
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  getProductsBySeries(seriesId) {
    return this.products.filter(product => product.seriesId === seriesId);
  }

  getAllProducts() {
    return this.allProducts;
  }

  getSeries() {
    return this.series;
  }

  getSeriesNameMap() {
    return this.seriesNameMap;
  }

  getSeriesOrder() {
    return this.seriesOrder;
  }

  _loadLocalFallbackData() {
    // 加载本地回退数据
    this.products = [];
    this.allProducts = [];
    this.series = [];
    console.log('Loaded fallback local data');
  }

  _getDefaultSeriesNameMap() {
    return {
      '1-PU系列': 'PU系列',
      '2-真皮系列': '真皮系列',
      '3-短靴系列': '短靴系列',
      '4-乐福系列': '乐福系列',
      '5-春季': '春季系列',
      '6-夏季': '夏季系列',
      '7-秋季': '秋季系列'
    };
  }
}

const productDataStore = new ProductDataStore();
export default productDataStore;