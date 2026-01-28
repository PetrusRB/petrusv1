'use client';
import { Hero } from '@/components/ui/hero';
import { Features } from '@/components/ui/features';
import { CardSuporte } from '@/components/ui/suporte/cardsuporte';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Hero.Div>
        <Hero.Animation />
        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />

        {/* Features section placeholder */}
        <div className="w-full max-w-7xl">
          <Features.Features />
        </div>
        {/* Exemplo dos comandos */}
        <Features.Proofs />

        <CardSuporte />
      </Hero.Div>
    </div>
  );
}
