class App {
    constructor() {
        this.currentView = null;
        this.views = {
            'product-editor': null,
            'upload': null,
            'series-manager': null,
            'config-editor': null
        };
    }

    init() {
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        this.bindTokenModal();
        this.bindSaveConfigButton();

        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1);
        const viewName = hash || '';

        this.clearNavActive();
        this.activateNavItem(viewName);
        this.loadView(viewName);
    }

    clearNavActive() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    activateNavItem(viewName) {
        const navItem = document.querySelector(`.nav-item[href="#${viewName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    }

    async loadView(viewName) {
        const container = document.getElementById('view-container');
        if (!container) return;

        container.innerHTML = '<div class="loading">加载中...</div>';

        try {
            switch (viewName) {
                case 'product-editor':
                    await this.loadProductEditor(container);
                    break;
                case 'upload':
                    await this.loadUploadManager(container);
                    break;
                case 'series-manager':
                    await this.loadSeriesManager(container);
                    break;
                case 'config-editor':
                    await this.loadConfigEditor(container);
                    break;
                default:
                    this.loadWelcomeView(container);
                    break;
            }
        } catch (error) {
            console.error('Error loading view:', error);
            container.innerHTML = '<div class="error">加载视图失败，请刷新页面重试</div>';
        }
    }

    async loadProductEditor(container) {
        if (!this.views['product-editor']) {
            this.views['product-editor'] = productEditor;
        }
        container.innerHTML = '<div id="product-editor"></div>';
        await this.views['product-editor'].init();
        this.currentView = 'product-editor';
    }

    async loadUploadManager(container) {
        if (!this.views['upload']) {
            this.views['upload'] = uploadManager;
        }
        container.innerHTML = '<div id="upload-manager"></div>';
        await this.views['upload'].init();
        this.currentView = 'upload';
    }

    async loadSeriesManager(container) {
        if (!this.views['series-manager']) {
            this.views['series-manager'] = seriesManager;
        }
        container.innerHTML = '<div id="series-manager"></div>';
        await this.views['series-manager'].init();
        this.currentView = 'series-manager';
    }

    async loadConfigEditor(container) {
        if (!this.views['config-editor']) {
            this.views['config-editor'] = configEditor;
        }
        container.innerHTML = '<div id="config-editor"></div>';
        this.views['config-editor'].init();
        this.currentView = 'config-editor';
    }

    loadWelcomeView(container) {
        container.innerHTML = `
            <div class="welcome-view">
                <h2>欢迎使用后台管理系统</h2>
                <p>请从左侧选择一个功能模块开始操作</p>
            </div>
        `;
        this.currentView = null;
    }

    bindTokenModal() {
        const btnSetToken = document.getElementById('btn-set-token');
        const tokenModal = document.getElementById('token-modal');
        const closeBtn = tokenModal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancel-token');
        const saveBtn = document.getElementById('save-token');
        const tokenInput = document.getElementById('github-token');

        if (!btnSetToken || !tokenModal) return;

        btnSetToken.addEventListener('click', () => {
            const existingToken = githubAPI.getToken();
            if (existingToken) {
                tokenInput.value = existingToken;
            }
            tokenModal.classList.add('show');
        });

        const closeModal = () => {
            tokenModal.classList.remove('show');
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        tokenModal.addEventListener('click', (e) => {
            if (e.target === tokenModal) {
                closeModal();
            }
        });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const token = tokenInput.value.trim();
                if (token) {
                    githubAPI.setToken(token);
                    githubSync.setToken(token);
                    notifier.success('Token 保存成功');
                    closeModal();
                } else {
                    notifier.warning('请输入有效的 Token');
                }
            });
        }
    }

    bindSaveConfigButton() {
        const btnSaveConfig = document.getElementById('btn-save-config');
        if (!btnSaveConfig) return;

        btnSaveConfig.addEventListener('click', async () => {
            notifier.info('保存配置...');
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});