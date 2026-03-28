import { Product, Series, SeriesNameMap, ProductOrders, SeriesOrder } from '../types';

/**
 * 从文件名中提取产品名称
 * @param fileName 文件名
 * @returns 产品名称
 */
export function extractProductName(fileName: string): string {
  // 从文件名中提取产品名称
  // 处理 "产品1 (1).jpg" 这样的格式
  const match = fileName.match(/^(.+?)\s*\(\d+\)\.\w+$/);
  if (match) {
    return match[1].trim();
  }
  // 处理 "产品1.jpg" 这样的格式
  return fileName.replace(/\.\w+$/, '').trim();
}

/**
 * 生成产品显示名称
 * @param rawName 原始产品名称
 * @returns 产品显示名称
 */
export function getProductDisplayName(rawName: string): string {
  // 生成产品显示名称
  if (rawName === '产品1') return 'PU新款';
  if (rawName === '产品2') return 'PU经典';
  if (rawName === '产品3') return 'PU时尚';
  return rawName;
}

/**
 * 判断是否为主图
 * @param fileName 文件名
 * @returns 是否为主图
 */
export function isMainImage(fileName: string): boolean {
  // 判断是否为主图
  // 主图通常是 (1) 或没有数字后缀的图片
  return fileName.includes('(1)') || !fileName.match(/\s*\(\d+\)\.\w+$/);
}

/**
 * 获取图片URL
 * @param seriesId 系列ID
 * @param imageName 图片名称
 * @param owner GitHub所有者
 * @param repo GitHub仓库
 * @param productsPath 产品路径
 * @returns 图片URL
 */
export function getImageUrl(
  seriesId: string, 
  imageName: string, 
  owner: string = 'conlinzheng', 
  repo: string = 'GH5', 
  productsPath: string = '产品图'
): string {
  return `https://${owner}.github.io/${repo}/${productsPath}/${seriesId}/${imageName}`;
}

/**
 * 获取拖拽元素应该插入的位置
 * @param container 容器元素
 * @param y 鼠标Y坐标
 * @returns 插入位置的元素
 */
export function getDragAfterElement(container: HTMLElement, y: number): HTMLElement | null {
  const draggableElements = [...container.querySelectorAll('.series-card, .file-item:not(.dragging)')] as HTMLElement[];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

/**
 * 安全地绑定事件监听器
 * @param id 元素ID
 * @param event 事件名称
 * @param handler 事件处理函数
 */
export function bindEvent(id: string, event: string, handler: EventListener): void {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener(event, handler);
  } else {
    console.warn(`Element ${id} not found`);
  }
}

/**
 * 格式化日期时间
 * @param date 日期对象
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString();
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成唯一ID
 * @returns 唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 检查对象是否为空
 * @param obj 要检查的对象
 * @returns 是否为空
 */
export function isEmpty(obj: any): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 截断字符串
 * @param str 要截断的字符串
 * @param maxLength 最大长度
 * @returns 截断后的字符串
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}