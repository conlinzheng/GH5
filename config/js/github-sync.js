class GitHubSync {
    constructor() {
        this.token = localStorage.getItem('github_token') || '';
    }

    /**
     * 设置GitHub Token
     * @param {string} token - GitHub个人访问令牌
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
        githubAPI.setToken(token);
    }

    /**
     * 获取GitHub Token
     * @returns {string} GitHub个人访问令牌
     */
    getToken() {
        return this.token;
    }

    /**
     * 检查是否有Token
     * @returns {boolean} 是否有Token
     */
    hasToken() {
        return !!this.token;
    }

    /**
     * 获取系列列表
     * @returns {array} 系列列表
     */
    async fetchSeriesList() {
        try {
            const seriesList = await githubAPI.fetchDirectory('产品图');
            return seriesList.filter(item => item.type === 'dir').map(item => item.name);
        } catch (error) {
            console.error('Error fetching series list:', error);
            throw error;
        }
    }

    /**
     * 获取系列图片
     * @param {string} seriesId - 系列ID
     * @returns {array} 图片列表
     */
    async fetchSeriesImages(seriesId) {
        try {
            const images = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
            return images.filter(item => 
                item.type === 'file' && 
                /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
            );
        } catch (error) {
            console.error(`Error fetching images for series ${seriesId}:`, error);
            throw error;
        }
    }

    /**
     * 获取系列元数据
     * @param {string} seriesId - 系列ID
     * @returns {object} 系列元数据
     */
    async fetchSeriesMetadata(seriesId) {
        try {
            const productsJson = await githubAPI.fetchFile(`产品图/${seriesId}/products.json`);
            return JSON.parse(productsJson.content);
        } catch (error) {
            // products.json不存在，返回默认数据
            return {
                seriesName: {
                    zh: seriesId.split('-')[1] || seriesId,
                    en: seriesId.split('-')[1] || seriesId,
                    ko: seriesId.split('-')[1] || seriesId
                },
                products: {}
            };
        }
    }

    /**
     * 推送系列元数据
     * @param {string} seriesId - 系列ID
     * @param {object} metadata - 系列元数据
     */
    async pushSeriesMetadata(seriesId, metadata) {
        try {
            const content = JSON.stringify(metadata, null, 2);
            await githubAPI.commitFile(`产品图/${seriesId}/products.json`, content, `Update products for ${seriesId}`);
        } catch (error) {
            console.error(`Error pushing metadata for series ${seriesId}:`, error);
            throw error;
        }
    }

    /**
     * 上传图片
     * @param {string} seriesId - 系列ID
     * @param {File} file - 图片文件
     * @returns {object} 上传结果
     */
    async uploadImage(seriesId, file) {
        try {
            return await githubAPI.uploadImage(seriesId, file);
        } catch (error) {
            console.error(`Error uploading image to series ${seriesId}:`, error);
            throw error;
        }
    }

    /**
     * 批量上传图片
     * @param {string} seriesId - 系列ID
     * @param {array} files - 图片文件数组
     * @param {function} progressCallback - 进度回调函数
     * @returns {object} 上传结果
     */
    async uploadImages(seriesId, files, progressCallback) {
        const results = {
            success: [],
            failed: []
        };

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                await this.uploadImage(seriesId, file);
                results.success.push(file.name);
            } catch (error) {
                results.failed.push({ name: file.name, error: error.message });
            }

            // 调用进度回调
            if (progressCallback) {
                progressCallback(i + 1, files.length);
            }
        }

        return results;
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
            throw error;
        }
    }

    /**
     * 创建系列文件夹
     * @param {string} seriesId - 系列ID
     */
    async createSeries(seriesId) {
        try {
            // 创建空的products.json文件
            const content = JSON.stringify({
                seriesName: {
                    zh: seriesId.split('-')[1] || seriesId,
                    en: seriesId.split('-')[1] || seriesId,
                    ko: seriesId.split('-')[1] || seriesId
                },
                products: {}
            }, null, 2);

            await githubAPI.commitFile(`产品图/${seriesId}/products.json`, content, `Create series ${seriesId}`);
        } catch (error) {
            console.error(`Error creating series ${seriesId}:`, error);
            throw error;
        }
    }

    /**
     * 删除系列文件夹
     * @param {string} seriesId - 系列ID
     */
    async deleteSeries(seriesId) {
        try {
            // 由于GitHub API不支持直接删除文件夹，需要删除文件夹中的所有文件
            const files = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
            
            for (const file of files) {
                if (file.type === 'file') {
                    // 删除文件（需要先获取文件的SHA值）
                    const fileData = await githubAPI.fetchFile(`产品图/${seriesId}/${file.name}`);
                    await githubAPI.commitFile(
                        `产品图/${seriesId}/${file.name}`,
                        '',
                        `Delete ${file.name}`,
                        fileData.sha
                    );
                }
            }
        } catch (error) {
            console.error(`Error deleting series ${seriesId}:`, error);
            throw error;
        }
    }
}

// 导出单例
const githubSync = new GitHubSync();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = githubSync;
} else {
    window.githubSync = githubSync;
}