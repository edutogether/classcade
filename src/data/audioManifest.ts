import mainThemeMp3 from '../assets/audio/classcade-main-theme-loop.mp3'
import mainThemeOgg from '../assets/audio/classcade-main-theme-loop.ogg'

export type AudioCue = 'ambient' | 'choice' | 'reveal' | 'complete'
export type BgmTrack = 'mainTheme'

export type BgmSources = Readonly<{
  ogg: string
  mp3: string
}>

/** SFX asset URLs remain absent until separately approved audio is supplied. */
export const AUDIO_MANIFEST: Readonly<Record<AudioCue, string | null>> = {
  ambient: null,
  choice: null,
  reveal: null,
  complete: null,
}

/** Main tracks use native source fallback: OGG is preferred, then MP3. */
export const BGM_MANIFEST: Readonly<Record<BgmTrack, BgmSources>> = {
  mainTheme: { ogg: mainThemeOgg, mp3: mainThemeMp3 },
}
