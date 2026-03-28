/**
 * 模块索引文件 - 统一导出所有模块
 */

// 导出UI管理模块
export { UIManager } from './ui';

// 导出产品管理模块
export { ProductManager } from './product';

// 导出系列管理模块
export { SeriesManager } from './series';

// 导出扫描模块
export {
  scanSeriesDirectories,
  scanProductsForAllSeries,
  scanProductsForSeries,
  loadProductsWithOrder,
  loadProductsWithoutOrder,
  addProductToCollection,
  createProductsFromImages,
  scanNewProducts,
  regenerateAllJson
} from './scan';
