/**
 * 主题管理
 */
export const ThemeManager = {
  // 主题类型
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  },

  // 获取当前主题
  getCurrentTheme() {
    return localStorage.getItem('theme') || this.THEMES.SYSTEM;
  },

  // 设置主题
  setTheme(theme) {
    if (theme === this.THEMES.SYSTEM) {
      localStorage.removeItem('theme');
      this.applySystemTheme();
    } else {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  // 应用系统主题
  applySystemTheme() {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', 
      isDark ? this.THEMES.DARK : this.THEMES.LIGHT
    );
  },

  // 初始化主题
  init() {
    const savedTheme = this.getCurrentTheme();
    if (savedTheme === this.THEMES.SYSTEM) {
      this.applySystemTheme();
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (this.getCurrentTheme() === this.THEMES.SYSTEM) {
          document.documentElement.setAttribute('data-theme',
            e.matches ? this.THEMES.DARK : this.THEMES.LIGHT
          );
        }
      });
  }
};

/**
 * 动画管理
 */
export const AnimationManager = {
  // 添加元素的进入动画
  fadeIn(element, delay = 0) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    element.style.transitionDelay = `${delay}s`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  },

  // 为列表添加渐入动画
  fadeInList(elements, stagger = 0.1) {
    elements.forEach((el, index) => {
      this.fadeIn(el, index * stagger);
    });
  }
};

/**
 * 表单验证
 */
export const FormValidator = {
  // 验证数字输入
  validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },

  // 验证必填字段
  validateRequired(value) {
    return value !== null && value !== undefined && value.trim() !== '';
  },

  // 显示错误消息
  showError(input, message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    const parent = input.parentElement;
    const existing = parent.querySelector('.error-message');
    if (existing) parent.removeChild(existing);
    
    parent.appendChild(errorElement);
    input.classList.add('error');
  },

  // 清除错误消息
  clearError(input) {
    const parent = input.parentElement;
    const error = parent.querySelector('.error-message');
    if (error) parent.removeChild(error);
    input.classList.remove('error');
  }
};

/**
 * 数据格式化
 */
export const Formatter = {
  // 格式化数字
  formatNumber(number, decimals = 2) {
    return Number(number).toLocaleString('zh-CN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  // 格式化日期
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }
};

/**
 * 本地存储管理
 */
export const StorageManager = {
  // 保存数据
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (e) {
      console.error('Error saving to localStorage', e);
      return false;
    }
  },

  // 获取数据
  get(key, defaultValue = null) {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return defaultValue;
      return JSON.parse(serialized);
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return defaultValue;
    }
  },

  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from localStorage', e);
      return false;
    }
  },

  // 清除所有数据
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing localStorage', e);
      return false;
    }
  }
};

/**
 * 防抖函数
 */
export function debounce(func, wait) {
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

/**
 * 节流函数
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
