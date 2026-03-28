import { Product, Series } from '../types';
import { getImageUrl } from '../utils/helpers';

/**
 * UI模块 - 负责处理所有与UI相关的操作
 */
export class UIManager {
  private seriesNameMap: { [key: string]: string };
  private seriesOrder: string[];
  private productOrders: { [seriesId: string]: string[] };
  
  /**
   * 构造函数
   * @param seriesNameMap 系列名称映射
   * @param seriesOrder 系列顺序
   * @param productOrders 产品顺序
   */
  constructor(
    seriesNameMap: { [key: string]: string },
    seriesOrder: string[],
    productOrders: { [seriesId: string]: string[] }
  ) {
    this.seriesNameMap = seriesNameMap;
    this.seriesOrder = seriesOrder;
    this.productOrders = productOrders;
  }
  
  /**
   * 更新UI的所有部分
   * @param series 系列列表
   * @param products 产品列表
   * @param currentSeries 当前选中的系列
   */
  updateUI(series: Series[], products: Product[], currentSeries: string | null): void {
    this.updateSeriesList(series, products);
    this.updateFileList(products, currentSeries);
    this.updateSystemStatus(products, series);
    this.updateSeriesSelect(series);
  }
  
  /**
   * 更新系列列表
   * @param series 系列列表
   * @param products 产品列表
   */
  updateSeriesList(series: Series[], products: Product[]): void {
    const seriesList = document.getElementById('series-list');
    if (!seriesList) return;
    
    seriesList.innerHTML = '';
    
    // 按系列顺序排序
    const sortedSeries = this.getSortedSeries(series);
    
    sortedSeries.forEach(seriesItem => {
      const seriesProducts = products.filter(p => p.seriesId === seriesItem.name);
      const displayName = this.seriesNameMap[seriesItem.name] || seriesItem.name;
      const card = document.createElement('div');
      card.className = 'series-card';
      card.draggable = true;
      card.dataset.seriesName = seriesItem.name;
      
      card.innerHTML = `
        <h3>${displayName}</h3>
        <div class="series-folder-name">文件夹: ${seriesItem.name}</div>
        <div class="product-count">产品数量: ${seriesProducts.length}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${seriesProducts.length > 0 ? '100%' : '0%'}"></div>
        </div>
        <div class="file-actions">
          <button class="btn-edit" data-series="${seriesItem.name}">编辑</button>
          <button class="btn-view" data-series="${seriesItem.name}">查看</button>
        </div>
      `;
      
      seriesList.appendChild(card);
    });
  }
  
  /**
   * 获取排序后的系列列表
   * @param series 原始系列列表
   * @returns 排序后的系列列表
   */
  private getSortedSeries(series: Series[]): Series[] {
    let sortedSeries = [...series];
    
    if (this.seriesOrder.length > 0) {
      sortedSeries = this.seriesOrder.map(seriesName => 
        series.find(s => s.name === seriesName)
      ).filter(Boolean) as Series[];
      
      // 添加未在排序中的系列
      series.forEach(seriesItem => {
        if (!this.seriesOrder.includes(seriesItem.name)) {
          sortedSeries.push(seriesItem);
        }
      });
    }
    
    return sortedSeries;
  }
  
  /**
   * 更新文件列表
   * @param products 产品列表
   * @param currentSeries 当前选中的系列
   */
  updateFileList(products: Product[], currentSeries: string | null): void {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    let filteredProducts = products;
    if (currentSeries) {
      filteredProducts = products.filter(p => p.seriesId === currentSeries);
    }
    
    // 按产品分组
    const productsByGroup = this.groupProductsByProductName(filteredProducts);
    
    // 获取产品顺序
    let productOrder: string[] = [];
    if (currentSeries && this.productOrders[currentSeries]) {
      productOrder = this.productOrders[currentSeries];
    }
    
    // 按顺序渲染产品组
    const productGroups = Object.entries(productsByGroup);
    if (productOrder.length > 0) {
      // 按排序顺序渲染
      productOrder.forEach(orderName => {
        const productGroup = productGroups.find(([groupName]) => groupName === orderName);
        if (productGroup) {
          this.renderProductGroup(productGroup[0], productGroup[1], fileList);
        }
      });
      
      // 渲染未在排序中的产品组
      productGroups.forEach(([groupName, group]) => {
        if (!productOrder.includes(groupName)) {
          this.renderProductGroup(groupName, group, fileList);
        }
      });
    } else {
      // 没有排序信息，按默认顺序渲染
      productGroups.forEach(([groupName, group]) => {
        this.renderProductGroup(groupName, group, fileList);
      });
    }
  }
  
  /**
   * 按产品名称分组产品
   * @param products 产品列表
   * @returns 按产品名称分组的产品
   */
  private groupProductsByProductName(products: Product[]): { [key: string]: Product[] } {
    const productsByGroup: { [key: string]: Product[] } = {};
    
    products.forEach(product => {
      const productName = this.extractProductName(product.image);
      if (!productsByGroup[productName]) {
        productsByGroup[productName] = [];
      }
      productsByGroup[productName].push(product);
    });
    
    return productsByGroup;
  }
  
