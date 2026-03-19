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
    
    // 刷新数据按钮
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshData();
      });
    }
  }
  
  refreshData() {
    // 清除缓存并重新加载数据
    cacheManager.clearAll();
    console.log('Data refreshed by user');
    this.loadProductsData();
  }
  
  async loadProductsData() {
    try {
      this.state.isLoading = true;
      this._showLoading(true);

      // 清除缓存以确保获取最新数据
      cacheManager.clearAll();
      console.log('Cache cleared, loading fresh data from GitHub API');

      // 重新加载系列名称映射和系列列表
      await this.loadSeriesNameMap();
      
      try {
        // 从GitHub API获取最新的系列列表
        const series = await githubAPI.fetchDirectory(this.config.productsPath);
        this.state.series = series.filter(item => item.type === 'dir');
        
        console.log('Loading products from GitHub API');
        
        // 并行请求所有系列的产品数据
        const products = [];
        const productPromises = this.state.series.map(async (seriesItem) => {
          try {
            // 获取系列目录下的所有文件
            const files = await githubAPI.fetchDirectory(seriesItem.path);
            const imageFiles = files.filter(file => {
              const ext = file.name.split('.').pop().toLowerCase();
              return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
            });
            
            // 按产品名称分组图片
            const productGroups = {};
            imageFiles.forEach(file => {
              const productName = this.extractProductName(file.name);
              if (!productGroups[productName]) {
                productGroups[productName] = [];
              }
              productGroups[productName].push(file.name);
            });
            
            // 获取产品数据文件
            let productsFile;
            try {
              productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
            } catch (error) {
              productsFile = { products: {} };
            }
            
            // 为每个产品创建数据
            const productsByGroup = {};
            Object.entries(productGroups).forEach(([productName, images]) => {
              // 找到主图（通常是 (1) 或没有数字的图片）
              const mainImage = images.find(img => this.isMainImage(img)) || images[0];
              
              // 获取产品数据
              const productData = productsFile.products[mainImage] || {
                name: productName,
                description: '',
                price: '',
                upperMaterial: '',
                innerMaterial: '',
                soleMaterial: '',
                customizable: '',
                minOrder: ''
              };
              
              // 构建产品对象
              const product = {
                id: mainImage,
                seriesId: seriesItem.name,
                name: productData.name,
                description: productData.description,
                price: productData.price,
                upperMaterial: productData.upperMaterial,
                innerMaterial: productData.innerMaterial,
                soleMaterial: productData.soleMaterial,
                customizable: productData.customizable,
                minOrder: productData.minOrder,
                specs: productData.upperMaterial || productData.innerMaterial || productData.soleMaterial || '',
                images: images.map(img => `产品图/${seriesItem.name}/${img}`)
              };
              
              productsByGroup[productName] = product;
            });
            
            // 按排序顺序添加产品
            if (productsFile.order) {
              productsFile.order.forEach(productName => {
                if (productsByGroup[productName]) {
                  products.push(productsByGroup[productName]);
                  delete productsByGroup[productName];
                }
              });
            }
            
            // 添加剩余的产品
            Object.values(productsByGroup).forEach(product => {
              products.push(product);
            });
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
      // 清除 config.json 的缓存以确保获取最新数据
      cacheManager.clear('config.json');
      console.log('Config.json cache cleared in loadSeriesNameMap');
      
      // 尝试从配置文件加载系列名称映射和排序信息
      let configFile;
      try {
        configFile = await githubAPI.fetchFile('config.json');
        if (configFile && configFile.seriesNameMap) {
          this.state.seriesNameMap = configFile.seriesNameMap;
        }
        if (configFile && configFile.seriesOrder) {
          this.state.seriesOrder = configFile.seriesOrder;
        }
        return;
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
    
    // 按系列分组产品
    const productsBySeries = {};
    this.state.products.forEach(product => {
      if (!productsBySeries[product.seriesId]) {
        productsBySeries[product.seriesId] = [];
      }
      productsBySeries[product.seriesId].push(product);
    });
    
    // 获取系列顺序
    let seriesOrder = this.state.seriesOrder || Object.keys(productsBySeries);
    
    // 确保所有系列都在排序中
    Object.keys(productsBySeries).forEach(seriesId => {
      if (!seriesOrder.includes(seriesId)) {
        seriesOrder.push(seriesId);
      }
    });
    
    // 渲染每个系列
    seriesOrder.forEach(seriesId => {
      // 如果有选定的系列，只显示该系列
      if (this.state.selectedSeries && this.state.selectedSeries !== seriesId) {
        return;
      }
      
      const seriesProducts = productsBySeries[seriesId];
      if (!seriesProducts) return;
      
      const seriesDisplayName = this.state.seriesNameMap[seriesId] || seriesId;
      
      // 创建系列容器
      const seriesContainer = document.createElement('div');
      seriesContainer.className = 'series-section';
      seriesContainer.dataset.seriesId = seriesId;
      
      // 系列标题
      const seriesTitle = document.createElement('h2');
      seriesTitle.className = 'series-title';
      seriesTitle.textContent = seriesDisplayName;
      seriesContainer.appendChild(seriesTitle);
      
      // 产品容器
      const productsWrapper = document.createElement('div');
      productsWrapper.className = 'series-products-wrapper';
      
      // 左右切换按钮
      const leftButton = document.createElement('button');
      leftButton.className = 'series-nav-btn left';
      leftButton.innerHTML = '&lt;';
      leftButton.addEventListener('click', () => this.scrollSeries(seriesId, -1));
      
      const rightButton = document.createElement('button');
      rightButton.className = 'series-nav-btn right';
      rightButton.innerHTML = '&gt;';
      rightButton.addEventListener('click', () => this.scrollSeries(seriesId, 1));
      
      // 产品列表
      const productsContainer = document.createElement('div');
      productsContainer.className = 'series-products';
      
      // 渲染系列产品
      seriesProducts.forEach(product => {
        const productElement = this._createProductElement(product);
        productsContainer.appendChild(productElement);
      });
      
      productsWrapper.appendChild(leftButton);
      productsWrapper.appendChild(productsContainer);
      productsWrapper.appendChild(rightButton);
      seriesContainer.appendChild(productsWrapper);
      
      container.appendChild(seriesContainer);
    });
    
    // 更新系列筛选按钮
    this._updateSeriesFilter();
  }
  
  scrollSeries(seriesId, direction) {
    const seriesWrapper = document.querySelector(`.series-section[data-series-id="${seriesId}"] .series-products`);
    if (seriesWrapper) {
      const scrollAmount = 300; // 每次滚动的距离
      seriesWrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  }
  
  _createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    const seriesDisplayName = this.state.seriesNameMap[product.seriesId] || product.seriesId;
    
    // 构建图片轮播
    let imageCarousel = '';
    if (product.images.length > 1) {
      imageCarousel = `
        <div class="product-image-carousel">
          ${product.images.map((image, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${image}" alt="${product.name} ${index + 1}" loading="lazy">
            </div>
          `).join('')}
          <div class="carousel-controls">
            ${product.images.map((_, index) => `
              <button class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></button>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      imageCarousel = `
        <div class="product-image">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
        </div>
      `;
    }
    
    div.innerHTML = `
      ${imageCarousel}
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-series">${seriesDisplayName}</p>
        <p class="product-description">${product.description || ''}</p>
        <p class="product-price">${product.price || ''}</p>
        ${product.upperMaterial ? `<p class="product-upper-material">鞋面材质: ${product.upperMaterial}</p>` : ''}
        ${product.innerMaterial ? `<p class="product-inner-material">内里材质: ${product.innerMaterial}</p>` : ''}
        ${product.soleMaterial ? `<p class="product-sole-material">鞋底材质: ${product.soleMaterial}</p>` : ''}
        ${product.customizable ? `<p class="product-customizable">定制: ${product.customizable === 'true' ? '支持' : '不支持'}</p>` : ''}
        ${product.minOrder ? `<p class="product-min-order">起订量: ${product.minOrder}</p>` : ''}
      </div>
    `;
    
    // 添加图片轮播功能
    if (product.images.length > 1) {
      setTimeout(() => {
        const carousel = div.querySelector('.product-image-carousel');
        const items = carousel.querySelectorAll('.carousel-item');
        const dots = carousel.querySelectorAll('.carousel-dot');
        
        let currentIndex = 0;
        
        function showSlide(index) {
          items.forEach(item => item.classList.remove('active'));
          dots.forEach(dot => dot.classList.remove('active'));
          items[index].classList.add('active');
          dots[index].classList.add('active');
          currentIndex = index;
        }
        
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => showSlide(index));
        });
        
        // 自动轮播
        setInterval(() => {
          const nextIndex = (currentIndex + 1) % items.length;
          showSlide(nextIndex);
        }, 3000);
      }, 0);
    }
    
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
  
  extractProductName(fileName) {
    // 从文件名中提取产品名称
    // 处理 "产品1 (1).jpg" 这样的格式
    const match = fileName.match(/^(.+?)\s*\(\d+\)\.\w+$/);
    if (match) {
      return match[1].trim();
    }
    // 处理 "产品1.jpg" 这样的格式
    return fileName.replace(/\.\w+$/, '').trim();
  }
  
  isMainImage(fileName) {
    // 判断是否为主图
    // 主图通常是 (1) 或没有数字后缀的图片
    return fileName.includes('(1)') || !fileName.match(/\s*\(\d+\)\.\w+$/);
  }
}

// 初始化前端
const frontend = new Frontend();
