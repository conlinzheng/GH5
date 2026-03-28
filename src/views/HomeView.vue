<template>
  <div class="home">
    <Carousel :slides="carouselSlides" />

    <section class="search-section" id="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input type="text" class="search-input" id="search-input" v-model="searchQuery" placeholder="搜索产品名称、标签...">
          <button class="search-clear-btn" id="search-clear" aria-label="清除搜索" @click="clearSearch" v-if="searchQuery">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <button class="search-btn" id="search-btn" aria-label="搜索" @click="performSearch">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </section>

    <section class="products-section" id="products-section">
      <div class="products-container" id="products-container">
        <div class="loading" id="loading" v-if="store.state.loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        <div class="products-grid" v-else>
          <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Carousel from '../components/Carousel.vue'
import ProductCard from '../components/ProductCard.vue'
import store from '../store'

const searchQuery = ref('')
const carouselSlides = ref([
  {
    title: '欢迎来到 GH5',
    description: '探索我们的优质产品'
  },
  {
    title: '品质保证',
    description: '我们致力于提供最优质的产品'
  },
  {
    title: '专业服务',
    description: '为您提供专业的产品咨询和服务'
  }
])

const filteredProducts = computed(() => {
  return store.getters.getFilteredProducts(searchQuery.value)
})

const performSearch = () => {
  console.log('Searching for:', searchQuery.value)
  // 搜索逻辑已通过computed实现
}

const clearSearch = () => {
  searchQuery.value = ''
}

onMounted(() => {
  store.loadProducts()
})
</script>

<style scoped>
/* 样式已在main.css中定义 */
</style>