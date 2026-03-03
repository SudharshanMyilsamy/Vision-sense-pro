import React, { createContext, useContext, useState } from 'react';

const defaultSettings = {
  voiceEnabled: true,
  detectionInterval: 2000, // Faster by default for "pro" feel
  minConfidence: 0.6,
  showDebug: true, // Enable debug by default for "complicated" look
};

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isScanning, setIsScanning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState(undefined);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setIsScanning(false);
  };

  return (
    <AppContext.Provider value={{ 
      settings, 
      updateSettings, 
      isScanning, 
      setIsScanning,
      isAuthenticated,
      login,
      logout,
      currentDeviceId,
      setCurrentDeviceId
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
