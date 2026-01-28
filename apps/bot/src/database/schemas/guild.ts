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
    blacklist: {
      users: {
        type: Array,
        default: [],
      },
    },
    canais: {
      bemvindo: t.string,
      regras: t.string,
      verificado: t.string,
    },
    moderation: {
      autoMod: {
        enabled: { type: Boolean, default: false },
        maxMessages: { type: Number, default: 10 },
        punishment: {
          type: String,
          enum: ['timeout', 'tempban'],
          default: 'timeout',
        },
        intervalSeconds: { type: Number, default: 10 },
      },
      filters: {
        antiswear: {
          enabled: { type: Boolean, default: false },
          words: { type: [String], default: [] },
        },

        blockInvites: { type: Boolean, default: true },
        blockLinks: { type: Boolean, default: false },

        maxMentions: {
          type: Number,
          default: 5,
        },

        shortAccountDays: {
          type: Number,
          default: 3,
        },

        punishments: {
          deleteMessage: { type: Boolean, default: true },
          warn: { type: Boolean, default: true },
          kick: { type: Boolean, default: false },

          muteRoleId: {
            type: String,
            default: '',
          },

          muteDurationSec: {
            type: Number,
            default: 3600, // 1h
          },

          tempBanDays: {
            type: Number,
            default: 0, // 0 = desativado
          },
        },
      },
    },
    verification: {
      guildId: { type: String, required: false, default: '' },
      messageId: { type: String, required: false, default: '' },
      channelId: { type: String, required: false, default: '' },
    },
    mod_warnings: {
      type: [
        {
          reason: { type: String, required: true },
          messageId: { type: String, required: true },
          moderatorId: { type: String, default: 'AUTOMOD' },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    modules: {
      verification: { type: Boolean, default: false },
      moderation: { type: Boolean, default: false },
    },
    cargos: {
      mutado: t.string,
      membro: t.string,
      admin: t.string,
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
