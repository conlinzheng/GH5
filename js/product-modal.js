class ProductModal {
    constructor() {
        this.modal = null;
        this.currentProduct = null;
        this.currentIndex = 0;
        this.productsList = [];
    }

    init() {
        this.createModal();
        this.bindEvents();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'product-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <button class="modal-close">&times;</button>
                <div class="modal-content">
                    <div class="modal-image-section">
                        <div class="main-image-container">
                            <img src="" alt="" class="main-image">
                            <button class="image-nav prev">‹</button>
                            <button class="image-nav next">›</button>
                        </div>
                        <div class="thumbnail-list"></div>
                    </div>
                    <div class="modal-info-section">
                        <h2 class="product-title"></h2>
                        <div class="product-price"></div>
                        <div class="product-description"></div>
                        <div class="product-materials">
                            <h3>材质信息</h3>
                            <div class="materials-grid"></div>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-primary contact-btn">咨询详情</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
    }

    bindEvents() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const overlay = this.modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => this.close());
        overlay.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        const prevBtn = this.modal.querySelector('.image-nav.prev');
        const nextBtn = this.modal.querySelector('.image-nav.next');

        prevBtn.addEventListener('click', () => this.navigate(-1));
        nextBtn.addEventListener('click', () => this.navigate(1));

        const contactBtn = this.modal.querySelector('.contact-btn');
        contactBtn.addEventListener('click', () => {
            if (contactForm) {
                const subject = `咨询: ${this.currentProduct?.name?.zh || ''}`;
                document.getElementById('contact-subject').value = subject;
                this.close();
                document.querySelector('.contact-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    open(seriesId, productId, productData, allProducts) {
        this.productsList = Object.entries(allProducts).map(([id, data]) => ({ id, ...data }));
        this.currentIndex = this.productsList.findIndex(p => p.id === productId);
        this.currentProduct = productData;
        
        this.render();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 更新社交分享
        if (typeof socialShare !== 'undefined') {
            socialShare.setProduct(productData, seriesId);
        }
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    navigate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.productsList.length) % this.productsList.length;
        this.currentProduct = this.productsList[this.currentIndex];
        this.render();
    }

    render() {
        if (!this.currentProduct) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const product = this.currentProduct;

        const mainImage = this.modal.querySelector('.main-image');
        const seriesId = this.findSeriesId(product);
        const mainImageFile = product.images?.find(img => img.isMain) || product.images?.[0];
        const imageUrl = mainImageFile ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(mainImageFile.filename)}` : '';
        mainImage.src = imageUrl;
        mainImage.alt = product.name?.[currentLang] || product.name?.zh || '';

        this.modal.querySelector('.product-title').textContent = 
            product.name?.[currentLang] || product.name?.zh || '';
        
        this.modal.querySelector('.product-price').textContent = product.price ? `价格: ¥${product.price}` : '';
        
        this.modal.querySelector('.product-description').textContent = 
            product.description?.[currentLang] || product.description?.zh || '';

        const materialsGrid = this.modal.querySelector('.materials-grid');
        if (product.materials) {
            materialsGrid.innerHTML = Object.entries(product.materials)
                .map(([key, value]) => `<div class="material-item"><span class="material-label">${this.getMaterialLabel(key)}:</span><span class="material-value">${value}</span></div>`)
                .join('');
        } else {
            materialsGrid.innerHTML = '';
        }
    }

    findSeriesId(product) {
        for (const [seriesId, seriesData] of Object.entries(frontend?.productsData || {})) {
            if (seriesData.products && seriesData.products[product.id]) {
                return seriesId;
            }
        }
        return '';
    }

    getMaterialLabel(key) {
        const labels = {
            'zh': { 'upper': '鞋面', 'lining': '内里', 'sole': '鞋底' },
            'en': { 'upper': 'Upper', 'lining': 'Lining', 'sole': 'Sole' },
            'ko': { 'upper': '신발 상단', 'lining': '안감', 'sole': '밑창' }
        };
        const currentLang = i18n?.currentLanguage || 'zh';
        return labels[currentLang]?.[key] || key;
    }
}

const productModal = new ProductModal();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productModal;
} else {
    window.productModal = productModal;
}
