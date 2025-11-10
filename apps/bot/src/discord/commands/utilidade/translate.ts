import { createCommand } from '#base';
import { settings } from '#settings';
import { createEmbed } from '@magicyan/discord';
import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  Locale,
} from 'discord.js';

import { z } from 'zod';
import translate from '@iamtraction/google-translate';

// Idiomas mais comuns
const LANGUAGE_CODES = [
  'pt',
  'en',
  'es',
  'fr',
  'de',
  'it',
  'ja',
  'zh-CN',
  'ko',
  'ru',
  'ar',
  'hi',
] as const;

const LANGUAGES = [
  { name: 'Português', value: 'pt' },
  { name: 'Inglês', value: 'en' },
  { name: 'Espanhol', value: 'es' },
  { name: 'Francês', value: 'fr' },
  { name: 'Alemão', value: 'de' },
  { name: 'Italiano', value: 'it' },
  { name: 'Japonês', value: 'ja' },
  { name: 'Chinês', value: 'zh-CN' },
  { name: 'Coreano', value: 'ko' },
  { name: 'Russo', value: 'ru' },
  { name: 'Árabe', value: 'ar' },
  { name: 'Hindi', value: 'hi' },
];
const TranslateInputSchema = z.object({
  text: z
    .string()
    .min(1, 'Text cannot be empty')
    .max(1000, 'Text cannot exceed 1000 characters')
    .trim()
    .refine((val) => val.length > 0, 'Text cannot contain only whitespace'),
  to: z.enum(LANGUAGE_CODES),
  from: z
    .enum([...LANGUAGE_CODES, 'auto'])
    .optional()
    .default('auto'),
});

type LocaleTranslations = {
  [key in Locale]?: string;
};

type TranslationKeys = {
  [key: string]: LocaleTranslations;
};

