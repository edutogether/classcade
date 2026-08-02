export type AudioChannel = 'bgm' | 'sfx'

export type AudioSettings = {
  bgmEnabled: boolean
  sfxEnabled: boolean
}

// Audio files are intentionally not connected until approved assets are supplied.
export function toggleAudioChannel(settings: AudioSettings, channel: AudioChannel): AudioSettings {
  return channel === 'bgm'
    ? { ...settings, bgmEnabled: !settings.bgmEnabled }
    : { ...settings, sfxEnabled: !settings.sfxEnabled }
}
