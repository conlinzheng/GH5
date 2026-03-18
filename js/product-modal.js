class ProductModal {
    constructor() {
        this.modal = document.getElementById('product-modal');
        this.currentProduct = null;
        this.currentSeries = null;
        this.currentSeriesName = null;
        this.currentProductId = null;
        this.currentImageIndex = 0;
        this.allProducts = null;
        this.isImageModalOpen = false;
        this.imageModal = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createImageModal();
    }

    setupEventListeners() {
        if (this.modal) {
            const closeBtn = this.modal.querySelector('#modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
            
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
    }

    createImageModal() {
        this.imageModal = document.createElement('div');
        this.imageModal.className = 'modal image-modal';
        this.imageModal.innerHTML = `
            <div class="modal-content image-modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">图片预览</h2>
                    <button class="modal-close" id="image-modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="image-preview-container">
                        <img id="preview-image" src="" alt="产品图片">
                        <div class="image-navigation">
                            <button id="prev-image" class="nav-btn">←</button>
                            <button id="next-image" class="nav-btn">→</button>
                        </div>
                        <div class="image-counter"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.imageModal);

        const closeBtn = this.imageModal.querySelector('#image-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeImageModal());
        }

        const prevBtn = this.imageModal.querySelector('#prev-image');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.showPreviousImage());
        }

        const nextBtn = this.imageModal.querySelector('#next-image');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.showNextImage());
        }

        this.imageModal.addEventListener('click', (e) => {
            if (e.target === this.imageModal) {
                this.closeImageModal();
            }
        });
    }

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

    close() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    openImageModal(imageIndex = 0) {
        this.currentImageIndex = imageIndex;
        this.isImageModalOpen = true;
        this.updateImageModal();
        this.imageModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    closeImageModal() {
        this.isImageModalOpen = false;
        this.imageModal.classList.remove('visible');
        document.body.style.overflow = '';
    }

    showPreviousImage() {
        const images = this.getProductImages();
        if (images.length > 0) {
            this.currentImageIndex = (this.currentImageIndex - 1 + images.length) % images.length;
            this.updateImageModal();
        }
    }

    showNextImage() {
        const images = this.getProductImages();
        if (images.length > 0) {
            this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
            this.updateImageModal();
        }
    }

    updateImageModal() {
        const images = this.getProductImages();
        if (images.length === 0) return;

        const previewImage = this.imageModal.querySelector('#preview-image');
        const imageCounter = this.imageModal.querySelector('.image-counter');

        if (previewImage) {
            previewImage.src = images[this.currentImageIndex];
            previewImage.alt = `${i18n.getLocalizedField(this.currentProduct, 'name')} - 图片 ${this.currentImageIndex + 1}`;
        }

        if (imageCounter) {
            imageCounter.textContent = `${this.currentImageIndex + 1} / ${images.length}`;
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

    getRelatedImages() {
        const images = [];
        const seriesId = this.currentSeries;
        
        // 只添加当前产品的图片，不添加整个系列的图片
        if (this.currentProduct && this.currentProduct.images) {
            this.currentProduct.images.forEach(img => {
                const imageUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(seriesId)}/${encodeURIComponent(img.filename)}`;
                images.push(imageUrl);
            });
        }
        
        return images;
    }

    render() {
        if (!this.currentProduct || !this.modal) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const product = this.currentProduct;

        // 更新弹窗内容
        const modalBody = this.modal.querySelector('#modal-body');
        if (!modalBody) return;

        // 构建产品详情HTML
        const html = `
            <div class="product-modal-content">
                <div class="product-images">
                    <div class="main-image-container">
                        <img id="modal-main-image" src="" alt="${i18n.getLocalizedField(product, 'name')}">
                        <div class="image-actions">
                            <button class="btn btn-outline btn-sm" id="view-all-images">查看所有图片</button>
                        </div>
                    </div>
                    <div class="thumbnail-images">
                        <!-- Thumbnails will be dynamically added -->
                    </div>
                </div>
                <div class="product-details">
                    <h3 id="modal-series">${this.currentSeriesName}</h3>
                    <h2 id="modal-product-name">${i18n.getLocalizedField(product, 'name')}</h2>
                    <p id="modal-product-description">${i18n.getLocalizedField(product, 'description')}</p>
                    
                    ${product.price ? `<div class="product-price">${product.price}</div>` : ''}
                    
                    <div class="product-info">
                        <h4>产品信息</h4>
                        <ul>
                            <li><strong>系列：</strong>${this.currentSeriesName}</li>
                            <li><strong>编号：</strong>${product.id || this.currentProductId}</li>
                            ${product.images ? `<li><strong>图片数量：</strong>${product.images.length}</li>` : ''}
                        </ul>
                    </div>
                    
                    <div class="social-share">
                        <h4>分享</h4>
                        <div class="share-buttons">
                            <a href="https://weixin.qq.com/share" class="share-btn wechat" target="_blank">微信</a>
                            <a href="https://weibo.com/share" class="share-btn weibo" target="_blank">微博</a>
                            <a href="https://twitter.com/share" class="share-btn twitter" target="_blank">Twitter</a>
                        </div>
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

            // 添加点击查看大图事件
            mainImage.addEventListener('click', () => {
                const mainImageIndex = product.images.findIndex(img => img.isMain) || 0;
                this.openImageModal(mainImageIndex);
            });
        }

        // 添加缩略图
        const thumbnailContainer = this.modal.querySelector('.thumbnail-images');
        if (thumbnailContainer && product.images && product.images.length > 0) {
            product.images.forEach((img, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail-item';
                if (img.isMain) {
                    thumbnail.classList.add('active');
                }
                
                const thumbnailImg = document.createElement('img');
                const thumbnailUrl = `https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${encodeURIComponent(this.currentSeries)}/${encodeURIComponent(img.filename)}`;
                thumbnailImg.src = thumbnailUrl;
                thumbnailImg.alt = `${i18n.getLocalizedField(product, 'name')} - 缩略图 ${index + 1}`;
                
                // 添加点击事件
                thumbnail.addEventListener('click', () => {
                    // 更新主图
                    if (mainImage) {
                        mainImage.src = thumbnailUrl;
                    }
                    
                    // 更新缩略图激活状态
                    document.querySelectorAll('.thumbnail-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    thumbnail.classList.add('active');
                    
                    // 打开图片预览
                    this.openImageModal(index);
                });
                
                thumbnail.appendChild(thumbnailImg);
                thumbnailContainer.appendChild(thumbnail);
            });
        }

        // 添加查看所有图片按钮事件
        const viewAllImagesBtn = this.modal.querySelector('#view-all-images');
        if (viewAllImagesBtn) {
            viewAllImagesBtn.addEventListener('click', () => {
                this.openImageModal(0);
            });
        }

        // 添加系列名称点击事件，显示整个系列的产品
        const seriesName = this.modal.querySelector('#modal-series');
        if (seriesName) {
            seriesName.style.cursor = 'pointer';
            seriesName.style.color = '#667eea';
            seriesName.addEventListener('click', () => {
                this.showSeriesProducts();
            });
        }

        // 添加样式
        this.addStyles();
    }

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

    addStyles() {
        // 添加产品模态框样式
        const style = document.createElement('style');
        style.textContent = `
            .product-modal-content {
                display: flex;
                gap: 2rem;
                max-height: 80vh;
                overflow: hidden;
            }
            
            .product-images {
                flex: 0 0 40%;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .main-image-container {
                position: relative;
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow);
            }
            
            .main-image-container img {
                width: 100%;
                height: auto;
                max-height: 500px;
                object-fit: contain;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .main-image-container img:hover {
                transform: scale(1.02);
            }
            
            .image-actions {
                position: absolute;
                bottom: 1rem;
                right: 1rem;
            }
            
            .thumbnail-images {
                display: flex;
                gap: 0.5rem;
                overflow-x: auto;
                padding: 0.5rem 0;
            }
            
            .thumbnail-item {
                flex: 0 0 80px;
                height: 80px;
                border-radius: var(--border-radius);
                overflow: hidden;
                cursor: pointer;
                border: 2px solid transparent;
                transition: var(--transition);
            }
            
            .thumbnail-item:hover {
                border-color: var(--primary-color);
                transform: translateY(-2px);
            }
            
            .thumbnail-item.active {
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
            }
            
            .thumbnail-item img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .product-details {
                flex: 1;
                overflow-y: auto;
                padding-right: 1rem;
            }
            
            .product-details h3 {
                font-size: 1.125rem;
                color: var(--text-light);
                margin-bottom: 0.5rem;
                cursor: pointer;
            }
            
            .product-details h3:hover {
                text-decoration: underline;
            }
            
            .product-details h2 {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 1rem;
                color: var(--dark-color);
            }
            
            .product-details p {
                margin-bottom: 1.5rem;
                color: var(--text-light);
                line-height: 1.6;
            }
            
            .product-price {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--primary-color);
                margin-bottom: 1.5rem;
            }
            
            .product-info {
                background: var(--light-color);
                padding: 1.5rem;
                border-radius: var(--border-radius);
                margin-bottom: 1.5rem;
            }
            
            .product-info h4 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: var(--dark-color);
            }
            
            .product-info ul {
                list-style: none;
            }
            
            .product-info li {
                margin-bottom: 0.5rem;
                color: var(--text-color);
            }
            
            .social-share {
                margin-top: 2rem;
            }
            
            .social-share h4 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 1rem;
                color: var(--dark-color);
            }
            
            .share-buttons {
                display: flex;
                gap: 1rem;
            }
            
            .share-btn {
                padding: 0.5rem 1rem;
                border-radius: var(--border-radius);
                font-weight: 600;
                text-decoration: none;
                transition: var(--transition);
                font-size: 0.875rem;
            }
            
            .share-btn.wechat {
                background: #07C160;
                color: white;
            }
            
            .share-btn.weibo {
                background: #E6162D;
                color: white;
            }
            
            .share-btn.twitter {
                background: #1DA1F2;
                color: white;
            }
            
            .share-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow);
            }
            
            .image-modal-content {
                max-width: 90vw;
                max-height: 90vh;
            }
            
            .image-preview-container {
                position: relative;
                text-align: center;
            }
            
            #preview-image {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
            }
            
            .image-navigation {
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                transform: translateY(-50%);
                display: flex;
                justify-content: space-between;
                padding: 0 1rem;
            }
            
            .nav-btn {
                background: rgba(255, 255, 255, 0.9);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                font-size: 1.5rem;
                cursor: pointer;
                box-shadow: var(--shadow);
                transition: var(--transition);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .nav-btn:hover {
                background: var(--primary-color);
                color: white;
            }
            
            .image-counter {
                position: absolute;
                bottom: 1rem;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.875rem;
            }
            
            .series-products {
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .series-products h3 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
                color: var(--dark-color);
            }
            
            .series-products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            
            .series-product-item {
                background: white;
                border-radius: var(--border-radius);
                overflow: hidden;
                box-shadow: var(--shadow);
                transition: var(--transition);
                cursor: pointer;
            }
            
            .series-product-item:hover {
                transform: translateY(-5px);
                box-shadow: var(--shadow-lg);
            }
            
            .series-product-image {
                height: 200px;
                overflow: hidden;
            }
            
            .series-product-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: var(--transition);
            }
            
            .series-product-item:hover .series-product-image img {
                transform: scale(1.05);
            }
            
            .series-product-info {
                padding: 1.5rem;
            }
            
            .series-product-info h4 {
                font-size: 1.125rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: var(--dark-color);
            }
            
            .series-product-info p {
                color: var(--text-light);
                font-size: 0.875rem;
                line-height: 1.5;
            }
            
            @media (max-width: 768px) {
                .product-modal-content {
                    flex-direction: column;
                }
                
                .product-images {
                    flex: 1;
                }
                
                .main-image-container img {
                    max-height: 300px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 初始化产品模态框
window.addEventListener('DOMContentLoaded', () => {
    window.productModal = new ProductModal();
});