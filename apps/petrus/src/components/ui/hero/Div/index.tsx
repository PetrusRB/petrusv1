'use client';
import { ReactNode } from 'react';
import { motion } from 'motion/react';

export const HeroDiv = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        opacity: { duration: 0.6 },
        scale: { duration: 0.6 },
      }}
      className="w-full max-w-7xl mx-auto"
      aria-label="Home screen content"
    >
      {children}
    </motion.div>
  );
};
