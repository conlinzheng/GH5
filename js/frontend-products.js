class FrontendProducts {
  constructor(frontend) {
    this.frontend = frontend;
  }
  
  async loadProductsData() {
    try {
      this.frontend.state.isLoading = true;
      this.frontend._showLoading(true);

      // 清除缓存以确保获取最新数据
      cacheManager.clearAll();
      console.log('Cache cleared, loading fresh data from GitHub API');

      // 重新加载系列名称映射和系列列表
      await this.loadSeriesNameMap();
      
      // 从GitHub API获取最新的系列列表
      let series;
      try {
        series = await githubAPI.fetchDirectory(this.frontend.config.github.productsPath);
        this.frontend.state.series = series.filter(item => item.type === 'dir');
      } catch (error) {
        console.error('Failed to fetch series directory:', error);
        this.frontend.state.series = [];
      }
      
      console.log('Loading products from GitHub API');
      
      // 串行请求所有系列的产品数据，避免API限流
      const products = [];
      
      // 限制并发请求数量
      const maxConcurrentRequests = 2;
      const seriesBatches = [];
      
      // 将系列分成批次
      for (let i = 0; i < this.frontend.state.series.length; i += maxConcurrentRequests) {
        seriesBatches.push(this.frontend.state.series.slice(i, i + maxConcurrentRequests));
      }
      
      // 按批次处理系列
      for (const batch of seriesBatches) {
        const batchPromises = batch.map(async (seriesItem) => {
          try {
            // 检查API限流状态
            const rateLimitInfo = githubAPI.getRateLimitInfo();
            if (rateLimitInfo.isLimited) {
              const waitTime = rateLimitInfo.resetInMinutes;
              console.log(`API rate limit reached, waiting ${waitTime} minutes...`);
              
              // 显示用户友好的提示
              const message = typeof i18n !== 'undefined' 
                ? `API请求过于频繁，请${waitTime}分钟后重试` 
                : `API rate limit reached. Please try again in ${waitTime} minutes.`;
              
              this.frontend._showError(message);
              
              await githubAPI.waitForRateLimitReset();
              
              // 清除错误提示
              const errorElement = document.getElementById('error-message');
              if (errorElement) {
                errorElement.style.display = 'none';
              }
            }
            
            // 获取系列目录下的所有文件
            let files;
            try {
              files = await githubAPI.fetchDirectory(seriesItem.path);
            } catch (error) {
              console.warn(`Failed to fetch directory for ${seriesItem.name}:`, error);
              return;
            }
            
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
            let productsFile = { products: {} };
            try {
              // 只有在缓存不存在时才请求API
              const cachedData = cacheManager.get(`${seriesItem.path}/products.json`);
              if (cachedData) {
                productsFile = cachedData;
                console.log(`Using cached data for ${seriesItem.path}/products.json`);
              } else {
                productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
                // 缓存数据
                cacheManager.set(`${seriesItem.path}/products.json`, productsFile, this.frontend.config.cacheTTL);
              }
            } catch (error) {
              console.warn(`Failed to load products.json for ${seriesItem.name}:`, error);
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
              
              // 处理多语言字段
              const name = productData.name?.zh || productData.name || productName;
              const description = productData.description?.zh || productData.description || '';
              
              // 处理材质字段（兼容两种格式：materials 对象 或 单独字段）
              const upperMaterial = productData.materials?.upper || productData.upperMaterial || '';
              const innerMaterial = productData.materials?.lining || productData.innerMaterial || '';
              const soleMaterial = productData.materials?.sole || productData.soleMaterial || '';
              
              // 构建产品对象
              const product = {
                id: mainImage,
                seriesId: seriesItem.name,
                name: name,
                description: description,
                price: productData.price || '',
                upperMaterial: upperMaterial,
                innerMaterial: innerMaterial,
                soleMaterial: soleMaterial,
                customizable: productData.customizable || '',
                minOrder: productData.minOrder || '',
                tags: productData.tags || [],
                specs: upperMaterial || innerMaterial || soleMaterial || '',
                images: images.map(img => this.frontend.getImageUrl(seriesItem.name, img))
              };
              
              console.log('构建的产品对象:', product);
              
              productsByGroup[productName] = product;
            });
            
            // 按排序顺序添加产品
            if (productsFile.order) {
              const orderNames = productsFile.order;
              orderNames.forEach(productName => {
                if (productsByGroup[productName]) {
                  products.push(productsByGroup[productName]);
                  delete productsByGroup[productName];
                }
              });
            }
            
            // 添加剩余的产品（确保所有产品都被加载，即使 order 字段有问题）
            Object.values(productsByGroup).forEach(product => {
              products.push(product);
            });
            
            // 添加请求间隔，避免API限流
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.warn(`Failed to load products for ${seriesItem.name}:`, error);
          }
        });
        
        // 等待批次请求完成
        await Promise.all(batchPromises);
      }

      console.log('产品数据加载完成，产品数量:', products.length);
      console.log('产品数据示例:', products[0]);
      
      this.frontend.state.products = products;
      this.frontend.state.allProducts = products; // 保存所有产品，用于搜索

      // 缓存数据
      cacheManager.set('products_data', {
        products: this.frontend.state.products,
        series: this.frontend.state.series,
        seriesNameMap: this.frontend.state.seriesNameMap
      }, this.frontend.config.cacheTTL);

      this.renderProducts();
    } catch (error) {
      if (typeof errorHandler !== 'undefined') {
        errorHandler.handleError(error);
      } else {
        console.error('Load products data error:', error);
      }
      this.frontend._showError('加载产品数据失败，请稍后重试');
      // 即使出错也要确保渲染，显示可能已加载的产品
      this.renderProducts();
    } finally {
      this.frontend.state.isLoading = false;
      this.frontend._showLoading(false);
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
          this.frontend.state.seriesNameMap = configFile.seriesNameMap;
        }
        if (configFile && configFile.seriesOrder) {
          this.frontend.state.seriesOrder = configFile.seriesOrder;
        }
        return;
      } catch (error) {
        console.log('Config file not found, using default series name map');
      }
      
      // 使用默认映射
      this.frontend.state.seriesNameMap = this.frontend._getDefaultSeriesNameMap();
    } catch (error) {
      console.error('Load series name map error:', error);
      // 使用默认映射
      this.frontend.state.seriesNameMap = this.frontend._getDefaultSeriesNameMap();
    }
  }
  
  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 按系列分组产品
    const productsBySeries = {};
    this.frontend.state.products.forEach(product => {
      if (!productsBySeries[product.seriesId]) {
        productsBySeries[product.seriesId] = [];
      }
      productsBySeries[product.seriesId].push(product);
    });
    
    // 获取系列顺序
    let seriesOrder = this.frontend.state.seriesOrder || Object.keys(productsBySeries);
    
    // 确保所有系列都在排序中
    Object.keys(productsBySeries).forEach(seriesId => {
      if (!seriesOrder.includes(seriesId)) {
        seriesOrder.push(seriesId);
      }
    });
    
    // 渲染每个系列
    seriesOrder.forEach(seriesId => {
      // 如果有选定的系列，只显示该系列
      if (this.frontend.state.selectedSeries && this.frontend.state.selectedSeries !== seriesId) {
        return;
      }
      
      const seriesProducts = productsBySeries[seriesId];
      if (!seriesProducts) return;
      
      const seriesDisplayName = this.frontend.state.seriesNameMap[seriesId] || seriesId;
      
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
    
    const seriesDisplayName = this.frontend.state.seriesNameMap[product.seriesId] || product.seriesId;
    
    const translatedName = this.frontend.getProductTranslation(product.name, 'name');
    const translatedDesc = product.description ? this.frontend.getProductTranslation(product.description, 'desc') : '';
    
    // 构建图片轮播
    let imageCarousel = '';
    if (product.images.length > 1) {
      imageCarousel = `
        <div class="product-image-carousel">
          ${product.images.map((image, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${image}" alt="${translatedName} ${index + 1}" loading="lazy">
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
          <img src="${product.images[0]}" alt="${translatedName}" loading="lazy">
        </div>
      `;
    }
    
    // 生成标签HTML - 翻译标签
    const translatedTags = product.tags ? product.tags.map(tag => this.frontend.getProductTranslation(tag, 'tag')) : [];
    console.log('产品标签:', translatedTags);
    const tagsHtml = translatedTags && translatedTags.length > 0 ? `
      <div class="product-tags">
        ${translatedTags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
      </div>
    ` : '';
    console.log('标签HTML:', tagsHtml);
    
    div.innerHTML = `
      <div class="product-image-container" onclick="frontend.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})")>
        ${imageCarousel}
      </div>
      <div class="product-info">
        <h3 class="product-name">${translatedName}</h3>
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
    
    for (let i = 1; i <= this.frontend.state.totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-btn ${i === this.frontend.state.currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.dataset.page = i;
      btn.addEventListener('click', () => this.frontend.goToPage(i));
      paginationContainer.appendChild(btn);
    }
  }
  
  _updateSeriesFilter() {
    const filterContainer = document.getElementById('series-filter');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    
    // 添加"全部"按钮
    const allBtn = document.createElement('button');
    allBtn.className = `series-filter ${!this.frontend.state.selectedSeries ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => this.frontend.filterBySeries(null));
    filterContainer.appendChild(allBtn);
    
    // 添加系列按钮
    this.frontend.state.series.forEach(seriesItem => {
      const displayName = this.frontend.state.seriesNameMap[seriesItem.name] || seriesItem.name;
      const btn = document.createElement('button');
      btn.className = `series-filter ${this.frontend.state.selectedSeries === seriesItem.name ? 'active' : ''}`;
      btn.textContent = displayName;
      btn.addEventListener('click', () => this.frontend.filterBySeries(seriesItem.name));
      filterContainer.appendChild(btn);
    });
  }
  
  extractProductName(fileName) {
    // 提取产品名称（去除数字和扩展名）
    return fileName.replace(/\s*\(\d+\)\.[^.]+$/, '').replace(/\.[^.]+$/, '');
  }
  
  isMainImage(fileName) {
    // 判断是否为主图（通常是 (1) 或没有数字的图片）
    return fileName.includes('(1)') || !fileName.match(/\(\d+\)/);
  }
  
  _loadLocalFallbackData() {
    // 加载本地 fallback 数据
    this.frontend.state.products = [];
    this.frontend.state.allProducts = [];
    this.frontend.state.series = [];
    this.renderProducts();
  }
}

// 导出类
window.FrontendProducts = FrontendProducts;