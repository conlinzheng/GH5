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
                featureSettings: '功能设置',
                heroTitle: '高品质产品系列',
                heroSubtitle: '我们提供最优质的产品，满足您的各种需求',
                heroBtnShop: '立即选购',
                heroBtnContact: '联系我们',
                featuresTitle: '我们的特色',
                featuresSubtitle: '为什么选择我们的产品',
                featureQuality: '高品质材料',
                featureQualityDesc: '使用最优质的材料，确保产品的耐用性和美观性',
                featureGlobal: '全球配送',
                featureGlobalDesc: '支持全球配送，让您在任何地方都能享受到我们的产品',
                featureWarranty: '优质售后',
                featureWarrantyDesc: '提供完善的售后服务，让您购买无忧',
                featureDesign: '时尚设计',
                featureDesignDesc: '紧跟时尚潮流，为您提供最具设计感的产品',
                featureFast: '快速响应',
                featureFastDesc: '快速响应客户需求，提供高效的服务体验',
                featureEco: '环保理念',
                featureEcoDesc: '采用环保材料和生产工艺，致力于可持续发展',
                searchPlaceholder: '搜索产品...',
                searchButton: '搜索',
                filterTitle: '筛选条件',
                filterSeriesLabel: '产品系列',
                filterAll: '全部系列',
                filterPriceLabel: '价格区间',
                filterPriceAll: '全部价格',
                filterPriceLow: '0-100',
                filterPriceMedium: '100-500',
                filterPriceHigh: '500+',
                filterSortLabel: '排序方式',
                filterSortDefault: '默认排序',
                filterSortPriceAsc: '价格从低到高',
                filterSortPriceDesc: '价格从高到低',
                filterSortNameAsc: '名称从A到Z',
                contactTitle: '联系我们',
                contactSubtitle: '如有任何问题或建议，欢迎联系我们',
                contactInfoTitle: '联系方式',
                contactInfoText: '我们的团队随时为您提供帮助，您可以通过以下方式联系我们',
                contactEmailLabel: '邮箱：',
                contactEmail: 'info@example.com',
                contactPhoneLabel: '电话：',
                contactPhone: '123-456-7890',
                contactAddressLabel: '地址：',
                contactAddress: '北京市朝阳区某某大厦',
                formNameLabel: '姓名',
                formEmailLabel: '邮箱',
                formSubjectLabel: '主题',
                formMessageLabel: '消息',
                formSubmit: '发送消息',
                footerAbout: '关于我们',
                footerAboutText: '我们是一家专注于高品质产品的公司，致力于为客户提供最好的产品和服务。',
                footerLinks: '快速链接',
                footerLinkHome: '首页',
                footerLinkProducts: '产品系列',
                footerLinkFeatures: '特色功能',
                footerLinkContact: '联系我们',
                footerLinkAdmin: '功能设置',
                footerLinkConfig: '产品管理',
                footerContact: '联系方式',
                footerEmail: '邮箱：info@example.com',
                footerPhone: '电话：123-456-7890',
                footerAddress: '地址：北京市朝阳区某某大厦',
                footerSocial: '社交媒体',
                modalTitle: '产品详情',
                modalClose: '关闭',
                navHome: '首页',
                navProducts: '产品系列',
                navFeatures: '特色功能',
                navContact: '联系我们'
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
                featureSettings: 'Feature Settings',
                heroTitle: 'High Quality Product Series',
                heroSubtitle: 'We provide the highest quality products to meet all your needs',
                heroBtnShop: 'Shop Now',
                heroBtnContact: 'Contact Us',
                featuresTitle: 'Our Features',
                featuresSubtitle: 'Why choose our products',
                featureQuality: 'High Quality Materials',
                featureQualityDesc: 'Using the highest quality materials to ensure durability and aesthetics',
                featureGlobal: 'Global Shipping',
                featureGlobalDesc: 'Support global shipping, so you can enjoy our products anywhere',
                featureWarranty: 'Quality After-sales Service',
                featureWarrantyDesc: 'Provide comprehensive after-sales service for worry-free shopping',
                featureDesign: 'Fashionable Design',
                featureDesignDesc: 'Keep up with fashion trends to provide you with the most stylish products',
                featureFast: 'Fast Response',
                featureFastDesc: 'Quickly respond to customer needs and provide efficient service experience',
                featureEco: 'Eco-friendly Concept',
                featureEcoDesc: 'Adopt eco-friendly materials and production processes, committed to sustainable development',
                searchPlaceholder: 'Search products...',
                searchButton: 'Search',
                filterTitle: 'Filter Conditions',
                filterSeriesLabel: 'Product Series',
                filterAll: 'All Series',
                filterPriceLabel: 'Price Range',
                filterPriceAll: 'All Prices',
                filterPriceLow: '0-100',
                filterPriceMedium: '100-500',
                filterPriceHigh: '500+',
                filterSortLabel: 'Sort By',
                filterSortDefault: 'Default Sort',
                filterSortPriceAsc: 'Price: Low to High',
                filterSortPriceDesc: 'Price: High to Low',
                filterSortNameAsc: 'Name: A to Z',
                contactTitle: 'Contact Us',
                contactSubtitle: 'If you have any questions or suggestions, please feel free to contact us',
                contactInfoTitle: 'Contact Information',
                contactInfoText: 'Our team is ready to help you at any time, you can contact us through the following methods',
                contactEmailLabel: 'Email: ',
                contactEmail: 'info@example.com',
                contactPhoneLabel: 'Phone: ',
                contactPhone: '123-456-7890',
                contactAddressLabel: 'Address: ',
                contactAddress: 'Some Building, Chaoyang District, Beijing',
                formNameLabel: 'Name',
                formEmailLabel: 'Email',
                formSubjectLabel: 'Subject',
                formMessageLabel: 'Message',
                formSubmit: 'Send Message',
                footerAbout: 'About Us',
                footerAboutText: 'We are a company focused on high-quality products, dedicated to providing customers with the best products and services.',
                footerLinks: 'Quick Links',
                footerLinkHome: 'Home',
                footerLinkProducts: 'Product Series',
                footerLinkFeatures: 'Features',
                footerLinkContact: 'Contact Us',
                footerLinkAdmin: 'Feature Settings',
                footerLinkConfig: 'Product Management',
                footerContact: 'Contact Information',
                footerEmail: 'Email: info@example.com',
                footerPhone: 'Phone: 123-456-7890',
                footerAddress: 'Address: Some Building, Chaoyang District, Beijing',
                footerSocial: 'Social Media',
                modalTitle: 'Product Details',
                modalClose: 'Close',
                navHome: 'Home',
                navProducts: 'Products',
                navFeatures: 'Features',
                navContact: 'Contact'
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
                featureSettings: '기능 설정',
                heroTitle: '고품질 제품 시리즈',
                heroSubtitle: '우리는 귀하의 다양한 필요를 충족시키기 위해 최고 품질의 제품을 제공합니다',
                heroBtnShop: '지금 구매',
                heroBtnContact: '연락하기',
                featuresTitle: '우리의 특징',
                featuresSubtitle: '왜 우리 제품을 선택해야 합니까',
                featureQuality: '고품질 소재',
                featureQualityDesc: '제품의 내구성과 미관을 보장하기 위해 최고 품질의 소재를 사용합니다',
                featureGlobal: '글로벌 배송',
                featureGlobalDesc: '글로벌 배송을 지원하여 어디서나 우리 제품을 즐길 수 있습니다',
                featureWarranty: '고품질售后 서비스',
                featureWarrantyDesc: '걱정 없는 쇼핑을 위해 종합적인售后 서비스를 제공합니다',
                featureDesign: '패션 디자인',
                featureDesignDesc: '패션 트렌드를 따르며 가장 스타일리시한 제품을 제공합니다',
                featureFast: '빠른 응답',
                featureFastDesc: '고객 요구에 빠르게 응답하고 효율적인 서비스 경험을 제공합니다',
                featureEco: '환경 친화적 개념',
                featureEcoDesc: '환경 친화적 소재와 생산 공정을 채택하여 지속 가능한 개발에 기여합니다',
                searchPlaceholder: '제품 검색...',
                searchButton: '검색',
                filterTitle: '필터 조건',
                filterSeriesLabel: '제품 시리즈',
                filterAll: '모든 시리즈',
                filterPriceLabel: '가격 범위',
                filterPriceAll: '모든 가격',
                filterPriceLow: '0-100',
                filterPriceMedium: '100-500',
                filterPriceHigh: '500+',
                filterSortLabel: '정렬 방식',
                filterSortDefault: '기본 정렬',
                filterSortPriceAsc: '가격: 낮은 순',
                filterSortPriceDesc: '가격: 높은 순',
                filterSortNameAsc: '이름: A-Z',
                contactTitle: '연락처',
                contactSubtitle: '질문이나 제안이 있으시면 언제든지 연락해 주세요',
                contactInfoTitle: '연락 정보',
                contactInfoText: '우리 팀은 언제든지 도와드릴 준비가 되어 있으며 다음 방법으로 연락하실 수 있습니다',
                contactEmailLabel: '이메일: ',
                contactEmail: 'info@example.com',
                contactPhoneLabel: '전화: ',
                contactPhone: '123-456-7890',
                contactAddressLabel: '주소: ',
                contactAddress: '베이징 초양구 몇 번 건물',
                formNameLabel: '이름',
                formEmailLabel: '이메일',
                formSubjectLabel: '주제',
                formMessageLabel: '메시지',
                formSubmit: '메시지 보내기',
                footerAbout: '회사 소개',
                footerAboutText: '우리는 고품질 제품에 집중하는 회사로, 고객에게 최고의 제품과 서비스를 제공하기 위해 노력합니다.',
                footerLinks: '빠른 링크',
                footerLinkHome: '홈',
                footerLinkProducts: '제품 시리즈',
                footerLinkFeatures: '특징',
                footerLinkContact: '연락처',
                footerLinkAdmin: '기능 설정',
                footerLinkConfig: '제품 관리',
                footerContact: '연락 정보',
                footerEmail: '이메일: info@example.com',
                footerPhone: '전화: 123-456-7890',
                footerAddress: '주소: 베이징 초양구 몇 번 건물',
                footerSocial: '소셜 미디어',
                modalTitle: '제품 세부 정보',
                modalClose: '닫기',
                navHome: '홈',
                navProducts: '제품',
                navFeatures: '특징',
                navContact: '연락처'
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
        try {
            if (!lang || typeof lang !== 'string') {
                console.warn('Invalid language code:', lang);
                return;
            }

            if (!this.supportedLanguages.includes(lang)) {
                console.warn('Language not supported:', lang);
                return;
            }

            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            this.updateLanguageUI();

            // 触发语言变化事件
            const event = new CustomEvent('languageChanged', { detail: { language: lang } });
            window.dispatchEvent(event);
        } catch (error) {
            console.error('Error switching language:', error);
        }
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
        try {
            // 使用data-i18n属性自动翻译元素
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                try {
                    const key = element.getAttribute('data-i18n');
                    if (key) {
                        // 处理不同类型的元素
                        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                            // 处理表单元素的placeholder
                            if (element.placeholder) {
                                element.placeholder = this.t(key);
                            } else {
                                element.value = this.t(key);
                            }
                        } else if (element.tagName === 'IMG') {
                            // 处理图片的alt属性
                            element.alt = this.t(key);
                        } else {
                            // 处理其他元素的文本内容
                            element.textContent = this.t(key);
                        }
                    }
                } catch (error) {
                    console.warn('Translation error for element:', element, error);
                }
            });

            // 处理特殊元素
            this.translateSpecialElements();
        } catch (error) {
            console.error('Error translating static elements:', error);
        }
    }

    /**
     * 翻译特殊元素
     */
    translateSpecialElements() {
        try {
            // 搜索输入框
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.placeholder = this.t('searchPlaceholder');
            }

            // 对比栏
            const compareClear = document.getElementById('compare-clear');
            if (compareClear) {
                compareClear.textContent = this.t('clearCompare');
            }

            const compareStart = document.getElementById('compare-start');
            if (compareStart) {
                compareStart.textContent = this.t('startCompare');
            }
        } catch (error) {
            console.warn('Error translating special elements:', error);
        }
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键名
     * @param {string} fallback -  fallback文本
     * @returns {string} 翻译后的文本
     */
    t(key, fallback = '') {
        try {
            if (!key || typeof key !== 'string') {
                return fallback || '';
            }

            if (!this.translations || !this.translations[this.currentLanguage]) {
                return fallback || key;
            }

            return this.translations[this.currentLanguage][key] || fallback;
        } catch (error) {
            console.warn('Error getting translation for key:', key, error);
            return fallback || key;
        }
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