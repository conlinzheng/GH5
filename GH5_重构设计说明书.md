# GH5 项目重构设计说明书

## 1. 项目现状分析

### 1.1 当前文件结构
```
js/
├── config.js        # 配置管理
├── github-api.js    # GitHub API 集成
├── frontend.js      # 前端主逻辑
├── frontend-products.js  # 产品数据管理
├── frontend-events.js    # 事件处理
├── frontend-modal.js     # 模态框管理
├── frontend-search.js    # 搜索功能
├── cache-manager.js      # 缓存管理
├── error-handler.js      # 错误处理
├── i18n.js               # 国际化
└── browse-history.js     # 浏览历史
```

### 1.2 现状问题
1. **模块划分不清晰**：部分功能分散在多个文件中
2. **依赖关系复杂**：模块间耦合度较高
3. **代码重复**：部分功能在多个文件中重复实现
4. **可维护性差**：缺乏统一的代码规范和文档
5. **性能优化空间**：缓存策略和数据加载方式可优化

## 2. 重构架构设计

### 2.1 优化后的文件结构
```
js/
├── core/                # 核心模块
│   ├── config.js        # 配置管理
│   ├── github-api.js    # GitHub API 集成
│   ├── cache.js         # 缓存管理
│   ├── error.js         # 错误处理
│   └── i18n.js          # 国际化
├── modules/             # 功能模块
│   ├── app/             # 应用主逻辑
│   │   ├── core.js      # 核心应用模块
│   │   ├── site-config.js # 站点配置模块
│   │   ├── ui-manager.js # UI 管理模块
│   │   ├── product-manager.js # 产品管理模块
│   │   ├── modal-manager.js # 模态框管理模块
│   │   ├── search-manager.js # 搜索管理模块
│   │   ├── error-manager.js # 错误管理模块
│   │   └── helpers.js   # 辅助模块
│   ├── products/        # 产品相关
│   │   ├── data-fetch.js # 产品数据获取
│   │   ├── data-process.js # 产品数据处理
│   │   ├── data-store.js # 产品数据存储
│   │   ├── render.js    # 产品渲染
│   │   └── search.js    # 产品搜索
│   ├── ui/              # UI 相关
│   │   ├── modal.js     # 模态框管理
│   │   ├── events/      # 事件处理
│   │   │   ├── products.js # 产品事件
│   │   │   ├── search.js # 搜索事件
│   │   │   ├── modal.js # 模态框事件
│   │   │   └── form.js  # 表单事件
│   │   └── history.js   # 浏览历史
│   └── utils/           # 工具函数
│       ├── storage.js    # 存储工具
│       ├── string-utils.js # 字符串工具
│       ├── dom-utils.js # DOM 工具
│       ├── performance-utils.js # 性能工具
│       └── validation-utils.js # 验证工具
└── index.js             # 模块导出和应用入口
```

### 2.2 模块职责表

| 模块 | 主要职责 | 文件位置 | 依赖模块 |
|------|---------|----------|----------|
| 配置管理 | 管理项目配置和 API 令牌 | core/config.js | - |
| GitHub API | 与 GitHub API 交互 | core/github-api.js | core/config.js |
| 缓存管理 | 管理本地缓存 | core/cache.js | - |
| 错误处理 | 处理和显示错误 | core/error.js | - |
| 国际化 | 管理多语言支持 | core/i18n.js | - |
| 产品数据 | 加载和处理产品数据 | modules/products/data.js | core/github-api.js, core/cache.js |
| 产品渲染 | 渲染产品列表和详情 | modules/products/render.js | modules/products/data.js |
| 产品搜索 | 处理产品搜索 | modules/products/search.js | modules/products/data.js |
| 模态框 | 管理产品详情模态框 | modules/ui/modal.js | - |
| 事件处理 | 处理页面事件 | modules/ui/events.js | modules/products/render.js, modules/ui/modal.js |
| 浏览历史 | 管理产品浏览历史 | modules/ui/history.js | - |
| 存储工具 | 封装存储操作 | modules/utils/storage.js | - |
| 辅助函数 | 提供通用工具函数 | modules/utils/helpers.js | - |
| 前端主逻辑 | 协调各个模块 | frontend.js | 所有模块 |

## 3. 详细模块设计

### 3.1 核心模块

#### 3.1.1 配置管理 (core/config.js)
**主要功能**：管理项目配置和 API 令牌

