'use client';
import { createContext, useState, useCallback, ReactNode } from 'react';

export interface ProgressContextType {
  isVisible: boolean;
  progress: number;
  message: string;
  startProgress: (initialMessage?: string) => void;
  updateProgress: (value: number, newMessage?: string) => void;
  completeProgress: () => void;
  resetProgress: () => void;
}

export const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider = ({ children }: ProgressProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const startProgress = useCallback((initialMessage = 'Processando...') => {
    setIsVisible(true);
    setProgress(0);
    setMessage(initialMessage);
  }, []);

  const updateProgress = useCallback((value: number, newMessage?: string) => {
    setProgress(Math.min(100, Math.max(0, value)));
    if (newMessage !== undefined) {
      setMessage(newMessage);
    }
  }, []);

  const completeProgress = useCallback(() => {
    setProgress(100);
    setMessage('Concluído!');
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
      setMessage('');
    }, 500);
  }, []);

  const resetProgress = useCallback(() => {
    setIsVisible(false);
    setProgress(0);
    setMessage('');
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        isVisible,
        progress,
        message,
        startProgress,
        updateProgress,
        completeProgress,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
