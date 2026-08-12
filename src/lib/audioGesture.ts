let hasAudioUserGesture = false

/** A user action is required before any audible BGM playback is attempted. */
export function noteAudioUserGesture() {
  hasAudioUserGesture = true
}

export function getHasAudioUserGesture() {
  return hasAudioUserGesture
}