**实现逻辑**：
- 初始化默认配置
- 从多个来源加载配置（sessionStorage、localStorage、环境变量）
- 提供配置的获取和设置方法
- 管理 API 令牌的加载和保存

**关键函数**：
- `loadApiKey()` - 加载 API 密钥
- `saveApiKey(token)` - 保存 API 密钥
- `get(key, defaultValue)` - 获取配置值
- `set(key, value)` - 设置配置值

#### 3.1.2 GitHub API 集成 (core/github-api.js)
**主要功能**：与 GitHub API 交互，处理文件操作

**实现逻辑**：
- 封装 GitHub API 请求
- 处理认证和错误
- 提供文件和目录操作方法
- 实现 API 限流处理

**关键函数**：
- `fetchDirectory(path)` - 获取目录内容
- `fetchFile(path)` - 获取文件内容
- `commitFile(path, content, message)` - 提交文件
- `_fetch(url, options)` - 底层 HTTP 请求处理

#### 3.1.3 缓存管理 (core/cache.js)
**主要功能**：管理本地缓存

**实现逻辑**：
- 封装 localStorage 操作
- 实现缓存过期机制
- 提供缓存的增删改查方法

**关键函数**：
- `get(key, ttl)` - 获取缓存数据
- `set(key, data, ttl)` - 设置缓存数据
- `clear(key)` - 清除缓存
- `clearAll()` - 清除所有缓存

#### 3.1.4 错误处理 (core/error.js)
**主要功能**：处理和显示错误

**实现逻辑**：
- 统一错误处理机制
- 显示用户友好的错误消息
- 提供不同类型错误的处理方法

**关键函数**：
- `handleError(error, errorType, customMessage)` - 处理错误
- `showError(message)` - 显示错误消息
- `showSuccess(message)` - 显示成功消息
- `handleApiError(error)` - 处理 API 错误

#### 3.1.5 国际化 (core/i18n.js)
**主要功能**：管理多语言支持

**实现逻辑**：
- 加载语言配置
- 提供翻译方法
- 处理语言切换

**关键函数**：
- `init()` - 初始化国际化
- `getCurrentLanguage()` - 获取当前语言
- `setLanguage(lang)` - 设置语言
- `translate(key)` - 翻译文本

### 3.2 功能模块

#### 3.2.1 产品数据管理

##### 3.2.1.1 产品数据获取 (modules/products/data-fetch.js)
**主要功能**：从 GitHub API 获取产品数据

**实现逻辑**：
- 从 GitHub API 获取系列列表
- 按批次获取每个系列的产品数据
- 处理 API 限流和错误

**关键函数**：
- `fetchSeriesList()` - 获取系列列表
- `fetchSeriesProducts(seriesId)` - 获取系列产品数据
- `fetchProductData(seriesId, productName)` - 获取产品详细数据

##### 3.2.1.2 产品数据处理 (modules/products/data-process.js)
**主要功能**：处理和转换产品数据

**实现逻辑**：
- 解析产品数据
- 处理产品图片
- 构建产品对象
- 管理产品系列和分类

**关键函数**：
- `processProductData(rawData)` - 处理原始产品数据
- `extractProductName(fileName)` - 从文件名提取产品名称
- `buildProductObject(seriesId, productName, images, productData)` - 构建产品对象

##### 3.2.1.3 产品数据存储 (modules/products/data-store.js)
**主要功能**：管理产品数据存储

**实现逻辑**：
- 缓存产品数据
- 提供数据访问接口
- 管理数据状态

**关键函数**：
- `loadProductsData()` - 加载所有产品数据
- `loadSeriesNameMap()` - 加载系列名称映射
- `getProductById(id)` - 根据 ID 获取产品
- `getProductsBySeries(seriesId)` - 根据系列获取产品

#### 3.2.2 产品渲染 (modules/products/render.js)
**主要功能**：渲染产品列表和详情

**实现逻辑**：
- 渲染产品卡片
- 渲染产品详情
- 处理分页和筛选

**关键函数**：
- `renderProducts(products)` - 渲染产品列表
- `renderProductDetails(product)` - 渲染产品详情
- `renderPagination(totalPages, currentPage)` - 渲染分页

#### 3.2.3 产品搜索 (modules/products/search.js)
**主要功能**：处理产品搜索

**实现逻辑**：
- 实现产品搜索算法
- 处理搜索结果的过滤和排序
- 提供搜索建议

