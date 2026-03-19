class Frontend {
  constructor() {
    this.config = {
      productsPath: '产品图',
      cacheTTL: 3600, // 1小时
      itemsPerPage: 12
    };
    
    this.state = {
      products: [],
      series: [],
      seriesNameMap: {},
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      selectedSeries: null
    };
    
    this.init();
  }
  
  init() {
    this.loadProductsData();
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // 系列筛选
    document.querySelectorAll('.series-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seriesId = e.target.dataset.series;
        this.filterBySeries(seriesId);
      });
    });
    
    // 分页
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      });
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
        
        // 始终从API加载最新的产品数据
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
          return;
        }
      } catch (error) {
        console.log('Config file not found, using default series name map');
      }
      
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
  
  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    let productsToRender = this.state.products;
    
    // 按系列筛选
    if (this.state.selectedSeries) {
      productsToRender = productsToRender.filter(p => p.seriesId === this.state.selectedSeries);
    }
    
    // 分页
    const startIndex = (this.state.currentPage - 1) * this.config.itemsPerPage;
    const endIndex = startIndex + this.config.itemsPerPage;
    const paginatedProducts = productsToRender.slice(startIndex, endIndex);
    
    // 更新总页数
    this.state.totalPages = Math.ceil(productsToRender.length / this.config.itemsPerPage);
    
    // 渲染产品
    paginatedProducts.forEach(product => {
      const productElement = this._createProductElement(product);
      container.appendChild(productElement);
    });
    
    // 更新分页
    this._updatePagination();
    
    // 更新系列筛选按钮
    this._updateSeriesFilter();
  }
  
  _createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-item';
    
    const seriesDisplayName = this.state.seriesNameMap[product.seriesId] || product.seriesId;
    
    div.innerHTML = `
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-series">${seriesDisplayName}</p>
        <p class="product-description">${product.description || ''}</p>
        <p class="product-price">${product.price || ''}</p>
        <p class="product-materials">${product.materials || ''}</p>
      </div>
    `;
    
    return div;
  }
  
  _updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= this.state.totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-btn ${i === this.state.currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.dataset.page = i;
      btn.addEventListener('click', () => this.goToPage(i));
      paginationContainer.appendChild(btn);
    }
  }
  
  _updateSeriesFilter() {
    const filterContainer = document.getElementById('series-filter');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    
    // 添加"全部"按钮
    const allBtn = document.createElement('button');
    allBtn.className = `series-filter ${!this.state.selectedSeries ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => this.filterBySeries(null));
    filterContainer.appendChild(allBtn);
    
    // 添加系列按钮
    this.state.series.forEach(seriesItem => {
      const displayName = this.state.seriesNameMap[seriesItem.name] || seriesItem.name;
      const btn = document.createElement('button');
      btn.className = `series-filter ${this.state.selectedSeries === seriesItem.name ? 'active' : ''}`;
      btn.textContent = displayName;
      btn.addEventListener('click', () => this.filterBySeries(seriesItem.name));
      filterContainer.appendChild(btn);
    });
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
  
  _showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }
  
  _showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }
  
  _loadLocalFallbackData() {
    // 加载本地备用数据
    this.state.products = [];
    this.state.series = [];
    this.renderProducts();
  }
}

// 初始化前端
const frontend = new Frontend();
