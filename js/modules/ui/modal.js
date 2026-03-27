class ModalManager {
  constructor() {
    this.currentLightboxImages = [];
    this.currentLightboxIndex = 0;
  }

  showProductDetails(product, seriesNameMap, getProductTranslation) {
    const modal = document.getElementById('product-modal');
    
    if (!modal) return;
    
    const seriesDisplayName = seriesNameMap[product.seriesId] || product.seriesId;
    const translatedName = getProductTranslation(product.name, 'name');
    const translatedDesc = product.description ? getProductTranslation(product.description, 'desc') : '';
    
    // 更新弹窗内容 - 添加空值检查
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage && product.images && product.images.length > 0) {
      mainImage.src = product.images[0];
      mainImage.alt = translatedName || '';
    }
    
    const modalSeries = document.getElementById('modal-series');
    if (modalSeries) {
      modalSeries.textContent = seriesDisplayName || '';
    }
    
    const productName = document.getElementById('modal-product-name');
    if (productName) {
      productName.textContent = translatedName || '';
    }
    
    const description = document.getElementById('modal-description');
    if (description) {
      description.textContent = translatedDesc || '无描述';
    }
    
    // 更新产品规格 - 添加空值检查
    const specUpper = document.getElementById('spec-upper');
    if (specUpper) {
      specUpper.textContent = product.upperMaterial || '-';
    }
    
    const specInner = document.getElementById('spec-inner');
    if (specInner) {
      specInner.textContent = product.innerMaterial || '-';
    }
    
    const specSole = document.getElementById('spec-sole');
    if (specSole) {
      specSole.textContent = product.soleMaterial || '-';
    }
    
    const specCustomizable = document.getElementById('spec-customizable');
    if (specCustomizable) {
      specCustomizable.textContent = product.customizable ? (product.customizable === 'true' ? '支持' : '不支持') : '-';
    }
    
    const specMinOrder = document.getElementById('spec-min-order');
    if (specMinOrder) {
      specMinOrder.textContent = product.minOrder || '-';
    }
    
    const specPrice = document.getElementById('spec-price');
    if (specPrice) {
      specPrice.textContent = product.price || '-';
    }
    
    // 加载相关图片
    this.loadRelatedImages(product.images);
    
    // 显示弹窗
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // 触发产品查看事件，用于浏览历史
    const event = new CustomEvent('productViewed', {
      detail: { product }
    });
    document.dispatchEvent(event);
  }
  
  closeProductDetails() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }
  
  // 加载相关图片到弹窗
  loadRelatedImages(images) {
    const gallery = document.getElementById('modal-gallery');
    if (!gallery) return;
    
    // 保存相关图片到全局变量，供灯箱使用
    this.currentLightboxImages = images;
    
    let html = '';
    images.forEach((img, index) => {
      html += `
        <div class="modal-gallery-item">
          <img src="${img}" 
               alt="${index + 1}" 
               class="gallery-thumb"
               loading="lazy"
               onclick="changeMainImage('${img}')">
          <div class="gallery-thumb-label">图片 ${index + 1}</div>
        </div>
      `;
    });
    
    gallery.innerHTML = html;
  }
  
  // 切换主图
  changeMainImage(src) {
    const mainImage = document.getElementById('modal-main-image');
    if (mainImage) {
      mainImage.src = src;
    }
  }
  
  // 画廊导航
  navigateGallery(direction) {
    const gallery = document.getElementById('modal-gallery');
    if (!gallery) return;
    
    const scrollAmount = 200; // 每次滚动的距离
    gallery.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
  }
  
  // 打开灯箱
  openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    if (lightbox && lightboxImage) {
      lightboxImage.src = src;
      lightbox.style.display = 'flex';
      
      // 设置灯箱图片列表
      this.currentLightboxIndex = this.currentLightboxImages.indexOf(src);
      this.updateLightboxCounter();
    }
  }
  
  // 关闭灯箱
  closeLightbox(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
    }
  }
  
  // 灯箱导航
  navigateLightbox(direction) {
    if (this.currentLightboxImages.length === 0) return;

    this.currentLightboxIndex += direction;

    // 循环切换
    if (this.currentLightboxIndex < 0) {
      this.currentLightboxIndex = this.currentLightboxImages.length - 1;
    } else if (this.currentLightboxIndex >= this.currentLightboxImages.length) {
      this.currentLightboxIndex = 0;
    }

    const lightboxImage = document.getElementById('lightbox-image');
    if (lightboxImage) {
      lightboxImage.src = this.currentLightboxImages[this.currentLightboxIndex];
      this.updateLightboxCounter();
    }
  }

  // 更新灯箱计数器
  updateLightboxCounter() {
    const counter = document.getElementById('lightbox-counter');
    if (counter) {
      counter.textContent = `${this.currentLightboxIndex + 1}/${this.currentLightboxImages.length}`;
    }
  }

  getCurrentLightboxImages() {
    return this.currentLightboxImages;
  }

  getCurrentLightboxIndex() {
    return this.currentLightboxIndex;
  }
}

const modalManager = new ModalManager();
export default modalManager;