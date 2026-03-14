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
            response.content = atob(response.content);
        }
        return response;
    }

    async commitFile(path, content, message, sha = '') {
        const url = `${this.apiUrl}/contents/${encodeURIComponent(path)}`;
        
        let fileSha = sha;
        if (!sha) {
            try {
                const existingFile = await this.fetchFile(path);
                fileSha = existingFile.sha;
            } catch (error) {
            }
        }

        const data = {
            message,
            content: btoa(unescape(encodeURIComponent(content))),
        };

        if (fileSha) {
            data.sha = fileSha;
        }

        return this._fetch(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async _fetch(url, options = {}) {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (response.status === 403) {
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const reset = response.headers.get('X-RateLimit-Reset');
            this.rateLimit = {
                remaining: parseInt(remaining) || 0,
                reset: parseInt(reset) || 0
            };

            if (this.rateLimit.remaining === 0) {
                const waitTime = (this.rateLimit.reset - Date.now() / 1000) * 1000;
                throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
            }
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'GitHub API request failed');
        }

        return response.json();
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async uploadImage(seriesId, file) {
        const base64 = await this.fileToBase64(file);
        const path = `产品图/${seriesId}/${file.name}`;
        return this.commitFile(path, atob(base64), `Upload ${file.name}`);
    }

    async scanForNewImages() {
        const newImages = {};
        try {
            const seriesList = await this.fetchDirectory('产品图');
            for (const series of seriesList) {
                if (series.type === 'dir') {
                    const seriesId = series.name;
                    let productsJson;
                    try {
                        productsJson = await this.fetchFile(`产品图/${seriesId}/products.json`);
                        const products = JSON.parse(productsJson.content).products || {};
                        const existingFiles = Object.keys(products);

                        const files = await this.fetchDirectory(`产品图/${seriesId}`);
                        const imageFiles = files.filter(f => 
                            f.type === 'file' && 
                            /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
                        );

                        const newFiles = imageFiles.filter(f => !existingFiles.includes(f.name));
                        if (newFiles.length > 0) {
                            newImages[seriesId] = newFiles.map(f => f.name);
                        }
                    } catch (e) {
                        const files = await this.fetchDirectory(`产品图/${seriesId}`);
                        const imageFiles = files.filter(f => 
                            f.type === 'file' && 
                            /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name)
                        );
                        if (imageFiles.length > 0) {
                            newImages[seriesId] = imageFiles.map(f => f.name);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error scanning for new images:', error);
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