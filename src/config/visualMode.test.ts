import { describe, it, expect, beforeEach, vi } from 'vitest'

/* visualMode resolves the ?art override ONCE at module load (the mode must not change
   midway through a render pass), so every case needs a fresh module instance. */
async function loadWith(search: string) {
  vi.resetModules()
  window.history.replaceState({}, '', `/${search}`)
  return import('./visualMode')
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('visualMode', () => {
  it('ships every screen flat by default', async () => {
    const { visualModeSnapshot } = await loadWith('')
    expect(Object.values(visualModeSnapshot()).every((mode) => mode === 'flat')).toBe(true)
  })

  it('flips every screen to art on a bare ?art flag', async () => {
    const { visualModeSnapshot, isArt } = await loadWith('?art')
    expect(Object.values(visualModeSnapshot()).every((mode) => mode === 'art')).toBe(true)
    expect(isArt('prep1')).toBe(true)
  })

  it('accepts ?art=1 as well as the bare flag', async () => {
    const { isArt } = await loadWith('?art=1')
    expect(isArt('prep1')).toBe(true)
  })

  /* The preview has to survive the pairing flow's history.replaceState (which strips the
     query mid-run) and refreshes — hence the stored flag rather than re-reading the URL. */
  it('remembers a previous ?art preview after the query string is gone', async () => {
    await loadWith('?art')
    const { isArt } = await loadWith('')
    expect(isArt('prep1')).toBe(true)
  })

  it('stores the preview in sessionStorage, not localStorage, so it cannot outlive the tab', async () => {
    await loadWith('?art')
    expect(window.sessionStorage.length).toBe(1)
    expect(window.localStorage.length).toBe(0)
  })

  it('falls back to the shipped defaults when storage access throws', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    try {
      const { isFlat } = await loadWith('')
      expect(isFlat('prep1')).toBe(true)
    } finally {
      getItem.mockRestore()
    }
  })

  it('degrades a screen whose art failed to load back to flat for the rest of the session', async () => {
    const { isArt, isFlat, degradeToFlat } = await loadWith('?art')
    expect(isArt('prep2')).toBe(true)

    degradeToFlat('prep2')

    expect(isFlat('prep2')).toBe(true)
    // Only the failed screen degrades; the others keep their art.
    expect(isArt('prep1')).toBe(true)
  })

  it('announces a degraded screen once so the booth can react, and not again on repeat calls', async () => {
    const { degradeToFlat } = await loadWith('?art')
    const listener = vi.fn()
    window.addEventListener('classcade:visual-degraded', listener)
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    degradeToFlat('nickname')
    degradeToFlat('nickname')

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener('classcade:visual-degraded', listener)
  })
})
