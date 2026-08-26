export type AudioCue = 'ambient' | 'choice' | 'reveal' | 'complete'

/** SFX asset URLs remain absent until separately approved audio is supplied. */
export const AUDIO_MANIFEST: Readonly<Record<AudioCue, string | null>> = {
  ambient: null,
  choice: null,
  reveal: null,
  complete: null,
}
