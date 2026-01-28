import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiscordServer as ServerUITypes } from '../types/server.ui.types';

interface DiscordServerCardProps {
  server: ServerUITypes;
  className?: string;
  onClick?: () => void;
}

function DiscordServerCard({
  server,
  className,
  onClick,
}: DiscordServerCardProps) {
  const initials = server.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-card border border-primary/20',
        'p-5 transition-all duration-300 ease-out cursor-pointer',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10',
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-dark to-zinc-900 opacity-80" />

      <div className="relative flex items-center gap-4">
        {/* Server Icon */}
        <div className="relative flex-shrink-0">
          {server.icon ? (
            <img
              src={server.icon}
              alt={server.name}
              className="h-14 w-14 rounded-xl object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              <span className="text-lg font-bold text-primary-foreground">
                {initials}
              </span>
            </div>
          )}

          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-card" />
        </div>

        {/* Server Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate text-base group-hover:text-primary transition-colors duration-300">
            {server.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
            <Users className="h-4 w-4 text-primary/70" />
            <span className="text-sm font-medium">
              {server.memberCount.toLocaleString('pt-BR')} membros
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
export { DiscordServerCard };
