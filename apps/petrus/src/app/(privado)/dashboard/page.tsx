import { Dashboard } from '@/components/ui/dash';
import { Hero } from '@/components/ui/hero';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Hero.Div>
        <Hero.Container>
          <Dashboard.Animation />
        </Hero.Container>
      </Hero.Div>
    </div>
  );
}
