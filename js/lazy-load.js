class LazyLoad {
    constructor() {
        this.observer = null;
    }

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
            this.loadAllImages();
        }
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(image => {
            this.observer.observe(image);
        });
    }

    loadImage(image) {
        const src = image.dataset.src;
        if (src) {
            image.src = src;
            image.classList.add('loaded');
        }
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(image => {
            this.loadImage(image);
        });
    }
}

const lazyLoad = new LazyLoad();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lazyLoad;
} else {
    window.lazyLoad = lazyLoad;
}