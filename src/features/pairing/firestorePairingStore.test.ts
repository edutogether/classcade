import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runTransaction } from 'firebase/firestore'
import { FirestorePairingStore, watchPairing } from './firestorePairingStore'
import { ensureAnonymousFirebaseUser } from '../../lib/firebase'
import type { PairingPayload, PairingRecord } from './pairingContract'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, collection: string, id: string) => ({ collection, id })),
  onSnapshot: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: { fromMillis: vi.fn((ms: number) => ({ toMillis: () => ms })) },
}))

vi.mock('../../lib/firebase', () => ({
  ensureAnonymousFirebaseUser: vi.fn(async () => ({ uid: 'creator-uid' })),
  firebaseRuntime: vi.fn(() => ({ db: {} })),
}))

const payload: PairingPayload = {
  version: 1,
  journeyId: 'journey-1',
  answers: { q1: 'a' },
  directions: {},
  resultCode: 'P00',
  profile: { schoolLevel: 'elementary', careerRange: '1-5', region: 'seoul', growthPriorities: [], growthPriorityOther: '' },
}
const record: PairingRecord = { version: 1, code: '123456', payload, createdAt: 1000, expiresAt: 1000 + 5 * 60_000, usedAt: null }

const mockRunTransaction = vi.mocked(runTransaction)
const mockEnsureUser = vi.mocked(ensureAnonymousFirebaseUser)

function fakeTransaction(getResult: { exists: () => boolean; data?: () => unknown }) {
  return { get: vi.fn(async () => getResult), set: vi.fn(), update: vi.fn(), delete: vi.fn() }
}

beforeEach(() => {
  mockRunTransaction.mockReset()
  mockEnsureUser.mockClear()
})

describe('FirestorePairingStore.create', () => {
  it('returns created when the transaction succeeds', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({ exists: () => false })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.create(record)).resolves.toBe('created')
  })

  it('returns collision when the code already exists', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({ exists: () => true })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.create(record)).resolves.toBe('collision')
  })

  it('rethrows an unrelated transaction failure', async () => {
    mockRunTransaction.mockRejectedValue(new Error('network down'))
    const store = new FirestorePairingStore()
    await expect(store.create(record)).rejects.toThrow('network down')
  })
})

describe('FirestorePairingStore.consume', () => {
  it('returns invalid when the document does not exist', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({ exists: () => false })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.consume('123456', 2000)).resolves.toEqual({ status: 'invalid' })
  })

  it('returns expired when past expiresAt', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({
        exists: () => true,
        data: () => ({ ...record, expiresAt: { toMillis: () => 1000 }, status: 'waiting', usedAt: null }),
      })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.consume('123456', 999_999)).resolves.toEqual({ status: 'expired' })
  })

  it('returns used when already consumed', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({
        exists: () => true,
        data: () => ({ ...record, expiresAt: { toMillis: () => 999_999_999 }, status: 'connected', usedAt: { toMillis: () => 1500 } }),
      })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.consume('123456', 2000)).resolves.toEqual({ status: 'used' })
  })

  it('maps a permission-denied error to used (a consumed doc becomes unreadable by rule design)', async () => {
    mockRunTransaction.mockRejectedValue({ code: 'permission-denied' })
    const store = new FirestorePairingStore()
    await expect(store.consume('123456', 2000)).resolves.toEqual({ status: 'used' })
  })

  it('rethrows a non-permission-denied failure', async () => {
    mockRunTransaction.mockRejectedValue(new Error('network down'))
    const store = new FirestorePairingStore()
    await expect(store.consume('123456', 2000)).rejects.toThrow('network down')
  })

  it('connects and returns the converted record on a valid waiting code', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({
        exists: () => true,
        data: () => ({ ...record, createdAt: { toMillis: () => 1000 }, expiresAt: { toMillis: () => 999_999_999 }, status: 'waiting', usedAt: null }),
      })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    const result = await store.consume('123456', 2000)
    expect(result.status).toBe('connected')
    if (result.status === 'connected') {
      expect(result.record.code).toBe('123456')
      expect(result.record.payload).toEqual(payload)
    }
  })
})

describe('FirestorePairingStore.revoke', () => {
  it('returns not_active when the document does not exist', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({ exists: () => false })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.revoke('123456', 2000)).resolves.toBe('not_active')
  })

  it('returns not_active for a code owned by someone else', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({
        exists: () => true,
        data: () => ({ creatorUid: 'someone-else', status: 'waiting', usedAt: null, expiresAt: { toMillis: () => 999_999_999 } }),
      })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.revoke('123456', 2000)).resolves.toBe('not_active')
  })

  it('revokes a still-waiting code owned by the caller', async () => {
    mockRunTransaction.mockImplementation(async (_db, updateFn) => {
      const tx = fakeTransaction({
        exists: () => true,
        data: () => ({ creatorUid: 'creator-uid', status: 'waiting', usedAt: null, expiresAt: { toMillis: () => 999_999_999 } }),
      })
      return updateFn(tx as never)
    })
    const store = new FirestorePairingStore()
    await expect(store.revoke('123456', 2000)).resolves.toBe('revoked')
  })
})

describe('watchPairing', () => {
  it('reports expired when the document is missing', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    const mockOnSnapshot = vi.mocked(onSnapshot)
    const callback = vi.fn()
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      ;(onNext as (snap: unknown) => void)({ exists: () => false })
      return vi.fn()
    })
    watchPairing('123456', callback, vi.fn())
    expect(callback).toHaveBeenCalledWith('expired')
  })

  it('reports the live status when the document exists and has not expired', async () => {
    const { onSnapshot } = await import('firebase/firestore')
    const mockOnSnapshot = vi.mocked(onSnapshot)
    const callback = vi.fn()
    mockOnSnapshot.mockImplementation((_ref, onNext) => {
      ;(onNext as (snap: unknown) => void)({
        exists: () => true,
        data: () => ({ status: 'connected', expiresAt: { toMillis: () => Date.now() + 60_000 } }),
      })
      return vi.fn()
    })
    watchPairing('123456', callback, vi.fn())
    expect(callback).toHaveBeenCalledWith('connected')
  })
})
