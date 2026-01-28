'use client';
import { motion } from 'motion/react';
import {
  Shield,
  Music,
  Smile,
  Zap,
  Users,
  Settings,
  Search,
  Bitcoin,
  Bot,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Moderação Inteligente',
    description:
      'Mantenha seu servidor seguro com detecção automática de spam, sistema de alertas em tempo real e ferramentas de moderação que realmente funcionam.',
  },
  {
    icon: Search,
    title: 'Busca Instantânea',
    description:
      'Encontre qualquer informação, membro ou conteúdo em segundos. Precisão e velocidade quando você mais precisa.',
  },
  {
    icon: Music,
    title: 'Experiência Musical Premium',
    description:
      'Transforme seu servidor em uma festa! Qualidade de áudio cristalina, controles inteligentes e suporte às suas plataformas favoritas.',
  },
  {
    icon: Bot,
    title: 'IA Conversacional Avançada',
    description:
      'Converse naturalmente com tecnologia de ponta. Assistente inteligente que entende contexto, adapta personalidades e oferece respostas genuinamente úteis.',
  },
  {
    icon: Bitcoin,
    title: 'Cripto em Tempo Real',
    description:
      'Acompanhe o mercado sem sair do Discord. Cotações atualizadas, análises rápidas e alertas das principais criptomoedas do momento.',
  },
  {
    icon: Smile,
    title: 'Diversão Garantida',
    description:
      'Deixe seu servidor mais vivo! Memes frescos, mini-games viciantes e interações que fazem todo mundo querer participar.',
  },
  {
    icon: Zap,
    title: 'Performance Incomparável',
    description:
      'Zero espera, máxima eficiência. Comandos executados instantaneamente com 99.9% de disponibilidade — porque seu tempo é valioso.',
  },
  {
    icon: Users,
    title: 'Gamificação Envolvente',
    description:
      'Recompense a participação da sua comunidade. Sistema de níveis, conquistas e rankings que mantêm todos engajados e voltando sempre.',
  },
  {
    icon: Settings,
    title: 'Configuração sem Complicação',
    description:
      'Personalize tudo em minutos através do painel visual intuitivo. Sem código, sem dor de cabeça, apenas resultados.',
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

export const FeaturesComponent = () => {
  return (
    <div className="w-full py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
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
              className="bg-card rounded-2xl p-6 border border-primary/50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow)] transition-all duration-200"
            >
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
