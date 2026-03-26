class FrontendSearch {
  constructor(frontend) {
    this.frontend = frontend;
  }
  
  // 搜索产品
  searchProducts(query) {
    if (!query || typeof query !== 'string') {
      this.resetSearch();
      return;
    }
    
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      this.resetSearch();
      return;
    }

    const searchTerm = trimmedQuery.toLowerCase();
    const filteredProducts = this.frontend.state.allProducts.filter(product => {
      // 添加空值检查
      if (!product) return false;
      
      const name = product.name;
      if (name) {
        if (typeof name === 'string') {
          if (name.toLowerCase().includes(searchTerm)) return true;
        } else if (typeof name === 'object' && name !== null) {
          const nameValues = Object.values(name).filter(v => typeof v === 'string');
          if (nameValues.some(v => v.toLowerCase().includes(searchTerm))) return true;
        }
      }
      
      // 添加标签搜索的空值检查
      if (product.tags && Array.isArray(product.tags)) {
        if (product.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchTerm))) return true;
      } else if (product.tags && typeof product.tags === 'string') {
        if (product.tags.toLowerCase().includes(searchTerm)) return true;
      }
      
      // 添加材质搜索的空值检查
      if (product.upperMaterial && typeof product.upperMaterial === 'string') {
        if (product.upperMaterial.toLowerCase().includes(searchTerm)) return true;
      }
      if (product.innerMaterial && typeof product.innerMaterial === 'string') {
        if (product.innerMaterial.toLowerCase().includes(searchTerm)) return true;
      }
      if (product.soleMaterial && typeof product.soleMaterial === 'string') {
        if (product.soleMaterial.toLowerCase().includes(searchTerm)) return true;
      }
      
      return false;
    });

    this.frontend.state.products = filteredProducts;
    this.frontend.renderProducts();
  }

  // 重置搜索
  resetSearch() {
    this.frontend.state.products = this.frontend.state.allProducts;
    this.frontend.renderProducts();
    this.frontend._updateClearButtonVisibility('');
  }
}

// 导出类
window.FrontendSearch = FrontendSearch;