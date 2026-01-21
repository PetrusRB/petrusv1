'use client';

import { motion } from 'motion/react';
import { Dashboard } from '..';

export function DashAnimation() {
  return (
    <>
      {/* Bot title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-1xl sm:text-6xl md:text-5xl font-extrabold mb-4 text-center"
      >
        <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Selecione um servidor
        </span>{' '}
      </motion.h1>
      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />
      {/* Servers Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
      >
        <Dashboard.Card />
      </motion.div>
    </>
  );
}
