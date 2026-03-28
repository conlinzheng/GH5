# GH5 项目代码修复任务列表

## 任务依赖关系
- 任务1 (P0) → 任务4, 任务5
- 任务2 (P0) → 无依赖
- 任务3 (P1) → 无依赖
- 任务4 (P1) → 依赖任务1
- 任务5 (P1) → 依赖任务1
- 任务6 (P2) → 依赖任务4, 任务5

## [x] 任务1：修复安全漏洞（最高优先级）
**优先级**：P0 | **依赖**：无

移除硬编码的GitHub Token，实现安全的Token存储机制。

### 子任务
- [x] 1.1 移除js/core/config.js中的硬编码Token
  - 删除第92行的 `const defaultToken = 'ghp_...'`
  - 修改为从环境变量或配置文件读取
- [x] 1.2 修改Token存储方式
  - 移除localStorage和sessionStorage中的Token存储
  - 实现内存存储或加密存储
- [x] 1.3 添加Token验证逻辑
  - 验证Token格式
  - 处理Token过期情况

### 验收标准
- 代码中不存在硬编码的敏感信息
- Token存储方式安全可靠
- 应用能正常访问GitHub API

---

## [x] 任务2：修复CSS变量问题
**优先级**：P0 | **依赖**：无

定义所有未定义的CSS变量，消除重复定义。

### 子任务
- [x] 2.1 修复css/style.css中的未定义变量
  - 添加 `--background-color-light` 定义
  - 添加 `--text-color-secondary` 定义
  - 添加 `--background-secondary` 定义
- [x] 2.2 修复css/mobile.css中的未定义变量
  - 添加 `--font-size-xs` 定义
- [x] 2.3 消除重复的动画定义
  - 删除重复的 `@keyframes slideInRight`

### 验收标准
- 所有CSS变量都有定义
- 没有重复的动画定义
- 样式在不同浏览器中显示一致

---

## [x] 任务3：修复JSON配置文件
**优先级**：P1 | **依赖**：无

修复配置文件中的格式错误和内容问题。

### 子任务
- [x] 3.1 修复2-真皮系列/products.json的嵌套错误
  - 修复 `勃肯1 (1).jpg` 产品的 `name` 和 `description` 字段
- [x] 3.2 完善config.json中的空字段
  - 填写 `companyAddress`、`companyPhone`、`companyEmail` 等字段
  - 或使用占位符值
- [x] 3.3 完善seriesNameMap映射
  - 添加所有系列的映射

### 验收标准
- 所有JSON文件格式正确
- 必要的字段不为空
- 映射完整

---

## [x] 任务4：增强错误处理
**优先级**：P1 | **依赖**：任务1

为异步操作添加try-catch块和错误处理机制。

### 子任务
- [x] 4.1 修复admin/src/main.ts中的错误处理
  - 为 `saveProduct` 方法添加try-catch
  - 为 `scanSeries` 方法添加try-catch
  - 为 `regenerateJSON` 方法添加try-catch
- [x] 4.2 添加错误提示UI
  - 实现错误提示组件
  - 在关键操作失败时显示错误信息
- [x] 4.3 添加错误日志记录
  - 统一错误日志格式
  - 添加错误上下文信息

### 验收标准
- 所有异步操作都有错误处理
- 错误信息对用户友好
- 错误日志便于调试

---

## [x] 任务5：修复Vue组件问题
**优先级**：P1 | **依赖**：任务1

修复Vue组件中的语法和逻辑错误。

### 子任务
- [x] 5.1 修复src/store/index.js中的getters定义
  - 修改为正确的getter实现方式
  - 确保getters返回函数
- [x] 5.2 修复src/views/ProductDetailView.vue中的watch清理
  - 添加unwatch变量
  - 在onUnmounted中清理监听器
- [x] 5.3 实现缺失的函数
  - 实现Header.vue中的 `toggleHistory` 函数
  - 实现Footer.vue中的 `openContactModal` 函数
  - 实现ProductDetailView.vue中的 `openContactModal` 函数
- [x] 5.4 优化Header.vue中的store使用
  - 在script中正确使用store
  - 或移除未使用的导入

### 验收标准
- Store getters工作正常
- 组件卸载时清理监听器
- 所有函数都有实现
- 没有未使用的导入

---

## [x] 任务6：代码质量优化
**优先级**：P2 | **依赖**：任务4, 任务5

修复类型定义、消除重复代码、添加参数验证。

### 子任务
- [x] 6.1 修复admin/src/modules/product.ts中的类型定义
  - 修复 `findProductIndex` 方法的实现
  - 修复 `productsFile` 变量的类型定义
- [x] 6.2 消除js/modules/products/中的重复代码
  - 重构 `data-fetch.js` 和 `data-store.js` 中的重复方法
- [x] 6.3 添加参数验证
  - 在关键函数中添加参数类型检查
  - 添加null/undefined检查
- [x] 6.4 修复js/core/i18n.js中的全局变量引用
  - 避免直接使用 `frontend` 变量
  - 使用依赖注入或参数传递

### 验收标准
- TypeScript类型定义准确
- 没有重复代码
- 参数验证完善
- 没有直接的全局变量依赖
