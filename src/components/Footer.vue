<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-social-links" id="footer-social-links">
          <!-- 社交链接将通过JavaScript动态生成 -->
        </div>
        <button class="footer-contact-btn" @click="openContactModal">
          联系我们
        </button>
        <p class="footer-text" id="footer-text">&copy; 2026 GH5. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const openContactModal = () => {
  // 打开联系我们模态框
  console.log('Opening contact modal...')
}
</script>

<style scoped>
/* 样式已在main.css中定义 */
</style>