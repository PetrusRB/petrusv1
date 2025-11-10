'use client';

import Provider from '@/providers/Provider';
import { ProgressBar } from '@/components/ui/loading/progressloading';
import { ProgressProvider } from '@/context/progress.context';

export default function GlobalClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider>
      <Provider>
        <ProgressBar />
        {children}
      </Provider>
    </ProgressProvider>
  );
}
