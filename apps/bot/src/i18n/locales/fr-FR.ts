export default {
  category: {
    musica: 'musique',
    segurança: 'sécurité',
    utilidade: 'utilitaire',
    jogos: 'jeux',
    diversao: 'amusant',
    bitcoin: 'bitcoin',
    admin: 'administrateur',
  },
  commands: {
    play: {
      name: 'play',
      description: 'Jouer une musique',
      options: {
        query: {
          name: 'query',
          description:
            'Nom de la musique ou URL. Exemple : Miss you - Phonk remix',
        },
      },
      errors: {
        validation_failed: "Je n'ai pas pu valider votre requête",
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        cant_create_player: 'Impossible de créer le lecteur de musique.',
        no_permissions:
          "Je n'ai pas la permission de rejoindre/parler dans ce canal vocal",
        already_playing: 'Je joue déjà dans un autre canal vocal !',
        no_results: 'Aucune musique trouvée pour : **{{query}}**',
        generic_error:
          'Une erreur est survenue lors de la lecture de la musique',
      },
      success: {
        playlist_added: 'Playlist ajoutée',
        now_playing: 'Lecture en cours',
        added_to_queue: 'Ajouté à la file',
      },
      fields: {
        duration: 'Durée',
        position: 'Position',
        author: 'Auteur',
        playing: 'Lecture',
        live: 'En direct',
        requested_by: 'Demandé par {{username}}',
        tracks_added: '{{count}} musique(s) ajoutée(s) à la file',
      },
    },
    verify: {
      name: 'verify',
      description: 'Gestionnaire de vérification',
      errors: {
        generic_error:
          "Une erreur s'est produite lors de la gestion du système de vérification.",
        no_perm: "Vous n'avez pas les permissions suffisantes pour cela.",
        no_dm:
          "Je ne peux pas envoyer de message dans vos DM (privé). Vérifiez qu'ils sont activés pour que je puisse envoyer.",
        session_expired: 'Session expirée !',
        channel_not_exists:
          "La chaîne n'existe pas. Veuillez d'abord essayer de le créer.",
        not_enabled:
          "Le système de vérification n'est pas activé ! Utilisez /config definir category:modules chave:verification value:true pour activer le système de vérification",
        not_for_you: "Cette session n'est pas pour vous !",
        already_verified: 'Déjà vérifié(e)',
        invalid_channel:
          'Veuillez fournir un canal valide. Essayez de redéfinir le canal en utilisant /config definir category:canais chave:verificado valor: <id_du_canal_ici>',
        channel_already_exists: 'Le canal configuré existe déjà',
      },
      dm: {
        desc: "Vérifiez l'image et cliquez sur Confirmer pour compléter votre vérification !",
      },
      button: {
        label: 'Vérifier',
      },
      success: {
        created: 'Canal créé avec succès.',
        embed_sent: 'Embed envoyé avec succès.',
        dm_sent: 'DM envoyé dans vos messages privés',
        delete_channel: 'Chaîne supprimée avec succès !',
        verified: 'Vérifié(e) avec succès !',
      },
      embed: {
        title: 'Vérification',
        description: 'Cliquez sur le bouton pour être vérifié !',
        button: 'Vérifier',
      },
    },
    help: {
      name: 'help',
      description:
        'Affiche des informations sur le bot : commandes, exemples, astuces et raccourcis. Ex. : /ajuda',
      errors: {
        generic_error:
          "Une erreur est survenue lors de l'affichage de l'aide. Veuillez réessayer plus tard.",
        failed_to_process:
          "Une erreur s'est produite lors du traitement de votre interaction.",
        invalid_input_title: 'Entrée invalide !',
        invalid_input_description:
          'Le nom de la commande doit contenir uniquement des lettres, des chiffres, des tirets ou des underscores, avec un maximum de 32 caractères.',
        not_found_title: 'Commande introuvable !',
        not_found_description: "La commande `{{cmd}}` n'existe pas.",
      },
      commandInfo: {
        title: 'Commande : /{{name}}',
        description: 'Informations détaillées sur la commande /{{name}}.',
      },
      success: {
        title: "Centre d'Aide",
        description:
          'Découvrez ci-dessous toutes les commandes organisées par catégorie.',
        footer: 'Utilisez vos commandes avec sagesse !',
      },
      endEmbed: {
        title: "L'aide est terminée.",
        description: "Si vous avez de nouveau besoin d'aide, tapez /help",
      },
      commandList: {
        title: 'Centre des Commandes',
        description:
          'Découvrez ci-dessous toutes les commandes organisées par catégorie.',
        footer: 'Utilisez vos commandes avec sagesse !',
      },
      noCommands: {
        title: 'Aucune commande trouvée !',
        description: "Aucune commande n'est disponible pour le moment.",
      },
      error: {
        title: 'Erreur interne !',
        description:
          'Une erreur est survenue lors du traitement de votre requête. Veuillez réessayer plus tard.',
      },
    },
    leave: {
      name: 'leave',
      description: 'Déconnecte le bot du canal vocal',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        not_connected:
          'Je ne suis pas connecté au canal vocal pour me déconnecter',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        generic_error: "Une erreur est survenue lors de l'arrêt de la musique",
      },
      success: {
        title: 'Déconnecté',
        description: 'Au revoir, à bientôt',
      },
    },
    search: {
      name: 'search',
      description: 'Recherche une musique',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        not_yours: "Cette interaction n'est pas à vous !",
        no_results: 'Aucun résultat trouvé',
        no_player: "Il n'y a rien en train de jouer actuellement",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        generic_error:
          'Une erreur est survenue lors de la reprise de la musique',
      },
      success: {
        title: 'Musiques',
        description: 'Toutes les musiques basées sur ce que vous avez fourni',
      },
      buttons: {
        select: 'Sélectionner',
        cancel: 'Annuler',
      },
    },

    stop: {
      name: 'stop',
      description: 'Arrêter la musique et vider la file',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        generic_error: "Une erreur est survenue lors de l'arrêt de la musique",
      },
      success: {
        title: 'Lecture arrêtée',
        description: 'La musique a été arrêtée et la file a été vidée',
      },
      fields: {
        stopped_by: 'Arrêté par {{username}}',
      },
    },
    pause: {
      name: 'pause',
      description: 'Mettre la musique actuelle en pause',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        already_paused: 'La musique est déjà en pause',
        generic_error: 'Une erreur est survenue lors de la mise en pause',
      },
      success: {
        title: 'Musique en pause',
        description: 'La lecture a été mise en pause',
      },
      fields: {
        paused_by: 'Mise en pause par {{username}}',
      },
    },
    resume: {
      name: 'resume',
      description: 'Reprendre la musique mise en pause',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        not_paused: "La musique n'est pas en pause",
        generic_error:
          'Une erreur est survenue lors de la reprise de la musique',
      },
      success: {
        title: 'Musique reprise',
        description: 'La lecture a repris',
      },
      fields: {
        resumed_by: 'Reprise par {{username}}',
      },
    },
    skip: {
      name: 'skip',
      description: 'Passer la musique actuelle',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        no_track: 'Aucune musique en cours de lecture',
        generic_error: 'Une erreur est survenue lors du passage de la musique',
      },
      success: {
        title: 'Musique passée',
        description: 'Passé : **{{track}}**',
      },
      fields: {
        skipped_by: 'Passé par {{username}}',
      },
    },
    queue: {
      name: 'queue',
      description: 'Voir la file de musiques',
      errors: {
        no_player: "Aucune musique n'est en cours de lecture",
        no_queue: 'La file est vide',
      },
      success: {
        title: '🎵 File de musiques',
        now_playing: '**Lecture en cours :**',
        next_up: '**À venir :**',
        no_upcoming: 'Aucune musique dans la file',
      },
      fields: {
        total: 'Total : {{count}} musique(s) | Durée : {{duration}}',
      },
    },
    nowplaying: {
      name: 'nowplaying',
      description: 'Voir les informations de la chanson en cours',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        cant_get_current_track: "Impossible d'obtenir la musique actuelle",
        no_player: 'Aucune lecture en cours pour le moment',
        no_track: "Aucune piste n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
      },
      success: {
        title: 'Lecture en cours',
        description: 'Informations sur la piste actuelle : **{{track}}**',
      },
      fields: {
        track: '🎶 Piste',
        author: '👤 Auteur',
        duration: '⏱️ Durée',
        progress: '⏱️ Progression',
        volume: '🔊 Volume',
        loop: '🔁 Boucle',
        loop_off: 'Désactivée',
        loop_track: 'Piste',
        loop_queue: 'File',
        requested_by: 'Demandé par {{username}}',
        no_thumbnail: 'Aucune miniature disponible',
      },
    },
    shuffle: {
      name: 'shuffle',
      description: 'Mélanger la file de musiques',
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        empty_queue: 'La file est vide',
        generic_error: 'Une erreur est survenue lors du mélange de la file',
      },
      success: {
        title: 'File mélangée',
        description: 'La file a été mélangée avec succès',
      },
      fields: {
        shuffled_by: 'Mélangé par {{username}}',
      },
    },
    volume: {
      name: 'volume',
      description: 'Ajuster le volume de la musique',
      options: {
        level: {
          name: 'level',
          description: 'Volume (0-100)',
        },
      },
      errors: {
        no_member_info: "Impossible d'obtenir vos informations vocales",
        not_in_voice: 'Vous devez être dans un canal vocal',
        no_player: "Aucune musique n'est en cours de lecture",
        different_voice_channel:
          'Vous devez être dans le même canal vocal que moi',
        invalid_volume: 'Le volume doit être compris entre 0 et 100',
        generic_error: "Une erreur est survenue lors de l'ajustement du volume",
      },
      success: {
        title: 'Volume ajusté',
        description: 'Volume modifié à **{{volume}}%**',
      },
      fields: {
        changed_by: 'Modifié par {{username}}',
      },
    },
    loop: {
      name: 'loop',
      description: 'Configurer le mode de répétition',

      options: {
        mode: {
          name: 'mode',
          description: 'Mode de répétition',
          choices: {
            off: 'Désactivé',
            track: 'Piste actuelle',
            queue: 'File entière',
          },
        },
      },

      errors: {
        no_member_info: 'Impossible d’obtenir vos informations vocales.',
        not_in_voice: 'Vous devez rejoindre un salon vocal.',
        no_player: 'Aucune musique n’est en cours de lecture.',
        different_voice_channel:
          'Vous devez être dans le même salon vocal que moi.',
        generic_error:
          'Une erreur est survenue lors de la configuration du mode de répétition.',
      },

      success: {
        title: 'Mode de Répétition Mis à Jour',
        description: {
          off: 'Répétition désactivée.',
          track: 'Répétition de la piste actuelle.',
          queue: 'Répétition de toute la file.',
        },
      },

      fields: {
        changed_by: 'Modifié par {{username}}',
      },
    },
  },
  validation: {
    min_characters: 'Minimum {{min}} caractère(s)',
    max_characters: 'Maximum {{max}} caractère(s)',
  },
} as const;
