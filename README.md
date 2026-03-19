# GH5 产品展示网站

## 项目概述

GH5 是一个基于 GitHub API 的产品展示网站，用于展示和管理产品系列。该项目采用纯前端技术栈，无需后端服务，通过 GitHub 仓库存储产品数据和图片。

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **API**：GitHub REST API
- **缓存**：LocalStorage
- **国际化**：多语言支持（中文、英文、韩文）
- **响应式设计**：适配不同设备屏幕

## 项目架构

### 核心文件结构

```
├── index.html          # 主页面
├── test.html           # 测试页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── config.js       # 配置管理
│   ├── error-handler.js # 错误处理
│   ├── cache-manager.js # 缓存管理
│   ├── github-api.js   # GitHub API 封装
│   ├── i18n.js         # 国际化支持
│   └── frontend.js     # 前端核心逻辑
└── README.md           # 项目文档
```

### 核心模块

1. **配置管理** (`config.js`)
   - 集中管理项目配置和敏感信息
   - 支持从环境变量加载配置
   - API 密钥安全存储机制

2. **错误处理** (`error-handler.js`)
   - 统一的错误处理机制
   - 用户友好的错误提示
   - 多语言错误消息支持

3. **缓存管理** (`cache-manager.js`)
   - LocalStorage 缓存封装
   - 自动过期机制
   - 缓存键前缀管理

4. **GitHub API** (`github-api.js`)
   - GitHub REST API 封装
   - 目录和文件操作
   - API 限流处理

5. **国际化** (`i18n.js`)
   - 多语言支持
   - 语言切换功能
   - 本地存储语言偏好

6. **前端核心** (`frontend.js`)
   - 页面初始化和事件监听
   - 产品数据加载和渲染
   - 用户交互处理

## 功能特性

### 已实现功能

- ✅ 产品系列展示
- ✅ 产品详情查看
- ✅ 多语言支持（中、英、韩）
- ✅ 响应式设计
- ✅ 本地缓存机制
- ✅ 错误处理和用户提示
- ✅ 平滑滚动和回到顶部
- ✅ 图片查看功能
- ✅ 搜索功能
- ✅ 联系表单

### 计划功能

- 📋 产品规格选择器
- 📋 批量操作功能
- 📋 产品数据导入/导出
- 📋 评论系统
- 📋 产品对比功能

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/conlinzheng/GH5.git
cd GH5
```

### 2. 配置 GitHub API 密钥

在 `js/config.js` 中配置 GitHub 仓库信息：

```javascript
// js/config.js
github: {
  owner: 'conlinzheng',
  repo: 'GH5',
  productsPath: '产品图',
  apiBaseUrl: 'https://api.github.com'
}
```

### 3. 启动本地服务器

使用任何静态文件服务器启动项目：

```bash
# 使用 Python 3
python -m http.server 8000

# 或使用 Node.js
npx serve .

# 或使用 PHP
php -S localhost:8000
```

### 4. 访问网站

打开浏览器访问 `http://localhost:8000`

## 数据结构

### 产品数据格式

在 GitHub 仓库的 `产品图` 目录下，每个系列文件夹中需要创建 `products.json` 文件，格式如下：

```json
{
  "products": {
    "product1.jpg": {
      "name": "产品名称",
      "description": "产品描述",
      "price": "价格",
      "materials": "材质"
    },
    "product2.jpg": {
      "name": "产品名称",
      "description": "产品描述",
      "price": "价格",
      "materials": "材质"
    }
  }
}
```

## 国际化支持

### 支持的语言

- 中文 (`zh`)
- 英文 (`en`)
- 韩文 (`ko`)

### 添加新语言

在 `js/i18n.js` 文件中添加新的语言翻译：

```javascript
// js/i18n.js
this.translations = {
  zh: { /* 中文翻译 */ },
  en: { /* 英文翻译 */ },
  ko: { /* 韩文翻译 */ },
  newLang: { /* 新语言翻译 */ }
};

// 同时更新支持的语言列表
this.supportedLangs = ['zh', 'en', 'ko', 'newLang'];
```

## 性能优化

1. **缓存机制**：使用 LocalStorage 缓存产品数据，减少 API 请求
2. **并行请求**：使用 `Promise.all` 并行加载产品数据，提高加载速度
3. **错误处理**：完善的错误处理机制，确保页面稳定性
4. **响应式设计**：适配不同设备屏幕，提供良好的用户体验

## 部署

### 部署到 GitHub Pages

1. 确保项目文件已提交到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `main` 分支作为源
4. 等待部署完成后，访问分配的 GitHub Pages URL

### 部署到其他静态托管服务

可以部署到任何静态文件托管服务，如：
- Vercel
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

## 开发指南

### 添加新功能

1. 在 `frontend.js` 中添加新的功能方法
2. 在 `css/style.css` 中添加相应的样式
3. 在 `i18n.js` 中添加国际化支持
4. 测试功能是否正常工作

### 调试技巧

1. 使用浏览器开发者工具查看控制台日志
2. 检查 Network 面板查看 API 请求
3. 使用 `test.html` 页面进行功能测试
4. 检查 LocalStorage 中的缓存数据

## 常见问题

### 1. 页面加载失败

- **原因**：GitHub API 限流或网络连接问题
- **解决**：检查网络连接，等待 API 限流恢复，或使用本地缓存数据

### 2. 产品数据不显示

- **原因**：GitHub 仓库结构不正确或 `products.json` 文件格式错误
- **解决**：检查仓库结构，确保每个系列文件夹中都有正确格式的 `products.json` 文件

### 3. 语言切换不生效

- **原因**：浏览器 localStorage 问题或语言配置错误
- **解决**：清除浏览器缓存，检查 `i18n.js` 中的语言配置

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 许可证

MIT License
