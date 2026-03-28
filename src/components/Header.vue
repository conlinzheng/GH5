<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>GH5</h1>
        </div>
        <nav class="nav">
          <button class="nav-btn" @click="refreshData" aria-label="刷新数据" title="刷新数据">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10a6 6 0 0 1 6-6h4m0 0l-3-3m3 3l-3 3m3 9a6 6 0 0 1-6 6H6m0 0l3 3m-3-3l3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="nav-btn" @click="toggleHistory" aria-label="浏览历史" title="浏览历史">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="nav-btn" @click="toggleLanguage" aria-label="切换语言">
            <span class="lang-text">{{ store.state.currentLanguage }}</span>
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import store from '../store'

const refreshData = () => {
  // 刷新数据的逻辑
  store.loadProducts()
  console.log('Refreshing data...')
}

const toggleHistory = () => {
  // 切换浏览历史侧边栏
  console.log('Toggling history...')
}

const toggleLanguage = () => {
  // 切换语言
  store.toggleLanguage()
}
</script>

<style scoped>
/* 样式已在main.css中定义 */
</style>