import config from './config.js';

class I18n {
  constructor(frontendInstance = null) {
    this.currentLang = config.get('i18n.defaultLang', 'zh');
    this.defaultLang = config.get('i18n.defaultLang', 'zh');
    this.supportedLangs = config.get('i18n.supportedLangs', ['zh', 'en', 'ko']);
    this.frontend = frontendInstance;
    this.translations = {
      zh: {
        site: {
          title: 'GH5',
          description: '产品展示网站'
        },
        header: {
          logo: 'GH5',
          language: '语言'
        },
        carousel: {
          welcome: '欢迎来到 GH5',
          description: '探索我们的优质产品'
        },
        search: {
          placeholder: '搜索产品...',
          button: '搜索'
        },
        products: {
          loading: '加载中...',
          noResults: '没有找到产品',
          viewDetails: '查看详情'
        },
        contact: {
          title: '联系我们',
          name: '姓名',
          email: '邮箱',
          message: '留言',
          submit: '提交',
          success: '提交成功！',
          error: '提交失败，请重试'
        },
        footer: {
          copyright: '© 2026 GH5. All rights reserved.'
        },
        modal: {
          close: '关闭',
          previous: '上一张',
          next: '下一张'
        }
      },
      en: {
        site: {
          title: 'GH5',
          description: 'Product Showcase'
        },
        header: {
          logo: 'GH5',
          language: 'Language'
        },
        carousel: {
          welcome: 'Welcome to GH5',
          description: 'Explore our quality products'
        },
        search: {
          placeholder: 'Search products...',
          button: 'Search'
        },
        products: {
          loading: 'Loading...',
          noResults: 'No products found',
          viewDetails: 'View Details'
        },
        contact: {
          title: 'Contact Us',
          name: 'Name',
          email: 'Email',
          message: 'Message',
          submit: 'Submit',
          success: 'Submitted successfully!',
          error: 'Submission failed, please try again'
        },
        footer: {
          copyright: '© 2026 GH5. All rights reserved.'
        },
        modal: {
          close: 'Close',
          previous: 'Previous',
          next: 'Next'
        }
      },
      ko: {
        site: {
          title: 'GH5',
          description: '제품 전시'
        },
        header: {
          logo: 'GH5',
          language: '언어'
        },
        carousel: {
          welcome: 'GH5에 오신 것을 환영합니다',
          description: '우리의 고품질 제품을 탐험하세요'
        },
        search: {
          placeholder: '제품 검색...',
          button: '검색'
        },
        products: {
          loading: '로딩 중...',
          noResults: '제품을 찾을 수 없습니다',
          viewDetails: '세부 정보 보기'
        },
        contact: {
          title: '문의하기',
          name: '이름',
          email: '이메일',
          message: '메시지',
          submit: '제출',
          success: '성공적으로 제출되었습니다!',
          error: '제출 실패, 다시 시도하세요'
        },
        footer: {
          copyright: '© 2026 GH5. All rights reserved.'
        },
        modal: {
          close: '닫기',
          previous: '이전',
          next: '다음'
        }
      }
    };
    this.isReady = false;
  }

  /**
   * 设置frontend实例
   * @param {Object} frontendInstance - frontend实例
   */
  setFrontend(frontendInstance) {
    if (frontendInstance && typeof frontendInstance === 'object') {
      this.frontend = frontendInstance;
    }
  }

  /**
   * 获取frontend实例
   * @returns {Object|null} frontend实例
   */
  getFrontend() {
    return this.frontend;
  }

