class Notifier {
    constructor() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型：success, error, warning, info
     * @param {number} duration - 显示时长（毫秒）
     */
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // 添加到容器
        this.container.appendChild(notification);

        // 自动关闭
        setTimeout(() => {
            this.remove(notification);
        }, duration);
    }

    /**
     * 显示成功通知
     * @param {string} message - 通知消息
     * @param {number} duration - 显示时长（毫秒）
     */
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    /**
     * 显示错误通知
     * @param {string} message - 通知消息
     * @param {number} duration - 显示时长（毫秒）
     */
    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    }

    /**
     * 显示警告通知
     * @param {string} message - 通知消息
     * @param {number} duration - 显示时长（毫秒）
     */
    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    }

    /**
     * 显示信息通知
     * @param {string} message - 通知消息
     * @param {number} duration - 显示时长（毫秒）
     */
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    /**
     * 移除通知
     * @param {HTMLElement} notification - 通知元素
     */
    remove(notification) {
        if (notification) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * 清除所有通知
     */
    clearAll() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}

// 导出单例
const notifier = new Notifier();
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notifier;
} else {
    window.notifier = notifier;
}