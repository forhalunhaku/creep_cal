import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--color-card)',
          borderRadius: 'var(--border-radius)',
          margin: '20px',
          boxShadow: 'var(--shadow-medium)'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            ERROR
          </div>
          <h2 style={{
            color: 'var(--color-primary)',
            marginBottom: '16px'
          }}>
            哎呀！出现了一个错误
          </h2>
          <p style={{
            color: 'var(--color-text)',
            marginBottom: '24px',
            fontSize: '1.1rem'
          }}>
            计算器遇到了意外错误，请刷新页面重试。
          </p>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--color-btn-bg)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 'var(--border-radius-small)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => e.target.style.background = 'var(--color-btn-hover-bg)'}
              onMouseOut={(e) => e.target.style.background = 'var(--color-btn-bg)'}
            >
              刷新页面
            </button>
            
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                background: 'transparent',
                color: 'var(--color-primary)',
                border: '2px solid var(--color-primary)',
                padding: '12px 24px',
                borderRadius: 'var(--border-radius-small)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'var(--transition)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'var(--color-primary)';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--color-primary)';
              }}
            >
              重试
            </button>
          </div>

          {/* 开发环境下显示错误详情 */}
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginTop: '32px',
              textAlign: 'left',
              background: 'rgba(255, 0, 0, 0.1)',
              padding: '16px',
              borderRadius: 'var(--border-radius-small)',
              border: '1px solid rgba(255, 0, 0, 0.2)'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#d32f2f',
                marginBottom: '8px'
              }}>
                错误详情 (开发模式)
              </summary>
              <pre style={{
                fontSize: '0.85rem',
                color: '#d32f2f',
                overflow: 'auto',
                maxHeight: '200px',
                margin: 0
              }}>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
