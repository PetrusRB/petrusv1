'use client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../card';
import { MessageSquare, Users } from 'lucide-react';
import Image from 'next/image';

export const CardSuporte = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-20 text-center"
    >
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
          >
            <Image
              alt="thinking"
              src={'/thinksmart.png'}
              width={90}
              height={90}
            />
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Precisa de ajuda?
          </h3>
          <p className="text-muted-foreground text-lg mb-6 max-w-lg mx-auto">
            Entre no nosso servidor do Discord para suporte, sugestões ou apenas
            para conversar!
          </p>
          <motion.a
            href={process.env.NEXT_PUBLIC_SUPPORT_LINK || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl shadow-primary/20"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-5 h-5" />
            Entrar no Discord
          </motion.a>
        </CardContent>
      </Card>
    </motion.div>
  );
};
