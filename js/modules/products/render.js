class ProductRender {
  constructor() {
    this.state = {
      selectedSeries: null,
      currentPage: 1,
      totalPages: 1
    };
  }

  renderProducts(products, seriesNameMap, seriesOrder, selectedSeries, getProductTranslation) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    console.log('渲染产品，总产品数量:', products.length);
    
    // 按系列分组产品
    const productsBySeries = {};
    products.forEach(product => {
      if (!productsBySeries[product.seriesId]) {
        productsBySeries[product.seriesId] = [];
      }
      productsBySeries[product.seriesId].push(product);
    });
    
    console.log('按系列分组后的产品:', productsBySeries);
    
    // 获取系列顺序
    let seriesOrderToUse = seriesOrder || Object.keys(productsBySeries);
    
    // 确保所有系列都在排序中
    Object.keys(productsBySeries).forEach(seriesId => {
      if (!seriesOrderToUse.includes(seriesId)) {
        seriesOrderToUse.push(seriesId);
      }
    });
    
    // 渲染每个系列
    seriesOrderToUse.forEach(seriesId => {
      // 如果有选定的系列，只显示该系列
      if (selectedSeries && selectedSeries !== seriesId) {
        return;
      }
      
      const seriesProducts = productsBySeries[seriesId];
      if (!seriesProducts) return;
      
      const seriesDisplayName = seriesNameMap[seriesId] || seriesId;
      
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
        const productElement = this._createProductElement(product, getProductTranslation);
        productsContainer.appendChild(productElement);
      });
      
      productsWrapper.appendChild(leftButton);
      productsWrapper.appendChild(productsContainer);
      productsWrapper.appendChild(rightButton);
      seriesContainer.appendChild(productsWrapper);
      
      container.appendChild(seriesContainer);
    });
  }

  scrollSeries(seriesId, direction) {
    const seriesWrapper = document.querySelector(`.series-section[data-series-id="${seriesId}"] .series-products`);
    if (seriesWrapper) {
      const scrollAmount = 300; // 每次滚动的距离
      seriesWrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  }

  _createProductElement(product, getProductTranslation) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    const translatedName = getProductTranslation(product.name, 'name');
    const translatedDesc = product.description ? getProductTranslation(product.description, 'desc') : '';
    
    // 构建图片轮播
    let imageCarousel = '';
    if (product.images.length > 1) {
      imageCarousel = `
        <div class="product-image-carousel">
          ${product.images.map((image, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${image}" alt="${translatedName} ${index + 1}" loading="lazy" onerror="console.error('图片加载失败:', '${image}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5Ij7mlrDlrabliLDop6Pph448L3RleHQ+PC9zdmc+';">
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
          <img src="${product.images[0]}" alt="${translatedName}" loading="lazy" onerror="console.error('图片加载失败:', '${product.images[0]}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5Ij7mlrDlrabliLDop6Pph448L3RleHQ+PC9zdmc+';">
        </div>
      `;
    }
    
    // 生成标签HTML - 翻译标签
    const translatedTags = product.tags ? product.tags.map(tag => getProductTranslation(tag, 'tag')) : [];
    console.log('产品标签:', translatedTags);
    const tagsHtml = translatedTags && translatedTags.length > 0 ? `
      <div class="product-tags">
        ${translatedTags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
      </div>
    ` : '';
    console.log('标签HTML:', tagsHtml);
    
    div.innerHTML = `
      <div class="product-image-container" onclick="frontend.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
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

  renderProductDetails(product, getProductTranslation) {
    // 渲染产品详情的逻辑
    // 这里可以实现产品详情的渲染
  }

  renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.dataset.page = i;
      btn.addEventListener('click', () => this.goToPage(i));
      paginationContainer.appendChild(btn);
    }
  }

  goToPage(page) {
    // 跳转到指定页码的逻辑
    this.state.currentPage = page;
    // 这里可以触发重新渲染
  }
}

const productRender = new ProductRender();
export default productRender;