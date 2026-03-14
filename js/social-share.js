class SocialShare {
    constructor() {
        this.currentProduct = null;
        this.siteUrl = 'https://conlinzheng.github.io/GH5';
    }

    init() {
        this.renderShareButton();
    }

    getSharePlatforms() {
        return [
            {
                id: 'facebook',
                name: 'Facebook',
                icon: '📘',
                color: '#1877F2',
                getUrl: (data) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(data.title)}`
            },
            {
                id: 'twitter',
                name: 'Twitter/X',
                icon: '🐦',
                color: '#000000',
                getUrl: (data) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`
            },
            {
                id: 'whatsapp',
                name: 'WhatsApp',
                icon: '💬',
                color: '#25D366',
                getUrl: (data) => `https://wa.me/?text=${encodeURIComponent(data.title + ' ' + data.url)}`
            },
            {
                id: 'line',
                name: 'LINE',
                icon: '💚',
                color: '#06C755',
                getUrl: (data) => `https://line.me/R/msg/text/?${encodeURIComponent(data.title + ' ' + data.url)}`
            },
            {
                id: 'telegram',
                name: 'Telegram',
                icon: '✈️',
                color: '#0088CC',
                getUrl: (data) => `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`
            },
            {
                id: 'pinterest',
                name: 'Pinterest',
                icon: '📌',
                color: '#BD081C',
                getUrl: (data) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(data.url)}&description=${encodeURIComponent(data.title)}`
            },
            {
                id: 'linkedin',
                name: 'LinkedIn',
                icon: '💼',
                color: '#0A66C2',
                getUrl: (data) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`
            },
            {
                id: 'email',
                name: 'Email',
                icon: '📧',
                color: '#EA4335',
                getUrl: (data) => `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(data.url)}`
            }
        ];
    }

    renderShareButton() {
        const modalInfo = document.querySelector('.modal-info-section');
        if (!modalInfo) return;

        let shareContainer = document.getElementById('share-container');
        if (!shareContainer) {
            shareContainer = document.createElement('div');
            shareContainer.id = 'share-container';
            shareContainer.className = 'share-container';
            shareContainer.innerHTML = `
                <h3 class="share-title">${i18n?.t('share') || '分享'}</h3>
                <div class="share-platforms" id="share-platforms"></div>
            `;
            
            const actionsSection = document.querySelector('.product-actions');
            if (actionsSection) {
                actionsSection.parentNode.insertBefore(shareContainer, actionsSection);
            }
        }

        const platformsContainer = document.getElementById('share-platforms');
        if (!platformsContainer) return;

        const platforms = this.getSharePlatforms();
        platformsContainer.innerHTML = platforms.map(platform => `
            <a class="share-btn" 
               href="#" 
               data-platform="${platform.id}"
               title="${platform.name}"
               style="--platform-color: ${platform.color}"
               target="_blank"
               rel="noopener noreferrer">
                <span class="share-icon">${platform.icon}</span>
                <span class="share-name">${platform.name}</span>
            </a>
        `).join('');

        platformsContainer.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.share(btn.dataset.platform);
            });
        });
    }

    setProduct(product, seriesId) {
        this.currentProduct = {
            ...product,
            seriesId
        };
        this.updateShareLinks();
    }

    updateShareLinks() {
        if (!this.currentProduct) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const productName = this.currentProduct.name?.[currentLang] || this.currentProduct.name?.zh || '';
        const productPrice = this.currentProduct.price || '';
        
        const shareData = {
            title: `${productName}${productPrice ? ' - ¥' + productPrice : ''}`,
            url: this.siteUrl,
            description: productName
        };

        const platforms = this.getSharePlatforms();
        
        document.querySelectorAll('.share-btn').forEach(btn => {
            const platform = platforms.find(p => p.id === btn.dataset.platform);
            if (platform) {
                btn.href = platform.getUrl(shareData);
            }
        });
    }

    share(platformId) {
        if (!this.currentProduct) return;

        const currentLang = i18n?.currentLanguage || 'zh';
        const productName = this.currentProduct.name?.[currentLang] || this.currentProduct.name?.zh || '';
        const productPrice = this.currentProduct.price || '';
        
        const shareData = {
            title: `${productName}${productPrice ? ' - ¥' + productPrice : ''}`,
            url: this.siteUrl,
            description: productName
        };

        const platform = this.getSharePlatforms().find(p => p.id === platformId);
        if (platform) {
            const url = platform.getUrl(shareData);
            window.open(url, '_blank', 'width=600,height=400,scrollbars=yes');
        }
    }

    shareAll() {
        if (!this.currentProduct) return;

        const modal = document.getElementById('share-modal');
        if (!modal) {
            this.createShareModal();
        }

        document.getElementById('share-modal')?.classList.add('active');
    }

    createShareModal() {
        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-overlay"></div>
            <div class="share-modal-content">
                <button class="share-modal-close">&times;</button>
                <h3>${i18n?.t('shareTo') || '分享到'}</h3>
                <div class="share-modal-platforms" id="share-modal-platforms"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const platforms = this.getSharePlatforms();
        const container = document.getElementById('share-modal-platforms');
        
        if (container) {
            container.innerHTML = platforms.map(platform => `
                <a class="share-modal-btn" 
                   href="#" 
                   data-platform="${platform.id}"
                   style="--platform-color: ${platform.color}"
                   target="_blank"
                   rel="noopener noreferrer">
                    <span class="share-icon">${platform.icon}</span>
                    <span class="share-name">${platform.name}</span>
                </a>
            `).join('');

            container.querySelectorAll('.share-modal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.share(btn.dataset.platform);
                });
            });
        }

        modal.querySelector('.share-modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.querySelector('.share-modal-overlay').addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    generateShareQRCode() {
        if (!this.currentProduct) return '';
        
        const currentLang = i18n?.currentLanguage || 'zh';
        const productName = this.currentProduct.name?.[currentLang] || this.currentProduct.name?.zh || '';
        const shareUrl = `${this.siteUrl}?product=${this.currentProduct.id}&series=${this.currentProduct.seriesId}`;
        
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`;
    }
}

const socialShare = new SocialShare();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = socialShare;
} else {
    window.socialShare = socialShare;
}