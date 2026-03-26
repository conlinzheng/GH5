class Frontend {
  constructor() {
    this.config = {
      cacheTTL: 3600,
      itemsPerPage: 12,
      github: {
        owner: typeof config !== 'undefined' ? config.get('github.owner', 'conlinzheng') : 'conlinzheng',
        repo: typeof config !== 'undefined' ? config.get('github.repo', 'GH5') : 'GH5',
        branch: typeof config !== 'undefined' ? config.get('github.branch', 'main') : 'main',
        productsPath: typeof config !== 'undefined' ? config.get('github.productsPath', '产品图') : '产品图'
      }
    };
    
    this.state = {
      products: [],
      allProducts: [],
      series: [],
      seriesNameMap: {},
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      selectedSeries: null,
      siteConfig: null,
      currentLang: 'zh',
      translations: {}
    };
    
    this.currentLightboxImages = [];
    this.currentLightboxIndex = 0;
    
    // 初始化模块
    this.events = new FrontendEvents(this);
    this.products = new FrontendProducts(this);
    this.modal = new FrontendModal(this);
    this.search = new FrontendSearch(this);
    
    this.init();
  }
  
  async init() {
    try {
      console.log('Starting frontend initialization...');
      
      // 确保认证令牌已加载
      if (typeof config !== 'undefined') {
        config.loadApiKey();
      }
      
      // 检查产品图目录是否存在
      await this.checkProductsPathExists();
      
      // 加载站点配置
      await this.loadSiteConfig();
      
      // 确保i18n初始化
      if (typeof i18n !== 'undefined' && !i18n.isReady) {
        i18n.init();
      }
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 加载产品数据（不使用await，避免阻塞UI）
      this.loadProductsData().catch(error => {
        console.error('Failed to load products data:', error);
        this.state.isLoading = false;
        this._showLoading(false);
        // 显示错误信息
        this.showErrorMessage('加载产品数据失败，请刷新页面重试');
      });
      
      // 监听语言变化事件
      document.addEventListener('languageChanged', (event) => {
        const newLang = event.detail.language;
        this.state.currentLang = newLang;
        this.updatePageTitle();
        this.updateCarousel();
        this.updateContactModal();
        this.updateFooter();
        this.updateFormLabels();
        console.log('Language changed to:', newLang);
      });
      
      console.log('Frontend initialization completed');
    } catch (error) {
      console.error('Initialization error:', error);
      this.state.isLoading = false;
      this._showLoading(false);
      this.showErrorMessage('初始化失败，请刷新页面重试');
    }
  }
  
  // 显示错误信息
  showErrorMessage(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 16px;
      border-radius: 4px;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
    
    // 3秒后自动移除
    setTimeout(() => {
      errorContainer.remove();
    }, 3000);
  }
  
  getImageUrl(seriesId, imageName) {
    // 确保seriesId和imageName不为空
    if (!seriesId || !imageName) {
      console.error('Missing seriesId or imageName:', { seriesId, imageName });
      return '';
    }
    
    try {
      // 使用GitHub的raw.githubusercontent.com来访问图片文件，避免GitHub Pages部署问题
      // 对路径中的中文部分进行编码
      const encodedSeriesId = encodeURIComponent(seriesId);
      const encodedImageName = encodeURIComponent(imageName);
      const branch = this.config.github.branch || 'main';
      const productsPath = this.config.github.productsPath || '产品图';
      
      // 构建完整的图片URL
      const imageUrl = `https://raw.githubusercontent.com/${this.config.github.owner}/${this.config.github.repo}/${branch}/${productsPath}/${encodedSeriesId}/${encodedImageName}`;
      
      // 输出图片URL到控制台，以便调试
      console.log('Generated image URL:', imageUrl);
      console.log('Original seriesId:', seriesId);
      console.log('Original imageName:', imageName);
      
      // 直接返回原始图片URL，避免WebP格式转换导致的图片显示问题
      return imageUrl;
    } catch (error) {
      console.error('Error generating image URL:', error);
      return '';
    }
  }
  
  // 检查产品图目录是否存在
  async checkProductsPathExists() {
    try {
      const testUrl = `https://raw.githubusercontent.com/${this.config.github.owner}/${this.config.github.repo}/${this.config.github.branch}/${this.config.github.productsPath}/`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      console.log('Products path exists:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('Error checking products path:', error);
      return false;
    }
  }
  
  async loadSiteConfig() {
    try {
      cacheManager.clear('config.json');
      const config = await githubAPI.fetchFile('config.json');
      this.state.siteConfig = config;
      // 使用i18n的当前语言设置
      this.state.currentLang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : config.pageSettings?.defaultLanguage || 'zh';
      this.state.translations = config.translations || {};
      this.updateContactModal();
      this.updatePageTitle();
      this.updateCarousel();
    } catch (error) {
      console.error('Load site config error:', error);
      this.state.siteConfig = {
        siteInfo: {},
        contactForm: { formspreeId: '', enable: true },
        translations: {},
        pageSettings: {},
        pageAssets: {}
      };
      this.state.translations = {};
    }
  }
  
  updatePageTitle() {
    const config = this.state.siteConfig;
    const lang = this.state.currentLang;
    const pageSettings = config.pageSettings || {};
    
    if (pageSettings.title) {
      document.title = pageSettings.title[lang] || pageSettings.title.zh || 'GH5';
    }
  }
  
  updateCarousel() {
    const config = this.state.siteConfig;
    const lang = this.state.currentLang;
    const pageSettings = config.pageSettings || {};
    const pageAssets = config.pageAssets || {};
    
    const titleEl = document.getElementById('carousel-title');
    if (titleEl) {
      titleEl.textContent = pageSettings.carouselWelcome?.[lang] || pageSettings.carouselWelcome?.zh || '欢迎来到 GH5';
    }
    
    const descEl = document.getElementById('carousel-description');
    if (descEl) {
      descEl.textContent = pageSettings.carouselDescription?.[lang] || pageSettings.carouselDescription?.zh || '探索我们的优质产品';
    }
    
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
      const carousel1 = pageAssets.carousel1 || {};
      if (carousel1.url) {
        carouselContainer.style.backgroundImage = `url('${carousel1.url}')`;
      }
    }
  }
  
  updateContactModal() {
    const config = this.state.siteConfig;
    const lang = this.state.currentLang;
    const siteInfo = config.siteInfo || {};
    
    const companyName = siteInfo.companyName?.[lang] || siteInfo.companyName?.zh || '关于我们';
    const companyDesc = siteInfo.companyDescription?.[lang] || siteInfo.companyDescription?.zh || '';
    
    const companyNameEl = document.getElementById('contact-company-name');
    if (companyNameEl) companyNameEl.textContent = companyName;
    
    const companyDescEl = document.getElementById('contact-company-description');
    if (companyDescEl) {
      companyDescEl.textContent = companyDesc;
      document.getElementById('contact-description-item').style.display = companyDesc ? 'flex' : 'none';
    }
    
    const fields = [
      { id: 'contact-company-address', key: 'companyAddress', itemId: 'contact-address-item' },
      { id: 'contact-company-phone', key: 'companyPhone', itemId: 'contact-phone-item' },
      { id: 'contact-company-email', key: 'companyEmail', itemId: 'contact-email-item' },
      { id: 'contact-company-wechat', key: 'companyWechat', itemId: 'contact-wechat-item' },
      { id: 'contact-working-hours', key: 'workingHours', itemId: 'contact-hours-item' }
    ];
    
    fields.forEach(field => {
      const value = siteInfo[field.key]?.zh || '';
      const el = document.getElementById(field.id);
      const itemEl = document.getElementById(field.itemId);
      if (el) el.textContent = value;
      if (itemEl) itemEl.style.display = value ? 'flex' : 'none';
    });
    
    this.updateFormLabels();
    this.updateFooter();
  }
  
  updateFooter() {
    const config = this.state.siteConfig;
    const lang = this.state.currentLang;
    const pageSettings = config.pageSettings || {};
    
    const footerTextEl = document.getElementById('footer-text');
    if (footerTextEl) {
      footerTextEl.textContent = pageSettings.footerText?.[lang] || pageSettings.footerText?.zh || '© 2026 GH5. All rights reserved.';
    }
    
    const contactBtnEl = document.getElementById('footer-contact-btn');
    if (contactBtnEl) {
      contactBtnEl.textContent = pageSettings.contactUsText?.[lang] || pageSettings.contactUsText?.zh || '联系我们';
    }
    
    this.updateSocialLinks();
  }
  
  updateSocialLinks() {
    const config = this.state.siteConfig;
    const socialLinks = config.socialLinks || {};
    const container = document.getElementById('footer-social-links');
    
    if (!container) return;
    
    if (socialLinks.display === false) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'flex';
    container.innerHTML = '';
    
    const socialIcons = {
      facebook: '<svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
      instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
      twitter: '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
      tiktok: '<svg viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-3.11 6.23-2.23 1.56-5.16 1.67-7.6.16-2.25-1.39-3.77-3.91-3.77-6.47V1.91c.85.91 1.87 1.63 3.03 2.09 1.26.5 2.64.58 3.91.26V.02z"/></svg>',
      telegram: '<svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
      linkedin: '<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
      pinterest: '<svg viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>',
      weibo: '<svg viewBox="0 0 24 24"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.597.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.596zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.809-.232-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.581-.18-.402-.71.388-1.151.436-2.003.003-2.705-.647-1.061-2.225-1.389-3.464-.996-.946.301-1.571.901-1.825 1.753-.277.939-.019 1.711.676 2.427.381.392.851.634 1.381.753.105.024.202.039.293.058-.089.278-.208.55-.333.811l-.001.001c-.336.703-.751 1.509-1.261 1.939-.107.091-.222.133-.336.159l-.003.001c-.232.053-.471.024-.689-.116l.002-.007c.271-.373.485-.815.485-1.373 0-.103-.012-.201-.031-.293l-.002-.012c.135-.016.27-.042.405-.075.449-.109.829-.367 1.119-.762.292-.399.498-.879.598-1.378l.008-.043c.016-.089.024-.178.024-.262 0-.066-.009-.129-.022-.191l.007.003c-.131.16-.27.315-.422.459-.449.425-.989.73-1.586.889l-.023.005c-.099.022-.195.035-.293.043-.198.014-.393.009-.584-.015l.025-.002-.001.001h.002c-.523-.069-1.022-.264-1.456-.572-.433-.309-.762-.718-.971-1.191l-.009-.021c-.204-.462-.289-.946-.262-1.405l-.001-.026c.015-.262.082-.521.194-.761.111-.239.272-.456.474-.637.201-.181.441-.311.706-.383.265-.073.543-.082.813-.034l.002-.003c.252-.044.504-.062.752-.052l.005-.001h.001c.234-.009.464-.008.691.004l-.024-.001h.002c.505.026.971.152 1.375.369.401.216.74.522.995.894l.013.019c.249.364.417.763.497 1.163l.002.012c.026.103.042.208.05.313l.001.013c-.007.009-.015.018-.021.027-.076.111-.162.215-.254.314-.252.268-.555.494-.896.669-.341.176-.714.302-1.099.373l-.013.002c-.098.019-.195.036-.293.047l-.002.001c-.103.012-.206.019-.309.02-.103.002-.205 0-.306-.009l-.002-.001c-.102-.008-.203-.023-.303-.046z"/></svg>'
    };
    
    const socialPlatforms = ['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'telegram', 'whatsapp', 'linkedin', 'pinterest', 'weibo'];
    
    socialPlatforms.forEach(platform => {
      const url = socialLinks[platform];
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.className = `social-link ${platform}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = platform.charAt(0).toUpperCase() + platform.slice(1);
        link.innerHTML = socialIcons[platform] || '';
        container.appendChild(link);
      }
    });
    
    const customLinks = socialLinks.customLinks || [];
    customLinks.forEach(link => {
      if (link.url) {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'social-link custom';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = link.name;
        a.textContent = link.name.charAt(0).toUpperCase();
        container.appendChild(a);
      }
    });
  }
  
  updateFormLabels() {
    const config = this.state.siteConfig;
    const lang = this.state.currentLang;
    const translations = config.translations || {};
    
    const labels = {
      'contact-form-title': translations['联系我们']?.[lang] || translations['联系我们']?.zh || '联系我们',
      'label-name': translations['姓名']?.[lang] || translations['姓名']?.zh || '姓名',
      'label-email': translations['邮箱']?.[lang] || translations['邮箱']?.zh || '邮箱',
      'label-message': translations['留言']?.[lang] || translations['留言']?.zh || '留言'
    };
    
    Object.entries(labels).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
    
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      const submitText = translations['提交']?.[lang] || translations['提交']?.zh || '提交';
      const submittingText = translations['提交中']?.[lang] || translations['提交中']?.zh || '提交中...';
      submitBtn.dataset.textSubmit = submitText;
      submitBtn.dataset.textSubmitting = submittingText;
      submitBtn.textContent = submitText;
    }
  }
  
  openContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }
  
  closeContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
  
  getFormspreeUrl() {
    const config = this.state.siteConfig;
    const formId = config.contactForm?.formspreeId || '';
    return formId ? `https://formspree.io/f/${formId}` : '';
  }
  
  setupEventListeners() {
    this.events.setupEventListeners();
  }
  
  loadProductsData() {
    return this.products.loadProductsData();
  }
  
  renderProducts() {
    this.products.renderProducts();
  }
  
  showProductDetails(product) {
    this.modal.showProductDetails(product);
  }
  
  closeProductDetails() {
    this.modal.closeProductDetails();
  }
  
  changeMainImage(src) {
    this.modal.changeMainImage(src);
  }
  
  navigateGallery(direction) {
    this.modal.navigateGallery(direction);
  }
  
  openLightbox(src) {
    this.modal.openLightbox(src);
  }
  
  closeLightbox(event) {
    this.modal.closeLightbox(event);
  }
  
  navigateLightbox(direction) {
    this.modal.navigateLightbox(direction);
  }
  
  searchProducts(query) {
    this.search.searchProducts(query);
  }
  
  resetSearch() {
    this.search.resetSearch();
  }
  
  filterBySeries(seriesId) {
    this.state.selectedSeries = seriesId;
    this.state.currentPage = 1;
    this.renderProducts();
  }
  
  goToPage(page) {
    if (page < 1 || page > this.state.totalPages) return;
    this.state.currentPage = page;
    this.renderProducts();
  }
  
  viewHistoryProduct(productId) {
    // 查找产品
    const product = this.state.allProducts.find(p => p.id === productId);
    if (product) {
      // 显示产品详情
      this.showProductDetails(product);
    }
  }
  
  _handleLanguageChange(lang) {
    // 重新加载系列名称映射
    this.state.seriesNameMap = this._getDefaultSeriesNameMap();
    // 重新渲染产品以更新系列名称和产品翻译
    this.renderProducts();
  }
  
  getProductTranslation(zhText, fieldType = 'name') {
    if (!zhText || this.state.currentLang === 'zh') {
      return zhText;
    }
    
    const translations = this.state.translations;
    if (!translations || Object.keys(translations).length === 0) {
      return zhText;
    }
    
    for (const [key, value] of Object.entries(translations)) {
      if (value.zh === zhText) {
        return value[this.state.currentLang] || zhText;
      }
    }
    
    return zhText;
  }
  
  _showLoading(show, message = '正在加载产品数据...') {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
    
    // 同时更新产品容器的加载状态
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
      if (show) {
        productsContainer.classList.add('loading');
        // 添加加载提示
        if (productsContainer.querySelector('.loading-message') === null) {
          const loadingMessage = document.createElement('div');
          loadingMessage.className = 'loading-message';
          loadingMessage.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
          `;
          productsContainer.appendChild(loadingMessage);
        } else {
          // 更新加载消息
          const existingMessage = productsContainer.querySelector('.loading-message p');
          if (existingMessage) {
            existingMessage.textContent = message;
          }
        }
        
        // 禁用刷新按钮
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
          refreshBtn.disabled = true;
          refreshBtn.classList.add('disabled');
        }
      } else {
        productsContainer.classList.remove('loading');
        const loadingMessage = productsContainer.querySelector('.loading-message');
        if (loadingMessage) {
          loadingMessage.remove();
        }
        
        // 启用刷新按钮
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
          refreshBtn.disabled = false;
          refreshBtn.classList.remove('disabled');
        }
      }
    }
  }
  
  _showError(message, showRetry = true) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.innerHTML = `
        <div class="error-content">
          <p>${message}</p>
          ${showRetry ? '<button class="retry-btn" onclick="frontend.refreshData()">重试</button>' : ''}
        </div>
      `;
      errorElement.style.display = 'block';
      // 5秒后自动隐藏错误信息
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
    
    // 同时在产品容器显示错误提示
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
      productsContainer.classList.remove('loading');
      const loadingMessage = productsContainer.querySelector('.loading-message');
      if (loadingMessage) {
        loadingMessage.remove();
      }
      
      const existingError = productsContainer.querySelector('.error-message');
      if (existingError) {
        existingError.remove();
      }
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.innerHTML = `
        <div class="error-icon">⚠️</div>
        <div class="error-text">${message}</div>
        ${showRetry ? '<button class="retry-btn" onclick="frontend.refreshData()">重试</button>' : ''}
      `;
      productsContainer.appendChild(errorMessage);
    }
    
    // 启用刷新按钮
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove('disabled');
    }
  }
  
  _getDefaultSeriesNameMap() {
    return {
      '1-PU系列': 'PU系列',
      '2-真皮系列': '真皮系列',
      '3-短靴系列': '短靴系列',
      '4-乐福系列': '乐福系列',
      '5-春季': '春季系列',
      '6-夏季': '夏季系列',
      '7-秋季': '秋季系列'
    };
  }
  
  _updateClearButtonVisibility(value) {
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.style.display = value && value.length > 0 ? 'flex' : 'none';
    }
  }
  
  updateLightboxCounter() {
    const counter = document.getElementById('lightbox-counter');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // 如果只有一张图片，隐藏计数器和导航按钮
    if (this.currentLightboxImages.length <= 1) {
      if (counter) counter.textContent = '';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    } else {
      // 多张图片，显示计数器和导航按钮
      if (counter) {
        counter.textContent = `${this.currentLightboxIndex + 1} / ${this.currentLightboxImages.length}`;
      }
      if (prevBtn) prevBtn.style.display = 'block';
      if (nextBtn) nextBtn.style.display = 'block';
    }
  }
  
  refreshData() {
    // 清除缓存并重新加载数据
    cacheManager.clearAll();
    console.log('Data refreshed by user');
    this.loadProductsData();
  }
}

// 导出实例
const frontend = new Frontend();
window.frontend = frontend;