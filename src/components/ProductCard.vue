<template>
  <div class="product-card" @click="viewProduct">
    <img :src="product.images[0]" :alt="product.name" class="product-image">
    <div class="product-info">
      <div class="product-series">{{ product.series }}</div>
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-description">{{ product.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const viewProduct = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
/* 样式已在main.css中定义 */
</style>