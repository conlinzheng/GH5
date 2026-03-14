class I18n {
    constructor() {
        this.supportedLanguages = ['zh', 'en', 'ko'];
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = {
            'zh': {
                'products': '产品系列',
                'about': '关于我们',
                'contact': '联系方式',
                'phone': '电话',
                'email': '邮箱',
                'social': '社交媒体',
                'copyright': '保留所有权利.'
            },
            'en': {
                'products': 'Product Series',
                'about': 'About Us',
                'contact': 'Contact Us',
                'phone': 'Phone',
                'email': 'Email',
                'social': 'Social Media',
                'copyright': 'All rights reserved.'
            },
            'ko': {
                'products': '제품 시리즈',
                'about': '회사 소개',
                'contact': '연락처',
                'phone': '전화',
                'email': '이메일',
                'social': '소셜 미디어',
                'copyright': '모든 권리 보유.'
            }
        };
    }

    init() {
        this.bindLanguageSwitcher();
        this.updateLanguageUI();
    }

    bindLanguageSwitcher() {
        const buttons = document.querySelectorAll('.language-switcher button');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.error('Unsupported language:', lang);
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateLanguageUI();

        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang }
        }));
    }

    updateLanguageUI() {
        const buttons = document.querySelectorAll('.language-switcher button');
        buttons.forEach(btn => {
            if (btn.dataset.lang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.translateStaticElements();
    }

    translateStaticElements() {
        const translations = this.translations[this.currentLanguage] || this.translations['zh'];

        const productsTitle = document.getElementById('products-title');
        if (productsTitle) productsTitle.textContent = translations['products'];

        const aboutUs = document.getElementById('about-us');
        if (aboutUs) aboutUs.textContent = translations['about'];

        const contactUs = document.getElementById('contact-us');
        if (contactUs) contactUs.textContent = translations['contact'];

        const socialMedia = document.getElementById('social-media');
        if (socialMedia) socialMedia.textContent = translations['social'];
    }

    t(key) {
        const translations = this.translations[this.currentLanguage] || this.translations['zh'];
        return translations[key] || key;
    }

    getLocalizedField(data, field) {
        if (!data || !data[field]) return '';
        if (typeof data[field] === 'string') return data[field];
        return data[field][this.currentLanguage] || data[field]['zh'] || '';
    }
}

const i18n = new I18n();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = i18n;
} else {
    window.i18n = i18n;
}