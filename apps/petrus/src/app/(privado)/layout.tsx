'use client';

import { ReactNode } from 'react';
import { withPrivate } from '@/hocs/withPrivate';

function PrivateLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default withPrivate(PrivateLayout);
