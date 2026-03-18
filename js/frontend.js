/**
 * Frontend 类 - 负责网站前端核心功能
 * 包括产品数据加载、渲染、模块初始化等
 */
class Frontend {
    constructor() {
        this.productsData = null;
        this.currentSlide = 0;
        this.featureSettings = this.loadFeatureSettings();
        this.initEventListeners();
    }

    /**
     * 加载功能设置
     * @returns {Object} 功能设置对象
     */
    loadFeatureSettings() {
        const defaultSettings = {
            'toggle-backtotop': true,
            'toggle-imagezoom': true,
            'toggle-modal': true,
            'toggle-search': true,
            'toggle-compare': true,
            'toggle-history': true,
            'toggle-filter': true,
            'toggle-layout': true,
            'toggle-share': true,
            'toggle-theme': true,
            'toggle-language': true,
            'toggle-contact': true
        };
        
        try {
            const saved = localStorage.getItem('site_features');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading feature settings:', error);
            return defaultSettings;
        }
    }

    /**
     * 检查功能是否启用
     * @param {string} featureKey 功能键
     * @returns {boolean} 是否启用
     */
    isFeatureEnabled(featureKey) {
        return this.featureSettings[featureKey] !== false;
    }

    /**
     * 初始化前端功能
     */
    async init() {
        try {
            // 初始化多语言支持
            i18n.init();
            
            // 初始化轮播图（如果语言功能启用）
            if (this.isFeatureEnabled('toggle-language')) {
                this.initCarousel();
            } else {
                const languageSwitcher = document.querySelector('.language-switcher');
                if (languageSwitcher) languageSwitcher.style.display = 'none';
            }

            // 加载产品数据
            await this.loadProductsData();
            
            // 初始化模块
            this.initModules();
            
            // 渲染产品
            this.renderProducts();
        } catch (error) {
            console.error('Error initializing frontend:', error);
            this.showErrorMessage('初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化模块
     */
    initModules() {
        const modules = [
            { name: 'productModal', feature: 'toggle-modal' },
            { name: 'productSearch', feature: 'toggle-search' },
            { name: 'productCompare', feature: 'toggle-compare' },
            { name: 'browseHistory', feature: 'toggle-history' },
            { name: 'themeManager', feature: 'toggle-theme' },
            { name: 'layoutSwitcher', feature: 'toggle-layout' },
            { name: 'productFilter', feature: 'toggle-filter' },
            { name: 'socialShare', feature: 'toggle-share' },
            { name: 'backToTop', feature: 'toggle-backtotop' },
            { name: 'imageZoom', feature: 'toggle-imagezoom' },
            { name: 'contactForm', feature: 'toggle-contact' }
        ];

        modules.forEach(({ name, feature }) => {
            if (window[name] && (!feature || this.isFeatureEnabled(feature))) {
                try {
                    window[name].init();
                } catch (error) {
                    console.error(`Error initializing ${name}:`, error);
                }
            }
        });

        // 如果联系表单功能未启用，隐藏联系部分
        if (!this.isFeatureEnabled('toggle-contact')) {
            const contactSection = document.querySelector('.contact-section');
            if (contactSection) contactSection.style.display = 'none';
        }
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        window.addEventListener('layoutChanged', () => this.renderProducts());
        window.addEventListener('sortChanged', () => this.renderProducts());
        window.addEventListener('filterChanged', () => this.renderProducts());
        window.addEventListener('languageChanged', () => this.handleLanguageChange());
    }

    /**
     * 处理语言变化
     */
    handleLanguageChange() {
        // 重新渲染产品
        this.renderProducts();
        
        // 更新各模块的语言
        if (window.contactForm && this.isFeatureEnabled('toggle-contact')) {
            contactForm.updateLanguage();
        }
        if (window.productSearch && this.isFeatureEnabled('toggle-search')) {
            productSearch.updateLanguage();
        }
        if (window.layoutSwitcher && this.isFeatureEnabled('toggle-layout')) {
            layoutSwitcher.renderLayoutControls();
        }
        if (window.productFilter && this.isFeatureEnabled('toggle-filter')) {
            productFilter.renderFilterPanel();
        }
    }

    /**
     * 初始化轮播图
     */
    initCarousel() {
        const carousel = document.querySelector('.carousel');
        if (!carousel) return;

        const slides = document.querySelectorAll('.carousel-item');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (slides.length === 0) return;

        // 自动轮播
        setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % slides.length;
            this.updateCarousel();
        }, 5000);

        // 上一张按钮
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
                this.updateCarousel();
            });
        }

        // 下一张按钮
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentSlide = (this.currentSlide + 1) % slides.length;
                this.updateCarousel();
            });
        }

        // 初始化轮播状态
        this.updateCarousel();
    }

    /**
     * 更新轮播图状态
     */
    updateCarousel() {
        const slides = document.querySelectorAll('.carousel-item');
        slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    /**
     * 解析产品名称
     * @param {string} filename 文件名
     * @returns {Object} 产品名称和图片索引
     */
    parseProductName(filename) {
        const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
        const match = nameWithoutExt.match(/^(.+)\s*\((\d+)\)$/);
        if (match) {
            return {
                productName: match[1].trim(),
                imageIndex: parseInt(match[2])
            };
        }
        return {
            productName: nameWithoutExt,
            imageIndex: 1
        };
    }

    /**
     * 按产品分组图片
     * @param {Array} filenames 文件名数组
     * @returns {Object} 按产品分组的图片
     */
    groupImagesByProduct(filenames) {
        const products = {};
        
        filenames.forEach(filename => {
            const ext = filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
            if (!ext) return;

            const { productName, imageIndex } = this.parseProductName(filename);
            
            if (!products[productName]) {
                products[productName] = {
                    name: { zh: productName, en: productName, ko: productName },
                    description: { 
                        zh: `${productName} - 高品质产品`, 
                        en: `${productName} - High quality product`, 
                        ko: `${productName} - 고품질 제품` 
                    },
                    price: '',
                    images: []
                };
            }
            
            products[productName].images.push({
                filename: filename,
                isMain: imageIndex === 1
            });
        });

        // 按图片索引排序
        Object.values(products).forEach(product => {
            product.images.sort((a, b) => a.imageIndex - b.imageIndex);
        });

        return products;
    }

    /**
     * 加载产品数据
     */
    async loadProductsData() {
        const container = document.getElementById('product-series');
        if (!container) return;

        container.innerHTML = '<div class="loading">加载产品数据中...</div>';

        try {
            // 尝试从缓存加载
            const cachedData = cacheManager.get('products_data');
            const cacheVersion = localStorage.getItem('products_data_version');
            if (cachedData && Object.keys(cachedData).length > 0 && cacheVersion === 'v3') {
                this.productsData = cachedData;
                return;
            }

            // 从GitHub API加载数据
            const seriesList = await githubAPI.fetchDirectory('产品图');
            const productsData = await this.fetchSeriesData(seriesList);

            if (Object.keys(productsData).length > 0) {
                cacheManager.set('products_data', productsData);
                localStorage.setItem('products_data_version', 'v3');
                this.productsData = productsData;
            } else {
                this.useLocalTestData();
            }
        } catch (error) {
            console.error('Error loading products data:', error);
            this.useLocalTestData();
        }
    }

    /**
     * 获取系列数据
     * @param {Array} seriesList 系列列表
     * @returns {Object} 产品数据
     */
    async fetchSeriesData(seriesList) {
        const productsData = {};

        for (const series of seriesList) {
            if (series.type === 'dir') {
                const seriesId = series.name;
                try {
                    const files = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
                    
                    // 优先读取 products.json
                    const productsJsonFile = files.find(f => f.name === 'products.json');
                    let seriesData;
                    
                    if (productsJsonFile) {
                        // 存在 products.json，读取其中的数据
                        const productsJson = await githubAPI.fetchFile(`产品图/${seriesId}/products.json`);
                        seriesData = JSON.parse(productsJson.content);
                    } else {
                        // 不存在 products.json，从图片文件名生成
                        const imageFiles = files.filter(f => 
                            f.type === 'file' && 
                            /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
                        );
                        
                        const groupedProducts = this.groupImagesByProduct(imageFiles.map(f => f.name));
                        
                        const seriesNumber = seriesId.split('-')[0] || '';
                        const seriesName = seriesId.split('-').slice(1).join('-') || seriesId;
                        
                        seriesData = {
                            seriesName: {
                                zh: seriesName,
                                en: seriesName,
                                ko: seriesName
                            },
                            products: groupedProducts
                        };
                    }
                    
                    productsData[seriesId] = seriesData;
                } catch (error) {
                    console.error(`Error loading series ${seriesId}:`, error);
                    productsData[seriesId] = {
                        seriesName: {
                            zh: seriesId.split('-')[1] || seriesId,
                            en: seriesId.split('-')[1] || seriesId,
                            ko: seriesId.split('-')[1] || seriesId
                        },
                        products: {}
                    };
                }
            }
        }

        return productsData;
    }

    /**
     * 使用本地测试数据
     */
    useLocalTestData() {
        // 使用本地测试数据
        const localData = {
            '1-PU系列': {
                seriesName: {
                    zh: 'PU系列',
                    en: 'PU Series',
                    ko: 'PU 시리즈'
                },
                products: {
                    '产品1': {
                        name: {
                            zh: '产品1',
                            en: 'Product 1',
                            ko: '제품 1'
                        },
                        description: {
                            zh: '产品1 - 高品质产品',
                            en: 'Product 1 - High quality product',
                            ko: '제품 1 - 고품질 제품'
                        },
                        price: '',
                        images: [
                            {
                                filename: '产品1 (1).jpg',
                                isMain: true
                            },
                            {
                                filename: '产品1 (2).jpg',
                                isMain: false
                            }
                        ]
                    }
                }
            },
            '2-真皮系列': {
                seriesName: {
                    zh: '真皮系列',
                    en: 'Leather Series',
                    ko: '가죽 시리즈'
                },
                products: {
                    '中文数字123': {
                        name: {
                            zh: '中文数字123',
                            en: 'Chinese Number 123',
                            ko: '중국어 숫자 123'
                        },
                        description: {
                            zh: '中文数字123 - 高品质产品',
                            en: 'Chinese Number 123 - High quality product',
                            ko: '중국어 숫자 123 - 고품질 제품'
                        },
                        price: '',
                        images: [
                            {
                                filename: '中文数字123 (1).png',
                                isMain: true
                            },
                            {
                                filename: '中文数字123 (2).png',
                                isMain: false
                            }
                        ]
                    }
                }
            }
        };
        
        this.productsData = localData;
        cacheManager.set('products_data', localData);
        localStorage.setItem('products_data_version', 'v3');
    }

    /**
     * 渲染产品
     */
    renderProducts() {
        const container = document.getElementById('product-series');
        if (!container || !this.productsData) return;

        container.className = 'product-series-container';
        
        // 应用布局设置
        if (window.layoutSwitcher) {
            layoutSwitcher.applyLayout();
        }
        
        container.innerHTML = '';

        // 按系列编号排序
        const sortedSeries = Object.keys(this.productsData).sort((a, b) => {
            const numA = parseInt(a.split('-')[0]) || 0;
            const numB = parseInt(b.split('-')[0]) || 0;
            return numA - numB;
        });

        // 渲染每个系列
        sortedSeries.forEach(seriesId => {
            const seriesData = this.productsData[seriesId];
            
            let productsToFilter = seriesData.products || {};
            
            // 应用筛选
            if (window.productFilter && productFilter.hasActiveFilters()) {
                const filters = productFilter.getActiveFilters();
                productsToFilter = Object.fromEntries(
                    productFilter.filterProducts(seriesData.products || {}, filters)
                );
            }
            
            // 应用排序
            let sortedProducts = productsToFilter;
            if (window.layoutSwitcher) {
                sortedProducts = layoutSwitcher.sortProducts(sortedProducts);
            }
            
            // 创建系列元素
            const seriesElement = this.createSeriesElement(seriesId, seriesData, sortedProducts);
            container.appendChild(seriesElement);
        });

        // 初始化图片懒加载
        this.initLazyLoad();
    }

    /**
     * 创建系列元素
     * @param {string} seriesId 系列ID
     * @param {Object} seriesData 系列数据
     * @param {Object} products 产品数据
     * @returns {HTMLElement} 系列元素
     */
    createSeriesElement(seriesId, seriesData, products = null) {
        const seriesDiv = document.createElement('div');
        seriesDiv.className = 'product-series';

        // 系列标题
        const seriesTitle = document.createElement('h3');
        seriesTitle.textContent = i18n.getLocalizedField(seriesData, 'seriesName');
        seriesDiv.appendChild(seriesTitle);

        const productsWrapper = document.createElement('div');
        productsWrapper.className = 'products-wrapper';

        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-container';

        const productsToRender = products || seriesData.products || {};
        const productCount = Object.keys(productsToRender).length;
        
        // 根据产品数量设置布局
        if (productCount >= 8) {
            productsContainer.className = 'products-container multi-row';
        } else {
            productsContainer.className = 'products-container single-row';
        }
        
        // 渲染每个产品
        Object.keys(productsToRender).forEach(productId => {
            const productData = productsToRender[productId];
            const productCard = this.createProductCard(seriesId, productId, productData);
            productsContainer.appendChild(productCard);
        });

        productsWrapper.appendChild(productsContainer);

        // 添加导航按钮（如果产品数量超过10个）
        if (productCount > 10) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'series-nav prev';
            prevBtn.textContent = '‹';
            prevBtn.addEventListener('click', () => {
                productsContainer.scrollBy({ left: -500, behavior: 'smooth' });
            });
            productsWrapper.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'series-nav next';
            nextBtn.textContent = '›';
            nextBtn.addEventListener('click', () => {
                productsContainer.scrollBy({ left: 500, behavior: 'smooth' });
            });
            productsWrapper.appendChild(nextBtn);
        }

        seriesDiv.appendChild(productsWrapper);

        return seriesDiv;
    }

    /**
     * 创建产品卡片
     * @param {string} seriesId 系列ID
     * @param {string} productId 产品ID
     * @param {Object} productData 产品数据
     * @returns {HTMLElement} 产品卡片元素
     */
    createProductCard(seriesId, productId, productData) {
        const card = document.createElement('div');
        card.className = 'product-card';

        // 图片部分
        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        // 获取主图
        const mainImage = productData.images?.find(img => img.isMain) || productData.images?.[0];
        const imageUrl = mainImage 
            ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(mainImage.filename)}`
            : '';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = i18n.getLocalizedField(productData, 'name');
        img.dataset.src = imageUrl;
        imageDiv.appendChild(img);

        // 信息部分
        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        const name = document.createElement('h4');
        name.textContent = i18n.getLocalizedField(productData, 'name');
        infoDiv.appendChild(name);

        const description = document.createElement('p');
        description.textContent = i18n.getLocalizedField(productData, 'description');
        infoDiv.appendChild(description);

        // 价格（如果有）
        if (productData.price) {
            const price = document.createElement('div');
            price.className = 'product-price';
            price.textContent = `价格: ${productData.price}`;
            infoDiv.appendChild(price);
        }

        // 图片数量（如果有多张）
        if (productData.images && productData.images.length > 1) {
            const imageCount = document.createElement('div');
            imageCount.className = 'image-count';
            imageCount.textContent = `${productData.images.length}张图片`;
            infoDiv.appendChild(imageCount);
        }

        card.appendChild(imageDiv);
        card.appendChild(infoDiv);

        // 添加对比按钮
        const compareBtn = document.createElement('button');
        compareBtn.className = 'compare-btn';
        compareBtn.innerHTML = '⚖';
        compareBtn.title = i18n.t('compare') || '添加到对比';
        compareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = { id: productId, seriesId, ...productData };
            if (window.productCompare) {
                productCompare.toggle(product);
                this.updateCompareButton(compareBtn, productId);
            }
        });
        card.appendChild(compareBtn);

        // 延迟更新对比按钮状态
        setTimeout(() => {
            if (window.productCompare && this.isFeatureEnabled('toggle-compare')) {
                this.updateCompareButton(compareBtn, productId);
            } else {
                compareBtn.style.display = 'none';
            }
        }, 100);

        // 为整个卡片添加点击事件
        card.addEventListener('click', () => {
            if (window.productModal) {
                const allProducts = this.productsData[seriesId]?.products || {};
                productModal.open(seriesId, productId, { id: productId, seriesId, ...productData }, allProducts);
                
                // 添加到浏览历史
                if (window.browseHistory && this.isFeatureEnabled('toggle-history')) {
                    browseHistory.add({ id: productId, seriesId, ...productData });
                }
            }
        });

        // 确保图片点击也能触发卡片点击事件
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            card.click();
        });

        // 确保图片容器点击也能触发卡片点击事件
        imageDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            card.click();
        });

        return card;
    }

    /**
     * 初始化图片懒加载
     */
    initLazyLoad() {
        const lazyImages = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.add('loaded');
                        imageObserver.unobserve(image);
                    }
                });
            });

            lazyImages.forEach(image => {
                imageObserver.observe(image);
            });
        } else {
            // 降级方案：直接加载所有图片
            lazyImages.forEach(image => {
                image.src = image.dataset.src;
                image.classList.add('loaded');
            });
        }
    }

    /**
     * 更新对比按钮状态
     * @param {HTMLElement} btn 对比按钮
     * @param {string} productId 产品ID
     */
    updateCompareButton(btn, productId) {
        if (!window.productCompare) return;
        
        if (productCompare.isInCompare(productId)) {
            btn.classList.add('in-compare');
            btn.title = i18n.t('removeCompare') || '取消对比';
        } else {
            btn.classList.remove('in-compare');
            btn.title = i18n.t('compare') || '添加到对比';
        }

        // 更新对比栏状态
        const compareBar = document.getElementById('compare-bar');
        if (compareBar) {
            if (productCompare.compareList.length > 0) {
                compareBar.classList.add('active');
            } else {
                compareBar.classList.remove('active');
            }
        }
    }

    /**
     * 显示错误信息
     * @param {string} message 错误信息
     */
    showErrorMessage(message) {
        const container = document.getElementById('product-series');
        if (container) {
            container.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }
}

// 初始化Frontend
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const frontend = new Frontend();
        window.frontend = frontend;
        await frontend.init();
    } catch (error) {
        console.error('Error initializing Frontend:', error);
        // 显示用户友好的错误信息
        const container = document.getElementById('product-series');
        if (container) {
            container.innerHTML = '<div class="error-message">网站初始化失败，请刷新页面重试</div>';
        }
    }
});