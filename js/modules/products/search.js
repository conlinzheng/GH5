class ProductSearch {
  constructor() {
    this.searchResults = [];
  }

  searchProducts(query, products, getProductTranslation) {
    if (!query || query.trim() === '') {
      return products;
    }

    const lowerQuery = query.toLowerCase().trim();
    const results = products.filter(product => {
      // 搜索产品名称
      const productName = getProductTranslation(product.name, 'name').toLowerCase();
      if (productName.includes(lowerQuery)) {
        return true;
      }

      // 搜索产品描述
      if (product.description) {
        const productDesc = getProductTranslation(product.description, 'desc').toLowerCase();
        if (productDesc.includes(lowerQuery)) {
          return true;
        }
      }

      // 搜索产品标签
      if (product.tags) {
        const tags = product.tags.map(tag => getProductTranslation(tag, 'tag').toLowerCase());
        if (tags.some(tag => tag.includes(lowerQuery))) {
          return true;
        }
      }

      // 搜索产品规格
      if (product.specs) {
        const specs = product.specs.toLowerCase();
        if (specs.includes(lowerQuery)) {
          return true;
        }
      }

      return false;
    });

    this.searchResults = results;
    return results;
  }

  filterProducts(products, filters) {
    if (!filters || Object.keys(filters).length === 0) {
      return products;
    }

    return products.filter(product => {
      // 按系列筛选
      if (filters.seriesId && product.seriesId !== filters.seriesId) {
        return false;
      }

      // 按标签筛选
      if (filters.tags && filters.tags.length > 0) {
        const productTags = product.tags || [];
        if (!filters.tags.some(tag => productTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }

  sortProducts(products, sortBy) {
    if (!sortBy) {
      return products;
    }

    const sorted = [...products];

    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        sorted.sort((a, b) => {
          const priceA = parseFloat(a.price) || 0;
          const priceB = parseFloat(b.price) || 0;
          return priceA - priceB;
        });
        break;
      default:
        break;
    }

    return sorted;
  }

  getSearchResults() {
    return this.searchResults;
  }
}

const productSearch = new ProductSearch();
export default productSearch;