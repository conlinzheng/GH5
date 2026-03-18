class DataManager {
    constructor() {
        this.productsData = {};
        this.seriesList = [];
        this.siteConfig = this.loadSiteConfig();
        this.events = {};
    }

    /**
     * 加载网站配置
     * @returns {object} 网站配置
     */
    loadSiteConfig() {
        try {
            const config = localStorage.getItem('site_config');
            return config ? JSON.parse(config) : {
                contactInfo: {
                    phone: '123-456-7890',
                    email: 'info@example.com'
                },
                footer: {
                    aboutText: '我们提供高品质的产品，满足您的需求。',
                    copyright: '© 2026 产品展示. 保留所有权利.'
                },
                socialLinks: {
                    wechat: '#',
                    weibo: '#',
                    instagram: '#'
                }
            };
        } catch (error) {
            console.error('Error loading site config:', error);
            return {
                contactInfo: {
                    phone: '123-456-7890',
                    email: 'info@example.com'
                },
                footer: {
                    aboutText: '我们提供高品质的产品，满足您的需求。',
                    copyright: '© 2026 产品展示. 保留所有权利.'
                },
                socialLinks: {
                    wechat: '#',
                    weibo: '#',
                    instagram: '#'
                }
            };
        }
    }

    /**
     * 保存网站配置
     * @param {object} config - 网站配置
     */
    saveSiteConfig(config) {
        this.siteConfig = config;
        try {
            localStorage.setItem('site_config', JSON.stringify(config));
            this.trigger('configChanged', config);
        } catch (error) {
            console.error('Error saving site config:', error);
        }
    }

    /**
     * 获取网站配置
     * @returns {object} 网站配置
     */
    getSiteConfig() {
        return this.siteConfig;
    }

    /**
     * 从GitHub加载产品数据
     */
    async loadFromGitHub() {
        try {
            const seriesList = await githubAPI.fetchDirectory('产品图');
            this.seriesList = seriesList.filter(item => item.type === 'dir').map(item => item.name);

            const productsData = {};
            for (const seriesId of this.seriesList) {
                // 扫描该系列下的图片
                const images = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
                const imageFiles = images.filter(item => 
                    item.type === 'file' && 
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
                );

                // 尝试读取 products.json
                let seriesData = null;
                try {
                    const productsJson = await githubAPI.fetchFile(`产品图/${seriesId}/products.json`);
                    const parsed = JSON.parse(productsJson.content);
                    // 检查是否有产品数据
                    if (parsed.products && Object.keys(parsed.products).length > 0) {
                        seriesData = parsed;
                    }
                } catch (error) {
                    // products.json 不存在或解析失败
                }

                // 如果没有产品数据，从图片文件名生成
                if (!seriesData || !seriesData.products || Object.keys(seriesData.products).length === 0) {
                    seriesData = {
                        seriesName: {
                            zh: seriesId.split('-')[1] || seriesId,
                            en: seriesId.split('-')[1] || seriesId,
                            ko: seriesId.split('-')[1] || seriesId
                        },
                        products: {}
                    };
                    
                    // 从图片文件名生成产品
                    imageFiles.forEach(img => {
                        const productName = img.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
                        seriesData.products[img.name] = {
                            name: { 
                                zh: productName, 
                                en: productName, 
                                ko: productName 
                            },
                            description: { 
                                zh: `${productName} - 高品质产品`, 
                                en: `${productName} - High quality product`, 
                                ko: `${productName} - 고품질 제품` 
                            },
                            price: '',
                            materials: { upper: '', lining: '', sole: '' }
                        };
                    });
                }

                productsData[seriesId] = seriesData;
            }

            this.productsData = productsData;
            this.trigger('dataLoaded', productsData);
        } catch (error) {
            console.error('Error loading data from GitHub:', error);
            throw error;
        }
    }

    /**
     * 保存产品数据到GitHub
     * @param {string} seriesId - 系列ID
     */
    async saveToGitHub(seriesId) {
        try {
            const seriesData = this.productsData[seriesId];
            if (!seriesData) {
                throw new Error('Series not found');
            }

            const content = JSON.stringify(seriesData, null, 2);
            await githubAPI.commitFile(`产品图/${seriesId}/products.json`, content, `Update products for ${seriesId}`);
            this.trigger('dataSaved', seriesId);
        } catch (error) {
            console.error('Error saving data to GitHub:', error);
            throw error;
        }
    }

    /**
     * 获取所有系列
     * @returns {array} 系列列表
     */
    getSeriesList() {
        return this.seriesList;
    }

    /**
     * 获取所有产品数据
     * @returns {object} 产品数据
     */
    getProductsData() {
        return this.productsData;
    }

    /**
     * 按系列获取产品
     * @param {string} seriesId - 系列ID
     * @returns {object} 系列产品数据
     */
    getProductsBySeries(seriesId) {
        return this.productsData[seriesId] || {
            seriesName: {
                zh: seriesId.split('-')[1] || seriesId,
                en: seriesId.split('-')[1] || seriesId,
                ko: seriesId.split('-')[1] || seriesId
            },
            products: {}
        };
    }

    /**
     * 更新产品数据
     * @param {string} seriesId - 系列ID
     * @param {string} productId - 产品ID
     * @param {object} data - 产品数据
     */
    updateProduct(seriesId, productId, data) {
        if (!this.productsData[seriesId]) {
            this.productsData[seriesId] = {
                seriesName: {
                    zh: seriesId.split('-')[1] || seriesId,
                    en: seriesId.split('-')[1] || seriesId,
                    ko: seriesId.split('-')[1] || seriesId
                },
                products: {}
            };
        }

        this.productsData[seriesId].products[productId] = data;
        this.trigger('productUpdated', { seriesId, productId, data });
    }

    /**
     * 添加产品
     * @param {string} seriesId - 系列ID
     * @param {string} productId - 产品ID
     * @param {object} productData - 产品数据
     */
    addProduct(seriesId, productId, productData) {
        if (!this.productsData[seriesId]) {
            this.productsData[seriesId] = {
                seriesName: {
                    zh: seriesId.split('-')[1] || seriesId,
                    en: seriesId.split('-')[1] || seriesId,
                    ko: seriesId.split('-')[1] || seriesId
                },
                products: {}
            };
        }

        this.productsData[seriesId].products[productId] = productData;
        this.trigger('productAdded', { seriesId, productId, productData });
    }

    /**
     * 删除产品
     * @param {string} seriesId - 系列ID
     * @param {string} productId - 产品ID
     */
    deleteProduct(seriesId, productId) {
        if (this.productsData[seriesId] && this.productsData[seriesId].products[productId]) {
            delete this.productsData[seriesId].products[productId];
            this.trigger('productDeleted', { seriesId, productId });
        }
    }

    /**
     * 更新系列信息
     * @param {string} seriesId - 系列ID
     * @param {object} seriesData - 系列数据
     */
    updateSeries(seriesId, seriesData) {
        if (!this.productsData[seriesId]) {
            this.productsData[seriesId] = {
                seriesName: {
                    zh: seriesId.split('-')[1] || seriesId,
                    en: seriesId.split('-')[1] || seriesId,
                    ko: seriesId.split('-')[1] || seriesId
                },
                products: {}
            };
        }

        this.productsData[seriesId] = { ...this.productsData[seriesId], ...seriesData };
        this.trigger('seriesUpdated', { seriesId, seriesData });
    }

    /**
     * 添加系列
     * @param {string} seriesId - 系列ID
     * @param {object} seriesData - 系列数据
     */
    addSeries(seriesId, seriesData) {
        this.productsData[seriesId] = seriesData;
        this.seriesList.push(seriesId);
        this.trigger('seriesAdded', { seriesId, seriesData });
    }

    /**
     * 删除系列
     * @param {string} seriesId - 系列ID
     */
    deleteSeries(seriesId) {
        if (this.productsData[seriesId]) {
            delete this.productsData[seriesId];
            this.seriesList = this.seriesList.filter(id => id !== seriesId);
            this.trigger('seriesDeleted', seriesId);
        }
    }

    /**
     * 扫描新图片
     * @returns {object} 新图片列表
     */
    async scanForNewImages() {
        try {
            return await githubAPI.scanForNewImages();
        } catch (error) {
            console.error('Error scanning for new images:', error);
            return {};
        }
    }

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {any} data - 事件数据
     */
    trigger(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                callback(data);
            });
        }
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {function} callback - 回调函数
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// 导出单例
const dataManager = new DataManager();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataManager;
} else {
    window.dataManager = dataManager;
}