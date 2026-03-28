import { Product, Series, ProductFile, ScanResult, NewProductsResult, JsonGenerationResult } from '../types';
import { extractProductName, getProductDisplayName, isMainImage } from '../utils/helpers';

/**
 * 扫描系列目录
 * @param githubAPI GitHub API 实例
 * @returns 系列列表
 */
export async function scanSeriesDirectories(githubAPI: any): Promise<Series[]> {
  try {
    const series = await githubAPI.fetchDirectory('产品图');
    return series.filter((item: any) => item.type === 'dir') as Series[];
  } catch (error) {
    console.error('扫描系列目录失败:', error);
    throw new Error('扫描系列目录失败，请检查网络连接或API设置');
  }
}

/**
 * 扫描所有系列的产品数据
 * @param series 系列列表
 * @param githubAPI GitHub API 实例
 * @returns 产品列表
 */
export async function scanProductsForAllSeries(series: Series[], githubAPI: any): Promise<Product[]> {
  const products: Product[] = [];
  const productPromises = series.map(async (seriesItem) => {
    try {
      await scanProductsForSeries(seriesItem, products, githubAPI);
    } catch (error) {
      console.warn(`Failed to load products for ${seriesItem.name}:`, error);
    }
  });
  
  await Promise.all(productPromises);
  return products;
}

/**
 * 扫描单个系列的产品数据
 * @param seriesItem 系列项
 * @param products 产品列表
 * @param githubAPI GitHub API 实例
 */
export async function scanProductsForSeries(seriesItem: Series, products: Product[], githubAPI: any): Promise<void> {
  // 尝试获取 products.json 文件
  let productsFile: ProductFile;
  try {
    productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
  } catch (error) {
    // 如果文件不存在，创建基于图片的产品数据
    productsFile = await createProductsFromImages(seriesItem, githubAPI);
  }
  
  if (productsFile && productsFile.products) {
    // 按排序顺序加载产品
    if (productsFile.order) {
      await loadProductsWithOrder(seriesItem, productsFile, products);
    } else {
      await loadProductsWithoutOrder(seriesItem, productsFile, products);
    }
  }
}

/**
 * 按排序顺序加载产品
 * @param seriesItem 系列项
 * @param productsFile 产品文件
 * @param products 产品列表
 */
export async function loadProductsWithOrder(seriesItem: Series, productsFile: ProductFile, products: Product[]): Promise<void> {
  const orderNames = productsFile.order || [];
  const validOrderNames: string[] = [];
  
  // 按排序顺序加载产品
  orderNames.forEach(productName => {
    // 找到对应的产品数据（查找匹配的文件名）
    const productEntry = Object.entries(productsFile.products).find(([fileName, productData]) => {
      return extractProductName(fileName) === productName;
    });
    
    if (productEntry) {
      validOrderNames.push(productName);
      const [fileName, productData] = productEntry;
      addProductToCollection(seriesItem, fileName, productData, products);
    }
  });
  
  // 添加未在排序中的产品（包括 order 中找不到匹配的）
  Object.entries(productsFile.products).forEach(([fileName, productData]) => {
    const productName = extractProductName(fileName);
    if (!validOrderNames.includes(productName)) {
      addProductToCollection(seriesItem, fileName, productData, products);
    }
  });
}

/**
 * 没有排序信息时加载产品
 * @param seriesItem 系列项
 * @param productsFile 产品文件
 * @param products 产品列表
 */
export async function loadProductsWithoutOrder(seriesItem: Series, productsFile: ProductFile, products: Product[]): Promise<void> {
  const productEntries = Object.entries(productsFile.products);
  productEntries.forEach(([fileName, productData]) => {
    addProductToCollection(seriesItem, fileName, productData, products);
  });
}

/**
 * 添加产品到集合
 * @param seriesItem 系列项
 * @param fileName 文件名
 * @param productData 产品数据
 * @param products 产品列表
 */
export function addProductToCollection(seriesItem: Series, fileName: string, productData: any, products: Product[]): void {
  const productName = extractProductName(fileName);
  const materials = productData.materials || productData;
  const product: Product = {
    id: fileName,
    seriesId: seriesItem.name,
    name: typeof productData.name === 'object' ? (productData.name?.zh || productName) : (productData.name || productName),
    description: typeof productData.description === 'object' ? (productData.description?.zh || '') : (productData.description || ''),
    price: productData.price || '',
    materials: materials,
    upperMaterial: materials?.upper || '',
    innerMaterial: materials?.lining || '',
    soleMaterial: materials?.sole || '',
    image: fileName,
    isMainImage: isMainImage(fileName)
  };
  products.push(product);
}

/**
 * 从图片创建产品数据
 * @param seriesItem 系列项
 * @param githubAPI GitHub API 实例
 * @returns 产品文件
 */
export async function createProductsFromImages(seriesItem: Series, githubAPI: any): Promise<ProductFile> {
  try {
    // 扫描系列目录下的图片文件
    const files = await githubAPI.fetchDirectory(seriesItem.path);
    const imageFiles = files.filter((file: any) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    });
    
    // 按产品分组图片
    const products: { [key: string]: any } = {};
    const productGroups: { [key: string]: string[] } = {};
    
    imageFiles.forEach((file: any) => {
      // 解析文件名，识别产品名称
      const productName = extractProductName(file.name);
      if (!productGroups[productName]) {
        productGroups[productName] = [];
      }
      productGroups[productName].push(file.name);
    });
    
    // 为每个产品创建数据
    Object.entries(productGroups).forEach(([productName, images]) => {
      // 找到主图（通常是 (1) 或没有数字的图片）
      const mainImage = images.find((img: string) => isMainImage(img)) || images[0];
      
      products[mainImage] = {
        name: getProductDisplayName(productName),
        description: '',
        price: '',
        materials: {}
      };
    });
    
    return { products };
  } catch (error) {
    console.error('Create products from images error:', error);
    return { products: {} };
  }
}

