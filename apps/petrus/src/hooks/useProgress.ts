import { useContext } from 'react';
import {
  ProgressContext,
  ProgressContextType,
} from '@/context/progress.context';

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);

  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }

  return context;
};

// Utility hook for automatic progress simulation
export const useAutoProgress = () => {
  const { startProgress, updateProgress, completeProgress } = useProgress();

  const simulateProgress = async (
    task: () => Promise<void>,
    options?: {
      message?: string;
      steps?: number;
      stepDelay?: number;
    }
  ) => {
    const {
      message = 'Processando...',
      steps = 10,
      stepDelay = 100,
    } = options || {};

    startProgress(message);

    try {
      // Simulate incremental progress
      const increment = 90 / steps;
      for (let i = 0; i < steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, stepDelay));
        updateProgress((i + 1) * increment);
      }

      // Execute the actual task
      await task();

      // Complete
      completeProgress();
    } catch (error) {
      completeProgress();
      throw error;
    }
  };

  return { simulateProgress };
};
