'use client';
import { ComponentType, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { LoadingOverlay } from '@/components/ui/loading';

export function withPrivate<T>(Component: ComponentType<T>) {
  return (props: T) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace('/'); // ou rota pública
      }
    }, [isAuthenticated, isLoading, router]);

    if (!isAuthenticated)
      return (
        <h1 className="text-center font-bold text-1xl">Você não esta logado</h1>
      );
    if (isLoading) return <LoadingOverlay />;

    return <Component {...(props as unknown as T & JSX.IntrinsicAttributes)} />;
  };
}
