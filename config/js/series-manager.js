class SeriesManager {
    constructor() {
        this.container = document.getElementById('series-manager');
    }

    /**
     * 初始化系列管理器
     */
    async init() {
        try {
            // 加载系列列表
            const seriesList = await githubSync.fetchSeriesList();
            this.render(seriesList);
        } catch (error) {
            console.error('Error initializing series manager:', error);
            notifier.error('加载系列列表失败');
        }
    }

    /**
     * 渲染系列管理器
     * @param {array} seriesList - 系列列表
     */
    render(seriesList) {
        if (!this.container) return;

        let html = `
            <div class="series-manager-header">
                <h2>系列管理</h2>
            </div>
            <div class="series-form">
                <div class="form-group">
                    <label for="new-series-name">创建新系列</label>
                    <div class="series-input-group">
                        <input type="text" id="new-series-name" class="form-control" placeholder="系列名称">
                        <button id="create-series-btn" class="btn btn-primary">创建</button>
                    </div>
                    <small class="form-text text-muted">格式：数字-系列名（例如：1-PU系列）</small>
                </div>
            </div>
            <div class="series-list">
                <h3>现有系列</h3>
                <table class="series-table">
                    <thead>
                        <tr>
                            <th>系列ID</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        seriesList.forEach(seriesId => {
            html += `
                <tr>
                    <td>${seriesId}</td>
                    <td>
                        <button class="btn btn-danger delete-series" data-series="${seriesId}">删除</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        this.container.innerHTML = html;
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const createSeriesBtn = document.getElementById('create-series-btn');
        const newSeriesName = document.getElementById('new-series-name');

        // 创建系列
        createSeriesBtn.addEventListener('click', async () => {
            const seriesName = newSeriesName.value.trim();
            if (!seriesName) {
                notifier.warning('请输入系列名称');
                return;
            }

            try {
                // 检查格式是否正确
                if (!/^\d+-/.test(seriesName)) {
                    notifier.warning('系列名称格式不正确，应为：数字-系列名');
                    return;
                }

                notifier.info('创建系列中...');
                await githubSync.createSeries(seriesName);
                notifier.success('系列创建成功');
                
                // 重新加载系列列表
                const seriesList = await githubSync.fetchSeriesList();
                this.render(seriesList);
                
                // 清空输入
                newSeriesName.value = '';
            } catch (error) {
                console.error('Error creating series:', error);
                notifier.error('创建系列失败');
            }
        });

        // 删除系列
        this.container.querySelectorAll('.delete-series').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const seriesId = e.target.dataset.series;
                
                if (confirm(`确定要删除系列 ${seriesId} 吗？`)) {
                    try {
                        notifier.info('删除系列中...');
                        await githubSync.deleteSeries(seriesId);
                        notifier.success('系列删除成功');
                        
                        // 重新加载系列列表
                        const seriesList = await githubSync.fetchSeriesList();
                        this.render(seriesList);
                    } catch (error) {
                        console.error(`Error deleting series ${seriesId}:`, error);
                        notifier.error('删除系列失败');
                    }
                }
            });
        });
    }
}

// 导出单例
const seriesManager = new SeriesManager();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = seriesManager;
} else {
    window.seriesManager = seriesManager;
}