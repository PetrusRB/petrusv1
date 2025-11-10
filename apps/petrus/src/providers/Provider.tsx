'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouteProgress } from '@/hooks/useRouteProgress';

interface ProviderProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

export default function Provider({ children }: ProviderProps) {
  useRouteProgress();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