**关键函数**：
- `searchProducts(query, products)` - 搜索产品
- `filterProducts(products, filters)` - 过滤产品
- `sortProducts(products, sortBy)` - 排序产品

#### 3.2.4 模态框管理 (modules/ui/modal.js)
**主要功能**：管理产品详情模态框

**实现逻辑**：
- 显示和隐藏模态框
- 处理模态框内容
- 实现图片画廊和灯箱

**关键函数**：
- `showProductDetails(product)` - 显示产品详情
- `closeProductDetails()` - 关闭产品详情
- `changeMainImage(src)` - 切换主图
- `openLightbox(src)` - 打开灯箱

#### 3.2.5 事件处理

##### 3.2.5.1 产品事件 (modules/ui/events/products.js)
**主要功能**：处理产品相关事件

**实现逻辑**：
- 绑定产品相关事件监听器
- 处理产品点击、筛选等操作

**关键函数**：
- `setupProductEventListeners()` - 设置产品事件监听器
- `handleProductClick(productId)` - 处理产品点击
- `handleSeriesFilter(seriesId)` - 处理系列筛选

##### 3.2.5.2 搜索事件 (modules/ui/events/search.js)
**主要功能**：处理搜索相关事件

**实现逻辑**：
- 绑定搜索相关事件监听器
- 处理搜索输入、提交等操作

**关键函数**：
- `setupSearchEventListeners()` - 设置搜索事件监听器
- `handleSearchSubmit(query)` - 处理搜索提交
- `handleSearchClear()` - 处理搜索清除

##### 3.2.5.3 模态框事件 (modules/ui/events/modal.js)
**主要功能**：处理模态框相关事件

**实现逻辑**：
- 绑定模态框相关事件监听器
- 处理模态框打开、关闭等操作

**关键函数**：
- `setupModalEventListeners()` - 设置模态框事件监听器
- `handleModalClose()` - 处理模态框关闭
- `handleLightboxNavigation(direction)` - 处理灯箱导航

##### 3.2.5.4 表单事件 (modules/ui/events/form.js)
**主要功能**：处理表单相关事件

**实现逻辑**：
- 绑定表单相关事件监听器
- 处理表单验证、提交等操作

**关键函数**：
- `setupFormEventListeners()` - 设置表单事件监听器
- `validateContactForm()` - 验证联系表单
- `handleFormSubmit(formData)` - 处理表单提交

#### 3.2.6 浏览历史 (modules/ui/history.js)
**主要功能**：管理产品浏览历史

**实现逻辑**：
- 记录产品浏览记录
- 提供历史查询和管理
- 实现历史记录的持久化

**关键函数**：
- `addProductView(product)` - 添加产品浏览记录
- `getRecentViews(max)` - 获取最近浏览记录
- `clearHistory()` - 清除浏览历史

### 3.3 工具模块

#### 3.3.1 存储工具 (modules/utils/storage.js)
**主要功能**：封装存储操作

**实现逻辑**：
- 封装 localStorage 和 sessionStorage
- 提供统一的存储接口
- 处理存储容量和错误

**关键函数**：
- `get(key)` - 获取存储数据
- `set(key, value)` - 设置存储数据
- `remove(key)` - 移除存储数据
- `clear()` - 清除所有存储

#### 3.3.2 辅助函数

##### 3.3.2.1 字符串工具 (modules/utils/string-utils.js)
**主要功能**：提供字符串处理函数

**实现逻辑**：
- 提供字符串格式化、验证等功能

**关键函数**：
- `formatString(str, args)` - 格式化字符串
- `validateEmail(email)` - 验证邮箱格式
- `truncateString(str, length)` - 截断字符串

##### 3.3.2.2 DOM 工具 (modules/utils/dom-utils.js)
**主要功能**：提供 DOM 操作辅助函数

**实现逻辑**：
- 提供 DOM 元素创建、操作等功能

**关键函数**：
- `createElement(tag, options)` - 创建 DOM 元素
- `querySelector(selector, context)` - 选择 DOM 元素
- `addEventListeners(element, events)` - 添加事件监听器

##### 3.3.2.3 性能工具 (modules/utils/performance-utils.js)
**主要功能**：提供性能优化相关函数

**实现逻辑**：
- 提供防抖、节流等性能优化功能

**关键函数**：
- `debounce(func, wait)` - 函数防抖
- `throttle(func, limit)` - 函数节流
- `measurePerformance(func, label)` - 测量函数性能

