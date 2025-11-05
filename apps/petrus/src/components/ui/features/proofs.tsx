'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const proofs = [
  {
    title: 'Sistema de Moderação',
    description:
      'Comandos de banimento, mute e kick totalmente funcionais e integrados ao Discord.',
    image: '',
  },
  {
    title: 'Música de Alta Qualidade',
    description: 'Toque, pause e pule faixas com reações — tudo em tempo real.',
    image: '',
  },
  {
    title: 'Pesquisas Inteligentes',
    description:
      'Use o comando /pesquisar para encontrar usuários, canais e mensagens instantaneamente.',
    image: '',
  },
  {
    title: 'Sistema de Economia',
    description: 'Ganhe moedas, aposte e veja seu ranking subir no servidor.',
    image: '',
  },
];

export default function ExamplesFeatures() {
  return (
    <section className="relative py-20 dark:text-text-dark text-text-light">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-8"
        >
          Veja o <span className="text-primary">Petrus</span> em ação
        </motion.h2>
        <p className="dark:text-text-dark text-text-light max-w-2xl mx-auto mb-16">
          Confira abaixo exemplos práticos dos comandos em ação.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
          {proofs.map((proof, i) => (
            <motion.div
              key={i}
              initial={'hidden'}
              viewport={{ once: true, margin: '-100px' }}
              whileInView="visible"
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-background/60 border border-primary/50 rounded-2xl shadow-lg overflow-hidden hover:shadow-primary-dark/10 transition-all"
            >
              <div className="relative w-full h-64 md:h-80 overflow-hidden">
                <Image
                  src={proof.image || '/placeholder.png'}
                  alt={proof.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-left">
                <h3 className="text-lg font-semibold mb-1">{proof.title}</h3>
                <p className="dark:text-text-dark text-text-light text-sm">
                  {proof.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
