class I18n {
  constructor() {
    this.currentLang = config.get('i18n.defaultLang', 'zh');
    this.defaultLang = config.get('i18n.defaultLang', 'zh');
    this.supportedLangs = config.get('i18n.supportedLangs', ['zh', 'en', 'ko']);
    this.translations = {}; // 从 config.json 加载
    this.translationDictionary = {}; // 翻译词典
    this._isReady = false;
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

      // 从 config.json 加载翻译数据
      this.loadTranslationsFromConfig();

      this._isReady = true;
      this.updateLanguage();
      this._dispatchLanguageChanged();
      
      if (typeof frontend !== 'undefined' && frontend.state && frontend.state.siteConfig) {
        const configLang = frontend.state.siteConfig.pageSettings?.defaultLanguage;
        if (configLang && this.supportedLangs.includes(configLang)) {
          this.currentLang = configLang;
          this.updateLanguage();
        }
        frontend.state.currentLang = this.currentLang;
        frontend.updateFooter();
        frontend.updateCarousel();
        frontend.updateFormLabels();
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
      this._isReady = true;
    }
  }
  
  // 从 config.json 加载翻译数据
  loadTranslationsFromConfig() {
    try {
      if (typeof frontend !== 'undefined' && frontend.state && frontend.state.siteConfig) {
        const config = frontend.state.siteConfig;
        
        // 加载翻译词典
        if (config.translations) {
          this.translationDictionary = config.translations;
        }
        
        // 加载页面设置中的翻译
        if (config.pageSettings) {
          this.translations = {
            zh: {
              site: {
                title: config.pageSettings.title?.zh || 'GH5',
                description: config.siteInfo?.companyDescription?.zh || '产品展示网站'
              },
              header: {
                logo: config.siteInfo?.companyName?.zh || 'GH5',
                language: '语言'
              },
              carousel: {
                welcome: config.pageSettings.carouselWelcome?.zh || '欢迎来到 GH5',
                description: config.pageSettings.carouselDescription?.zh || '探索我们的优质产品'
              },
              search: {
                placeholder: config.pageSettings.searchPlaceholder?.zh || '搜索产品...',
                button: '搜索'
              },
              products: {
                loading: config.pageSettings.loadingText?.zh || '加载中...',
                noResults: config.pageSettings.noProductsText?.zh || '没有找到产品',
                viewDetails: config.pageSettings.viewDetailsText?.zh || '查看详情'
              },
              contact: {
                title: config.pageSettings.contactUsText?.zh || '联系我们',
                name: '姓名',
                email: '邮箱',
                message: '留言',
                submit: '提交',
                success: '提交成功！',
                error: '提交失败，请重试'
              },
              footer: {
                copyright: config.pageSettings.footerText?.zh || '© 2026 GH5. All rights reserved.'
              },
              modal: {
                close: '关闭',
                previous: '上一张',
                next: '下一张'
              }
            },
            en: {
              site: {
                title: config.pageSettings.title?.en || 'GH5',
                description: config.siteInfo?.companyDescription?.en || 'Product Showcase'
              },
              header: {
                logo: config.siteInfo?.companyName?.en || 'GH5',
                language: 'Language'
              },
              carousel: {
                welcome: config.pageSettings.carouselWelcome?.en || 'Welcome to GH5',
                description: config.pageSettings.carouselDescription?.en || 'Explore our quality products'
              },
              search: {
                placeholder: config.pageSettings.searchPlaceholder?.en || 'Search products...',
                button: 'Search'
              },
              products: {
                loading: config.pageSettings.loadingText?.en || 'Loading...',
                noResults: config.pageSettings.noProductsText?.en || 'No products found',
                viewDetails: config.pageSettings.viewDetailsText?.en || 'View Details'
              },
              contact: {
                title: config.pageSettings.contactUsText?.en || 'Contact Us',
                name: 'Name',
                email: 'Email',
                message: 'Message',
                submit: 'Submit',
                success: 'Submitted successfully!',
                error: 'Submission failed, please try again'
              },
              footer: {
                copyright: config.pageSettings.footerText?.en || '© 2026 GH5. All rights reserved.'
              },
              modal: {
                close: 'Close',
                previous: 'Previous',
                next: 'Next'
              }
            },
            ko: {
              site: {
                title: config.pageSettings.title?.ko || 'GH5',
                description: config.siteInfo?.companyDescription?.ko || '제품 전시'
              },
              header: {
                logo: config.siteInfo?.companyName?.ko || 'GH5',
                language: '언어'
              },
              carousel: {
                welcome: config.pageSettings.carouselWelcome?.ko || 'GH5에 오신 것을 환영합니다',
                description: config.pageSettings.carouselDescription?.ko || '저희 품질 제품을 탐색하세요'
              },
              search: {
                placeholder: config.pageSettings.searchPlaceholder?.ko || '제품 검색...',
                button: '검색'
              },
              products: {
                loading: config.pageSettings.loadingText?.ko || '로딩 중...',
                noResults: config.pageSettings.noProductsText?.ko || '제품을 찾을 수 없습니다',
                viewDetails: config.pageSettings.viewDetailsText?.ko || '세부 정보 보기'
              },
              contact: {
                title: config.pageSettings.contactUsText?.ko || '문의하기',
                name: '이름',
                email: '이메일',
                message: '메시지',
                submit: '제출',
                success: '성공적으로 제출되었습니다!',
                error: '제출 실패, 다시 시도하세요'
              },
              footer: {
                copyright: config.pageSettings.footerText?.ko || '© 2026 GH5. All rights reserved.'
              },
              modal: {
                close: '닫기',
                previous: '이전',
                next: '다음'
              }
            }
          };
        }
      }
    } catch (error) {
      console.error('Load translations from config error:', error);
    }
  }

  switchLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) {
      console.warn(`Language ${lang} is not supported`);
      return false;
    }

    try {
      this.currentLang = lang;
      localStorage.setItem('gh5_language', lang);
      // 重新加载翻译数据
      this.loadTranslationsFromConfig();
      this.updateLanguage();
      this._dispatchLanguageChanged();
      
      if (typeof frontend !== 'undefined' && frontend.state) {
        frontend.state.currentLang = lang;
        frontend.updateFooter();
        frontend.updateCarousel();
        frontend.updateFormLabels();
      }
      
      return true;
    } catch (error) {
      console.error('Switch language error:', error);
      return false;
    }
  }

  t(key) {
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
    if (!obj || !field) {
      return '';
    }

    if (obj[field] && typeof obj[field] === 'object' && obj[field][this.currentLang]) {
      return obj[field][this.currentLang];
    }

    // 从翻译词典中查找译文
    if (obj[field] && typeof obj[field] === 'object' && obj[field].zh) {
      const zhText = obj[field].zh;
      if (this.translationDictionary[zhText] && this.translationDictionary[zhText][this.currentLang]) {
        return this.translationDictionary[zhText][this.currentLang];
      }
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
    const names = {
      zh: '中文',
      en: 'English',
      ko: '한국어'
    };
    return names[lang] || lang;
  }

  isReady() {
    return this._isReady;
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
    try {
      const data = JSON.parse(jsonString);
      
      if (typeof data !== 'object') {
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