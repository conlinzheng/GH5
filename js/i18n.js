class I18n {
  constructor() {
    this.currentLang = config.get('i18n.defaultLang', 'zh');
    this.defaultLang = config.get('i18n.defaultLang', 'zh');
    this.supportedLangs = config.get('i18n.supportedLangs', ['zh', 'en', 'ko']);
    this.translations = {}; // 从 config.json 加载
    this.translationDictionary = {}; // 翻译词典
    this._isReady = false;
    this._languageToggleHandler = null; // 初始化语言切换按钮事件处理器
  }

  init() {
    try {
      this._initializeLanguage();
      this.loadTranslationsFromConfig();
      this._isReady = true;
      this.updateLanguage();
      this._dispatchLanguageChanged();
      this._syncWithFrontend();
      this._setupLanguageToggle();
    } catch (error) {
      errorHandler.handleError(error, errorHandler.errorTypes.DOM, '国际化初始化失败');
      this.currentLang = this.defaultLang;
      this._isReady = true;
    }
  }
  
  // 初始化语言设置
  _initializeLanguage() {
    const savedLang = localStorage.getItem('gh5_language');
    if (savedLang && this.supportedLangs.includes(savedLang)) {
      this.currentLang = savedLang;
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (this.supportedLangs.includes(browserLang)) {
        this.currentLang = browserLang;
      }
    }
  }
  
  // 同步前端状态
  _syncWithFrontend() {
    if (typeof frontendCore !== 'undefined' && frontendCore.state && frontendCore.state.siteConfig) {
      const configLang = frontendCore.state.siteConfig.pageSettings?.defaultLanguage;
      if (configLang && this.supportedLangs.includes(configLang)) {
        this.currentLang = configLang;
        this.updateLanguage();
      }
      frontendCore.state.currentLang = this.currentLang;
      this._updateFrontendComponents();
    }
  }
  
  // 更新前端组件
  _updateFrontendComponents() {
    if (typeof frontendCore !== 'undefined') {
      if (frontendCore.updateFooter) frontendCore.updateFooter();
      if (frontendCore.updateCarousel) frontendCore.updateCarousel();
      if (frontendCore.updateFormLabels) frontendCore.updateFormLabels();
    }
  }
  
  // 设置语言切换按钮
  _setupLanguageToggle() {
    const langBtn = document.getElementById('language-toggle');
    if (langBtn) {
      // 移除可能存在的旧监听器
      if (this._languageToggleHandler) {
        langBtn.removeEventListener('click', this._languageToggleHandler);
      }
      
      // 创建并绑定新的事件处理函数
      this._languageToggleHandler = () => {
        this._cycleLanguage();
      };
      
      langBtn.addEventListener('click', this._languageToggleHandler);
      console.log('Language toggle button event listener added');
    } else {
      console.warn('Language toggle button not found');
    }
  }
  
  // 循环切换语言
  _cycleLanguage() {
    const currentIndex = this.supportedLangs.indexOf(this.currentLang);
    const nextIndex = (currentIndex + 1) % this.supportedLangs.length;
    this.switchLanguage(this.supportedLangs[nextIndex]);
  }
  
  // 从 config.json 加载翻译数据
  loadTranslationsFromConfig() {
    try {
      if (typeof frontendCore !== 'undefined' && frontendCore.state && frontendCore.state.siteConfig) {
        const config = frontendCore.state.siteConfig;
        this._loadTranslationDictionary(config);
        this._loadPageTranslations(config);
      }
    } catch (error) {
      errorHandler.handleError(error, errorHandler.errorTypes.DOM, '加载翻译数据失败');
    }
  }
  
  // 加载翻译词典
  _loadTranslationDictionary(config) {
    if (config.translations) {
      this.translationDictionary = config.translations;
    }
  }
  
  // 加载页面翻译
  _loadPageTranslations(config) {
    if (config.pageSettings) {
      this.translations = {
        zh: this._getLangTranslations('zh', config.pageSettings),
        en: this._getLangTranslations('en', config.pageSettings),
        ko: this._getLangTranslations('ko', config.pageSettings)
      };
    }
  }
  
  // 获取特定语言的翻译
  _getLangTranslations(lang, pageSettings) {
    return {
      site: {
        title: pageSettings.title?.[lang] || 'GH5',
        description: lang === 'zh' ? '专业鞋类制造商' : lang === 'en' ? 'Professional Shoe Manufacturer' : '전문 신발 제조업체'
      },
      header: {
        logo: lang === 'zh' ? 'GH5鞋业' : lang === 'en' ? 'GH5 Shoes' : 'GH5 신발',
        language: lang === 'zh' ? '语言' : lang === 'en' ? 'Language' : '언어'
      },
      carousel: {
        welcome: pageSettings.carouselWelcome?.[lang] || (lang === 'zh' ? '欢迎来到 GH5' : lang === 'en' ? 'Welcome to GH5' : 'GH5에 오신 것을 환영합니다'),
        description: pageSettings.carouselDescription?.[lang] || (lang === 'zh' ? '探索我们的优质产品' : lang === 'en' ? 'Explore our quality products' : '저희 품질 제품을 탐색하세요')
      },
      search: {
        placeholder: pageSettings.searchPlaceholder?.[lang] || (lang === 'zh' ? '搜索产品...' : lang === 'en' ? 'Search products...' : '제품 검색...'),
        button: lang === 'zh' ? '搜索' : lang === 'en' ? 'Search' : '검색'
      },
      products: {
        loading: pageSettings.loadingText?.[lang] || (lang === 'zh' ? '加载中...' : lang === 'en' ? 'Loading...' : '로딩 중...'),
        noResults: pageSettings.noProductsText?.[lang] || (lang === 'zh' ? '没有找到产品' : lang === 'en' ? 'No products found' : '제품을 찾을 수 없습니다'),
        viewDetails: pageSettings.viewDetailsText?.[lang] || (lang === 'zh' ? '查看详情' : lang === 'en' ? 'View Details' : '세부 정보 보기')
      },
      contact: {
        title: pageSettings.contactUsText?.[lang] || (lang === 'zh' ? '联系我们' : lang === 'en' ? 'Contact Us' : '문의하기'),
        name: lang === 'zh' ? '姓名' : lang === 'en' ? 'Name' : '이름',
        email: lang === 'zh' ? '邮箱' : lang === 'en' ? 'Email' : '이메일',
        message: lang === 'zh' ? '留言' : lang === 'en' ? 'Message' : '메시지',
        submit: lang === 'zh' ? '提交' : lang === 'en' ? 'Submit' : '제출',
        success: lang === 'zh' ? '提交成功！' : lang === 'en' ? 'Submitted successfully!' : '성공적으로 제출되었습니다!',
        error: lang === 'zh' ? '提交失败，请重试' : lang === 'en' ? 'Submission failed, please try again' : '제출 실패, 다시 시도하세요'
      },
      footer: {
        copyright: pageSettings.footerText?.[lang] || '© 2026 GH5. All rights reserved.'
      },
      modal: {
        close: lang === 'zh' ? '关闭' : lang === 'en' ? 'Close' : '닫기',
        previous: lang === 'zh' ? '上一张' : lang === 'en' ? 'Previous' : '이전',
        next: lang === 'zh' ? '下一张' : lang === 'en' ? 'Next' : '다음'
      }
    };
  }

  switchLanguage(lang) {
    if (!this.supportedLangs.includes(lang)) {
      errorHandler.handleError(new Error(`Language ${lang} is not supported`), errorHandler.errorTypes.VALIDATION);
      return false;
    }

    try {
      this.currentLang = lang;
      localStorage.setItem('gh5_language', lang);
      this.loadTranslationsFromConfig();
      this.updateLanguage();
      this._dispatchLanguageChanged();
      this._syncWithFrontend();
      return true;
    } catch (error) {
      errorHandler.handleError(error, errorHandler.errorTypes.DOM, '切换语言失败');
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
      errorHandler.handleError(error, errorHandler.errorTypes.DOM, '翻译处理失败');
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
      errorHandler.handleError(error, errorHandler.errorTypes.DOM, '导出翻译数据失败');
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
      errorHandler.handleError(error, errorHandler.errorTypes.VALIDATION, '导入翻译数据失败');
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