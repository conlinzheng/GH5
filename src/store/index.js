import { reactive, ref, computed } from 'vue'
import productLoader from '../utils/productLoader'

// 状态管理
const state = reactive({
  products: [],
  loading: false,
  currentLanguage: 'ZH',
  history: JSON.parse(localStorage.getItem('productHistory') || '[]')
})

// 计算属性
const getters = {
  getProductById: (id) => {
    return state.products.find(product => product.id === parseInt(id))
  },
  getFilteredProducts: (query) => {
    if (!query) return state.products
    const lowerQuery = query.toLowerCase()
    return state.products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.series.toLowerCase().includes(lowerQuery)
    )
  }
}

// 操作
const actions = {
  // 加载产品数据
  async loadProducts() {
    state.loading = true
    try {
      // 从产品图文件夹中动态加载产品数据
      const products = await productLoader.loadProductsFromFileSystem()
      state.products = products
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      state.loading = false
    }
  },

  // 添加浏览历史
  addToHistory(product) {
    // 移除已存在的相同产品
    state.history = state.history.filter(item => item.id !== product.id)
    
    // 添加到历史记录开头
    state.history.unshift({
      id: product.id,
      name: product.name,
      image: product.images[0],
      timestamp: new Date().toISOString()
    })
    
    // 限制历史记录数量为10条
    if (state.history.length > 10) {
      state.history = state.history.slice(0, 10)
    }
    
    // 保存到本地存储
    localStorage.setItem('productHistory', JSON.stringify(state.history))
  },

  // 清除浏览历史
  clearHistory() {
    state.history = []
    localStorage.removeItem('productHistory')
  },

  // 切换语言
  toggleLanguage() {
    state.currentLanguage = state.currentLanguage === 'ZH' ? 'EN' : 'ZH'
  }
}

// 创建store对象
export default {
  state,
  getters,
  ...actions
}