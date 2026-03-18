class ProductCompare {
    constructor() {
        this.compareList = [];
        this.maxCompare = 4;
        this.container = null;
    }

    init() {
        this.render();
        this.loadFromStorage();
    }

    render() {
        const container = document.getElementById('compare-bar');
        if (!container) return;

        container.innerHTML = `
            <div class="compare-bar-content">
                <div class="compare-items">
                    <span class="compare-label">对比栏:</span>
                    <div class="compare-slots" id="compare-slots"></div>
                </div>
                <button class="btn btn-primary" id="open-compare">开始对比</button>
                <button class="btn btn-secondary" id="clear-compare">清空</button>
            </div>
            <div class="compare-modal" id="compare-modal">
                <div class="compare-modal-content">
                    <button class="compare-close" id="compare-close">&times;</button>
                    <h2>${i18n?.t('compareTitle') || '产品对比'}</h2>
                    <div class="compare-table-wrapper" id="compare-table"></div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.renderCompareBar();
    }

    bindEvents() {
        const openBtn = document.getElementById('open-compare');
        const clearBtn = document.getElementById('clear-compare');
        const closeBtn = document.getElementById('compare-close');
        const modal = document.getElementById('compare-modal');

        openBtn?.addEventListener('click', () => this.openCompareModal());
        clearBtn?.addEventListener('click', () => this.clearAll());
        closeBtn?.addEventListener('click', () => this.closeCompareModal());
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeCompareModal();
        });
    }

    add(product) {
        if (this.compareList.find(p => p.id === product.id)) {
            return false;
        }
        if (this.compareList.length >= this.maxCompare) {
            alert(i18n?.t('maxCompare') || `最多只能添加${this.maxCompare}个产品进行对比`);
            return false;
        }
        this.compareList.push(product);
        this.saveToStorage();
        this.renderCompareBar();
        this.updateCompareBarVisibility();
        return true;
    }

    remove(productId) {
        this.compareList = this.compareList.filter(p => p.id !== productId);
        this.saveToStorage();
        this.renderCompareBar();
        this.updateCompareBarVisibility();
    }

    toggle(product) {
        if (this.compareList.find(p => p.id === product.id)) {
            this.remove(product.id);
        } else {
            this.add(product);
        }
    }

    isInCompare(productId) {
        return this.compareList.some(p => p.id === productId);
    }

    clearAll() {
        this.compareList = [];
        this.saveToStorage();
        this.renderCompareBar();
        this.updateCompareBarVisibility();
    }

    updateCompareBarVisibility() {
        const compareBar = document.getElementById('compare-bar');
        if (compareBar) {
            if (this.compareList.length > 0) {
                compareBar.classList.add('active');
            } else {
                compareBar.classList.remove('active');
            }
        }
    }

    renderCompareBar() {
        const slotsContainer = document.getElementById('compare-slots');
        if (!slotsContainer) return;

        slotsContainer.innerHTML = '';

        for (let i = 0; i < this.maxCompare; i++) {
            const slot = document.createElement('div');
            slot.className = 'compare-slot';

            if (this.compareList[i]) {
                const product = this.compareList[i];
                const mainImageFile = product.images?.find(img => img.isMain) || product.images?.[0];
                const imageUrl = mainImageFile ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(product.seriesId)}/${encodeURIComponent(mainImageFile.filename)}` : '';
                slot.innerHTML = `
                    <img src="${imageUrl}" alt="${product.name?.zh || ''}">
                    <button class="remove-compare" data-id="${product.id}">&times;</button>
                `;
            } else {
                slot.innerHTML = `<span class="empty-slot">+</span>`;
            }

            slotsContainer.appendChild(slot);
        }

        slotsContainer.querySelectorAll('.remove-compare').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.remove(btn.dataset.id);
            });
        });
    }

    openCompareModal() {
        if (this.compareList.length < 2) {
            alert(i18n?.t('selectAtLeast') || '请至少添加2个产品进行对比');
            return;
        }

        const modal = document.getElementById('compare-modal');
        modal?.classList.add('active');

        this.renderCompareTable();
    }

    closeCompareModal() {
        const modal = document.getElementById('compare-modal');
        modal?.classList.remove('active');
    }

    renderCompareTable() {
        const tableContainer = document.getElementById('compare-table');
        if (!tableContainer) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const products = this.compareList;

        let html = `
            <table class="compare-table">
                <thead>
                    <tr>
                        <th>属性</th>
                        ${products.map(p => `<th>${p.name?.[currentLang] || p.name?.zh || ''}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>图片</td>
                        ${products.map(p => {
                            const mainImageFile = p.images?.find(img => img.isMain) || p.images?.[0];
                            const imageUrl = mainImageFile ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(p.seriesId)}/${encodeURIComponent(mainImageFile.filename)}` : '';
                            return `<td><img src="${imageUrl}" alt="${p.name?.zh}" style="width:120px;height:120px;object-fit:contain;"></td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td>价格</td>
                        ${products.map(p => `<td class="price">¥${p.price || '-'}</td>`).join('')}
                    </tr>
                    <tr>
                        <td>描述</td>
                        ${products.map(p => `<td>${p.description?.[currentLang] || p.description?.zh || '-'}</td>`).join('')}
                    </tr>
                    ${this.renderMaterialsRow(products, currentLang)}
                </tbody>
            </table>
        `;

        tableContainer.innerHTML = html;
    }

    renderMaterialsRow(products, currentLang) {
        const materialKeys = ['upper', 'lining', 'sole'];
        const materialLabels = {
            'zh': { 'upper': '鞋面', 'lining': '内里', 'sole': '鞋底' },
            'en': { 'upper': 'Upper', 'lining': 'Lining', 'sole': 'Sole' },
            'ko': { 'upper': '신발 상단', 'lining': '안감', 'sole': '밑창' }
        };

        return materialKeys.map(key => `
            <tr>
                <td>${materialLabels[currentLang]?.[key] || key}</td>
                ${products.map(p => `<td>${p.materials?.[key] || '-'}</td>`).join('')}
            </tr>
        `).join('');
    }

    saveToStorage() {
        try {
            localStorage.setItem('compare_list', JSON.stringify(this.compareList));
        } catch (e) {
            console.error('Error saving compare list:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('compare_list');
            if (saved) {
                this.compareList = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading compare list:', e);
            this.compareList = [];
        }
    }
}

const productCompare = new ProductCompare();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productCompare;
} else {
    window.productCompare = productCompare;
}
