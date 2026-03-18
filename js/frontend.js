class Frontend {
    constructor() {
        this.productsData = null;
        this.currentSlide = 0;
        this.featureSettings = this.loadFeatureSettings();
    }

    loadFeatureSettings() {
        const defaultSettings = {
            'toggle-backtotop': true,
            'toggle-imagezoom': true,
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
        const saved = localStorage.getItem('site_features');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    isFeatureEnabled(featureKey) {
        return this.featureSettings[featureKey] !== false;
    }

    async init() {
        i18n.init();

        if (this.isFeatureEnabled('toggle-language')) {
            this.initCarousel();
        } else {
            document.querySelector('.language-switcher').style.display = 'none';
        }

        await this.loadProductsData();

        if (productModal) {
            productModal.init();
        }

        if (productSearch && this.isFeatureEnabled('toggle-search')) {
            productSearch.init();
        }

        if (productCompare && this.isFeatureEnabled('toggle-compare')) {
            productCompare.init();
        }

        if (browseHistory && this.isFeatureEnabled('toggle-history')) {
            browseHistory.init();
        }

        if (themeManager && this.isFeatureEnabled('toggle-theme')) {
            themeManager.init();
        }

        if (layoutSwitcher && this.isFeatureEnabled('toggle-layout')) {
            layoutSwitcher.init();
        }

        if (productFilter && this.isFeatureEnabled('toggle-filter')) {
            productFilter.init();
        }

        if (socialShare && this.isFeatureEnabled('toggle-share')) {
            socialShare.init();
        }

        if (backToTop && this.isFeatureEnabled('toggle-backtotop')) {
            backToTop.init();
        }

        if (imageZoom && this.isFeatureEnabled('toggle-imagezoom')) {
            imageZoom.init();
        }

        this.renderProducts();

        if (contactForm && this.isFeatureEnabled('toggle-contact')) {
            contactForm.init();
        }

        if (!this.isFeatureEnabled('toggle-contact')) {
            const contactSection = document.querySelector('.contact-section');
            if (contactSection) contactSection.style.display = 'none';
        }

        window.addEventListener('layoutChanged', () => {
            this.renderProducts();
        });

        window.addEventListener('sortChanged', () => {
            this.renderProducts();
        });

        window.addEventListener('filterChanged', () => {
            this.renderProducts();
        });

        window.addEventListener('languageChanged', () => {
            this.renderProducts();
            if (contactForm && this.isFeatureEnabled('toggle-contact')) {
                contactForm.updateLanguage();
            }
            if (productSearch && this.isFeatureEnabled('toggle-search')) {
                productSearch.updateLanguage();
            }
            if (layoutSwitcher && this.isFeatureEnabled('toggle-layout')) {
                layoutSwitcher.renderLayoutControls();
            }
            if (productFilter && this.isFeatureEnabled('toggle-filter')) {
                productFilter.renderFilterPanel();
            }
        });
    }

    initCarousel() {
        const carousel = document.querySelector('.carousel');
        if (!carousel) return;

        const slides = document.querySelectorAll('.carousel-item');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');

        if (slides.length === 0) return;

        setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % slides.length;
            this.updateCarousel();
        }, 5000);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentSlide = (this.currentSlide - 1 + slides.length) % slides.length;
                this.updateCarousel();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentSlide = (this.currentSlide + 1) % slides.length;
                this.updateCarousel();
            });
        }

        this.updateCarousel();
    }

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

    groupImagesByProduct(filenames) {
        const products = {};
        
        filenames.forEach(filename => {
            const ext = filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
            if (!ext) return;

            const { productName, imageIndex } = this.parseProductName(filename);
            
            if (!products[productName]) {
                products[productName] = {
                    name: { zh: productName, en: productName, ko: productName },
                    description: { zh: `${productName} - 高品质产品`, en: `${productName} - High quality product`, ko: `${productName} - 고품질 제품` },
                    price: '',
                    images: []
                };
            }
            
            products[productName].images.push({
                filename: filename,
                isMain: imageIndex === 1
            });
        });

        Object.values(products).forEach(product => {
            product.images.sort((a, b) => a.imageIndex - b.imageIndex);
        });

        return products;
    }

    async loadProductsData() {
        const container = document.getElementById('product-series');
        if (!container) return;

        container.innerHTML = '<div class="loading">加载产品数据中...</div>';

        try {
            const cachedData = cacheManager.get('products_data');
            const cacheVersion = localStorage.getItem('products_data_version');
            if (cachedData && Object.keys(cachedData).length > 0 && cacheVersion === 'v3') {
                this.productsData = cachedData;
                return;
            }

            const seriesList = await githubAPI.fetchDirectory('产品图');
            const productsData = {};

            for (const series of seriesList) {
                if (series.type === 'dir') {
                    const seriesId = series.name;
                    try {
                        const files = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
                        const imageFiles = files.filter(f => 
                            f.type === 'file' && 
                            /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name) &&
                            f.name !== 'products.json'
                        );
                        
                        const groupedProducts = this.groupImagesByProduct(imageFiles.map(f => f.name));
                        
                        const seriesNumber = seriesId.split('-')[0] || '';
                        const seriesName = seriesId.split('-').slice(1).join('-') || seriesId;
                        
                        productsData[seriesId] = {
                            seriesName: {
                                zh: seriesName,
                                en: seriesName,
                                ko: seriesName
                            },
                            products: groupedProducts
                        };
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

            if (Object.keys(productsData).length > 0) {
                cacheManager.set('products_data', productsData);
                localStorage.setItem('products_data_version', 'v3');
                this.productsData = productsData;
            } else {
                container.innerHTML = '<div class="error">未找到产品数据</div>';
            }
        } catch (error) {
            console.error('Error loading products data:', error);
            container.innerHTML = '<div class="error">加载产品数据失败，请刷新页面重试<br><small>' + error.message + '</small></div>';
        }
    }

    renderProducts() {
        const container = document.getElementById('product-series');
        if (!container || !this.productsData) return;

        container.innerHTML = '';

        const sortedSeries = Object.keys(this.productsData).sort((a, b) => {
            const numA = parseInt(a.split('-')[0]) || 0;
            const numB = parseInt(b.split('-')[0]) || 0;
            return numA - numB;
        });

        sortedSeries.forEach(seriesId => {
            const seriesData = this.productsData[seriesId];
            
            let productsToFilter = seriesData.products || {};
            
            if (productFilter && productFilter.hasActiveFilters()) {
                const filters = productFilter.getActiveFilters();
                productsToFilter = Object.fromEntries(
                    productFilter.filterProducts(seriesData.products || {}, filters)
                );
            }
            
            let sortedProducts = productsToFilter;
            if (layoutSwitcher) {
                sortedProducts = layoutSwitcher.sortProducts(sortedProducts);
            }
            
            const seriesElement = this.createSeriesElement(seriesId, seriesData, sortedProducts);
            container.appendChild(seriesElement);
        });

        this.initLazyLoad();
    }

    createSeriesElement(seriesId, seriesData, products = null) {
        const seriesDiv = document.createElement('div');
        seriesDiv.className = 'product-series';

        const seriesTitle = document.createElement('h3');
        seriesTitle.textContent = i18n.getLocalizedField(seriesData, 'seriesName');
        seriesDiv.appendChild(seriesTitle);

        const productsWrapper = document.createElement('div');
        productsWrapper.className = 'products-wrapper';

        const productsContainer = document.createElement('div');
        productsContainer.className = 'products-container';

        const productsToRender = products || seriesData.products || {};
        const productCount = Object.keys(productsToRender).length;
        
        if (productCount >= 8) {
            productsContainer.className = 'products-container multi-row';
        } else {
            productsContainer.className = 'products-container single-row';
        }
        
        Object.keys(productsToRender).forEach(productId => {
            const productData = productsToRender[productId];
            const productCard = this.createProductCard(seriesId, productId, productData);
            productsContainer.appendChild(productCard);
        });

        productsWrapper.appendChild(productsContainer);

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

    createProductCard(seriesId, productId, productData) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        const mainImage = productData.images?.find(img => img.isMain) || productData.images?.[0];
        const imageUrl = mainImage 
            ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(mainImage.filename)}`
            : '';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = i18n.getLocalizedField(productData, 'name');
        img.dataset.src = imageUrl;
        imageDiv.appendChild(img);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'product-info';

        const name = document.createElement('h4');
        name.textContent = i18n.getLocalizedField(productData, 'name');
        infoDiv.appendChild(name);

        const description = document.createElement('p');
        description.textContent = i18n.getLocalizedField(productData, 'description');
        infoDiv.appendChild(description);

        if (productData.price) {
            const price = document.createElement('div');
            price.className = 'product-price';
            price.textContent = `价格: ${productData.price}`;
            infoDiv.appendChild(price);
        }

        if (productData.images && productData.images.length > 1) {
            const imageCount = document.createElement('div');
            imageCount.className = 'image-count';
            imageCount.textContent = `${productData.images.length}张图片`;
            infoDiv.appendChild(imageCount);
        }

        card.appendChild(imageDiv);
        card.appendChild(infoDiv);

        const compareBtn = document.createElement('button');
        compareBtn.className = 'compare-btn';
        compareBtn.innerHTML = '⚖';
        compareBtn.title = i18n.t('compare') || '添加到对比';
        compareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const product = { id: productId, seriesId, ...productData };
            if (productCompare) {
                productCompare.toggle(product);
                this.updateCompareButton(compareBtn, productId);
            }
        });
        card.appendChild(compareBtn);

        setTimeout(() => {
            if (productCompare && this.isFeatureEnabled('toggle-compare')) {
                this.updateCompareButton(compareBtn, productId);
            } else {
                compareBtn.style.display = 'none';
            }
        }, 100);

        card.addEventListener('click', () => {
            if (productModal) {
                const allProducts = this.productsData[seriesId]?.products || {};
                productModal.open(seriesId, productId, { id: productId, seriesId, ...productData }, allProducts);
                
                if (browseHistory && this.isFeatureEnabled('toggle-history')) {
                    browseHistory.add({ id: productId, seriesId, ...productData });
                }
            }
        });

        return card;
    }

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
            lazyImages.forEach(image => {
                image.src = image.dataset.src;
                image.classList.add('loaded');
            });
        }
    }

    updateCompareButton(btn, productId) {
        if (!productCompare) return;
        
        if (productCompare.isInCompare(productId)) {
            btn.classList.add('in-compare');
            btn.title = i18n.t('removeCompare') || '取消对比';
        } else {
            btn.classList.remove('in-compare');
            btn.title = i18n.t('compare') || '添加到对比';
        }

        const compareBar = document.getElementById('compare-bar');
        if (compareBar) {
            if (productCompare.compareList.length > 0) {
                compareBar.classList.add('active');
            } else {
                compareBar.classList.remove('active');
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const frontend = new Frontend();
    window.frontend = frontend;
    await frontend.init();
});