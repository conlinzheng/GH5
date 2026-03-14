class GitHubSync {
    constructor() {
        this.token = localStorage.getItem('github_token') || '';
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
        githubAPI.setToken(token);
    }

    getToken() {
        return this.token;
    }

    hasToken() {
        return !!this.token;
    }

    async fetchSeriesList() {
        try {
            const seriesList = await githubAPI.fetchDirectory('产品图');
            return seriesList.filter(item => item.type === 'dir').map(item => item.name);
        } catch (error) {
            console.error('Error fetching series list:', error);
            throw error;
        }
    }

    async fetchSeriesImages(seriesId) {
        try {
            const images = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
            return images.filter(item => item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name));
        } catch (error) {
            console.error(`Error fetching images for series ${seriesId}:`, error);
            throw error;
        }
    }

    async fetchSeriesMetadata(seriesId) {
        try {
            const productsJson = await githubAPI.fetchFile(`产品图/${seriesId}/products.json`);
            return JSON.parse(productsJson.content);
        } catch (error) {
            return {
                seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
                products: {}
            };
        }
    }

    async pushSeriesMetadata(seriesId, metadata) {
        try {
            const content = JSON.stringify(metadata, null, 2);
            await githubAPI.commitFile(`产品图/${seriesId}/products.json`, content, `Update products for ${seriesId}`);
        } catch (error) {
            console.error(`Error pushing metadata for series ${seriesId}:`, error);
            throw error;
        }
    }

    async uploadImage(seriesId, file) {
        try {
            return await githubAPI.uploadImage(seriesId, file);
        } catch (error) {
            console.error(`Error uploading image to series ${seriesId}:`, error);
            throw error;
        }
    }

    async uploadImages(seriesId, files, progressCallback) {
        const results = { success: [], failed: [] };

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                await this.uploadImage(seriesId, file);
                results.success.push(file.name);
            } catch (error) {
                results.failed.push({ name: file.name, error: error.message });
            }

            if (progressCallback) {
                progressCallback(i + 1, files.length);
            }
        }

        return results;
    }

    async scanForNewImages() {
        try {
            return await githubAPI.scanForNewImages();
        } catch (error) {
            console.error('Error scanning for new images:', error);
            throw error;
        }
    }

    async createSeries(seriesId) {
        try {
            const content = JSON.stringify({
                seriesName: { zh: seriesId.split('-')[1] || seriesId, en: seriesId.split('-')[1] || seriesId, ko: seriesId.split('-')[1] || seriesId },
                products: {}
            }, null, 2);

            await githubAPI.commitFile(`产品图/${seriesId}/products.json`, content, `Create series ${seriesId}`);
        } catch (error) {
            console.error(`Error creating series ${seriesId}:`, error);
            throw error;
        }
    }

    async deleteSeries(seriesId) {
        try {
            const files = await githubAPI.fetchDirectory(`产品图/${seriesId}`);
            
            for (const file of files) {
                if (file.type === 'file') {
                    const fileData = await githubAPI.fetchFile(`产品图/${seriesId}/${file.name}`);
                    await githubAPI.commitFile(`产品图/${seriesId}/${file.name}`, '', `Delete ${file.name}`, fileData.sha);
                }
            }
        } catch (error) {
            console.error(`Error deleting series ${seriesId}:`, error);
            throw error;
        }
    }
}

const githubSync = new GitHubSync();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = githubSync;
} else {
    window.githubSync = githubSync;
}