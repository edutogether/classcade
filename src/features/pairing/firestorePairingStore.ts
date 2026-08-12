import { Timestamp, doc, onSnapshot, runTransaction, serverTimestamp, type Unsubscribe } from 'firebase/firestore'
import { ensureAnonymousFirebaseUser, firebaseRuntime } from '../../lib/firebase'
import type { PairingRecord, PairingStore } from './pairingContract'

type FirestorePairingDocument = Omit<PairingRecord, 'createdAt' | 'expiresAt' | 'usedAt'> & { createdAt: Timestamp; expiresAt: Timestamp; usedAt: Timestamp | null; creatorUid: string; consumerUid: string | null; status: 'waiting' | 'connected' }
function toRecord(value: FirestorePairingDocument): PairingRecord { return { version: 1, code: value.code, payload: value.payload, createdAt: value.createdAt.toMillis(), expiresAt: value.expiresAt.toMillis(), usedAt: value.usedAt?.toMillis() ?? null } }

/** Document id is the six-digit code. Rules allow direct get only; collection listing is denied. */
export class FirestorePairingStore implements PairingStore {
  private ref(code: string) { return doc(firebaseRuntime().db, 'pairingSessions', code) }
  async create(record: PairingRecord): Promise<'created' | 'collision'> {
    const user = await ensureAnonymousFirebaseUser()
    const ref = this.ref(record.code)
    try {
      await runTransaction(firebaseRuntime().db, async (transaction) => {
        if ((await transaction.get(ref)).exists()) throw new Error('pairing_collision')
        transaction.set(ref, { ...record, createdAt: serverTimestamp(), expiresAt: Timestamp.fromMillis(record.expiresAt), usedAt: null, creatorUid: user.uid, consumerUid: null, status: 'waiting' })
      })
      return 'created'
    } catch (error) {
      if (error instanceof Error && error.message === 'pairing_collision') return 'collision'
      throw error
    }
  }
  async consume(code: string, now: number) {
    const user = await ensureAnonymousFirebaseUser()
    const ref = this.ref(code)
    try {
      return await runTransaction(firebaseRuntime().db, async (transaction) => {
        const snapshot = await transaction.get(ref)
        if (!snapshot.exists()) return { status: 'invalid' as const }
        const value = snapshot.data() as FirestorePairingDocument
        if (value.expiresAt.toMillis() <= now) return { status: 'expired' as const }
        if (value.status !== 'waiting' || value.usedAt) return { status: 'used' as const }
        const usedAt = Timestamp.fromMillis(now)
        transaction.update(ref, { status: 'connected', usedAt: serverTimestamp(), consumerUid: user.uid })
        return { status: 'connected' as const, record: toRecord({ ...value, status: 'connected', usedAt, consumerUid: user.uid }) }
      })
    } catch (error) {
      // A consumed/expired document is intentionally unreadable to another anonymous browser.
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'permission-denied') return { status: 'used' as const }
      throw error
    }
  }
  async revoke(code: string, now: number): Promise<'revoked' | 'not_active'> {
    const user = await ensureAnonymousFirebaseUser()
    const ref = this.ref(code)
    return runTransaction(firebaseRuntime().db, async (transaction) => {
      const snapshot = await transaction.get(ref)
      if (!snapshot.exists()) return 'not_active' as const
      const value = snapshot.data() as FirestorePairingDocument
      if (value.creatorUid !== user.uid || value.status !== 'waiting' || value.usedAt || value.expiresAt.toMillis() <= now) return 'not_active' as const
      transaction.delete(ref)
      return 'revoked' as const
    })
  }
}

export function watchPairing(code: string, callback: (status: 'waiting' | 'connected' | 'expired') => void, onError: () => void): Unsubscribe {
  return onSnapshot(doc(firebaseRuntime().db, 'pairingSessions', code), (snapshot) => {
    if (!snapshot.exists()) { callback('expired'); return }
    const value = snapshot.data() as FirestorePairingDocument
    callback(value.expiresAt.toMillis() <= Date.now() ? 'expired' : value.status)
  }, onError)
}
