import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import {
  Bot,
  Music,
  Shield,
  Sparkles,
  Settings,
  Gamepad2,
  Crown,
  Zap,
} from 'lucide-react';
import { CardSuporte } from '../suporte/cardsuporte';

interface Command {
  name: string;
  description: string;
  usage: string;
  example?: string;
  premium?: boolean;
  aliases?: string[];
}

interface CommandCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  commands: Command[];
}

const commandCategories: CommandCategory[] = [
  {
    id: 'music',
    name: 'Música',
    icon: <Music className="w-5 h-5" />,
    description: 'Comandos para tocar e gerenciar música',
    commands: [
      {
        name: 'play',
        description:
          'Toca uma música ou playlist do YouTube, Spotify ou SoundCloud',
        usage: '/play <nome ou URL>',
        example: '/play Never Gonna Give You Up',
        aliases: ['p', 'tocar'],
      },
      {
        name: 'skip',
        description: 'Pula para a próxima música na fila',
        usage: '/skip',
        aliases: ['s', 'pular'],
      },
      {
        name: 'pause',
        description: 'Pausa a música atual',
        usage: '/pause',
        aliases: ['pausar'],
      },
      {
        name: 'resume',
        description: 'Retoma a reprodução da música',
        usage: '/resume',
        aliases: ['continuar'],
      },
      {
        name: 'queue',
        description: 'Mostra a fila de músicas atual',
        usage: '/queue',
        aliases: ['q', 'fila'],
      },
      {
        name: 'volume',
        description: 'Ajusta o volume da música (0-100)',
        usage: '/volume <número>',
        example: '/volume 75',
        premium: true,
      },
      {
        name: 'loop',
        description: 'Ativa/desativa o modo de repetição',
        usage: '/loop [música|fila|off]',
        example: '/loop música',
        premium: true,
      },
      {
        name: 'lyrics',
        description: 'Mostra a letra da música atual',
        usage: '/lyrics',
        aliases: ['letra'],
        premium: true,
      },
    ],
  },
  {
    id: 'moderation',
    name: 'Moderação',
    icon: <Shield className="w-5 h-5" />,
    description: 'Ferramentas para manter seu servidor seguro',
    commands: [
      {
        name: 'ban',
        description: 'Bane um membro do servidor',
        usage: '/ban <@usuário> [motivo]',
        example: '/ban @usuario Spam',
      },
      {
        name: 'kick',
        description: 'Expulsa um membro do servidor',
        usage: '/kick <@usuário> [motivo]',
        example: '/kick @usuario Comportamento inadequado',
      },
      {
        name: 'mute',
        description: 'Silencia um membro temporariamente',
        usage: '/mute <@usuário> <tempo> [motivo]',
        example: '/mute @usuario 1h Flood no chat',
      },
      {
        name: 'unmute',
        description: 'Remove o silenciamento de um membro',
        usage: '/unmute <@usuário>',
      },
      {
        name: 'warn',
        description: 'Dá um aviso a um membro',
        usage: '/warn <@usuário> <motivo>',
        example: '/warn @usuario Linguagem inapropriada',
      },
      {
        name: 'clear',
        description: 'Limpa mensagens do canal (até 100)',
        usage: '/clear <quantidade>',
        example: '/clear 50',
        aliases: ['purge', 'limpar'],
      },
      {
        name: 'slowmode',
        description: 'Ativa modo lento no canal',
        usage: '/slowmode <segundos>',
        example: '/slowmode 10',
      },
    ],
  },
  {
    id: 'utility',
    name: 'Utilidades',
    icon: <Settings className="w-5 h-5" />,
    description: 'Comandos úteis para o dia a dia',
    commands: [
      {
        name: 'userinfo',
        description: 'Mostra informações sobre um usuário',
        usage: '/userinfo [@usuário]',
        example: '/userinfo @usuario',
        aliases: ['ui', 'whois'],
      },
      {
        name: 'serverinfo',
        description: 'Mostra informações sobre o servidor',
        usage: '/serverinfo',
        aliases: ['si'],
      },
      {
        name: 'avatar',
        description: 'Mostra o avatar de um usuário',
        usage: '/avatar [@usuário]',
        example: '/avatar @usuario',
        aliases: ['av', 'pfp'],
      },
      {
        name: 'ping',
        description: 'Verifica a latência do bot',
        usage: '/ping',
      },
      {
        name: 'invite',
        description: 'Mostra o link de convite do bot',
        usage: '/invite',
        aliases: ['convite'],
      },
      {
        name: 'help',
        description: 'Mostra a lista de comandos',
        usage: '/help [comando]',
        example: '/help play',
        aliases: ['ajuda', 'h'],
      },
    ],
  },
  {
    id: 'fun',
    name: 'Diversão',
    icon: <Gamepad2 className="w-5 h-5" />,
    description: 'Comandos para se divertir com seus amigos',
    commands: [
      {
        name: '8ball',
        description: 'Faça uma pergunta à bola mágica',
        usage: '/8ball <pergunta>',
        example: '/8ball Vou ganhar na loteria?',
      },
      {
        name: 'meme',
        description: 'Mostra um meme aleatório',
        usage: '/meme',
      },
      {
        name: 'coin',
        description: 'Joga uma moeda (cara ou coroa)',
        usage: '/coin',
        aliases: ['moeda', 'flip'],
      },
      {
        name: 'dice',
        description: 'Rola um dado',
        usage: '/dice [lados]',
        example: '/dice 20',
        aliases: ['dado', 'roll'],
      },
      {
        name: 'ship',
        description: 'Calcula a compatibilidade entre duas pessoas',
        usage: '/ship <@usuário1> <@usuário2>',
        example: '/ship @user1 @user2',
      },
      {
        name: 'say',
        description: 'Faz o bot repetir sua mensagem',
        usage: '/say <mensagem>',
        example: '/say Olá mundo!',
        premium: true,
      },
    ],
  },
  {
    id: 'economy',
    name: 'Economia',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Sistema de economia e recompensas',
    commands: [
      {
        name: 'balance',
        description: 'Verifica seu saldo de moedas',
        usage: '/balance [@usuário]',
        aliases: ['bal', 'saldo'],
        premium: true,
      },
      {
        name: 'daily',
        description: 'Resgata sua recompensa diária',
        usage: '/daily',
        aliases: ['diário'],
        premium: true,
      },
      {
        name: 'work',
        description: 'Trabalhe para ganhar moedas',
        usage: '/work',
        aliases: ['trabalhar'],
        premium: true,
      },
      {
        name: 'shop',
        description: 'Abre a loja de itens',
        usage: '/shop',
        aliases: ['loja'],
        premium: true,
      },
      {
        name: 'buy',
        description: 'Compra um item da loja',
        usage: '/buy <item>',
        example: '/buy vip',
        aliases: ['comprar'],
        premium: true,
      },
      {
        name: 'leaderboard',
        description: 'Mostra o ranking de usuários mais ricos',
        usage: '/leaderboard',
        aliases: ['lb', 'top'],
        premium: true,
      },
    ],
  },
];

