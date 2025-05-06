'use client'
import { motion } from 'framer-motion';
import { HomeHero } from '@/components/ui/homehero';

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
        <HomeHero />
      </motion.div>
    </div>
  );
};