'use client';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../card';
import { Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../button/Button';

export const CardSuporte = () => {
  const navigate = useRouter();
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
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-5 text-center"
          >
            <Button
              onClick={() =>
                navigate.push(`${process.env.NEXT_PUBLIC_SUPPORT_LINK ?? '#'}`)
              }
              size="lg"
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Users className="h-5 w-5 mr-2" />
              Entrar no Discord
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
