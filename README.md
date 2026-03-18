# 产品展示网站

一个纯前端静态网站，利用 GitHub 仓库作为数据源和存储后端，实现产品展示、多语言切换、后台图形化管理等功能。

## 功能特点

- **前台产品展示**：轮播图、按系列展示产品卡片、多语言切换（中文、英文、韩语）
- **后台管理**：产品编辑、图片上传、系列管理、网站配置编辑
- **GitHub 集成**：使用 GitHub REST API 作为数据源和存储后端
- **缓存机制**：使用 localStorage 进行客户端缓存，减少 API 调用
- **响应式设计**：适配不同屏幕尺寸

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- GitHub REST API
- localStorage

## 项目结构

```
├── index.html          # 前台产品展示页面
├── css/                # 前台样式
│   └── style.css
├── js/                 # 前台脚本
│   ├── github-api.js   # GitHub API 封装
│   ├── cache-manager.js # 缓存管理
│   ├── i18n.js         # 多语言支持
│   ├── frontend.js     # 前台产品展示逻辑
│   └── lazy-load.js    # 图片懒加载
├── config/             # 后台管理页面
│   ├── config.html     # 后台管理主页面
│   ├── css/            # 后台样式
│   │   └── config-style.css
│   └── js/             # 后台脚本
│       ├── app.js      # 后台主应用
│       ├── notifier.js # 通知系统
│       ├── data-manager.js # 数据管理
│       ├── github-sync.js # GitHub 同步
│       ├── product-editor.js # 产品编辑器
│       ├── upload-manager.js # 上传管理
│       ├── series-manager.js # 系列管理
│       └── config-editor.js # 网站配置
└── README.md           # 项目说明
```

## 配置 GitHub Token

1. 登录 GitHub 账号
2. 进入 `Settings` > `Developer settings` > `Personal access tokens`
3. 点击 `Generate new token`
4. 选择 `repo` 权限（用于读写仓库）
5. 生成 Token 后，复制并保存
6. 打开后台管理页面：`config/config.html`
7. 点击顶部导航栏的 `设置` 按钮
8. 在弹出的 Token 设置弹窗中粘贴 Token 并保存

## 使用方法

### 1. 上传图片

1. 打开后台管理页面：`config/config.html`
2. 点击左侧导航栏的 `图片上传`
3. 选择目标系列
4. 选择本地图片（可多选）
5. 点击 `上传` 按钮，等待上传完成

### 2. 编辑产品信息

1. 打开后台管理页面：`config/config.html`
2. 点击左侧导航栏的 `产品编辑`
3. 选择要编辑的系列
4. 点击系列名称下方的语言标签切换语言
5. 编辑产品名称、描述、价格、材质等信息
6. 点击 `保存` 按钮，将更改提交到 GitHub

### 3. 扫描新图片

1. 在 `产品编辑` 页面，点击 `扫描新图片` 按钮
2. 系统会自动检测各系列文件夹中未在 products.json 中记录的图片
3. 新图片会自动添加为可编辑行

### 4. 管理系列

1. 打开后台管理页面：`config/config.html`
2. 点击左侧导航栏的 `系列管理`
3. 输入系列名称（格式：数字-系列名，例如：1-PU系列）
4. 点击 `创建` 按钮创建新系列
5. 点击现有系列的 `删除` 按钮删除系列

### 5. 编辑网站配置

1. 打开后台管理页面：`config/config.html`
2. 点击左侧导航栏的 `网站配置`
3. 编辑联系信息、页脚文字、社交媒体链接
4. 点击 `保存配置` 按钮保存更改
5. 可选择 `导出配置` 或 `导入配置` 进行配置备份和恢复

## 数据结构

### 系列文件夹命名规则

```
数字-系列名  # 例如：1-PU系列
```

### products.json 格式

```json
{
  "seriesName": {
    "zh": "PU系列",
    "en": "PU Series",
    "ko": "PU 시리즈"
  },
  "products": {
    "filename1.jpg": {
      "name": {
        "zh": "产品1",
        "en": "Product 1",
        "ko": "제품 1"
      },
      "description": {
        "zh": "描述1",
        "en": "Description 1",
        "ko": "설명 1"
      },
      "price": "299",
      "materials": {
        "upper": "PU",
        "lining": "织物",
        "sole": "橡胶"
      }
    }
  }
}
```

## 注意事项

1. 所有对 GitHub 的写入操作需要 GitHub Token 权限
2. 图片上传前会进行预览，仅支持图片文件
3. 首次加载可能会较慢，因为需要从 GitHub API 获取数据
4. 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）访问
5. 后台管理页面需要 GitHub Token 才能进行编辑操作

## 部署

1. 将项目文件推送到 GitHub 仓库
2. 启用 GitHub Pages（Settings > Pages）
3. 选择分支和目录，点击 `Save`
4. 等待 GitHub Pages 部署完成
5. 访问生成的 GitHub Pages 链接

## 本地开发

1. 克隆项目到本地
2. 使用本地服务器打开项目（例如：`python -m http.server` 或 `live-server`）
3. 访问 `http://localhost:8000` 查看前台页面
4. 访问 `http://localhost:8000/config/config.html` 打开后台管理页面

## 故障排除

### 1. 图片上传失败

- 检查 GitHub Token 是否有效且有 `repo` 权限
- 检查网络连接
- 检查图片大小是否超过 GitHub 文件大小限制（100MB）

### 2. 产品数据加载失败

- 检查网络连接
- 检查 GitHub API 速率限制（未认证 60 次/小时，认证后 5000 次/小时）
- 检查系列文件夹结构是否正确

### 3. 后台管理页面无法访问

- 检查浏览器控制台是否有错误信息
- 检查文件路径是否正确
- 确保所有 JavaScript 文件已正确加载