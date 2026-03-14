class LayoutSwitcher {
    constructor() {
        this.layoutKey = 'product_layout';
        this.currentLayout = localStorage.getItem(this.layoutKey) || 'grid';
        this.sortBy = localStorage.getItem('product_sort') || 'default';
        this.sortOrder = localStorage.getItem('product_sort_order') || 'asc';
    }

    init() {
        this.renderLayoutControls();
    }

    getLayouts() {
        return [
            { id: 'grid', name: { zh: '网格视图', en: 'Grid View', ko: '그리드 보기' }, icon: '▦' },
            { id: 'list', name: { zh: '列表视图', en: 'List View', ko: '리스트 보기' }, icon: '☰' },
            { id: 'large', name: { zh: '大图', en: 'Large', ko: '큰 이미지' }, icon: '◻' },
            { id: 'small', name: { zh: '小图', en: 'Small', ko: '작은 이미지' }, icon: '◼' }
        ];
    }

    getSortOptions() {
        return [
            { id: 'default', name: { zh: '默认排序', en: 'Default', ko: '기본 정렬' } },
            { id: 'price', name: { zh: '价格', en: 'Price', ko: '가격' } },
            { id: 'name', name: { zh: '名称', en: 'Name', ko: '이름' } }
        ];
    }

    setLayout(layout) {
        this.currentLayout = layout;
        localStorage.setItem(this.layoutKey, layout);
        this.applyLayout();
        this.updateActiveButtons();
    }

    setSort(sortBy, sortOrder = 'asc') {
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        localStorage.setItem('product_sort', sortBy);
        localStorage.setItem('product_sort_order', sortOrder);
        
        window.dispatchEvent(new CustomEvent('sortChanged', { 
            detail: { sortBy, sortOrder } 
        }));
    }

    applyLayout() {
        const container = document.getElementById('product-series');
        if (!container) return;

        container.className = 'product-series-container';
        
        if (this.currentLayout === 'grid') {
            container.classList.add('layout-grid');
        } else if (this.currentLayout === 'list') {
            container.classList.add('layout-list');
        } else if (this.currentLayout === 'large') {
            container.classList.add('layout-large');
        } else if (this.currentLayout === 'small') {
            container.classList.add('layout-small');
        }

        window.dispatchEvent(new CustomEvent('layoutChanged', { 
            detail: { layout: this.currentLayout } 
        }));
    }

    renderLayoutControls() {
        const searchSection = document.querySelector('.product-search');
        if (!searchSection) return;

        let controls = document.getElementById('layout-controls');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'layout-controls';
            controls.className = 'layout-controls';
            searchSection.appendChild(controls);
        }

        const currentLang = i18n?.currentLanguage || 'zh';
        const layouts = this.getLayouts();
        const sortOptions = this.getSortOptions();

        controls.innerHTML = `
            <div class="layout-group">
                <span class="layout-label">${i18n?.t('view') || '视图'}:</span>
                <div class="layout-buttons">
                    ${layouts.map(layout => `
                        <button class="layout-btn ${this.currentLayout === layout.id ? 'active' : ''}" 
                                data-layout="${layout.id}" 
                                title="${layout.name[currentLang]}">
                            ${layout.icon}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="sort-group">
                <span class="sort-label">${i18n?.t('sortBy') || '排序'}:</span>
                <select class="sort-select" id="sort-select">
                    ${sortOptions.map(opt => `
                        <option value="${opt.id}" ${this.sortBy === opt.id ? 'selected' : ''}>
                            ${opt.name[currentLang]}
                        </option>
                    `).join('')}
                </select>
                <button class="sort-order-btn" id="sort-order" title="${i18n?.t('sortOrder') || '排序方向'}">
                    ${this.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
            </div>
        `;

        controls.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLayout(btn.dataset.layout);
            });
        });

        const sortSelect = document.getElementById('sort-select');
        sortSelect?.addEventListener('change', (e) => {
            this.setSort(e.target.value, this.sortOrder);
        });

        const sortOrderBtn = document.getElementById('sort-order');
        sortOrderBtn?.addEventListener('click', () => {
            const newOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            this.setSort(this.sortBy, newOrder);
            sortOrderBtn.textContent = newOrder === 'asc' ? '↑' : '↓';
        });

        this.applyLayout();
    }

    updateActiveButtons() {
        const buttons = document.querySelectorAll('.layout-btn');
        buttons.forEach(btn => {
            if (btn.dataset.layout === this.currentLayout) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    sortProducts(products) {
        if (this.sortBy === 'default') return products;

        const entries = Object.entries(products);
        
        entries.sort((a, b) => {
            let valA, valB;
            const productA = a[1];
            const productB = b[1];

            if (this.sortBy === 'price') {
                valA = parseFloat(productA.price) || 0;
                valB = parseFloat(productB.price) || 0;
            } else if (this.sortBy === 'name') {
                const currentLang = i18n?.currentLanguage || 'zh';
                valA = productA.name?.[currentLang] || productA.name?.zh || '';
                valB = productB.name?.[currentLang] || productB.name?.zh || '';
                return this.sortOrder === 'asc' 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
            }

            return this.sortOrder === 'asc' ? valA - valB : valB - valA;
        });

        return Object.fromEntries(entries);
    }
}

const layoutSwitcher = new LayoutSwitcher();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = layoutSwitcher;
} else {
    window.layoutSwitcher = layoutSwitcher;
}