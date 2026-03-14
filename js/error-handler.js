class ErrorHandler {
    constructor() {
        this.errorContainer = null;
    }

    init() {
        this.createErrorContainer();
    }

    createErrorContainer() {
        this.errorContainer = document.createElement('div');
        this.errorContainer.className = 'error-container';
        this.errorContainer.style.cssText = '
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        ';
        document.body.appendChild(this.errorContainer);
    }

    showError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = '
            background: #f8d7da;
            color: #721c24;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
        ';

        this.errorContainer.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, duration);
    }

    handleError(error, context = '') {
        console.error('Error in', context, error);
        let message = error.message || 'An error occurred';
        if (context) {
            message = `${context}: ${message}`;
        }
        this.showError(message);
    }
}

const errorHandler = new ErrorHandler();
window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, 'Global error');
});

window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, 'Unhandled promise rejection');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = errorHandler;
} else {
    window.errorHandler = errorHandler;
}