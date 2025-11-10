'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function NotFoundAnimation() {
  return (
    <>
      {/* Floating bot image */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
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
        className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-4 text-center dark:text-text-dark text-text-light"
      >
        <span className="text-primary">404</span> Page Not Found
      </motion.h1>

      {/* Bot description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-base sm:text-lg md:text-xl text-center leading-relaxed px-4 mb-8 max-w-2xl text-muted-foreground"
      >
        Oops, parece que você se perdeu
      </motion.p>
    </>
  );
}
