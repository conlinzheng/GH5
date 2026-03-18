class ProductModal {
    constructor() {
        this.modal = null;
        this.currentProduct = null;
        this.currentSeries = null;
        this.currentSeriesName = '';
        this.currentLightboxImages = [];
        this.currentLightboxIndex = 0;
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
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                
                <div class="modal-body">
                    <!-- 左侧图片 -->
                    <div class="modal-images">
                        <div class="main-image-container">
                            <img id="modal-main-image" src="" alt="">
                            <div class="zoom-hint">点击查看大图</div>
                        </div>
                        <div class="modal-gallery" id="modal-gallery">
                            <!-- 相关图片将动态加载 -->
                        </div>
                    </div>

                    <!-- 右侧信息 -->
                    <div class="modal-info">
                        <div class="modal-series" id="modal-series"></div>
                        <h2 id="modal-product-name"></h2>
                        <p class="modal-description" id="modal-description"></p>
                        
                        <!-- 产品详细信息 -->
                        <div class="product-specs">
                            <div class="spec-item">
                                <span class="spec-label">鞋面材质：</span>
                                <span class="spec-value" id="spec-upper"></span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">内里材质：</span>
                                <span class="spec-value" id="spec-inner"></span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">鞋底材质：</span>
                                <span class="spec-value" id="spec-sole"></span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">起订量：</span>
                                <span class="spec-value" id="spec-moq"></span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">交货周期：</span>
                                <span class="spec-value" id="spec-delivery"></span>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button class="contact-btn">联系我们</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 灯箱 -->
            <div class="lightbox" id="lightbox">
                <div class="lightbox-content">
                    <span class="close-lightbox">&times;</span>
                    <button class="lightbox-nav lightbox-prev">❮</button>
                    <img class="lightbox-image" id="lightbox-image" src="" alt="">
                    <button class="lightbox-nav lightbox-next">❯</button>
                    <div class="lightbox-counter" id="lightbox-counter"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.addModalStyles();
    }

    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 产品弹窗 */
            .product-modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                overflow-y: auto;
                padding: 20px;
            }
            
            .modal-content {
                background-color: #fff;
                max-width: 1200px;
                margin: 20px auto;
                border-radius: 8px;
                overflow: hidden;
                position: relative;
            }
            
            .modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background-color: rgba(255, 255, 255, 0.9);
                color: #000;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 30px;
                line-height: 1;
                cursor: pointer;
                z-index: 10001;
                transition: background-color 0.3s;
            }
            
            .modal-close:hover {
                background-color: #fff;
            }
            
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                padding: 60px;
            }
            
            .modal-images {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .main-image-container {
                position: relative;
                border-radius: 8px;
                overflow: hidden;
                background-color: #f5f5f5;
            }
            
            .main-image-container img {
                width: 100%;
                height: auto;
                cursor: pointer;
                display: block;
            }
            
            .main-image-container img:hover {
                opacity: 0.95;
            }
            
            .zoom-hint {
                position: absolute;
                bottom: 20px;
                left: 20px;
                background-color: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                pointer-events: none;
            }
            
            .modal-gallery {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }
            
            .modal-gallery-item {
                position: relative;
                aspect-ratio: 1;
                border-radius: 4px;
                overflow: hidden;
                cursor: pointer;
                background-color: #f5f5f5;
            }
            
            .gallery-thumb {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: opacity 0.3s;
            }
            
            .gallery-thumb:hover {
                opacity: 0.8;
            }
            
            .gallery-thumb-label {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 4px;
                text-align: center;
                font-size: 11px;
            }
            
            .modal-info {
                display: flex;
                flex-direction: column;
            }
            
            .modal-series {
                display: inline-block;
                background-color: #f5f5f5;
                color: #666;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                margin-bottom: 15px;
                width: fit-content;
            }
            
            .modal-info h2 {
                font-size: 32px;
                font-weight: 300;
                margin-bottom: 20px;
                color: #000;
            }
            
            .modal-description {
                font-size: 16px;
                line-height: 1.8;
                color: #666;
                margin-bottom: 30px;
            }
            
            .product-specs {
                background-color: #f9f9f9;
                padding: 25px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .spec-item {
                display: flex;
                padding: 12px 0;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .spec-item:last-child {
                border-bottom: none;
            }
            
            .spec-label {
                font-weight: 500;
                color: #333;
                min-width: 120px;
            }
            
            .spec-value {
                color: #666;
                flex: 1;
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
                margin-top: auto;
            }
            
            .modal-actions .contact-btn {
                background-color: #000;
                color: #fff;
                border: none;
                padding: 15px 30px;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
                flex: 1;
            }
            
            .modal-actions .contact-btn:hover {
                background-color: #333;
            }
            
            /* 灯箱样式 */
            .lightbox {
                display: none;
                position: fixed;
                z-index: 20000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .lightbox-image {
                max-width: 100%;
                max-height: 90vh;
                object-fit: contain;
                border-radius: 8px;
                display: block;
            }
            
            .close-lightbox {
                position: absolute;
                top: -50px;
                right: 0;
                color: #fff;
                font-size: 40px;
                font-weight: bold;
                cursor: pointer;
                transition: color 0.3s;
            }
            
            .close-lightbox:hover {
                color: #999;
            }
            
            .lightbox-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background-color: rgba(255, 255, 255, 0.3);
                color: #fff;
                border: none;
                font-size: 40px;
                padding: 20px 10px;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 20001;
                user-select: none;
            }
            
            .lightbox-nav:hover {
                background-color: rgba(255, 255, 255, 0.5);
                color: #fff;
            }
            
            .lightbox-prev {
                left: 10px;
            }
            
            .lightbox-next {
                right: 10px;
            }
            
            .lightbox-counter {
                position: absolute;
                bottom: -40px;
                left: 50%;
                transform: translateX(-50%);
                color: #fff;
                font-size: 14px;
                font-weight: 500;
            }
            
            /* 响应式 - 产品弹窗 */
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                    gap: 30px;
                    padding: 30px;
                }
                
                .modal-gallery {
                    grid-template-columns: repeat(4, 1fr);
                }
                
                .modal-info h2 {
                    font-size: 24px;
                }
                
                .product-specs {
                    padding: 20px;
                }
                
                .spec-item {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
            }
            
            @media (max-width: 480px) {
                .modal-content {
                    margin: 10px;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .modal-gallery {
                    grid-template-columns: repeat(3, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const modal = this.modal;

        closeBtn.addEventListener('click', () => this.close());
        
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') {
                this.close();
            }
        });

        const mainImage = this.modal.querySelector('#modal-main-image');
        mainImage.addEventListener('click', (e) => {
            this.openLightbox(e.target.src);
        });

        const contactBtn = this.modal.querySelector('.contact-btn');
        contactBtn.addEventListener('click', () => {
            this.close();
            const contactSection = document.querySelector('.contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });

        const lightbox = this.modal.querySelector('.lightbox');
        const lightboxClose = lightbox.querySelector('.close-lightbox');
        const lightboxOverlay = lightbox;
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');

        lightboxClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeLightbox();
        });

        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) {
                this.closeLightbox();
            }
        });

        lightboxPrev.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigateLightbox(-1);
        });

        lightboxNext.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.navigateLightbox(1);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.closeLightbox();
            }
        });
    }

    open(seriesId, productId, productData, allProducts) {
        this.currentSeries = seriesId;
        this.currentProduct = productData;
        
        // 获取系列名称
        for (const [sId, sData] of Object.entries(window.frontend?.productsData || {})) {
            if (sId === seriesId) {
                this.currentSeriesName = sData.name?.[i18n?.currentLanguage || 'zh'] || sData.name || '';
                break;
            }
        }
        
        this.render();
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.closeLightbox();
    }

    openLightbox(src) {
        const lightbox = this.modal.querySelector('.lightbox');
        const lightboxImage = this.modal.querySelector('#lightbox-image');
        
        if (lightbox && lightboxImage) {
            lightboxImage.src = src;
            lightbox.style.display = 'flex';
            
            // 设置灯箱图片列表
            this.currentLightboxImages = this.getProductImages();
            this.currentLightboxIndex = this.currentLightboxImages.indexOf(src);
            
            this.updateLightboxCounter();
        }
    }

    closeLightbox() {
        const lightbox = this.modal.querySelector('.lightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
        }
    }

    navigateLightbox(direction) {
        if (this.currentLightboxImages.length === 0) return;

        this.currentLightboxIndex += direction;

        // 循环切换
        if (this.currentLightboxIndex < 0) {
            this.currentLightboxIndex = this.currentLightboxImages.length - 1;
        } else if (this.currentLightboxIndex >= this.currentLightboxImages.length) {
            this.currentLightboxIndex = 0;
        }

        const lightboxImage = this.modal.querySelector('#lightbox-image');
        if (lightboxImage) {
            lightboxImage.src = this.currentLightboxImages[this.currentLightboxIndex];
            this.updateLightboxCounter();
        }
    }

    updateLightboxCounter() {
        const counter = this.modal.querySelector('#lightbox-counter');
        const prevBtn = this.modal.querySelector('.lightbox-prev');
        const nextBtn = this.modal.querySelector('.lightbox-next');

        // 如果只有一张图片，隐藏计数器和导航按钮
        if (this.currentLightboxImages.length <= 1) {
            if (counter) counter.textContent = '';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            // 多张图片，显示计数器和导航按钮
            if (counter) {
                counter.textContent = `${this.currentLightboxIndex + 1} / ${this.currentLightboxImages.length}`;
            }
            if (prevBtn) prevBtn.style.display = 'block';
            if (nextBtn) nextBtn.style.display = 'block';
        }
    }

    getProductImages() {
        const images = [];
        const seriesId = this.currentSeries;
        const product = this.currentProduct;
        
        // 添加当前产品的所有图片
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                const imageUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(img.filename)}`;
                images.push(imageUrl);
            });
        }
        
        return images;
    }

    loadRelatedImages() {
        const gallery = this.modal.querySelector('#modal-gallery');
        if (!gallery) return;
        
        const relatedImages = this.getRelatedImages();
        
        // 保存相关图片到全局变量，供灯箱使用
        this.currentLightboxImages = relatedImages.map(img => img.path);
        
        let html = '';
        relatedImages.forEach((img, index) => {
            html += `
                <div class="modal-gallery-item">
                    <img src="${img.path}" 
                         alt="${img.name}" 
                         class="gallery-thumb"
                         onclick="productModal.changeMainImage('${img.path}')"
                         onerror="this.style.display='none'; this.parentElement.style.display='none'">
                    <div class="gallery-thumb-label">${img.name}</div>
                </div>
            `;
        });
        
        gallery.innerHTML = html;
    }

    getRelatedImages() {
        const product = this.currentProduct;
        const seriesId = this.currentSeries;
        const currentLang = i18n?.currentLanguage || 'zh';
        
        const relatedImages = [];
        
        // 添加当前产品的所有图片
        if (product.images && product.images.length > 0) {
            product.images.forEach((img, index) => {
                const imageUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(img.filename)}`;
                const imageName = index === 0 ? '主图' : `图片 ${index + 1}`;
                relatedImages.push({
                    path: imageUrl,
                    name: imageName
                });
            });
        }
        
        return relatedImages;
    }

    changeMainImage(src) {
        const mainImage = this.modal.querySelector('#modal-main-image');
        if (mainImage) {
            mainImage.src = src;
        }
    }

    render() {
        if (!this.currentProduct) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const product = this.currentProduct;

        // 更新弹窗内容
        const mainImage = this.modal.querySelector('#modal-main-image');
        if (product.images && product.images.length > 0) {
            const mainImageUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(this.currentSeries)}/${encodeURIComponent(product.images[0].filename)}`;
            mainImage.src = mainImageUrl;
            mainImage.alt = product.name?.[currentLang] || product.name?.zh || '';
        }
        
        this.modal.querySelector('#modal-series').textContent = this.currentSeriesName;
        this.modal.querySelector('#modal-product-name').textContent = product.name?.[currentLang] || product.name?.zh || '';
        this.modal.querySelector('#modal-description').textContent = product.description?.[currentLang] || product.description?.zh || '';
        
        // 更新产品规格
        if (product.materials) {
            this.modal.querySelector('#spec-upper').textContent = product.materials.upper || '-';
            this.modal.querySelector('#spec-inner').textContent = product.materials.lining || '-';
            this.modal.querySelector('#spec-sole').textContent = product.materials.sole || '-';
        } else {
            this.modal.querySelector('#spec-upper').textContent = '-';
            this.modal.querySelector('#spec-inner').textContent = '-';
            this.modal.querySelector('#spec-sole').textContent = '-';
        }
        
        this.modal.querySelector('#spec-moq').textContent = product.minOrder ? `${product.minOrder} 件` : '-';
        this.modal.querySelector('#spec-delivery').textContent = product.deliveryTime || '-';
        
        // 加载相关图片
        this.loadRelatedImages();
    }
}

const productModal = new ProductModal();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = productModal;
} else {
    window.productModal = productModal;
}
