class DataManager {
    constructor() {
        this.productsData = {};
        this.seriesList = [];
        this.siteConfig = this.loadSiteConfig();
        this.events = {};
    }

    loadSiteConfig() {
        try {
            const config = localStorage.getItem('site_config');
            return config ? JSON.parse(config) : {
                contactInfo: { phone: '123-456-7890', email: 'info@example.com' },
                footer: { aboutText: '我们提供高品质的产品，满足您的需求。', copyright: '© 2026 产品展示. 保留所有权利.' },
                socialLinks: { wechat: '#', weibo: '#', instagram: '#' }
            };
        } catch (error) {
            console.error('Error loading site config:', error);
            return {
                contactInfo: { phone: '123-456-7890', email: 'info@example.com' },
                footer: { aboutText: '我们提供高品质的产品，满足您的需求。', copyright: '© 2026 产品展示. 保留所有权利.' },
                socialLinks: { wechat: '#', weibo: '#', instagram: '#' }
            };
        }
    }

    saveSiteConfig(config) {
        this.siteConfig = config;
        try {
            localStorage.setItem('site_config', JSON.stringify(config));
            this.trigger('configChanged', config);
        } catch (error) {
            console.error('Error saving site config:', error);
        }
    }

    getSiteConfig() {
        return this.siteConfig;
    }

    async loadFromGitHub() {
        try {
            const seriesList = await githubAPI.fetchDirectory('产品图');
            this.seriesList = seriesList.filter(item => item.type === 'dir').map(item => item.name);

            const productsData = {};
            for (const seriesId of this.seriesList) {
                try {
                    const productsJson = await githubAPI.fetchFile(`产品图/${seriesId}/products.json`);
                    const seriesData = JSON.parse(productsJson.content);
                    productsData[seriesId] = seriesData;
                } catch (error) {
                    productsData[seriesId] = {
                        seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
                        products: {}
                    };
                }
            }

            this.productsData = productsData;
            this.trigger('dataLoaded', productsData);
        } catch (error) {
            console.error('Error loading data from GitHub:', error);
            throw error;
        }
    }

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

    getSeriesList() {
        return this.seriesList;
    }

    getProductsData() {
        return this.productsData;
    }

    getProductsBySeries(seriesId) {
        return this.productsData[seriesId] || {
            seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
            products: {}
        };
    }

    updateProduct(seriesId, productId, data) {
        if (!this.productsData[seriesId]) {
            this.productsData[seriesId] = {
                seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
                products: {}
            };
        }

        this.productsData[seriesId].products[productId] = data;
        this.trigger('productUpdated', { seriesId, productId, data });
    }

    addProduct(seriesId, productId, productData) {
        if (!this.productsData[seriesId]) {
            this.productsData[seriesId] = {
                seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
                products: {}
            };
        }

        this.productsData[seriesId].products[productId] = productData;
        this.trigger('productAdded', { seriesId, productId, productData });
    }

    deleteProduct(seriesId, productId) {
        if (this.productsData[seriesId] && this.productsData[seriesId].products[productId]) {
            delete this.productsData[seriesId].products[productId];
            this.trigger('productDeleted', { seriesId, productId });
        }
    }

    updateSeries(seriesId, seriesData) {
        if (!this.productsData[seriesId]) {
            this.productsData[seriesId] = {
                seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
                products: {}
            };
        }

        this.productsData[seriesId] = { ...this.productsData[seriesId], ...seriesData };
        this.trigger('seriesUpdated', { seriesId, seriesData });
    }

    async scanForNewImages() {
        try {
            return await githubAPI.scanForNewImages();
        } catch (error) {
            console.error('Error scanning for new images:', error);
            return {};
        }
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    trigger(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                callback(data);
            });
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

const dataManager = new DataManager();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataManager;
} else {
    window.dataManager = dataManager;
}