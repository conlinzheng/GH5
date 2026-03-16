class ProductSearch {
    constructor() {
        this.searchResults = {};
        this.allProducts = {};
    }

    init() {
        this.loadAllProducts();
        this.createSearchUI();
        this.bindEvents();
    }

    loadAllProducts() {
        const productsData = window.frontend?.productsData || {};
        this.allProducts = {};

        for (const [seriesId, seriesData] of Object.entries(productsData)) {
            for (const [productId, productData] of Object.entries(seriesData.products || {})) {
                this.allProducts[productId] = { ...productData, seriesId, id: productId };
            }
        }
    }

    createSearchUI() {
        const container = document.getElementById('product-search');
        if (!container) return;

        container.innerHTML = `
            <div class="search-box">
                <input type="text" class="search-input" placeholder="${i18n?.t('search') || '搜索产品...'}">
                <button class="search-btn">🔍</button>
            </div>
            <div class="search-results"></div>
        `;
    }

    bindEvents() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value;
                this.handleSearch(query);
            });
        }
    }

    handleSearch(query) {
        if (!query || query.length < 1) {
            this.clearResults();
            return;
        }

        const currentLang = i18n?.currentLanguage || 'zh';
        const lowerQuery = query.toLowerCase();

        this.searchResults = {};

        for (const [productId, productData] of Object.entries(this.allProducts)) {
            const name = productData.name?.[currentLang] || productData.name?.zh || '';
            const description = productData.description?.[currentLang] || productData.description?.zh || '';

            if (name.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery)) {
                this.searchResults[productId] = productData;
            }
        }

        this.renderResults();
    }

    renderResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        const results = Object.entries(this.searchResults);

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">未找到相关产品</div>';
            return;
        }

        resultsContainer.innerHTML = '<div class="results-grid">' +
            results.map(([productId, productData]) => {
                const seriesId = productData.seriesId;
                return this.createResultCard(seriesId, productId, productData);
            }).join('') +
            '</div>';

        resultsContainer.querySelectorAll('.result-card').forEach(card => {
            card.addEventListener('click', () => {
                const seriesId = card.dataset.series;
                const productId = card.dataset.id;
                const seriesProducts = window.frontend?.productsData?.[seriesId]?.products || {};
                if (productModal) {
                    productModal.open(seriesId, productId, this.searchResults[productId], seriesProducts);
                }
            });
        });
    }

    createResultCard(seriesId, productId, productData) {
        const currentLang = i18n?.currentLanguage || 'zh';
        return `
            <div class="result-card" data-id="${productId}" data-series="${seriesId}">
                <div class="result-image">
                    <img src="https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(productId)}" alt="${productData.name?.[currentLang] || ''}">
                </div>
                <div class="result-info">
                    <h4>${productData.name?.[currentLang] || productData.name?.zh || ''}</h4>
                    <p>${productData.description?.[currentLang] || productData.description?.zh || ''}</p>
                    ${productData.price ? `<span class="result-price">¥${productData.price}</span>` : ''}
                </div>
            </div>
        `;
    }

    clearResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        this.searchResults = {};
    }

    updateLanguage() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.placeholder = i18n?.t('search') || '搜索产品...';
        }
    }
}

const productSearch = new ProductSearch();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productSearch;
} else {
    window.productSearch = productSearch;
}