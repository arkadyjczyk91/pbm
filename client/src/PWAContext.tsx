import React, { createContext, useContext } from 'react';
import { usePWA } from './hooks/usePWA';

const PWAContext = createContext<ReturnType<typeof usePWA> | null>(null);

export const PWAProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const pwa = usePWA();
  return <PWAContext.Provider value={pwa}>{children}</PWAContext.Provider>;
};

export const usePWAContext = () => {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error('usePWAContext must be used within PWAProvider');
  return ctx;
};