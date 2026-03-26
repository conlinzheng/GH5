// 主入口文件
// 引入所有模块

// 初始化应用
function initFrontend() {
  // 确保所有模块都已加载
  if (typeof frontendCore !== 'undefined' && typeof frontendUI !== 'undefined' && typeof frontendEvents !== 'undefined') {
    // 初始化核心模块
    frontendCore.init();
    
    // 设置事件监听器
    frontendEvents.setupEventListeners();
    
    console.log('Frontend initialized successfully');
  } else {
    // 如果模块未加载，延迟重试
    setTimeout(initFrontend, 100);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFrontend);
} else {
  initFrontend();
}
