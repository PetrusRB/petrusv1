import { describe } from 'node:test';

export default {
  commands: {
    play: {
      name: 'play',
      description: 'Tocar uma música',
      options: {
        query: {
          name: 'query',
          description: 'Nome da música ou URL. Exemplo: Miss you - Phonk remix',
        },
      },
      errors: {
        validation_failed: 'Não consegui validar a sua requisição',
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        cant_create_player: 'Não consigi criar o tocador de música',
        no_permissions:
          'Não tenho permissão para entrar/falar neste canal de voz',
        already_playing: 'Já estou tocando em outro canal de voz!',
        no_results: 'Nenhuma música encontrada para: **{{query}}**',
        generic_error: 'Ocorreu um erro ao tentar tocar a música',
      },
      success: {
        playlist_added: 'Playlist Adicionada',
        now_playing: 'Tocando Agora',
        added_to_queue: 'Adicionado à Fila',
      },
      fields: {
        duration: '⏱️ Duração',
        position: '📊 Posição',
        playing: 'Tocando',
        live: 'Ao vivo',
        requested_by: 'Solicitado por {{username}}',
        tracks_added: '{{count}} músicas adicionadas à fila',
      },
    },
    leave: {
      name: 'leave',
      description: 'Desconecta o bot do canal de voz',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        not_connected: 'Não estou conectado para sair do canal de voz!',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        generic_error: 'Ocorreu um erro ao tentar parar a música',
      },
      success: {
        title: 'Desconectado',
        description: 'Bye bye, até na proxima',
      },
    },
    stop: {
      name: 'stop',
      description: 'Parar a música e limpar a fila',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        generic_error: 'Ocorreu um erro ao tentar parar a música',
      },
      success: {
        title: 'Reprodução Parada',
        description: 'A música foi parada e a fila foi limpa',
      },
      fields: {
        stopped_by: 'Parado por {{username}}',
      },
    },
    pause: {
      name: 'pause',
      description: 'Pausar a música atual',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        already_paused: 'A música já está pausada',
        generic_error: 'Ocorreu um erro ao pausar a música',
      },
      success: {
        title: 'Música Pausada',
        description: 'A reprodução foi pausada',
      },
      fields: {
        paused_by: 'Pausado por {{username}}',
      },
    },
    resume: {
      name: 'resume',
      description: 'Retomar a música pausada',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        not_paused: 'A música não está pausada',
        generic_error: 'Ocorreu um erro ao retomar a música',
      },
      success: {
        title: 'Música Retomada',
        description: 'A reprodução foi retomada',
      },
      fields: {
        resumed_by: 'Retomado por {{username}}',
      },
    },
    skip: {
      name: 'skip',
      description: 'Pular a música atual',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        no_track: 'Não há música tocando',
        generic_error: 'Ocorreu um erro ao pular a música',
      },
      success: {
        title: 'Música Pulada',
        description: 'Pulou: **{{track}}**',
      },
      fields: {
        skipped_by: 'Pulado por {{username}}',
      },
    },
    queue: {
      name: 'queue',
      description: 'Ver a fila de músicas',
      errors: {
        no_player: 'Não há nada tocando no momento',
        no_queue: 'A fila está vazia',
      },
      success: {
        title: '🎵 Fila de Músicas',
        now_playing: '**Tocando Agora:**',
        next_up: '**Próximas:**',
        no_upcoming: 'Nenhuma música na fila',
      },
      fields: {
        total: 'Total: {{count}} música(s) | Duração: {{duration}}',
      },
    },
    nowplaying: {
      name: 'nowplaying',
      description: 'Ver informações da música atual',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        no_track: 'Nenhuma música tocando',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
      },
      success: {
        title: '🎵 Tocando Agora',
        description: 'Informações sobre a faixa atual: **{{track}}**',
      },
      fields: {
        track: '🎶 Faixa',
        author: '👤 Autor',
        duration: '⏱️ Duração',
        progress: '⏱️ Progresso',
        volume: '🔊 Volume',
        loop: '🔁 Loop',
        loop_off: 'Desativado',
        loop_track: 'Música',
        loop_queue: 'Fila',
        requested_by: 'Solicitado por {{username}}',
        no_thumbnail: 'Sem miniatura disponível',
      },
    },
    shuffle: {
      name: 'shuffle',
      description: 'Embaralhar a fila de músicas',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        empty_queue: 'A fila está vazia',
        generic_error: 'Ocorreu um erro ao embaralhar a fila',
      },
      success: {
        title: 'Fila Embaralhada',
        description: 'A fila foi embaralhada com sucesso',
      },
      fields: {
        shuffled_by: 'Embaralhado por {{username}}',
      },
    },
    volume: {
      name: 'volume',
      description: 'Ajustar o volume da música',
      options: {
        level: {
          name: 'level',
          description: 'Volume (0-100)',
        },
      },
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        invalid_volume: 'Volume deve ser entre 0 e 100',
        generic_error: 'Ocorreu um erro ao ajustar o volume',
      },
      success: {
        title: 'Volume Ajustado',
        description: 'Volume alterado para **{{volume}}%**',
      },
      fields: {
        changed_by: 'Alterado por {{username}}',
      },
    },
    loop: {
      name: 'loop',
      description: 'Configurar modo de repetição',
      options: {
        mode: {
          name: 'mode',
          description: 'Modo de repetição',
          choices: {
            off: 'Desligado',
            track: 'Música Atual',
            queue: 'Fila Inteira',
          },
        },
      },
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        generic_error: 'Ocorreu um erro ao configurar o loop',
      },
      success: {
        title: 'Loop Configurado',
        description_off: 'Loop desativado',
        description_track: 'Repetindo música atual',
        description_queue: 'Repetindo fila inteira',
      },
      fields: {
        changed_by: 'Alterado por {{username}}',
      },
    },
  },
  validation: {
    min_characters: 'Mínimo {{min}} caractere(s)',
    max_characters: 'Máximo {{max}} caracteres',
  },
} as const;
