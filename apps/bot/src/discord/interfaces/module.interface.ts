import { Guild, GuildMember, Message } from 'discord.js';

export type ModuleId = string;

export interface ModuleBase {
  id: ModuleId;

  /** opcional: inicialização do módulo (chamada uma vez no boot) */
  init?: () => Promise<void> | void;

  /** forçar recarregar dados do módulo para uma guild (cache, config, etc) */
  reload?: (guildId: string) => Promise<void>;

  /** ação executada quando o módulo precisa "disparar" para um membro */
  trigger: (guild: Guild, member: GuildMember) => Promise<void>;

  /** ação executada quando o módulo precisa "disparar" para um membro */
  handleMessage: (message: Message) => Promise<void>;

  /** desabilitar o módulo numa guild (limpeza, remover roles, etc) */
  disable: (guild: Guild) => Promise<void>;

  /** setup inicial do módulo numa guild (aplicar roles, criar recursos, etc) */
  setup: (guild: Guild, bot: GuildMember, member: GuildMember) => Promise<void>;

  /** validar config carregada do DB para esta guild */
  validateConfig?: (guildConfig: any) => {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
}
