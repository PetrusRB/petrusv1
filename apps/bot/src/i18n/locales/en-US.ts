export default {
  category: {
    musica: 'music',
    segurança: 'security',
    utilidade: 'utils',
    jogos: 'gaming',
    diversao: 'fun',
    bitcoin: 'bitcoin',
    admin: 'admin',
  },
  commands: {
    play: {
      name: 'play',
      description: 'Play a song',
      options: {
        query: {
          name: 'query',
          description: 'Song name or URL. Example: Miss you - Phonk remix',
        },
      },
      errors: {
        validation_failed: 'Could not validate your request',
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        cant_create_player: 'Could not create a audio player',
        no_permissions:
          "I don't have permission to join/speak in this voice channel",
        already_playing: "I'm already playing in another voice channel!",
        no_results: 'No songs found for: **{{query}}**',
        generic_error: 'An error occurred while trying to play the song',
      },
      success: {
        playlist_added: 'Playlist Added',
        now_playing: 'Now Playing',
        added_to_queue: 'Added to Queue',
      },
      fields: {
        duration: 'Duration',
        position: 'Position',
        author: 'Author',
        playing: 'Playing',
        live: 'Live',
        requested_by: 'Requested by {{username}}',
        tracks_added: '{{count}} songs added to queue',
      },
    },
    verify: {
      name: 'verify',
      description: 'Verification manager',
      errors: {
        generic_error:
          'An error occurred while trying to manage the verification system.',
        no_perm: 'You do not have sufficient permissions for this.',
        no_dm:
          'I cannot send messages to your DM (private). Check if it is enabled so I can send.',
        session_expired: 'Session expired!',
        channel_not_exists: "Channel don't exists. Try to create first",
        not_enabled:
          'The verification system is not enabled! Use /config definir category:modules chave:verification value:true to enable the verification system',
        not_for_you: 'This session is not for you!',
        already_verified: 'Already verified',
        invalid_channel:
          'Please provide a valid channel. Try redefining the channel using /config definir category:canais chave:verificado valor: <channel_id_here>',

        channel_already_exists: 'Configured channel already exists',
      },
      dm: {
        desc: 'Check the image and click Confirm to complete your verification!',
      },
      button: {
        label: 'Verify',
      },
      success: {
        created: 'Channel created successfully.',
        embed_sent: 'Embed sent successfully.',
        dm_sent: 'DM sent to your private messages',
        delete_channel: 'Channel deleted successfully!',
        verified: 'Successfully verified!',
      },
      embed: {
        title: 'Verification',
        description: 'Click the button to get verified!',
        button: 'Verify',
      },
    },

    help: {
      name: 'help',
      description:
        'Shows bot information: commands, examples, tips, and shortcuts. Ex.: /ajuda',
      errors: {
        generic_error:
          'An error occurred while trying to display the help menu. Please try again later.',
        failed_to_process:
          "Oops.. i couldn't process your interaction right now. Please try again later while I get smarter!",
        invalid_input_title: 'Invalid input!',
        invalid_input_description:
          'The command name must contain only letters, numbers, hyphens, or underscores, up to 32 characters.',
        not_found_title: 'Command not found!',
        not_found_description: 'The command `{{cmd}}` does not exist.',
      },
      commandInfo: {
        title: 'Command: /{{name}}',
        description: 'Detailed information about the /{{name}} command.',
      },
      success: {
        title: 'Petrus help center',
        description: 'See all commands below, organized by category.',
        footer: 'Use your commands wisely!',
      },
      endEmbed: {
        title: 'Help ended',
        description: 'If you need help again, type /help',
      },
      commandList: {
        title: 'Command Center',
        description: 'See all commands below, organized by category.',
        footer: 'Use your commands wisely!',
      },
      noCommands: {
        title: 'No commands found!',
        description: 'It seems there are no commands available at the moment.',
      },
      error: {
        title: 'Internal error!',
        description:
          'An error occurred while processing your request. Please try again later.',
      },
    },

    search: {
      name: 'search',
      description: 'Search a music',
      errors: {
        no_member_info: 'Could get your voice information',
        not_in_voice: 'You need to be on a voice channel',
        not_yours: 'This interaction is not yours!',
        no_results: 'No results found...',
        no_player: 'Nothing to play right now',
        different_voice_channel: 'You need to be on same voice channel as me',
        generic_error:
          'An unexpected error was occurred, could search the music.',
      },
      success: {
        title: 'Tracks found.',
        description: 'All tracks that i found',
      },
      buttons: {
        select: 'Select',
        cancel: 'Cancel',
      },
    },
    leave: {
      name: 'leave',
      description: 'Disconnects the bot from the voice channel',
      errors: {
        no_member_info: 'Could not fetch your voice information',
        not_in_voice: 'You need to be in a voice channel',
        no_player: 'There is nothing playing right now',
        not_connected: 'I am not connected to the voice channel to disconnect',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        generic_error: 'An error occurred while trying to stop the music',
      },
      success: {
        title: 'Disconnected',
        description: 'Bye bye, see you next time',
      },
    },
    stop: {
      name: 'stop',
      description: 'Stop the music and clear the queue',
      errors: {
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        not_connected: 'Não estou conectado para sair do canal de voz!',
        no_player: 'Nothing is playing right now',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        generic_error: 'An error occurred while trying to stop the music',
      },
      success: {
        title: 'Playback Stopped',
        description:
          'The music has been stopped and the queue has been cleared',
      },
      fields: {
        stopped_by: 'Stopped by {{username}}',
      },
    },
    pause: {
      name: 'pause',
      description: 'Pause the current song',
      errors: {
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        no_player: 'Nothing is playing right now',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        already_paused: 'The music is already paused',
        generic_error: 'An error occurred while pausing the music',
      },
      success: {
        title: 'Music Paused',
        description: 'Playback has been paused',
      },
      fields: {
        paused_by: 'Paused by {{username}}',
      },
    },
    resume: {
      name: 'resume',
      description: 'Resume the paused song',
      errors: {
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        no_player: 'Nothing is playing right now',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        not_paused: 'The music is not paused',
        generic_error: 'An error occurred while resuming the music',
      },
      success: {
        title: 'Music Resumed',
        description: 'Playback has been resumed',
      },
      fields: {
        resumed_by: 'Resumed by {{username}}',
      },
    },
    skip: {
      name: 'skip',
      description: 'Skip the current song',
      errors: {
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        no_player: 'Nothing is playing right now',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        no_track: 'No song is playing',
        generic_error: 'An error occurred while skipping the song',
      },
      success: {
        title: 'Song Skipped',
        description: 'Skipped: **{{track}}**',
      },
      fields: {
        skipped_by: 'Skipped by {{username}}',
      },
    },
    queue: {
      name: 'queue',
      description: 'View the music queue',
      errors: {
        no_player: 'Nothing is playing right now',
        no_queue: 'The queue is empty',
      },
      success: {
        title: '🎵 Music Queue',
        now_playing: '**Now Playing:**',
        next_up: '**Up Next:**',
        no_upcoming: 'No songs in queue',
      },
      fields: {
        total: 'Total: {{count}} song(s) | Duration: {{duration}}',
      },
    },
    nowplaying: {
      name: 'nowplaying',
      description: 'Show information about the current song',
      errors: {
        no_member_info: 'Could not fetch your voice information',
        not_in_voice: 'You need to be in a voice channel',
        cant_get_current_track: "Can't get current track information",
        no_player: 'There is nothing playing right now',
        no_track: 'No track is currently playing',
        different_voice_channel:
          'You need to be in the same voice channel as me',
      },
      success: {
        title: 'Now Playing',
        description: 'Details for the current track: **{{track}}**',
      },
      fields: {
        track: '🎶 Track',
        author: '👤 Author',
        duration: '⏱️ Duration',
        progress: '⏱️ Progress',
        volume: '🔊 Volume',
        loop: '🔁 Loop',
        loop_off: 'Off',
        loop_track: 'Track',
        loop_queue: 'Queue',
        requested_by: 'Requested by {{username}}',
        no_thumbnail: 'No thumbnail available',
      },
    },
    shuffle: {
      name: 'shuffle',
      description: 'Shuffle the music queue',
      errors: {
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        no_player: 'Nothing is playing right now',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        empty_queue: 'The queue is empty',
        generic_error: 'An error occurred while shuffling the queue',
      },
      success: {
        title: 'Queue Shuffled',
        description: 'The queue has been shuffled successfully',
      },
      fields: {
        shuffled_by: 'Shuffled by {{username}}',
      },
    },
    volume: {
      name: 'volume',
      description: 'Adjust music volume',
      options: {
        level: {
          name: 'level',
          description: 'Volume (0-100)',
        },
      },
      errors: {
        no_member_info: 'Could not get your voice information',
        not_in_voice: 'You need to be in a voice channel',
        no_player: 'Nothing is playing right now',
        different_voice_channel:
          'You need to be in the same voice channel as me',
        invalid_volume: 'Volume must be between 0 and 100',
        generic_error: 'An error occurred while adjusting the volume',
      },
      success: {
        title: 'Volume Adjusted',
        description: 'Volume changed to **{{volume}}%**',
      },
      fields: {
        changed_by: 'Changed by {{username}}',
      },
    },
    loop: {
      name: 'loop',
      description: 'Configure repeat mode',

      options: {
        mode: {
          name: 'mode',
          description: 'Repeat mode',
          choices: {
            off: 'Off',
            track: 'Current track',
            queue: 'Entire queue',
          },
        },
      },

      errors: {
        no_member_info: 'Could not retrieve your voice information.',
        not_in_voice: 'You need to join a voice channel.',
        no_player: 'There is no music playing at the moment.',
        different_voice_channel: 'You must be in the same voice channel as me.',
        generic_error: 'An error occurred while changing the repeat mode.',
      },

      success: {
        title: 'Repeat Mode Updated',
        description: {
          off: 'Repeat mode disabled.',
          track: 'Repeating the current track.',
          queue: 'Repeating the entire queue.',
        },
      },

      fields: {
        changed_by: 'Changed by {{username}}',
      },
    },
  },
  validation: {
    min_characters: 'Minimum {{min}} character(s)',
    max_characters: 'Maximum {{max}} characters',
  },
} as const;
