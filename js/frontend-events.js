class FrontendEvents {
  constructor(frontend) {
    this.frontend = frontend;
  }
  
  setupEventListeners() {
    // 系列筛选
    document.querySelectorAll('.series-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seriesId = e.target.dataset.series;
        this.frontend.filterBySeries(seriesId);
      });
    });
    
    // 分页
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        this.frontend.goToPage(page);
      });
    });
    
    // 刷新数据按钮
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.frontend.refreshData();
      });
    }

    // 搜索功能 - 直接绑定事件
     const searchBtn = document.getElementById('search-btn');
     if (searchBtn) {
       searchBtn.addEventListener('click', () => {
         const searchInput = document.getElementById('search-input');
         if (searchInput) {
           this.frontend.searchProducts(searchInput.value);
         }
       });
     }

     const clearBtn = document.getElementById('search-clear');
     const searchInputEl = document.getElementById('search-input');
     
     if (clearBtn && searchInputEl) {
       clearBtn.addEventListener('click', () => {
         searchInputEl.value = '';
         this.frontend.resetSearch();
         this.frontend._updateClearButtonVisibility('');
         searchInputEl.focus();
       });
       
       searchInputEl.addEventListener('input', (e) => {
         this.frontend._updateClearButtonVisibility(e.target.value);
       });
     }

    // 回车键搜索
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'search-input') {
        this.frontend.searchProducts(e.target.value);
      }
    });
    
    // 模态框关闭按钮
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.frontend.closeProductDetails();
      });
    }
    
    // 模态框遮罩层
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        this.frontend.closeProductDetails();
      });
    }
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.frontend.closeProductDetails();
        this.frontend.closeContactModal();
      }
    });
    
    // 联系我们弹窗关闭按钮
    const contactModalClose = document.getElementById('contact-modal-close');
    if (contactModalClose) {
      contactModalClose.addEventListener('click', () => {
        this.frontend.closeContactModal();
      });
    }
    
    // 联系我们弹窗遮罩层
    const contactModalOverlay = document.getElementById('contact-modal-overlay');
    if (contactModalOverlay) {
      contactModalOverlay.addEventListener('click', () => {
        this.frontend.closeContactModal();
      });
    }
    
    // 语言切换事件
    document.addEventListener('languageChanged', (event) => {
      this.frontend.state.currentLang = event.detail.language;
      this.frontend._handleLanguageChange(event.detail.language);
      this.frontend.updateContactModal();
    });
    
    // 浏览历史点击事件
    document.addEventListener('viewHistoryItem', (event) => {
      const productId = event.detail.productId;
      this.frontend.viewHistoryProduct(productId);
    });
    
    // 联系表单提交
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      // 表单输入验证
      contactForm.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('blur', (e) => {
          this.validateContactField(e.target);
        });
      });
      
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 验证表单
        if (!this.validateContactForm()) {
          return;
        }
        
        const formspreeUrl = this.frontend.getFormspreeUrl();
        
        if (!formspreeUrl) {
          const formMessage = document.getElementById('form-message');
          formMessage.textContent = '表单未配置，请先在后台配置 Formspree 表单 ID';
          formMessage.className = 'form-message error';
          formMessage.style.display = 'block';
          return;
        }
        
        contactForm.action = formspreeUrl;
        
        const submitBtn = document.getElementById('submit-btn');
        const formMessage = document.getElementById('form-message');
        const formData = new FormData(contactForm);
        
        const submittingText = submitBtn.dataset.textSubmitting || '提交中...';
        submitBtn.disabled = true;
        submitBtn.textContent = submittingText;
        
        try {
          const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          const config = this.frontend.state.siteConfig;
          const lang = this.frontend.state.currentLang;
          const successMsg = config.translations?.['感谢您的留言']?.[lang] || 
                           config.translations?.['感谢您的留言']?.zh || 
                           '感谢您的留言！我们会尽快与您联系。';
          
          if (response.ok) {
            formMessage.textContent = successMsg;
            formMessage.className = 'form-message success';
            formMessage.style.display = 'block';
            contactForm.reset();
          } else {
            const data = await response.json();
            formMessage.textContent = data.error || '提交失败，请稍后重试。';
            formMessage.className = 'form-message error';
            formMessage.style.display = 'block';
          }
        } catch (error) {
          console.error('Form submission error:', error);
          formMessage.textContent = '网络错误，请检查 Formspree 表单 ID 是否正确配置';
          formMessage.className = 'form-message error';
          formMessage.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          const submitText = submitBtn.dataset.textSubmit || '提交';
          submitBtn.textContent = submitText;
          
          setTimeout(() => {
            formMessage.style.display = 'none';
          }, 5000);
        }
      });
    }
  }
  
  validateContactForm() {
    const form = document.getElementById('contact-form');
    const fields = form.querySelectorAll('input, textarea');
    let isValid = true;
    
    fields.forEach(field => {
      if (!this.validateContactField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  validateContactField(field) {
    const value = field.value.trim();
    const id = field.id;
    
    // 清除之前的错误信息
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('field-error')) {
      errorElement.remove();
    }
    
    if (field.hasAttribute('required') && value === '') {
      this.showFieldError(field, '此字段为必填项');
      return false;
    }
    
    if (id === 'email' && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showFieldError(field, '请输入有效的邮箱地址');
        return false;
      }
    }
    
    return true;
  }
  
  showFieldError(field, message) {
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('field-error')) {
      errorElement = document.createElement('div');
      errorElement.classList.add('field-error');
      errorElement.style.cssText = `
        color: #dc2626;
        font-size: 12px;
        margin-top: 4px;
      `;
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    errorElement.textContent = message;
  }
}

// 导出类
window.FrontendEvents = FrontendEvents;