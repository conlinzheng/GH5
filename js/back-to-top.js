class BackToTop {
    constructor() {
        this.button = null;
        this.settings = {
            enabled: true,
            position: 'right',
            showAfterScroll: 300,
            scrollSpeed: 300
        };
    }

    init() {
        const savedSettings = localStorage.getItem('backToTop_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        if (!this.settings.enabled) return;

        this.createButton();
        this.bindEvents();
    }

    createButton() {
        this.button = document.createElement('div');
        this.button.id = 'back-to-top';
        this.button.className = `back-to-top position-${this.settings.position}`;
        this.button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
        `;
        this.button.title = i18n ? (i18n.t('backToTop') || '回到顶部') : '回到顶部';
        document.body.appendChild(this.button);
    }

    bindEvents() {
        window.addEventListener('scroll', () => this.handleScroll());
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        this.button.addEventListener('mouseenter', () => {
            this.button.classList.add('hover');
        });

        this.button.addEventListener('mouseleave', () => {
            this.button.classList.remove('hover');
        });
    }

    handleScroll() {
        if (window.scrollY > this.settings.showAfterScroll) {
            this.button.classList.add('visible');
        } else {
            this.button.classList.remove('visible');
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('backToTop_settings', JSON.stringify(this.settings));
        
        if (this.settings.enabled && !this.button) {
            this.createButton();
            this.bindEvents();
        } else if (!this.settings.enabled && this.button) {
            this.button.remove();
            this.button = null;
        } else if (this.button) {
            this.button.className = `back-to-top position-${this.settings.position}`;
        }
    }

    getSettings() {
        return { ...this.settings };
    }
}

const backToTop = new BackToTop();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = backToTop;
} else {
    window.backToTop = backToTop;
}
