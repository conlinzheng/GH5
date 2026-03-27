// 核心模块
export { default as config } from './core/config.js';
export { default as githubAPI } from './core/github-api.js';
export { default as cacheManager } from './core/cache.js';
export { default as errorHandler } from './core/error.js';
export { default as i18n } from './core/i18n.js';

// 产品模块
export { default as productDataFetch } from './modules/products/data-fetch.js';
export { default as productDataProcess } from './modules/products/data-process.js';
export { default as productDataStore } from './modules/products/data-store.js';
export { default as productRender } from './modules/products/render.js';
export { default as productSearch } from './modules/products/search.js';

// UI模块
export { default as modalManager } from './modules/ui/modal.js';
export { default as browseHistory } from './modules/ui/history.js';

// 事件模块
export { default as productEvents } from './modules/ui/events/products.js';
export { default as searchEvents } from './modules/ui/events/search.js';
export { default as modalEvents } from './modules/ui/events/modal.js';
export { default as formEvents } from './modules/ui/events/form.js';

// 应用模块
export { default as coreApp } from './modules/app/core.js';
export { default as siteConfig } from './modules/app/site-config.js';
export { default as uiManager } from './modules/app/ui-manager.js';
export { default as productManager } from './modules/app/product-manager.js';
export { default as modalManagerModule } from './modules/app/modal-manager.js';
export { default as searchManager } from './modules/app/search-manager.js';
export { default as errorManager } from './modules/app/error-manager.js';
export { default as helpers } from './modules/app/helpers.js';

// 工具模块
export { default as storageUtils } from './modules/utils/storage.js';
export { default as stringUtils } from './modules/utils/string-utils.js';
export { default as domUtils } from './modules/utils/dom-utils.js';
export { default as performanceUtils } from './modules/utils/performance-utils.js';
export { default as validationUtils } from './modules/utils/validation-utils.js';

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
  productManager,
  modalManagerModule,
  searchManager,
  errorManager,
  helpers,
  
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