export default {
  commands: {
    play: {
      name: 'play',
      description: 'Reproducir una canción',
      options: {
        query: {
          name: 'query',
          description:
            'Nombre de la canción o URL. Ejemplo: Miss you - Phonk remix',
        },
      },
      errors: {
        validation_failed: 'No se pudo validar tu solicitud',
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        cant_create_player: 'No se pudo crear el reproductor de música.',
        no_permissions:
          'No tengo permiso para unirme o hablar en ese canal de voz',
        already_playing: '¡Ya estoy reproduciendo en otro canal de voz!',
        no_results: 'No se encontró ninguna canción para: **{{query}}**',
        generic_error: 'Ocurrió un error al intentar reproducir la canción',
      },
      success: {
        playlist_added: 'Lista de reproducción añadida',
        now_playing: 'Reproduciendo ahora',
        added_to_queue: 'Añadido a la cola',
      },
      fields: {
        duration: 'Duración',
        position: 'Posición',
        author: 'Autor',
        playing: 'Reproduciendo',
        live: 'En vivo',
        requested_by: 'Solicitado por {{username}}',
        tracks_added: '{{count}} canciones añadidas a la cola',
      },
    },
    help: {
      name: 'help',
      description:
        'Muestra información del bot: comandos, ejemplos, consejos y atajos. Ej.: /ajuda',
      errors: {
        generic_error:
          'Ocurrió un error al intentar mostrar la ayuda. Inténtalo nuevamente más tarde.',
        invalid_input_title: '¡Entrada inválida!',
        invalid_input_description:
          'El nombre del comando debe contener solo letras, números, guiones o guiones bajos, con un máximo de 32 caracteres.',
        not_found_title: '¡Comando no encontrado!',
        not_found_description: 'El comando `{{cmd}}` no existe.',
      },
      commandInfo: {
        title: 'Comando: /{{name}}',
        description: 'Información detallada del comando /{{name}}.',
      },
      success: {
        title: 'Centro de Ayuda',
        description:
          'Consulta abajo todos los comandos organizados por categoría.',
        footer: '¡Usa tus comandos con sabiduría!',
      },
      endEmbed: {
        title: 'La ayuda terminó',
        description: 'Si necesitas ayuda de nuevo, escribe /help',
      },
      commandList: {
        title: 'Centro de Comandos',
        description:
          'Consulta abajo todos los comandos organizados por categoría.',
        footer: '¡Usa tus comandos con sabiduría!',
      },
      noCommands: {
        title: '¡No se encontraron comandos!',
        description: 'Parece que no hay comandos disponibles en este momento.',
      },
      error: {
        title: '¡Error interno!',
        description:
          'Ocurrió un error al procesar tu solicitud. Inténtalo nuevamente más tarde.',
      },
    },
    search: {
      name: 'search',
      description: 'Buscar una canción',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Necesitas estar en un canal de voz',
        not_yours: '¡Esta interacción no es tuya!',
        no_results: 'No se encontraron resultados',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel:
          'Necesitas estar en el mismo canal de voz que yo',
        generic_error: 'Ocurrió un error al reanudar la música',
      },
      success: {
        title: 'Músicas',
        description: 'Todas las canciones basadas en lo que proporcionaste',
      },
      buttons: {
        select: 'Seleccionar',
        cancel: 'Cancelar',
      },
    },
    leave: {
      name: 'leave',
      description: 'Desconecta el bot del canal de voz',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        not_connected: 'No estoy conectado al canal de voz para desconectarme',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        generic_error: 'Ocurrió un error al intentar detener la música',
      },
      success: {
        title: 'Desconectado',
        description: 'Hasta pronto',
      },
    },
    stop: {
      name: 'stop',
      description: 'Detener la música y limpiar la cola',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        generic_error: 'Ocurrió un error al intentar detener la música',
      },
      success: {
        title: 'Reproducción detenida',
        description: 'La música se ha detenido y la cola ha sido limpiada',
      },
      fields: {
        stopped_by: 'Detenido por {{username}}',
      },
    },
    pause: {
      name: 'pause',
      description: 'Pausar la canción actual',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        already_paused: 'La canción ya está pausada',
        generic_error: 'Ocurrió un error al pausar la música',
      },
      success: {
        title: 'Música pausada',
        description: 'La reproducción ha sido pausada',
      },
      fields: {
        paused_by: 'Pausado por {{username}}',
      },
    },
    resume: {
      name: 'resume',
      description: 'Reanudar la música pausada',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        not_paused: 'La música no está pausada',
        generic_error: 'Ocurrió un error al reanudar la música',
      },
      success: {
        title: 'Música reanudada',
        description: 'La reproducción ha sido reanudada',
      },
      fields: {
        resumed_by: 'Reanudado por {{username}}',
      },
    },
    skip: {
      name: 'skip',
      description: 'Saltar la canción actual',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        no_track: 'No hay ninguna canción reproduciéndose',
        generic_error: 'Ocurrió un error al saltar la canción',
      },
      success: {
        title: 'Canción saltada',
        description: 'Saltado: **{{track}}**',
      },
      fields: {
        skipped_by: 'Saltado por {{username}}',
      },
    },
    queue: {
      name: 'queue',
      description: 'Ver la cola de canciones',
      errors: {
        no_player: 'No hay nada reproduciéndose en este momento',
        no_queue: 'La cola está vacía',
      },
      success: {
        title: '🎵 Cola de canciones',
        now_playing: '**Reproduciendo ahora:**',
        next_up: '**Siguientes:**',
        no_upcoming: 'No hay canciones en la cola',
      },
      fields: {
        total: 'Total: {{count}} canción(es) | Duración: {{duration}}',
      },
    },
    nowplaying: {
      name: 'nowplaying',
      description: 'Ver información de la canción actual',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        cant_get_current_track: 'No se puede obtener la canción actual.',
        no_player: 'No hay nada reproduciéndose en este momento',
        no_track: 'No hay ninguna canción reproduciéndose',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
      },
      success: {
        title: 'Reproduciendo Ahora',
        description: 'Detalles de la pista actual: **{{track}}**',
      },
      fields: {
        track: '🎶 Pista',
        author: '👤 Autor',
        duration: '⏱️ Duración',
        progress: '⏱️ Progreso',
        volume: '🔊 Volumen',
        loop: '🔁 Bucle',
        loop_off: 'Desactivado',
        loop_track: 'Pista',
        loop_queue: 'Cola',
        requested_by: 'Solicitado por {{username}}',
        no_thumbnail: 'Miniatura no disponible',
      },
    },
    shuffle: {
      name: 'shuffle',
      description: 'Mezclar la cola de canciones',
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        empty_queue: 'La cola está vacía',
        generic_error: 'Ocurrió un error al mezclar la cola',
      },
      success: {
        title: 'Cola mezclada',
        description: 'La cola se ha mezclado correctamente',
      },
      fields: {
        shuffled_by: 'Mezclado por {{username}}',
      },
    },
    volume: {
      name: 'volume',
      description: 'Ajustar el volumen de la música',
      options: {
        level: {
          name: 'level',
          description: 'Volumen (0-100)',
        },
      },
      errors: {
        no_member_info: 'No se pudo obtener tu información de voz',
        not_in_voice: 'Debes estar en un canal de voz',
        no_player: 'No hay nada reproduciéndose en este momento',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo',
        invalid_volume: 'El volumen debe estar entre 0 y 100',
        generic_error: 'Ocurrió un error al ajustar el volumen',
      },
      success: {
        title: 'Volumen ajustado',
        description: 'El volumen ha sido cambiado a **{{volume}}%**',
      },
      fields: {
        changed_by: 'Cambiado por {{username}}',
      },
    },
    loop: {
      name: 'loop',
      description: 'Configurar modo de repetición',

      options: {
        mode: {
          name: 'mode',
          description: 'Modo de repetición',
          choices: {
            off: 'Desactivado',
            track: 'Canción actual',
            queue: 'Cola completa',
          },
        },
      },

      errors: {
        no_member_info: 'No fue posible obtener tu información de voz.',
        not_in_voice: 'Necesitas unirte a un canal de voz.',
        no_player: 'No hay música reproduciéndose en este momento.',
        different_voice_channel: 'Debes estar en el mismo canal de voz que yo.',
        generic_error: 'Ocurrió un error al configurar el modo de repetición.',
      },

      success: {
        title: 'Modo de Repetición Actualizado',
        description: {
          off: 'Repetición desactivada.',
          track: 'Repitiendo la canción actual.',
          queue: 'Repitiendo toda la cola.',
        },
      },

      fields: {
        changed_by: 'Cambiado por {{username}}',
      },
    },
  },
  validation: {
    min_characters: 'Mínimo {{min}} carácter(es)',
    max_characters: 'Máximo {{max}} caracteres',
  },
} as const;
