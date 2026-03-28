# GH5 项目代码修复实施规范

## 为什么
根据之前的代码联动检查报告，GH5项目存在多个安全隐患、代码质量问题和功能缺陷。这些问题需要按照优先级逐步修复，以确保项目的安全性、稳定性和可维护性。

## 变更内容
- **安全修复**：移除硬编码的GitHub Token，使用安全的存储方式
- **CSS修复**：定义未定义的CSS变量，消除重复定义
- **JSON修复**：修复配置文件中的格式错误和内容问题
- **错误处理增强**：添加try-catch块和错误处理机制
- **代码质量优化**：修复类型定义、消除重复代码、添加参数验证
- **Vue组件修复**：修复Store getters、添加watch清理、实现缺失函数

## 影响范围
- 受影响的文件：js/core/config.js, css/style.css, css/mobile.css, config.json, products.json文件, admin/src/main.ts, src/store/index.js, src/components/Header.vue等
- 受影响的系统：用户认证、产品管理、UI渲染、配置管理

## 新增需求

### 需求：安全修复
系统应移除所有硬编码的敏感信息，使用环境变量或安全的配置方式存储API密钥。

#### 场景：GitHub Token安全存储
- **WHEN** 应用需要访问GitHub API
- **THEN** 系统应从环境变量或安全配置文件读取Token，而不是使用硬编码值
- **AND** Token不应存储在localStorage或sessionStorage中

### 需求：CSS变量修复
系统应确保所有使用的CSS变量都有定义，消除重复的动画定义。

#### 场景：CSS变量一致性
- **WHEN** 样式使用CSS变量
- **THEN** 所有变量都应在:root或相应作用域中定义
- **AND** 不应存在重复的@keyframes定义

### 需求：JSON配置修复
系统应修复配置文件中的格式错误，完善空字段和映射。

#### 场景：配置文件完整性
- **WHEN** 加载配置文件
- **THEN** 所有JSON格式应正确
- **AND** 必要的字段不应为空
- **AND** 映射应完整

## 修改需求

### 需求：错误处理增强
现有的异步操作缺少错误处理，需要添加try-catch块。

**修改前**：
```typescript
async saveProduct() {
  await this.productManager.saveProduct(this.currentEditingProduct);
  this.updateUI();
}
```

**修改后**：
```typescript
async saveProduct() {
  try {
    await this.productManager.saveProduct(this.currentEditingProduct);
    this.updateUI();
  } catch (error) {
    console.error('保存产品失败:', error);
    this.showError('保存失败，请重试');
  }
}
```

### 需求：Vue Store修复
现有的Store getters定义方式在Vue 3中可能不按预期工作，需要修复。

**修改前**：
```javascript
getters: {
  getProductById: (id) => state.products.find(product => product.id === parseInt(id))
}
```

**修改后**：
```javascript
getters: {
  getProductById: (state) => (id) => state.products.find(product => product.id === parseInt(id))
}
```

### 需求：Watch清理
组件卸载时应清理watch监听器，防止内存泄漏。

**修改前**：
```javascript
watch(() => route.params.id, async () => {
  // 处理逻辑
}, { immediate: true });
```

**修改后**：
```javascript
const unwatch = watch(() => route.params.id, async () => {
  // 处理逻辑
}, { immediate: true });

onUnmounted(() => {
  unwatch();
});
```

## 移除需求
无
