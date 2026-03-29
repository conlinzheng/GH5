<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>GH5</h1>
        </div>
        <nav class="nav">
          <button class="nav-btn" @click="refreshData" aria-label="刷新数据" title="刷新数据">
            <img :src="icons.refresh" alt="刷新" class="nav-icon">
          </button>
          <button class="nav-btn" @click="toggleHistory" aria-label="浏览历史" title="浏览历史">
            <img :src="icons.history" alt="历史" class="nav-icon">
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
import { ref, onMounted } from 'vue'
import store from '../store'
import iconLoader from '../utils/iconLoader'

const icons = ref({})

const loadIcons = async () => {
  try {
    const loadedIcons = await iconLoader.loadIconsFromFileSystem()
    icons.value = loadedIcons
  } catch (error) {
    console.error('Failed to load icons:', error)
  }
}

const refreshData = () => {
  // 刷新数据的逻辑
  store.loadProducts()
  console.log('Refreshing data...')
}

const showHistory = ref(false)

const toggleHistory = () => {
  // 切换浏览历史侧边栏
  showHistory.value = !showHistory.value
  const event = new CustomEvent('toggle-history', { detail: { visible: showHistory.value } })
  window.dispatchEvent(event)
}

const toggleLanguage = () => {
  // 切换语言
  store.toggleLanguage()
}

onMounted(async () => {
  await loadIcons()
})
</script>

<style scoped>
.nav-icon {
  width: 20px;
  height: 20px;
  color: currentColor;
}
</style>

<style scoped>
/* 样式已在main.css中定义 */
</style>