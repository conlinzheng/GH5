class ModalEvents {
  constructor(frontend) {
    this.frontend = frontend;
  }

  setupModalEventListeners() {
    // 模态框关闭按钮
    this._setupModalCloseListener();
    
    // 模态框遮罩层
    this._setupModalOverlayListener();
    
    // 键盘事件
    this._setupKeyboardListeners();
    
    // 联系我们弹窗关闭按钮
    this._setupContactModalCloseListener();
    
    // 联系我们弹窗遮罩层
    this._setupContactModalOverlayListener();
  }

  _setupModalCloseListener() {
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.frontend.closeProductDetails();
      });
    }
  }

  _setupModalOverlayListener() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', () => {
        this.frontend.closeProductDetails();
      });
    }
  }

  _setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.frontend.closeProductDetails();
        this.frontend.closeContactModal();
      }
    });
  }

  _setupContactModalCloseListener() {
    const contactModalClose = document.getElementById('contact-modal-close');
    if (contactModalClose) {
      contactModalClose.addEventListener('click', () => {
        this.frontend.closeContactModal();
      });
    }
  }

  _setupContactModalOverlayListener() {
    const contactModalOverlay = document.getElementById('contact-modal-overlay');
    if (contactModalOverlay) {
      contactModalOverlay.addEventListener('click', () => {
        this.frontend.closeContactModal();
      });
    }
  }

  handleModalClose() {
    // 处理模态框关闭事件
    this.frontend.closeProductDetails();
  }

  handleLightboxNavigation(direction) {
    // 处理灯箱导航事件
    this.frontend.navigateLightbox(direction);
  }
}

const modalEvents = new ModalEvents(window.frontend);
export default modalEvents;