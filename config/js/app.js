class App {
    constructor() {
        this.currentView = null;
        this.views = {
            'product-editor': null,
            'upload': null,
            'series-manager': null,
            'config-editor': null,
            'translation-manager': null
        };
    }

    /**
     * 初始化应用
     */
    init() {
        // 初始化 GitHub Token
        const savedToken = localStorage.getItem('github_token');
        if (savedToken) {
            githubAPI.setToken(savedToken);
        }

        // 绑定路由变化事件
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // 绑定Token设置按钮
        this.bindTokenModal();

        // 绑定保存配置按钮
        this.bindSaveConfigButton();

        // 处理初始路由
        this.handleRouteChange();
    }

    /**
     * 处理路由变化
     */
    handleRouteChange() {
        const hash = window.location.hash.slice(1); // 移除#号
        const [viewName, ...params] = hash.split('&');

        // 清除所有导航项的active状态
        this.clearNavActive();

        // 激活当前导航项
        this.activateNavItem(viewName);

        // 加载对应视图
        this.loadView(viewName, params);
    }

    /**
     * 清除所有导航项的active状态
     */
    clearNavActive() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    /**
     * 激活指定导航项
     * @param {string} viewName - 视图名称
     */
    activateNavItem(viewName) {
        const navItem = document.querySelector(`.nav-item[href="#${viewName}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }
    }

    /**
     * 加载视图
     * @param {string} viewName - 视图名称
     * @param {array} params - 路由参数
     */
    async loadView(viewName, params) {
        const container = document.getElementById('view-container');
        if (!container) return;

        // 显示加载状态
        container.innerHTML = '<div class="loading">加载中...</div>';

        try {
            switch (viewName) {
                case 'product-editor':
                    await this.loadProductEditor(params);
                    break;
                case 'upload':
                    await this.loadUploadManager();
                    break;
                case 'series-manager':
                    await this.loadSeriesManager();
                    break;
                case 'config-editor':
                    await this.loadConfigEditor();
                    break;
                case 'translation-manager':
                    await this.loadTranslationManager();
                    break;
                default:
                    this.loadWelcomeView();
                    break;
            }
        } catch (error) {
            console.error('Error loading view:', error);
            container.innerHTML = '<div class="error">加载视图失败，请刷新页面重试</div>';
        }
    }

    /**
     * 加载产品编辑视图
     * @param {array} params - 路由参数
     */
    async loadProductEditor(params) {
        const container = document.getElementById('view-container');
        if (!container) return;

        // 检查是否已初始化
        if (!this.views['product-editor']) {
            // 初始化产品编辑器
            this.views['product-editor'] = new ProductEditor();
        }

        // 渲染视图
        await this.views['product-editor'].render(container, params);
        this.currentView = 'product-editor';
    }

    /**
     * 加载图片上传视图
     */
    async loadUploadManager() {
        const container = document.getElementById('view-container');
        if (!container) return;

        // 检查是否已初始化
        if (!this.views['upload']) {
            // 初始化上传管理器
            this.views['upload'] = new UploadManager();
        }

        // 渲染视图
        await this.views['upload'].render(container);
        this.currentView = 'upload';
    }

    /**
     * 加载系列管理视图
     */
    async loadSeriesManager() {
        const container = document.getElementById('view-container');
        if (!container) return;

        // 检查是否已初始化
        if (!this.views['series-manager']) {
            // 初始化系列管理器
            this.views['series-manager'] = new SeriesManager();
        }

        // 渲染视图
        await this.views['series-manager'].render(container);
        this.currentView = 'series-manager';
    }

    /**
     * 加载网站配置视图
     */
    async loadConfigEditor() {
        const container = document.getElementById('view-container');
        if (!container) return;

        // 检查是否已初始化
        if (!this.views['config-editor']) {
            // 初始化配置编辑器
            this.views['config-editor'] = new ConfigEditor();
        }

        // 渲染视图
        await this.views['config-editor'].render(container);
        this.currentView = 'config-editor';
    }

    /**
     * 加载翻译管理视图
     */
    async loadTranslationManager() {
        const container = document.getElementById('view-container');
        if (!container) return;

        // 检查是否已初始化
        if (!this.views['translation-manager']) {
            // 初始化翻译管理器
            this.views['translation-manager'] = new TranslationManager();
        }

        // 渲染视图
        await this.views['translation-manager'].render(container);
        this.currentView = 'translation-manager';
    }

    /**
     * 加载欢迎视图
     */
    loadWelcomeView() {
        const container = document.getElementById('view-container');
        if (!container) return;

        container.innerHTML = `
            <div class="welcome-view">
                <h2>欢迎使用后台管理系统</h2>
                <p>请从左侧选择一个功能模块开始操作</p>
            </div>
        `;
        this.currentView = null;
    }

    /**
     * 绑定Token设置模态框
     */
    bindTokenModal() {
        const btnSetToken = document.getElementById('btn-set-token');
        const tokenModal = document.getElementById('token-modal');
        const closeBtn = tokenModal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancel-token');
        const saveBtn = document.getElementById('save-token');
        const tokenInput = document.getElementById('github-token');

        if (!btnSetToken || !tokenModal) return;

        // 打开模态框
        btnSetToken.addEventListener('click', () => {
            // 填充现有token
            const existingToken = githubAPI.getToken();
            if (existingToken) {
                tokenInput.value = existingToken;
            }
            tokenModal.classList.add('show');
        });

        // 关闭模态框
        const closeModal = () => {
            tokenModal.classList.remove('show');
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // 点击模态框外部关闭
        tokenModal.addEventListener('click', (e) => {
            if (e.target === tokenModal) {
                closeModal();
            }
        });

        // 保存Token
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const token = tokenInput.value.trim();
                if (token) {
                    githubAPI.setToken(token);
                    notifier.success('Token 保存成功');
                    closeModal();
                } else {
                    notifier.warning('请输入有效的 Token');
                }
            });
        }
    }

    /**
     * 绑定保存配置按钮
     */
    bindSaveConfigButton() {
        const btnSaveConfig = document.getElementById('btn-save-config');
        if (!btnSaveConfig) return;

        btnSaveConfig.addEventListener('click', async () => {
            if (this.currentView === 'product-editor' && this.views['product-editor']) {
                await this.views['product-editor'].saveChanges();
            } else if (this.currentView === 'config-editor' && this.views['config-editor']) {
                await this.views['config-editor'].saveChanges();
            } else if (this.currentView === 'series-manager' && this.views['series-manager']) {
                await this.views['series-manager'].saveChanges();
            } else {
                notifier.info('当前视图没有需要保存的内容');
            }
        });
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    window.app = app;
    app.init();
});