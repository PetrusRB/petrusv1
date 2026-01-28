'use client';
import { Button } from '@/components/ui/button/Button';
import { ArrowRight, Bot, Shield, Sparkles, Zap } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { useAuth } from '@/context/auth.context';
import { Badge } from '../../badge';
import { useRouter } from 'next/navigation';

export function HeroAnimation() {
  const navigate = useRouter();
  const { signIn } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-16">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Text content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                <Sparkles className="h-3 w-3 mr-1" />
                Novo
              </Badge>
              <Badge variant="outline" className="border-primary/20">
                <Shield className="h-3 w-3 mr-1 text-accent" />
                Poderoso
              </Badge>
            </div>

            {/* Main heading with highlights */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Conheça o{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">Petrus</span>
                  <span className="absolute inset-x-0 bottom-1 h-3 bg-primary/20 -rotate-1 rounded" />
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Transforme seu servidor Discord com uma solução all-in-one.
                Moderação robusta, sistema de música avançado e recursos de
                entretenimento que garantem eficiência, segurança e experiência
                premium para sua comunidade.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                <span>Ultra Rápido</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-primary" />
                <span>+50 Comandos</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Bot className="h-5 w-5 mr-2" />
                Adicionar ao Discord
              </Button>
              <SignedOut>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => signIn()}
                  className="w-full sm:w-auto group"
                >
                  Entrar com Discord
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignedOut>
              <SignedIn>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate.push('/dashboard')}
                  className="w-full sm:w-auto group"
                >
                  Acessar a Dashboard
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignedIn>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-foreground">+10K</p>
                <p className="text-xs text-muted-foreground">Servidores</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-foreground">+500K</p>
                <p className="text-xs text-muted-foreground">Usuários</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center lg:text-left">
                <p className="text-2xl font-bold text-foreground">+1M</p>
                <p className="text-xs text-muted-foreground">Comandos/dia</p>
              </div>
            </div>
          </div>

          {/* Right side - Bot image */}
          <div className="flex-shrink-0 relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 rounded-full blur-2xl scale-110 animate-pulse" />

            {/* Main image container */}
            <div className="relative">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-1 animate-spin-slow"
                style={{ animationDuration: '8s' }}
              >
                <div className="h-full w-full rounded-full bg-background" />
              </div>

              {/* Image */}
              <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl shadow-primary/20">
                <img
                  src="/round-petrus.png"
                  alt="Petrus"
                  className="w-full h-full object-cover"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              </div>

              {/* Floating badges around image */}
              <div
                className="absolute -top-2 -right-2 md:top-4 md:right-0 bg-card border border-primary/20 rounded-xl px-3 py-2 shadow-lg animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-foreground">
                    Online
                  </span>
                </div>
              </div>

              <div
                className="absolute -bottom-2 -left-2 md:bottom-4 md:left-0 bg-card border border-primary/20 rounded-xl px-3 py-2 shadow-lg animate-bounce"
                style={{ animationDuration: '4s', animationDelay: '1s' }}
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    Latência: 12ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