const CommandCard = ({ command }: { command: Command }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -4 }}
  >
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/50 hover:shadow-[var(--shadow-card)] hover:border-primary/40 border-primary/20 transition-all duration-500 h-full backdrop-blur-sm">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold group-hover:text-primary transition-colors">
                {command.name}
              </span>
              {command.premium && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 font-semibold"
                >
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </CardTitle>
            {command.aliases && command.aliases.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {command.aliases.map((alias) => (
                  <Badge
                    key={alias}
                    variant="outline"
                    className="text-xs bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {alias}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <CardDescription className="mt-3 text-sm leading-relaxed">
          {command.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 relative z-10">
        <div className="bg-muted/30 rounded-lg p-3 border border-primary/50 backdrop-blur-sm group-hover:bg-muted/50 transition-colors">
          <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">
            Uso:
          </p>
          <code className="text-sm text-foreground font-mono block">
            {command.usage}
          </code>
        </div>
        {command.example && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20 backdrop-blur-sm group-hover:border-primary/30 transition-colors">
            <p className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">
              Exemplo:
            </p>
            <code className="text-sm text-primary font-mono block">
              {command.example}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const Commands = () => {
  return (
    <div className="min-h-screen bg-[var(--gradient-hero)] relative overflow-hidden">
      <div className="container mx-auto px-4 py-24 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-8"
          >
            Todos os <span className="text-primary">Comandos</span>
          </motion.h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore todos os comandos disponíveis organizados por categoria.
            Comandos marcados com{' '}
            <Crown className="w-4 h-4 inline text-primary mx-1" /> são
            exclusivos para membros premium.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="music" className="w-full">
            <TabsList className="w-full h-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-card/80 backdrop-blur-md rounded-2xl border border-primary/20 shadow-lg">
              {commandCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 hover:bg-muted/50 font-semibold"
                >
                  {category.icon}
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {commandCategories.map((category) => (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl border border-primary/30 shadow-lg shadow-primary/10">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">
                        {category.name}
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {category.commands.map((command, idx) => (
                    <motion.div
                      key={command.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                    >
                      <CommandCard command={command} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Footer Info */}
        <CardSuporte />
      </div>
    </div>
  );
};

export default Commands;
