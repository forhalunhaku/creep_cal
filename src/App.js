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
  const [theme] = useState(getInitialTheme());

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

      <div className="main-card">
        <ErrorBoundary>
          {renderTabContent()}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
