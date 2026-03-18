class BrowseHistory {
    constructor() {
        this.historyKey = 'browse_history';
        this.maxHistory = 20;
    }

    init() {
        this.loadHistory();
    }

    add(product) {
        const history = this.getHistory();
        
        const existingIndex = history.findIndex(p => p.id === product.id && p.seriesId === product.seriesId);
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }

        const mainImageFile = product.images?.find(img => img.isMain) || product.images?.[0];
        const imageUrl = mainImageFile ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(product.seriesId)}/${encodeURIComponent(mainImageFile.filename)}` : '';

        const historyItem = {
            id: product.id,
            seriesId: product.seriesId,
            name: product.name,
            price: product.price,
            image: imageUrl,
            timestamp: Date.now()
        };

        history.unshift(historyItem);

        if (history.length > this.maxHistory) {
            history.pop();
        }

        this.saveHistory(history);
        this.renderHistoryWidget();
    }

    getHistory() {
        try {
            const saved = localStorage.getItem(this.historyKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading browse history:', e);
            return [];
        }
    }

    saveHistory(history) {
        try {
            localStorage.setItem(this.historyKey, JSON.stringify(history));
        } catch (e) {
            console.error('Error saving browse history:', e);
        }
    }

    loadHistory() {
        this.renderHistoryWidget();
    }

    clear() {
        localStorage.removeItem(this.historyKey);
        this.renderHistoryWidget();
    }

    renderHistoryWidget() {
        let widget = document.getElementById('browse-history-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'browse-history-widget';
            widget.className = 'browse-history-widget';
            document.body.appendChild(widget);
        }

        const history = this.getHistory();
        
        if (history.length === 0) {
            widget.innerHTML = '';
            widget.classList.remove('active');
            return;
        }

        const currentLang = i18n?.currentLanguage || 'zh';
        const titles = {
            'zh': '最近浏览',
            'en': 'Recently Viewed',
            'ko': '최근 본 상품'
        };

        widget.innerHTML = `
            <div class="browse-history-header">
                <h3>${titles[currentLang]}</h3>
                <button class="clear-history" title="${i18n?.t('clearHistory') || '清空'}">🗑</button>
            </div>
            <div class="browse-history-list">
                ${history.slice(0, 6).map(item => `
                    <div class="history-item" data-id="${item.id}" data-series="${item.seriesId}">
                        <img src="${item.image}" alt="${item.name?.[currentLang] || item.name?.zh || ''}">
                        <span class="history-name">${item.name?.[currentLang] || item.name?.zh || ''}</span>
                    </div>
                `).join('')}
            </div>
        `;

        widget.querySelector('.clear-history')?.addEventListener('click', () => this.clear());
        
        widget.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const seriesId = item.dataset.series;
                const product = history.find(p => p.id === id && p.seriesId === seriesId);
                if (product && productModal) {
                    const allProducts = {};
                    productModal.open(seriesId, id, product, allProducts);
                }
            });
        });

        widget.classList.add('active');
    }

    getRecentProducts(count = 6) {
        return this.getHistory().slice(0, count);
    }
}

const browseHistory = new BrowseHistory();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = browseHistory;
} else {
    window.browseHistory = browseHistory;
}
