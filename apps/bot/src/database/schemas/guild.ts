import { Schema } from 'mongoose';
import { t } from '../utils.js';
import { settings } from '#settings';

export const guildSchema = new Schema(
  {
    id: t.req_string,
    welcome: {
      role: { type: Boolean, default: false },
      message: { type: Boolean, default: false },
      welcomeMessage: {
        type: String,
        default: settings.default_welcome_message,
      },
      backgroundImage: {
        type: String,
        default: settings.default_welcome_background,
      },
    },
    canais: {
      bemvindo: t.string,
      regras: t.string,
      verificado: t.string,
    },
    verification: {
      guildId: { type: String, required: false, default: '' },
      messageId: { type: String, required: false, default: '' },
      channelId: { type: String, required: false, default: '' },
    },
    modules: {
      verification: { type: Boolean, default: false },
    },
    cargos: {
      mutado: t.string,
      membro: t.string,
      verificado: t.string,
      naoverificado: t.string,
    },
  },
  {
    statics: {
      async get(id: string) {
        const guild = await this.findOne({ id });
        return guild ?? (await this.create({ id }));
      },
    },
  }
);