##### 3.3.2.4 验证工具 (modules/utils/validation-utils.js)
**主要功能**：提供表单验证函数

**实现逻辑**：
- 提供表单字段验证功能

**关键函数**：
- `validateRequired(value)` - 验证必填字段
- `validateEmail(email)` - 验证邮箱格式
- `validateLength(value, min, max)` - 验证长度范围

## 4. 前端主逻辑模块

### 4.1 核心应用模块 (modules/app/core.js)
**主要功能**：作为应用的入口点，协调各个模块

**实现逻辑**：
- 初始化应用配置和状态
- 实例化各个功能模块
- 协调模块间的通信
- 处理应用的生命周期

**关键函数**：
- `init()` - 初始化应用
- `setupModules()` - 设置各个模块
- `handleEvents()` - 处理全局事件

### 4.2 站点配置模块 (modules/app/site-config.js)
**主要功能**：管理站点配置

**实现逻辑**：
- 加载站点配置文件
- 管理站点设置和翻译
- 提供配置访问接口

**关键函数**：
- `loadSiteConfig()` - 加载站点配置
- `getConfig(key, defaultValue)` - 获取配置值
- `getTranslation(key, lang)` - 获取翻译文本

### 4.3 UI 管理模块 (modules/app/ui-manager.js)
**主要功能**：管理页面 UI 元素

**实现逻辑**：
- 更新页面标题、轮播图、联系模态框等
- 管理社交链接
- 处理加载状态和错误提示

**关键函数**：
- `updatePageTitle()` - 更新页面标题
- `updateCarousel()` - 更新轮播图
- `updateContactModal()` - 更新联系模态框
- `updateFooter()` - 更新页脚
- `updateSocialLinks()` - 更新社交链接
- `updateFormLabels()` - 更新表单标签

### 4.4 产品管理模块 (modules/app/product-manager.js)
**主要功能**：管理产品相关操作

**实现逻辑**：
- 加载产品数据
- 渲染产品列表
- 处理产品筛选和分页
- 管理产品浏览历史

**关键函数**：
- `loadProductsData()` - 加载产品数据
- `renderProducts()` - 渲染产品列表
- `filterBySeries(seriesId)` - 按系列筛选产品
- `goToPage(page)` - 跳转到指定页码
- `viewHistoryProduct(productId)` - 查看历史产品

### 4.5 模态框管理模块 (modules/app/modal-manager.js)
**主要功能**：管理模态框相关操作

**实现逻辑**：
- 显示和隐藏产品详情模态框
- 管理图片画廊和灯箱
- 处理联系模态框

**关键函数**：
- `showProductDetails(product)` - 显示产品详情
- `closeProductDetails()` - 关闭产品详情
- `changeMainImage(src)` - 切换主图
- `openLightbox(src)` - 打开灯箱
- `closeLightbox(event)` - 关闭灯箱
- `navigateLightbox(direction)` - 灯箱导航
- `openContactModal()` - 打开联系模态框
- `closeContactModal()` - 关闭联系模态框

### 4.6 搜索管理模块 (modules/app/search-manager.js)
**主要功能**：管理搜索相关操作

**实现逻辑**：
- 处理产品搜索
- 重置搜索
- 管理搜索 UI 元素

**关键函数**：
- `searchProducts(query)` - 搜索产品
- `resetSearch()` - 重置搜索
- `updateClearButtonVisibility(value)` - 更新清除按钮可见性

### 4.7 错误管理模块 (modules/app/error-manager.js)
**主要功能**：管理错误处理和显示

**实现逻辑**：
- 显示错误信息
- 显示加载状态
- 处理 API 错误

**关键函数**：
- `showErrorMessage(message)` - 显示错误信息
- `_showLoading(show, message)` - 显示加载状态
- `_showError(message, showRetry)` - 显示错误提示

### 4.8 辅助模块 (modules/app/helpers.js)
**主要功能**：提供通用工具函数

**实现逻辑**：
- 生成图片 URL
- 检查产品图目录是否存在
- 处理语言变更
- 获取默认系列名称映射

**关键函数**：
- `getImageUrl(seriesId, imageName)` - 生成图片 URL
- `checkProductsPathExists()` - 检查产品图目录是否存在
- `_handleLanguageChange(lang)` - 处理语言变更
- `getProductTranslation(zhText, fieldType)` - 获取产品翻译
- `_getDefaultSeriesNameMap()` - 获取默认系列名称映射
- `updateLightboxCounter()` - 更新灯箱计数器
- `refreshData()` - 刷新数据

