'use client';
import { Hero } from '@/components/ui/hero';
import { Features } from '@/components/ui/features';
import { CardSuporte } from '@/components/ui/suporte/cardsuporte';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Hero.Div>
        <Hero.Container>
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
        </Hero.Container>
      </Hero.Div>
    </div>
  );
}
