class ThemeManager {
    constructor() {
        this.themeKey = 'site_theme';
        this.themes = {
            default: {
                name: { zh: '默认', en: 'Default', ko: '기본' },
                colors: {
                    primary: '#007bff',
                    secondary: '#6c757d',
                    accent: '#28a745',
                    background: '#ffffff',
                    text: '#333333',
                    header: '#f8f9fa',
                    card: '#ffffff',
                    border: '#dee2e6'
                }
            },
            spring: {
                name: { zh: '春季', en: 'Spring', ko: '봄' },
                colors: {
                    primary: '#e91e63',
                    secondary: '#ff9800',
                    accent: '#4caf50',
                    background: '#fff5f5',
                    text: '#5d4037',
                    header: '#fce4ec',
                    card: '#ffffff',
                    border: '#f8bbd0'
                }
            },
            summer: {
                name: { zh: '夏季', en: 'Summer', ko: '여름' },
                colors: {
                    primary: '#2196f3',
                    secondary: '#00bcd4',
                    accent: '#ffeb3b',
                    background: '#f0f8ff',
                    text: '#0d47a1',
                    header: '#e3f2fd',
                    card: '#ffffff',
                    border: '#90caf9'
                }
            },
            autumn: {
                name: { zh: '秋季', en: 'Autumn', ko: '가을' },
                colors: {
                    primary: '#795548',
                    secondary: '#ff5722',
                    accent: '#ffc107',
                    background: '#fff8e1',
                    text: '#3e2723',
                    header: '#efebe9',
                    card: '#ffffff',
                    border: '#d7ccc8'
                }
            },
            winter: {
                name: { zh: '冬季', en: 'Winter', ko: '겨울' },
                colors: {
                    primary: '#607d8b',
                    secondary: '#9c27b0',
                    accent: '#03a9f4',
                    background: '#eceff1',
                    text: '#263238',
                    header: '#cfd8dc',
                    card: '#ffffff',
                    border: '#b0bec5'
                }
            },
            dark: {
                name: { zh: '暗夜', en: 'Dark', ko: '다크' },
                colors: {
                    primary: '#bb86fc',
                    secondary: '#03dac6',
                    accent: '#cf6679',
                    background: '#121212',
                    text: '#ffffff',
                    header: '#1e1e1e',
                    card: '#1e1e1e',
                    border: '#333333'
                }
            },
            business: {
                name: { zh: '商务', en: 'Business', ko: '비즈니스' },
                colors: {
                    primary: '#1a237e',
                    secondary: '#455a64',
                    accent: '#00bcd4',
                    background: '#f5f5f5',
                    text: '#212121',
                    header: '#e8eaf6',
                    card: '#ffffff',
                    border: '#c5cae9'
                }
            },
            casual: {
                name: { zh: '休闲', en: 'Casual', ko: '캐주얼' },
                colors: {
                    primary: '#ff7043',
                    secondary: '#26a69a',
                    accent: '#ffee58',
                    background: '#fff3e0',
                    text: '#4e342e',
                    header: '#ffe0b2',
                    card: '#ffffff',
                    border: '#ffcc80'
                }
            }
        };
        this.currentTheme = localStorage.getItem(this.themeKey) || 'default';
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.renderThemeSwitcher();
    }

    getThemeList() {
        return Object.keys(this.themes).map(key => ({
            id: key,
            name: this.themes[key].name
        }));
    }

    applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme) return;

        this.currentTheme = themeId;
        localStorage.setItem(this.themeKey, themeId);

        const root = document.documentElement;
        root.style.setProperty('--theme-primary', theme.colors.primary);
        root.style.setProperty('--theme-secondary', theme.colors.secondary);
        root.style.setProperty('--theme-accent', theme.colors.accent);
        root.style.setProperty('--theme-background', theme.colors.background);
        root.style.setProperty('--theme-text', theme.colors.text);
        root.style.setProperty('--theme-header', theme.colors.header);
        root.style.setProperty('--theme-card', theme.colors.card);
        root.style.setProperty('--theme-border', theme.colors.border);

        document.body.className = `theme-${themeId}`;
    }

    renderThemeSwitcher() {
        const existing = document.getElementById('theme-switcher');
        if (existing) existing.remove();

        const header = document.querySelector('.nav-actions');
        if (!header) return;

        const currentLang = i18n?.currentLanguage || 'zh';

        const switcher = document.createElement('div');
        switcher.id = 'theme-switcher';
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-btn" title="${i18n?.t('switchTheme') || '切换主题'}">
                <span class="theme-icon">🎨</span>
            </button>
            <div class="theme-dropdown">
                <div class="theme-title">${i18n?.t('selectTheme') || '选择主题'}</div>
                <div class="theme-list">
                    ${Object.keys(this.themes).map(key => `
                        <div class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                            <span class="theme-color" style="background: ${this.themes[key].colors.primary}"></span>
                            <span class="theme-name">${this.themes[key].name[currentLang]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        header.appendChild(switcher);

        const btn = switcher.querySelector('.theme-btn');
        const dropdown = switcher.querySelector('.theme-dropdown');

        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('active');
        });

        switcher.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const themeId = option.dataset.theme;
                this.applyTheme(themeId);
                this.renderThemeSwitcher();
            });
        });
    }
}

const themeManager = new ThemeManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeManager;
} else {
    window.themeManager = themeManager;
}
