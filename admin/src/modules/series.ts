import { Series } from '../types';

/**
 * 系列管理模块 - 负责处理系列相关的操作
 */
export class SeriesManager {
  private seriesNameMap: { [key: string]: string };
  private seriesOrder: string[];
  private githubAPI: any;
  private uiManager: any;
  
  /**
   * 构造函数
   * @param seriesNameMap 系列名称映射
   * @param seriesOrder 系列顺序
   * @param githubAPI GitHub API 实例
   * @param uiManager UI管理器实例
   */
  constructor(
    seriesNameMap: { [key: string]: string },
    seriesOrder: string[],
    githubAPI: any,
    uiManager: any
  ) {
    this.seriesNameMap = seriesNameMap;
    this.seriesOrder = seriesOrder;
    this.githubAPI = githubAPI;
    this.uiManager = uiManager;
  }
  
  /**
   * 保存系列顺序
   * @returns Promise<void>
   */
  async saveSeriesOrder(): Promise<void> {
    console.log('Saving series order...');
    const saveBtn = document.getElementById('btn-save-series-order');
    if (saveBtn) saveBtn.disabled = true;
    
    try {
      this.uiManager.showStatus('正在保存系列顺序...', 'info');
      
      // 获取当前系列顺序
      const seriesList = document.getElementById('series-list');
      const seriesCards = seriesList.querySelectorAll('.series-card');
      const seriesOrder = Array.from(seriesCards).map(card => card.dataset.seriesName);
      
      // 保存到配置文件
      try {
        await this.saveSeriesOrderToGitHub(seriesOrder);
        this.uiManager.showStatus('系列顺序保存成功', 'success');
      } catch (error) {
        console.error('Save series order to GitHub error:', error);
        // 即使保存到GitHub失败，也要更新本地状态
        this.seriesOrder = seriesOrder;
        this.uiManager.showStatus('系列顺序已更新（本地），但保存到GitHub失败: ' + error.message, 'warning');
      }
    } catch (error) {
      console.error('Save series order error:', error);
      this.uiManager.showStatus('保存系列顺序失败: ' + error.message, 'error');
    } finally {
      const saveBtn = document.getElementById('btn-save-series-order');
      if (saveBtn) saveBtn.disabled = false;
    }
  }
  
  /**
   * 保存系列顺序到GitHub
   * @param seriesOrder 系列顺序
   * @returns Promise<void>
   */
  private async saveSeriesOrderToGitHub(seriesOrder: string[]): Promise<void> {
    // 尝试获取现有配置
    let config = {};
    try {
      config = await this.githubAPI.fetchFile('config.json');
    } catch (error) {
      // 配置文件不存在，创建新的
      config = {};
    }
    
    // 更新系列顺序
    config.seriesOrder = seriesOrder;
    
    // 保存到GitHub
    const configJsonContent = JSON.stringify(config, null, 2);
    await this.githubAPI.commitFile(
      'config.json',
      configJsonContent,
      'Update series order'
    );
    
    // 更新本地数据
    this.seriesOrder = seriesOrder;
  }
  
  /**
   * 编辑系列名称
   * @param seriesName 系列名称
   */
  editSeries(seriesName: string): void {
    const currentDisplayName = this.seriesNameMap[seriesName] || seriesName;
    
    // 创建编辑系列名称的弹窗
    const dialog = this.createSeriesEditDialog(seriesName, currentDisplayName);
    document.body.appendChild(dialog);
    
    // 绑定事件
    this.bindSeriesEditEvents(dialog, seriesName);
  }
  
