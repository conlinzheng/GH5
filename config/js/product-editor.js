class ProductEditor {
    constructor() {
        this.container = document.getElementById('product-editor');
    }

    async init() {
        try {
            await dataManager.loadFromGitHub();
            this.render();
        } catch (error) {
            console.error('Error initializing product editor:', error);
            notifier.error('加载产品数据失败');
        }
    }

    render() {
        if (!this.container) return;

        const productsData = dataManager.getProductsData();
        const seriesList = dataManager.getSeriesList();

        let html = `
            <div class="product-editor-header">
                <h2>产品编辑</h2>
                <div class="editor-actions">
                    <button id="scan-new-images" class="btn btn-primary">扫描新图片</button>
                </div>
            </div>
            <div class="series-list">
        `;

        seriesList.forEach(seriesId => {
            const seriesData = productsData[seriesId];
            const seriesName = seriesData.seriesName || {
                zh: seriesId.split('-')[1] || seriesId,
                en: seriesId.split('-')[1] || seriesId,
                ko: seriesId.split('-')[1] || seriesId
            };

            html += `
                <div class="series-section">
                    <div class="series-header">
                        <h3>系列: ${seriesName.zh}</h3>
                        <button class="btn btn-success save-series" data-series="${seriesId}">保存</button>
                    </div>
                    <div class="series-name-editor">
                        <h4>系列名称</h4>
                        <div class="language-tabs">
                            <button class="tab-btn active" data-lang="zh">中文</button>
                            <button class="tab-btn" data-lang="en">英文</button>
                            <button class="tab-btn" data-lang="ko">韩语</button>
                        </div>
                        <div class="tab-content">
                            <div class="lang-content active" data-lang="zh">
                                <input type="text" class="series-name-input" data-series="${seriesId}" data-lang="zh" value="${seriesName.zh || ''}" placeholder="中文名称">
                            </div>
                            <div class="lang-content" data-lang="en">
                                <input type="text" class="series-name-input" data-series="${seriesId}" data-lang="en" value="${seriesName.en || ''}" placeholder="English name">
                            </div>
                            <div class="lang-content" data-lang="ko">
                                <input type="text" class="series-name-input" data-series="${seriesId}" data-lang="ko" value="${seriesName.ko || ''}" placeholder="한국어 이름">
                            </div>
                        </div>
                    </div>
                    <table class="product-table">
                        <thead>
                            <tr>
                                <th>图片</th>
                                <th>产品名称</th>
                                <th>描述</th>
                                <th>价格</th>
                                <th>材质</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            const products = seriesData.products || {};
            Object.entries(products).forEach(([productId, product]) => {
                html += this.renderProductRow(seriesId, productId, product);
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        html += `
            </div>
        `;

        this.container.innerHTML = html;
        this.bindEvents();
    }

    renderProductRow(seriesId, productId, product) {
        const name = product.name || { zh: '', en: '', ko: '' };
        const description = product.description || { zh: '', en: '', ko: '' };
        const price = product.price || '';
        const materials = product.materials || { upper: '', lining: '', sole: '' };

        return `
            <tr data-series="${seriesId}" data-product="${productId}">
                <td class="product-image">
                    <img src="https://raw.githubusercontent.com/conlinzheng/GH5/main/产品图/${seriesId}/${productId}" alt="${name.zh}" width="80" height="80">
                </td>
                <td class="product-name">
                    <div class="language-tabs">
                        <button class="tab-btn active" data-lang="zh">中文</button>
                        <button class="tab-btn" data-lang="en">英文</button>
                        <button class="tab-btn" data-lang="ko">韩语</button>
                    </div>
                    <div class="tab-content">
                        <div class="lang-content active" data-lang="zh">
                            <input type="text" class="product-field" data-field="name" data-lang="zh" value="${name.zh || ''}" placeholder="中文名称">
                        </div>
                        <div class="lang-content" data-lang="en">
                            <input type="text" class="product-field" data-field="name" data-lang="en" value="${name.en || ''}" placeholder="English name">
                        </div>
                        <div class="lang-content" data-lang="ko">
                            <input type="text" class="product-field" data-field="name" data-lang="ko" value="${name.ko || ''}" placeholder="한국어 이름">
                        </div>
                    </div>
                </td>
                <td class="product-description">
                    <div class="language-tabs">
                        <button class="tab-btn active" data-lang="zh">中文</button>
                        <button class="tab-btn" data-lang="en">英文</button>
                        <button class="tab-btn" data-lang="ko">韩语</button>
                    </div>
                    <div class="tab-content">
                        <div class="lang-content active" data-lang="zh">
                            <textarea class="product-field" data-field="description" data-lang="zh" placeholder="中文描述">${description.zh || ''}</textarea>
                        </div>
                        <div class="lang-content" data-lang="en">
                            <textarea class="product-field" data-field="description" data-lang="en" placeholder="English description">${description.en || ''}</textarea>
                        </div>
                        <div class="lang-content" data-lang="ko">
                            <textarea class="product-field" data-field="description" data-lang="ko" placeholder="한국어 설명">${description.ko || ''}</textarea>
                        </div>
                    </div>
                </td>
                <td class="product-price">
                    <input type="text" class="product-field" data-field="price" value="${price}" placeholder="价格">
                </td>
                <td class="product-materials">
                    <div class="materials-inputs">
                        <input type="text" class="material-field" data-material="upper" value="${materials.upper || ''}" placeholder="鞋面">
                        <input type="text" class="material-field" data-material="lining" value="${materials.lining || ''}" placeholder="内里">
                        <input type="text" class="material-field" data-material="sole" value="${materials.sole || ''}" placeholder="鞋底">
                    </div>
                </td>
                <td class="product-actions">
                    <button class="btn btn-danger delete-product">删除</button>
                </td>
            </tr>
        `;
    }

    bindEvents() {
        this.container.querySelectorAll('.language-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabContainer = e.target.closest('.language-tabs');
                const lang = e.target.dataset.lang;
                tabContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const contentContainer = tabContainer.nextElementSibling;
                contentContainer.querySelectorAll('.lang-content').forEach(c => c.classList.remove('active'));
                contentContainer.querySelector(`.lang-content[data-lang="${lang}"]`).classList.add('active');
            });
        });

        this.container.querySelectorAll('.product-field').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = e.target.closest('tr');
                const seriesId = row.dataset.series;
                const productId = row.dataset.product;
                const field = e.target.dataset.field;
                const lang = e.target.dataset.lang;
                const value = e.target.value;

                const productData = dataManager.getProductsBySeries(seriesId).products[productId] || {
                    name: { zh: '', en: '', ko: '' },
                    description: { zh: '', en: '', ko: '' },
                    price: '',
                    materials: { upper: '', lining: '', sole: '' }
                };

                if (lang) {
                    if (!productData[field]) {
                        productData[field] = { zh: '', en: '', ko: '' };
                    }
                    productData[field][lang] = value;
                } else {
                    productData[field] = value;
                }

                dataManager.updateProduct(seriesId, productId, productData);
            });
        });

        this.container.querySelectorAll('.material-field').forEach(input => {
            input.addEventListener('input', (e) => {
                const row = e.target.closest('tr');
                const seriesId = row.dataset.series;
                const productId = row.dataset.product;
                const material = e.target.dataset.material;
                const value = e.target.value;

                const productData = dataManager.getProductsBySeries(seriesId).products[productId] || {
                    name: { zh: '', en: '', ko: '' },
                    description: { zh: '', en: '', ko: '' },
                    price: '',
                    materials: { upper: '', lining: '', sole: '' }
                };

                if (!productData.materials) {
                    productData.materials = { upper: '', lining: '', sole: '' };
                }
                productData.materials[material] = value;

                dataManager.updateProduct(seriesId, productId, productData);
            });
        });

        this.container.querySelectorAll('.series-name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const seriesId = e.target.dataset.series;
                const lang = e.target.dataset.lang;
                const value = e.target.value;

                const seriesData = dataManager.getProductsBySeries(seriesId);
                if (!seriesData.seriesName) {
                    seriesData.seriesName = { zh: '', en: '', ko: '' };
                }
                seriesData.seriesName[lang] = value;

                dataManager.updateSeries(seriesId, seriesData);
            });
        });

        this.container.querySelectorAll('.save-series').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const seriesId = e.target.dataset.series;
                try {
                    await dataManager.saveToGitHub(seriesId);
                    notifier.success(`系列 ${seriesId} 保存成功`);
                } catch (error) {
                    console.error(`Error saving series ${seriesId}:`, error);
                    notifier.error(`保存系列 ${seriesId} 失败`);
                }
            });
        });

        this.container.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                const seriesId = row.dataset.series;
                const productId = row.dataset.product;

                if (confirm('确定要删除这个产品吗？')) {
                    dataManager.deleteProduct(seriesId, productId);
                    row.remove();
                    notifier.success('产品删除成功');
                }
            });
        });

        document.getElementById('scan-new-images').addEventListener('click', async () => {
            try {
                notifier.info('正在扫描新图片...');
                const newImages = await dataManager.scanForNewImages();
                
                if (Object.keys(newImages).length === 0) {
                    notifier.info('没有发现新图片');
                    return;
                }

                Object.entries(newImages).forEach(([seriesId, images]) => {
                    const table = this.container.querySelector(`.series-section .product-table tbody`);
                    if (table) {
                        images.forEach(image => {
                            const productData = {
                                name: { zh: '', en: '', ko: '' },
                                description: { zh: '', en: '', ko: '' },
                                price: '',
                                materials: { upper: '', lining: '', sole: '' }
                            };
                            dataManager.addProduct(seriesId, image, productData);
                            table.innerHTML += this.renderProductRow(seriesId, image, productData);
                        });
                    }
                });

                this.bindEvents();
                notifier.success('新图片扫描完成');
            } catch (error) {
                console.error('Error scanning new images:', error);
                notifier.error('扫描新图片失败');
            }
        });
    }
}

const productEditor = new ProductEditor();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = productEditor;
} else {
    window.productEditor = productEditor;
}