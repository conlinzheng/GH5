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
    
    this.init();
  }
  
  async init() {
    await this.loadSiteConfig();
    this.loadProductsData();
    this.setupEventListeners();
    
    // 确保i18n初始化
    if (typeof i18n !== 'undefined' && !i18n.isReady) {
      i18n.init();
    }
    
    // 更新搜索框placeholder
    this.updateSearchPlaceholder();
    
    // 监听语言变化事件
    document.addEventListener('languageChanged', (event) => {
      const newLang = event.detail.language;
      this.state.currentLang = newLang;
      this.updatePageTitle();
      this.updateCarousel();
      this.updateContactModal();
      this.updateFooter();
      this.updateFormLabels();
      // 更新搜索框placeholder
      this.updateSearchPlaceholder();
      console.log('Language changed to:', newLang);
    });
  }
  
  getImageUrl(seriesId, imageName) {
    return `https://${this.config.github.owner}.github.io/${this.config.github.repo}/${this.config.github.productsPath}/${seriesId}/${imageName}`;
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
      weibo: '<svg viewBox="0 0 24 24"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.597.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.596zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.809-.232-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.581-.18-.402-.71.388-1.151.436-2.003.003-2.705-.647-1.061-2.225-1.389-3.464-.996-.946.301-1.571.901-1.825 1.753-.277.939-.019 1.711.676 2.427.381.392.851.634 1.381.753.105.024.202.039.293.058-.089.278-.208.55-.333.811l-.001.001c-.336.703-.751 1.509-1.261 1.939-.107.091-.222.133-.336.159l-.003.001c-.232.053-.471.024-.689-.116l.002-.007c.271-.373.485-.815.485-1.373 0-.103-.012-.201-.031-.293l-.002-.012c.135-.016.27-.042.405-.075.449-.109.829-.367 1.119-.762.292-.399.498-.879.598-1.378l.008-.043c.016-.089.024-.178.024-.262 0-.066-.009-.129-.022-.191l.007.003c-.131.16-.27.315-.422.459-.449.425-.989.73-1.586.889l-.023.005c-.099.022-.195.035-.293.043-.198.014-.393.009-.584-.015l.025-.002-.001.001h.002c-.523-.069-1.022-.264-1.456-.572-.433-.309-.762-.718-.971-1.191l-.009-.021c-.204-.462-.289-.946-.262-1.405l-.001-.026c.015-.262.082-.521.194-.761.111-.239.272-.456.474-.637.201-.181.441-.311.706-.383.265-.073.543-.082.813-.034l.002-.003c.252-.044.504-.062.752-.052l.005-.001h.001c.234-.009.464-.008.691.004l-.024-.001h.002c.505.026.971.152 1.375.369.401.216.74.522.995.894l.013.019c.249.364.417.763.497 1.163l.002.012c.026.103.042.208.05.313l.001.013c-.007.009-.015.018-.021.027-.076.111-.162.215-.254.314-.252.268-.555.494-.896.669-.341.176-.714.302-1.099.373l-.013.002c-.098.019-.195.036-.293.047l-.002.001c-.103.012-.206.019-.309.02-.103.002-.205 0-.306-.009l-.002-.001c-.102-.008-.203-.019-.304-.034l.002.002c-.101-.015-.201-.034-.301-.056l.002.004c-.495-.108-.963-.277-1.387-.499l.006.003c-.107-.056-.214-.113-.32-.171l.003.001c-.248-.138-.492-.291-.728-.461l-.004-.003c-.231-.166-.454-.347-.668-.539l-.003-.003c-.213-.191-.418-.395-.612-.607l-.001-.001c-.192-.21-.376-.432-.549-.66l-.003-.005c-.172-.227-.333-.464-.482-.708l-.003-.006c-.148-.243-.285-.495-.408-.753l-.004-.009c-.123-.258-.234-.523-.333-.793l-.002-.006c-.099-.269-.186-.543-.261-.823l-.002-.008c-.074-.279-.137-.56-.188-.844l-.001-.008c-.051-.285-.091-.571-.12-.859l-.001-.013c-.028-.287-.046-.575-.054-.863v-.013l-.001-.023v-.007l.001-.015c.006-.29.025-.58.057-.867l-.001.006c.033-.283.078-.564.135-.843l-.002.006c.057-.278.125-.553.203-.824l-.001.003c.078-.271.166-.539.264-.804l.002-.005c.098-.265.206-.527.323-.783l.003-.007c.117-.256.243-.508.378-.753l.004-.007c.134-.245.278-.486.429-.72l.003-.005c.15-.233.309-.462.476-.683l.004-.005c.166-.221.341-.437.523-.646l.005-.006c.182-.209.372-.413.569-.609l.006-.006c.196-.196.399-.387.608-.569l.005-.005c.209-.181.424-.357.645-.525l.002-.002c.22-.168.447-.33.679-.481l.002-.001c.231-.151.467-.296.708-.432l.002-.001c.24-.136.485-.266.733-.387l.002-.001c.247-.121.497-.235.749-.34l.002-.001c.251-.105.504-.203.759-.292l.003-.001c.254-.089.509-.171.766-.244l.002-.001c.257-.073.514-.139.772-.196l.001-.001c.258-.057.516-.107.775-.148l.001-.001c.259-.041.518-.075.777-.1l.002-.001h.002l.017-.003h.003l.003-.001h.002c.259-.025.519-.041.779-.048v-.002l.001-.002h-.001c.26-.006.52-.004.779.01l-.001.002h.002c.26.014.519.037.777.068l-.002-.003c.257.031.513.07.768.115l-.002-.003c.254.045.507.098.757.159l-.002-.003c.249.061.496.131.74.208l-.001-.002c.243.077.484.163.722.254l-.001-.002c.237.091.471.19.702.296l-.001-.002c.229.106.456.219.68.338l-.001-.002c.223.119.443.245.659.376l-.001-.002c.215.131.427.268.634.411l-.001-.001c.206.143.409.293.606.449l-.001-.001c.196.155.388.317.575.485l-.001.001c.186.168.368.342.544.52l-.001.001c.175.179.346.363.512.551l.001.001c.166.188.327.382.482.579l-.001.001c.155.197.304.399.447.604l-.001.001c.142.205.279.415.409.629l.001.001c.13.213.254.43.372.651l.001.001c.117.221.228.445.333.672l-.001-.001c.105.226.204.456.296.688l.001-.001c.091.232.176.467.253.705l.001-.001c.077.237.148.477.211.718l.001-.001c.063.241.12.483.169.726l.001-.001c.049.243.091.487.125.732l.001-.001c.034.244.062.489.082.734l-.001-.001c.02.245.034.49.04.735v.002c.006.244.006.489-.006.733l-.001-.001-.001.001zm2.899-2.434c.378-.047.621-.252.621-.252s-1.307-.615-1.893-1.176c-.584-.56-.974-.947-.278-1.903.358-.492.793-.8 1.103-1.154.314-.358.548-.651.416-1.099-.135-.456-.878-.653-1.516-.456-.638.196-1.314.569-1.855 1.113-.541.543-.909 1.163-1.047 1.855-.138.692.046 1.373.456 1.516.409.142.788-.189 1.154-.416.366-.227.662-.523 1.154-.278.493.246.958.812 1.354 1.141.397.33 1.195.652 1.195.652s-.168.39-.566.433c-.399.044-.773-.102-1.162-.196z"/></svg>'
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
    // 系列筛选
    document.querySelectorAll('.series-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seriesId = e.target.dataset.series;
        this.filterBySeries(seriesId);
      });
    });
    
    // 分页
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        this.goToPage(page);
      });
    });
    
    // 刷新数据按钮
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshData();
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
        this.closeProductDetails();
      });
    }
    
    // 模态框遮罩层
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        this.closeProductDetails();
      });
    }
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProductDetails();
        this.closeContactModal();
      }
    });
    
    // 联系我们弹窗关闭按钮
    const contactModalClose = document.getElementById('contact-modal-close');
    if (contactModalClose) {
      contactModalClose.addEventListener('click', () => {
        this.closeContactModal();
      });
    }
    
    // 联系我们弹窗遮罩层
    const contactModalOverlay = document.getElementById('contact-modal-overlay');
    if (contactModalOverlay) {
      contactModalOverlay.addEventListener('click', () => {
        this.closeContactModal();
      });
    }
    
    // 语言切换事件
    document.addEventListener('languageChanged', (event) => {
      this.state.currentLang = event.detail.language;
      this._handleLanguageChange(event.detail.language);
      this.updateContactModal();
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
        
        const formspreeUrl = this.getFormspreeUrl();
        
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
          
          const config = this.state.siteConfig;
          const lang = this.state.currentLang;
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
  
  refreshData() {
    // 清除缓存并重新加载数据
    cacheManager.clearAll();
    console.log('Data refreshed by user');
    this.loadProductsData();
  }
  

  
  showProductDetails(product) {
    const modal = document.getElementById('product-modal');
    
    if (!modal) return;
    
    const seriesDisplayName = this.getSeriesDisplayName(product.seriesId);
    const translatedName = this.getProductTranslation(product.name, 'name');
    const translatedDesc = product.description ? this.getProductTranslation(product.description, 'desc') : '';
    
    // 更新弹窗内容 - 添加空值检查
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage && product.images && product.images.length > 0) {
      mainImage.src = product.images[0];
      mainImage.alt = translatedName || '';
    }
    
    const modalSeries = document.getElementById('modal-series');
    if (modalSeries) {
      modalSeries.textContent = seriesDisplayName || '';
    }
    
    const productName = document.getElementById('modal-product-name');
    if (productName) {
      productName.textContent = translatedName || '';
    }
    
    const description = document.getElementById('modal-description');
    if (description) {
      description.textContent = translatedDesc || '无描述';
    }
    
    // 更新产品规格 - 添加空值检查
    const specUpper = document.getElementById('spec-upper');
    if (specUpper) {
      specUpper.textContent = product.upperMaterial || '-';
    }
    
    const specInner = document.getElementById('spec-inner');
    if (specInner) {
      specInner.textContent = product.innerMaterial || '-';
    }
    
    const specSole = document.getElementById('spec-sole');
    if (specSole) {
      specSole.textContent = product.soleMaterial || '-';
    }
    
    const specCustomizable = document.getElementById('spec-customizable');
    if (specCustomizable) {
      specCustomizable.textContent = product.customizable ? (product.customizable === 'true' ? '支持' : '不支持') : '-';
    }
    
    const specMinOrder = document.getElementById('spec-min-order');
    if (specMinOrder) {
      specMinOrder.textContent = product.minOrder || '-';
    }
    
    const specPrice = document.getElementById('spec-price');
    if (specPrice) {
      specPrice.textContent = product.price || '-';
    }
    
    // 加载相关图片
    this.loadRelatedImages(product.images);
    
    // 显示弹窗
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // 触发产品查看事件，用于浏览历史
    const event = new CustomEvent('productViewed', {
      detail: { product }
    });
    document.dispatchEvent(event);
  }
  
  closeProductDetails() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
  
  // 加载相关图片到弹窗
  loadRelatedImages(images) {
    const gallery = document.getElementById('modal-gallery');
    if (!gallery) return;
    
    // 保存相关图片到全局变量，供灯箱使用
    this.currentLightboxImages = images;
    
    let html = '';
    images.forEach((img, index) => {
      html += `
        <div class="modal-gallery-item">
          <img src="${img}" 
               alt="${index + 1}" 
               class="gallery-thumb"
               onclick="changeMainImage('${img}')">
          <div class="gallery-thumb-label">图片 ${index + 1}</div>
        </div>
      `;
    });
    
    gallery.innerHTML = html;
  }
  
  // 切换主图
  changeMainImage(src) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
      mainImage.src = src;
    }
  }
  
  // 画廊导航
  navigateGallery(direction) {
    const gallery = document.getElementById('modal-gallery');
    if (!gallery) return;
    
    const scrollAmount = 200; // 每次滚动的距离
    gallery.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
  
  // 打开灯箱
  openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    if (lightbox && lightboxImage) {
      lightboxImage.src = src;
      lightbox.style.display = 'flex';
      
      // 设置灯箱图片列表
      this.currentLightboxIndex = this.currentLightboxImages.indexOf(src);
      this.updateLightboxCounter();
    }
  }
  
  // 关闭灯箱
  closeLightbox(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
    }
  }
  
  // 灯箱导航
  navigateLightbox(direction) {
    if (this.currentLightboxImages.length === 0) return;

    this.currentLightboxIndex += direction;

    // 循环切换
    if (this.currentLightboxIndex < 0) {
      this.currentLightboxIndex = this.currentLightboxImages.length - 1;
    } else if (this.currentLightboxIndex >= this.currentLightboxImages.length) {
      this.currentLightboxIndex = 0;
    }

    const lightboxImage = document.getElementById('lightbox-image');
    if (lightboxImage) {
      lightboxImage.src = this.currentLightboxImages[this.currentLightboxIndex];
      this.updateLightboxCounter();
    }
  }
  
  // 搜索产品
  searchProducts(query) {
    if (!query || typeof query !== 'string') {
      this.resetSearch();
      return;
    }
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      this.resetSearch();
      return;
    }

    const searchTerm = trimmedQuery.toLowerCase();
    const filteredProducts = this.state.allProducts.filter(product => {
      // 添加空值检查
      if (!product) return false;
      
      const name = product.name;
      if (name) {
        if (typeof name === 'string') {
          if (name.toLowerCase().includes(searchTerm)) return true;
        } else if (typeof name === 'object' && name !== null) {
          const nameValues = Object.values(name).filter(v => typeof v === 'string');
          if (nameValues.some(v => v.toLowerCase().includes(searchTerm))) return true;
        }
      }
      
      // 添加标签搜索的空值检查
      if (product.tags && Array.isArray(product.tags)) {
        if (product.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchTerm))) return true;
      } else if (product.tags && typeof product.tags === 'string') {
        if (product.tags.toLowerCase().includes(searchTerm)) return true;
      }
      
      // 添加材质搜索的空值检查
      if (product.upperMaterial && typeof product.upperMaterial === 'string') {
        if (product.upperMaterial.toLowerCase().includes(searchTerm)) return true;
      }
      if (product.innerMaterial && typeof product.innerMaterial === 'string') {
        if (product.innerMaterial.toLowerCase().includes(searchTerm)) return true;
      }
      if (product.soleMaterial && typeof product.soleMaterial === 'string') {
        if (product.soleMaterial.toLowerCase().includes(searchTerm)) return true;
      }
      
      return false;
    });

    this.state.products = filteredProducts;
    this.renderProducts();
  }

  // 重置搜索
  resetSearch() {
    this.state.products = this.state.allProducts;
    this.renderProducts();
    this._updateClearButtonVisibility('');
  }
  
  // 更新清除按钮显示状态
  _updateClearButtonVisibility(value) {
    const clearBtn = document.getElementById('search-clear');
    if (clearBtn) {
      clearBtn.style.display = value && value.length > 0 ? 'flex' : 'none';
    }
  }
  
  // 更新灯箱计数器
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
  
  async loadProductsData() {
    try {
      this.state.isLoading = true;
      this._showLoading(true);

      // 清除缓存以确保获取最新数据
      cacheManager.clearAll();
      console.log('Cache cleared, loading fresh data from GitHub API');

      // 重新加载系列名称映射和系列列表
      await this.loadSeriesNameMap();
      
      try {
        const products = await this.fetchAllProducts();
        
        console.log('产品数据加载完成，产品数量:', products.length);
        console.log('产品数据示例:', products[0]);
        
        this.state.products = products;
        this.state.allProducts = products; // 保存所有产品，用于搜索

        // 缓存数据
        this.cacheProductsData(products);
      } catch (apiError) {
        console.error('GitHub API error:', apiError);
        console.log('Using fallback local data');
        this._loadLocalFallbackData();
      }

      this.renderProducts();
    } catch (error) {
      this.handleError(error, '加载产品数据失败，请稍后重试');
    } finally {
      this.state.isLoading = false;
      this._showLoading(false);
    }
  }

  async fetchAllProducts() {
    // 从GitHub API获取最新的系列列表
    const series = await githubAPI.fetchDirectory(this.config.github.productsPath);
    this.state.series = series.filter(item => item.type === 'dir');
    
    console.log('Loading products from GitHub API');
    
    // 限制并发请求数量
    const maxConcurrentRequests = 2;
    const seriesBatches = this.createSeriesBatches(this.state.series, maxConcurrentRequests);
    
    const products = [];
    
    // 按批次处理系列
    for (const batch of seriesBatches) {
      const batchPromises = batch.map(async (seriesItem) => {
        try {
          await this.handleAPIRateLimit();
          const seriesProducts = await this.fetchSeriesProducts(seriesItem);
          seriesProducts.forEach(product => products.push(product));
        } catch (error) {
          console.warn(`Failed to load products for ${seriesItem.name}:`, error);
        }
      });
      
      // 等待批次请求完成
      await Promise.all(batchPromises);
    }
    
    return products;
  }

  createSeriesBatches(series, batchSize) {
    const batches = [];
    for (let i = 0; i < series.length; i += batchSize) {
      batches.push(series.slice(i, i + batchSize));
    }
    return batches;
  }

  async handleAPIRateLimit() {
    const rateLimitInfo = githubAPI.getRateLimitInfo();
    if (rateLimitInfo.isLimited) {
      const waitTime = rateLimitInfo.resetInMinutes;
      console.log(`API rate limit reached, waiting ${waitTime} minutes...`);
      
      // 显示用户友好的提示
      const message = typeof i18n !== 'undefined' 
        ? `API请求过于频繁，请${waitTime}分钟后重试` 
        : `API rate limit reached. Please try again in ${waitTime} minutes.`;
      
      this._showError(message);
      
      await githubAPI.waitForRateLimitReset();
      
      // 清除错误提示
      const errorElement = document.getElementById('error-message');
      if (errorElement) {
        errorElement.style.display = 'none';
      }
    }
  }

  async fetchSeriesProducts(seriesItem) {
    // 获取系列目录下的所有文件
    const files = await githubAPI.fetchDirectory(seriesItem.path);
    const imageFiles = this.filterImageFiles(files);
    
    // 按产品名称分组图片
    const productGroups = this.groupImagesByProduct(imageFiles);
    
    // 获取产品数据文件
    const productsFile = await this.fetchProductsFile(seriesItem.path);
    
    // 为每个产品创建数据
    const productsByGroup = this.createProductsByGroup(productGroups, productsFile, seriesItem.name);
    
    // 按排序顺序添加产品
    return this.sortAndCollectProducts(productsByGroup, productsFile);
  }

  filterImageFiles(files) {
    return files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    });
  }

  groupImagesByProduct(imageFiles) {
    const productGroups = {};
    imageFiles.forEach(file => {
      const productName = this.extractProductName(file.name);
      if (!productGroups[productName]) {
        productGroups[productName] = [];
      }
      productGroups[productName].push(file.name);
    });
    return productGroups;
  }

  async fetchProductsFile(seriesPath) {
    try {
      // 只有在缓存不存在时才请求API
      const cachedData = cacheManager.get(`${seriesPath}/products.json`);
      if (cachedData) {
        console.log(`Using cached data for ${seriesPath}/products.json`);
        return cachedData;
      }
      
      const productsFile = await githubAPI.fetchFile(`${seriesPath}/products.json`);
      // 缓存数据
      cacheManager.set(`${seriesPath}/products.json`, productsFile, this.config.cacheTTL);
      return productsFile;
    } catch (error) {
      return { products: {} };
    }
  }

  createProductsByGroup(productGroups, productsFile, seriesId) {
    const productsByGroup = {};
    
    Object.entries(productGroups).forEach(([productName, images]) => {
      // 找到主图（通常是 (1) 或没有数字的图片）
      const mainImage = images.find(img => this.isMainImage(img)) || images[0];
      
      // 获取产品数据
      const productData = productsFile.products[mainImage] || {
        name: productName,
        description: '',
        price: '',
        upperMaterial: '',
        innerMaterial: '',
        soleMaterial: '',
        customizable: '',
        minOrder: '',
        tags: []
      };
      
      console.log('产品数据:', productData);
      console.log('产品标签:', productData.tags);
      
      // 处理多语言字段
      const name = productData.name?.zh || productData.name || productName;
      const description = productData.description?.zh || productData.description || '';
      
      // 处理材质字段（兼容两种格式：materials 对象 或 单独字段）
      const upperMaterial = productData.materials?.upper || productData.upperMaterial || '';
      const innerMaterial = productData.materials?.lining || productData.innerMaterial || '';
      const soleMaterial = productData.materials?.sole || productData.soleMaterial || '';
      
      // 构建产品对象
      const product = {
        id: mainImage,
        seriesId: seriesId,
        name: name,
        description: description,
        price: productData.price || '',
        upperMaterial: upperMaterial,
        innerMaterial: innerMaterial,
        soleMaterial: soleMaterial,
        customizable: productData.customizable || '',
        minOrder: productData.minOrder || '',
        tags: productData.tags || [],
        specs: upperMaterial || innerMaterial || soleMaterial || '',
        images: images.map(img => this.getImageUrl(seriesId, img))
      };
      
      console.log('构建的产品对象:', product);
      
      productsByGroup[productName] = product;
    });
    
    return productsByGroup;
  }

  sortAndCollectProducts(productsByGroup, productsFile) {
    const products = [];
    
    // 按排序顺序添加产品
    if (productsFile.order) {
      const orderNames = productsFile.order;
      orderNames.forEach(productName => {
        if (productsByGroup[productName]) {
          products.push(productsByGroup[productName]);
          delete productsByGroup[productName];
        }
      });
    }
    
    // 添加剩余的产品（确保所有产品都被加载，即使 order 字段有问题）
    Object.values(productsByGroup).forEach(product => {
      products.push(product);
    });
    
    // 添加请求间隔，避免API限流
    return new Promise(resolve => {
      setTimeout(() => resolve(products), 500);
    });
  }

  cacheProductsData(products) {
    cacheManager.set('products_data', {
      products: products,
      series: this.state.series,
      seriesNameMap: this.state.seriesNameMap
    }, this.config.cacheTTL);
  }

  handleError(error, customMessage = null) {
    if (typeof errorHandler !== 'undefined') {
      errorHandler.handleError(error);
    } else {
      console.error('Error:', error);
    }
    if (customMessage) {
      this._showError(customMessage);
    }
  }
  
  async loadSeriesNameMap() {
    try {
      // 初始化系列名称映射 - 现在存储多语言对象
      let seriesNameMap = {};
      
      // 从各个系列的 products.json 文件中加载 seriesName 字段
      try {
        const seriesList = await githubAPI.fetchDirectory('产品图');
        const allSeries = seriesList.filter(item => item.type === 'dir');
        
        for (const series of allSeries) {
          try {
            const data = await githubAPI.fetchFile(`${series.path}/products.json`);
            if (data && data.seriesName) {
              // 存储完整的 seriesName 对象（包含 zh, en, ko）
              seriesNameMap[series.name] = data.seriesName;
            }
          } catch (err) {
            console.warn(`Failed to load ${series.name}/products.json:`, err);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch series list:', error);
      }
      
      // 如果没有任何映射，使用默认映射
      if (Object.keys(seriesNameMap).length === 0) {
        const defaultMap = this._getDefaultSeriesNameMap();
        // 将默认映射转换为多语言格式
        Object.entries(defaultMap).forEach(([key, value]) => {
          seriesNameMap[key] = {
            zh: value,
            en: value,
            ko: value
          };
        });
      }
      
      this.state.seriesNameMap = seriesNameMap;
      console.log('Series name map loaded:', seriesNameMap);
    } catch (error) {
      console.error('Load series name map error:', error);
      // 使用默认映射
      const defaultMap = this._getDefaultSeriesNameMap();
      this.state.seriesNameMap = {};
      Object.entries(defaultMap).forEach(([key, value]) => {
        this.state.seriesNameMap[key] = {
          zh: value,
          en: value,
          ko: value
        };
      });
    }
  }
  
  // 获取系列显示名称（支持多语言）
  getSeriesDisplayName(seriesId) {
    const seriesNameObj = this.state.seriesNameMap[seriesId];
    if (seriesNameObj) {
      const currentLang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : 'zh';
      // 优先返回当前语言的名称，如果不存在则返回中文
      return seriesNameObj[currentLang] || seriesNameObj.zh || seriesId;
    }
    return seriesId;
  }
  
  renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 按系列分组产品
    const productsBySeries = {};
    this.state.products.forEach(product => {
      if (!productsBySeries[product.seriesId]) {
        productsBySeries[product.seriesId] = [];
      }
      productsBySeries[product.seriesId].push(product);
    });
    
    // 获取系列顺序
    let seriesOrder = this.state.seriesOrder || Object.keys(productsBySeries);
    
    // 确保所有系列都在排序中
    Object.keys(productsBySeries).forEach(seriesId => {
      if (!seriesOrder.includes(seriesId)) {
        seriesOrder.push(seriesId);
      }
    });
    
    // 渲染每个系列
    seriesOrder.forEach(seriesId => {
      // 如果有选定的系列，只显示该系列
      if (this.state.selectedSeries && this.state.selectedSeries !== seriesId) {
        return;
      }
      
      const seriesProducts = productsBySeries[seriesId];
      if (!seriesProducts) return;
      
      const seriesDisplayName = this.getSeriesDisplayName(seriesId);
      
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
        const productElement = this._createProductElement(product);
        productsContainer.appendChild(productElement);
      });
      
      productsWrapper.appendChild(leftButton);
      productsWrapper.appendChild(productsContainer);
      productsWrapper.appendChild(rightButton);
      seriesContainer.appendChild(productsWrapper);
      
      container.appendChild(seriesContainer);
    });
    
    // 更新系列筛选按钮
    this._updateSeriesFilter();
  }
  
  scrollSeries(seriesId, direction) {
    const seriesWrapper = document.querySelector(`.series-section[data-series-id="${seriesId}"] .series-products`);
    if (seriesWrapper) {
      const scrollAmount = 300; // 每次滚动的距离
      seriesWrapper.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  }
  
  _createProductElement(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    const seriesDisplayName = this.getSeriesDisplayName(product.seriesId);
    
    const translatedName = this.getProductTranslation(product.name, 'name');
    const translatedDesc = product.description ? this.getProductTranslation(product.description, 'desc') : '';
    
    // 构建图片轮播
    let imageCarousel = '';
    if (product.images.length > 1) {
      imageCarousel = `
        <div class="product-image-carousel">
          ${product.images.map((image, index) => `
            <div class="carousel-item ${index === 0 ? 'active' : ''}">
              <img src="${image}" alt="${translatedName} ${index + 1}" loading="lazy">
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
          <img src="${product.images[0]}" alt="${translatedName}" loading="lazy">
        </div>
      `;
    }
    
    // 生成标签HTML - 翻译标签
    const translatedTags = product.tags ? product.tags.map(tag => this.getProductTranslation(tag, 'tag')) : [];
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
  
  _updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= this.state.totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `pagination-btn ${i === this.state.currentPage ? 'active' : ''}`;
      btn.textContent = i;
      btn.dataset.page = i;
      btn.addEventListener('click', () => this.goToPage(i));
      paginationContainer.appendChild(btn);
    }
  }
  
  _updateSeriesFilter() {
    const filterContainer = document.getElementById('series-filter');
    if (!filterContainer) return;
    
    filterContainer.innerHTML = '';
    
    // 添加"全部"按钮
    const allBtn = document.createElement('button');
    allBtn.className = `series-filter ${!this.state.selectedSeries ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => this.filterBySeries(null));
    filterContainer.appendChild(allBtn);
    
    // 添加系列按钮
    this.state.series.forEach(seriesItem => {
      const displayName = this.getSeriesDisplayName(seriesItem.name);
      const btn = document.createElement('button');
      btn.className = `series-filter ${this.state.selectedSeries === seriesItem.name ? 'active' : ''}`;
      btn.textContent = displayName;
      btn.addEventListener('click', () => this.filterBySeries(seriesItem.name));
      filterContainer.appendChild(btn);
    });
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
    this.loadSeriesNameMap();
    // 重新渲染产品以更新系列名称和产品翻译
    this.renderProducts();
    // 更新搜索框placeholder
    this.updateSearchPlaceholder();
  }
  
  updateSearchPlaceholder() {
    const searchInput = document.getElementById('search-input');
    if (searchInput && typeof i18n !== 'undefined') {
      searchInput.placeholder = i18n.t('search.placeholder');
    }
  }
  
  getProductTranslation(zhText, fieldType = 'name') {
    // 处理对象格式的输入（包含 zh, en, ko 字段）
    if (typeof zhText === 'object' && zhText !== null) {
      return zhText[this.state.currentLang] || zhText.zh || zhText;
    }
    
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
  
  _showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }
  
  _showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
  }
  
  _loadLocalFallbackData() {
    // 加载本地备用数据
    this.state.products = [];
    this.state.series = [];
    this.renderProducts();
  }
  
  _getDefaultSeriesNameMap() {
    // 默认的系列名称映射，仅作为 fallback
    return {
      '1-PU系列': '超纤',
      '2-真皮系列': '真皮系列',
      '3-短靴系列': '短靴系列',
      '4-乐福系列': '乐福系列',
      '5-春季': '春季系列',
      '6-夏季': '夏季系列',
      '7-秋季': '秋季系列'
    };
  }


  
  extractProductName(fileName) {
    // 从文件名中提取产品名称
    // 处理 "产品1 (1).jpg" 这样的格式
    const match = fileName.match(/^(.+?)\s*\(\d+\)\.\w+$/);
    if (match) {
      return match[1].trim();
    }
    // 处理 "产品1.jpg" 这样的格式
    return fileName.replace(/\.\w+$/, '').trim();
  }
  
  isMainImage(fileName) {
    // 判断是否为主图
    // 主图通常是 (1) 或没有数字后缀的图片
    return fileName.includes('(1)') || !fileName.match(/\s*\(\d+\)\.\w+$/);
  }
}

// 初始化前端
const frontend = new Frontend();

// 全局函数，用于产品详情框
function changeMainImage(src) {
  frontend.changeMainImage(src);
}

function openLightbox(src) {
  frontend.openLightbox(src);
}

function closeLightbox(event) {
  frontend.closeLightbox(event);
}

function navigateLightbox(direction) {
  frontend.navigateLightbox(direction);
}

function closeModal() {
  frontend.closeProductDetails();
}
