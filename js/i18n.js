class I18n {
    constructor() {
        this.supportedLanguages = ['zh', 'en', 'ko'];
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.defaultTranslations = {
            zh: {
                home: '首页',
                about: '关于我们',
                contact: '联系方式',
                products: '产品系列',
                aboutUs: '关于我们',
                contactUs: '联系方式',
                socialMedia: '社交媒体',
                copyright: '© 2026 产品展示. 保留所有权利.',
                wechat: '微信',
                weibo: '微博',
                instagram: 'Instagram',
                compare: '添加到对比',
                removeCompare: '取消对比',
                compareTitle: '产品对比',
                clearCompare: '清空',
                startCompare: '开始对比',
                selectAtLeast: '请至少添加2个产品进行对比',
                maxCompare: '最多只能添加4个产品进行对比',
                clearHistory: '清空历史',
                recentlyViewed: '最近浏览',
                switchTheme: '切换主题',
                selectTheme: '选择主题',
                view: '视图',
                sortBy: '排序',
                filter: '筛选',
                reset: '重置',
                priceRange: '价格区间',
                material: '材质',
                inStock: '仅显示有货',
                share: '分享',
                shareTo: '分享到',
                backToTop: '回到顶部',
                imageZoom: '图片放大',
                enableFeature: '开启功能',
                disableFeature: '关闭功能',
                featureSettings: '功能设置'
            },
            en: {
                home: 'Home',
                about: 'About',
                contact: 'Contact',
                products: 'Product Series',
                aboutUs: 'About Us',
                contactUs: 'Contact Us',
                socialMedia: 'Social Media',
                copyright: '© 2026 Product Display. All rights reserved.',
                wechat: 'WeChat',
                weibo: 'Weibo',
                instagram: 'Instagram',
                compare: 'Add to Compare',
                removeCompare: 'Remove from Compare',
                compareTitle: 'Product Comparison',
                clearCompare: 'Clear',
                startCompare: 'Compare',
                selectAtLeast: 'Please select at least 2 products to compare',
                maxCompare: 'Maximum 4 products can be compared',
                clearHistory: 'Clear History',
                recentlyViewed: 'Recently Viewed',
                switchTheme: 'Switch Theme',
                selectTheme: 'Select Theme',
                view: 'View',
                sortBy: 'Sort',
                filter: 'Filter',
                reset: 'Reset',
                priceRange: 'Price Range',
                material: 'Material',
                inStock: 'In Stock Only',
                share: 'Share',
                shareTo: 'Share to',
                backToTop: 'Back to Top',
                imageZoom: 'Image Zoom',
                enableFeature: 'Enable',
                disableFeature: 'Disable',
                featureSettings: 'Feature Settings'
            },
            ko: {
                home: '홈',
                about: '소개',
                contact: '연락처',
                products: '제품 시리즈',
                aboutUs: '회사 소개',
                contactUs: '연락처',
                socialMedia: '소셜 미디어',
                copyright: '© 2026 제품 디스플레이. 모든 권리 보유.',
                wechat: '위챗',
                weibo: '웨이보',
                instagram: '인스타그램',
                compare: '비교에 추가',
                removeCompare: '비교에서 제거',
                compareTitle: '제품 비교',
                clearCompare: '비우기',
                startCompare: '비교 시작',
                selectAtLeast: '비교하려면 최소 2개 이상의 제품을 선택하세요',
                maxCompare: '최대 4개 제품만 비교할 수 있습니다',
                clearHistory: '기록 지우기',
                recentlyViewed: '최근 본 상품',
                switchTheme: '테마 변경',
                selectTheme: '테마 선택',
                view: '보기',
                sortBy: '정렬',
                filter: '필터',
                reset: '초기화',
                priceRange: '가격대',
                material: '재질',
                inStock: '재고 있음만',
                share: '공유',
                shareTo: '공유하기',
                backToTop: '맨위로',
                imageZoom: '이미지 확대',
                enableFeature: '기능 활성화',
                disableFeature: '기능 비활성화',
                featureSettings: '기능 설정'
            }
        };
        this.translations = this.loadTranslations();
    }

    loadTranslations() {
        const saved = localStorage.getItem('translations');
        return saved ? JSON.parse(saved) : this.defaultTranslations;
    }

    /**
     * 初始化多语言支持
     */
    init() {
        this.bindLanguageSwitcher();
        this.updateLanguageUI();
    }

    isReady() {
        return this.translations && this.translations[this.currentLanguage];
    }

    /**
     * 绑定语言切换按钮事件
     */
    bindLanguageSwitcher() {
        const languageButtons = document.querySelectorAll('.language-switcher button');
        languageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    /**
     * 切换语言
     * @param {string} lang - 语言代码
     */
    switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateLanguageUI();

        // 触发语言变化事件
        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        window.dispatchEvent(event);
    }

    /**
     * 更新页面语言UI
     */
    updateLanguageUI() {
        // 更新语言切换按钮状态
        const languageButtons = document.querySelectorAll('.language-switcher button');
        languageButtons.forEach(button => {
            if (button.dataset.lang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // 更新页面静态文本
        this.translateStaticElements();
    }

    /**
     * 翻译静态页面元素
     */
    translateStaticElements() {
        // 产品标题
        const productsTitle = document.getElementById('products-title');
        if (productsTitle) {
            productsTitle.textContent = this.t('products');
        }

        // 页脚
        const aboutUs = document.getElementById('about-us');
        if (aboutUs) {
            aboutUs.textContent = this.t('aboutUs');
        }

        const contactUs = document.getElementById('contact-us');
        if (contactUs) {
            contactUs.textContent = this.t('contactUs');
        }

        const socialMedia = document.getElementById('social-media');
        if (socialMedia) {
            socialMedia.textContent = this.t('socialMedia');
        }

        const copyright = document.getElementById('copyright');
        if (copyright) {
            copyright.textContent = this.t('copyright');
        }

        const wechatLink = document.getElementById('wechat-link');
        if (wechatLink) {
            wechatLink.textContent = this.t('wechat');
        }

        const weiboLink = document.getElementById('weibo-link');
        if (weiboLink) {
            weiboLink.textContent = this.t('weibo');
        }

        const instagramLink = document.getElementById('instagram-link');
        if (instagramLink) {
            instagramLink.textContent = this.t('instagram');
        }
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键名
     * @param {string} fallback -  fallback文本
     * @returns {string} 翻译后的文本
     */
    t(key, fallback = '') {
        if (!this.translations || !this.translations[this.currentLanguage]) {
            return fallback || key;
        }
        return this.translations[this.currentLanguage][key] || fallback;
    }

    /**
     * 从对象中获取本地化字段
     * @param {object} obj - 包含多语言字段的对象
     * @param {string} field - 字段名
     * @param {string} lang - 语言代码，默认使用当前语言
     * @returns {string} 本地化后的字段值
     */
    getLocalizedField(obj, field, lang = null) {
        if (!obj || !obj[field]) {
            return '';
        }

        if (!this.translations) {
            return typeof obj[field] === 'string' ? obj[field] : (obj[field].zh || obj[field].en || obj[field].ko || '');
        }

        const currentLang = lang || this.currentLanguage || 'zh';

        if (typeof obj[field] === 'string') {
            return obj[field];
        }

        if (typeof obj[field] === 'object') {
            return obj[field][currentLang] || obj[field]['zh'] || '';
        }

        return '';
    }

    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 获取支持的语言列表
     * @returns {array} 语言代码数组
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * 导出翻译字典为JSON文件
     */
    exportTranslations() {
        const data = JSON.stringify(this.translations, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'translations.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 从JSON文件导入翻译
     * @param {File} file - JSON文件对象
     */
    async importTranslations(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    this.translations = this.mergeTranslations(this.translations, imported);
                    localStorage.setItem('translations', JSON.stringify(this.translations));
                    this.updateLanguageUI();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * 合并导入的翻译
     */
    mergeTranslations(current, imported) {
        const result = { ...current };
        for (const lang of this.supportedLanguages) {
            if (imported[lang]) {
                result[lang] = { ...result[lang], ...imported[lang] };
            }
        }
        return result;
    }

    /**
     * 获取翻译字典（用于编辑）
     */
    getTranslations() {
        return JSON.parse(JSON.stringify(this.translations));
    }

    /**
     * 设置翻译字典（用于批量更新）
     */
    setTranslations(newTranslations) {
        this.translations = newTranslations;
        this.defaultTranslations = newTranslations;
        localStorage.setItem('translations', JSON.stringify(this.translations));
        this.updateLanguageUI();
    }

    /**
     * 重置为默认翻译
     */
    resetTranslations() {
        this.translations = this.defaultTranslations;
        localStorage.removeItem('translations');
        this.updateLanguageUI();
    }
}

// 导出单例
const i18n = new I18n();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
} else {
    window.i18n = i18n;
}