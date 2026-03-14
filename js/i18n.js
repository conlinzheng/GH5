class I18n {
    constructor() {
        this.supportedLanguages = ['zh', 'en', 'ko'];
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = {
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
                sortBy: '排序'
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
                sortBy: 'Sort'
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
                sortBy: '정렬'
            }
        };
    }

    init() {
        this.bindLanguageSwitcher();
        this.updateLanguageUI();
    }

    bindLanguageSwitcher() {
        const languageButtons = document.querySelectorAll('.language-switcher button');
        languageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateLanguageUI();

        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        window.dispatchEvent(event);
    }

    updateLanguageUI() {
        const languageButtons = document.querySelectorAll('.language-switcher button');
        languageButtons.forEach(button => {
            if (button.dataset.lang === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        this.translateStaticElements();
    }

    translateStaticElements() {
        const productsTitle = document.getElementById('products-title');
        if (productsTitle) {
            productsTitle.textContent = this.t('products');
        }

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

    t(key, fallback = '') {
        return this.translations[this.currentLanguage][key] || fallback;
    }

    getLocalizedField(obj, field, lang = this.currentLanguage) {
        if (!obj || !obj[field]) {
            return '';
        }

        if (typeof obj[field] === 'string') {
            return obj[field];
        }

        if (typeof obj[field] === 'object') {
            return obj[field][lang] || obj[field]['zh'] || '';
        }

        return '';
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return this.supportedLanguages;
    }
}

const i18n = new I18n();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
} else {
    window.i18n = i18n;
}