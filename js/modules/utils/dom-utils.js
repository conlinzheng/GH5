class DomUtils {
  constructor() {}

  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
      element.className = options.className;
    }
    
    if (options.id) {
      element.id = options.id;
    }
    
    if (options.text) {
      element.textContent = options.text;
    }
    
    if (options.html) {
      element.innerHTML = options.html;
    }
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        element.style[key] = value;
      });
    }
    
    if (options.dataset) {
      Object.entries(options.dataset).forEach(([key, value]) => {
        element.dataset[key] = value;
      });
    }
    
    return element;
  }

  querySelector(selector, context = document) {
    return context.querySelector(selector);
  }

  querySelectorAll(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  addEventListeners(element, events) {
    Object.entries(events).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });
  }

  removeEventListeners(element, events) {
    Object.entries(events).forEach(([event, handler]) => {
      element.removeEventListener(event, handler);
    });
  }

  addClass(element, className) {
    if (element) {
      element.classList.add(className);
    }
  }

  removeClass(element, className) {
    if (element) {
      element.classList.remove(className);
    }
  }

  toggleClass(element, className) {
    if (element) {
      return element.classList.toggle(className);
    }
    return false;
  }

  hasClass(element, className) {
    if (element) {
      return element.classList.contains(className);
    }
    return false;
  }

  setAttribute(element, name, value) {
    if (element) {
      element.setAttribute(name, value);
    }
  }

  getAttribute(element, name) {
    if (element) {
      return element.getAttribute(name);
    }
    return null;
  }

  removeAttribute(element, name) {
    if (element) {
      element.removeAttribute(name);
    }
  }

  setStyle(element, property, value) {
    if (element) {
      element.style[property] = value;
    }
  }

  getStyle(element, property) {
    if (element) {
      return window.getComputedStyle(element).getPropertyValue(property);
    }
    return '';
  }

  setStyles(element, styles) {
    if (element) {
      Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
      });
    }
  }

  appendChild(parent, child) {
    if (parent && child) {
      parent.appendChild(child);
    }
  }

  insertBefore(parent, child, reference) {
    if (parent && child) {
      parent.insertBefore(child, reference);
    }
  }

  removeChild(parent, child) {
    if (parent && child) {
      parent.removeChild(child);
    }
  }

  removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  cloneElement(element, deep = true) {
    if (element) {
      return element.cloneNode(deep);
    }
    return null;
  }

  getParent(element, selector) {
    let current = element;
    while (current && current !== document) {
      if (current.matches(selector)) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  getChildren(element, selector = '*') {
    return Array.from(element.children).filter(child => child.matches(selector));
  }

  getSiblings(element, selector = '*') {
    return Array.from(element.parentNode.children).filter(
      sibling => sibling !== element && sibling.matches(selector)
    );
  }

  getNextSibling(element, selector = '*') {
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (sibling.matches(selector)) {
        return sibling;
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  }

  getPreviousSibling(element, selector = '*') {
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (sibling.matches(selector)) {
        return sibling;
      }
      sibling = sibling.previousElementSibling;
    }
    return null;
  }

  isElementInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  scrollToElement(element, options = {}) {
    if (element) {
      element.scrollIntoView({
        behavior: options.behavior || 'smooth',
        block: options.block || 'start',
        inline: options.inline || 'nearest'
      });
    }
  }

  getElementPosition(element) {
    if (!element) return { x: 0, y: 0 };
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY
    };
  }

  getElementSize(element) {
    if (!element) return { width: 0, height: 0 };
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height
    };
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
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

  addGlobalEventListener(event, selector, callback) {
    document.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        callback(e, target);
      }
    });
  }

  createFragment(children) {
    const fragment = document.createDocumentFragment();
    children.forEach(child => {
      if (child) {
        fragment.appendChild(child);
      }
    });
    return fragment;
  }

  emptyElement(element) {
    if (element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }

  replaceElement(oldElement, newElement) {
    if (oldElement && newElement && oldElement.parentNode) {
      oldElement.parentNode.replaceChild(newElement, oldElement);
    }
  }

  showElement(element, display = 'block') {
    if (element) {
      element.style.display = display;
    }
  }

  hideElement(element) {
    if (element) {
      element.style.display = 'none';
    }
  }

  toggleElement(element, display = 'block') {
    if (element) {
      if (element.style.display === 'none') {
        element.style.display = display;
      } else {
        element.style.display = 'none';
      }
    }
  }

  getComputedStyle(element, property) {
    if (element) {
      return window.getComputedStyle(element).getPropertyValue(property);
    }
    return '';
  }

  isVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }
}

const domUtils = new DomUtils();
export default domUtils;