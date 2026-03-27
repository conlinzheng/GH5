// 核心模块
import config from './core/config.js';
import githubAPI from './core/github-api.js';
import cacheManager from './core/cache.js';
import errorHandler from './core/error.js';
import i18n from './core/i18n.js';

export { config, githubAPI, cacheManager, errorHandler, i18n };

// 产品模块
import productDataFetch from './modules/products/data-fetch.js';
import productDataProcess from './modules/products/data-process.js';
import productDataStore from './modules/products/data-store.js';
import productRender from './modules/products/render.js';
import productSearch from './modules/products/search.js';

export { productDataFetch, productDataProcess, productDataStore, productRender, productSearch };

// UI模块
import modalManager from './modules/ui/modal.js';
import browseHistory from './modules/ui/history.js';

export { modalManager, browseHistory };

// 事件模块
import productEvents from './modules/ui/events/products.js';
import searchEvents from './modules/ui/events/search.js';
import modalEvents from './modules/ui/events/modal.js';
import formEvents from './modules/ui/events/form.js';

export { productEvents, searchEvents, modalEvents, formEvents };

// 应用模块
import coreApp from './modules/app/core.js';
import siteConfig from './modules/app/site-config.js';
import uiManager from './modules/app/ui-manager.js';

export { coreApp, siteConfig, uiManager };

// 工具模块
import storageUtils from './modules/utils/storage.js';
import stringUtils from './modules/utils/string-utils.js';
import domUtils from './modules/utils/dom-utils.js';
import performanceUtils from './modules/utils/performance-utils.js';
import validationUtils from './modules/utils/validation-utils.js';

export { storageUtils, stringUtils, domUtils, performanceUtils, validationUtils };

// 导出默认对象
const GH5 = {
  // 核心模块
  config,
  githubAPI,
  cacheManager,
  errorHandler,
  i18n,
  
  // 产品模块
  productDataFetch,
  productDataProcess,
  productDataStore,
  productRender,
  productSearch,
  
  // UI模块
  modalManager,
  browseHistory,
  
  // 事件模块
  productEvents,
  searchEvents,
  modalEvents,
  formEvents,
  
  // 应用模块
  coreApp,
  siteConfig,
  uiManager,
  
  // 工具模块
  storageUtils,
  stringUtils,
  domUtils,
  performanceUtils,
  validationUtils
};

// 暴露到全局作用域
if (typeof window !== 'undefined') {
  window.GH5 = GH5;
  // 为了兼容旧代码
  window.frontend = GH5.coreApp;
  window.errorHandler = GH5.errorHandler;
  window.browseHistory = GH5.browseHistory;
}

export default GH5;