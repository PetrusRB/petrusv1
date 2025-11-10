'use client';
import { Hero } from '@/components/ui/hero';
import { NotFound } from '@/components/ui/notfound';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Hero.Div>
        <Hero.Container>
          <NotFound.Animation />
        </Hero.Container>
      </Hero.Div>
    </div>
  );
}
