import { Timestamp, doc, onSnapshot, runTransaction, serverTimestamp, type Unsubscribe } from 'firebase/firestore'
import { ensureAnonymousFirebaseUser, firebaseRuntime } from '../../lib/firebase'
import type { PairingRecord, PairingStore } from './pairingContract'

type FirestorePairingDocument = Omit<PairingRecord, 'createdAt' | 'expiresAt' | 'usedAt'> & { createdAt: Timestamp; expiresAt: Timestamp; usedAt: Timestamp | null; creatorUid: string; consumerUid: string | null; status: 'waiting' | 'connected' }
function toRecord(value: FirestorePairingDocument): PairingRecord { return { version: 1, code: value.code, payload: value.payload, createdAt: value.createdAt.toMillis(), expiresAt: value.expiresAt.toMillis(), usedAt: value.usedAt?.toMillis() ?? null } }

/** Per-user budget for session create/delete (mirrors `pairingQuota` in firestore.rules): the rules
 *  reject a create/delete unless the caller's quota document is advanced in the same write. */
const QUOTA_WINDOW_MS = 10 * 60_000
type QuotaDoc = { windowStart: Timestamp; count: number }
function isPermissionDenied(error: unknown) { return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'permission-denied' }
function nextQuota(previous: QuotaDoc | undefined, now: number, startNewWindow: boolean) {
  const inWindow = !!previous && typeof previous.windowStart?.toMillis === 'function' && now < previous.windowStart.toMillis() + QUOTA_WINDOW_MS
  const continueWindow = startNewWindow ? !inWindow : inWindow
  return continueWindow && previous ? { windowStart: previous.windowStart, count: previous.count + 1 } : { windowStart: serverTimestamp(), count: 1 }
}
/** The browser clock can disagree with the server's about whether the window has expired; the rules
 *  decide with server time. If the guess is rejected, retry once with the opposite reading. */
async function withQuotaRetry<T>(run: (flipWindowGuess: boolean) => Promise<T>): Promise<T> {
  try { return await run(false) } catch (error) {
    if (!isPermissionDenied(error)) throw error
    return run(true)
  }
}

/** Document id is the six-digit code. Rules allow direct get only; collection listing is denied. */
export class FirestorePairingStore implements PairingStore {
  private ref(code: string) { return doc(firebaseRuntime().db, 'pairingSessions', code) }
  private quotaRef(uid: string) { return doc(firebaseRuntime().db, 'pairingQuota', uid) }
  async create(record: PairingRecord): Promise<'created' | 'collision'> {
    const user = await ensureAnonymousFirebaseUser()
    const ref = this.ref(record.code)
    try {
      const quotaRef = this.quotaRef(user.uid)
      await withQuotaRetry((flip) => runTransaction(firebaseRuntime().db, async (transaction) => {
        if ((await transaction.get(ref)).exists()) throw new Error('pairing_collision')
        const quota = await transaction.get(quotaRef)
        transaction.set(quotaRef, nextQuota(quota.exists() ? (quota.data() as QuotaDoc) : undefined, Date.now(), flip))
        transaction.set(ref, { ...record, createdAt: serverTimestamp(), expiresAt: Timestamp.fromMillis(record.expiresAt), usedAt: null, creatorUid: user.uid, consumerUid: null, status: 'waiting' })
      }))
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
    const quotaRef = this.quotaRef(user.uid)
    return withQuotaRetry((flip) => runTransaction(firebaseRuntime().db, async (transaction) => {
      const snapshot = await transaction.get(ref)
      if (!snapshot.exists()) return 'not_active' as const
      const value = snapshot.data() as FirestorePairingDocument
      if (value.creatorUid !== user.uid || value.status !== 'waiting' || value.usedAt || value.expiresAt.toMillis() <= now) return 'not_active' as const
      const quota = await transaction.get(quotaRef)
      transaction.set(quotaRef, nextQuota(quota.exists() ? (quota.data() as QuotaDoc) : undefined, Date.now(), flip))
      transaction.delete(ref)
      return 'revoked' as const
    }))
  }
}

/** Registration itself can throw synchronously (e.g. `firebaseRuntime()` before init) —
 *  routed through `onError` here rather than left for the caller to catch, so a caller's
 *  effect only ever needs the "setState inside a callback" shape and never a synchronous
 *  try/catch (which react-hooks/set-state-in-effect flags). */
export function watchPairing(code: string, callback: (status: 'waiting' | 'connected' | 'expired') => void, onError: () => void): Unsubscribe {
  try {
    return onSnapshot(doc(firebaseRuntime().db, 'pairingSessions', code), (snapshot) => {
      if (!snapshot.exists()) { callback('expired'); return }
      const value = snapshot.data() as FirestorePairingDocument
      callback(value.expiresAt.toMillis() <= Date.now() ? 'expired' : value.status)
    }, onError)
  } catch {
    onError()
    return () => {}
  }
}
