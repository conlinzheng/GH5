class I18n {
  constructor() {
    this.currentLang = config.get('i18n.defaultLang', 'zh');
    this.defaultLang = config.get('i18n.defaultLang', 'zh');
    this.supportedLangs = config.get('i18n.supportedLangs', ['zh', 'en', 'ko']);
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
        },
        admin: {
          title: 'GH5 后台管理',
          subtitle: '扫描、管理、更新和编辑首页显示所需的文件',
          nav: {
            scan: '扫描文件',
            scanNew: '🔍 扫描新增产品',
            refresh: '刷新数据',
            clearCache: '清除缓存',
            regenerate: '🔄 重新生成JSON',
            export: '导出数据',
            import: '导入数据',
            setToken: '设置 API 密钥'
          },
          sections: {
            series: '系列管理',
            files: '文件管理',
            edit: '编辑产品数据',
            status: '系统状态'
          },
          buttons: {
            saveSeries: '💾 保存系列顺序',
            saveProduct: '💾 保存产品顺序',
            toggleImages: '一键折叠/展开所有图片',
            batchEdit: '批量编辑',
            translate: '自动翻译',
            applyBatch: '应用批量编辑',
            saveProductData: '💾 保存产品数据'
          },
          labels: {
            productName: '产品名称',
            price: '价格',
            description: '产品描述',
            upperMaterial: '鞋面材质',
            innerMaterial: '内里材质',
            soleMaterial: '鞋底材质',
            customizable: '是否支持定制',
            minOrder: '起订量',
            tags: '标签 (用逗号分隔)',
            series: '所属系列',
            image: '图片文件名'
          },
          placeholders: {
            tags: '例如: 新品,热销'
          },
          status: {
            lastScan: '最后扫描时间',
            cacheStatus: '缓存状态',
            productCount: '产品总数',
            seriesCount: '系列总数'
          },
          messages: {
            scanning: '正在扫描...',
            scanComplete: '扫描完成',
            scanNew: '正在扫描新增产品...',
            noNewProducts: '没有发现新增产品',
            newProductsFound: '发现 {count} 个新增产品',
            savingNew: '正在保存新增产品...',
            saveSuccess: '成功保存 {count} 个新增产品',
            regenerating: '开始重新生成 JSON 文件...',
            regenerateComplete: 'JSON 重新生成完成！成功: {success}, 失败: {error}',
            batchApplied: '批量编辑已应用',
            translateStart: '翻译中...',
            translateComplete: '翻译完成',
            translateError: '翻译失败，请稍后重试',
            apiTokenSet: 'API 密钥设置成功',
            apiTokenError: 'API 密钥设置失败: {error}',
            apiTokenInvalid: 'API 密钥无效或已过期，请重新设置',
            apiRateLimit: 'API 请求频率超限，请稍后再试',
            pathNotFound: '文件路径不存在',
            dataFormatError: '数据格式错误，请检查输入',
            noHistory: '暂无历史记录',
            noProductHistory: '暂无该产品的历史记录',
            enterChineseFirst: '请先填写中文内容',
            confirmDeleteProduct: '确定要删除这个产品吗？',
            productInfo: '产品信息:',
            seriesInfo: '系列信息:',
            enterNewSeriesName: '请输入新的系列显示名称:',
            selectSeriesFirst: '请先选择一个系列',
            series: '系列: {name}',
            productCount: '产品数量: {count}',
            productList: '产品列表:'
          },
          confirmations: {
            regenerate: '确定要重新生成所有 products.json 文件吗？\n\n此操作将：\n1. 扫描每个系列目录下的所有图片\n2. 自动根据图片文件名生成产品数据\n3. 覆盖现有的 products.json 文件\n\n建议：此操作前请备份现有数据！',
            setApiToken: '请输入 GitHub API 密钥:',
            apiTokenConfirm: 'API 密钥无效，请设置 GitHub API 密钥以继续操作。'
          },
          batchEdit: {
            title: '批量编辑',
            allLanguages: '所有语言',
            name: '产品名称',
            description: '描述',
            price: '价格'
          },
          language: {
            zh: '中文',
            en: '英文',
            ko: '韩文'
          }
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
        },
        admin: {
          title: 'GH5 Admin',
          subtitle: 'Scan, manage, update and edit files needed for homepage display',
          nav: {
            scan: 'Scan Files',
            scanNew: '🔍 Scan New Products',
            refresh: 'Refresh Data',
            clearCache: 'Clear Cache',
            regenerate: '🔄 Regenerate JSON',
            export: 'Export Data',
            import: 'Import Data',
            setToken: 'Set API Token'
          },
          sections: {
            series: 'Series Management',
            files: 'File Management',
            edit: 'Edit Product Data',
            status: 'System Status'
          },
          buttons: {
            saveSeries: '💾 Save Series Order',
            saveProduct: '💾 Save Product Order',
            toggleImages: 'Toggle All Images',
            batchEdit: 'Batch Edit',
            translate: 'Auto Translate',
            applyBatch: 'Apply Batch Edit',
            saveProductData: '💾 Save Product Data'
          },
          labels: {
            productName: 'Product Name',
            price: 'Price',
            description: 'Product Description',
            upperMaterial: 'Upper Material',
            innerMaterial: 'Inner Material',
            soleMaterial: 'Sole Material',
            customizable: 'Customizable',
            minOrder: 'Minimum Order',
            tags: 'Tags (comma separated)',
            series: 'Series',
            image: 'Image Filename'
          },
          placeholders: {
            tags: 'e.g., New,Hot'
          },
          status: {
            lastScan: 'Last Scanned',
            cacheStatus: 'Cache Status',
            productCount: 'Total Products',
            seriesCount: 'Total Series'
          },
          messages: {
            scanning: 'Scanning...',
            scanComplete: 'Scan Complete',
            scanNew: 'Scanning for new products...',
            noNewProducts: 'No new products found',
            newProductsFound: '{count} new products found',
            savingNew: 'Saving new products...',
            saveSuccess: 'Successfully saved {count} new products',
            regenerating: 'Starting to regenerate JSON files...',
            regenerateComplete: 'JSON regeneration completed! Success: {success}, Failed: {error}',
            batchApplied: 'Batch edit applied',
            translateStart: 'Translating...',
            translateComplete: 'Translation completed',
            translateError: 'Translation failed, please try again',
            apiTokenSet: 'API token set successfully',
            apiTokenError: 'API token setting failed: {error}',
            apiTokenInvalid: 'API token is invalid or expired, please reset',
            apiRateLimit: 'API rate limit exceeded, please try again later',
            pathNotFound: 'File path does not exist',
            dataFormatError: 'Data format error, please check input',
            noHistory: 'No history records',
            noProductHistory: 'No history records for this product',
            enterChineseFirst: 'Please enter Chinese content first',
            confirmDeleteProduct: 'Are you sure you want to delete this product?',
            productInfo: 'Product Information:',
            seriesInfo: 'Series Information:',
            enterNewSeriesName: 'Please enter new series display name:',
            selectSeriesFirst: 'Please select a series first',
            series: 'Series: {name}',
            productCount: 'Product Count: {count}',
            productList: 'Product List:'
          },
          confirmations: {
            regenerate: 'Are you sure you want to regenerate all products.json files?\n\nThis will:\n1. Scan all images in each series directory\n2. Automatically generate product data based on image filenames\n3. Overwrite existing products.json files\n\nRecommendation: Backup existing data before this operation!',
            setApiToken: 'Please enter GitHub API token:',
            apiTokenConfirm: 'API token is invalid, please set GitHub API token to continue.'
          },
          batchEdit: {
            title: 'Batch Edit',
            allLanguages: 'All Languages',
            name: 'Product Name',
            description: 'Description',
            price: 'Price'
          },
          language: {
            zh: 'Chinese',
            en: 'English',
            ko: 'Korean'
          }
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
        },
        admin: {
          title: 'GH5 관리자',
          subtitle: '홈페이지 표시에 필요한 파일을 스캔, 관리, 업데이트 및 편집',
          nav: {
            scan: '파일 스캔',
            scanNew: '🔍 새 제품 스캔',
            refresh: '데이터 새로 고침',
            clearCache: '캐시 지우기',
            regenerate: '🔄 JSON 재생성',
            export: '데이터 내보내기',
            import: '데이터 가져오기',
            setToken: 'API 토큰 설정'
          },
          sections: {
            series: '시리즈 관리',
            files: '파일 관리',
            edit: '제품 데이터 편집',
            status: '시스템 상태'
          },
          buttons: {
            saveSeries: '💾 시리즈 순서 저장',
            saveProduct: '💾 제품 순서 저장',
            toggleImages: '모든 이미지 접기/펼치기',
            batchEdit: '일괄 편집',
            translate: '자동 번역',
            applyBatch: '일괄 편집 적용',
            saveProductData: '💾 제품 데이터 저장'
          },
          labels: {
            productName: '제품 이름',
            price: '가격',
            description: '제품 설명',
            upperMaterial: '윗부분 재질',
            innerMaterial: '안쪽 재질',
            soleMaterial: '솔 재질',
            customizable: '맞춤 제작 지원',
            minOrder: '최소 주문량',
            tags: '태그 (쉼표로 구분)',
            series: '소속 시리즈',
            image: '이미지 파일명'
          },
          placeholders: {
            tags: '예: 신제품,인기'
          },
          status: {
            lastScan: '마지막 스캔 시간',
            cacheStatus: '캐시 상태',
            productCount: '총 제품 수',
            seriesCount: '총 시리즈 수'
          },
          messages: {
            scanning: '스캔 중...',
            scanComplete: '스캔 완료',
            scanNew: '새 제품 스캔 중...',
            noNewProducts: '새 제품을 찾지 못했습니다',
            newProductsFound: '{count}개의 새 제품 발견',
            savingNew: '새 제품 저장 중...',
            saveSuccess: '{count}개의 새 제품이 성공적으로 저장됨',
            regenerating: 'JSON 파일 재생성 시작...',
            regenerateComplete: 'JSON 재생성 완료! 성공: {success}, 실패: {error}',
            batchApplied: '일괄 편집이 적용되었습니다',
            translateStart: '번역 중...',
            translateComplete: '번역 완료',
            translateError: '번역 실패, 다시 시도하세요',
            apiTokenSet: 'API 토큰이 성공적으로 설정되었습니다',
            apiTokenError: 'API 토큰 설정 실패: {error}',
            apiTokenInvalid: 'API 토큰이 유효하지 않거나 만료되었습니다. 다시 설정하세요',
            apiRateLimit: 'API 요청 한도 초과, 나중에 다시 시도하세요',
            pathNotFound: '파일 경로가 존재하지 않습니다',
            dataFormatError: '데이터 형식 오류, 입력을 확인하세요',
            noHistory: '역사 기록이 없습니다',
            noProductHistory: '이 제품에 대한 역사 기록이 없습니다',
            enterChineseFirst: '먼저 중국어 내용을 입력하세요',
            confirmDeleteProduct: '이 제품을 삭제하시겠습니까?',
            productInfo: '제품 정보:',
            seriesInfo: '시리즈 정보:',
            enterNewSeriesName: '새 시리즈 표시 이름을 입력하세요:',
            selectSeriesFirst: '먼저 시리즈를 선택하세요',
            series: '시리즈: {name}',
            productCount: '제품 수: {count}',
            productList: '제품 목록:'
          },
          confirmations: {
            regenerate: '모든 products.json 파일을 재생성하시겠습니까?\n\n이 작업은:\n1. 각 시리즈 디렉터리의 모든 이미지를 스캔합니다\n2. 이미지 파일명을 기반으로 제품 데이터를 자동으로 생성합니다\n3. 기존 products.json 파일을 덮어씁니다\n\n권장: 이 작업 전에 기존 데이터를 백업하세요!',
            setApiToken: 'GitHub API 토큰을 입력하세요:',
            apiTokenConfirm: 'API 토큰이 유효하지 않습니다. 계속하려면 GitHub API 토큰을 설정하세요.'
          },
          batchEdit: {
            title: '일괄 편집',
            allLanguages: '모든 언어',
            name: '제품 이름',
            description: '설명',
            price: '가격'
          },
          language: {
            zh: '중국어',
            en: '영어',
            ko: '한국어'
          }
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