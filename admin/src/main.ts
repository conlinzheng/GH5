/**
 * 管理后台主入口文件
 * 负责整合所有模块并初始化应用
 */

import { Product, Series } from './types';
import { UIManager, ProductManager, SeriesManager, scanSeriesDirectories, scanProductsForAllSeries, scanNewProducts, regenerateAllJson } from './modules';
import { getDragAfterElement, bindEvent } from './utils';

/**
 * 管理后台主类
 */
export class AdminPanel {
  private series: Series[] = [];
  private products: Product[] = [];
  private currentEditingProduct: Product | null = null;
  private currentSeries: string | null = null;
  private seriesNameMap: { [key: string]: string } = {
    '1-PU系列': 'PU超纤',
    '2-真皮系列': '真皮系列',
    '3-短靴系列': '短靴系列',
    '4-乐福系列': '乐福系列',
    '5-春季': '春季系列',
    '6-夏季': '夏季系列',
    '7-秋季': '秋季系列'
  };
  private seriesOrder: string[] = [];
  private productOrders: { [seriesId: string]: string[] } = {};
  
  private uiManager: UIManager;
  private productManager: ProductManager;
  private seriesManager: SeriesManager;
  
  /**
   * 构造函数
   */
  constructor() {
    // 初始化管理器
    this.uiManager = new UIManager(this.seriesNameMap, this.seriesOrder, this.productOrders);
    this.productManager = new ProductManager(this.seriesNameMap, this.productOrders, GH5.githubAPI, this.uiManager);
    this.seriesManager = new SeriesManager(this.seriesNameMap, this.seriesOrder, GH5.githubAPI, this.uiManager);
    
    this.init();
  }
  
  /**
   * 初始化
   */
  async init() {
    this.setupEventListeners();
    this.setupDragAndDrop();
    // 移除自动扫描，让用户手动点击扫描按钮
    this.uiManager.loadCacheStatus();
  }
  
  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 绑定主要按钮事件
    this.bindMainButtonEvents();
    
    // 绑定排序和保存按钮事件
    this.bindSaveButtonEvents();
    
    // 绑定表单事件
    bindEvent('edit-form', 'submit', (e) => {
      e.preventDefault();
      this.saveProduct();
    });
    
