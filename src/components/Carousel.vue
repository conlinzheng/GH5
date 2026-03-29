<template>
  <div class="carousel-section">
    <div class="carousel-container">
      <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div class="carousel-slide" v-for="(slide, index) in slides" :key="index">
          <div class="carousel-content">
            <img :src="slide.image" :alt="slide.title.zh" class="carousel-image">
            <h2 class="carousel-title">{{ slide.title.zh }}</h2>
            <p class="carousel-description">{{ slide.description.zh }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import carouselLoader from '../utils/carouselLoader'

const props = defineProps({
  interval: {
    type: Number,
    default: 5000
  }
})

const slides = ref([])
const currentSlide = ref(0)
let slideInterval = null

const loadCarousel = async () => {
  try {
    const carouselData = await carouselLoader.loadCarouselFromFileSystem()
    slides.value = carouselData
  } catch (error) {
    console.error('Failed to load carousel:', error)
  }
}

const nextSlide = () => {
  if (slides.value.length > 0) {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length
  }
}

onMounted(async () => {
  await loadCarousel()
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