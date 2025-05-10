import { useCallback, useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';

// Feature data interface
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Feature data
const features: Feature[] = [
  {
    id: '1',
    title: 'Moderação Avançada',
    description:
      'Controle seu servidor com ferramentas poderosas: banimentos, silenciamentos e avisos personalizáveis.',
    icon: '🛡️',
  },
  {
    id: '2',
    title: 'Música Premium',
    description:
      'Toque playlists do Spotify, YouTube e mais, com áudio cristalino e controles intuitivos.',
    icon: '🎧',
  },
  {
    id: '3',
    title: 'Diversão Garantida',
    description:
      'Envolva sua comunidade com jogos, memes e comandos interativos que todos adoram.',
    icon: '😂',
  },
  {
    id: '4',
    title: 'Automação Inteligente',
    description:
      'Automatize boas-vindas, regras e tarefas repetitivas para um servidor sempre organizado.',
    icon: '🤖',
  },
];

// Custom hook to detect mobile screens
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// Feature card component
interface FeatureCardProps {
  item: Feature;
  isLast: boolean;
  isMobile: boolean;
}

const FeatureCard = memo(({ item, isLast, isMobile }: FeatureCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: isMobile ? 0 : 0.1 * parseInt(item.id, 10) }}
    className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ${
      isMobile ? 'w-full mb-6' : 'w-[280px] mx-2 mb-6'
    }`}
    onClick={() => {
      console.log(`Feature clicked: ${item.title}`);
    }}
    aria-label={`Feature: ${item.title}`}
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.9, repeat: Infinity }}
      className="text-5xl mb-4"
    >
      {item.icon}
    </motion.div>
    <h3 className="text-xl font-bold mb-3 text-center">{item.title}</h3>
    <p className="text-sm text-center leading-6">{item.description}</p>
    {!isLast && (
      <div
        className={isMobile ? 'w-3/4 h-[1px]' : 'w-[1px] h-2/3 mx-4 self-center'}
      />
    )}
  </motion.button>
));

// Features section component
const Features = () => {
  const isMobile = useIsMobile();
  const renderFeature = useCallback(
    (item: Feature, index: number) => (
      <FeatureCard
        key={item.id}
        item={item}
        isLast={index === features.length - 1}
        isMobile={isMobile}
      />
    ),
    [isMobile]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`w-full max-w-7xl px-4 py-8 flex ${
        isMobile ? 'flex-col' : 'flex-row flex-wrap'
      } justify-center items-center mx-auto gap-4`}
    >
      {features.map((item, index) => renderFeature(item, index))}
    </motion.div>
  );
};

export default memo(Features);