import config from '../../core/config.js';
import githubAPI from '../../core/github-api.js';
import cacheManager from '../../core/cache.js';
import errorHandler from '../../core/error.js';
import i18n from '../../core/i18n.js';
import productDataStore from '../products/data-store.js';
import productDataProcess from '../products/data-process.js';
import productRender from '../products/render.js';
import productSearch from '../products/search.js';
import modalManager from '../ui/modal.js';
import browseHistory from '../ui/history.js';
import productEvents from '../ui/events/products.js';
import searchEvents from '../ui/events/search.js';
import modalEvents from '../ui/events/modal.js';
import formEvents from '../ui/events/form.js';
import SiteConfig from './site-config.js';
import UIManager from './ui-manager.js';

class CoreApp {
  constructor() {
    this.config = {
      cacheTTL: 3600,
      itemsPerPage: 12,
      github: {
        owner: config.get('github.owner', 'conlinzheng'),
        repo: config.get('github.repo', 'GH5'),
        branch: config.get('github.branch', 'main'),
        productsPath: config.get('github.productsPath', '产品图'),
        token: config.get('github.token')
      }
    };
    
    this.state = {
      products: [],
      allProducts: [],
      series: [],
      seriesNameMap: {},
      seriesOrder: [],
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      selectedSeries: null,
      siteConfig: null,
      currentLang: 'zh',
      translations: {}
    };
    
    this.currentLightboxImages = [];
    this.currentLightboxIndex = 0;
    
    // 初始化模块
    this.siteConfig = new SiteConfig(this);
    this.uiManager = new UIManager(this);
    
    // 异步初始化，捕获异常
    (async () => {
      try {
        await this.init();
      } catch (error) {
        console.error('Init error:', error);
        // 确保加载状态被更新
        this.state.isLoading = false;
        this.updateLoadingState();
      }
    })();
  }
  
  async init() {
    await this.loadSiteConfig();
    await this.loadProductsData();
    this.setupEventListeners();
    
    // 确保i18n初始化
    if (!i18n.isReadyState()) {
      i18n.init();
    }
    
    // 监听语言变化事件
    document.addEventListener('languageChanged', (event) => {
      const newLang = event.detail.language;
      this.state.currentLang = newLang;
      this.updatePageTitle();
      this.updateCarousel();
      this.updateContactModal();
      this.updateFooter();
      this.updateFormLabels();
      console.log('Language changed to:', newLang);
    });
    
    // 监听浏览历史项目点击事件
    document.addEventListener('viewHistoryItem', (event) => {
      const productId = event.detail.productId;
      this.viewHistoryProduct(productId);
    });
  }
  
  setupEventListeners() {
    // 产品事件
    productEvents.setupProductEventListeners();
    // 搜索事件
    searchEvents.setupSearchEventListeners();
    // 模态框事件
    modalEvents.setupModalEventListeners();
    // 表单事件
    formEvents.setupFormEventListeners();
  }
  
  async loadSiteConfig() {
    return this.siteConfig.loadSiteConfig();
  }
  
  loadLocalProductsData() {
    // 本地产品数据，作为 GitHub API 访问失败的备选
    const localData = [
      {
        id: 'product1.png',
        seriesId: '1-PU系列',
        name: 'PU系列产品1',
        description: '这是一款高品质的PU系列产品，具有良好的耐磨性和舒适度。',
        price: '¥199',
        materials: {
          upper: 'PU超纤',
          lining: '网布',
          sole: '橡胶'
        },
        upperMaterial: 'PU超纤',
        innerMaterial: '网布',
        soleMaterial: '橡胶',
        image: 'product1.png',
        tags: ['PU', '舒适', '耐磨']
      },
      {
        id: 'product2.png',
        seriesId: '1-PU系列',
        name: 'PU系列产品2',
        description: '这款PU系列产品设计时尚，适合日常穿着。',
        price: '¥299',
        materials: {
          upper: 'PU超纤',
          lining: '皮革',
          sole: 'EVA'
        },
        upperMaterial: 'PU超纤',
        innerMaterial: '皮革',
        soleMaterial: 'EVA',
        image: 'product2.png',
        tags: ['PU', '时尚', '轻便']
      },
      {
        id: 'product3.png',
        seriesId: '2-真皮系列',
        name: '真皮系列产品1',
        description: '采用优质真皮制作，手感柔软，透气性好。',
        price: '¥399',
        materials: {
          upper: '头层牛皮',
          lining: '羊皮',
          sole: '橡胶'
        },
        upperMaterial: '头层牛皮',
        innerMaterial: '羊皮',
        soleMaterial: '橡胶',
        image: 'product3.png',
        tags: ['真皮', '高端', '舒适']
      },
      {
        id: 'product4.png',
        seriesId: '2-真皮系列',
        name: '真皮系列产品2',
        description: '经典真皮款式，适合正式场合穿着。',
        price: '¥499',
        materials: {
          upper: '头层牛皮',
          lining: '真皮',
          sole: '真皮'
        },
        upperMaterial: '头层牛皮',
        innerMaterial: '真皮',
        soleMaterial: '真皮',
        image: 'product4.png',
        tags: ['真皮', '经典', '正式']
      },
      {
        id: 'product5.png',
        seriesId: '3-短靴系列',
        name: '短靴系列产品1',
        description: '时尚短靴，保暖舒适，适合秋冬季节。',
        price: '¥599',
        materials: {
          upper: 'PU超纤',
          lining: '毛绒',
          sole: '橡胶'
        },
        upperMaterial: 'PU超纤',
        innerMaterial: '毛绒',
        soleMaterial: '橡胶',
        image: 'product5.png',
        tags: ['短靴', '保暖', '时尚']
      },
      {
        id: 'product6.png',
        seriesId: '3-短靴系列',
        name: '短靴系列产品2',
        description: '高品质短靴，防水防滑，适合户外穿着。',
        price: '¥699',
        materials: {
          upper: '真皮',
          lining: '保暖棉',
          sole: '防滑橡胶'
        },
        upperMaterial: '真皮',
        innerMaterial: '保暖棉',
        soleMaterial: '防滑橡胶',
        image: 'product6.png',
        tags: ['短靴', '防水', '户外']
      }
    ];
    
    return localData;
  }
  
