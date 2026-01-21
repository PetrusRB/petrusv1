import { useAuth } from '@/context/auth.context';
import React from 'react';
export const OnlyAuth = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { isAuthenticated } = useAuth();
  return <>{isAuthenticated ? children : fallback}</>;
};
