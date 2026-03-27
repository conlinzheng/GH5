import githubAPI from '../../core/github-api.js';
import cacheManager from '../../core/cache.js';

class ProductDataFetch {
  constructor() {
    this.cacheTTL = 3600000; // 1 hour
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

  async fetchProductData(seriesId, productName, imageFiles, productsFile) {
    // 按产品名称分组图片
    const productGroups = {};
    imageFiles.forEach(file => {
      const productName = this.extractProductName(file.name);
      if (!productGroups[productName]) {
        productGroups[productName] = [];
      }
      productGroups[productName].push(file.name);
    });

    return productGroups;
  }

  extractProductName(fileName) {
    // 提取产品名称（去除数字和扩展名）
    return fileName.replace(/\s*\(\d+\)\.[^.]+$/, '').replace(/\.[^.]+$/, '');
  }

  isMainImage(fileName) {
    // 判断是否为主图（通常是 (1) 或没有数字的图片）
    return fileName.includes('(1)') || !fileName.match(/\(\d+\)/);
  }
}

const productDataFetch = new ProductDataFetch();
export default productDataFetch;