import React from 'react';

import LoginPage from './pages/LoginPage.tsx';

// Deployment test: minor change by developer
function App() {
  return (
    <div>
      <LoginPage />
      {/* Deployment test: Vercel redeploy triggered */}
      <div style={{textAlign: 'center', color: '#4caf50', marginTop: 16}}>
        Deployment test: Vercel redeploy triggered
      </div>
    </div>
  );
}

export default App;
