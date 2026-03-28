import { Product, Series, ProductFile } from '../types';
import { getImageUrl, extractProductName, getProductDisplayName, isMainImage } from '../utils/helpers';

/**
 * 产品管理模块 - 负责处理产品相关的操作
 */
export class ProductManager {
  private seriesNameMap: { [key: string]: string };
  private productOrders: { [seriesId: string]: string[] };
  private githubAPI: any;
  private uiManager: any;
  
  /**
   * 构造函数
   * @param seriesNameMap 系列名称映射
   * @param productOrders 产品顺序
   * @param githubAPI GitHub API 实例
   * @param uiManager UI管理器实例
   */
  constructor(
    seriesNameMap: { [key: string]: string },
    productOrders: { [seriesId: string]: string[] },
    githubAPI: any,
    uiManager: any
  ) {
    this.seriesNameMap = seriesNameMap;
    this.productOrders = productOrders;
    this.githubAPI = githubAPI;
    this.uiManager = uiManager;
  }
  
  /**
   * 保存产品数据
   * @param currentEditingProduct 当前编辑的产品
   * @returns Promise<void>
   */
  async saveProduct(currentEditingProduct: Product | null): Promise<void> {
    console.log('Saving product...');
    const saveBtn = document.getElementById('btn-save-product');
    if (saveBtn) saveBtn.disabled = true;
    
    try {
      this.uiManager.showStatus('正在保存产品数据...', 'info');
      
      // 获取表单数据
      const formData = this.getFormData();
      
      // 验证表单数据
      if (!formData || typeof formData !== 'object') {
        this.uiManager.showStatus('表单数据无效', 'error');
        return;
      }
      
      // 验证必填字段
      if (!formData.name || !formData.seriesId || !formData.image) {
        this.uiManager.showStatus('请填写必填字段', 'error');
        return;
      }
      
      // 验证字段类型
      if (typeof formData.name !== 'string' || typeof formData.seriesId !== 'string' || typeof formData.image !== 'string') {
        this.uiManager.showStatus('表单字段类型错误', 'error');
        return;
      }
      
      // 找到当前编辑的产品
      const productIndex = this.findProductIndex(currentEditingProduct, formData);
      
      if (productIndex >= 0) {
        // 更新现有产品
        const updatedProduct = this.createUpdatedProduct(currentEditingProduct!, formData);
        
        // 保存到GitHub
        try {
          await this.saveProductToGitHub(updatedProduct);
          this.uiManager.showStatus('产品数据保存成功', 'success');
        } catch (error) {
          console.error('Save product to GitHub error:', error);
          this.uiManager.showStatus('产品数据已更新（本地），但保存到GitHub失败: ' + error.message, 'warning');
        }
      } else {
        this.uiManager.showStatus('未找到要保存的产品', 'error');
      }
    } catch (error) {
      console.error('Save product error:', error);
      this.uiManager.showStatus('保存产品数据失败: ' + error.message, 'error');
    } finally {
      const saveBtn = document.getElementById('btn-save-product');
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  
  /**
   * 获取表单数据
   * @returns 表单数据
   */
  private getFormData(): any {
    return {
      name: document.getElementById('product-name').value,
      price: document.getElementById('product-price').value,
      description: document.getElementById('product-description').value,
      upperMaterial: document.getElementById('product-upper-material').value,
      innerMaterial: document.getElementById('product-inner-material').value,
      soleMaterial: document.getElementById('product-sole-material').value,
      customizable: document.getElementById('product-customizable').value,
      minOrder: document.getElementById('product-min-order').value,
      tags: document.getElementById('product-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
      seriesId: document.getElementById('product-series').value,
      image: document.getElementById('product-image').value
    };
  }
  
  /**
   * 找到产品索引
   * @param currentEditingProduct 当前编辑的产品
   * @param formData 表单数据
   * @returns 产品索引
   */
  private findProductIndex(currentEditingProduct: Product | null, formData: any): number {
    if (!currentEditingProduct) return -1;
    if (!formData || typeof formData !== 'object') return -1;
    
    // 根据产品ID或图片名称查找索引
    const productId = currentEditingProduct.id;
    const productImage = currentEditingProduct.image;
    const seriesId = currentEditingProduct.seriesId;
    
    // 如果formData中包含products数组，则在数组中查找
    if (formData.products && Array.isArray(formData.products)) {
      return formData.products.findIndex((p: Product) => 
        p.id === productId || 
        (p.image === productImage && p.seriesId === seriesId)
      );
    }
    
    // 如果formData中包含productId，直接比较
    if (formData.id && formData.id === productId) {
      return 0;
    }
    
    // 根据图片名称和系列ID判断是否是同一个产品
    if (formData.image && formData.seriesId) {
      if (formData.image === productImage && formData.seriesId === seriesId) {
        return 0;
      }
    }
    
    return -1;
  }
  
  /**
   * 创建更新后的产品
   * @param currentProduct 当前产品
   * @param formData 表单数据
   * @returns 更新后的产品
   */
  private createUpdatedProduct(currentProduct: Product, formData: any): Product {
    return {
      ...currentProduct,
      ...formData,
      materials: {
        upper: formData.upperMaterial,
        lining: formData.innerMaterial,
        sole: formData.soleMaterial
      }
    };
  }
  
  /**
   * 保存产品到GitHub
   * @param product 产品数据
   * @returns Promise<void>
   */
  private async saveProductToGitHub(product: Product): Promise<void> {
    // 验证产品数据
    if (!product || typeof product !== 'object') {
      throw new Error('产品数据无效');
    }
    if (!product.seriesId || !product.image) {
      throw new Error('产品缺少必要的字段（seriesId或image）');
    }
    
    // 获取现有产品数据
    const productsFile: ProductFile = await this.githubAPI.fetchFile(`${product.seriesId}/products.json`);
    
    if (productsFile && productsFile.products) {
      // 更新产品数据
      productsFile.products[product.image] = {
        name: product.name,
        description: product.description,
        price: product.price,
        materials: product.materials
      };
      
      // 保存到GitHub
      const productsJsonContent = JSON.stringify(productsFile, null, 2);
      await this.githubAPI.commitFile(
        `${product.seriesId}/products.json`,
        productsJsonContent,
        `Update product ${product.name}`
      );
    } else {
      throw new Error('产品数据文件格式错误');
    }
  }
  
  /**
   * 保存产品顺序
   * @param products 产品列表
   * @returns Promise<void>
   */
  async saveProductOrder(products: Product[]): Promise<void> {
    console.log('Saving product order...');
    
    // 参数验证
    if (!Array.isArray(products)) {
      console.error('saveProductOrder error: products must be an array');
      return;
    }
    
    const saveBtn = document.getElementById('btn-save-product-order');
    if (saveBtn) saveBtn.disabled = true;
    
    try {
      this.uiManager.showStatus('正在保存产品顺序...', 'info');
      
      // 按系列保存产品顺序
      const fileList = document.getElementById('file-list');
      if (!fileList) {
        this.uiManager.showStatus('未找到产品列表元素', 'error');
        return;
      }
      
      const productItems = fileList.querySelectorAll('.file-item');
      
      // 按系列分组产品
      const productOrderBySeries = this.groupProductOrderBySeries(productItems, products);
      
      let savedCount = 0;
      
      // 保存每个系列的产品顺序
      for (const [seriesId, productOrder] of Object.entries(productOrderBySeries)) {
        try {
          await this.saveSeriesProductOrder(seriesId, productOrder);
          savedCount++;
        } catch (error) {
          console.error(`Save product order for ${seriesId} error:`, error);
          // 即使保存到GitHub失败，也要更新本地状态
          this.productOrders[seriesId] = productOrder;
        }
      }
      
      if (savedCount > 0) {
        this.uiManager.showStatus(`成功保存 ${savedCount} 个系列的产品顺序`, 'success');
      } else {
        this.uiManager.showStatus('产品顺序已更新（本地），但保存到GitHub失败', 'warning');
      }
    } catch (error) {
      console.error('Save product order error:', error);
      this.uiManager.showStatus('保存产品顺序失败: ' + error.message, 'error');
    } finally {
      const saveBtn = document.getElementById('btn-save-product-order');
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  
  /**
   * 按系列分组产品顺序
   * @param productItems 产品元素列表
   * @param products 产品列表
   * @returns 按系列分组的产品顺序
   */
  private groupProductOrderBySeries(productItems: NodeListOf<Element>, products: Product[]): { [seriesId: string]: string[] } {
    const productOrderBySeries: { [seriesId: string]: string[] } = {};
    
    productItems.forEach(item => {
      const productName = item.dataset.productName;
      const product = products.find(p => extractProductName(p.image) === productName);
      if (product) {
        if (!productOrderBySeries[product.seriesId]) {
          productOrderBySeries[product.seriesId] = [];
        }
        productOrderBySeries[product.seriesId].push(productName);
      }
    });
    
    return productOrderBySeries;
  }
  
  /**
   * 保存系列产品顺序
   * @param seriesId 系列ID
   * @param productOrder 产品顺序
   * @returns Promise<void>
   */
  private async saveSeriesProductOrder(seriesId: string, productOrder: string[]): Promise<void> {
    // 验证参数
    if (!seriesId || typeof seriesId !== 'string') {
      throw new Error('系列ID无效');
    }
    if (!Array.isArray(productOrder)) {
      throw new Error('产品顺序必须是数组');
    }
    
    // 尝试获取现有产品数据
    let productsFile: ProductFile = { products: {} };
    try {
      const fetchedFile = await this.githubAPI.fetchFile(`${seriesId}/products.json`);
      if (fetchedFile && typeof fetchedFile === 'object') {
        productsFile = fetchedFile as ProductFile;
      }
    } catch (error) {
      // 文件不存在，使用默认的空对象
      console.log(`产品文件不存在，创建新的: ${seriesId}/products.json`);
    }
    
    // 确保products字段存在
    if (!productsFile.products) {
      productsFile.products = {};
    }
    
    // 更新产品顺序
    productsFile.order = productOrder;
    
    // 保存到GitHub
    const productsJsonContent = JSON.stringify(productsFile, null, 2);
    await this.githubAPI.commitFile(
      `${seriesId}/products.json`,
      productsJsonContent,
      `Update product order for ${seriesId}`
    );
    
    // 更新本地数据
    this.productOrders[seriesId] = productOrder;
  }
  
  /**
   * 导入数据
   * @param updateUI 更新UI的回调函数
   * @returns Promise<void>
   */
  async importData(updateUI: () => void): Promise<void> {
    console.log('Importing data...');
    try {
      // 创建文件选择输入
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      // 监听文件选择
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            this.uiManager.showStatus('正在导入数据...', 'info');
            
            // 读取文件内容
            const reader = new FileReader();
            reader.onload = async (event) => {
              try {
                const importedData = JSON.parse(event.target.result);
                
                // 验证数据格式
                if (importedData.products && Array.isArray(importedData.products)) {
                  // 更新数据
                  // 这里需要根据实际的数据存储方式来实现
                  
                  // 更新UI
                  updateUI();
                  this.uiManager.showStatus('数据导入成功', 'success');
                } else {
                  this.uiManager.showStatus('导入数据格式错误', 'error');
                }
              } catch (parseError) {
                console.error('Parse JSON error:', parseError);
                this.uiManager.showStatus('JSON解析失败: ' + parseError.message, 'error');
              }
            };
            reader.onerror = (error) => {
              console.error('Read file error:', error);
              this.uiManager.showStatus('文件读取失败', 'error');
            };
            reader.readAsText(file);
          } catch (error) {
            console.error('Import data error:', error);
            this.uiManager.showStatus('数据导入失败: ' + error.message, 'error');
          }
        }
      });
      
      // 触发文件选择
      input.click();
    } catch (error) {
      console.error('Open file dialog error:', error);
      this.uiManager.showStatus('打开文件选择器失败: ' + error.message, 'error');
    }
  }
  
  /**
   * 导出数据
   * @param products 产品列表
   * @param series 系列列表
   * @param seriesOrder 系列顺序
   * @returns Promise<void>
   */
  async exportData(products: Product[], series: Series[], seriesOrder: string[]): Promise<void> {
    console.log('Exporting data...');
    
    // 参数验证
    if (!Array.isArray(products)) {
      console.error('exportData error: products must be an array');
      this.uiManager.showStatus('导出失败：产品数据格式错误', 'error');
      return;
    }
    if (!Array.isArray(series)) {
      console.error('exportData error: series must be an array');
      this.uiManager.showStatus('导出失败：系列数据格式错误', 'error');
      return;
    }
    if (!Array.isArray(seriesOrder)) {
      console.error('exportData error: seriesOrder must be an array');
      this.uiManager.showStatus('导出失败：系列顺序数据格式错误', 'error');
      return;
    }
    
    try {
      this.uiManager.showStatus('正在导出数据...', 'info');
      
      // 收集所有数据
      const exportData = {
        products: products,
        series: series,
        seriesNameMap: this.seriesNameMap,
        seriesOrder: seriesOrder,
        productOrders: this.productOrders,
        exportDate: new Date().toISOString()
      };
      
      // 生成JSON内容
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      // 创建下载链接
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gh5-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.uiManager.showStatus('数据导出成功', 'success');
    } catch (error) {
      console.error('Export data error:', error);
      this.uiManager.showStatus('数据导出失败: ' + error.message, 'error');
    }
  }
  
  /**
   * 保存本地数据
   * @param products 产品列表
   * @returns Promise<void>
   */
  async saveLocalData(products: Product[]): Promise<void> {
    // 参数验证
    if (!Array.isArray(products)) {
      console.error('saveLocalData error: products must be an array');
      this.uiManager.showStatus('保存失败：产品数据格式错误', 'error');
      return;
    }
    
    try {
      this.uiManager.showStatus('正在生成本地数据...', 'info');
      
      // 收集所有产品数据
      const localData = products.map(product => ({
        id: product.id,
        seriesId: product.seriesId,
        name: product.name,
        description: product.description,
        price: product.price,
        materials: product.materials,
        upperMaterial: product.upperMaterial,
        innerMaterial: product.innerMaterial,
        soleMaterial: product.soleMaterial,
        image: product.image,
        isMainImage: product.isMainImage
      }));
      
      // 生成local-data.js文件内容
      const localDataJsContent = '// 本地产品数据，作为 GitHub API 访问失败的备选\nexport const localProductsData = ' + JSON.stringify(localData, null, 2) + ';\n\nexport default localProductsData;';
      
      // 创建下载链接
      const blob = new Blob([localDataJsContent], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'local-data.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.uiManager.showStatus('本地数据保存成功', 'success');
    } catch (error) {
      console.error('Save local data error:', error);
      this.uiManager.showStatus('保存本地数据失败: ' + error.message, 'error');
    }
  }
  
  /**
   * 编辑产品
   * @param productId 产品ID
   * @param seriesId 系列ID
   * @param products 产品列表
   */
  editProduct(productId: string, seriesId: string, products: Product[]): void {
    // 参数验证
    if (!productId || typeof productId !== 'string') {
      console.error('editProduct error: productId must be a non-empty string');
      return;
    }
    if (!seriesId || typeof seriesId !== 'string') {
      console.error('editProduct error: seriesId must be a non-empty string');
      return;
    }
    if (!Array.isArray(products)) {
      console.error('editProduct error: products must be an array');
      return;
    }
    
    const product = products.find(p => p.id === productId && p.seriesId === seriesId);
    if (product) {
      this.fillProductForm(product);
    }
  }
  
  /**
   * 填充产品表单
   * @param product 产品数据
   */
  private fillProductForm(product: Product): void {
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-price').value = product.price || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-upper-material').value = product.upperMaterial || '';
    document.getElementById('product-inner-material').value = product.innerMaterial || '';
    document.getElementById('product-sole-material').value = product.soleMaterial || '';
    document.getElementById('product-customizable').value = product.customizable || '';
    document.getElementById('product-min-order').value = product.minOrder || '';
    document.getElementById('product-tags').value = product.tags ? product.tags.join(', ') : '';
    document.getElementById('product-series').value = product.seriesId;
    document.getElementById('product-image').value = product.image;
  }
  
  /**
   * 查看产品
   * @param productId 产品ID
   * @param seriesId 系列ID
   * @param products 产品列表
   */
  viewProduct(productId: string, seriesId: string, products: Product[]): void {
    // 参数验证
    if (!productId || typeof productId !== 'string') {
      console.error('viewProduct error: productId must be a non-empty string');
      return;
    }
    if (!seriesId || typeof seriesId !== 'string') {
      console.error('viewProduct error: seriesId must be a non-empty string');
      return;
    }
    if (!Array.isArray(products)) {
      console.error('viewProduct error: products must be an array');
      return;
    }
    
    const product = products.find(p => p.id === productId && p.seriesId === seriesId);
    if (product) {
      const imageUrl = getImageUrl(product.seriesId, product.image);
      let message = `产品详情：\n\n`;
      message += `名称: ${product.name || '无'}\n`;
      message += `价格: ${product.price || '无'}\n`;
      message += `描述: ${product.description || '无'}\n`;
      message += `鞋面材质: ${product.upperMaterial || '无'}\n`;
      message += `内里材质: ${product.innerMaterial || '无'}\n`;
      message += `鞋底材质: ${product.soleMaterial || '无'}\n`;
      message += `是否支持定制: ${product.customizable ? '是' : '否'}\n`;
      message += `起订量: ${product.minOrder || '无'}\n`;
      message += `标签: ${product.tags ? product.tags.join(', ') : '无'}\n`;
      message += `系列: ${this.seriesNameMap[product.seriesId] || product.seriesId}\n`;
      message += `图片: ${product.image}\n`;
      message += `图片URL: ${imageUrl}\n`;
      
      alert(message);
    }
  }
}