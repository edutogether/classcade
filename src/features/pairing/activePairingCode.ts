import { PAIRING_ISSUED_CODE_STORAGE_KEY, getStorageBackend, resolveDeviceMode } from '../../lib/storage'
import { FirestorePairingStore } from './firestorePairingStore'

const store = new FirestorePairingStore()

export type ActivePairingCode = { code: string; expiresAt: number }

/** The issued code lives in the same per-device-mode store as the rest of the journey (a shared
 *  device keeps it per tab; a personal one persists) — never in a browser-wide store that the
 *  next participant on the same machine would inherit and that "reset" could not reach. */
const backend = () => getStorageBackend(resolveDeviceMode())

export function loadActivePairingCode(): ActivePairingCode | null {
  try {
    const value = JSON.parse(backend()?.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY) ?? '{}') as Partial<ActivePairingCode>
    return typeof value.code === 'string' && typeof value.expiresAt === 'number' && value.expiresAt > Date.now() ? { code: value.code, expiresAt: value.expiresAt } : null
  } catch { return null }
}

export function saveActivePairingCode(code: string, expiresAt: number) { backend()?.setItem(PAIRING_ISSUED_CODE_STORAGE_KEY, JSON.stringify({ code, expiresAt })) }

export async function revokeActivePairingCode() {
  const active = loadActivePairingCode()
  if (!active) return 'not_active' as const
  try { const status = await store.revoke(active.code, Date.now()); backend()?.removeItem(PAIRING_ISSUED_CODE_STORAGE_KEY); return status } catch { return 'network_error' as const }
}
