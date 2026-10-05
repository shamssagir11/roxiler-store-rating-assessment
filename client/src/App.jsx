import React from 'react';
import { ToastProvider } from './hooks/useToast';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
