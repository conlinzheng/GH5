class ErrorHandler {
    /**
     * 处理错误
     * @param {Error} error - 错误对象
     * @param {string} fallback -  fallback消息
     * @returns {string} 处理后的错误消息
     */
    handleError(error, fallback = '发生错误，请稍后重试') {
        console.error('Error:', error);

        // 根据错误类型返回不同的错误消息
        if (error.message.includes('404')) {
            return '请求的资源不存在';
        } else if (error.message.includes('403')) {
            return '没有权限访问该资源';
        } else if (error.message.includes('rate limit')) {
            return 'API请求频率过高，请稍后重试';
        } else if (error.message.includes('network')) {
            return '网络错误，请检查网络连接';
        }

        return fallback;
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     * @param {HTMLElement} container - 容器元素
     */
    showError(message, container) {
        if (!container) return;

        container.innerHTML = `<div class="error">${message}</div>`;
    }

    /**
     * 显示加载状态
     * @param {HTMLElement} container - 容器元素
     * @param {string} message - 加载消息
     */
    showLoading(container, message = '加载中...') {
        if (!container) return;

        container.innerHTML = `<div class="loading">${message}</div>`;
    }

    /**
     * 清除错误或加载状态
     * @param {HTMLElement} container - 容器元素
     */
    clearStatus(container) {
        if (!container) return;

        container.innerHTML = '';
    }
}

// 导出单例
const errorHandler = new ErrorHandler();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = errorHandler;
} else {
    window.errorHandler = errorHandler;
}