'use client';
import { DiscordServer } from '@/components/ui/Server';
import { DiscordServer as ServerUITypes } from '../types/server.ui.types';

import { Hero } from '@/components/ui/hero';
import { memo, motion } from 'motion/react';
const mockServers: ServerUITypes[] = [
  {
    id: '1',
    name: 'Gaming Community',
    icon: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=100&h=100&fit=crop',
    memberCount: 12543,
  },
  {
    id: '2',
    name: 'Dev Brasil',
    icon: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop',
    memberCount: 8921,
  },
  {
    id: '3',
    name: 'Music Lovers',
    icon: null,
    memberCount: 3456,
  },
  {
    id: '4',
    name: 'Anime & Manga',
    icon: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&h=100&fit=crop',
    memberCount: 25000,
  },
  {
    id: '5',
    name: 'Tech Talk',
    icon: null,
    memberCount: 1892,
  },
  {
    id: '6',
    name: 'Arte Digital',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    memberCount: 4521,
  },
];

const DashboardPage = memo(() => {
  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <Hero.Div>
        <Hero.Container>
          {/* Bot title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-1xl sm:text-6xl md:text-5xl font-extrabold mb-4 text-center"
          >
            <span className="text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Servidores para configurar
            </span>{' '}
          </motion.h1>
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />
          {/* Servers Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12"
          >
            <DiscordServer.List servers={mockServers} />
          </motion.div>
        </Hero.Container>
      </Hero.Div>
    </div>
  );
});

export default DashboardPage;
