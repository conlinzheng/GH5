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
import siteConfig from './site-config.js';
import uiManager from './ui-manager.js';
import productManager from './product-manager.js';
import modalManagerModule from './modal-manager.js';
import searchManager from './search-manager.js';
import errorManager from './error-manager.js';
import helpers from './helpers.js';

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
    this.siteConfig = new siteConfig(this);
    this.uiManager = new uiManager(this);
    this.productManager = new productManager(this);
    this.modalManager = new modalManagerModule(this);
    this.searchManager = new searchManager(this);
    this.errorManager = new errorManager(this);
    this.helpers = new helpers(this);
    
    this.init();
  }
  
  async init() {
    await this.loadSiteConfig();
    this.loadProductsData();
    this.setupEventListeners();
    
    // 确保i18n初始化
    if (!i18n.isReady) {
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
  
  loadProductsData() {
    return this.productManager.loadProductsData();
  }
  
  renderProducts() {
    this.productManager.renderProducts();
  }
  
  showProductDetails(product) {
    this.modalManager.showProductDetails(product);
  }
  
  closeProductDetails() {
    this.modalManager.closeProductDetails();
  }
  
  changeMainImage(src) {
    this.modalManager.changeMainImage(src);
  }
  
  navigateGallery(direction) {
    this.modalManager.navigateGallery(direction);
  }
  
  openLightbox(src) {
    this.modalManager.openLightbox(src);
  }
  
  closeLightbox(event) {
    this.modalManager.closeLightbox(event);
  }
  
  navigateLightbox(direction) {
    this.modalManager.navigateLightbox(direction);
  }
  
  searchProducts(query) {
    this.searchManager.searchProducts(query);
  }
  
  resetSearch() {
    this.searchManager.resetSearch();
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
    return this.helpers.getImageUrl(seriesId, imageName);
  }
  
  checkProductsPathExists() {
    return this.helpers.checkProductsPathExists();
  }
  
  _handleLanguageChange(lang) {
    this.helpers._handleLanguageChange(lang);
  }
  
  _getDefaultSeriesNameMap() {
    return this.helpers._getDefaultSeriesNameMap();
  }
  
  _updateClearButtonVisibility(value) {
    this.searchManager._updateClearButtonVisibility(value);
  }
}

// 导出实例
const coreApp = new CoreApp();
export default coreApp;