const translations: TranslationKeys = {
  emptyText: {
    [Locale.EnglishUS]: 'The text cannot be empty!',
    [Locale.PortugueseBR]: 'O texto não pode estar vazio!',
    [Locale.SpanishES]: '¡El texto no puede estar vacío!',
    [Locale.French]: 'Le texte ne peut pas être vide!',
    [Locale.German]: 'Der Text darf nicht leer sein!',
    [Locale.Italian]: 'Il testo non può essere vuoto!',
    [Locale.Japanese]: 'テキストは空にできません！',
    [Locale.Korean]: '텍스트는 비워둘 수 없습니다!',
    [Locale.ChineseCN]: '文本不能为空！',
    [Locale.Russian]: 'Текст не может быть пустым!',
  },
  title: {
    [Locale.EnglishUS]: `${settings.emojis.static.translate} Translation`,
    [Locale.PortugueseBR]: `${settings.emojis.static.translate} Tradução`,
    [Locale.SpanishES]: `${settings.emojis.static.translate} Traducción`,
    [Locale.French]: `${settings.emojis.static.translate} Traduction`,
    [Locale.German]: `${settings.emojis.static.translate} Übersetzung`,
    [Locale.Italian]: `${settings.emojis.static.translate} Traduzione`,
    [Locale.Japanese]: `${settings.emojis.static.translate} 翻訳`,
    [Locale.Korean]: `${settings.emojis.static.translate} 번역`,
    [Locale.ChineseCN]: `${settings.emojis.static.translate} 翻译`,
    [Locale.Russian]: `${settings.emojis.static.translate} Перевод`,
  },
  originalText: {
    [Locale.EnglishUS]: '📝 Original Text',
    [Locale.PortugueseBR]: '📝 Texto Original',
    [Locale.SpanishES]: '📝 Texto Original',
    [Locale.French]: '📝 Texte Original',
    [Locale.German]: '📝 Originaltext',
    [Locale.Italian]: '📝 Testo Originale',
    [Locale.Japanese]: '📝 元のテキスト',
    [Locale.Korean]: '📝 원본 텍스트',
    [Locale.ChineseCN]: '📝 原文',
    [Locale.Russian]: '📝 Исходный текст',
  },
  detectedLanguage: {
    [Locale.EnglishUS]: '🔤 Detected Language',
    [Locale.PortugueseBR]: '🔤 Idioma Detectado',
    [Locale.SpanishES]: '🔤 Idioma Detectado',
    [Locale.French]: '🔤 Langue Détectée',
    [Locale.German]: '🔤 Erkannte Sprache',
    [Locale.Italian]: '🔤 Lingua Rilevata',
    [Locale.Japanese]: '🔤 検出された言語',
    [Locale.Korean]: '🔤 감지된 언어',
    [Locale.ChineseCN]: '🔤 检测到的语言',
    [Locale.Russian]: '🔤 Обнаруженный язык',
  },
  targetLanguage: {
    [Locale.EnglishUS]: '🎯 Target Language',
    [Locale.PortugueseBR]: '🎯 Idioma de Destino',
    [Locale.SpanishES]: '🎯 Idioma de Destino',
    [Locale.French]: '🎯 Langue Cible',
    [Locale.German]: '🎯 Zielsprache',
    [Locale.Italian]: '🎯 Lingua di Destinazione',
    [Locale.Japanese]: '🎯 ターゲット言語',
    [Locale.Korean]: '🎯 대상 언어',
    [Locale.ChineseCN]: '🎯 目标语言',
    [Locale.Russian]: '🎯 Целевой язык',
  },
  footer: {
    [Locale.EnglishUS]: 'Translation provided by Google Translate',
    [Locale.PortugueseBR]: 'Tradução fornecida pelo Google Translate',
    [Locale.SpanishES]: 'Traducción proporcionada por Google Translate',
    [Locale.French]: 'Traduction fournie par Google Translate',
    [Locale.German]: 'Übersetzung von Google Translate',
    [Locale.Italian]: 'Traduzione fornita da Google Translate',
    [Locale.Japanese]: 'Google翻訳による翻訳',
    [Locale.Korean]: 'Google 번역 제공',
    [Locale.ChineseCN]: '由Google翻译提供',
    [Locale.Russian]: 'Перевод от Google Translate',
  },
  errorTitle: {
    [Locale.EnglishUS]: '❌ Translation Error',
    [Locale.PortugueseBR]: '❌ Erro na Tradução',
    [Locale.SpanishES]: '❌ Error de Traducción',
    [Locale.French]: '❌ Erreur de Traduction',
    [Locale.German]: '❌ Übersetzungsfehler',
    [Locale.Italian]: '❌ Errore di Traduzione',
    [Locale.Japanese]: '❌ 翻訳エラー',
    [Locale.Korean]: '❌ 번역 오류',
    [Locale.ChineseCN]: '❌ 翻译错误',
    [Locale.Russian]: '❌ Ошибка перевода',
  },
  errorDescription: {
    [Locale.EnglishUS]:
      'An error occurred while trying to translate the text. Please try again later.',
    [Locale.PortugueseBR]:
      'Ocorreu um erro ao tentar traduzir o texto. Tente novamente mais tarde.',
    [Locale.SpanishES]:
      'Ocurrió un error al intentar traducir el texto. Inténtalo de nuevo más tarde.',
    [Locale.French]:
      "Une erreur s'est produite lors de la traduction du texte. Veuillez réessayer plus tard.",
    [Locale.German]:
      'Beim Übersetzen des Textes ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
    [Locale.Italian]:
      'Si è verificato un errore durante la traduzione del testo. Riprova più tardi.',
    [Locale.Japanese]:
      'テキストの翻訳中にエラーが発生しました。後でもう一度お試しください。',
    [Locale.Korean]:
      '텍스트를 번역하는 중 오류가 발생했습니다. 나중에 다시 시도하세요.',
    [Locale.ChineseCN]: '翻译文本时发生错误。请稍后再试。',
    [Locale.Russian]:
      'Произошла ошибка при попытке перевести текст. Пожалуйста, попробуйте позже.',
  },
};