  async loadProductsData() {
    this.state.isLoading = true;
    this.updateLoadingState();
    
    try {
      // 清除缓存，确保获取最新数据
      cacheManager.clearAll();
      console.log('Cache cleared before loading products data');
      
      // 加载系列数据
      const series = await githubAPI.fetchDirectory(this.config.github.productsPath);
      this.state.series = series.filter(item => item.type === 'dir');
      
      // 加载每个系列的产品
      const products = [];
      const seriesNameMap = {};
      const seriesOrder = [];
      
      for (const seriesItem of this.state.series) {
        try {
          const productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
          if (productsFile) {
            // 构建系列名称映射
            if (productsFile.displayName) {
              seriesNameMap[seriesItem.name] = productsFile.displayName.zh || seriesItem.name;
            } else {
              seriesNameMap[seriesItem.name] = seriesItem.name;
            }
            
            // 添加到系列顺序
            seriesOrder.push(seriesItem.name);
            
            // 加载产品数据
            if (productsFile.products) {
              Object.entries(productsFile.products).forEach(([fileName, productData]) => {
                const product = {
                  id: fileName,
                  seriesId: seriesItem.name,
                  name: productData.name?.zh || productData.name || fileName,
                  description: productData.description?.zh || productData.description || '',
                  price: productData.price || '',
                  materials: productData.materials || {},
                  upperMaterial: productData.materials?.upper || '',
                  innerMaterial: productData.materials?.lining || '',
                  soleMaterial: productData.materials?.sole || '',
                  image: fileName,
                  tags: productData.tags || [],
                  customizable: productData.customizable || false,
                  minimumOrder: productData.minimumOrder || 1
                };
                products.push(product);
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to load products for ${seriesItem.name}:`, error);
        }
      }
      
      // 更新系列名称映射和顺序
      this.state.seriesNameMap = seriesNameMap;
      this.state.seriesOrder = seriesOrder;
      
      if (products.length > 0) {
        console.log('Loaded products from GitHub API');
        this.state.allProducts = products;
        this.state.products = products;
        this.calculatePagination();
        try {
          this.renderProducts();
        } catch (renderError) {
          console.error('Render products error:', renderError);
        }
      } else {
        // 尝试从本地加载数据作为备选
        const localProducts = this.loadLocalProductsData();
        if (localProducts && localProducts.length > 0) {
          console.log('Loaded products from local data as fallback');
          this.state.allProducts = localProducts;
          this.state.products = localProducts;
          this.calculatePagination();
          try {
            this.renderProducts();
          } catch (renderError) {
            console.error('Render products error:', renderError);
          }
        } else {
          errorHandler.handleError('加载产品数据失败');
        }
      }
    } catch (error) {
      console.error('Load products data error:', error);
      
      // 检查是否是API认证错误
      if (error.status === 401 || error.status === 403) {
        // 显示API密钥输入弹窗
        const token = await this.promptForApiToken();
        if (token) {
          // 保存API密钥
          config.saveApiKey(token);
          githubAPI.setToken(token);
          // 重新尝试加载数据
          return this.loadProductsData();
        }
      }
      
      // 尝试从本地加载数据作为备选
      const localProducts = this.loadLocalProductsData();
      if (localProducts && localProducts.length > 0) {
        console.log('Loaded products from local data as fallback');
        this.state.allProducts = localProducts;
        this.state.products = localProducts;
        this.calculatePagination();
        try {
          this.renderProducts();
        } catch (renderError) {
          console.error('Render products error:', renderError);
        }
      } else {
        errorHandler.handleError('加载产品数据失败');
      }
    } finally {
      this.state.isLoading = false;
      this.updateLoadingState();
    }
  }
  
  // 显示API密钥输入弹窗
  promptForApiToken() {
    return new Promise((resolve) => {
      // 创建弹窗
      const dialog = document.createElement('div');
      dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `;
      
      const dialogContent = document.createElement('div');
      dialogContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 400px;
      `;
      
      dialogContent.innerHTML = `
        <h3>设置 GitHub API 密钥</h3>
        <p style="margin-bottom: 15px; color: #666; font-size: 14px;">GitHub API 认证失败，请输入有效的 API 密钥以继续</p>
        <div style="margin-bottom: 15px;">
          <label for="api-token-input" style="display: block; margin-bottom: 5px; font-weight: 500;">API 密钥</label>
          <input type="password" id="api-token-input" style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="cancel-token-btn" style="padding: 8px 16px; border: 1px solid #ced4da; border-radius: 4px; background-color: white; cursor: pointer;">取消</button>
          <button id="save-token-btn" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #007bff; color: white; cursor: pointer;">保存</button>
        </div>
      `;
      
      dialog.appendChild(dialogContent);
      document.body.appendChild(dialog);
      
      // 取消按钮事件
      const cancelBtn = dialogContent.querySelector('#cancel-token-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          dialog.remove();
          resolve(null);
        });
      }
      
      // 保存按钮事件
      const saveBtn = dialogContent.querySelector('#save-token-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const tokenInput = dialogContent.querySelector('#api-token-input');
          if (tokenInput) {
            const token = tokenInput.value;
            dialog.remove();
            resolve(token);
          } else {
            resolve(null);
          }
        });
      }
      
      // 点击背景关闭弹窗
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          dialog.remove();
          resolve(null);
        }
      });
      
      // 按ESC键关闭弹窗
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          dialog.remove();
          resolve(null);
        }
      });
    });
  }
  
  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    // 过滤产品
    let filteredProducts = this.state.products;
    if (this.state.selectedSeries) {
      filteredProducts = filteredProducts.filter(p => p.seriesId === this.state.selectedSeries);
    }
    
    // 分页
    const start = (this.state.currentPage - 1) * this.config.itemsPerPage;
    const end = start + this.config.itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);
    
    // 为每个产品添加 images 属性，确保至少有一个默认图片
    const productsWithImages = paginatedProducts.map(product => {
      // 为产品添加 images 属性，使用产品的 image 字段作为默认图片
      const imageUrl = this.getImageUrl(product.seriesId, product.image);
      return {
        ...product,
        images: [imageUrl]
      };
    });
    
    // 获取系列名称映射
    const seriesNameMap = this.state.seriesNameMap && Object.keys(this.state.seriesNameMap).length > 0 
      ? this.state.seriesNameMap 
      : this._getDefaultSeriesNameMap();
    
    // 获取系列顺序
    const seriesOrder = this.state.seriesOrder && this.state.seriesOrder.length > 0 
      ? this.state.seriesOrder 
      : Object.keys(seriesNameMap);
    
    // 调用产品渲染方法，传递所有必要的参数
    productRender.renderProducts(
      productsWithImages,
      seriesNameMap,
      seriesOrder,
      this.state.selectedSeries,
      this.getProductTranslation.bind(this)
    );
    this.renderPagination();
  }
  
  renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 1; i <= this.state.totalPages; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.className = `pagination-btn ${i === this.state.currentPage ? 'active' : ''}`;
      button.onclick = () => this.goToPage(i);
      container.appendChild(button);
    }
  }
  
  calculatePagination() {
    this.state.totalPages = Math.ceil(this.state.products.length / this.config.itemsPerPage);
  }
  
  showProductDetails(product) {
    modalManager.showProductDetails(product, this.state.seriesNameMap, this.getProductTranslation.bind(this));
  }
  
  closeProductDetails() {
    modalManager.closeProductDetails();
  }
  
  changeMainImage(src) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
      mainImage.src = src;
    }
  }
  
  navigateGallery(direction) {
    const gallery = document.getElementById('modal-gallery');
    if (!gallery) return;
    
    const scrollAmount = 200 * direction;
    gallery.scrollLeft += scrollAmount;
  }
  
  openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    if (!lightbox || !lightboxImage) return;
    
    lightboxImage.src = src;
    lightbox.style.display = 'flex';
  }
  
  closeLightbox(event) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    
    if (event.target === lightbox || event.target.classList.contains('close-lightbox')) {
      lightbox.style.display = 'none';
    }
  }
  
  navigateLightbox(direction) {
    // 简单实现，实际项目中需要根据当前图片集合导航
    console.log('Navigate lightbox:', direction);
  }
  
  searchProducts(query) {
    if (!query) {
      this.state.products = this.state.allProducts;
    } else {
      const lowerQuery = query.toLowerCase();
      this.state.products = this.state.allProducts.filter(product => {
        const name = (product.name?.zh || product.name || '').toLowerCase();
        const description = (product.description?.zh || product.description || '').toLowerCase();
        const tags = (product.tags || []).join(' ').toLowerCase();
        return name.includes(lowerQuery) || description.includes(lowerQuery) || tags.includes(lowerQuery);
      });
    }
    this.state.currentPage = 1;
    this.calculatePagination();
    this.renderProducts();
  }
  
  resetSearch() {
    this.state.products = this.state.allProducts;
    this.state.currentPage = 1;
    this.calculatePagination();
    this.renderProducts();
  }
  
  filterBySeries(seriesId) {
    this.state.selectedSeries = seriesId;
    this.state.currentPage = 1;
    this.renderProducts();
  }
  
  goToPage(page) {
    if (page < 1 || page > this.state.totalPages) return;
    this.state.currentPage = page;
    this.renderProducts();
  }
  
  viewHistoryProduct(productId) {
    // 查找产品
    const product = this.state.allProducts.find(p => p.id === productId);
    if (product) {
      // 显示产品详情
      this.showProductDetails(product);
    }
  }
  
  getProductTranslation(zhText, fieldType = 'name') {
    if (!zhText || this.state.currentLang === 'zh') {
      return zhText;
    }
    
    const translations = this.state.translations;
    if (!translations || Object.keys(translations).length === 0) {
      return zhText;
    }
    
    for (const [key, value] of Object.entries(translations)) {
      if (value.zh === zhText) {
        return value[this.state.currentLang] || zhText;
      }
    }
    
    return zhText;
  }
  
  updateLightboxCounter() {
    const counter = document.getElementById('lightbox-counter');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // 如果只有一张图片，隐藏计数器和导航按钮
    if (this.currentLightboxImages.length <= 1) {
      if (counter) counter.textContent = '';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    } else {
      // 多张图片，显示计数器和导航按钮
      if (counter) {
        counter.textContent = `${this.currentLightboxIndex + 1} / ${this.currentLightboxImages.length}`;
      }
      if (prevBtn) prevBtn.style.display = 'block';
      if (nextBtn) nextBtn.style.display = 'block';
    }
  }
  
  updateLoadingState() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = this.state.isLoading ? 'flex' : 'none';
    }
  }
  
  refreshData() {
    // 清除缓存并重新加载数据
    cacheManager.clearAll();
    console.log('Data refreshed by user');
    this.loadProductsData();
  }
  
  // 委托给其他模块的方法
  updatePageTitle() {
    this.uiManager.updatePageTitle();
  }
  
  updateCarousel() {
    this.uiManager.updateCarousel();
  }
  
  updateContactModal() {
    this.uiManager.updateContactModal();
  }
  
  updateFooter() {
    this.uiManager.updateFooter();
  }
  
  updateFormLabels() {
    this.uiManager.updateFormLabels();
  }
  
  openContactModal() {
    this.uiManager.openContactModal();
  }
  
  closeContactModal() {
    this.uiManager.closeContactModal();
  }
  
  getFormspreeUrl() {
    return this.uiManager.getFormspreeUrl();
  }
  
  getImageUrl(seriesId, imageName) {
    // 使用本地路径来加载图片
    const productsPath = this.config.github.productsPath;
    return `${productsPath}/${seriesId}/${imageName}`;
  }
  
  async checkProductsPathExists() {
    try {
      const series = await githubAPI.fetchDirectory(this.config.github.productsPath);
      return series.length > 0;
    } catch (error) {
      return false;
    }
  }
  
  _handleLanguageChange(lang) {
    this.state.currentLang = lang;
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }
  
  _getDefaultSeriesNameMap() {
    return {
      '1-PU系列': '1-PU系列',
      '2-真皮系列': '2-真皮系列',
      '3-短靴系列': '3-短靴系列',
      '4-乐福系列': '4-乐福系列',
      '5-春季': '5-春季',
      '6-夏季': '6-夏季',
      '7-秋季': '7-秋季'
    };
  }
  
  _updateClearButtonVisibility(value) {
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.style.display = value ? 'block' : 'none';
    }
  }
}

// 导出实例
const coreApp = new CoreApp();
export default coreApp;