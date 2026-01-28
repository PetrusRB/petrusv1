import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiscordServer } from '..';
import { DiscordServer as ServerUITypes } from '../types/server.ui.types';

interface DiscordServerListProps {
  servers: ServerUITypes[];
  className?: string;
  onServerClick?: (server: ServerUITypes) => void;
}

function DiscordServerList({
  servers,
  className,
  onServerClick,
}: DiscordServerListProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {servers.map((server) => (
        <DiscordServer.Card
          key={server.id}
          server={server}
          onClick={() => onServerClick?.(server)}
        />
      ))}
    </div>
  );
}

export { DiscordServerList };
