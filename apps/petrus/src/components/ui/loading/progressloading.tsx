'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@/hooks/useProgress';

export const ProgressBar = () => {
  const { isVisible, progress } = useProgress();

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            className="fixed top-0 left-0 right-0 z-[200] h-1 bg-muted/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
