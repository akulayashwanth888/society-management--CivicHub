
import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  if (user) {
    return <Dashboard />;
  }

  if (showAuth) {
    return <AuthPage />;
  }

  return <LandingPage onLogin={() => setShowAuth(true)} />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
