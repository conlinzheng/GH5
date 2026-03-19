class Frontend {
  constructor() {
    this.config = {
      owner: config.get('github.owner'),
      repo: config.get('github.repo'),
      productsPath: config.get('github.productsPath'),
      cacheTTL: config.get('cache.defaultTTL')
    };

    this.state = {
      products: [],
      series: [],
      seriesNameMap: {},
      currentLanguage: config.get('i18n.defaultLang'),
      isLoading: false
    };

    this.featureSettings = {
      'toggle-backtotop': true,
      'toggle-imagezoom': true,
      'toggle-search': true,
      'toggle-compare': true,
      'toggle-history': true,
      'toggle-filter': true,
      'toggle-layout': true,
      'toggle-share': true,
      'toggle-theme': true,
      'toggle-language': true,
      'toggle-contact': true
    };
  }

  loadFeatureSettings() {
    try {
      const settings = cacheManager.get('site_features');
      if (settings) {
        this.featureSettings = { ...this.featureSettings, ...settings };
      }
    } catch (error) {
      console.error('Load feature settings error:', error);
    }
  }

  isFeatureEnabled(key) {
    return this.featureSettings[key] !== false;
  }

  async init() {
    try {
      console.log('Initializing GH5 Frontend...');

      this.loadFeatureSettings();
      i18n.init();

      this._setupEventListeners();
      await this.loadProductsData();
      this._updateLanguageDisplay();

      console.log('GH5 Frontend initialized successfully');
    } catch (error) {
      console.error('Frontend init error:', error);
      this._showError('初始化失败，请刷新页面重试');
    }
  }

  _setupEventListeners() {
    this._initCarousel();
    this._initSearch();
    this._initContactForm();
    this._initLanguageToggle();
    this._initModal();

    document.addEventListener('languageChanged', (event) => {
      this._handleLanguageChange(event.detail.language);
    });

    window.addEventListener('scroll', () => {
      this._handleScroll();
    });
  }

  async loadProductsData() {
    try {
      this.state.isLoading = true;
      this._showLoading(true);

      // 无论是否有缓存，都重新加载系列名称映射和系列列表
      await this.loadSeriesNameMap();
      
      try {
        // 从GitHub API获取最新的系列列表
        const series = await githubAPI.fetchDirectory(this.config.productsPath);
        this.state.series = series.filter(item => item.type === 'dir');
        
        // 检查是否有缓存数据
        const cachedData = cacheManager.get('products_data');
        if (cachedData) {
          console.log('Loading products from cache');
          this.state.products = cachedData.products || [];
          
          // 检查缓存中的产品数据是否仍然有效（系列ID是否存在）
          const validProducts = this.state.products.filter(product => {
            return this.state.series.some(seriesItem => seriesItem.name === product.seriesId);
          });
          this.state.products = validProducts;
        } else {
          // 没有缓存，从API加载产品数据
          console.log('Loading products from GitHub API');
          
          // 并行请求所有系列的产品数据
          const products = [];
          const productPromises = this.state.series.map(async (seriesItem) => {
            try {
              const productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
              if (productsFile && productsFile.products) {
                const productEntries = Object.entries(productsFile.products);
                productEntries.forEach(([fileName, productData]) => {
                  const product = {
                    id: fileName,
                    seriesId: seriesItem.name,
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    materials: productData.materials,
                    specs: productData.materials,
                    images: [`产品图/${seriesItem.name}/${fileName}`]
                  };
                  products.push(product);
                });
              }
            } catch (error) {
              if (typeof errorHandler !== 'undefined') {
                errorHandler.handleApiError(error);
              } else {
                console.warn(`Failed to load products for ${seriesItem.name}:`, error);
              }
            }
          });
          
          // 等待所有请求完成
          await Promise.all(productPromises);

          this.state.products = products;

          // 缓存数据
          cacheManager.set('products_data', {
            products: this.state.products,
            series: this.state.series,
            seriesNameMap: this.state.seriesNameMap
          }, this.config.cacheTTL);
        }
      } catch (apiError) {
        if (typeof errorHandler !== 'undefined') {
          errorHandler.handleApiError(apiError);
        } else {
          console.error('GitHub API error:', apiError);
        }
        console.log('Using fallback local data');
        this._loadLocalFallbackData();
      }

      this.renderProducts();
    } catch (error) {
      if (typeof errorHandler !== 'undefined') {
        errorHandler.handleError(error);
      } else {
        console.error('Load products data error:', error);
      }
      this._showError('加载产品数据失败，请稍后重试');
    } finally {
      this.state.isLoading = false;
      this._showLoading(false);
    }
  }
  
  async loadSeriesNameMap() {
    try {
      // 尝试从配置文件加载系列名称映射
      let configFile;
      try {
        configFile = await githubAPI.fetchFile('config.json');
        if (configFile && configFile.seriesNameMap) {
          this.state.seriesNameMap = configFile.seriesNameMap;
        }
      } catch (error) {
        // 如果配置文件不存在，使用默认映射
        this.state.seriesNameMap = {
          '1-PU系列': 'PU超纤',
          '2-真皮系列': '真皮系列',
          '3-短靴系列': '短靴系列',
          '4-乐福系列': '乐福系列',
          '5-春季': '春季系列',
          '6-夏季': '夏季系列',
          '7-秋季': '秋季系列'
        };
      }
    } catch (error) {
      console.error('Load series name map error:', error);
      // 使用默认映射
      this.state.seriesNameMap = {
        '1-PU系列': 'PU超纤',
        '2-真皮系列': '真皮系列',
        '3-短靴系列': '短靴系列',
        '4-乐福系列': '乐福系列',
        '5-春季': '春季系列',
        '6-夏季': '夏季系列',
        '7-秋季': '秋季系列'
      };
    }
  }

  _loadLocalFallbackData() {
    const fallbackData = {
      series: [
        { name: '1-PU系列', type: 'dir', path: '产品图/1-PU系列', size: 0 },
        { name: '2-真皮系列', type: 'dir', path: '产品图/2-真皮系列', size: 0 },
        { name: '3-短靴系列', type: 'dir', path: '产品图/3-短靴系列', size: 0 },
        { name: '4-乐福系列', type: 'dir', path: '产品图/4-乐福系列', size: 0 },
        { name: '5-春季', type: 'dir', path: '产品图/5-春季', size: 0 },
        { name: '6-夏季', type: 'dir', path: '产品图/6-夏季', size: 0 },
        { name: '7-秋季', type: 'dir', path: '产品图/7-秋季', size: 0 }
      ],
      products: [
        {
          id: '中文 (1).png',
          seriesId: '1-PU系列',
          name: { zh: '1', en: '1', ko: '1' },
          description: { zh: '2', en: '2', ko: '2' },
          price: '3',
          materials: { upper: '', lining: '', sole: '' },
          specs: { upper: '', lining: '', sole: '' },
          images: ['产品图/1-PU系列/中文 (1).png']
        },
        {
          id: '中文 (2).png',
          seriesId: '1-PU系列',
          name: { zh: '中文', en: 'Chinese', ko: '중국어' },
          description: { zh: '中文 - 高品质产品', en: 'Chinese - High quality product', ko: '중국어 - 고품질 제품' },
          price: '',
          materials: { upper: '', lining: '', sole: '' },
          specs: { upper: '', lining: '', sole: '' },
          images: ['产品图/1-PU系列/中文 (2).png']
        },
        {
          id: '勃肯1 (1).jpg',
          seriesId: '2-真皮系列',
          name: { zh: '勃肯1', en: 'Birkenstock 1', ko: '버켄스톡 1' },
          description: { zh: '勃肯1 - 高品质产品', en: 'Birkenstock 1 - High quality product', ko: '버켄스톡 1 - 고품질 제품' },
          price: '',
          materials: { upper: '', lining: '', sole: '' },
          specs: { upper: '', lining: '', sole: '' },
          images: ['产品图/2-真皮系列/勃肯1 (1).jpg']
        }
      ]
    };

    this.state.series = fallbackData.series;
    this.state.products = fallbackData.products;

    cacheManager.set('products_data', fallbackData, this.config.cacheTTL);
  }

  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';

    if (this.state.products.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>${i18n.t('products.noResults')}</p>
        </div>
      `;
      return;
    }

    this.state.series.forEach(seriesItem => {
      const seriesElement = this._createSeriesElement(seriesItem);
      container.appendChild(seriesElement);
    });
  }

  _createSeriesElement(seriesItem) {
    const seriesDiv = document.createElement('div');
    seriesDiv.className = 'product-series';
    seriesDiv.dataset.seriesId = seriesItem.name;

    const seriesTitle = document.createElement('h3');
    seriesTitle.className = 'series-title';
    // 使用系列名称映射显示自定义名称
    const displayName = this.state.seriesNameMap[seriesItem.name] || seriesItem.name;
    seriesTitle.textContent = displayName;
    seriesDiv.appendChild(seriesTitle);

    const productsGrid = document.createElement('div');
    productsGrid.className = 'products-grid';

    const seriesProducts = this.state.products.filter(
      product => product.seriesId === seriesItem.name
    );

    seriesProducts.forEach(product => {
      const productCard = this._createProductCard(product, seriesItem.name);
      productsGrid.appendChild(productCard);
    });

    seriesDiv.appendChild(productsGrid);
    return seriesDiv;
  }

  _createProductCard(product, seriesId) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    card.dataset.seriesId = seriesId;

    const imageUrl = product.images && product.images.length > 0 
      ? product.images[0] 
      : '';

    card.innerHTML = `
      <div class="product-image">
        <img src="${imageUrl}" alt="${i18n.getLocalizedField(product, 'name')}" loading="lazy">
      </div>
      <div class="product-info">
        <h4 class="product-name">${i18n.getLocalizedField(product, 'name')}</h4>
        <p class="product-description">${i18n.getLocalizedField(product, 'description')}</p>
        <p class="product-price">${product.price || ''}</p>
        <button class="btn btn-view-details" data-product-id="${product.id}" data-series-id="${seriesId}">
          ${i18n.t('products.viewDetails')}
        </button>
      </div>
    `;

    const viewBtn = card.querySelector('.btn-view-details');
    viewBtn.addEventListener('click', () => {
      this._openProductModal(product, seriesId);
    });

    return card;
  }

  _openProductModal(product, seriesId) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) return;

    const images = product.images || [];
    const currentImage = images.length > 0 ? images[0] : '';

    modalBody.innerHTML = `
      <div class="product-detail">
        <div class="product-detail-images">
          ${images.length > 0 ? `
            <img src="${currentImage}" alt="${i18n.getLocalizedField(product, 'name')}" class="detail-image">
          ` : '<p class="no-image">暂无图片</p>'}
        </div>
        <div class="product-detail-info">
          <h2 class="detail-name">${i18n.getLocalizedField(product, 'name')}</h2>
          <p class="detail-description">${i18n.getLocalizedField(product, 'description')}</p>
          <p class="detail-price">${product.price || ''}</p>
          ${product.specs ? this._renderSpecs(product.specs) : ''}
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  _renderSpecs(specs) {
    return `
      <div class="product-specs">
        <h4>产品规格</h4>
        <ul>
          ${Object.entries(specs).map(([key, value]) => `
            <li><strong>${key}:</strong> ${value}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  _initModal() {
    const modal = document.getElementById('product-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    if (!modal) return;

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    };

    if (overlay) {
      overlay.addEventListener('click', closeModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  _initCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    let currentSlide = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    
    if (slides.length === 0) return;

    const showSlide = (index) => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
  }

  _initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    if (!searchInput || !searchBtn) return;

    const performSearch = () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        this.renderProducts();
        return;
      }

      const filteredProducts = this.state.products.filter(product => {
        const name = i18n.getLocalizedField(product, 'name').toLowerCase();
        const description = i18n.getLocalizedField(product, 'description').toLowerCase();
        return name.includes(query) || description.includes(query);
      });

      this._renderSearchResults(filteredProducts);
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        performSearch();
      }
    });
  }

  _renderSearchResults(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <p>${i18n.t('products.noResults')}</p>
        </div>
      `;
      return;
    }

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'search-results';

    products.forEach(product => {
      const seriesId = product.seriesId || 'default';
      const productCard = this._createProductCard(product, seriesId);
      resultsDiv.appendChild(productCard);
    });

    container.appendChild(resultsDiv);
  }

  _initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        console.log('Form submitted:', data);
        alert(i18n.t('contact.success'));
        form.reset();
      } catch (error) {
        console.error('Form submission error:', error);
        alert(i18n.t('contact.error'));
      }
    });
  }

  _initLanguageToggle() {
    const langBtn = document.getElementById('language-toggle');
    if (!langBtn) return;

    langBtn.addEventListener('click', () => {
      const currentLang = i18n.getCurrentLanguage();
      const supportedLangs = i18n.getSupportedLanguages();
      const currentIndex = supportedLangs.indexOf(currentLang);
      const nextIndex = (currentIndex + 1) % supportedLangs.length;
      const nextLang = supportedLangs[nextIndex];

      i18n.switchLanguage(nextLang);
    });
  }

  _handleLanguageChange(lang) {
    this.state.currentLanguage = lang;
    this._updateLanguageDisplay();
    this.renderProducts();
  }

  _updateLanguageDisplay() {
    // 使用i18n的统一方法来更新语言显示
    i18n.updateLanguage();
  }

  _handleScroll() {
    if (!this.isFeatureEnabled('toggle-backtotop')) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
      if (scrollTop > 300) {
        backToTopBtn.style.display = 'block';
      } else {
        backToTopBtn.style.display = 'none';
      }
    }
  }

  _showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = show ? 'flex' : 'none';
    }
  }

  _showError(message) {
    // 显示错误通知
    if (typeof errorHandler !== 'undefined') {
      errorHandler.showError(message);
    }
    
    // 在产品容器中显示错误消息
    const container = document.getElementById('products-container');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>${message}</p>
        </div>
      `;
    }
  }
}

const frontend = new Frontend();

// 直接初始化，因为DOMContentLoaded事件可能已经触发
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    frontend.init();
  });
} else {
  frontend.init();
}