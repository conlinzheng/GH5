class PerformanceUtils {
  constructor() {}

  debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  measurePerformance(func, label = 'Function') {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${label} execution time: ${end - start}ms`);
    return result;
  }

  async measureAsyncPerformance(asyncFunc, label = 'Async Function') {
    const start = performance.now();
    const result = await asyncFunc();
    const end = performance.now();
    console.log(`${label} execution time: ${end - start}ms`);
    return result;
  }

  createPerformanceObserver(callback) {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        callback(entries);
      });
      return observer;
    }
    return null;
  }

  monitorNavigationPerformance() {
    if ('performance' in window && 'navigation' in performance) {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        console.log('Navigation Performance:', {
          domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
          load: navTiming.loadEventEnd - navTiming.fetchStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
        });
      }
    }
  }

  monitorResourcePerformance() {
    const observer = this.createPerformanceObserver((entries) => {
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          console.log('Resource Performance:', {
            name: entry.name,
            duration: entry.duration,
            transferSize: entry.transferSize
          });
        }
      });
    });
    if (observer) {
      observer.observe({ entryTypes: ['resource'] });
      return observer;
    }
    return null;
  }

  monitorPaintPerformance() {
    const observer = this.createPerformanceObserver((entries) => {
      entries.forEach(entry => {
        if (entry.entryType === 'paint') {
          console.log(`${entry.name}: ${entry.startTime}ms`);
        }
      });
    });
    if (observer) {
      observer.observe({ entryTypes: ['paint'] });
      return observer;
    }
    return null;
  }

  monitorLCP() {
    const observer = this.createPerformanceObserver((entries) => {
      const lcpEntry = entries[0];
      if (lcpEntry) {
        console.log('LCP:', lcpEntry.startTime);
      }
    });
    if (observer) {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      return observer;
    }
    return null;
  }

  monitorFID() {
    let fidValue = null;
    const observer = this.createPerformanceObserver((entries) => {
      const fidEntry = entries[0];
      if (fidEntry) {
        fidValue = fidEntry.processingStart - fidEntry.startTime;
        console.log('FID:', fidValue);
      }
    });
    if (observer) {
      observer.observe({ entryTypes: ['first-input'] });
      return observer;
    }
    return null;
  }

  calculateFPS() {
    let frames = 0;
    let lastTime = performance.now();
    const updateFPS = () => {
      frames++;
      const currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        const fps = frames;
        console.log('FPS:', fps);
        frames = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(updateFPS);
    };
    requestAnimationFrame(updateFPS);
  }

  optimizeImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.getAttribute('loading') !== 'lazy') {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.getAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }

  optimizeFontLoading() {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }

  preloadCriticalResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = resource.rel || 'preload';
      link.href = resource.href;
      if (resource.as) {
        link.as = resource.as;
      }
      if (resource.type) {
        link.type = resource.type;
      }
      document.head.appendChild(link);
    });
  }

  lazyLoadImages(selector = 'img[data-src]') {
    const images = document.querySelectorAll(selector);
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }

  cacheDOMSelectors(selectors) {
    const cache = {};
    Object.entries(selectors).forEach(([key, selector]) => {
      cache[key] = document.querySelector(selector);
    });
    return cache;
  }

  useRequestAnimationFrame(callback) {
    let requestId;
    const animate = () => {
      callback();
      requestId = requestAnimationFrame(animate);
    };
    requestId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestId);
  }

  optimizeEventListeners() {
    // 实现事件委托
    const eventDelegation = (parent, selector, event, handler) => {
      parent.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target) {
          handler(e, target);
        }
      });
    };
    return eventDelegation;
  }

  reduceLayoutShifts() {
    // 为所有图片添加尺寸属性
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.width && !img.height) {
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        if (naturalWidth && naturalHeight) {
          img.width = naturalWidth;
          img.height = naturalHeight;
        }
      }
    });
  }

  enableTextCompression() {
    // 检查服务器是否启用了文本压缩
    const checkCompression = () => {
      fetch(window.location.href, {
        headers: {
          'Accept-Encoding': 'gzip, deflate, br'
        }
      }).then(response => {
        const contentEncoding = response.headers.get('content-encoding');
        console.log('Content Encoding:', contentEncoding);
      });
    };
    checkCompression();
  }

  measureMemory() {
    if ('memory' in performance) {
      console.log('Memory Usage:', performance.memory);
    }
  }

  optimizeRendering() {
    // 使用 will-change 提示浏览器
    const elements = document.querySelectorAll('.animate');
    elements.forEach(element => {
      element.style.willChange = 'transform, opacity';
    });
  }

  createWorker(url) {
    if (typeof Worker !== 'undefined') {
      return new Worker(url);
    }
    return null;
  }

  offloadHeavyTask(task, callback) {
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(URL.createObjectURL(new Blob([`
        self.onmessage = function(e) {
          const result = (${task.toString()})(...e.data);
          self.postMessage(result);
        };
      `])));
      worker.onmessage = function(e) {
        callback(e.data);
        worker.terminate();
      };
      return worker;
    } else {
      // 降级到主线程执行
      const result = task();
      callback(result);
      return null;
    }
  }
}

const performanceUtils = new PerformanceUtils();
export default performanceUtils;