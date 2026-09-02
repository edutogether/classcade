import { describe, it, expect, beforeEach, vi } from 'vitest'

/* Each test gets a fresh module instance: audioSceneThemes and audioGesture both keep
   module-level state (the players Map, the current theme, the gesture flag) that must
   not leak between assertions. */
beforeEach(() => {
  vi.resetModules()
  document.body.innerHTML = ''
})

async function freshModules() {
  const gesture = await import('./audioGesture')
  const themes = await import('./audioSceneThemes')
  return { gesture, themes }
}

describe('audioSceneThemes gating', () => {
  it('queues playback instead of starting it before any user gesture has occurred', async () => {
    const { themes } = await freshModules()
    themes.playSceneTheme('prep', true, 1)
    // No gesture yet: the theme must not be marked current, and no <audio> should have
    // started — the browser would refuse to play it anyway.
    expect(themes.currentSceneTheme()).toBeNull()
  })

  it('starts the requested theme once a user gesture is recorded', async () => {
    const { gesture, themes } = await freshModules()
    gesture.noteAudioUserGesture()
    themes.playSceneTheme('prep', true, 1)
    expect(themes.currentSceneTheme()).toBe('prep')
  })

  it('clears the current theme when asked to stop everything', async () => {
    const { gesture, themes } = await freshModules()
    gesture.noteAudioUserGesture()
    themes.playSceneTheme('main', true, 1)
    expect(themes.currentSceneTheme()).toBe('main')

    themes.playSceneTheme(null, true, 1)
    expect(themes.currentSceneTheme()).toBeNull()
  })

  it('treats enabled=false the same as an explicit stop', async () => {
    const { gesture, themes } = await freshModules()
    gesture.noteAudioUserGesture()
    themes.playSceneTheme('question', true, 1)
    expect(themes.currentSceneTheme()).toBe('question')

    themes.playSceneTheme('question', false, 1)
    expect(themes.currentSceneTheme()).toBeNull()
  })

  it('switches the current theme when a different one is requested', async () => {
    const { gesture, themes } = await freshModules()
    gesture.noteAudioUserGesture()
    themes.playSceneTheme('prep', true, 1)
    themes.playSceneTheme('result', true, 1)
    expect(themes.currentSceneTheme()).toBe('result')
  })
})