## 5. 重构步骤

### 5.2 重构执行
1. **核心模块重构**：
   - 重构 config.js → core/config.js
   - 重构 github-api.js → core/github-api.js
   - 重构 cache-manager.js → core/cache.js
   - 重构 error-handler.js → core/error.js
   - 重构 i18n.js → core/i18n.js

2. **功能模块重构**：
   - 重构 frontend-products.js → modules/products/data-fetch.js、modules/products/data-process.js、modules/products/data-store.js
   - 重构 frontend-search.js → modules/products/search.js
   - 重构 frontend-modal.js → modules/ui/modal.js
   - 重构 frontend-events.js → modules/ui/events/products.js、modules/ui/events/search.js、modules/ui/events/modal.js、modules/ui/events/form.js
   - 重构 browse-history.js → modules/ui/history.js
   - 重构 frontend.js → 拆分为以下模块：
     - modules/app/core.js (核心应用模块)
     - modules/app/site-config.js (站点配置模块)
     - modules/app/ui-manager.js (UI 管理模块)
     - modules/app/product-manager.js (产品管理模块)
     - modules/app/modal-manager.js (模态框管理模块)
     - modules/app/search-manager.js (搜索管理模块)
     - modules/app/error-manager.js (错误管理模块)
     - modules/app/helpers.js (辅助模块)

3. **工具模块创建**：
   - 创建 modules/utils/storage.js
   - 创建 modules/utils/string-utils.js
   - 创建 modules/utils/dom-utils.js
   - 创建 modules/utils/performance-utils.js
   - 创建 modules/utils/validation-utils.js

4. **主文件重构**：
   - 创建 index.js 作为模块导出和应用入口

### 5.3 测试阶段
1. 单元测试：测试各个模块的功能
2. 集成测试：测试模块间的交互
3. 端到端测试：测试完整的用户流程
4. 性能测试：测试应用的性能

### 5.4 部署阶段
1. 代码审查
2. 构建和优化
3. 部署到 GitHub Pages
4. 监控和收集反馈

## 6. 技术栈和依赖

### 6.1 核心技术
- 原生 JavaScript (ES6+)
- GitHub API
- 本地存储 (localStorage, sessionStorage)
- 响应式 HTML/CSS

### 6.2 推荐依赖
- **构建工具**：Vite 或 Webpack
- **包管理**：npm 或 Yarn
- **代码质量**：ESLint + Prettier
- **测试**：Jest + React Testing Library
- **文档**：JSDoc

## 7. 性能优化策略

### 7.1 加载优化
- 代码分割：按需加载模块
- 资源压缩：压缩 JavaScript 和 CSS
- 缓存策略：合理使用浏览器缓存

### 7.2 运行时优化
- 防抖和节流：优化事件处理
- 虚拟滚动：处理大量产品列表
- 图片优化：使用适当的图片格式和大小

### 7.3 API 优化
- 批量请求：减少 API 调用次数
- 缓存策略：缓存 API 响应
- 错误重试：处理网络错误

## 8. 可维护性改进

### 8.1 代码规范
- 统一的命名规范
- 一致的代码风格
- 详细的注释和文档

### 8.2 架构设计
- 模块化设计
- 依赖注入
- 事件驱动架构

### 8.3 测试策略
- 单元测试覆盖率 > 80%
- 集成测试覆盖关键流程
- 自动化测试流程

## 10. 结论

通过本次重构，GH5 项目将获得以下好处：

1. **更好的代码组织**：通过精细的模块拆分，实现了清晰的职责分配和代码结构
2. **提高可维护性**：统一的代码规范、详细的文档和模块化设计
3. **增强性能**：优化的缓存策略、API 调用和加载方式
4. **更好的扩展性**：模块化设计便于功能扩展和代码重用
5. **降低维护成本**：减少代码重复和技术债务，提高代码质量
6. **代码简化**：通过异步操作优化、状态管理优化等技术，使代码更加简洁易读

重构后的代码将更加健壮、高效，并且易于理解和维护，为项目的长期发展奠定良好的基础。通过采用现代化的前端开发实践和架构设计，GH5 项目将能够更好地适应未来的需求变化和功能扩展。