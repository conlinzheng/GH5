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
      // 尝试从本地文件加载配置
      const response = await fetch('config.json');
      if (response.ok) {
        const siteConfig = await response.json();
        this.state.siteConfig = siteConfig;
        // 使用i18n的当前语言设置
        this.state.currentLang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : siteConfig.pageSettings?.defaultLanguage || 'zh';
        this.state.translations = siteConfig.translations || {};
        frontendUI.updateContactModal();
        frontendUI.updatePageTitle();
        frontendUI.updateCarousel();
      } else {
        throw new Error('Failed to load config.json');
      }
    } catch (error) {
      console.error('Load site config error:', error);
      // 使用默认配置
      this.state.siteConfig = {
        siteInfo: {},
        contactForm: { formspreeId: '', enable: true },
        translations: {},
        pageSettings: {
          defaultLanguage: 'zh',
          title: { zh: 'GH5 鞋业', en: 'GH5 Shoes', ko: 'GH5 신발' },
          footerText: { zh: '© 2026 GH5. All rights reserved.', en: '© 2026 GH5. All rights reserved.', ko: '© 2026 GH5. All rights reserved.' },
          loadingText: { zh: '稍等，加载中...', en: 'Loading...', ko: '로딩 중...' },
          searchPlaceholder: { zh: '搜索产品...', en: 'Search products...', ko: '제품 검색...' },
          noProductsText: { zh: '暂无产品', en: 'No products', ko: '제품 없음' },
          productDetailsTitle: { zh: '产品详情', en: 'Product Details', ko: '제품 상세' },
          viewDetailsText: { zh: '查看详情', en: 'View Details', ko: '상세 보기' },
          contactUsText: { zh: '联系我们', en: 'Contact Us', ko: '문의하기' },
          carouselWelcome: { zh: '欢迎来到 GH5', en: 'Welcome to GH5', ko: 'GH5에 오신 것을 환영합니다' },
          carouselDescription: { zh: '探索我们的优质产品', en: 'Explore our quality products', ko: '저희 품질 제품을 탐색하세요' }
        },
        pageAssets: {}
      };
      // 手动设置翻译
      this.state.translations = {
        '联系我们': { zh: '联系我们', en: 'Contact Us', ko: '문의하기' },
        '提交': { zh: '提交', en: 'Submit', ko: '제출' },
        '提交中': { zh: '提交中...', en: 'Submitting...', ko: '제출 중...' },
        '感谢您的留言': { zh: '感谢您的留言！我们会尽快与您联系。', en: 'Thank you for your message! We will contact you soon.', ko: '메시지를 보내주셔서 감사합니다. 곧 연락드리겠습니다.' },
        '关于我们': { zh: '关于我们', en: 'About Us', ko: '회사 소개' },
        '姓名': { zh: '姓名', en: 'Name', ko: '이름' },
        '邮箱': { zh: '邮箱', en: 'Email', ko: '이메일' },
        '留言': { zh: '留言', en: 'Message', ko: '메시지' },
        'GH5鞋业': { zh: 'GH5鞋业', en: 'GH5 Shoes', ko: 'GH5 신발' },
        '专业鞋类制造商': { zh: '专业鞋类制造商', en: 'Professional Shoe Manufacturer', ko: '전문 신발 제조업체' }
      };
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
      // 使用模拟数据
      const series = ['2-真皮系列', '3-短靴系列', '1-PU系列', '4-乐福系列'];
      const seriesNameMap = {
        '2-真皮系列': '真皮系列',
        '3-短靴系列': '短靴系列',
        '1-PU系列': 'PU系列',
        '4-乐福系列': '乐福系列'
      };
      
      // 生成模拟产品数据
      const allProducts = [];
      for (const seriesId of series) {
        for (let i = 1; i <= 3; i++) {
          allProducts.push({
            id: `${seriesId}_${i}`,
            seriesId: seriesId,
            name: {
              zh: `${seriesNameMap[seriesId]} 产品 ${i}`,
              en: `${seriesNameMap[seriesId]} Product ${i}`,
              ko: `${seriesNameMap[seriesId]} 제품 ${i}`
            },
            description: {
              zh: `这是${seriesNameMap[seriesId]}的第${i}个产品`,
              en: `This is the ${i}th product of ${seriesNameMap[seriesId]}`,
              ko: `${seriesNameMap[seriesId]}의 ${i}번째 제품입니다`
            },
            images: [
              `https://via.placeholder.com/300?text=${seriesNameMap[seriesId]}-${i}`,
              `https://via.placeholder.com/300?text=${seriesNameMap[seriesId]}-${i}-2`
            ],
            upper: '真皮',
            inner: '织物',
            sole: '橡胶',
            customizable: '是',
            minOrder: '100',
            price: '¥299'
          });
        }
      }
      
      // 更新状态并渲染
      this.updateProductState(allProducts, seriesNameMap);
      this.renderProductRelatedUI();
    } catch (error) {
      console.error('Load products data error:', error);
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
