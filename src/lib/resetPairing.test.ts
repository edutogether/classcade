import { describe, expect, it, vi } from 'vitest'
import { revokePairingIfPresent } from './resetPairing'

describe('mobile restart pairing cleanup', () => {
  it('does not load Firebase when the active storage has no pairing code', async () => {
    const load = vi.fn()
    const backend = { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() }
    await expect(revokePairingIfPresent(backend, load)).resolves.toBe('not_active')
    expect(load).not.toHaveBeenCalled()
  })

  it('keeps the existing revocation path when a code is stored', async () => {
    const revoke = vi.fn().mockResolvedValue('revoked')
    const load = vi.fn().mockResolvedValue({ revokeActivePairingCode: revoke })
    const backend = { getItem: () => '{"code":"123456"}', setItem: vi.fn(), removeItem: vi.fn() }
    await expect(revokePairingIfPresent(backend, load)).resolves.toBe('revoked')
    expect(revoke).toHaveBeenCalledOnce()
  })

  it.each(['unavailable', 'throws'])('uses the existing path when storage is %s', async (mode) => {
    const load = vi.fn().mockResolvedValue({ revokeActivePairingCode: vi.fn().mockResolvedValue('not_active') })
    const backend = mode === 'unavailable' ? null : { getItem: () => { throw new Error('blocked') }, setItem: vi.fn(), removeItem: vi.fn() }
    await expect(revokePairingIfPresent(backend, load)).resolves.toBe('not_active')
    expect(load).toHaveBeenCalledOnce()
  })

  it('preserves network failure so the restart can be stopped', async () => {
    const load = vi.fn().mockResolvedValue({ revokeActivePairingCode: vi.fn().mockResolvedValue('network_error') })
    const backend = { getItem: () => 'stored', setItem: vi.fn(), removeItem: vi.fn() }
    await expect(revokePairingIfPresent(backend, load)).resolves.toBe('network_error')
  })
})
