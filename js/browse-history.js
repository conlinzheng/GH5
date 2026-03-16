class BrowseHistory {
    constructor() {
        this.historyKey = 'browse_history';
        this.maxHistory = 20;
    }

    init() {
        this.renderHistoryWidget();
    }

    add(product) {
        const history = this.getHistory();

        const existingIndex = history.findIndex(item => item.id === product.id && item.seriesId === product.seriesId);
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }

        const historyItem = {
            id: product.id,
            seriesId: product.seriesId,
            name: product.name,
            price: product.price,
            image: `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(product.seriesId)}/${encodeURIComponent(product.id)}`,
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

    clear() {
        localStorage.removeItem(this.historyKey);
        this.renderHistoryWidget();
    }

    renderHistoryWidget() {
        let widget = document.getElementById('history-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'history-widget';
            widget.className = 'history-widget';
            document.body.appendChild(widget);
        }

        const history = this.getHistory();
        if (history.length === 0) {
            widget.style.display = 'none';
            return;
        }

        widget.style.display = 'block';
        widget.innerHTML = `
            <div class="history-header">
                <span>${i18n?.t('recentlyViewed') || '最近浏览'}</span>
                <button class="clear-history">${i18n?.t('clearHistory') || '清空'}</button>
            </div>
            <div class="history-list">
                ${history.slice(0, 5).map(item => `
                    <div class="history-item" data-id="${item.id}" data-series="${item.seriesId}">
                        <img src="${item.image}" alt="${item.name?.zh || ''}">
                    </div>
                `).join('')}
            </div>
        `;

        widget.querySelector('.clear-history').addEventListener('click', (e) => {
            e.stopPropagation();
            this.clear();
        });

        widget.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const seriesId = item.dataset.series;
                const productData = history.find(h => h.id === id && h.seriesId === seriesId);
                if (productData && productModal) {
                    const seriesProducts = frontend?.productsData?.[seriesId]?.products || {};
                    productModal.open(seriesId, id, productData, seriesProducts);
                }
            });
        });
    }
}

const browseHistory = new BrowseHistory();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = browseHistory;
} else {
    window.browseHistory = browseHistory;
}