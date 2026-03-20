class Frontend {
  constructor() {
    this.config = {
      productsPath: '产品图',
      cacheTTL: 3600, // 1小时
      itemsPerPage: 12
    };
    
    this.state = {
      products: [],
      allProducts: [], // 存储所有产品，用于搜索
      series: [],
      seriesNameMap: {},
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      selectedSeries: null
    };
    
    // 灯箱相关变量
    this.currentLightboxImages = [];
    this.currentLightboxIndex = 0;
    
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

    // 搜索功能 - 直接绑定事件
     const searchBtn = document.getElementById('search-btn');
     if (searchBtn) {
       searchBtn.addEventListener('click', () => {
         const searchInput = document.getElementById('search-input');
         if (searchInput) {
           this.searchProducts(searchInput.value);
         }
       });
     }

     const resetBtn = document.getElementById('reset-search');
     if (resetBtn) {
       resetBtn.addEventListener('click', () => {
         const searchInput = document.getElementById('search-input');
         if (searchInput) {
           searchInput.value = '';
         }
         this.resetSearch();
       });
     }

    // 回车键搜索
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'search-input') {
        this.searchProducts(e.target.value);
      }
    });
    
    // 模态框关闭按钮
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.closeProductDetails();
      });
    }
    
    // 模态框遮罩层
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        this.closeProductDetails();
      });
    }
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProductDetails();
      }
    });
  }
  
  refreshData() {
    // 清除缓存并重新加载数据
    cacheManager.clearAll();
    console.log('Data refreshed by user');
    this.loadProductsData();
  }
  

  
  showProductDetails(product) {
    const modal = document.getElementById('product-modal');
    
    if (!modal) return;
    
    const seriesDisplayName = this.state.seriesNameMap[product.seriesId] || product.seriesId;
    
    // 更新弹窗内容
    document.getElementById('modal-main-image').src = product.images[0];
    document.getElementById('modal-main-image').alt = product.name;
    document.getElementById('modal-series').textContent = seriesDisplayName;
    document.getElementById('modal-product-name').textContent = product.name;
    document.getElementById('modal-description').textContent = product.description || '无描述';
    
    // 更新产品规格
    document.getElementById('spec-upper').textContent = product.upperMaterial || '-';
    document.getElementById('spec-inner').textContent = product.innerMaterial || '-';
    document.getElementById('spec-sole').textContent = product.soleMaterial || '-';
    document.getElementById('spec-customizable').textContent = product.customizable ? (product.customizable === 'true' ? '支持' : '不支持') : '-';
    document.getElementById('spec-min-order').textContent = product.minOrder || '-';
    document.getElementById('spec-price').textContent = product.price || '-';
    
    // 加载相关图片
    this.loadRelatedImages(product.images);
    
    // 显示弹窗
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  
  closeProductDetails() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
  
  // 加载相关图片到弹窗
  loadRelatedImages(images) {
    const gallery = document.getElementById('modal-gallery');
    if (!gallery) return;
    
    // 保存相关图片到全局变量，供灯箱使用
    this.currentLightboxImages = images;
    
    let html = '';
    images.forEach((img, index) => {
      html += `
        <div class="modal-gallery-item">
          <img src="${img}" 
               alt="${index + 1}" 
               class="gallery-thumb"
               onclick="changeMainImage('${img}')">
          <div class="gallery-thumb-label">图片 ${index + 1}</div>
        </div>
      `;
    });
    
    gallery.innerHTML = html;
  }
  
  // 切换主图
  changeMainImage(src) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
      mainImage.src = src;
    }
  }
  
  // 打开灯箱
  openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    if (lightbox && lightboxImage) {
      lightboxImage.src = src;
      lightbox.style.display = 'flex';
      
      // 设置灯箱图片列表
      this.currentLightboxIndex = this.currentLightboxImages.indexOf(src);
      this.updateLightboxCounter();
    }
  }
  
  // 关闭灯箱
  closeLightbox(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
    }
  }
  
  // 灯箱导航
  navigateLightbox(direction) {
    if (this.currentLightboxImages.length === 0) return;

    this.currentLightboxIndex += direction;

    // 循环切换
    if (this.currentLightboxIndex < 0) {
      this.currentLightboxIndex = this.currentLightboxImages.length - 1;
    } else if (this.currentLightboxIndex >= this.currentLightboxImages.length) {
      this.currentLightboxIndex = 0;
    }

    const lightboxImage = document.getElementById('lightbox-image');
    if (lightboxImage) {
      lightboxImage.src = this.currentLightboxImages[this.currentLightboxIndex];
      this.updateLightboxCounter();
    }
  }
  
  // 搜索产品
  searchProducts(query) {
    if (!query || typeof query !== 'string') {
      this.resetSearch();
      return;
    }
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      this.resetSearch();
      return;
    }

    const searchTerm = trimmedQuery.toLowerCase();
    const filteredProducts = this.state.allProducts.filter(product => {
      const name = product.name;
      if (name && typeof name === 'string' && name.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      if (product.tags && Array.isArray(product.tags) && product.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchTerm))) {
        return true;
      }
      
      if (product.upperMaterial && typeof product.upperMaterial === 'string' && product.upperMaterial.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (product.innerMaterial && typeof product.innerMaterial === 'string' && product.innerMaterial.toLowerCase().includes(searchTerm)) {
        return true;
      }
      if (product.soleMaterial && typeof product.soleMaterial === 'string' && product.soleMaterial.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      return false;
    });

    this.state.products = filteredProducts;
    this.renderProducts();
  }

  // 重置搜索
  resetSearch() {
    this.state.products = this.state.allProducts;
    this.renderProducts();
  }
  
  // 更新灯箱计数器
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
        
        // 串行请求所有系列的产品数据，避免API限流
        const products = [];
        
        // 限制并发请求数量
        const maxConcurrentRequests = 2;
        const seriesBatches = [];
        
        // 将系列分成批次
        for (let i = 0; i < this.state.series.length; i += maxConcurrentRequests) {
          seriesBatches.push(this.state.series.slice(i, i + maxConcurrentRequests));
        }
        
        // 按批次处理系列
        for (const batch of seriesBatches) {
          const batchPromises = batch.map(async (seriesItem) => {
            try {
              // 检查API限流状态
              const rateLimitInfo = githubAPI.getRateLimitInfo();
              if (rateLimitInfo.isLimited) {
                console.log('API rate limit reached, waiting...');
                await githubAPI.waitForRateLimitReset();
              }
              
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
                // 只有在缓存不存在时才请求API
                const cachedData = cacheManager.get(`${seriesItem.path}/products.json`);
                if (cachedData) {
                  productsFile = cachedData;
                  console.log(`Using cached data for ${seriesItem.path}/products.json`);
                } else {
                  productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
                  // 缓存数据
                  cacheManager.set(`${seriesItem.path}/products.json`, productsFile, this.config.cacheTTL);
                }
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
                  minOrder: '',
                  tags: []
                };
                
                console.log('产品数据:', productData);
                console.log('产品标签:', productData.tags);
                
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
                  tags: productData.tags || [],
                  specs: productData.upperMaterial || productData.innerMaterial || productData.soleMaterial || '',
                  images: images.map(img => `产品图/${seriesItem.name}/${img}`)
                };
                
                console.log('构建的产品对象:', product);
                
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
              
              // 添加请求间隔，避免API限流
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              if (typeof errorHandler !== 'undefined') {
                errorHandler.handleApiError(error);
              } else {
                console.warn(`Failed to load products for ${seriesItem.name}:`, error);
              }
            }
          });
          
          // 等待批次请求完成
        await Promise.all(batchPromises);
      }

      console.log('产品数据加载完成，产品数量:', products.length);
      console.log('产品数据示例:', products[0]);
      
      this.state.products = products;
      this.state.allProducts = products; // 保存所有产品，用于搜索

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
    
    // 生成标签HTML
    console.log('产品标签:', product.tags);
    const tagsHtml = product.tags && product.tags.length > 0 ? `
      <div class="product-tags">
        ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
      </div>
    ` : '';
    console.log('标签HTML:', tagsHtml);
    
    div.innerHTML = `
      <div class="product-image-container" onclick="frontend.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
        ${imageCarousel}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price || ''}</p>
        ${tagsHtml}
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

// 全局函数，用于产品详情框
function changeMainImage(src) {
  frontend.changeMainImage(src);
}

function openLightbox(src) {
  frontend.openLightbox(src);
}

function closeLightbox(event) {
  frontend.closeLightbox(event);
}

function navigateLightbox(direction) {
  frontend.navigateLightbox(direction);
}

function closeModal() {
  frontend.closeProductDetails();
}
