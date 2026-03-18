class UploadManager {
    constructor() {
        this.container = document.getElementById('upload-manager');
    }

    /**
     * 初始化上传管理器
     */
    async init() {
        try {
            // 加载系列列表
            const seriesList = await githubSync.fetchSeriesList();
            this.render(seriesList);
        } catch (error) {
            console.error('Error initializing upload manager:', error);
            notifier.error('加载系列列表失败');
        }
    }

    /**
     * 渲染上传管理器
     * @param {array} seriesList - 系列列表
     */
    render(seriesList) {
        if (!this.container) return;

        let html = `
            <div class="upload-manager-header">
                <h2>图片上传</h2>
            </div>
            <div class="upload-form">
                <div class="form-group">
                    <label for="series-select">选择系列</label>
                    <select id="series-select" class="form-control">
                        <option value="">请选择系列</option>
        `;

        seriesList.forEach(seriesId => {
            const seriesName = seriesId.split('-')[1] || seriesId;
            html += `
                <option value="${seriesId}">${seriesName}</option>
            `;
        });

        html += `
                    </select>
                </div>
                <div class="form-group">
                    <label for="image-upload">选择图片（可多选）</label>
                    <input type="file" id="image-upload" class="form-control" multiple accept="image/*">
                </div>
                <div class="image-previews" id="image-previews">
                    <!-- 图片预览将在这里动态生成 -->
                </div>
                <div class="upload-progress" id="upload-progress" style="display: none;">
                    <div class="progress-bar" id="progress-bar"></div>
                    <div class="progress-text" id="progress-text">0%</div>
                </div>
                <button id="upload-btn" class="btn btn-primary" disabled>上传</button>
            </div>
        `;

        this.container.innerHTML = html;
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const seriesSelect = document.getElementById('series-select');
        const imageUpload = document.getElementById('image-upload');
        const imagePreviews = document.getElementById('image-previews');
        const uploadBtn = document.getElementById('upload-btn');
        const uploadProgress = document.getElementById('upload-progress');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');

        let selectedFiles = [];

        // 系列选择变化
        seriesSelect.addEventListener('change', () => {
            this.updateUploadButton();
        });

        // 图片选择变化
        imageUpload.addEventListener('change', (e) => {
            selectedFiles = Array.from(e.target.files);
            this.renderImagePreviews(selectedFiles);
            this.updateUploadButton();
        });

        // 上传按钮点击
        uploadBtn.addEventListener('click', async () => {
            const seriesId = seriesSelect.value;
            if (!seriesId || selectedFiles.length === 0) return;

            try {
                notifier.info('开始上传图片...');
                uploadProgress.style.display = 'block';
                uploadBtn.disabled = true;

                const results = await githubSync.uploadImages(
                    seriesId,
                    selectedFiles,
                    (current, total) => {
                        const progress = Math.round((current / total) * 100);
                        progressBar.style.width = `${progress}%`;
                        progressText.textContent = `${progress}%`;
                    }
                );

                uploadProgress.style.display = 'none';
                progressBar.style.width = '0%';
                progressText.textContent = '0%';

                if (results.success.length > 0) {
                    notifier.success(`成功上传 ${results.success.length} 张图片`);
                }
                if (results.failed.length > 0) {
                    notifier.error(`有 ${results.failed.length} 张图片上传失败`);
                }

                // 清空选择
                imageUpload.value = '';
                selectedFiles = [];
                imagePreviews.innerHTML = '';
                this.updateUploadButton();
            } catch (error) {
                console.error('Error uploading images:', error);
                notifier.error('上传图片失败');
                uploadProgress.style.display = 'none';
                uploadBtn.disabled = false;
            }
        });
    }

    /**
     * 渲染图片预览
     * @param {array} files - 文件数组
     */
    renderImagePreviews(files) {
        const imagePreviews = document.getElementById('image-previews');
        imagePreviews.innerHTML = '';

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" width="100" height="100">
                    <div class="preview-info">
                        <span class="preview-name">${file.name}</span>
                        <span class="preview-size">${this.formatFileSize(file.size)}</span>
                    </div>
                `;
                imagePreviews.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * 更新上传按钮状态
     */
    updateUploadButton() {
        const seriesSelect = document.getElementById('series-select');
        const imageUpload = document.getElementById('image-upload');
        const uploadBtn = document.getElementById('upload-btn');

        const seriesSelected = seriesSelect.value !== '';
        const filesSelected = imageUpload.files.length > 0;
        const tokenExists = githubSync.hasToken();

        if (seriesSelected && filesSelected && tokenExists) {
            uploadBtn.disabled = false;
        } else {
            uploadBtn.disabled = true;
        }

        if (!tokenExists) {
            notifier.warning('请先设置GitHub Token');
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 文件大小（字节）
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 导出单例
const uploadManager = new UploadManager();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = uploadManager;
} else {
    window.uploadManager = uploadManager;
}