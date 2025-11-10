import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  message?: string;
}

// Custom spinner animation
const SpinnerDot = ({ delay }: { delay: number }) => (
  <motion.div
    className="w-3 h-3 rounded-full bg-primary"
    initial={{ scale: 0.8, opacity: 0.5 }}
    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

// Loading overlay component
export const LoadingOverlay = ({
  message = 'Carregando...',
}: LoadingOverlayProps) => (
  <motion.div
    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex justify-center items-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="flex gap-2">
          <SpinnerDot delay={0} />
          <SpinnerDot delay={0.2} />
          <SpinnerDot delay={0.4} />
        </div>

        {/* Message */}
        <motion.p
          className="text-lg text-foreground font-medium text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  </motion.div>
);

