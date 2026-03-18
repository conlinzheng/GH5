class Frontend {
  constructor() {
    this.config = {
      owner: 'conlinzheng',
      repo: 'GH5',
      productsPath: '产品图',
      cacheTTL: 3600000
    };

    this.state = {
      products: [],
      series: [],
      currentLanguage: 'zh',
      isLoading: false
    };

    this.featureSettings = {
      toggle-backtotop: true,
      toggle-imagezoom: true,
      toggle-search: true,
      toggle-compare: true,
      toggle-history: true,
      toggle-filter: true,
      toggle-layout: true,
      toggle-share: true,
      toggle-theme: true,
      toggle-language: true,
      toggle-contact: true
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
    document.addEventListener('DOMContentLoaded', () => {
      this._initCarousel();
      this._initSearch();
      this._initContactForm();
      this._initLanguageToggle();
      this._initModal();
    });

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

      const cachedData = cacheManager.get('products_data');
      if (cachedData) {
        console.log('Loading products from cache');
        this.state.products = cachedData.products || [];
        this.state.series = cachedData.series || [];
        this.renderProducts();
        return;
      }

      console.log('Loading products from GitHub API');
      const series = await githubAPI.fetchDirectory(this.config.productsPath);
      this.state.series = series.filter(item => item.type === 'dir');

      const products = [];
      for (const seriesItem of this.state.series) {
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
          console.warn(`Failed to load products for ${seriesItem.name}:`, error);
        }
      }

      this.state.products = products;

      cacheManager.set('products_data', {
        products: this.state.products,
        series: this.state.series
      }, this.config.cacheTTL);

      this.renderProducts();
    } catch (error) {
      console.error('Load products data error:', error);
      this._showError('加载产品数据失败，请稍后重试');
    } finally {
      this.state.isLoading = false;
      this._showLoading(false);
    }
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
    seriesTitle.textContent = seriesItem.name;
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
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = i18n.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    const langBtn = document.getElementById('language-toggle');
    if (langBtn) {
      const langText = langBtn.querySelector('.lang-text');
      if (langText) {
        langText.textContent = i18n.getCurrentLanguage().toUpperCase();
      }
    }
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

document.addEventListener('DOMContentLoaded', () => {
  frontend.init();
});