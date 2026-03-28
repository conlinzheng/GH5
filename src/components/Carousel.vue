<template>
  <div class="carousel-section">
    <div class="carousel-container">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div class="carousel-slide" v-for="(slide, index) in slides" :key="index">
          <div class="carousel-content">
            <h2 class="carousel-title">{{ slide.title }}</h2>
            <p class="carousel-description">{{ slide.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  slides: {
    type: Array,
    default: () => [
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
    ]
  },
  interval: {
    type: Number,
    default: 5000
  }
})

const currentSlide = ref(0)
let slideInterval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % props.slides.length
}

onMounted(() => {
  slideInterval = setInterval(nextSlide, props.interval)
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})
</script>

<style scoped>
/* 样式已在main.css中定义 */
</style>