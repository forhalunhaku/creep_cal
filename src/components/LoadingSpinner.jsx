import React from 'react';

const LoadingSpinner = ({ 
  size = 40, 
  message = "Loading...", 
  showMessage = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-5 gap-3">
      <div
        className="rounded-full animate-spin"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: `3px solid var(--green-soft)`,
          borderTop: `3px solid var(--green)`,
        }}
      />
      
      {showMessage && (
        <div className="text-muted text-sm font-medium text-center">
          {message}
        </div>
      )}
    </div>
  );
};

export const RustEngineLoader = ({ isLoading, error }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center rounded-card border border-error/20 bg-error/5">
        <div className="text-3xl mb-3">⚠️</div>
        <div className="text-error font-semibold mb-2">
          Rust engine failed to load
        </div>
        <div className="text-muted text-sm mb-4">
          Please refresh or switch to the JavaScript version.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-delete"
        >
          Refresh page
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center rounded-card border border-green-border/20 bg-green-soft/30">
        <LoadingSpinner 
          size={48}
          message="🦀 Loading Rust WASM engine..."
        />
        <div className="mt-4 text-xs text-faint max-w-[300px]">
          First load may take a few seconds...
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
