class GitHubAPI {
    constructor() {
        this.owner = 'conlinzheng';
        this.repo = 'GH5';
        this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;
        this.token = localStorage.getItem('github_token') || '';
        this.rateLimit = {
            remaining: 60,
            reset: 0
        };
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('github_token', token);
    }

    getToken() {
        return this.token;
    }

    async fetchDirectory(path) {
        const url = `${this.apiUrl}/contents/${encodeURIComponent(path)}`;
        return this._fetch(url);
    }

    async fetchFile(path) {
        const url = `${this.apiUrl}/contents/${encodeURIComponent(path)}`;
        const response = await this._fetch(url);
        if (response.content) {
            response.content = decodeURIComponent(escape(atob(response.content)));
        }
        return response;
    }

    async commitFile(path, content, message) {
        const url = `${this.apiUrl}/contents/${encodeURIComponent(path)}`;
        
        let sha = '';
        try {
            const existingFile = await this.fetchFile(path);
            sha = existingFile.sha;
        } catch (error) {
        }

        const data = {
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            sha
        };

        return this._fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async _fetch(url, options = {}) {
        if (this.rateLimit.remaining <= 0 && Date.now() < this.rateLimit.reset * 1000) {
            const waitTime = this.rateLimit.reset * 1000 - Date.now() + 1000;
            await this._sleep(waitTime);
        }

        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers
            });

            if (response.headers.has('X-RateLimit-Remaining')) {
                this.rateLimit.remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
                this.rateLimit.reset = parseInt(response.headers.get('X-RateLimit-Reset'));
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `GitHub API error: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (error.message.includes('403') && error.message.includes('rate limit')) {
                const waitTime = this.rateLimit.reset * 1000 - Date.now() + 1000;
                if (waitTime > 0) {
                    await this._sleep(waitTime);
                    return this._fetch(url, options);
                }
            }
            throw error;
        }
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async uploadImage(seriesId, file) {
        const path = `产品图/${seriesId}/${file.name}`;
        const base64Content = await this.fileToBase64(file);
        const message = `Upload image: ${file.name}`;
        return this.commitFile(path, atob(base64Content), message);
    }

    async scanForNewImages() {
        const seriesList = await this.fetchDirectory('产品图');
        const newImages = {};

        for (const series of seriesList) {
            if (series.type === 'dir') {
                const seriesId = series.name;
                const images = await this.fetchDirectory(`产品图/${seriesId}`);
                const imageFiles = images.filter(item => 
                    item.type === 'file' && 
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
                );

                try {
                    const productsJson = await this.fetchFile(`产品图/${seriesId}/products.json`);
                    const products = JSON.parse(productsJson.content).products || {};
                    
                    const newImageFiles = imageFiles.filter(img => !products[img.name]);
                    if (newImageFiles.length > 0) {
                        newImages[seriesId] = newImageFiles.map(img => img.name);
                    }
                } catch (error) {
                    newImages[seriesId] = imageFiles.map(img => img.name);
                }
            }
        }

        return newImages;
    }
}

const githubAPI = new GitHubAPI();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = githubAPI;
} else {
    window.githubAPI = githubAPI;
}