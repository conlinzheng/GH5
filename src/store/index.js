import { reactive, ref, computed } from 'vue'

// 状态管理
const state = reactive({
  products: [],
  loading: false,
  currentLanguage: 'ZH',
  history: JSON.parse(localStorage.getItem('productHistory') || '[]')
})

// 计算属性
const getters = {
  getProductById: (state) => (id) => {
    return state.products.find(product => product.id === parseInt(id))
  },
  getFilteredProducts: (state) => (query) => {
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
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      state.products = [
        {
          id: 1,
          name: 'PU系列产品1',
          series: 'PU系列',
          description: '高品质PU材质，舒适透气',
          images: ['/产品图/1-PU系列/产品1 (1).jpg', '/产品图/1-PU系列/产品1 (2).jpg'],
          specs: {
            upper: 'PU材质',
            inner: '网布',
            sole: '橡胶',
            customizable: '是',
            minOrder: '100双',
            price: '¥120/双'
          }
        },
        {
          id: 2,
          name: '真皮系列产品1',
          series: '真皮系列',
          description: '优质真皮，质感细腻',
          images: ['/产品图/2-真皮系列/勃肯1 (1).jpg'],
          specs: {
            upper: '真皮',
            inner: '真皮',
            sole: '橡胶',
            customizable: '是',
            minOrder: '50双',
            price: '¥280/双'
          }
        },
        {
          id: 3,
          name: '短靴系列产品1',
          series: '短靴系列',
          description: '时尚短靴，保暖舒适',
          images: ['/产品图/3-短靴系列/00A (1).jpg'],
          specs: {
            upper: 'PU材质',
            inner: '毛绒',
            sole: '橡胶',
            customizable: '否',
            minOrder: '200双',
            price: '¥180/双'
          }
        },
        {
          id: 4,
          name: '乐福系列产品1',
          series: '乐福系列',
          description: '经典乐福鞋，百搭舒适',
          images: ['/产品图/4-乐福系列/B5 (1).jpg'],
          specs: {
            upper: 'PU材质',
            inner: '网布',
            sole: '橡胶',
            customizable: '是',
            minOrder: '150双',
            price: '¥150/双'
          }
        },
        {
          id: 5,
          name: '春季系列产品1',
          series: '春季系列',
          description: '春季新款，轻便透气',
          images: ['/产品图/5-春季/新款1 (1).jpg', '/产品图/5-春季/新款1 (2).jpg'],
          specs: {
            upper: '网布',
            inner: '网布',
            sole: 'EVA',
            customizable: '是',
            minOrder: '100双',
            price: '¥100/双'
          }
        },
        {
          id: 6,
          name: '夏季系列产品1',
          series: '夏季系列',
          description: '夏季凉鞋，清爽透气',
          images: ['/产品图/6-夏季/41.png', '/产品图/6-夏季/42.png'],
          specs: {
            upper: 'PVC',
            inner: 'EVA',
            sole: 'EVA',
            customizable: '否',
            minOrder: '300双',
            price: '¥80/双'
          }
        }
      ]
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

export default {
  state,
  getters,
  ...actions
}