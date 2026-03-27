class ProductEvents {
  constructor() {
    this.frontend = null;
  }

  setupProductEventListeners() {
    // 获取frontend实例
    this.frontend = window.frontend || window.GH5?.coreApp;
    if (!this.frontend) return;
    
    // 系列筛选
    this._setupSeriesFilterListeners();
    
    // 分页
    this._setupPaginationListeners();
    
    // 刷新数据按钮
    this._setupRefreshButtonListener();
  }

  _setupSeriesFilterListeners() {
    document.querySelectorAll('.series-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const seriesId = e.target.dataset.series;
        this.frontend.filterBySeries(seriesId);
      });
    });
  }

  _setupPaginationListeners() {
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(e.target.dataset.page);
        this.frontend.goToPage(page);
      });
    });
  }

  _setupRefreshButtonListener() {
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.frontend.refreshData();
      });
    }
  }

  handleProductClick(productId) {
    // 处理产品点击事件
    // 这里可以实现产品点击的逻辑
  }

  handleSeriesFilter(seriesId) {
    // 处理系列筛选事件
    // 这里可以实现系列筛选的逻辑
  }
}

const productEvents = new ProductEvents();
export default productEvents;