import React, { useState, useEffect } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Aci209Calculator from './components/Aci209Calculator';
import Mc2010Calculator from './components/Mc2010Calculator';
import B4Calculator from './components/B4Calculator';
import B4sCalculator from './components/B4sCalculator';
import RustAci209Calculator from './components/RustAci209Calculator';
import RustMc2010Calculator from './components/RustMc2010Calculator';
import RustB4Calculator from './components/RustB4Calculator';
import RustB4sCalculator from './components/RustB4sCalculator';

const TABS = [
  { key: 'aci209', label: 'ACI209' },
  { key: 'mc2010', label: 'MC2010' },
  { key: 'b4', label: 'B4' },
  { key: 'b4s', label: 'B4S' },
  { key: 'rust-aci209', label: '🦀 ACI209-Rust' },
  { key: 'rust-mc2010', label: '🦀 MC2010-Rust' },
  { key: 'rust-b4', label: '🦀 B4-Rust' },
  { key: 'rust-b4s', label: '🦀 B4S-Rust' },
];

// const THEME_OPTIONS = [
//   { key: 'system', label: '跟随系统', icon: '🖥️' },
//   { key: 'light', label: '亮色', icon: '🌞' },
//   { key: 'dark', label: '暗色', icon: '🌙' },
// ];

function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function getInitialTheme() {
  const saved = localStorage.getItem('theme-mode');
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'system';
}



function App() {
  const [activeTab, setActiveTab] = useState('aci209');
  const [theme, setTheme] = useState(getInitialTheme());
  const [showDocs, setShowDocs] = useState(false);

  // 监听系统主题变化
  useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        document.body.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
      };
      handler();
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    } else {
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme-mode', theme);
    if (theme !== 'system') {
      document.body.setAttribute('data-theme', theme);
    } else {
      document.body.setAttribute('data-theme', getSystemTheme());
    }
  }, [theme]);

  // 主题切换函数
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // 获取当前主题图标
  const getThemeIcon = () => {
    return theme === 'light' ? '🌙' : '🌞';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'aci209': return <Aci209Calculator />;
      case 'mc2010': return <Mc2010Calculator />;
      case 'b4': return <B4Calculator />;
      case 'b4s': return <B4sCalculator />;
      case 'rust-aci209': return <RustAci209Calculator />;
      case 'rust-mc2010': return <RustMc2010Calculator />;
      case 'rust-b4': return <RustB4Calculator />;
      case 'rust-b4s': return <RustB4sCalculator />;
      default: return null;
    }
  };

  return (
    <div className="App" style={{ position: 'relative' }}>
      {/* 头部按钮区域 */}
      <div className="header-controls">
        <button
          onClick={toggleTheme}
          className="theme-icon-btn"
          title={`切换到${theme === 'light' ? '深色' : '浅色'}模式`}
        >
          <span className="theme-icon">{getThemeIcon()}</span>
        </button>
        <button
          onClick={() => setShowDocs(!showDocs)}
          className="theme-icon-btn"
          title="查看模型说明文档"
        >
          <span className="theme-icon">📚</span>
        </button>
      </div>

      <h1>混凝土徐变多模型计算平台</h1>

      <div className="tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 文档说明弹窗 */}
      {showDocs && (
        <div className="docs-overlay" onClick={() => setShowDocs(false)}>
          <div className="docs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="docs-header">
              <h3>📚 模型说明文档</h3>
              <button onClick={() => setShowDocs(false)} className="close-btn">✕</button>
            </div>
            <div className="docs-content">
              <div className="docs-links">
                <a href="/模型说明/aci209.md" target="_blank" rel="noopener noreferrer">
                  📄 ACI209 模型说明
                </a>
                <a href="/模型说明/mc2010.md" target="_blank" rel="noopener noreferrer">
                  📄 MC2010 模型说明
                </a>
                <a href="/模型说明/b4.md" target="_blank" rel="noopener noreferrer">
                  📄 B4 模型说明
                </a>
                <a href="/模型说明/b4s.md" target="_blank" rel="noopener noreferrer">
                  📄 B4S 模型说明
                </a>
              </div>
              <div className="docs-examples">
                <h4>📊 示例数据下载</h4>
                <a href="/模型示例/aci209示例.xlsx" download>
                  📥 ACI209 示例数据
                </a>
                <a href="/模型示例/mc2010示例.xlsx" download>
                  📥 MC2010 示例数据
                </a>
                <a href="/模型示例/B4示例.xlsx" download>
                  📥 B4 示例数据
                </a>
                <a href="/模型示例/B4s示例.xlsx" download>
                  📥 B4S 示例数据
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="main-card">
        <ErrorBoundary>
          {renderTabContent()}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
