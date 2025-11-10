'use client';
import Commands from '@/components/ui/commandslist';
import { Hero } from '@/components/ui/hero';

// Command Page for listing all commands of bot.
export default function CommandPage() {
  return (
    <>
      <div className="flex min-h-screen justify bg-card socialist-center items-center px-4 sm:px-6 lg:px-8">
        <Hero.Container>
          <Commands />
        </Hero.Container>
      </div>
    </>
  );
}
