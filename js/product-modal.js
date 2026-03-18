/**
 * ProductModal 类 - 负责产品详情弹窗功能
 * 包括弹窗显示、图片预览、系列产品展示等
 */
class ProductModal {
    constructor() {
        this.modal = document.getElementById('product-modal');
        this.lightbox = document.getElementById('lightbox');
        this.currentProduct = null;
        this.currentSeries = null;
        this.currentSeriesName = null;
        this.currentProductId = null;
        this.currentImageIndex = 0;
        this.allProducts = null;
        this.currentLightboxImages = [];
        this.init();
    }

    /**
     * 初始化产品模态框
     */
    init() {
        this.setupEventListeners();
        this.createLightbox();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 模态框关闭按钮
        if (this.modal) {
            const closeBtn = this.modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
            
            // 点击模态框背景关闭
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
                this.closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                this.navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                this.navigateLightbox(1);
            }
        });
    }

    /**
     * 创建灯箱
     */
    createLightbox() {
        if (!this.lightbox) {
            this.lightbox = document.createElement('div');
            this.lightbox.className = 'lightbox';
            this.lightbox.id = 'lightbox';
            this.lightbox.innerHTML = `
                <div class="lightbox-content" onclick="event.stopPropagation()">
                    <span class="close-lightbox" onclick="productModal.closeLightbox(event)">&times;</span>
                    <button class="lightbox-nav lightbox-prev" onclick="productModal.navigateLightbox(-1)" title="上一张">❮</button>
                    <img class="lightbox-image" id="lightbox-image" src="" alt="">
                    <button class="lightbox-nav lightbox-next" onclick="productModal.navigateLightbox(1)" title="下一张">❯</button>
                    <div class="lightbox-counter" id="lightbox-counter"></div>
                </div>
            `;
            document.body.appendChild(this.lightbox);
        }

        // 灯箱点击事件
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                this.closeLightbox(e);
            });
        }
    }

    /**
     * 打开产品详情弹窗
     * @param {string} seriesId 系列ID
     * @param {string} productId 产品ID
     * @param {Object} product 产品数据
     * @param {Object} allProducts 所有产品数据
     */
    open(seriesId, productId, product, allProducts) {
        this.currentSeries = seriesId;
        this.currentProductId = productId;
        this.currentProduct = product;
        this.allProducts = allProducts;
        this.currentImageIndex = 0;
        
        // 获取系列名称
        const seriesParts = seriesId.split('-');
        if (seriesParts.length > 1) {
            this.currentSeriesName = seriesParts.slice(1).join('-');
        } else {
            this.currentSeriesName = seriesId;
        }

        this.render();
        this.modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    /**
     * 关闭产品详情弹窗
     */
    close() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    /**
     * 打开图片灯箱
     * @param {string} src 图片路径
     */
    openLightbox(src) {
        if (this.lightbox) {
            const lightboxImage = this.lightbox.querySelector('.lightbox-image');
            if (lightboxImage) {
                lightboxImage.src = src;
            }
            this.lightbox.style.display = 'flex';
            
            // 设置灯箱图片列表
            this.currentLightboxImages = this.getProductImages();
            this.currentImageIndex = this.currentLightboxImages.indexOf(src);
            
            this.updateLightboxCounter();
        }
    }

    /**
     * 关闭图片灯箱
     * @param {Event} event 事件对象
     */
    closeLightbox(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (this.lightbox) {
            this.lightbox.style.display = 'none';
        }
    }

    /**
     * 导航灯箱图片
     * @param {number} direction 方向（-1：上一张，1：下一张）
     */
    navigateLightbox(direction) {
        if (this.currentLightboxImages.length === 0) return;

        this.currentImageIndex += direction;

        // 循环切换
        if (this.currentImageIndex < 0) {
            this.currentImageIndex = this.currentLightboxImages.length - 1;
        } else if (this.currentImageIndex >= this.currentLightboxImages.length) {
            this.currentImageIndex = 0;
        }

        const lightboxImage = this.lightbox.querySelector('.lightbox-image');
        if (lightboxImage) {
            lightboxImage.src = this.currentLightboxImages[this.currentImageIndex];
            this.updateLightboxCounter();
        }
    }

    /**
     * 更新灯箱计数器
     */
    updateLightboxCounter() {
        const counter = this.lightbox.querySelector('.lightbox-counter');
        const prevBtn = this.lightbox.querySelector('.lightbox-prev');
        const nextBtn = this.lightbox.querySelector('.lightbox-next');

        // 如果只有一张图片，隐藏计数器和导航按钮
        if (this.currentLightboxImages.length <= 1) {
            if (counter) counter.textContent = '';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            // 多张图片，显示计数器和导航按钮
            if (counter) {
                counter.textContent = `${this.currentImageIndex + 1} / ${this.currentLightboxImages.length}`;
            }
            if (prevBtn) prevBtn.style.display = 'block';
            if (nextBtn) nextBtn.style.display = 'block';
        }
    }

    /**
     * 获取产品图片
     * @returns {Array} 图片URL数组
     */
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

    /**
     * 渲染产品详情
     */
    render() {
        if (!this.currentProduct || !this.modal) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const product = this.currentProduct;

        // 更新弹窗内容
        const modalBody = this.modal.querySelector('#modal-body');
        if (!modalBody) return;

        // 构建产品详情HTML
        const html = `
            <div class="modal-body">
                <!-- 左侧图片 -->
                <div class="modal-images">
                    <div class="main-image-container">
                        <img id="modal-main-image" src="" alt="${i18n.getLocalizedField(product, 'name')}" onclick="productModal.openLightbox(this.src)">
                        <div class="zoom-hint" data-i18n="modal.zoomHint">点击查看大图</div>
                    </div>
                    <div class="modal-gallery" id="modal-gallery">
                        <!-- 相关图片将动态加载 -->
                    </div>
                </div>

                <!-- 右侧信息 -->
                <div class="modal-info">
                    <div class="modal-series" id="modal-series">${this.currentSeriesName}</div>
                    <h2 id="modal-product-name">${i18n.getLocalizedField(product, 'name')}</h2>
                    <p class="modal-description" id="modal-description">${i18n.getLocalizedField(product, 'description')}</p>
                    
                    <!-- 产品详细信息 -->
                    <div class="product-specs">
                        <div class="spec-item">
                            <span class="spec-label" data-i18n="spec.upperMaterial">鞋面材质：</span>
                            <span class="spec-value" id="spec-upper">${product.upperMaterial || '-'}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label" data-i18n="spec.innerMaterial">内里材质：</span>
                            <span class="spec-value" id="spec-inner">${product.innerMaterial || '-'}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label" data-i18n="spec.soleMaterial">鞋底材质：</span>
                            <span class="spec-value" id="spec-sole">${product.soleMaterial || '-'}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label" data-i18n="spec.moq">起订量：</span>
                            <span class="spec-value" id="spec-moq">${product.moq || '-'}</span>
                        </div>
                        <div class="spec-item">
                            <span class="spec-label" data-i18n="spec.deliveryTime">交货周期：</span>
                            <span class="spec-value" id="spec-delivery">${product.deliveryTime || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="contact-btn" onclick="window.location.href='#contact'">
                            <span data-i18n="modal.contactUs">联系我们</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        modalBody.innerHTML = html;

        // 设置主图
        const mainImage = this.modal.querySelector('#modal-main-image');
        if (product.images && product.images.length > 0) {
            // 查找主图（带 (1) 的图片）
            const mainImageObj = product.images.find(img => img.isMain) || product.images[0];
            const mainImageUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(this.currentSeries)}/${encodeURIComponent(mainImageObj.filename)}`;
            mainImage.src = mainImageUrl;
            mainImage.alt = i18n.getLocalizedField(product, 'name') || '';
        }

        // 添加相关图片
        const gallery = this.modal.querySelector('#modal-gallery');
        if (gallery && product.images && product.images.length > 0) {
            let galleryHtml = '';
            product.images.forEach((img, index) => {
                const imageUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(this.currentSeries)}/${encodeURIComponent(img.filename)}`;
                galleryHtml += `
                    <div class="modal-gallery-item">
                        <img src="${imageUrl}" 
                             alt="${i18n.getLocalizedField(product, 'name')} - 图片 ${index + 1}" 
                             class="gallery-thumb"
                             onclick="document.getElementById('modal-main-image').src='${imageUrl}'; productModal.openLightbox('${imageUrl}')">
                    </div>
                `;
            });
            gallery.innerHTML = galleryHtml;
        }

        // 添加系列名称点击事件，显示整个系列的产品
        const seriesName = this.modal.querySelector('#modal-series');
        if (seriesName) {
            seriesName.style.cursor = 'pointer';
            seriesName.addEventListener('click', () => {
                this.showSeriesProducts();
            });
        }

        // 添加样式
        this.addStyles();
    }

    /**
     * 显示系列产品
     */
    showSeriesProducts() {
        if (!this.allProducts) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        
        // 构建系列产品HTML
        const html = `
            <div class="series-products">
                <h3>${this.currentSeriesName} - 系列产品</h3>
                <div class="series-products-grid">
                    ${Object.keys(this.allProducts).map(productId => {
                        const product = this.allProducts[productId];
                        const mainImage = product.images?.find(img => img.isMain) || product.images?.[0];
                        const imageUrl = mainImage 
                            ? `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(this.currentSeries)}/${encodeURIComponent(mainImage.filename)}`
                            : '';
                        
                        return `
                            <div class="series-product-item" data-product-id="${productId}">
                                <div class="series-product-image">
                                    <img src="${imageUrl}" alt="${i18n.getLocalizedField(product, 'name')}">
                                </div>
                                <div class="series-product-info">
                                    <h4>${i18n.getLocalizedField(product, 'name')}</h4>
                                    <p>${i18n.getLocalizedField(product, 'description')}</p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        const modalBody = this.modal.querySelector('#modal-body');
        if (modalBody) {
            modalBody.innerHTML = html;

            // 添加产品点击事件
            document.querySelectorAll('.series-product-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = item.dataset.productId;
                    const product = this.allProducts[productId];
                    if (product) {
                        this.currentProductId = productId;
                        this.currentProduct = product;
                        this.currentImageIndex = 0;
                        this.render();
                    }
                });
            });
        }
    }

    /**
     * 添加样式
     */
    addStyles() {
        // 检查是否已经添加了样式
        if (document.getElementById('product-modal-styles')) {
            return;
        }

        // 添加产品模态框样式
        const style = document.createElement('style');
        style.id = 'product-modal-styles';
        style.textContent = `
            /* 产品模态框样式 */
            .product-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }

            .product-modal.visible {
                display: flex;
            }

            .modal-content {
                background-color: #fff;
                border-radius: 8px;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            }

            .modal-close {
                position: absolute;
                top: 15px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                z-index: 10;
            }

            .modal-close:hover {
                color: #333;
            }

            .modal-body {
                display: flex;
                padding: 30px;
                gap: 30px;
            }

            .modal-images {
                flex: 0 0 45%;
            }

            .main-image-container {
                position: relative;
                margin-bottom: 20px;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            #modal-main-image {
                width: 100%;
                height: auto;
                max-height: 400px;
                object-fit: contain;
                cursor: pointer;
                transition: transform 0.3s ease;
            }

            #modal-main-image:hover {
                transform: scale(1.02);
            }

            .zoom-hint {
                position: absolute;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.6);
                color: #fff;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
            }

            .modal-gallery {
                display: flex;
                gap: 10px;
                overflow-x: auto;
                padding: 10px 0;
            }

            .modal-gallery-item {
                flex: 0 0 80px;
                height: 80px;
                border-radius: 4px;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }

            .modal-gallery-item:hover {
                border-color: #667eea;
                transform: translateY(-2px);
            }

            .gallery-thumb {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .modal-info {
                flex: 1;
            }

            .modal-series {
                font-size: 14px;
                color: #999;
                margin-bottom: 10px;
                cursor: pointer;
            }

            .modal-series:hover {
                text-decoration: underline;
                color: #667eea;
            }

            #modal-product-name {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #333;
            }

            .modal-description {
                font-size: 16px;
                line-height: 1.5;
                margin-bottom: 20px;
                color: #666;
            }

            .product-specs {
                margin-bottom: 30px;
            }

            .spec-item {
                display: flex;
                margin-bottom: 10px;
                font-size: 14px;
            }

            .spec-label {
                flex: 0 0 100px;
                font-weight: 500;
                color: #666;
            }

            .spec-value {
                flex: 1;
                color: #333;
            }

            .modal-actions {
                margin-top: 30px;
            }

            .contact-btn {
                background-color: #667eea;
                color: #fff;
                border: none;
                padding: 12px 30px;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .contact-btn:hover {
                background-color: #5a6fd8;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            /* 灯箱样式 */
            .lightbox {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 2000;
                justify-content: center;
                align-items: center;
            }

            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }

            .lightbox-image {
                max-width: 100%;
                max-height: 80vh;
                object-fit: contain;
            }

            .close-lightbox {
                position: absolute;
                top: -40px;
                right: 0;
                color: #fff;
                font-size: 30px;
                cursor: pointer;
            }

            .lightbox-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.3);
                color: #fff;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .lightbox-nav:hover {
                background: rgba(255, 255, 255, 0.5);
            }

            .lightbox-prev {
                left: -50px;
            }

            .lightbox-next {
                right: -50px;
            }

            .lightbox-counter {
                position: absolute;
                bottom: -30px;
                left: 50%;
                transform: translateX(-50%);
                color: #fff;
                font-size: 14px;
            }

            /* 系列产品样式 */
            .series-products {
                padding: 20px;
            }

            .series-products h3 {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #333;
            }

            .series-products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }

            .series-product-item {
                background: #fff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .series-product-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .series-product-image {
                height: 150px;
                overflow: hidden;
            }

            .series-product-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            .series-product-item:hover .series-product-image img {
                transform: scale(1.05);
            }

            .series-product-info {
                padding: 15px;
            }

            .series-product-info h4 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 5px;
                color: #333;
            }

            .series-product-info p {
                font-size: 12px;
                color: #666;
                line-height: 1.4;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .modal-body {
                    flex-direction: column;
                    padding: 20px;
                    gap: 20px;
                }

                .modal-images {
                    flex: 1;
                }

                #modal-main-image {
                    max-height: 300px;
                }

                .lightbox-prev {
                    left: 10px;
                }

                .lightbox-next {
                    right: 10px;
                }

                .series-products-grid {
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化产品模态框
window.addEventListener('DOMContentLoaded', () => {
    try {
        window.productModal = new ProductModal();
    } catch (error) {
        console.error('Error initializing ProductModal:', error);
    }
});