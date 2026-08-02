export type AudioChannel = 'bgm' | 'sfx'

export type AudioSettings = {
  bgmEnabled: boolean
  bgmVolume: number
  sfxEnabled: boolean
}

export const DEFAULT_BGM_VOLUME = .28

export function clampBgmVolume(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : DEFAULT_BGM_VOLUME))
}

// Audio files are intentionally not connected until approved assets are supplied.
export function toggleAudioChannel(settings: AudioSettings, channel: AudioChannel): AudioSettings {
  return channel === 'bgm'
    ? { ...settings, bgmEnabled: !settings.bgmEnabled }
    : { ...settings, sfxEnabled: !settings.sfxEnabled }
}
