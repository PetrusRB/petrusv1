export default {
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
        duration: '⏱️ 長さ',
        position: '📊 位置',
        playing: '再生中',
        live: 'ライブ',
        requested_by: '{{username}} さんのリクエスト',
        tracks_added: '{{count}} 曲をキューに追加しました',
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
        no_player: '現在再生中の音楽はありません',
        no_track: '再生中の曲がありません',
      },
      success: {
        title: '🎵 現在再生中',
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
      description: 'ループモードを設定する',
      options: {
        mode: {
          name: 'mode',
          description: 'ループモード',
          choices: {
            off: 'オフ',
            track: '現在の曲',
            queue: 'キュー全体',
          },
        },
      },
      errors: {
        no_member_info: 'ボイス情報を取得できませんでした',
        not_in_voice: 'ボイスチャンネルに参加する必要があります',
        no_player: '現在再生中の音楽はありません',
        different_voice_channel: '同じボイスチャンネルにいる必要があります',
        generic_error: 'ループ設定中にエラーが発生しました',
      },
      success: {
        title: 'ループ設定',
        description_off: 'ループを無効にしました',
        description_track: '現在の曲を繰り返し再生します',
        description_queue: 'キュー全体を繰り返し再生します',
      },
      fields: {
        changed_by: '{{username}} さんが変更しました',
      },
    },
  },
  validation: {
    min_characters: '最小 {{min}} 文字',
    max_characters: '最大 {{max}} 文字',
  },
} as const;
