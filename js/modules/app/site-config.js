import githubAPI from '../../core/github-api.js';
import cacheManager from '../../core/cache.js';
import i18n from '../../core/i18n.js';

class SiteConfig {
  constructor(frontend) {
    this.frontend = frontend;
  }

  async loadSiteConfig() {
    try {
      cacheManager.clear('config.json');
      const config = await githubAPI.fetchFile('config.json');
      this.frontend.state.siteConfig = config;
      // 使用i18n的当前语言设置
      this.frontend.state.currentLang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : config.pageSettings?.defaultLanguage || 'zh';
      this.frontend.state.translations = config.translations || {};
      // 保存系列名称映射
      if (config.seriesNameMap) {
        this.frontend.state.seriesNameMap = config.seriesNameMap;
      }
      this.frontend.updateContactModal();
      this.frontend.updatePageTitle();
      this.frontend.updateCarousel();
    } catch (error) {
      console.error('Load site config error:', error);
      this.frontend.state.siteConfig = {
        siteInfo: {},
        contactForm: { formspreeId: '', enable: true },
        translations: {},
        pageSettings: {},
        pageAssets: {}
      };
      this.frontend.state.translations = {};
      // 使用默认系列名称映射
      this.frontend.state.seriesNameMap = this.frontend._getDefaultSeriesNameMap();
    }
  }



  getConfig(key, defaultValue) {
    const config = this.frontend.state.siteConfig;
    if (!config) return defaultValue;
    
    const keys = key.split('.');
    let value = config;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value !== undefined ? value : defaultValue;
  }

  getTranslation(key, lang) {
    const translations = this.frontend.state.translations;
    if (!translations || !translations[key]) return key;
    
    return translations[key][lang] || translations[key].zh || key;
  }
}

export default SiteConfig;