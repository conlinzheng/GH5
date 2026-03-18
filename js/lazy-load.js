class LazyLoad {
    constructor() {
        this.observer = null;
    }

    /**
     * 初始化懒加载
     */
    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        this.loadImage(image);
                        observer.unobserve(image);
                    }
                });
            }, {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            });

            this.observeImages();
        } else {
            // 降级方案，直接加载所有图片
            this.loadAllImages();
        }
    }

    /**
     * 观察所有需要懒加载的图片
     */
    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(image => {
            this.observer.observe(image);
        });
    }

    /**
     * 加载单个图片
     * @param {HTMLElement} image - 图片元素
     */
    loadImage(image) {
        const src = image.dataset.src;
        if (src) {
            image.src = src;
            image.classList.add('loaded');
        }
    }

    /**
     * 加载所有图片（降级方案）
     */
    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(image => {
            this.loadImage(image);
        });
    }
}

// 导出单例
const lazyLoad = new LazyLoad();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lazyLoad;
} else {
    window.lazyLoad = lazyLoad;
}