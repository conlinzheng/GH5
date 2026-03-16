class ProductCompare {
    constructor() {
        this.compareList = [];
        this.maxCompare = 4;
        this.compareKey = 'product_compare';
    }

    init() {
        this.loadCompare();
        this.createCompareBar();
        this.bindEvents();
    }

    loadCompare() {
        try {
            const saved = localStorage.getItem(this.compareKey);
            if (saved) {
                this.compareList = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading compare list:', e);
        }
    }

    saveCompare() {
        try {
            localStorage.setItem(this.compareKey, JSON.stringify(this.compareList));
        } catch (e) {
            console.error('Error saving compare list:', e);
        }
    }

    createCompareBar() {
        const bar = document.getElementById('compare-bar');
        if (!bar) return;

        bar.innerHTML = `
            <div class="compare-bar-content">
                <div class="compare-slots"></div>
                <div class="compare-actions">
                    <button class="compare-clear">${i18n?.t('clearCompare') || '清空'}</button>
                    <button class="compare-start">${i18n?.t('startCompare') || '开始对比'}</button>
                </div>
            </div>
        `;

        this.renderSlots();
    }

    bindEvents() {
        const bar = document.getElementById('compare-bar');
        if (!bar) return;

        bar.querySelector('.compare-clear').addEventListener('click', () => this.clear());
        bar.querySelector('.compare-start').addEventListener('click', () => this.openCompareModal());
    }

    toggle(product) {
        const existingIndex = this.compareList.findIndex(p => p.id === product.id);

        if (existingIndex !== -1) {
            this.compareList.splice(existingIndex, 1);
        } else {
            if (this.compareList.length >= this.maxCompare) {
                alert(i18n?.t('maxCompare') || '最多只能添加4个产品进行对比');
                return;
            }
            this.compareList.push(product);
        }

        this.saveCompare();
        this.renderSlots();

        window.dispatchEvent(new CustomEvent('compareChanged', { detail: { list: this.compareList } }));
    }

    isInCompare(productId) {
        return this.compareList.some(p => p.id === productId);
    }

    remove(productId) {
        const index = this.compareList.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.compareList.splice(index, 1);
            this.saveCompare();
            this.renderSlots();
        }
    }

    clear() {
        this.compareList = [];
        this.saveCompare();
        this.renderSlots();
    }

    renderSlots() {
        const slotsContainer = document.querySelector('.compare-slots');
        if (!slotsContainer) return;

        slotsContainer.innerHTML = '';

        for (let i = 0; i < this.maxCompare; i++) {
            const slot = document.createElement('div');
            slot.className = 'compare-slot';

            if (this.compareList[i]) {
                const product = this.compareList[i];
                slot.innerHTML = `
                    <img src="https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(product.seriesId)}/${encodeURIComponent(product.id)}" alt="${product.name?.zh || ''}">
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

        const currentLang = i18n?.currentLanguage || 'zh';
        const products = this.compareList;

        const modal = document.createElement('div');
        modal.className = 'compare-modal';
        modal.innerHTML = `
            <div class="compare-modal-overlay"></div>
            <div class="compare-modal-content">
                <div class="compare-modal-header">
                    <h2>${i18n?.t('compareTitle') || '产品对比'}</h2>
                    <button class="compare-modal-close">&times;</button>
                </div>
                <div class="compare-table-wrapper">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th></th>
                        ${products.map(p => `<th>${p.name?.[currentLang] || p.name?.zh || ''}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>图片</td>
                        ${products.map(p => `<td><img src="https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(p.seriesId)}/${encodeURIComponent(p.id)}" alt="${p.name?.zh}" style="width:120px;height:120px;object-fit:contain;"></td>`).join('')}
                            </tr>
                            <tr>
                                <td>价格</td>
                        ${products.map(p => `<td class="price">¥${p.price || '-'}</td>`).join('')}
                            </tr>
                            <tr>
                                <td>描述</td>
                        ${products.map(p => `<td>${p.description?.[currentLang] || p.description?.zh || '-'}</td>`).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.compare-modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.compare-modal-overlay').addEventListener('click', () => modal.remove());
    }
}

const productCompare = new ProductCompare();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productCompare;
} else {
    window.productCompare = productCompare;
}