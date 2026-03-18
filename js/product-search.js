class ProductSearch {
    constructor() {
        this.searchInput = null;
        this.filterContainer = null;
        this.originalProducts = null;
        this.currentFilters = {
            search: '',
            series: '',
            priceMin: '',
            priceMax: ''
        };
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        const container = document.getElementById('product-search');
        if (!container) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const labels = {
            'zh': { placeholder: '搜索产品名称...', series: '全部系列', priceMin: '最低价', priceMax: '最高价' },
            'en': { placeholder: 'Search products...', series: 'All Series', priceMin: 'Min Price', priceMax: 'Max Price' },
            'ko': { placeholder: '제품 검색...', series: '전체 시리즈', priceMin: '최저가', priceMax: '최고가' }
        };

        const t = labels[currentLang] || labels['zh'];
        const seriesOptions = this.getSeriesOptions();

        container.innerHTML = `
            <div class="search-bar">
                <div class="search-input-wrapper">
                    <input type="text" id="search-input" placeholder="${t.placeholder}" class="search-input">
                    <button id="clear-search" class="clear-btn">&times;</button>
                </div>
                <select id="series-filter" class="series-filter">
                    <option value="">${t.series}</option>
                    ${seriesOptions}
                </select>
                <div class="price-filter">
                    <input type="number" id="price-min" placeholder="${t.priceMin}" class="price-input">
                    <span>-</span>
                    <input type="number" id="price-max" placeholder="${t.priceMax}" class="price-input">
                </div>
            </div>
            <div class="search-results-info">
                <span id="results-count"></span>
            </div>
        `;
    }

    getSeriesOptions() {
        if (!frontend?.productsData) return '';
        
        return Object.entries(frontend.productsData)
            .sort((a, b) => {
                const numA = parseInt(a[0].split('-')[0]) || 0;
                const numB = parseInt(b[0].split('-')[0]) || 0;
                return numA - numB;
            })
            .map(([seriesId, data]) => {
                const name = data.seriesName?.[i18n?.currentLanguage || 'zh'] || seriesId.split('-')[1] || seriesId;
                return `<option value="${seriesId}">${name}</option>`;
            })
            .join('');
    }

    bindEvents() {
        const searchInput = document.getElementById('search-input');
        const clearBtn = document.getElementById('clear-search');
        const seriesFilter = document.getElementById('series-filter');
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.currentFilters.search = '';
                this.applyFilters();
            });
        }

        if (seriesFilter) {
            seriesFilter.addEventListener('change', (e) => {
                this.currentFilters.series = e.target.value;
                this.applyFilters();
            });
        }

        if (priceMin) {
            priceMin.addEventListener('input', (e) => {
                this.currentFilters.priceMin = e.target.value;
                this.applyFilters();
            });
        }

        if (priceMax) {
            priceMax.addEventListener('input', (e) => {
                this.currentFilters.priceMax = e.target.value;
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        if (!frontend?.productsData) return;

        const filteredData = {};
        let totalProducts = 0;

        Object.entries(frontend.productsData).forEach(([seriesId, seriesData]) => {
            if (this.currentFilters.series && seriesId !== this.currentFilters.series) {
                return;
            }

            const filteredProducts = {};
            Object.entries(seriesData.products || {}).forEach(([productId, product]) => {
                if (this.filterProduct(product)) {
                    filteredProducts[productId] = product;
                    totalProducts++;
                }
            });

            if (Object.keys(filteredProducts).length > 0) {
                filteredData[seriesId] = { ...seriesData, products: filteredProducts };
            }
        });

        this.renderFilteredProducts(filteredData);
        this.updateResultsCount(totalProducts);
    }

    filterProduct(product) {
        const currentLang = i18n?.currentLanguage || 'zh';
        
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search;
            const name = product.name?.[currentLang] || product.name?.zh || '';
            const description = product.description?.[currentLang] || product.description?.zh || '';
            
            if (!name.toLowerCase().includes(searchTerm) && 
                !description.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }

        if (this.currentFilters.priceMin || this.currentFilters.priceMax) {
            const price = parseFloat(product.price) || 0;
            const min = parseFloat(this.currentFilters.priceMin) || 0;
            const max = parseFloat(this.currentFilters.priceMax) || Infinity;
            
            if (price < min || price > max) {
                return false;
            }
        }

        return true;
    }

    renderFilteredProducts(filteredData) {
        const container = document.getElementById('product-series');
        if (!container) return;

        if (Object.keys(filteredData).length === 0) {
            container.innerHTML = '<div class="no-results">没有找到匹配的产品</div>';
            return;
        }

        container.innerHTML = '';

        const sortedSeries = Object.keys(filteredData).sort((a, b) => {
            const numA = parseInt(a.split('-')[0]) || 0;
            const numB = parseInt(b.split('-')[0]) || 0;
            return numA - numB;
        });

        sortedSeries.forEach(seriesId => {
            const seriesData = filteredData[seriesId];
            const seriesElement = this.createSeriesElement(seriesId, seriesData);
            container.appendChild(seriesElement);
        });

        if (typeof lazyLoad !== 'undefined') {
            lazyLoad.init();
        }
    }

    createSeriesElement(seriesId, seriesData) {
        const seriesDiv = document.createElement('div');
        seriesDiv.className = 'product-series';

        const seriesTitle = document.createElement('h3');
        seriesTitle.textContent = i18n.getLocalizedField(seriesData, 'seriesName');
        seriesDiv.appendChild(seriesTitle);

        const productsWrapper = document.createElement('div');
        productsWrapper.className = 'products-wrapper';

        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-container';

        const products = seriesData.products || {};
        Object.keys(products).forEach(productId => {
            const productData = products[productId];
            const productCard = this.createProductCard(seriesId, productId, productData);
            productsContainer.appendChild(productCard);
        });

        productsWrapper.appendChild(productsContainer);

        const prevBtn = document.createElement('button');
        prevBtn.className = 'series-nav prev';
        prevBtn.textContent = '‹';
        prevBtn.addEventListener('click', () => {
            productsContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'series-nav next';
        nextBtn.textContent = '›';
        nextBtn.addEventListener('click', () => {
            productsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });

        productsWrapper.appendChild(prevBtn);
        productsWrapper.appendChild(nextBtn);
        seriesDiv.appendChild(productsWrapper);

        return seriesDiv;
    }

    createProductCard(seriesId, productId, productData) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.seriesId = seriesId;
        card.dataset.productId = productId;

        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        const img = document.createElement('img');
        const mainImageFile = productData.images?.find(img => img.isMain) || productData.images?.[0];
        const imageUrl = mainImageFile ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(mainImageFile.filename)}` : '';
        img.src = imageUrl;
        img.alt = i18n.getLocalizedField(productData, 'name');
        img.dataset.src = imageUrl;
        imageDiv.appendChild(img);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        const name = document.createElement('h4');
        name.textContent = i18n.getLocalizedField(productData, 'name');
        infoDiv.appendChild(name);

        const description = document.createElement('p');
        description.textContent = i18n.getLocalizedField(productData, 'description');
        infoDiv.appendChild(description);

        if (productData.price) {
            const price = document.createElement('div');
            price.className = 'product-price';
            price.textContent = `价格: ${productData.price}`;
            infoDiv.appendChild(price);
        }

        card.appendChild(imageDiv);
        card.appendChild(infoDiv);

        card.addEventListener('click', () => {
            if (productModal) {
                const allProducts = frontend.productsData[seriesId]?.products || {};
                productModal.open(seriesId, productId, { id: productId, ...productData }, allProducts);
            }
        });

        return card;
    }

    updateResultsCount(count) {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            const currentLang = i18n?.currentLanguage || 'zh';
            const labels = {
                'zh': `找到 ${count} 个产品`,
                'en': `Found ${count} products`,
                'ko': `${count}개 제품 찾음`
            };
            countElement.textContent = labels[currentLang] || labels['zh'];
        }
    }

    reset() {
        this.currentFilters = { search: '', series: '', priceMin: '', priceMax: '' };
        this.render();
        this.bindEvents();
        if (frontend?.productsData) {
            frontend.renderProducts();
        }
    }

    updateLanguage() {
        this.render();
        this.bindEvents();
    }
}

const productSearch = new ProductSearch();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productSearch;
} else {
    window.productSearch = productSearch;
}
