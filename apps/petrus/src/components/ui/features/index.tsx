import { motion } from 'framer-motion';
import { Shield, Music, Smile, Zap, Users, Settings, Search, Bitcoin, Bot } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Moderação Avançada',
    description: 'Proteja seu servidor com sistema anti-spam, logs detalhados e comandos de moderação.',
  },
  {
    icon: Search,
    title: 'Pesquisa',
    description: 'Encontre informações ou jogadores com rapidez e precisão.',
  },
  {
    icon: Music,
    title: 'Sistema de Música',
    description: 'Reproduza suas músicas favoritas com qualidade superior e controles intuitivos.',
  },
  {
    icon: Bot,
    title: 'Inteligencia Artificial',
    description: 'LLM de última geração para conversas naturais, assistência contextual e personas personalizáveis — ideal para suporte, criação de conteúdo e experiências interativas.'
  },
  {
    icon: Bitcoin,
    title: 'Criptomoedas',
    description: 'Exibe informações atualizadas sobre as principais criptomoedas em tempo real.'
  },
  {
    icon: Smile,
    title: 'Comandos de Diversão',
    description: 'Anime seu servidor com memes, jogos e interações divertidas para todos.',
  },
  {
    icon: Zap,
    title: 'Resposta Rápida',
    description: 'Comandos executados instantaneamente com 99.9% de uptime garantido.',
  },
  {
    icon: Users,
    title: 'Sistema de Níveis',
    description: 'Sistema de XP e níveis personalizado para engajar sua comunidade.',
  },
  {
    icon: Settings,
    title: 'Configuração Fácil',
    description: 'Configure tudo através do dashboard intuitivo sem tocar em código.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const Features = () => {
  return (
    <div className="w-full py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="bg-card rounded-2xl p-6 border border-primary/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

