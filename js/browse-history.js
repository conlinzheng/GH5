class BrowseHistory {
  constructor() {
    this.history = [];
    this.maxItems = 10;
    this.storageKey = 'gh5_browse_history';
    this.init();
  }
  
  init() {
    this.loadFromStorage();
    this.setupEventListeners();
    this.renderHistoryWidget();
  }
  
  setupEventListeners() {
    // 监听产品详情查看事件
    document.addEventListener('productViewed', (event) => {
      const product = event.detail.product;
      if (product) {
        this.add(product);
      }
    });
    
    // 监听浏览历史按钮点击
    const historyToggle = document.getElementById('history-toggle');
    if (historyToggle) {
      historyToggle.addEventListener('click', () => {
        this.openSidebar();
      });
    }
    
    // 监听关闭按钮点击
    const historyCloseBtn = document.getElementById('history-close-btn');
    if (historyCloseBtn) {
      historyCloseBtn.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
    
    // 监听遮罩层点击
    const historyOverlay = document.getElementById('history-overlay');
    if (historyOverlay) {
      historyOverlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }
    
    // 监听ESC键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
      }
    });
  }
  
  openSidebar() {
    const sidebar = document.getElementById('history-sidebar');
    const overlay = document.getElementById('history-overlay');
    if (sidebar) {
      sidebar.classList.add('active');
    }
    if (overlay) {
      overlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }
  
  closeSidebar() {
    const sidebar = document.getElementById('history-sidebar');
    const overlay = document.getElementById('history-overlay');
    if (sidebar) {
      sidebar.classList.remove('active');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
  }
  
  add(product) {
    if (!product || !product.id) return;
    
    // 移除已存在的相同产品
    this.history = this.history.filter(item => item.id !== product.id);
    
    // 添加到历史记录开头
    this.history.unshift({
      id: product.id,
      seriesId: product.seriesId,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : '',
      viewedAt: new Date().toISOString()
    });
    
    // 限制历史记录数量
    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems);
    }
    
    // 保存到本地存储
    this.saveToStorage();
    
    // 更新历史记录显示
    this.renderHistoryWidget();
  }
  
  getHistory() {
    return this.history;
  }
  
  clear() {
    this.history = [];
    this.saveToStorage();
    this.renderHistoryWidget();
  }
  
  remove(itemId) {
    this.history = this.history.filter(item => item.id !== itemId);
    this.saveToStorage();
    this.renderHistoryWidget();
  }
  
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save browse history to localStorage:', error);
    }
  }
  
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load browse history from localStorage:', error);
      this.history = [];
    }
  }
  
  renderHistoryWidget() {
    const widgetContainer = document.getElementById('history-widget');
    if (!widgetContainer) return;
    
    if (this.history.length === 0) {
      widgetContainer.innerHTML = `
        <div class="history-empty">
          <p>暂无浏览历史</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="history-header">
        <h3>浏览历史</h3>
        <button class="clear-history-btn" onclick="browseHistory.clear()">
          清除历史
        </button>
      </div>
      <div class="history-list">
    `;
    
    this.history.forEach((item, index) => {
      html += `
        <div class="history-item" data-product-id="${item.id}">
          <div class="history-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="history-item-info">
            <h4>${item.name}</h4>
            <p class="history-item-price">${item.price || ''}</p>
            <p class="history-item-time">${this.formatTime(item.viewedAt)}</p>
          </div>
          <button class="remove-history-item" onclick="browseHistory.remove('${item.id}')">
            ×
          </button>
        </div>
      `;
    });
    
    html += `
      </div>
    `;
    
    widgetContainer.innerHTML = html;
    
    // 添加点击事件
    this.bindHistoryItemEvents();
  }
  
  bindHistoryItemEvents() {
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.remove-history-item')) {
          const productId = item.dataset.productId;
          this.viewHistoryItem(productId);
        }
      });
    });
  }
  
  viewHistoryItem(productId) {
    // 查找产品并触发查看事件
    const event = new CustomEvent('viewHistoryItem', {
      detail: { productId }
    });
    document.dispatchEvent(event);
  }
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString();
  }
}

// 初始化浏览历史
const browseHistory = new BrowseHistory();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = browseHistory;
}