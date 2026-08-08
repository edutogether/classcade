import { PAIRING_ISSUED_CODE_STORAGE_KEY } from '../../lib/storage'
import { FirestorePairingStore } from './firestorePairingStore'

const store = new FirestorePairingStore()

export type ActivePairingCode = { code: string; expiresAt: number }

export function loadActivePairingCode(): ActivePairingCode | null {
  try {
    const value = JSON.parse(localStorage.getItem(PAIRING_ISSUED_CODE_STORAGE_KEY) ?? '{}') as Partial<ActivePairingCode>
    return typeof value.code === 'string' && typeof value.expiresAt === 'number' && value.expiresAt > Date.now() ? { code: value.code, expiresAt: value.expiresAt } : null
  } catch { return null }
}

export function saveActivePairingCode(code: string, expiresAt: number) { localStorage.setItem(PAIRING_ISSUED_CODE_STORAGE_KEY, JSON.stringify({ code, expiresAt })) }

export async function revokeActivePairingCode() {
  const active = loadActivePairingCode()
  if (!active) return 'not_active' as const
  try { const status = await store.revoke(active.code, Date.now()); localStorage.removeItem(PAIRING_ISSUED_CODE_STORAGE_KEY); return status } catch { return 'network_error' as const }
}