// Função helper para obter tradução com type safety
const t = (key: string, locale: Locale): string => {
  const translation = translations[key];
  if (!translation) return key;
  return translation[locale] || translation[Locale.EnglishUS] || key;
};

export default createCommand({
  name: 'translate',
  nameLocalizations: {
    [Locale.PortugueseBR]: 'traduzir',
    [Locale.SpanishES]: 'traducir',
    [Locale.French]: 'traduire',
    [Locale.German]: 'übersetzen',
    [Locale.Italian]: 'tradurre',
    [Locale.Japanese]: '翻訳',
    [Locale.Korean]: '번역',
    [Locale.ChineseCN]: '翻译',
    [Locale.Russian]: 'перевести',
  },
  description: 'Translate text from one language to another',
  descriptionLocalizations: {
    [Locale.PortugueseBR]: 'Traduz texto de um idioma para outro',
    [Locale.SpanishES]: 'Traduce texto de un idioma a otro',
    [Locale.French]: "Traduit le texte d'une langue à une autre",
    [Locale.German]: 'Übersetzt Text von einer Sprache in eine andere',
    [Locale.Italian]: "Traduce il testo da una lingua all'altra",
    [Locale.Japanese]: 'テキストをある言語から別の言語に翻訳します',
    [Locale.Korean]: '텍스트를 한 언어에서 다른 언어로 번역합니다',
    [Locale.ChineseCN]: '将文本从一种语言翻译成另一种语言',
    [Locale.Russian]: 'Переводит текст с одного языка на другой',
  },
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'text',
      nameLocalizations: {
        [Locale.PortugueseBR]: 'texto',
        [Locale.SpanishES]: 'texto',
        [Locale.French]: 'texte',
        [Locale.German]: 'text',
        [Locale.Italian]: 'testo',
        [Locale.Japanese]: 'テキスト',
        [Locale.Korean]: '텍스트',
        [Locale.ChineseCN]: '文本',
        [Locale.Russian]: 'текст',
      },
      description: 'Text to be translated',
      descriptionLocalizations: {
        [Locale.PortugueseBR]: 'Texto a ser traduzido',
        [Locale.SpanishES]: 'Texto a traducir',
        [Locale.French]: 'Texte à traduire',
        [Locale.German]: 'Zu übersetzender Text',
        [Locale.Italian]: 'Testo da tradurre',
        [Locale.Japanese]: '翻訳するテキスト',
        [Locale.Korean]: '번역할 텍스트',
        [Locale.ChineseCN]: '要翻译的文本',
        [Locale.Russian]: 'Текст для перевода',
      },
      type: ApplicationCommandOptionType.String,
      required: true,
      maxLength: 1000,
    },
    {
      name: 'to',
      nameLocalizations: {
        [Locale.PortugueseBR]: 'para',
        [Locale.SpanishES]: 'a',
        [Locale.French]: 'vers',
        [Locale.German]: 'nach',
        [Locale.Italian]: 'a',
        [Locale.Japanese]: 'へ',
        [Locale.Korean]: '로',
        [Locale.ChineseCN]: '到',
        [Locale.Russian]: 'на',
      },
      description: 'Target language',
      descriptionLocalizations: {
        [Locale.PortugueseBR]: 'Idioma de destino',
        [Locale.SpanishES]: 'Idioma de destino',
        [Locale.French]: 'Langue cible',
        [Locale.German]: 'Zielsprache',
        [Locale.Italian]: 'Lingua di destinazione',
        [Locale.Japanese]: 'ターゲット言語',
        [Locale.Korean]: '대상 언어',
        [Locale.ChineseCN]: '目标语言',
        [Locale.Russian]: 'Целевой язык',
      },
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: LANGUAGES,
    },
    {
      name: 'from',
      nameLocalizations: {
        [Locale.PortugueseBR]: 'de',
        [Locale.SpanishES]: 'de',
        [Locale.French]: 'de',
        [Locale.German]: 'von',
        [Locale.Italian]: 'da',
        [Locale.Japanese]: 'から',
        [Locale.Korean]: '부터',
        [Locale.ChineseCN]: '从',
        [Locale.Russian]: 'с',
      },
      description: 'Source language (leave empty for auto-detect)',
      descriptionLocalizations: {
        [Locale.PortugueseBR]:
          'Idioma de origem (deixe vazio para detectar automaticamente)',
        [Locale.SpanishES]:
          'Idioma de origen (dejar vacío para detección automática)',
        [Locale.French]:
          'Langue source (laisser vide pour la détection automatique)',
        [Locale.German]:
          'Ausgangssprache (leer lassen für automatische Erkennung)',
        [Locale.Italian]:
          'Lingua di origine (lasciare vuoto per il rilevamento automatico)',
        [Locale.Japanese]: 'ソース言語（自動検出の場合は空白のままにします）',
        [Locale.Korean]: '원본 언어 (자동 감지를 위해 비워 두세요)',
        [Locale.ChineseCN]: '源语言（留空以自动检测）',
        [Locale.Russian]: 'Исходный язык (оставьте пустым для автоопределения)',
      },
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: LANGUAGES,
    },
  ],

  async run(interaction): Promise<any> {
    await interaction.deferReply({ ephemeral: false });
    const locale = interaction.locale;

    try {
      // Coletando dados brutos
      const rawInput = {
        text: interaction.options.getString('text', true),
        to: interaction.options.getString('to', true),
        from: interaction.options.getString('from') || undefined,
      };

      // Validação com Zod
      const parseResult = TranslateInputSchema.safeParse(rawInput);

      // Verificar se a validação falhou
      if (!parseResult.success) {
        const firstError = parseResult.error.issues[0];
        let errorMessage = t('invalidInput', locale);

        // Mapear erros específicos para mensagens traduzidas
        if (firstError.path[0] === 'text') {
          if (
            firstError.message.includes('empty') ||
            firstError.message.includes('whitespace')
          ) {
            errorMessage = t('emptyText', locale);
          } else if (firstError.message.includes('1000')) {
            errorMessage = t('textTooLong', locale);
          }
        }

        return interaction.editReply({
          content: `${
            settings.emojis.static.failed || '❌'
          } ${errorMessage}\n\`${firstError.message}\``,
        });
      }

      // Dados validados
      const validatedInput = parseResult.data;
      const { text, to: targetLang, from: sourceLang } = validatedInput;

      // Tradução com tratamento de erro adicional
      const result = await translate(text, {
        from: sourceLang === 'auto' ? 'auto' : sourceLang,
        to: targetLang,
      }).catch((err) => {
        console.error('Translation API error:', err);
        throw new Error('Translation service unavailable');
      });

      // Nome dos idiomas
      const detectedLangName =
        sourceLang === 'auto'
          ? LANGUAGES.find((l) => l.value === result.from.language.iso)?.name ||
            result.from.language.iso
          : LANGUAGES.find((l) => l.value === sourceLang)?.name || sourceLang;

      const targetLangName =
        LANGUAGES.find((l) => l.value === targetLang)?.name || targetLang;
      const embed = createEmbed({
        title: `${t('title', locale)}`,
        description:
          result.text.length > 4000
            ? result.text.substring(0, 4000) + '...'
            : result.text,
        color: settings.colors.yellow,
        fields: [
          {
            name: t('originalText', locale),
            value: text.length > 1024 ? text.substring(0, 1021) + '...' : text,
            inline: false,
          },
          {
            name: t('detectedLanguage', locale),
            value: detectedLangName,
            inline: true,
          },
          {
            name: t('targetLanguage', locale),
            value: targetLangName,
            inline: true,
          },
        ],
        footer: {
          text: t('footer', locale),
        },
      });
      return await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Erro na tradução:', error);

      const errorEmbed = createEmbed({
        title: t('errorTitle', locale),
        description: t('errorDescription', locale),
        color: settings.colors.danger,
      });

      return await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
});
