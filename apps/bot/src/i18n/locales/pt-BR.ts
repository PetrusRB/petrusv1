export default {
  category: {
    musica: 'música',
    segurança: 'segurança',
    utilidade: 'utilidade',
    jogos: 'jogos',
    diversao: 'diversão',
    bitcoin: 'bitcoin',
    admin: 'admin',
  },
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
        duration: 'Duração',
        position: 'Posição',
        author: 'Autor',
        playing: 'Tocando',
        live: 'Ao vivo',
        requested_by: 'Solicitado por {{username}}',
        tracks_added: '{{count}} músicas adicionadas à fila',
      },
    },

    verify: {
      name: 'verify',
      description: 'Gerenciador de verificação',
      errors: {
        generic_error:
          'Ocorreu um erro ao tentar gerenciar o sistema de verificação.',
        no_perm: 'Você não tem permissões suficientes para isso.',
        no_dm:
          'Não consigo enviar mensagem na sua DM (privado). Verifique se está ativada para eu enviar.',
        session_expired: 'Sessão expirada!',
        not_enabled:
          'Não está abilitado o sistema de verificação!. Use o /config definir category:modules chave:verification value:true para abilitar o sistema de verificação',
        not_for_you: 'Essa sessão não é para você!',
        already_verified: 'Já esta verificado(a)',
        invalid_channel:
          'Informe um canal válido. Tente re-definir o canal usando /config definir category:canais chave:verificado valor: <id_do_canal_aqui>',
        channel_not_exists: 'Canal não existe. Tente criar um primeiro',
        channel_already_exists: 'Canal configurado já existente',
      },
      dm: {
        desc: 'Confira a imagem e clique em Confirmar para completar sua verificação!',
      },
      button: {
        label: 'Verificar',
      },
      success: {
        created: 'Canal criado com sucesso.',
        embed_sent: 'Embed enviada com sucesso.',
        dm_sent: 'DM enviado no seu pv',
        delete_channel: 'Canal deletado com sucesso!',
        verified: 'Verificado(a) com sucesso!',
      },
      embed: {
        title: 'Verificação',
        description: 'Clique no botão para ser verificado!',
        button: 'Verificar',
      },
    },

    help: {
      name: 'help',
      description:
        'Mostra informações do bot: comandos, exemplos, dicas e atalhos. Ex.: /ajuda',
      errors: {
        generic_error:
          'Ocorreu um erro ao tentar exibir a ajuda. Tente novamente mais tarde.',
        invalid_input_title: 'Entrada inválida!',
        failed_to_process: 'Ocorreu um erro ao tentar processar sua interação.',
        invalid_input_description:
          'O nome do comando deve conter apenas letras, números, hífens ou sublinhados, até 32 caracteres.',
        not_found_title: 'Comando não encontrado!',
        not_found_description: 'O comando `{{cmd}}` não existe.',
      },
      commandInfo: {
        title: 'Comando: /{{name}}',
        description: 'Informações detalhadas sobre o comando /{{name}}.',
      },
      success: {
        title: 'Central de Ajuda',
        description: 'Veja abaixo todos os comandos organizados por categoria.',
        footer: 'Use seus comandos com sabedoria!',
      },
      endEmbed: {
        title: 'Ajuda encerrada',
        description: 'Se você precisar de ajuda novamente, digite: /ajuda',
      },
      commandList: {
        title: 'Central de Comandos',
        description: 'Veja abaixo todos os comandos organizados por categoria.',
        footer: 'Use seus comandos com sabedoria!',
      },
      noCommands: {
        title: 'Nenhum comando encontrado!',
        description: 'Parece que não há comandos disponíveis no momento.',
      },
      error: {
        title: 'Erro interno!',
        description:
          'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
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
    search: {
      name: 'search',
      description: 'Pesquisa uma música',
      errors: {
        no_member_info: 'Não foi possível obter suas informações de voz',
        not_in_voice: 'Você precisa estar em um canal de voz',
        not_yours: 'Essa interação não é sua!',
        no_results: 'Nenhum resultado encontrado',
        no_player: 'Não há nada tocando no momento',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
        generic_error: 'Ocorreu um erro ao retomar a música',
      },
      success: {
        title: 'Resultados de busca',
        description: 'Todas as músicas com base ao que você forneceu',
      },
      buttons: {
        select: 'Selecionar',
        cancel: 'Cancelar',
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
        cant_get_current_track: 'Não foi possivel obter a música atual',
        no_player: 'Não há nada tocando no momento',
        no_track: 'Nenhuma música tocando',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu',
      },
      success: {
        title: 'Tocando Agora',
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
            track: 'Música atual',
            queue: 'Fila inteira',
          },
        },
      },

      errors: {
        no_member_info: 'Não foi possível obter informações sobre você.',
        not_in_voice: 'Você precisa entrar em um canal de voz.',
        no_player: 'Nenhuma música está tocando no momento.',
        different_voice_channel:
          'Você precisa estar no mesmo canal de voz que eu.',
        generic_error: 'Ocorreu um erro ao configurar o modo de repetição.',
      },

      success: {
        title: 'Modo de Repetição Atualizado',

        // descrições mais consistentes e naturais
        description: {
          off: 'Repetição desativada.',
          track: 'Repetindo apenas a música atual.',
          queue: 'Repetindo toda a fila.',
        },
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
