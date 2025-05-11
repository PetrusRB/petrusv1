'use client'
import { motion } from 'framer-motion';
import { Hero } from '@/components/ui/homehero';
import Image from 'next/image';
import { Button, ButtonAction } from '@/components/ui/button/Button';
import { ArrowRight, Plus } from 'lucide-react';
import Features from '@/components/ui/features';
import ThemeToggle from '@/components/ui/themeToggle';

export default function HomePage() {
  return (
    <div className="flex min-h-screen justify socialist-center items-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { duration: 0.9 },
          scale: { duration: 0.9 },
        }}
        className="w-full max-w-7xl py-8 sm:py-12 mx-auto"
        aria-label="Home screen content"
      >
        <Hero>
          {/* Floating bot image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              y: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              },
            }}
            className="mb-6"
          >
            <div
              className="rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
              style={{
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="relative w-[120px] h-[120px] rounded-full border-2 border-[#FFC817] overflow-hidden">
                <Image
                  src="/round-petrus.png"
                  alt="Bot image"
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="/round-petrus-50.png"
                />
              </div>
            </div>
          </motion.div>

          {/* Bot title */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center transition-colors duration-300 hover:text-[#FFC817]">
            Petrus
          </h1>

          {/* Bot description */}
          <p className="text-lg text-center leading-7 px-4 mb-6 max-w-3xl">
            Seu bot completo para moderação 🛡️, música 🎧 e diversão 😂 no Discord! Organize, anime e proteja seu servidor com comandos rápidos e fáceis. 🚀
          </p>

          {/* Buttons Container */}
          <div className="flex flex-row justify-center items-center gap-4 my-6">
            <Button
              label="Adicionar"
              icon={<Plus className="text-white" size={20} />}
              currentPath="/"
              action={ButtonAction.NAVIGATE}
              href={process.env.NEXT_PUBLIC_INVITE_LINK}
            />
            <Button
              label="Dashboard"
              icon={<ArrowRight className="text-white" size={20} />}
              currentPath="/"
              action={ButtonAction.NAVIGATE}
            />
          </div>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Divider */}
          <div className={"w-11/12 max-w-4xl h-px bg-[#E5E7EB] my-8"} />

          {/* Features section placeholder */}
          <div className="w-full max-w-7xl">
            <Features />
          </div>
        </Hero>
      </motion.div>
    </div>
  );
};