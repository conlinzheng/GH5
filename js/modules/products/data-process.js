import productDataFetch from './data-fetch.js';

class ProductDataProcess {
  constructor() {
    this.dataFetch = productDataFetch;
  }

  processProductData(rawData, getImageUrl) {
    const { seriesId, imageFiles, productsFile } = rawData;
    const products = [];
    const productGroups = {};

    // 按产品名称分组图片
    imageFiles.forEach(file => {
      const productName = this.dataFetch.extractProductName(file.name);
      if (!productGroups[productName]) {
        productGroups[productName] = [];
      }
      productGroups[productName].push(file.name);
    });

    // 为每个产品创建数据
    Object.entries(productGroups).forEach(([productName, images]) => {
      // 找到主图（通常是 (1) 或没有数字的图片）
      const mainImage = images.find(img => this.dataFetch.isMainImage(img)) || images[0];
      
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
        images: images.map(img => getImageUrl(seriesId, img))
      };
      
      console.log('构建的产品对象:', product);
      
      productGroups[productName] = product;
    });

    // 按排序顺序添加产品
    if (productsFile.order) {
      const orderNames = productsFile.order;
      orderNames.forEach(productName => {
        if (productGroups[productName]) {
          products.push(productGroups[productName]);
          delete productGroups[productName];
        }
      });
    }
    
    // 添加剩余的产品（确保所有产品都被加载，即使 order 字段有问题）
    Object.values(productGroups).forEach(product => {
      products.push(product);
    });

    return products;
  }

  extractProductName(fileName) {
    return this.dataFetch.extractProductName(fileName);
  }

  buildProductObject(seriesId, productName, images, productData, getImageUrl) {
    // 找到主图（通常是 (1) 或没有数字的图片）
    const mainImage = images.find(img => this.dataFetch.isMainImage(img)) || images[0];
    
    // 处理多语言字段
    const name = productData.name?.zh || productData.name || productName;
    const description = productData.description?.zh || productData.description || '';
    
    // 处理材质字段（兼容两种格式：materials 对象 或 单独字段）
    const upperMaterial = productData.materials?.upper || productData.upperMaterial || '';
    const innerMaterial = productData.materials?.lining || productData.innerMaterial || '';
    const soleMaterial = productData.materials?.sole || productData.soleMaterial || '';
    
    // 构建产品对象
    return {
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
      images: images.map(img => getImageUrl(seriesId, img))
    };
  }
}

const productDataProcess = new ProductDataProcess();
export default productDataProcess;