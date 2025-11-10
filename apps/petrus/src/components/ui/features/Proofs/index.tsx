'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../carousel';

interface Proof {
  title: string;
  description: string;
  category: string;
  image: string[];
  badge: string;
  highlight: string;
}

const proofs: Proof[] = [
  {
    title: 'Sistema de Moderação',
    description:
      'Comandos de banimento, mute e kick totalmente funcionais e integrados ao Discord. Mantenha seu servidor seguro com ferramentas poderosas e fáceis de usar.',
    category: 'moderation',
    image: [
      '/proofs/kick.png',
      '/proofs/ban.png',
      '/proofs/mute.png',
      '/proofs/unmute.png',
      '/proofs/unban.png',
    ],
    badge: 'Segurança',
    highlight: 'Ban, Mute, Unmute, Unban, Kick',
  },
  {
    title: 'Música de Alta Qualidade',
    description:
      'Toque, pause e pule faixas com reações — tudo em tempo real. Suporte para YouTube, Spotify e SoundCloud com qualidade premium.',
    category: 'music',
    image: ['/placeholder.png'],
    badge: 'Entretenimento',
    highlight: 'YouTube, Spotify',
  },
  {
    title: 'Pesquisas Inteligentes',
    description:
      'Use o comando /pesquisar para encontrar usuários, canais e mensagens instantaneamente. Busca avançada com filtros personalizados.',
    category: 'search',
    image: ['/placeholder.png'],
    badge: 'Utilidade',
    highlight: 'Busca em tempo real',
  },
  {
    title: 'Sistema de Economia',
    description:
      'Ganhe moedas, aposte e veja seu ranking subir no servidor. Sistema completo com loja, inventário e missões diárias.',
    category: 'economy',
    image: ['/placeholder.png'],
    badge: 'Gamificação',
    highlight: 'Moedas, Ranking',
  },
];

export const ProofSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const router = useRouter();

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
              ✨ Funcionalidades
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Veja o{' '}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Petrus
            </span>{' '}
            em ação
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Confira exemplos práticos dos comandos mais poderosos do bot
          </p>
        </motion.div>

        {/* Zig-zag layout */}
        <div className="space-y-32 md:space-y-40">
          {proofs.map((proof, index) => {
            const isEven = index % 2 === 0;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className={`flex flex-col ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-8 md:gap-16 items-center`}
              >
                {/* Image side */}
                <div className="w-full md:w-1/2 relative">
                  <motion.div
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    whileHover={{ scale: 1.02 }}
                    transition={{
                      scale: { duration: 0.3, ease: 'easeOut' },
                    }}
                    className="relative z-10"
                  >
                    {/* Image container */}
                    <div className="relative w-full aspect-video min-h-[300px] rounded-2xl overflow-hidden border-2 border-primary/30 bg-card shadow-2xl">
                      <Carousel className="relative w-full h-full">
                        <CarouselContent>
                          {proof.image.map((img, i) => (
                            <CarouselItem
                              key={i}
                              className="relative h-[300px] w-full"
                            >
                              <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                  src={img}
                                  alt={proof.title}
                                  fill
                                  className="object-contain rounded-xl"
                                  sizes="100vw"
                                  quality={90}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>

                        <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 z-20" />
                        <CarouselNext className="right-2 top-1/2 -translate-y-1/2 z-20" />
                      </Carousel>{' '}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent pointer-events-none" />
                      {/* Highlight badge on image */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-4 left-4 px-4 py-2 rounded-lg bg-background/80 backdrop-blur-md border border-primary/30"
                      >
                        <span className="text-primary font-semibold text-sm">
                          {proof.highlight}
                        </span>
                      </motion.div>
                      {/* Hover overlay sutil */}
                      <motion.div
                        className="absolute inset-0 bg-primary/5 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Content side */}
                <div className="w-full md:w-1/2 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    {/* Badge */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 cursor-default"
                    >
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.8, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                      <span className="text-primary text-sm font-semibold uppercase tracking-wide">
                        {proof.badge}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                      {proof.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                      {proof.description}
                    </p>

                    {/* Learn more link */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => router.push(`/commands/${proof.category}`)}
                      className="mt-4 inline-flex items-center gap-2 text-primary font-semibold group cursor-pointer"
                    >
                      Saiba mais
                      <motion.svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        whileHover={{ x: 3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </motion.svg>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-32 text-center"
        >
          <motion.button
            onClick={() => router.push('/commands')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-shadow cursor-pointer"
          >
            Ver todos os comandos
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