  /**
   * 从文件名中提取产品名称
   * @param fileName 文件名
   * @returns 产品名称
   */
  private extractProductName(fileName: string): string {
    // 处理 "产品1 (1).jpg" 这样的格式
    const match = fileName.match(/^(.+?)\s*\(\d+\)\.\w+$/);
    if (match) {
      return match[1].trim();
    }
    // 处理 "产品1.jpg" 这样的格式
    return fileName.replace(/\.\w+$/, '').trim();
  }
  
  /**
   * 渲染产品组
   * @param productName 产品名称
   * @param products 产品列表
   * @param container 容器元素
   */
  private renderProductGroup(productName: string, products: Product[], container: HTMLElement): void {
    const mainProduct = products.find(p => p.isMainImage) || products[0];
    if (!mainProduct) return;
    
    const productItem = document.createElement('li');
    productItem.className = 'file-item';
    productItem.draggable = true;
    productItem.dataset.productName = productName;
    
    const imageUrl = getImageUrl(mainProduct.seriesId, mainProduct.image);
    
    productItem.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="${imageUrl}" alt="${productName}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0;">${mainProduct.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">系列: ${this.seriesNameMap[mainProduct.seriesId] || mainProduct.seriesId}</p>
        </div>
        <div class="file-actions">
          <button class="btn-edit" data-product-id="${mainProduct.id}" data-series-id="${mainProduct.seriesId}">编辑</button>
          <button class="btn-view" data-product-id="${mainProduct.id}" data-series-id="${mainProduct.seriesId}">查看</button>
          <button class="btn-toggle">图片</button>
        </div>
      </div>
      <div class="other-images-container" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; display: none;">
        <h5 style="margin: 0 0 10px 0; font-size: 14px;">所有图片</h5>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${products.map(product => {
            const imgUrl = getImageUrl(product.seriesId, product.image);
            return `
              <div style="text-align: center;">
                <img src="${imgUrl}" alt="${product.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">${product.image}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    container.appendChild(productItem);
  }
  
  /**
   * 切换产品图片的显示/隐藏
   * @param productName 产品名称
   */
  toggleProductImages(productName: string): void {
    const productItem = document.querySelector(`.file-item[data-product-name="${productName}"]`);
    if (productItem) {
      const imagesContainer = productItem.querySelector('.other-images-container');
      if (imagesContainer) {
        if (imagesContainer.style.display === 'none' || imagesContainer.style.display === '') {
          imagesContainer.style.display = 'block';
        } else {
          imagesContainer.style.display = 'none';
        }
      }
    }
  }
  
  /**
   * 切换所有图片的显示/隐藏
   */
  toggleAllImages(): void {
    const allContainers = document.querySelectorAll('.other-images-container');
    let allVisible = true;
    
    // 检查是否所有图片都已展开
    allContainers.forEach(container => {
      if (container.style.display === 'none' || container.style.display === '') {
        allVisible = false;
      }
    });
    
    // 如果所有都已展开，则折叠所有
    if (allVisible) {
      allContainers.forEach(container => {
        container.style.display = 'none';
      });
    } else {
      // 否则展开所有
      allContainers.forEach(container => {
        container.style.display = 'block';
      });
    }
  }
  
  /**
   * 更新系统状态
   * @param products 产品列表
   * @param series 系列列表
   */
  updateSystemStatus(products: Product[], series: Series[]): void {
    const productCountElement = document.getElementById('product-count');
    const seriesCountElement = document.getElementById('series-count');
    
    if (productCountElement) {
      productCountElement.textContent = products.length.toString();
    }
    
    if (seriesCountElement) {
      seriesCountElement.textContent = series.length.toString();
    }
  }
  
  /**
   * 更新系列选择下拉框
   * @param series 系列列表
   */
  updateSeriesSelect(series: Series[]): void {
    const seriesSelect = document.getElementById('product-series');
    if (seriesSelect) {
      seriesSelect.innerHTML = '';
      series.forEach(seriesItem => {
        const option = document.createElement('option');
        option.value = seriesItem.name;
        option.textContent = this.seriesNameMap[seriesItem.name] || seriesItem.name;
        seriesSelect.appendChild(option);
      });
    }
  }
  
  /**
   * 显示状态消息
   * @param message 消息内容
   * @param type 消息类型
   */
  showStatus(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void {
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;
    
    const statusElement = document.createElement('div');
    statusElement.className = `status-message status-${type}`;
    statusElement.textContent = message;
    
    statusContainer.appendChild(statusElement);
    
    // 3秒后自动移除
    setTimeout(() => {
      statusElement.remove();
    }, 3000);
  }
  
  /**
   * 更新最后扫描时间
   */
  updateLastScanTime(): void {
    const lastScanElement = document.getElementById('last-scan');
    if (lastScanElement) {
      const startTime = new Date();
      lastScanElement.textContent = startTime.toLocaleString();
    }
  }
  
  /**
   * 加载缓存状态
   */
  loadCacheStatus(): void {
    const cacheStatusElement = document.getElementById('cache-status');
    if (cacheStatusElement) {
      cacheStatusElement.textContent = '已加载';
    }
  }
}