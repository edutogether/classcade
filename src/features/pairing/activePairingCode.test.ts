import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PAIRING_GATE_OPEN_STORAGE_KEY, PAIRING_ISSUED_CODE_STORAGE_KEY, clearActiveSession } from '../../lib/storage'
import { loadActivePairingCode, saveActivePairingCode } from './activePairingCode'

vi.mock('./firestorePairingStore', () => ({ FirestorePairingStore: class { async revoke() { return 'revoked' } } }))

const future = () => Date.now() + 4 * 60_000
const goTo = (search: string) => window.history.pushState({}, '', `/${search}`)

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); goTo('') })
afterEach(() => goTo(''))

describe('issued pairing code storage follows the device mode', () => {
  it('on a shared device (default) stays in this tab only — the next participant on the machine does not inherit it', () => {
    saveActivePairingCode('123456', future())
    expect(sessionStorage.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY)).not.toBeNull()
    expect(localStorage.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY)).toBeNull()
    expect(loadActivePairingCode()?.code).toBe('123456')
    // A different browser tab/window starts with an empty sessionStorage.
    sessionStorage.clear()
    expect(loadActivePairingCode()).toBeNull()
  })

  it('on a personal device (?device=personal) persists as before', () => {
    goTo('?device=personal')
    saveActivePairingCode('654321', future())
    expect(localStorage.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY)).not.toBeNull()
    expect(sessionStorage.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY)).toBeNull()
    expect(loadActivePairingCode()?.code).toBe('654321')
  })

  it('is removed, together with the open-pairing-screen flag, when the journey is reset', () => {
    saveActivePairingCode('123456', future())
    sessionStorage.setItem(PAIRING_GATE_OPEN_STORAGE_KEY, 'true')
    clearActiveSession('shared')
    expect(loadActivePairingCode()).toBeNull()
    expect(sessionStorage.getItem(PAIRING_GATE_OPEN_STORAGE_KEY)).toBeNull()
  })

  it('personal-device reset clears the persistent copies too', () => {
    goTo('?device=personal')
    saveActivePairingCode('654321', future())
    localStorage.setItem(PAIRING_GATE_OPEN_STORAGE_KEY, 'true')
    clearActiveSession('personal')
    expect(localStorage.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(PAIRING_GATE_OPEN_STORAGE_KEY)).toBeNull()
  })
})
