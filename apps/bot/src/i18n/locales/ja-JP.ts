export default {
  category: {
    musica: '音楽',
    segurança: '安全',
    utilidade: 'ユーティリティ',
    jogos: 'ゲーム',
    diversao: '楽しい',
    bitcoin: 'ビットコイン',
    admin: '管理',
  },
  commands: {
    play: {
      name: 'play',
      description: '音楽を再生する',
      options: {
        query: {
          name: 'query',
          description: '曲名またはURL。例: Miss you - Phonk remix',
        },
      },
      errors: {
        validation_failed: 'リクエストの検証に失敗しました',
        no_member_info: 'ボイス情報を取得できませんでした',
        cant_create_player: '音楽プレーヤーを作成できませんでした。',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_permissions: 'このボイスチャンネルに参加/発言する権限がありません',
        already_playing: 'すでに別のボイスチャンネルで再生中です！',
        no_results: '検索結果が見つかりません: **{{query}}**',
        generic_error: '音楽の再生中にエラーが発生しました',
      },
      success: {
        playlist_added: 'プレイリストを追加しました',
        now_playing: '再生中',
        added_to_queue: 'キューに追加しました',
      },
      fields: {
        duration: '長さ',
        position: '位置',
        author: '著者',
        playing: '再生中',
        live: 'ライブ',
        requested_by: '{{username}} さんのリクエスト',
        tracks_added: '{{count}} 曲をキューに追加しました',
      },
    },
    verify: {
      name: 'verify',
      description: '認証マネージャー',
      errors: {
        generic_error: '認証システムの管理中にエラーが発生しました。',
        no_perm: 'この操作を行うための十分な権限がありません。',
        no_dm: 'DMを送信できません。DMの受信を有効にしてください。',
        session_expired: 'セッションの有効期限が切れました！',
        not_enabled:
          '認証システムが有効になっていません！/config definir category:modules chave:verification value:true を使用して認証システムを有効にしてください',
        not_for_you: 'このセッションはあなたのものではありません！',
        already_verified: 'すでに認証済みです',
        invalid_channel:
          '有効なチャンネルを指定してください。/config definir category:canais chave:verificado valor: <チャンネルIDをここに入力> を使用してチャンネルを再設定してみてください',

        channel_not_exists:
          'チャンネルが存在しません。まずは作成してみてください',
        channel_already_exists: '設定済みのチャンネルは既に存在します',
      },
      dm: {
        desc: '画像を確認し、「確認」ボタンをクリックして認証を完了してください！',
      },
      button: {
        label: '認証する',
      },
      success: {
        created: 'チャンネルが正常に作成されました。',
        embed_sent: '埋め込みが正常に送信されました。',
        dm_sent: 'DMがプライベートメッセージに送信されました',
        delete_channel: 'チャンネルは正常に削除されました。',
        verified: '認証が完了しました！',
      },
      embed: {
        title: '認証',
        description: 'ボタンをクリックして認証してください！',
        button: '認証する',
      },
    },

    help: {
      name: 'help',
      description:
        'ボットの情報を表示します：コマンド、例、ヒント、ショートカットなど。例: /ajuda',
      errors: {
        generic_error:
          'ヘルプを表示中にエラーが発生しました。後でもう一度お試しください。',
        failed_to_process: 'やり取りを処理できませんでした。',
        invalid_input_title: '無効な入力！',
        invalid_input_description:
          'コマンド名は最大32文字の英数字、ハイフン、またはアンダースコアのみ使用できます。',
        not_found_title: 'コマンドが見つかりません！',
        not_found_description: 'コマンド `{{cmd}}` は存在しません。',
      },
      commandInfo: {
        title: 'コマンド: /{{name}}',
        description: '/{{name}} の詳細情報です。',
      },
      success: {
        title: 'ヘルプセンター',
        description: 'カテゴリー別に整理されたコマンドをご覧ください。',
        footer: 'コマンドは賢く使いましょう！',
      },
      endEmbed: {
        title: '閉鎖',
        description: '再度ヘルプが必要な場合は、/helpと入力してください。',
      },
      commandList: {
        title: 'コマンドセンター',
        description: 'カテゴリー別に整理されたコマンドをご覧ください。',
        footer: 'コマンドは賢く使いましょう！',
      },
      noCommands: {
        title: 'コマンドが見つかりません！',
        description: '現在利用可能なコマンドはありません。',
      },
      error: {
        title: '内部エラー！',
        description:
          'リクエストの処理中にエラーが発生しました。後でもう一度お試しください。',
      },
    },
    search: {
      name: 'search',
      description: '音楽を検索',
      errors: {
        no_member_info: '音声情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        not_yours: 'この操作はあなたのものではありません！',
        no_results: '結果が見つかりませんでした',
        no_player: '現在再生中の曲はありません',
        different_voice_channel: '私と同じボイスチャンネルにいる必要があります',
        generic_error: '音楽の再開時にエラーが発生しました',
      },
      success: {
        title: '音楽',
        description: '提供された情報に基づくすべての音楽',
      },
      buttons: {
        select: '選択',
        cancel: 'キャンセル',
      },
    },
    leave: {
      name: 'leave',
      description: 'ボットを音声のチャンネルから切断します',
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        not_connected:
          '私はオーディオチャンネルを残すために接続されていません！',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        generic_error: '音楽を停止中にエラーが発生しました',
      },
      success: {
        title: '切断されました',
        description: 'さようなら、後まで',
      },
    },
    stop: {
      name: 'stop',
      description: '音楽を停止してキューをクリアする',
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        generic_error: '音楽を停止中にエラーが発生しました',
      },
      success: {
        title: '再生を停止しました',
        description: '音楽を停止し、キューをクリアしました',
      },
      fields: {
        stopped_by: '{{username}} さんが停止しました',
      },
    },
    pause: {
      name: 'pause',
      description: '現在の音楽を一時停止する',
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        already_paused: '音楽はすでに一時停止されています',
        generic_error: '音楽を一時停止中にエラーが発生しました',
      },
      success: {
        title: '音楽を一時停止しました',
        description: '再生が一時停止されました',
      },
      fields: {
        paused_by: '{{username}} さんが一時停止しました',
      },
    },
    resume: {
      name: 'resume',
      description: '一時停止中の音楽を再開する',
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        not_paused: '音楽は一時停止されていません',
        generic_error: '音楽を再開中にエラーが発生しました',
      },
      success: {
        title: '音楽を再開しました',
        description: '再生が再開されました',
      },
      fields: {
        resumed_by: '{{username}} さんが再開しました',
      },
    },
    skip: {
      name: 'skip',
      description: '現在の音楽をスキップする',
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        no_track: '再生中の曲がありません',
        generic_error: '音楽をスキップ中にエラーが発生しました',
      },
      success: {
        title: '曲をスキップしました',
        description: 'スキップ: **{{track}}**',
      },
      fields: {
        skipped_by: '{{username}} さんがスキップしました',
      },
    },
    queue: {
      name: 'queue',
      description: '音楽キューを表示する',
      errors: {
        no_player: '現在再生中の音楽はありません',
        no_queue: 'キューは空です',
      },
      success: {
        title: '🎵 音楽キュー',
        now_playing: '**現在再生中:**',
        next_up: '**次の曲:**',
        no_upcoming: '次の曲はありません',
      },
      fields: {
        total: '合計: {{count}} 曲 | 長さ: {{duration}}',
      },
    },
    nowplaying: {
      name: 'nowplaying',
      description: '現在の曲情報を表示する',
      errors: {
        no_member_info: 'オーディオ情報を復元できませんでした。',
        not_in_voice: 'オーディオチャンネルにいる必要があります',
        cant_get_current_track: '今の曲から情報を得ることができませんでした',
        no_player: '現在再生中の音楽はありません',
        no_track: '再生中の曲がありません',
        different_voice_channel:
          'あなたは私と同じオーディオチャンネルにいる必要があります',
      },
      success: {
        title: '現在再生中',
      },
      fields: {
        progress: '⏱️ 進行状況',
        volume: '🔊 音量',
        loop: '🔁 ループ',
        loop_off: 'オフ',
        loop_track: '曲',
        loop_queue: 'キュー',
      },
    },
    shuffle: {
      name: 'shuffle',
      description: '音楽キューをシャッフルする',
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        empty_queue: 'キューは空です',
        generic_error: 'キューをシャッフル中にエラーが発生しました',
      },
      success: {
        title: 'キューをシャッフルしました',
        description: 'キューが正常にシャッフルされました',
      },
      fields: {
        shuffled_by: '{{username}} さんがシャッフルしました',
      },
    },
    volume: {
      name: 'volume',
      description: '音量を調整する',
      options: {
        level: {
          name: 'level',
          description: '音量 (0-100)',
        },
      },
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        invalid_volume: '音量は0から100の間で設定してください',
        generic_error: '音量調整中にエラーが発生しました',
      },
      success: {
        title: '音量を調整しました',
        description: '音量を **{{volume}}%** に変更しました',
      },
      fields: {
        changed_by: '{{username}} さんが変更しました',
      },
    },
    loop: {
      name: 'loop',
      description: 'リピートモードを設定する',

      options: {
        mode: {
          name: 'mode',
          description: 'リピートモード',
          choices: {
            off: 'オフ',
            track: '現在の曲',
            queue: 'キュー全体',
          },
        },
      },

      errors: {
        no_member_info: 'あなたの音声情報を取得できませんでした。',
        not_in_voice: 'ボイスチャンネルに参加する必要があります。',
        no_player: '現在再生中の曲はありません。',
        different_voice_channel:
          '私と同じボイスチャンネルにいる必要があります。',
        generic_error: 'リピートモードの設定中にエラーが発生しました。',
      },

      success: {
        title: 'リピートモードを更新しました',
        description: {
          off: 'リピートはオフになりました。',
          track: '現在の曲をリピートします。',
          queue: 'キュー全体をリピートします。',
        },
      },

      fields: {
        changed_by: '{{username}} によって変更されました',
      },
    },
  },
  validation: {
    min_characters: '最小 {{min}} 文字',
    max_characters: '最大 {{max}} 文字',
  },
} as const;
