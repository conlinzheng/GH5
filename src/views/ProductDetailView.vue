<template>
  <div class="product-detail">
    <div class="container">
      <button class="back-btn" @click="goBack">返回列表</button>
      
      <div class="loading" v-if="store.state.loading || !product">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="product" class="product-content">
        <!-- 左侧图片 -->
        <div class="product-images">
          <div class="main-image-container">
            <img :src="currentImage" :alt="product.name" class="modal-main-image" @click="openLightbox">
            <div class="zoom-hint">点击查看大图</div>
          </div>
          <div class="modal-gallery-container">
            <div class="modal-gallery" id="modal-gallery">
              <img 
                v-for="(image, index) in product.images" 
                :key="index" 
                :src="image" 
                :alt="product.name" 
                class="gallery-image" 
                :class="{ active: currentImageIndex === index }" 
                @click="changeMainImage(index)"
              >
            </div>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="product-info">
          <div class="modal-series">{{ product.series }}</div>
          <h2 class="product-name">{{ product.name }}</h2>
          <p class="product-description">{{ product.description }}</p>
          
          <!-- 产品详细信息 -->
          <div class="product-specs">
            <div class="spec-item">
              <span class="spec-label">鞋面材质：</span>
              <span class="spec-value">{{ product.specs.upper }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">内里材质：</span>
              <span class="spec-value">{{ product.specs.inner }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">鞋底材质：</span>
              <span class="spec-value">{{ product.specs.sole }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">是否支持定制：</span>
              <span class="spec-value">{{ product.specs.customizable }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">起订量：</span>
              <span class="spec-value">{{ product.specs.minOrder }}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">价格：</span>
              <span class="spec-value">{{ product.specs.price }}</span>
            </div>
          </div>
          
          <div class="product-actions">
            <button class="contact-btn" @click="openContactModal">
              联系我们
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="error-message">
        <p>产品不存在</p>
        <button class="back-btn" @click="goBack">返回列表</button>
      </div>
    </div>

    <!-- 大图查看器 -->
    <div class="lightbox" :class="{ show: lightboxVisible }" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <span class="close-lightbox" @click="closeLightbox">&times;</span>
        <button class="lightbox-nav lightbox-prev" @click="navigateLightbox(-1)" title="上一张" v-if="product && product.images.length > 1">❮</button>
        <img class="lightbox-image" :src="currentImage" :alt="product?.name">
        <button class="lightbox-nav lightbox-next" @click="navigateLightbox(1)" title="下一张" v-if="product && product.images.length > 1">❯</button>
        <div class="lightbox-counter" v-if="product && product.images.length > 1">
          {{ currentImageIndex + 1 }} / {{ product.images.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import store from '../store'

const route = useRoute()
const router = useRouter()
const currentImageIndex = ref(0)
const lightboxVisible = ref(false)

const product = computed(() => {
  return store.getters.getProductById(route.params.id)
})

const currentImage = computed(() => {
  if (!product.value || !product.value.images.length) return ''
  return product.value.images[currentImageIndex.value]
})

const goBack = () => {
  router.push('/')
}

const openLightbox = () => {
  lightboxVisible.value = true
}

const closeLightbox = () => {
  lightboxVisible.value = false
}

const changeMainImage = (index) => {
  currentImageIndex.value = index
}

const navigateLightbox = (direction) => {
  if (!product.value) return
  const totalImages = product.value.images.length
  currentImageIndex.value = (currentImageIndex.value + direction + totalImages) % totalImages
}

const openContactModal = () => {
  console.log('Opening contact modal...')
}

// 监听路由参数变化，加载产品详情
watch(() => route.params.id, async () => {
  currentImageIndex.value = 0
  // 确保产品数据已加载
  if (store.state.products.length === 0) {
    await store.loadProducts()
  }
  // 添加到浏览历史
  if (product.value) {
    store.addToHistory(product.value)
  }
}, { immediate: true })
</script>

<style scoped>
.product-detail {
  padding: 20px 0;
}

.back-btn {
  margin-bottom: 20px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.product-content {
  display: flex;
  gap: 30px;
}

.product-images {
  flex: 1;
}

.product-info {
  flex: 1;
}

.error-message {
  text-align: center;
  padding: 40px;
}

@media (max-width: 768px) {
  .product-content {
    flex-direction: column;
  }
}
</style>