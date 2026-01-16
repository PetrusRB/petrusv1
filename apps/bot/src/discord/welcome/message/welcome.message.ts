import { db } from '#database';
import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { logger } from '#settings';
import { settings } from '#settings';
import { generateWelcome } from 'discord/utils/welcome.ts';
type Perm = 'ViewChannel' | 'SendMessages' | 'EmbedLinks';

async function checkChannelPerms(channel: TextChannel, permsToCheck: Perm[]) {
  // tenta pegar o member do bot de forma segura
  const me =
    channel.guild?.members.me ??
    channel.guild?.members.cache.get(channel.client.user?.id ?? '');
  if (!me) return { ok: false, missing: permsToCheck }; // sem como checar

  const perms = channel.permissionsFor(me);
  if (!perms) return { ok: false, missing: permsToCheck };

  const missing = permsToCheck.filter((p) => !perms.has(p));
  return { ok: missing.length === 0, missing };
}
export const SendWelcomeMessage = async (member: GuildMember) => {
  try {
    const guildId = member.guild.id;

    // buscar configuração do servidor
    const guildConfig = await db.guilds.findOne({ id: guildId });
    if (guildConfig?.welcome?.message !== true) {
      logger.warn`Não esta ativádo a enviar mensagem de boas vindas pro membro`;
      return;
    }
    if (!guildConfig?.canais?.bemvindo) {
      logger.warn`Canal de boas-vindas não configurado para o servidor ${member.guild.name}`;
      return;
    }
    const regrasID = guildConfig.canais.regras;
    const regrasChannel = member.guild.channels.cache.get(
      regrasID
    ) as TextChannel;

    const channelId = guildConfig.canais.bemvindo;
    const channel = member.guild.channels.cache.get(channelId) as TextChannel;
    if (!channel || !channel.isTextBased()) {
      logger.error`Canal ${channelId} não encontrado ou não é de texto no servidor ${member.guild.name}`;
      return;
    }

    // checar permissões importantes
    const { ok, missing } = await checkChannelPerms(channel, [
      'ViewChannel',
      'SendMessages',
      'EmbedLinks',
    ]);

    // se faltou View ou Send -> logar.
    if (!ok && missing.includes('SendMessages')) {
      logger.error`Faltam permissões no canal ${channel.name}: ${missing.join(
        ', '
      )}`;
      return;
    }

    // se falta só EmbedLinks, avisa com texto simples e envia só content (sem embed)
    if (!ok && missing.includes('EmbedLinks')) {
      logger.warn`Bot sem permissão de incorporar links (EmbedLinks) no canal ${channel.name}`;
      await channel.send({
        content: `⚠️ Não consigo enviar *embeds* aqui. Ative **Incorporar Links / Embed Links** para eu mandar a mensagem de boas-vindas rica.`,
      });
      // enviar a versão simples (content) e retornar
      await channel.send({ content: `${member} Seja bem-vindo(a)!` });
      return;
    }

    if (!regrasID || !regrasChannel.isTextBased()) {
      logger.error`Canal de regras ${regrasID} não encontrado ou não é de texto no servidor ${member.guild.name}`;
      return;
    }

    const buffer = await generateWelcome(
      `${member.user.tag}`,
      guildConfig?.welcome.welcomeMessage ?? settings.default_welcome_message,
      {
        backgroundImage:
          guildConfig.welcome.backgroundImage ??
          settings.default_welcome_background,
        avatar: member.user.avatarURL() ?? settings.default_welcome_avatar,
        borderGradient: ['#000000', '#ffda35'],
      }
    );

    await channel.send({
      files: [buffer],
    });

    logger.success`Mensagem de boas-vindas enviada para ${member.user.tag}`;
    return true;
  } catch (error) {
    logger.error`Erro ao enviar mensagem de boas-vindas: ${error}`;
    return false;
  }
};
