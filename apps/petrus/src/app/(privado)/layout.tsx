'use client';

import { withPrivate } from '@/hocs/withPrivate';
import { ReactNode } from 'react';

function PrivateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default withPrivate(PrivateLayout);
