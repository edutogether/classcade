export type AudioCue = 'ambient' | 'choice' | 'reveal' | 'complete'

/** Asset URLs intentionally remain absent until approved audio is supplied. */
export const AUDIO_MANIFEST: Readonly<Record<AudioCue, string | null>> = {
  ambient: null,
  choice: null,
  reveal: null,
  complete: null,
}
