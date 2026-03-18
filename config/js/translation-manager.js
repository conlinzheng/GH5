class TranslationManager {
    constructor() {
        this.translations = {};
    }

    async render(container) {
        const translations = this.loadTranslations();
        
        container.innerHTML = `
            <div class="translation-manager">
                <h2>翻译管理</h2>
                <p>管理网站的翻译文本</p>
                <div class="toolbar">
                    <button class="btn btn-primary" id="export-translations">📤 导出翻译</button>
                    <button class="btn btn-secondary" id="import-translations">📥 导入翻译</button>
                    <button class="btn btn-success" id="save-translations">💾 保存修改</button>
                </div>
                <div class="translation-list">
                    ${this.renderTranslationList(translations)}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    loadTranslations() {
        const saved = localStorage.getItem('translations');
        return saved ? JSON.parse(saved) : this.getDefaultTranslations();
    }

    getDefaultTranslations() {
        return {
            zh: { home: '首页', products: '产品系列', about: '关于我们', contact: '联系方式' },
            en: { home: 'Home', products: 'Product Series', about: 'About', contact: 'Contact' },
            ko: { home: '홈', products: '제품 시리즈', about: '소개', contact: '연락처' }
        };
    }

    renderTranslationList(translations) {
        const keys = Object.keys(translations.zh || {});
        return keys.map(key => `
            <div class="translation-item" data-key="${key}">
                <label>${key}</label>
                <input type="text" class="translation-input zh" value="${translations.zh[key] || ''}" data-lang="zh">
                <input type="text" class="translation-input en" value="${translations.en[key] || ''}" data-lang="en">
                <input type="text" class="translation-input ko" value="${translations.ko[key] || ''}" data-lang="ko">
            </div>
        `).join('');
    }

    bindEvents() {
        const exportBtn = document.getElementById('export-translations');
        const importBtn = document.getElementById('import-translations');
        const saveBtn = document.getElementById('save-translations');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTranslations());
        }
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => this.importTranslations(e.target.files[0]);
                input.click();
            });
        }
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveTranslations());
        }
    }

    exportTranslations() {
        const translations = this.loadTranslations();
        const data = JSON.stringify(translations, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'translations.json';
        a.click();
        URL.revokeObjectURL(url);
        if (window.notifier) notifier.success('翻译已导出');
    }

    importTranslations(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                localStorage.setItem('translations', JSON.stringify(imported));
                if (window.notifier) notifier.success('翻译已导入');
                location.reload();
            } catch (error) {
                if (window.notifier) notifier.error('导入失败: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    saveTranslations() {
        const items = document.querySelectorAll('.translation-item');
        const translations = { zh: {}, en: {}, ko: {} };
        
        items.forEach(item => {
            const key = item.dataset.key;
            const inputs = item.querySelectorAll('input');
            inputs.forEach(input => {
                const lang = input.dataset.lang;
                translations[lang][key] = input.value;
            });
        });

        localStorage.setItem('translations', JSON.stringify(translations));
        if (window.notifier) notifier.success('翻译已保存');
    }

    async saveChanges() {
        this.saveTranslations();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationManager;
} else {
    window.TranslationManager = TranslationManager;
}
