'use client';

import { useState } from 'react';
import { ErrorBoundary } from './ui/error-boundary';
import { ToastContainer } from './ui/toast';

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
  }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