    // 绑定动态生成元素的事件
    this.bindDynamicElementEvents();
  }
  
  /**
   * 绑定主要按钮事件
   */
  bindMainButtonEvents() {
    bindEvent('btn-scan', 'click', () => this.scanFiles());
    bindEvent('btn-scan-new', 'click', () => this.scanNewProducts());
    bindEvent('btn-refresh', 'click', () => this.refreshData());
    bindEvent('btn-clear-cache', 'click', () => this.clearCache());
    bindEvent('btn-regenerate-json', 'click', () => this.regenerateAllJson());
    bindEvent('btn-export', 'click', () => this.exportData());
    bindEvent('btn-import', 'click', () => this.importData());
    bindEvent('btn-set-token', 'click', () => this.setApiToken());
    bindEvent('btn-save-local', 'click', () => this.saveLocalData());
  }
  
  /**
   * 绑定保存按钮事件
   */
  bindSaveButtonEvents() {
    bindEvent('btn-save-series-order', 'click', () => this.saveSeriesOrder());
    bindEvent('btn-save-product-order', 'click', () => this.saveProductOrder());
    bindEvent('btn-save-product', 'click', () => this.saveProduct());
    bindEvent('btn-toggle-all-images', 'click', () => this.toggleAllImages());
  }
  
  /**
   * 绑定动态生成元素的事件
   */
  bindDynamicElementEvents() {
    // 绑定系列列表事件
    const seriesList = document.getElementById('series-list');
    if (seriesList) {
      seriesList.addEventListener('click', (e) => {
        this.handleSeriesListClick(e);
      });
    }
    
    // 绑定文件列表事件
    const fileList = document.getElementById('file-list');
    if (fileList) {
      fileList.addEventListener('click', (e) => {
        this.handleFileListClick(e);
      });
    }
  }
  
  /**
   * 处理系列列表点击事件
   * @param e 事件对象
   */
  handleSeriesListClick(e: Event) {
    const target = e.target as HTMLElement;
    
    // 检查是否点击了编辑按钮
    const editButton = target.closest('.btn-edit');
    if (editButton && editButton.dataset.series) {
      e.stopPropagation();
      this.editSeries(editButton.dataset.series);
      return;
    }
    
    // 检查是否点击了查看按钮
    const viewButton = target.closest('.btn-view');
    if (viewButton && viewButton.dataset.series) {
      e.stopPropagation();
      this.viewSeries(viewButton.dataset.series);
      return;
    }
    
    // 检查是否点击了系列卡片本身
    const seriesCard = target.closest('.series-card');
    if (seriesCard && seriesCard.dataset.seriesName) {
      // 确保不是点击了按钮
      if (!target.closest('button')) {
        this.showSeriesProducts(seriesCard.dataset.seriesName);
      }
    }
  }
  
  /**
   * 处理文件列表点击事件
   * @param e 事件对象
   */
  handleFileListClick(e: Event) {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('btn-edit') && target.dataset.productId) {
      this.editProduct(target.dataset.productId, target.dataset.seriesId);
    } else if (target.classList.contains('btn-view') && target.dataset.productId) {
      this.viewProduct(target.dataset.productId, target.dataset.seriesId);
    } else if (target.classList.contains('btn-toggle')) {
      const productItem = target.closest('.file-item');
      if (productItem && productItem.dataset.productName) {
        this.toggleProductImages(productItem.dataset.productName);
      }
    }
  }
  
  /**
   * 设置API令牌
   */
  setApiToken() {
    console.log('setApiToken method called');
    // 检查是否已经存在API密钥设置弹窗
    const existingDialog = document.querySelector('#api-token-dialog');
    if (existingDialog) {
      // 如果存在，先移除
      existingDialog.remove();
    }
    
    // 创建更安全的 API 密钥输入对话框
    const dialog = document.createElement('div');
    dialog.id = 'api-token-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 400px;
    `;
    
    dialogContent.innerHTML = `
      <h3>设置 GitHub API 密钥</h3>
      <p style="margin-bottom: 15px; color: #666; font-size: 14px;">请输入您的 GitHub API 密钥，用于访问和修改仓库数据</p>
      <div style="margin-bottom: 15px;">
        <label for="api-token-input" style="display: block; margin-bottom: 5px; font-weight: 500;">API 密钥</label>
        <input type="password" id="api-token-input" style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancel-token-btn" style="padding: 8px 16px; border: 1px solid #ced4da; border-radius: 4px; background-color: white; cursor: pointer;">取消</button>
        <button id="save-token-btn" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #007bff; color: white; cursor: pointer;">保存</button>
      </div>
    `;
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    console.log('API token dialog created and added to DOM');
    
    // 取消按钮事件
    const cancelBtn = dialogContent.querySelector('#cancel-token-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        console.log('Cancel button clicked');
        dialog.remove();
      });
    } else {
      console.error('Cancel button not found');
    }
    
    // 保存按钮事件
    const saveBtn = dialogContent.querySelector('#save-token-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        console.log('Save button clicked');
        const tokenInput = dialogContent.querySelector('#api-token-input') as HTMLInputElement;
        if (tokenInput) {
          const token = tokenInput.value;
          console.log('Token input value:', token ? token.substring(0, 10) + '...' : 'empty');
          if (token) {
            try {
              console.log('Saving API token:', token.substring(0, 10) + '...');
              // 直接保存 API 密钥，跳过验证
              const saveResult = GH5.config.saveApiKey(token);
              console.log('Config saveApiKey result:', saveResult);
              // 更新 GitHub API 实例的 token
              GH5.githubAPI.setToken(token);
              console.log('GitHub API token set successfully');
              this.uiManager.showStatus('API 密钥设置成功', 'success');
              dialog.remove();
            } catch (error) {
              console.error('Set API token error:', error);
              console.error('Error details:', error.message);
              console.error('Error stack:', error.stack);
              this.uiManager.showStatus('API 密钥设置失败: ' + error.message, 'error');
            }
          } else {
            console.log('Empty token input');
            this.uiManager.showStatus('请输入 API 密钥', 'error');
          }
        } else {
          console.error('Token input not found');
        }
      });
    } else {
      console.error('Save button not found');
    }
    
    // 点击背景关闭弹窗
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        console.log('Dialog background clicked');
        dialog.remove();
      }
    });
    
    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('api-token-dialog')) {
        console.log('Escape key pressed');
        dialog.remove();
      }
    });
  }
  
  /**
   * 保存产品数据
   */
  async saveProduct() {
    try {
      await this.productManager.saveProduct(this.currentEditingProduct);
      // 更新UI
      this.updateUI();
    } catch (error) {
      console.error('保存产品失败:', error);
      this.uiManager.showStatus('保存失败，请重试', 'error');
    }
  }
  
  /**
   * 保存产品顺序
   */
  async saveProductOrder() {
    await this.productManager.saveProductOrder(this.products);
  }
  
  /**
   * 保存系列顺序
   */
  async saveSeriesOrder() {
    await this.seriesManager.saveSeriesOrder();
  }
  
  /**
   * 导入数据
   */
  async importData() {
    await this.productManager.importData(() => this.updateUI());
  }
  
  /**
   * 导出数据
   */
  async exportData() {
    await this.productManager.exportData(this.products, this.series, this.seriesOrder);
  }
  
  /**
   * 重新生成所有JSON文件
   */
  async regenerateAllJson() {
    console.log('Regenerating all JSON files...');
    const regenerateBtn = document.getElementById('btn-regenerate-json');
    if (regenerateBtn) regenerateBtn.disabled = true;
    
    try {
      this.uiManager.showStatus('正在重新生成JSON文件...', 'info');
      
      // 扫描产品图目录
      const series = await GH5.githubAPI.fetchDirectory('产品图');
      const dirSeries = series.filter((item: any) => item.type === 'dir');
      
      // 加载系列名称映射（使用已扫描的系列数据，避免重复API调用）
      this.series = dirSeries;
      await this.seriesManager.loadSeriesNameMap(this.series, false);
      
      // 调用扫描模块的重新生成JSON功能
      const result = await regenerateAllJson(GH5.githubAPI, this.seriesNameMap);
      
      this.uiManager.showStatus(`成功重新生成 ${result.count} 个JSON文件`, 'success');
      // 重新扫描所有文件以更新UI
      await this.scanFiles();
    } catch (error) {
      console.error('Regenerate all JSON error:', error);
      this.uiManager.showStatus('重新生成JSON文件失败: ' + error.message, 'error');
    } finally {
      const regenerateBtn = document.getElementById('btn-regenerate-json');
      if (regenerateBtn) regenerateBtn.disabled = false;
    }
  }
  
  /**
   * 清除缓存
   */
  async clearCache() {
    console.log('Clearing cache...');
    try {
      this.uiManager.showStatus('正在清除缓存...', 'info');
      
      // 清除缓存管理器中的缓存
      GH5.cacheManager.clearAll();
      
      // 清除本地存储和会话存储
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      
      // 更新缓存状态显示
      this.uiManager.loadCacheStatus();
      
      this.uiManager.showStatus('缓存清除成功', 'success');
    } catch (error) {
      console.error('Clear cache error:', error);
      this.uiManager.showStatus('缓存清除失败: ' + error.message, 'error');
    }
  }
  
  /**
   * 刷新数据
   */
  async refreshData() {
    console.log('Refreshing data...');
    try {
      this.uiManager.showStatus('正在刷新数据...', 'info');
      
      // 清除缓存
      GH5.cacheManager.clearAll();
      
      // 重新扫描所有文件
      await this.scanFiles();
      
      this.uiManager.showStatus('数据刷新成功', 'success');
    } catch (error) {
      console.error('Refresh data error:', error);
      this.uiManager.showStatus('数据刷新失败: ' + error.message, 'error');
    }
  }
  
  /**
   * 扫描新增产品
   */
  async scanNewProducts() {
    console.log('Scanning for new products...');
    const scanNewBtn = document.getElementById('btn-scan-new');
    if (scanNewBtn) scanNewBtn.disabled = true;
    
    try {
      this.uiManager.showStatus('正在扫描新增产品...', 'info');
      
      // 调用扫描模块的扫描新增产品功能
      const result = await scanNewProducts(GH5.githubAPI, this.seriesNameMap);
      
      if (result.count > 0) {
        this.uiManager.showStatus(`成功扫描到 ${result.count} 个新增产品`, 'success');
        // 重新扫描所有文件以更新UI
        await this.scanFiles();
      } else {
        this.uiManager.showStatus('没有发现新增产品', 'info');
      }
    } catch (error) {
      console.error('Scan new products error:', error);
      this.uiManager.showStatus('扫描新增产品失败: ' + error.message, 'error');
    } finally {
      const scanNewBtn = document.getElementById('btn-scan-new');
      if (scanNewBtn) scanNewBtn.disabled = false;
    }
  }
  
  /**
   * 扫描文件
   */
  async scanFiles() {
    const scanBtn = document.getElementById('btn-scan');
    const scanNewBtn = document.getElementById('btn-scan-new');
    
    this.disableScanButtons(scanBtn, scanNewBtn);
    
    try {
      this.uiManager.updateLastScanTime();
      this.uiManager.showStatus('正在扫描...', 'info');
      
      // 清除缓存以确保获取最新数据
      GH5.cacheManager.clearAll();
      
      // 扫描产品图目录
      this.series = await scanSeriesDirectories(GH5.githubAPI);
      
      // 加载系列名称映射（使用已扫描的系列数据，避免重复API调用）
      await this.seriesManager.loadSeriesNameMap(this.series, false);
      
      // 扫描每个系列的产品数据
      this.products = await scanProductsForAllSeries(this.series, GH5.githubAPI);
      
      this.updateUI();
      this.uiManager.showStatus('扫描完成', 'success');
    } catch (error) {
      await this.handleScanError(error);
    } finally {
      this.enableScanButtons(scanBtn, scanNewBtn);
    }
  }
  
  /**
   * 禁用扫描按钮
   * @param scanBtn 扫描按钮
   * @param scanNewBtn 扫描新增按钮
   */
  disableScanButtons(scanBtn: HTMLElement | null, scanNewBtn: HTMLElement | null) {
    if (scanBtn) scanBtn.disabled = true;
    if (scanNewBtn) scanNewBtn.disabled = true;
  }
  
  /**
   * 启用扫描按钮
   * @param scanBtn 扫描按钮
   * @param scanNewBtn 扫描新增按钮
   */
  enableScanButtons(scanBtn: HTMLElement | null, scanNewBtn: HTMLElement | null) {
    if (scanBtn) scanBtn.disabled = false;
    if (scanNewBtn) scanNewBtn.disabled = false;
  }
  
  /**
   * 处理扫描错误
   * @param error 错误对象
   */
  async handleScanError(error: any) {
    console.error('Scan files error:', error);
    let errorMessage = '扫描失败: ' + error.message;
    if (error.status === 401 || error.status === 403) {
      // 对于公开仓库，尝试不使用 API 密钥重新加载
      try {
        console.log('尝试不使用 API 密钥重新加载数据...');
        // 清除 API 密钥
        GH5.config.saveApiKey('');
        GH5.githubAPI.setToken('');
        // 重新扫描
        await this.scanFiles();
        return;
      } catch (retryError) {
        errorMessage = 'API 密钥无效或已过期，但仓库是公开的，尝试无密钥访问失败';
      }
    } else if (error.status === 429 || (error.message && (error.message.includes('rate limit') || error.message.includes('API')))) {
      errorMessage = 'API 请求频率超限，请稍后再试';
    } else if (error.status === 404) {
      errorMessage = '文件路径不存在';
    } else if (error.status === 422) {
      errorMessage = '数据格式错误，请检查输入';
    }
    this.uiManager.showStatus(errorMessage, 'error');
  }
  
  /**
   * 保存本地数据
   */
  async saveLocalData() {
    await this.productManager.saveLocalData(this.products);
  }
  
  /**
   * 显示系列产品
   * @param seriesName 系列名称
   */
  showSeriesProducts(seriesName: string) {
    this.currentSeries = seriesName;
    this.updateUI();
  }
  
  /**
   * 编辑产品
   * @param productId 产品ID
   * @param seriesId 系列ID
   */
  editProduct(productId: string, seriesId: string) {
    const product = this.products.find(p => p.id === productId && p.seriesId === seriesId);
    if (product) {
      this.currentEditingProduct = product;
      this.productManager.editProduct(productId, seriesId, this.products);
    }
  }
  
  /**
   * 查看产品
   * @param productId 产品ID
   * @param seriesId 系列ID
   */
  viewProduct(productId: string, seriesId: string) {
    this.productManager.viewProduct(productId, seriesId, this.products);
  }
  
  /**
   * 编辑系列
   * @param seriesName 系列名称
   */
  editSeries(seriesName: string) {
    this.seriesManager.editSeries(seriesName);
  }
  
  /**
   * 查看系列
   * @param seriesName 系列名称
   */
  viewSeries(seriesName: string) {
    this.seriesManager.viewSeries(seriesName);
  }
  
  /**
   * 切换产品图片
   * @param productName 产品名称
   */
  toggleProductImages(productName: string) {
    this.uiManager.toggleProductImages(productName);
  }
  
  /**
   * 切换所有图片
   */
  toggleAllImages() {
    this.uiManager.toggleAllImages();
  }
  
  /**
   * 更新UI
   */
  updateUI() {
    this.uiManager.updateUI(this.series, this.products, this.currentSeries);
  }
  
  /**
   * 设置拖拽排序功能
   */
  setupDragAndDrop() {
    this.setupSeriesDragAndDrop();
    this.setupProductDragAndDrop();
  }
  
  /**
   * 设置系列拖拽排序
   */
  setupSeriesDragAndDrop() {
    const seriesList = document.getElementById('series-list');
    if (!seriesList) return;
    
    let draggedItem: HTMLElement | null = null;
    
    seriesList.addEventListener('dragstart', (e) => {
      if ((e.target as HTMLElement).classList.contains('series-card')) {
        draggedItem = e.target as HTMLElement;
        setTimeout(() => {
          draggedItem!.style.opacity = '0.5';
        }, 0);
      }
    });
    
    seriesList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(seriesList, e.clientY);
      if (afterElement == null) {
        seriesList.appendChild(draggedItem!);
      } else {
        seriesList.insertBefore(draggedItem!, afterElement);
      }
    });
    
    seriesList.addEventListener('dragend', (e) => {
      (e.target as HTMLElement).style.opacity = '1';
      draggedItem = null;
    });
  }
  
  /**
   * 设置产品拖拽排序
   */
  setupProductDragAndDrop() {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    let draggedItem: HTMLElement | null = null;
    
    fileList.addEventListener('dragstart', (e) => {
      if ((e.target as HTMLElement).classList.contains('file-item')) {
        draggedItem = e.target as HTMLElement;
        setTimeout(() => {
          draggedItem!.style.opacity = '0.5';
        }, 0);
      }
    });
    
    fileList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(fileList, e.clientY);
      if (afterElement == null) {
        fileList.appendChild(draggedItem!);
      } else {
        fileList.insertBefore(draggedItem!, afterElement);
      }
    });
    
    fileList.addEventListener('dragend', (e) => {
      (e.target as HTMLElement).style.opacity = '1';
      draggedItem = null;
    });
  }
}

// 初始化 AdminPanel
declare const GH5: any;
const adminPanel = new AdminPanel();