/**
 * 扫描新增产品
 * @param githubAPI GitHub API 实例
 * @param seriesNameMap 系列名称映射
 * @returns 新增产品结果
 */
export async function scanNewProducts(githubAPI: any, seriesNameMap: { [key: string]: string }): Promise<NewProductsResult> {
  // 扫描产品图目录
  const series = await githubAPI.fetchDirectory('产品图');
  const dirSeries = series.filter((item: any) => item.type === 'dir') as Series[];
  
  let newProductsCount = 0;
  const updatedSeries: string[] = [];
  
  // 扫描每个系列的新增产品
  for (const seriesItem of dirSeries) {
    try {
      // 尝试获取现有产品数据
      let existingProducts: { [key: string]: any } = {};
      try {
        const productsFile = await githubAPI.fetchFile(`${seriesItem.path}/products.json`);
        if (productsFile && productsFile.products) {
          existingProducts = productsFile.products;
        }
      } catch (error) {
        // 文件不存在，继续执行
      }
      
      // 扫描系列目录下的图片文件
      const files = await githubAPI.fetchDirectory(seriesItem.path);
      const imageFiles = files.filter((file: any) => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
      });
      
      // 按产品分组图片
      const productGroups: { [key: string]: string[] } = {};
      imageFiles.forEach((file: any) => {
        const productName = extractProductName(file.name);
        if (!productGroups[productName]) {
          productGroups[productName] = [];
        }
        productGroups[productName].push(file.name);
      });
      
      // 检查是否有新增产品
      const newProducts: { [key: string]: any } = {};
      Object.entries(productGroups).forEach(([productName, images]) => {
        // 找到主图
        const mainImage = images.find((img: string) => isMainImage(img)) || images[0];
        // 检查是否已存在
        if (!existingProducts[mainImage]) {
          newProducts[mainImage] = {
            name: getProductDisplayName(productName),
            description: '',
            price: '',
            materials: {}
          };
          newProductsCount++;
        }
      });
      
      // 如果有新增产品，更新products.json文件
      if (Object.keys(newProducts).length > 0) {
        const updatedProducts = {
          ...existingProducts,
          ...newProducts
        };
        
        const productsJsonContent = JSON.stringify({
          products: updatedProducts,
          displayName: {
            zh: seriesNameMap[seriesItem.name] || seriesItem.name
          }
        }, null, 2);
        
        await githubAPI.commitFile(
          `${seriesItem.path}/products.json`,
          productsJsonContent,
          `Add new products to ${seriesItem.name}`
        );
        
        updatedSeries.push(seriesItem.name);
      }
    } catch (error) {
      console.warn(`Failed to scan new products for ${seriesItem.name}:`, error);
    }
  }
  
  return {
    count: newProductsCount,
    series: updatedSeries
  };
}

/**
 * 重新生成所有JSON文件
 * @param githubAPI GitHub API 实例
 * @param seriesNameMap 系列名称映射
 * @returns JSON生成结果
 */
export async function regenerateAllJson(githubAPI: any, seriesNameMap: { [key: string]: string }): Promise<JsonGenerationResult> {
  try {
    // 扫描产品图目录
    const series = await githubAPI.fetchDirectory('产品图');
    const dirSeries = series.filter((item: any) => item.type === 'dir') as Series[];
    
    let regeneratedCount = 0;
    const updatedSeries: string[] = [];
    
    // 为每个系列重新生成products.json文件
    for (const seriesItem of dirSeries) {
      try {
        // 扫描系列目录下的图片文件
        const files = await githubAPI.fetchDirectory(seriesItem.path);
        const imageFiles = files.filter((file: any) => {
          const ext = file.name.split('.').pop().toLowerCase();
          return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        });
        
        // 按产品分组图片
        const productGroups: { [key: string]: string[] } = {};
        imageFiles.forEach((file: any) => {
          const productName = extractProductName(file.name);
          if (!productGroups[productName]) {
            productGroups[productName] = [];
          }
          productGroups[productName].push(file.name);
        });
        
        // 为每个产品创建数据
        const products: { [key: string]: any } = {};
        Object.entries(productGroups).forEach(([productName, images]) => {
          // 找到主图
          const mainImage = images.find((img: string) => isMainImage(img)) || images[0];
          
          products[mainImage] = {
            name: getProductDisplayName(productName),
            description: '',
            price: '',
            materials: {}
          };
        });
        
        // 生成products.json内容
        const productsJsonContent = JSON.stringify({
          products: products,
          displayName: {
            zh: seriesNameMap[seriesItem.name] || seriesItem.name
          }
        }, null, 2);
        
        // 保存到GitHub
        await githubAPI.commitFile(
          `${seriesItem.path}/products.json`,
          productsJsonContent,
          `Regenerate products.json for ${seriesItem.name}`
        );
        
        regeneratedCount++;
        updatedSeries.push(seriesItem.name);
      } catch (error) {
        console.warn(`Failed to regenerate JSON for ${seriesItem.name}:`, error);
      }
    }
    
    return {
      count: regeneratedCount,
      series: updatedSeries
    };
  } catch (error) {
    console.error('重新生成JSON文件失败:', error);
    throw new Error('重新生成JSON文件失败，请检查网络连接或API设置');
  }
}