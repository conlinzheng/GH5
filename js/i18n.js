class I18n {
  constructor() {
    this.currentLang = 'zh';
    this.defaultLang = 'zh';
    this.supportedLangs = ['zh', 'en', 'ko'];
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
      this._updateLanguageDisplay();
      this._dispatchLanguageChanged();
    } catch (error) {
      console.error('I18n init error:', error);
      this.currentLang = this.defaultLang;
      this.isReady = true;
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
      this._updateLanguageDisplay();
      this._dispatchLanguageChanged();
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

    const localizedField = `${field}_${this.currentLang}`;
    if (obj[localizedField]) {
      return obj[localizedField];
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

  _updateLanguageDisplay() {
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