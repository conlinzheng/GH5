class Frontend {
    constructor() {
        this.productsData = null;
        this.currentSlide = 0;
    }

    async init() {
        i18n.init();
        this.initCarousel();
        await this.loadProductsData();

        if (productModal) {
            productModal.init();
        }

        if (productSearch) {
            productSearch.init();
        }

        if (productCompare) {
            productCompare.init();
        }

        if (browseHistory) {
            browseHistory.init();
        }

        if (themeManager) {
            themeManager.init();
        }

        if (layoutSwitcher) {
            layoutSwitcher.init();
        }

        if (productFilter) {
            productFilter.init();
        }

        this.renderProducts();

        if (contactForm) {
            contactForm.init();
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
            if (contactForm) {
                contactForm.updateLanguage();
            }
            if (productSearch) {
                productSearch.updateLanguage();
            }
            if (layoutSwitcher) {
                layoutSwitcher.renderLayoutControls();
            }
            if (productFilter) {
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

    async loadProductsData() {
        const container = document.getElementById('product-series');
        if (!container) return;

        container.innerHTML = '<div class="loading">加载产品数据中...</div>';

        try {
            const cachedData = cacheManager.get('products_data');
            if (cachedData) {
                this.productsData = cachedData;
                return;
            }

            const seriesList = await githubAPI.fetchDirectory('产品图');
            const productsData = {};

            for (const series of seriesList) {
                if (series.type === 'dir') {
                    const seriesId = series.name;
                    try {
                        const productsJson = await githubAPI.fetchFile(`产品图/${seriesId}/products.json`);
                        const seriesData = JSON.parse(productsJson.content);
                        productsData[seriesId] = seriesData;
                    } catch (error) {
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

            cacheManager.set('products_data', productsData);
            this.productsData = productsData;
        } catch (error) {
            console.error('Error loading products data:', error);
            container.innerHTML = '<div class="error">加载产品数据失败，请刷新页面重试</div>';
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
        
        Object.keys(productsToRender).forEach(productId => {
            const productData = productsToRender[productId];
            const productCard = this.createProductCard(seriesId, productId, productData);
            productsContainer.appendChild(productCard);
        });

        productsWrapper.appendChild(productsContainer);

        const prevBtn = document.createElement('button');
        prevBtn.className = 'series-nav prev';
        prevBtn.textContent = '‹';
        prevBtn.addEventListener('click', () => {
            productsContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });

        const nextBtn = document.createElement('button');
        nextBtn.className = 'series-nav next';
        nextBtn.textContent = '›';
        nextBtn.addEventListener('click', () => {
            productsContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });

        productsWrapper.appendChild(prevBtn);
        productsWrapper.appendChild(nextBtn);
        seriesDiv.appendChild(productsWrapper);

        return seriesDiv;
    }

    createProductCard(seriesId, productId, productData) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'product-image';

        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${seriesId}/${productId}`;
        img.alt = i18n.getLocalizedField(productData, 'name');
        img.dataset.src = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${seriesId}/${productId}`;
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
            if (productCompare) {
                this.updateCompareButton(compareBtn, productId);
            }
        }, 100);

        card.addEventListener('click', () => {
            if (productModal) {
                const allProducts = this.productsData[seriesId]?.products || {};
                productModal.open(seriesId, productId, { id: productId, seriesId, ...productData }, allProducts);
                
                if (browseHistory) {
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
    await frontend.init();
});