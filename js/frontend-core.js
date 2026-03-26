class FrontendCore {
  constructor() {
    this.config = {
      cacheTTL: 3600,
      itemsPerPage: 12,
      github: {
        owner: typeof config !== 'undefined' ? config.get('github.owner', 'conlinzheng') : 'conlinzheng',
        repo: typeof config !== 'undefined' ? config.get('github.repo', 'GH5') : 'GH5',
        branch: typeof config !== 'undefined' ? config.get('github.branch', 'main') : 'main',
        productsPath: typeof config !== 'undefined' ? config.get('github.productsPath', '产品图') : '产品图'
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
    this._carouselTimers = {}; // 存储轮播定时器引用
  }
  
  async init() {
    await this.loadSiteConfig();
    this.loadProductsData();
    this.setupEventListeners();
    
    // 确保i18n初始化
    if (typeof i18n !== 'undefined' && (typeof i18n.isReady === 'function' && !i18n.isReady() || !i18n.isReady)) {
      i18n.init();
    }
    
    // 监听语言变化事件
    document.addEventListener('languageChanged', (event) => {
      const newLang = event.detail.language;
      this.state.currentLang = newLang;
      frontendUI.updatePageTitle();
      frontendUI.updateCarousel();
      frontendUI.updateContactModal();
      frontendUI.updateFooter();
      frontendUI.updateFormLabels();
      console.log('Language changed to:', newLang);
    });
  }
  
  getImageUrl(seriesId, imageName) {
    return `https://${this.config.github.owner}.github.io/${this.config.github.repo}/${this.config.github.productsPath}/${seriesId}/${imageName}`;
  }
  
  async loadSiteConfig() {
    try {
      cacheManager.clear('config.json');
      const siteConfig = await githubAPI.fetchFile('config.json');
      this.state.siteConfig = siteConfig;
      // 使用i18n的当前语言设置
      this.state.currentLang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : siteConfig.pageSettings?.defaultLanguage || 'zh';
      this.state.translations = siteConfig.translations || {};
      frontendUI.updateContactModal();
      frontendUI.updatePageTitle();
      frontendUI.updateCarousel();
    } catch (error) {
      errorHandler.handleError(error, errorHandler.errorTypes.API, '加载站点配置失败');
      this.state.siteConfig = {
        siteInfo: {},
        contactForm: { formspreeId: '', enable: true },
        translations: {},
        pageSettings: {},
        pageAssets: {}
      };
      this.state.translations = {};
    }
  }
  
  refreshData() {
    // 清除缓存并重新加载数据
    cacheManager.clearAll();
    console.log('Data refreshed by user');
    this.loadProductsData();
  }
  
  // 加载产品数据
  async loadProductsData() {
    this.state.isLoading = true;
    this.updateLoadingState();
    
    try {
      // 加载系列数据
      const series = await this.loadSeriesData();
      
      // 加载每个系列的产品
      const { allProducts, seriesNameMap } = await this.loadSeriesProducts(series);
      
      // 更新状态并渲染
      this.updateProductState(allProducts, seriesNameMap);
      this.renderProductRelatedUI();
    } catch (error) {
      errorHandler.handleError(error, errorHandler.errorTypes.API, '加载产品数据失败，请稍后重试');
    } finally {
      this.state.isLoading = false;
      this.updateLoadingState();
    }
  }
  
  // 加载系列数据
  async loadSeriesData() {
    const series = await githubAPI.fetchDirectory(this.config.github.productsPath);
    this.state.series = series
      .filter(item => item.type === 'dir')
      .map(item => item.name);
    return this.state.series;
  }
  
  // 加载系列产品数据
  async loadSeriesProducts(series) {
    const allProducts = [];
    const seriesNameMap = {};
    
    for (const seriesId of series) {
      await this.loadSingleSeriesProducts(seriesId, allProducts, seriesNameMap);
    }
    
    return { allProducts, seriesNameMap };
  }
  
  // 加载单个系列的产品数据
  async loadSingleSeriesProducts(seriesId, allProducts, seriesNameMap) {
    try {
      const productsData = await githubAPI.fetchFile(`${this.config.github.productsPath}/${seriesId}/products.json`);
      
      // 保存系列名称映射
      if (productsData.seriesName) {
        seriesNameMap[seriesId] = productsData.seriesName;
      }
      
      // 处理产品数据
      if (Array.isArray(productsData.products)) {
        const productsWithSeries = productsData.products.map(product => ({
          ...product,
          seriesId,
          id: `${seriesId}_${product.id || Date.now() + Math.random().toString(36).substr(2, 9)}`
        }));
        allProducts.push(...productsWithSeries);
      }
    } catch (error) {
      console.error(`Error loading products for series ${seriesId}:`, error);
      // 这里不显示错误通知，因为单个系列加载失败不应该影响整个应用
    }
  }
  
  // 更新产品状态
  updateProductState(allProducts, seriesNameMap) {
    this.state.allProducts = allProducts;
    this.state.products = allProducts;
    this.state.seriesNameMap = seriesNameMap;
    this.calculateTotalPages();
  }
  
  // 渲染产品相关 UI
  renderProductRelatedUI() {
    frontendUI.renderProducts();
    this.renderSeriesFilters();
    this.renderPagination();
  }
  
  // 计算总页数
  calculateTotalPages() {
    this.state.totalPages = Math.ceil(this.state.products.length / this.config.itemsPerPage);
    this.state.currentPage = Math.min(this.state.currentPage, this.state.totalPages);
  }
  
  // 更新加载状态
  updateLoadingState() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = this.state.isLoading ? 'flex' : 'none';
    }
  }
  
  // 显示错误信息
  showError(message) {
    errorHandler.handleError(new Error(message), errorHandler.errorTypes.UNKNOWN, message);
  }
  
  // 渲染系列筛选器
  renderSeriesFilters() {
    const filterContainer = document.getElementById('series-filters');
    if (!filterContainer) return;
    
    let html = '<button class="series-filter active" data-series="all">全部</button>';
    
    this.state.series.forEach(seriesId => {
      const seriesName = this.state.seriesNameMap[seriesId] || seriesId;
      html += `<button class="series-filter" data-series="${seriesId}">${seriesName}</button>`;
    });
    
    filterContainer.innerHTML = html;
    
    // 重新绑定事件
    filterContainer.querySelectorAll('.series-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seriesId = e.target.dataset.series;
        this.filterBySeries(seriesId);
      });
    });
  }
  
  // 按系列筛选产品
  filterBySeries(seriesId) {
    if (seriesId === 'all') {
      this.state.products = this.state.allProducts;
      this.state.selectedSeries = null;
    } else {
      this.state.products = this.state.allProducts.filter(product => product.seriesId === seriesId);
      this.state.selectedSeries = seriesId;
    }
    
    this.state.currentPage = 1;
    this.calculateTotalPages();
    frontendUI.renderProducts();
    this.renderPagination();
    
    // 更新筛选按钮状态
    document.querySelectorAll('.series-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.series === seriesId);
    });
  }
  
  // 分页导航
  goToPage(page) {
    if (page < 1 || page > this.state.totalPages) return;
    
    this.state.currentPage = page;
    frontendUI.renderProducts();
    this.renderPagination();
  }
  
  // 渲染分页
  renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    if (this.state.totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }
    
    paginationContainer.style.display = 'flex';
    
    let html = '';
    
    // 上一页按钮
    if (this.state.currentPage > 1) {
      html += `<button class="pagination-btn" data-page="${this.state.currentPage - 1}">上一页</button>`;
    }
    
    // 页码按钮
    for (let i = 1; i <= this.state.totalPages; i++) {
      html += `<button class="pagination-btn ${i === this.state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // 下一页按钮
    if (this.state.currentPage < this.state.totalPages) {
      html += `<button class="pagination-btn" data-page="${this.state.currentPage + 1}">下一页</button>`;
    }
    
    paginationContainer.innerHTML = html;
    
    // 重新绑定事件
    paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      });
    });
  }
}

const frontendCore = new FrontendCore();
