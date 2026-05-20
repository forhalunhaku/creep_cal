import React from 'react';

const LoadingSpinner = ({ 
  size = 40, 
  message = "加载中...", 
  showMessage = true,
  color = "var(--color-primary)"
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '12px'
    }}>
      {/* 旋转的齿轮图标 */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `3px solid ${color}20`,
          borderTop: `3px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      {showMessage && (
        <div style={{
          color: 'var(--color-text)',
          fontSize: '0.9rem',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      

    </div>
  );
};

// Rust引擎专用加载组件
export const RustEngineLoader = ({ isLoading, error }) => {
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'rgba(255, 0, 0, 0.05)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid rgba(255, 0, 0, 0.2)'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
        <div style={{ 
          color: '#d32f2f', 
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          Rust引擎加载失败
        </div>
        <div style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          marginBottom: '16px'
        }}>
          请刷新页面重试，或使用JavaScript版本
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--border-radius-small)',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          🔄 刷新页面
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'rgba(52, 152, 219, 0.05)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid rgba(52, 152, 219, 0.2)'
      }}>
        <LoadingSpinner 
          size={48}
          message="🦀 正在加载Rust高性能引擎..."
          color="var(--color-primary)"
        />
        <div style={{
          marginTop: '16px',
          fontSize: '0.85rem',
          color: '#666',
          maxWidth: '300px'
        }}>
          首次加载可能需要几秒钟，请耐心等待...
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
