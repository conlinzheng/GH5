class ErrorHandler {
  constructor() {
    this.errorTypes = {
      NETWORK: 'network',
      API: 'api',
      CACHE: 'cache',
      DOM: 'dom',
      VALIDATION: 'validation',
      UNKNOWN: 'unknown'
    };
    
    this.errorMessages = {
      zh: {
        network: '网络连接失败，请检查网络设置',
        api: 'API请求失败，请稍后重试',
        cache: '缓存操作失败',
        dom: '页面元素操作失败',
        validation: '数据验证失败',
        unknown: '未知错误，请稍后重试'
      },
      en: {
        network: 'Network connection failed, please check network settings',
        api: 'API request failed, please try again later',
        cache: 'Cache operation failed',
        dom: 'DOM operation failed',
        validation: 'Data validation failed',
        unknown: 'Unknown error, please try again later'
      },
      ko: {
        network: '네트워크 연결 실패, 네트워크 설정을 확인하세요',
        api: 'API 요청 실패, 나중에 다시 시도하세요',
        cache: '캐시 작업 실패',
        dom: 'DOM 작업 실패',
        validation: '데이터 유효성 검사 실패',
        unknown: '알 수 없는 오류, 나중에 다시 시도하세요'
      }
    };
  }
  
  handleError(error, errorType = this.errorTypes.UNKNOWN, customMessage = null) {
    console.error(`[${errorType.toUpperCase()} ERROR]:`, error);
    
    const message = customMessage || this.getErrorMessage(errorType);
    this.showError(message);
    
    return {
      type: errorType,
      message: message,
      originalError: error
    };
  }
  
  getErrorMessage(errorType) {
    const lang = typeof i18n !== 'undefined' ? i18n.getCurrentLanguage() : 'zh';
    const messages = this.errorMessages[lang] || this.errorMessages.zh;
    return messages[errorType] || messages.unknown;
  }
  
  showError(message) {
    this.hideError();
    
    const errorContainer = document.createElement('div');
    errorContainer.id = 'error-notification';
    errorContainer.className = 'error-notification';
    errorContainer.innerHTML = `
      <div class="error-content">
        <span class="error-message">${message}</span>
        <button class="error-close" onclick="errorHandler.hideError()">&times;</button>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
    
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }
  
  hideError() {
    const errorContainer = document.getElementById('error-notification');
    if (errorContainer) {
      errorContainer.remove();
    }
  }
  
  showSuccess(message) {
    const successContainer = document.createElement('div');
    successContainer.id = 'success-notification';
    successContainer.className = 'success-notification';
    successContainer.innerHTML = `
      <div class="success-content">
        <span class="success-message">${message}</span>
        <button class="success-close" onclick="errorHandler.hideSuccess()">&times;</button>
      </div>
    `;
    
    document.body.appendChild(successContainer);
    
    setTimeout(() => {
      this.hideSuccess();
    }, 3000);
  }
  
  hideSuccess() {
    const successContainer = document.getElementById('success-notification');
    if (successContainer) {
      successContainer.remove();
    }
  }
  
  handleApiError(error) {
    if (error.status === 401) {
      return this.handleError(error, this.errorTypes.API, '认证失败，请检查API密钥');
    } else if (error.status === 403) {
      return this.handleError(error, this.errorTypes.API, '访问被拒绝，API限流或权限不足');
    } else if (error.status === 404) {
      return this.handleError(error, this.errorTypes.API, '请求的资源不存在');
    } else if (error.status === 429) {
      return this.handleError(error, this.errorTypes.API, 'API请求过于频繁，请稍后重试');
    } else if (error.message && error.message.includes('Network')) {
      return this.handleError(error, this.errorTypes.NETWORK);
    } else {
      return this.handleError(error, this.errorTypes.API);
    }
  }
  
  handleCacheError(error) {
    return this.handleError(error, this.errorTypes.CACHE);
  }
  
  handleDomError(error) {
    return this.handleError(error, this.errorTypes.DOM);
  }
  
  handleValidationError(error) {
    return this.handleError(error, this.errorTypes.VALIDATION);
  }
}

const errorHandler = new ErrorHandler();