'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { usePathname, useSearchParams } from 'next/navigation';

export function useRouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startProgress, updateProgress, completeProgress } = useProgress();

  const rafId = useRef<number | null>(null);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const animate = useCallback(
    (timestamp: number): void => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const duration = 1200; // 1.2 segundos no total

      // Progressão não-linear suave
      let progress = 0;

      if (elapsed < duration) {
        const t = elapsed / duration;
        // Curva de easing: início rápido, final lento
        progress = 100 * (1 - Math.pow(1 - t, 2));
      } else {
        progress = 100;
      }

      progress = Math.min(progress, 99); // Para em 99% até completar
      progressRef.current = progress;
      updateProgress(progress);

      if (progress < 99) {
        rafId.current = requestAnimationFrame(animate);
      }
    },
    [updateProgress]
  );

  const startProgressAnimation = useCallback((): void => {
    // Limpa animação anterior
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Reseta estado
    progressRef.current = 0;
    startTimeRef.current = null;

    // Inicia progresso
    startProgress('Carregando...');
    rafId.current = requestAnimationFrame(animate);
  }, [animate, startProgress]);

  const completeProgressAnimation = useCallback((): void => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Finaliza imediatamente
    updateProgress(100);
    completeProgress();
    progressRef.current = 0;
    startTimeRef.current = null;
  }, [updateProgress, completeProgress]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleRouteChange = (): void => {
      startProgressAnimation();

      // Simula tempo de carregamento baseado na rota
      const routeDepth = pathname.split('/').filter(Boolean).length;
      const loadTime = 600 + routeDepth * 100 + Math.random() * 300;

      timeoutId = setTimeout(() => {
        completeProgressAnimation();
      }, loadTime);
    };

    handleRouteChange();

    return () => {
      clearTimeout(timeoutId);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [
    pathname,
    searchParams,
    startProgressAnimation,
    completeProgressAnimation,
  ]);

  // Cleanup global
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, []);
}
