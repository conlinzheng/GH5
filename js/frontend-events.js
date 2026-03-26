class FrontendEvents {
  constructor() {
    this._searchTimeout = null;
  }
  
  // 设置事件监听器
  setupEventListeners() {
    // 系列筛选 - 使用事件委托
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('series-filter')) {
        const seriesId = e.target.dataset.series;
        frontendCore.filterBySeries(seriesId);
      }
    });
    
    // 分页 - 使用事件委托
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pagination-btn')) {
        const page = parseInt(e.target.dataset.page);
        frontendCore.goToPage(page);
      }
    });
    
    // 刷新数据按钮
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        frontendCore.refreshData();
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

     const clearBtn = document.getElementById('search-clear');
     const searchInputEl = document.getElementById('search-input');
     
     if (clearBtn && searchInputEl) {
       clearBtn.addEventListener('click', () => {
         searchInputEl.value = '';
         this.resetSearch();
         this._updateClearButtonVisibility('');
         searchInputEl.focus();
       });
       
       searchInputEl.addEventListener('input', (e) => {
         this._updateClearButtonVisibility(e.target.value);
         
         // 防抖搜索
         clearTimeout(this._searchTimeout);
         this._searchTimeout = setTimeout(() => {
           this.searchProducts(e.target.value);
         }, 300);
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
        frontendUI.closeProductDetails();
      });
    }
    
    // 模态框遮罩层
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        frontendUI.closeProductDetails();
      });
    }
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        frontendUI.closeProductDetails();
        frontendUI.closeContactModal();
      }
    });
    
    // 联系我们弹窗关闭按钮
    const contactModalClose = document.getElementById('contact-modal-close');
    if (contactModalClose) {
      contactModalClose.addEventListener('click', () => {
        frontendUI.closeContactModal();
      });
    }
    
    // 联系我们弹窗遮罩层
    const contactModalOverlay = document.getElementById('contact-modal-overlay');
    if (contactModalOverlay) {
      contactModalOverlay.addEventListener('click', () => {
        frontendUI.closeContactModal();
      });
    }
    
    // 语言切换事件
    document.addEventListener('languageChanged', (event) => {
      frontendCore.state.currentLang = event.detail.language;
      this._handleLanguageChange(event.detail.language);
      frontendUI.updateContactModal();
    });
    
    // 浏览历史点击事件
    document.addEventListener('viewHistoryItem', (event) => {
      const productId = event.detail.productId;
      this.viewHistoryProduct(productId);
    });
    
    // 联系表单提交
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.submitContactForm(contactForm);
      });
    }
    
    // 灯箱导航
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxClose = document.getElementById('lightbox-close');
    
    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', (e) => {
        e.preventDefault();
        frontendUI.navigateLightbox(-1);
      });
    }
    
    if (lightboxNext) {
      lightboxNext.addEventListener('click', (e) => {
        e.preventDefault();
        frontendUI.navigateLightbox(1);
      });
    }
    
    if (lightboxClose) {
      lightboxClose.addEventListener('click', (e) => {
        frontendUI.closeLightbox(e);
      });
    }
    
    // 画廊导航
    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');
    
    if (galleryPrev) {
      galleryPrev.addEventListener('click', () => {
        frontendUI.navigateGallery(-1);
      });
    }
    
    if (galleryNext) {
      galleryNext.addEventListener('click', () => {
        frontendUI.navigateGallery(1);
      });
    }
  }
  
  // 搜索产品
  searchProducts(query) {
    if (!this.isValidSearchQuery(query)) {
      this.resetSearch();
      return;
    }

    const searchTerm = query.trim().toLowerCase();
    const filteredProducts = frontendCore.state.allProducts.filter(product => 
      this.isProductMatch(product, searchTerm)
    );

    this.updateSearchResults(filteredProducts);
  }
  
  // 检查搜索查询是否有效
  isValidSearchQuery(query) {
    return query && typeof query === 'string' && query.trim();
  }
  
  // 检查产品是否匹配搜索条件
  isProductMatch(product, searchTerm) {
    if (!product) return false;
    
    return this.isNameMatch(product.name, searchTerm) ||
           this.isTagsMatch(product.tags, searchTerm) ||
           this.isMaterialMatch(product, searchTerm);
  }
  
  // 检查产品名称是否匹配
  isNameMatch(name, searchTerm) {
    if (!name) return false;
    
    if (typeof name === 'string') {
      return name.toLowerCase().includes(searchTerm);
    } else if (typeof name === 'object' && name !== null) {
      const nameValues = Object.values(name).filter(v => typeof v === 'string');
      return nameValues.some(v => v.toLowerCase().includes(searchTerm));
    }
    
    return false;
  }
  
  // 检查产品标签是否匹配
  isTagsMatch(tags, searchTerm) {
    if (!tags) return false;
    
    if (Array.isArray(tags)) {
      return tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchTerm));
    } else if (typeof tags === 'string') {
      return tags.toLowerCase().includes(searchTerm);
    }
    
    return false;
  }
  
  // 检查产品材质是否匹配
  isMaterialMatch(product, searchTerm) {
    const materials = [
      product.upperMaterial,
      product.innerMaterial,
      product.soleMaterial
    ];
    
    return materials.some(material => 
      material && typeof material === 'string' && material.toLowerCase().includes(searchTerm)
    );
  }
  
  // 更新搜索结果
  updateSearchResults(filteredProducts) {
    frontendCore.state.products = filteredProducts;
    frontendCore.state.currentPage = 1;
    frontendCore.calculateTotalPages();
    frontendUI.renderProducts();
    frontendCore.renderPagination();
  }
  
  // 重置搜索
  resetSearch() {
    frontendCore.state.products = frontendCore.state.allProducts;
    frontendCore.state.currentPage = 1;
    frontendCore.calculateTotalPages();
    frontendUI.renderProducts();
    frontendCore.renderPagination();
  }
  
  // 更新清除按钮可见性
  _updateClearButtonVisibility(value) {
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.style.display = value ? 'block' : 'none';
    }
  }
  
  // 处理语言变化
  _handleLanguageChange(language) {
    console.log('Language changed to:', language);
    // 这里可以添加额外的语言变化处理逻辑
  }
  
  // 查看历史产品
  viewHistoryProduct(productId) {
    const product = frontendCore.state.allProducts.find(p => p.id === productId);
    if (product) {
      frontendUI.showProductDetails(product);
    }
  }
  
  // 提交联系表单
  async submitContactForm(form) {
    const formspreeUrl = this.getFormspreeUrl();
    
    if (!formspreeUrl) {
      const formMessage = document.getElementById('form-message');
      formMessage.textContent = '表单未配置，请先在后台配置 Formspree 表单 ID';
      formMessage.className = 'form-message error';
      formMessage.style.display = 'block';
      return;
    }
    
    form.action = formspreeUrl;
    
    const submitBtn = document.getElementById('submit-btn');
    const formMessage = document.getElementById('form-message');
    const formData = new FormData(form);
    
    const submittingText = submitBtn.dataset.textSubmitting || '提交中...';
    submitBtn.disabled = true;
    submitBtn.textContent = submittingText;
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const config = frontendCore.state.siteConfig;
      const lang = frontendCore.state.currentLang;
      const successMsg = config.translations?.['感谢您的留言']?.[lang] || 
                       config.translations?.['感谢您的留言']?.zh || 
                       '感谢您的留言！我们会尽快与您联系。';
      
      if (response.ok) {
        formMessage.textContent = successMsg;
        formMessage.className = 'form-message success';
        formMessage.style.display = 'block';
        form.reset();
        errorHandler.showSuccess(successMsg);
      } else {
        const data = await response.json();
        const errorMsg = data.error || '提交失败，请稍后重试。';
        formMessage.textContent = errorMsg;
        formMessage.className = 'form-message error';
        formMessage.style.display = 'block';
        errorHandler.handleError(new Error(errorMsg), errorHandler.errorTypes.API, errorMsg);
      }
    } catch (error) {
      const errorMsg = '网络错误，请检查 Formspree 表单 ID 是否正确配置';
      formMessage.textContent = errorMsg;
      formMessage.className = 'form-message error';
      formMessage.style.display = 'block';
      errorHandler.handleError(error, errorHandler.errorTypes.NETWORK, errorMsg);
    } finally {
      submitBtn.disabled = false;
      const submitText = submitBtn.dataset.textSubmit || '提交';
      submitBtn.textContent = submitText;
      
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    }
  }
  
  // 获取 Formspree URL
  getFormspreeUrl() {
    const config = frontendCore.state.siteConfig;
    const formId = config.contactForm?.formspreeId || '';
    return formId ? `https://formspree.io/f/${formId}` : '';
  }
}

const frontendEvents = new FrontendEvents();
