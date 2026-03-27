class SearchEvents {
  constructor() {
    this.frontend = null;
  }

  setupSearchEventListeners() {
    // 获取frontend实例
    this.frontend = window.frontend || window.GH5?.coreApp;
    if (!this.frontend) return;
    
    // 搜索按钮
    this._setupSearchButtonListener();
    
    // 清除按钮
    this._setupClearButtonListener();
    
    // 搜索输入事件
    this._setupSearchInputListener();
    
    // 回车键搜索
    this._setupEnterKeyListener();
  }

  _setupSearchButtonListener() {
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          this.frontend.searchProducts(searchInput.value);
        }
      });
    }
  }

  _setupClearButtonListener() {
    const clearBtn = document.getElementById('search-clear');
    const searchInputEl = document.getElementById('search-input');
    
    if (clearBtn && searchInputEl) {
      clearBtn.addEventListener('click', () => {
        searchInputEl.value = '';
        this.frontend.resetSearch();
        this.frontend._updateClearButtonVisibility('');
        searchInputEl.focus();
      });
    }
  }

  _setupSearchInputListener() {
    const searchInputEl = document.getElementById('search-input');
    if (searchInputEl) {
      searchInputEl.addEventListener('input', (e) => {
        this.frontend._updateClearButtonVisibility(e.target.value);
      });
    }
  }

  _setupEnterKeyListener() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'search-input') {
        this.frontend.searchProducts(e.target.value);
      }
    });
  }

  handleSearchSubmit(query) {
    // 处理搜索提交事件
    this.frontend.searchProducts(query);
  }

  handleSearchClear() {
    // 处理搜索清除事件
    const searchInputEl = document.getElementById('search-input');
    if (searchInputEl) {
      searchInputEl.value = '';
      this.frontend.resetSearch();
      this.frontend._updateClearButtonVisibility('');
      searchInputEl.focus();
    }
  }
}

const searchEvents = new SearchEvents();
export default searchEvents;