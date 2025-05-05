import { motion } from 'framer-motion';
import HomeHero from '@/components/ui/homehero';

export default function Index() {
  return (
    <div className="flex min-h-screen justify-center items-center px-4 bg-gradient-to-b from-[#F8FAFC] to-[#E2E8F0]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          opacity: { duration: 0.9 },
          scale: { duration: 0.9 }
        }}
        className="w-full max-w-[800px] py-6"
        aria-label="Home screen content"
      >
        <HomeHero />
      </motion.div>
    </div>
  );
};