  /**
   * 创建系列编辑弹窗
   * @param seriesName 系列名称
   * @param currentDisplayName 当前显示名称
   * @returns 弹窗元素
   */
  private createSeriesEditDialog(seriesName: string, currentDisplayName: string): HTMLDivElement {
    const dialog = document.createElement('div');
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
      <h3>编辑系列名称</h3>
      <p style="margin-bottom: 15px; color: #666; font-size: 14px;">系列文件夹: ${seriesName}</p>
      <div style="margin-bottom: 15px;">
        <label for="series-display-name" style="display: block; margin-bottom: 5px; font-weight: 500;">显示名称</label>
        <input type="text" id="series-display-name" value="${currentDisplayName}" style="width: 100%; padding: 8px; border: 1px solid #ced4da; border-radius: 4px; font-size: 14px;">
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="cancel-series-edit" style="padding: 8px 16px; border: 1px solid #ced4da; border-radius: 4px; background-color: white; cursor: pointer;">取消</button>
        <button id="save-series-edit" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #007bff; color: white; cursor: pointer;">保存</button>
      </div>
    `;
    
    dialog.appendChild(dialogContent);
    return dialog;
  }
  
  /**
   * 绑定系列编辑事件
   * @param dialog 弹窗元素
   * @param seriesName 系列名称
   */
  private bindSeriesEditEvents(dialog: HTMLDivElement, seriesName: string): void {
    // 取消按钮事件
    const cancelBtn = dialog.querySelector('#cancel-series-edit');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        dialog.remove();
      });
    }
    
    // 保存按钮事件
    const saveBtn = dialog.querySelector('#save-series-edit');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const displayNameInput = dialog.querySelector('#series-display-name') as HTMLInputElement;
        if (displayNameInput) {
          const newDisplayName = displayNameInput.value.trim();
          if (newDisplayName) {
            try {
              await this.updateSeriesDisplayName(seriesName, newDisplayName);
              this.uiManager.showStatus('系列名称更新成功', 'success');
              dialog.remove();
            } catch (error) {
              console.error('Edit series error:', error);
              this.uiManager.showStatus('更新系列名称失败: ' + error.message, 'error');
            }
          } else {
            this.uiManager.showStatus('请输入系列名称', 'error');
          }
        }
      });
    }
    
    // 点击背景关闭弹窗
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });
    
    // 按ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.contains(dialog)) {
        dialog.remove();
      }
    });
  }
  
  /**
   * 更新系列显示名称
   * @param seriesName 系列名称
   * @param newDisplayName 新的显示名称
   * @returns Promise<void>
   */
  private async updateSeriesDisplayName(seriesName: string, newDisplayName: string): Promise<void> {
    // 更新本地系列名称映射
    this.seriesNameMap[seriesName] = newDisplayName;
    
    // 尝试更新系列的products.json文件
    try {
      const productsFile = await this.githubAPI.fetchFile(`${seriesName}/products.json`);
      if (productsFile) {
        productsFile.displayName = {
          zh: newDisplayName
        };
        
        const productsJsonContent = JSON.stringify(productsFile, null, 2);
        await this.githubAPI.commitFile(
          `${seriesName}/products.json`,
          productsJsonContent,
          `Update series display name to ${newDisplayName}`
        );
      }
    } catch (error) {
      console.warn('Failed to update products.json:', error);
    }
  }
  
  /**
   * 查看系列
   * @param seriesName 系列名称
   */
  viewSeries(seriesName: string): void {
    const displayName = this.seriesNameMap[seriesName] || seriesName;
    alert(`系列详情：\n\n名称: ${displayName}\n文件夹: ${seriesName}`);
  }
  
  /**
   * 加载系列名称映射
   * @param series 系列列表
   * @param fetchSeries 是否重新获取系列
   * @returns Promise<void>
   */
  async loadSeriesNameMap(series: Series[], fetchSeries: boolean = true): Promise<void> {
    try {
      let dirSeries = [];
      
      // 从各系列的 products.json 文件中加载系列名称映射
      if (fetchSeries) {
        const fetchedSeries = await this.githubAPI.fetchDirectory('产品图');
        dirSeries = fetchedSeries.filter((item: any) => item.type === 'dir');
      } else {
        // 使用已扫描的系列数据，避免重复API调用
        dirSeries = series;
      }
      
      const seriesNameMap: { [key: string]: string } = {};
      
      for (const seriesItem of dirSeries) {
        try {
          const productsFile = await this.githubAPI.fetchFile(`${seriesItem.path}/products.json`);
          if (productsFile && productsFile.displayName) {
            seriesNameMap[seriesItem.name] = productsFile.displayName.zh || seriesItem.name;
          } else {
            seriesNameMap[seriesItem.name] = seriesItem.name;
          }
        } catch (error) {
          console.warn(`Failed to load products.json for ${seriesItem.name}:`, error);
          seriesNameMap[seriesItem.name] = seriesItem.name;
        }
      }
      
      this.seriesNameMap = seriesNameMap;
      console.log('Loaded seriesNameMap from products.json files:', this.seriesNameMap);
      
      // 尝试从配置文件加载系列顺序
      try {
        const configFile = await this.githubAPI.fetchFile('config.json');
        if (configFile && configFile.seriesOrder) {
          this.seriesOrder = configFile.seriesOrder;
          console.log('Loaded seriesOrder from config.json:', this.seriesOrder);
        } else {
          // 如果配置文件不存在或获取失败，使用默认顺序
          this.seriesOrder = Object.keys(seriesNameMap);
        }
      } catch (error) {
        console.error('Error fetching config.json for seriesOrder:', error);
        // 如果配置文件不存在或获取失败，使用默认顺序
        this.seriesOrder = Object.keys(seriesNameMap);
      }
    } catch (error) {
      console.error('Load series name map error:', error);
      // 保持现有的seriesNameMap不变
      console.log('Using existing seriesNameMap after error:', this.seriesNameMap);
    }
  }
  
  /**
   * 获取系列名称映射
   * @returns 系列名称映射
   */
  getSeriesNameMap(): { [key: string]: string } {
    return this.seriesNameMap;
  }
  
  /**
   * 获取系列顺序
   * @returns 系列顺序
   */
  getSeriesOrder(): string[] {
    return this.seriesOrder;
  }
}