import React, { useState } from 'react';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/ui/Layout';

import SingleCalculationDashboard from './components/SingleCalculationDashboard';
import BatchCalculator from './components/BatchCalculator';
import DocsPage from './components/DocsPage';

function App() {
  const [activeMode, setActiveMode] = useState('single');

  return (
    <Layout 
      activeMode={activeMode} 
      onModeChange={setActiveMode}
      onOpenDocs={() => setActiveMode('docs')}
    >
      <ErrorBoundary>
        {activeMode === 'single' && <SingleCalculationDashboard />}
        {activeMode === 'batch' && <BatchCalculator />}
        {activeMode === 'docs' && <DocsPage />}
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
