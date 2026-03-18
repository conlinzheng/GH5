class ConfigEditor {
    constructor() {
        this.container = document.getElementById('config-editor');
    }

    /**
     * 初始化配置编辑器
     */
    init() {
        const siteConfig = dataManager.getSiteConfig();
        this.render(siteConfig);
    }

    /**
     * 渲染配置编辑器
     * @param {object} siteConfig - 网站配置
     */
    render(siteConfig) {
        if (!this.container) return;

        const contactInfo = siteConfig.contactInfo || {
            phone: '123-456-7890',
            email: 'info@example.com'
        };

        const footer = siteConfig.footer || {
            aboutText: '我们提供高品质的产品，满足您的需求。',
            copyright: '© 2026 产品展示. 保留所有权利.'
        };

        const socialLinks = siteConfig.socialLinks || {
            wechat: '#',
            weibo: '#',
            instagram: '#'
        };

        const html = `
            <div class="config-editor-header">
                <h2>网站配置</h2>
                <div class="config-actions">
                    <button id="export-config" class="btn btn-primary">导出配置</button>
                    <button id="import-config" class="btn btn-secondary">导入配置</button>
                </div>
            </div>
            <div class="config-form">
                <div class="form-section">
                    <h3>联系信息</h3>
                    <div class="form-group">
                        <label for="contact-phone">电话</label>
                        <input type="text" id="contact-phone" class="form-control" value="${contactInfo.phone}" placeholder="联系电话">
                    </div>
                    <div class="form-group">
                        <label for="contact-email">邮箱</label>
                        <input type="email" id="contact-email" class="form-control" value="${contactInfo.email}" placeholder="联系邮箱">
                    </div>
                </div>
                <div class="form-section">
                    <h3>页脚信息</h3>
                    <div class="form-group">
                        <label for="footer-about">关于我们</label>
                        <textarea id="footer-about" class="form-control" rows="3" placeholder="关于我们的描述">${footer.aboutText}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="footer-copyright">版权信息</label>
                        <input type="text" id="footer-copyright" class="form-control" value="${footer.copyright}" placeholder="版权信息">
                    </div>
                </div>
                <div class="form-section">
                    <h3>社交媒体链接</h3>
                    <div class="form-group">
                        <label for="social-wechat">微信</label>
                        <input type="text" id="social-wechat" class="form-control" value="${socialLinks.wechat}" placeholder="微信链接">
                    </div>
                    <div class="form-group">
                        <label for="social-weibo">微博</label>
                        <input type="text" id="social-weibo" class="form-control" value="${socialLinks.weibo}" placeholder="微博链接">
                    </div>
                    <div class="form-group">
                        <label for="social-instagram">Instagram</label>
                        <input type="text" id="social-instagram" class="form-control" value="${socialLinks.instagram}" placeholder="Instagram链接">
                    </div>
                </div>
                <button id="save-config" class="btn btn-success">保存配置</button>
            </div>
        `;

        this.container.innerHTML = html;
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const saveConfigBtn = document.getElementById('save-config');
        const exportConfigBtn = document.getElementById('export-config');
        const importConfigBtn = document.getElementById('import-config');

        // 保存配置
        saveConfigBtn.addEventListener('click', () => {
            const contactInfo = {
                phone: document.getElementById('contact-phone').value,
                email: document.getElementById('contact-email').value
            };

            const footer = {
                aboutText: document.getElementById('footer-about').value,
                copyright: document.getElementById('footer-copyright').value
            };

            const socialLinks = {
                wechat: document.getElementById('social-wechat').value,
                weibo: document.getElementById('social-weibo').value,
                instagram: document.getElementById('social-instagram').value
            };

            const config = {
                contactInfo,
                footer,
                socialLinks
            };

            dataManager.saveSiteConfig(config);
            notifier.success('配置保存成功');
        });

        // 导出配置
        exportConfigBtn.addEventListener('click', () => {
            const config = dataManager.getSiteConfig();
            const configJson = JSON.stringify(config, null, 2);
            const blob = new Blob([configJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'site-config.json';
            a.click();
            URL.revokeObjectURL(url);
        });

        // 导入配置
        importConfigBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const config = JSON.parse(e.target.result);
                            dataManager.saveSiteConfig(config);
                            this.render(config);
                            notifier.success('配置导入成功');
                        } catch (error) {
                            console.error('Error parsing config file:', error);
                            notifier.error('配置文件格式错误');
                        }
                    };
                    reader.readAsText(file);
                }
            });
            input.click();
        });
    }
}

// 导出单例
const configEditor = new ConfigEditor();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = configEditor;
} else {
    window.configEditor = configEditor;
}