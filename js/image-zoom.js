class ImageZoom {
    constructor() {
        this.overlay = null;
        this.zoomedImage = null;
        this.settings = {
            enabled: true,
            scale: 2,
            cursor: 'zoom-in'
        };
    }

    init() {
        const savedSettings = localStorage.getItem('imageZoom_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        if (!this.settings.enabled) return;

        this.createOverlay();
        this.bindEvents();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'image-zoom-overlay';
        this.overlay.className = 'image-zoom-overlay';
        
        this.zoomedImage = document.createElement('img');
        this.zoomedImage.className = 'zoomed-image';
        
        this.overlay.appendChild(this.zoomedImage);
        document.body.appendChild(this.overlay);

        this.overlay.addEventListener('click', () => this.close());
    }

    bindEvents() {
        document.addEventListener('mouseover', (e) => {
            const img = e.target.closest('.product-image img, .modal-product-image img');
            if (img && this.settings.enabled) {
                this.preview(img);
            }
        });

        document.addEventListener('click', (e) => {
            const img = e.target.closest('.product-image img, .modal-product-image img');
            if (img && this.settings.enabled && !this.overlay.classList.contains('active')) {
                this.open(img);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(img) {
        const src = img.dataset.fullSrc || img.src;
        this.zoomedImage.src = src;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    preview(img) {
        const src = img.dataset.fullSrc || img.src;
        img.style.cursor = this.settings.cursor;
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('imageZoom_settings', JSON.stringify(this.settings));
        
        const images = document.querySelectorAll('.product-image img, .modal-product-image img');
        images.forEach(img => {
            img.style.cursor = this.settings.enabled ? this.settings.cursor : 'default';
        });
    }

    getSettings() {
        return { ...this.settings };
    }
}

const imageZoom = new ImageZoom();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = imageZoom;
} else {
    window.imageZoom = imageZoom;
}
