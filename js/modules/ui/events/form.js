class FormEvents {
  constructor() {
    this.frontend = null;
  }

  setupFormEventListeners() {
    // 获取frontend实例
    this.frontend = window.frontend || window.GH5?.coreApp;
    if (!this.frontend) return;
    
    // 联系表单提交
    this._setupContactFormListener();
  }

  _setupContactFormListener() {
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

  handleFormSubmit(formData) {
    // 处理表单提交事件
    // 这里可以实现表单提交的逻辑
  }
}

const formEvents = new FormEvents();
export default formEvents;