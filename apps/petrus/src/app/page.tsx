'use client'
import { motion } from 'framer-motion';
import { Hero } from '@/components/ui/homehero';
import Image from 'next/image';
import { Button } from '@/components/ui/button/Button';
import { ArrowRight, Plus } from 'lucide-react';
import { Features } from '@/components/ui/features';
import ExamplesFeatures from '@/components/ui/features/proofs';
import { Footer } from '@/components/ui/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
        }}
        className="w-full max-w-7xl py-12 sm:py-16 mx-auto"
        aria-label="Home screen content"
      >
        <Hero>
          {/* Floating bot image */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              y: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-primary overflow-hidden shadow-[var(--shadow-glow)] bg-card"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), var(--shadow-glow)',
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                <Image
                  src="/round-petrus.png"
                  alt="Bot image"
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="/round-petrus-50.png"
                />

              </div>
            </motion.div>
          </motion.div>

          {/* Bot title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 text-center text-primary"
          >
            Petrus
          </motion.h1>

          {/* Bot description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-center leading-relaxed px-4 mb-8 max-w-2xl text-muted-foreground"
          >
            Seu bot completo para moderação 🛡️, música 🎧 e diversão 😂 no Discord! Organize, anime e proteja seu servidor com comandos rápidos e fáceis. 🚀
          </motion.p>

          {/* Buttons Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto group"
              asChild
            >
              <a
                href={process.env.NEXT_PUBLIC_INVITE_LINK || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Adicionar Bot
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto group"
              asChild
            >
              <a
                href="/dashboard"
                className="flex items-center gap-2"
              >
                Dashboard
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />

          {/* Features section placeholder */}
          <div className="w-full max-w-7xl">
            <Features />
          </div>
          {/* Imagens dos comandos de exemplo */}
          <div className='w-full max-w-7xl'>
            <ExamplesFeatures />
          </div>
        </Hero>
        <Footer />
      </motion.div>
    </div>
  );
};
