'use client';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';

export const DashCard = () => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/30 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0" />
      <CardContent className="py-12 relative z-10">
        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block mb-6"
        ></motion.div>
        <h3 className="text-2xl md:text-3xl font-bold mb-3">
          Nome do servidor
        </h3>
        <motion.a
          href={process.env.NEXT_PUBLIC_SUPPORT_LINK || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-shadow-2 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl shadow-primary/20"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Selecionar
        </motion.a>
      </CardContent>
    </Card>
  );
};
