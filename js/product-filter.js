class ProductFilter {
    constructor() {
        this.filters = {
            series: [],
            priceMin: '',
            priceMax: '',
            materials: [],
            inStock: null
        };
        this.activeFilters = new Set();
    }

    init() {
        this.renderFilterPanel();
    }

    getMaterialOptions() {
        return [
            { id: 'leather', name: { zh: '真皮', en: 'Leather', ko: '가죽' } },
            { id: 'pu', name: { zh: 'PU材质', en: 'PU Material', ko: 'PU 재질' } },
            { id: 'suede', name: { zh: '绒面', en: 'Suede', ko: '스웨이드' } },
            { id: 'canvas', name: { zh: '帆布', en: 'Canvas', ko: '캔버스' } },
            { id: 'rubber', name: { zh: '橡胶', en: 'Rubber', ko: '고무' } }
        ];
    }

    getPriceRanges() {
        const currentLang = i18n?.currentLanguage || 'zh';
        return [
            { id: 'all', name: { zh: '全部', en: 'All', ko: '전체' }, min: 0, max: Infinity },
            { id: '0-300', name: { zh: '0-300元', en: '0-300', ko: '0-300' }, min: 0, max: 300 },
            { id: '300-500', name: { zh: '300-500元', en: '300-500', ko: '300-500' }, min: 300, max: 500 },
            { id: '500-800', name: { zh: '500-800元', en: '500-800', ko: '500-800' }, min: 500, max: 800 },
            { id: '800+', name: { zh: '800元以上', en: '800+', ko: '800+' }, min: 800, max: Infinity }
        ];
    }

    renderFilterPanel() {
        const searchSection = document.querySelector('.product-search');
        if (!searchSection) return;

        let panel = document.getElementById('filter-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'filter-panel';
            panel.className = 'filter-panel';
            searchSection.insertBefore(panel, searchSection.firstChild);
        }

        const currentLang = i18n?.currentLanguage || 'zh';
        const materials = this.getMaterialOptions();
        const priceRanges = this.getPriceRanges();

        panel.innerHTML = `
            <div class="filter-header">
                <span class="filter-title">${i18n?.t('filter') || '筛选'}</span>
                <button class="filter-reset" id="filter-reset">${i18n?.t('reset') || '重置'}</button>
            </div>
            <div class="filter-content">
                <div class="filter-group">
                    <label class="filter-label">${i18n?.t('priceRange') || '价格区间'}</label>
                    <select class="filter-select" id="price-range-filter">
                        ${priceRanges.map(range => `
                            <option value="${range.id}">${range.name[currentLang]}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label class="filter-label">${i18n?.t('material') || '材质'}</label>
                    <div class="filter-checkboxes">
                        ${materials.map(mat => `
                            <label class="filter-checkbox">
                                <input type="checkbox" value="${mat.id}" data-filter="material">
                                <span>${mat.name[currentLang]}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                <div class="filter-group">
                    <label class="filter-checkbox">
                        <input type="checkbox" id="stock-filter">
                        <span>${i18n?.t('inStock') || '仅显示有货'}</span>
                    </label>
                </div>
            </div>
            <div class="filter-active" id="filter-active"></div>
        `;

        this.bindFilterEvents();
    }

    bindFilterEvents() {
        const priceSelect = document.getElementById('price-range-filter');
        priceSelect?.addEventListener('change', (e) => {
            this.filters.priceMin = '';
            this.filters.priceMax = '';
            
            if (e.target.value !== 'all') {
                const range = this.getPriceRanges().find(r => r.id === e.target.value);
                if (range) {
                    this.filters.priceMin = range.min;
                    this.filters.priceMax = range.max === Infinity ? '' : range.max;
                }
            }
            
            this.applyFilters();
        });

        const materialCheckboxes = document.querySelectorAll('[data-filter="material"]');
        materialCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.filters.materials = Array.from(materialCheckboxes)
                    .filter(c => c.checked)
                    .map(c => c.value);
                this.applyFilters();
            });
        });

        const stockFilter = document.getElementById('stock-filter');
        stockFilter?.addEventListener('change', (e) => {
            this.filters.inStock = e.target.checked ? true : null;
            this.applyFilters();
        });

        const resetBtn = document.getElementById('filter-reset');
        resetBtn?.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    setSeriesFilter(seriesIds) {
        this.filters.series = seriesIds;
        this.applyFilters();
    }

    applyFilters() {
        window.dispatchEvent(new CustomEvent('filterChanged', {
            detail: { filters: this.getActiveFilters() }
        }));
        this.updateActiveFilterDisplay();
    }

    getActiveFilters() {
        return {
            series: this.filters.series,
            priceMin: this.filters.priceMin,
            priceMax: this.filters.priceMax,
            materials: this.filters.materials,
            inStock: this.filters.inStock
        };
    }

    filterProducts(products, filters) {
        return Object.entries(products).filter(([id, product]) => {
            if (filters.series && filters.series.length > 0) {
                if (!filters.series.includes(product.seriesId) && !filters.series.includes(product.series)) {
                    return false;
                }
            }

            if (filters.priceMin || filters.priceMax) {
                const price = parseFloat(product.price) || 0;
                if (filters.priceMin && price < filters.priceMin) return false;
                if (filters.priceMax && price > filters.priceMax) return false;
            }

            if (filters.materials && filters.materials.length > 0) {
                // 由于产品数据中可能没有 materials 字段，这里跳过材质筛选
                // 可以在产品数据中添加 materials 字段后取消注释下面的代码
                // const productMaterials = Object.values(product.materials || {}).map(m => m?.toLowerCase());
                // const hasMaterial = filters.materials.some(mat => 
                //     productMaterials.some(pm => pm && pm.includes(mat))
                // );
                // if (!hasMaterial) return false;
            }

            if (filters.inStock === true) {
                if (product.stock === 0 || product.inStock === false) {
                    return false;
                }
            }

            return true;
        });
    }

    updateActiveFilterDisplay() {
        const container = document.getElementById('filter-active');
        if (!container) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const activeTags = [];

        if (this.filters.priceMin || this.filters.priceMax) {
            const priceText = this.filters.priceMax 
                ? `${this.filters.priceMin}-${this.filters.priceMax}`
                : `${this.filters.priceMin}+`;
            activeTags.push({ type: 'price', text: priceText });
        }

        if (this.filters.materials.length > 0) {
            const materialNames = this.getMaterialOptions()
                .filter(m => this.filters.materials.includes(m.id))
                .map(m => m.name[currentLang]);
            activeTags.push({ type: 'material', text: materialNames.join(', ') });
        }

        if (this.filters.inStock) {
            activeTags.push({ type: 'stock', text: i18n?.t('inStock') || '有货' });
        }

        container.innerHTML = activeTags.map(tag => `
            <span class="filter-tag">
                ${tag.text}
                <button class="tag-remove" data-type="${tag.type}">×</button>
            </span>
        `).join('');

        container.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeFilter(btn.dataset.type);
            });
        });
    }

    removeFilter(type) {
        switch (type) {
            case 'price':
                this.filters.priceMin = '';
                this.filters.priceMax = '';
                document.getElementById('price-range-filter').value = 'all';
                break;
            case 'material':
                this.filters.materials = [];
                document.querySelectorAll('[data-filter="material"]').forEach(cb => cb.checked = false);
                break;
            case 'stock':
                this.filters.inStock = null;
                document.getElementById('stock-filter').checked = false;
                break;
        }
        this.applyFilters();
    }

    resetFilters() {
        this.filters = {
            series: [],
            priceMin: '',
            priceMax: '',
            materials: [],
            inStock: null
        };

        document.getElementById('price-range-filter').value = 'all';
        document.querySelectorAll('[data-filter="material"]').forEach(cb => cb.checked = false);
        document.getElementById('stock-filter').checked = false;

        this.applyFilters();
    }

    hasActiveFilters() {
        return !!(this.filters.series.length > 0 || 
            this.filters.priceMin || 
            this.filters.priceMax || 
            this.filters.materials.length > 0 || 
            this.filters.inStock);
    }
}

const productFilter = new ProductFilter();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productFilter;
} else {
    window.productFilter = productFilter;
}
