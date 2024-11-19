// 主题配置
const themes = {
  light: {
    icon: 'light_mode',
    label: '浅色',
  },
  dark: {
    icon: 'dark_mode',
    label: '深色',
  },
  ocean: {
    icon: 'water',
    label: '海洋',
  },
  forest: {
    icon: 'park',
    label: '森林',
  },
  sunset: {
    icon: 'wb_sunny',
    label: '日落',
  },
  royal: {
    icon: 'diamond',
    label: '皇家',
  }
};

// 主题管理类
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    // 初始化主题
    this.applyTheme(this.currentTheme);
    
    // 初始化主题选择器
    this.initThemeSelector();
    
    // 绑定事件
    this.bindEvents();
  }

  initThemeSelector() {
    const navbar = document.querySelector('.navbar-right');
    if (!navbar) return;

    // 创建主题选择器容器
    const themeSelector = document.createElement('div');
    themeSelector.className = 'theme-selector';

    // 创建主题切换按钮
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', '切换主题');
    themeToggle.innerHTML = `
      <span class="material-icons">${themes[this.currentTheme].icon}</span>
    `;

    // 创建主题菜单
    const themeMenu = document.createElement('div');
    themeMenu.className = 'theme-menu';

    // 添加主题选项
    Object.entries(themes).forEach(([name, { icon, label }]) => {
      const option = document.createElement('button');
      option.className = 'theme-option';
      option.dataset.theme = name;
      option.innerHTML = `
        <span class="material-icons">${icon}</span>
        <span class="theme-name">${label}</span>
        ${name === this.currentTheme ? '<span class="material-icons shortcut">check</span>' : ''}
      `;
      themeMenu.appendChild(option);
    });

    // 组装主题选择器
    themeSelector.appendChild(themeToggle);
    themeSelector.appendChild(themeMenu);
    navbar.appendChild(themeSelector);
  }

  bindEvents() {
    // 主题切换按钮点击事件
    document.addEventListener('click', (e) => {
      const themeToggle = e.target.closest('.theme-toggle');
      const themeOption = e.target.closest('.theme-option');
      const themeMenu = document.querySelector('.theme-menu');

      if (themeToggle) {
        themeMenu.classList.toggle('show');
        e.stopPropagation();
      } else if (themeOption) {
        const newTheme = themeOption.dataset.theme;
        this.applyTheme(newTheme);
        themeMenu.classList.remove('show');
        e.stopPropagation();
      } else if (themeMenu?.classList.contains('show')) {
        themeMenu.classList.remove('show');
      }
    });

    // 按下 Escape 键关闭主题菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const themeMenu = document.querySelector('.theme-menu');
        if (themeMenu?.classList.contains('show')) {
          themeMenu.classList.remove('show');
        }
      }
    });
  }

  applyTheme(theme) {
    // 更新数据属性
    document.documentElement.dataset.theme = theme;
    
    // 更新当前主题
    this.currentTheme = theme;
    
    // 保存到本地存储
    localStorage.setItem('theme', theme);
    
    // 更新主题切换按钮图标
    const toggleIcon = document.querySelector('.theme-toggle .material-icons');
    if (toggleIcon) {
      toggleIcon.textContent = themes[theme].icon;
    }
    
    // 更新选中状态
    document.querySelectorAll('.theme-option').forEach(option => {
      const checkIcon = option.querySelector('.shortcut');
      if (option.dataset.theme === theme) {
        if (!checkIcon) {
          option.innerHTML += '<span class="material-icons shortcut">check</span>';
        }
      } else if (checkIcon) {
        checkIcon.remove();
      }
    });
  }
}

// 初始化主题管理器
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});