  init() {
    try {
      const savedLang = localStorage.getItem('gh5_language');
      if (savedLang && this.supportedLangs.includes(savedLang)) {
        this.currentLang = savedLang;
      } else {
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLangs.includes(browserLang)) {
          this.currentLang = browserLang;
        }
      }

      this.isReady = true;
      this.updateLanguage();
      this._dispatchLanguageChanged();
      
      // 使用注入的frontend实例，而不是全局变量
      const frontendInstance = this.frontend;
      if (frontendInstance && frontendInstance.state && frontendInstance.state.siteConfig) {
        const configLang = frontendInstance.state.siteConfig.pageSettings?.defaultLanguage;
        if (configLang && this.supportedLangs.includes(configLang)) {
          this.currentLang = configLang;
          this.updateLanguage();
        }
        frontendInstance.state.currentLang = this.currentLang;
        // 安全调用frontend方法
        if (typeof frontendInstance.updateFooter === 'function') {
          frontendInstance.updateFooter();
        }
        if (typeof frontendInstance.updateCarousel === 'function') {
          frontendInstance.updateCarousel();
        }
        if (typeof frontendInstance.updateFormLabels === 'function') {
          frontendInstance.updateFormLabels();
        }
      }
      
      const langBtn = document.getElementById('language-toggle');
      if (langBtn) {
        // 移除可能存在的旧监听器（需要先检查是否存在）
        if (this._languageToggleHandler) {
          langBtn.removeEventListener('click', this._languageToggleHandler);
        }
        
        // 创建并绑定新的事件处理函数
        this._languageToggleHandler = () => {
          const currentIndex = this.supportedLangs.indexOf(this.currentLang);
          const nextIndex = (currentIndex + 1) % this.supportedLangs.length;
          this.switchLanguage(this.supportedLangs[nextIndex]);
        };
        
        langBtn.addEventListener('click', this._languageToggleHandler);
        console.log('Language toggle button event listener added');
      } else {
        console.warn('Language toggle button not found');
      }
    } catch (error) {
      console.error('I18n init error:', error);
      this.currentLang = this.defaultLang;
      this.isReady = true;
    }
  }

  switchLanguage(lang) {
    // 参数验证
    if (!lang || typeof lang !== 'string') {
      console.warn('Language parameter must be a non-empty string');
      return false;
    }
    
    if (!this.supportedLangs.includes(lang)) {
      console.warn(`Language ${lang} is not supported`);
      return false;
    }

    try {
      this.currentLang = lang;
      localStorage.setItem('gh5_language', lang);
      this.updateLanguage();
      this._dispatchLanguageChanged();
      
      // 使用注入的frontend实例，而不是全局变量
      const frontendInstance = this.frontend;
      if (frontendInstance && frontendInstance.state) {
        frontendInstance.state.currentLang = lang;
        // 安全调用frontend方法
        if (typeof frontendInstance.updateFooter === 'function') {
          frontendInstance.updateFooter();
        }
        if (typeof frontendInstance.updateCarousel === 'function') {
          frontendInstance.updateCarousel();
        }
        if (typeof frontendInstance.updateFormLabels === 'function') {
          frontendInstance.updateFormLabels();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Switch language error:', error);
      return false;
    }
  }

  t(key) {
    // 参数验证
    if (!key || typeof key !== 'string') {
      console.warn('Translation key must be a non-empty string');
      return String(key);
    }
    
    try {
      const keys = key.split('.');
      let value = this.translations[this.currentLang];

      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      return value || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  }

  getLocalizedField(obj, field) {
    // 参数验证
    if (!obj || typeof obj !== 'object') {
      return '';
    }
    if (!field || typeof field !== 'string') {
      return '';
    }

    if (obj[field] && typeof obj[field] === 'object' && obj[field][this.currentLang]) {
      return obj[field][this.currentLang];
    }

    if (obj[field]) {
      return obj[field];
    }

    return '';
  }

  getCurrentLanguage() {
    return this.currentLang;
  }

  getSupportedLanguages() {
    return this.supportedLangs;
  }

  getLanguageName(lang) {
    // 参数验证
    if (!lang || typeof lang !== 'string') {
      return '';
    }
    
    const names = {
      zh: '中文',
      en: 'English',
      ko: '한국어'
    };
    return names[lang] || lang;
  }

  isReadyState() {
    return this.isReady;
  }

  exportTranslations() {
    try {
      return JSON.stringify(this.translations, null, 2);
    } catch (error) {
      console.error('Export translations error:', error);
      return '{}';
    }
  }

  importTranslations(jsonString) {
    // 参数验证
    if (!jsonString || typeof jsonString !== 'string') {
      console.error('Import translations error: jsonString must be a non-empty string');
      return false;
    }
    
    try {
      const data = JSON.parse(jsonString);
      
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid translations format');
      }

      for (const lang of this.supportedLangs) {
        if (data[lang]) {
          this.translations[lang] = {
            ...this.translations[lang],
            ...data[lang]
          };
        }
      }

      return true;
    } catch (error) {
      console.error('Import translations error:', error);
      return false;
    }
  }

  updateLanguage() {
    this.updatePageElements();
    this._updateLanguageButton();
  }

  _updateLanguageButton() {
    const langBtn = document.getElementById('language-toggle');
    if (langBtn) {
      const langText = langBtn.querySelector('.lang-text');
      if (langText) {
        langText.textContent = this.currentLang.toUpperCase();
      }
    }
  }

  _dispatchLanguageChanged() {
    const event = new CustomEvent('languageChanged', {
      detail: {
        language: this.currentLang
      }
    });
    document.dispatchEvent(event);
  }

  updatePageElements() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);
      
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });
  }
}

const i18n = new I18n();
export default i18n;