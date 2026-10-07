import { readFileSync } from 'node:fs'
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'

let environment: RulesTestEnvironment
const projectId = 'classcade-pairing-rules-test'
type Db = ReturnType<typeof anonymous>
const anonymous = (uid: string) => environment.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore()
const session = (code: string, expiresAt = Date.now() + 4 * 60_000) => ({
  version: 1, code, payload: { version: 1, journeyId: 'journey-safe', answers: { 'unit-opening': 'unit-opening-a' }, directions: { flow: 'design' }, resultCode: 'P00', profile: { schoolLevel: 'elementary', careerRange: '1-5', region: 'seoul', growthPriorities: ['engagement'], growthPriorityOther: '' } }, createdAt: serverTimestamp(), expiresAt: Timestamp.fromMillis(expiresAt), usedAt: null, creatorUid: 'mobile', consumerUid: null, status: 'waiting',
})
const ref = (db: Db, code: string) => doc(db, 'pairingSessions', code)
const quotaRef = (db: Db, uid: string) => doc(db, 'pairingQuota', uid)

/** What the real store does: advance the caller's own quota document in the same write as the session. */
async function chargedBatch(uid: string, write: (batch: ReturnType<typeof writeBatch>, db: Db) => void) {
  const db = anonymous(uid)
  const snap = await getDoc(quotaRef(db, uid))
  const previous = snap.exists() ? (snap.data() as { windowStart: Timestamp; count: number }) : undefined
  const inWindow = !!previous && Date.now() < previous.windowStart.toMillis() + 10 * 60_000
  const batch = writeBatch(db)
  batch.set(quotaRef(db, uid), inWindow && previous ? { windowStart: previous.windowStart, count: previous.count + 1 } : { windowStart: serverTimestamp(), count: 1 })
  write(batch, db)
  return batch.commit()
}
const issue = (uid: string, code: string, expiresAt?: number) => chargedBatch(uid, (batch, db) => batch.set(ref(db, code), { ...session(code, expiresAt), creatorUid: uid }))
const revoke = (uid: string, code: string) => chargedBatch(uid, (batch, db) => batch.delete(ref(db, code)))

beforeAll(async () => { environment = await initializeTestEnvironment({ projectId, firestore: { rules: readFileSync('firestore.rules', 'utf8') } }) })
afterEach(async () => { await environment.clearFirestore() })
afterAll(async () => { await environment.cleanup() })

const emulatorReady = !!process.env.FIRESTORE_EMULATOR_HOST
// `npm run rules:test` targets only this file inside `firebase emulators:exec`; if that ever
// fails to actually start the emulator, npm_lifecycle_event still reads 'rules:test' but
// FIRESTORE_EMULATOR_HOST is unset — fail loudly instead of silently reporting 0 assertions.
const requiredButMissing = !emulatorReady && process.env.npm_lifecycle_event === 'rules:test'
const describeRules = emulatorReady ? describe : requiredButMissing ? describe : describe.skip
describeRules(requiredButMissing ? 'pairingSessions Firestore rules (emulator required)' : 'pairingSessions Firestore rules', () => {
  if (requiredButMissing) {
    it('requires FIRESTORE_EMULATOR_HOST to be set by firebase emulators:exec', () => {
      throw new Error('rules:test ran without a live Firestore emulator (FIRESTORE_EMULATOR_HOST unset) — the rules tests did not actually execute.')
    })
    return
  }
  it('denies unauthenticated creation and permits a valid anonymous creation', async () => {
    await assertFails(setDoc(doc(environment.unauthenticatedContext().firestore(), 'pairingSessions', '123456'), session('123456')))
    await assertSucceeds(issue('mobile', '123456'))
  })
  it('denies malformed codes, extra fields, direct identifiers, and long expiry', async () => {
    await assertFails(chargedBatch('mobile', (batch, db) => batch.set(ref(db, 'abc'), session('abc'))))
    await assertFails(chargedBatch('mobile', (batch, db) => batch.set(ref(db, '123456'), { ...session('123456'), email: 'blocked@example.test' })))
    await assertFails(chargedBatch('mobile', (batch, db) => batch.set(ref(db, '123457'), { ...session('123457'), payload: { ...session('123457').payload, profile: { ...session('123457').payload.profile, schoolName: 'blocked' } } })))
    await assertFails(issue('mobile', '123458', Date.now() + 6 * 60_000))
  })
  it('denies oversized string and map fields', async () => {
    const oversized = session('123459')
    await assertFails(chargedBatch('mobile', (batch, db) => batch.set(ref(db, '123459'), { ...oversized, payload: { ...oversized.payload, journeyId: 'x'.repeat(101) } })))
    await assertFails(chargedBatch('mobile', (batch, db) => batch.set(ref(db, '123459'), { ...oversized, payload: { ...oversized.payload, profile: { ...oversized.payload.profile, growthPriorityOther: 'x'.repeat(31) } } })))
  })
  it('allows exactly one unchanged payload consumption and blocks listing, mutation, and reuse', async () => {
    await assertSucceeds(issue('mobile', '123456'))
    await assertFails(getDocs(collection(anonymous('laptop-a'), 'pairingSessions')))
    await assertFails(updateDoc(ref(anonymous('attacker'), '123456'), { payload: { changed: true } }))
    await assertSucceeds(updateDoc(ref(anonymous('laptop-a'), '123456'), { status: 'connected', usedAt: serverTimestamp(), consumerUid: 'laptop-a' }))
    await assertFails(updateDoc(ref(anonymous('laptop-b'), '123456'), { status: 'connected', usedAt: serverTimestamp(), consumerUid: 'laptop-b' }))
    await assertFails(getDoc(ref(anonymous('laptop-b'), '123456')))
  })
  it('denies expired reads and consumption', async () => {
    await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'pairingSessions', '123456'), { ...session('123456', Date.now() - 1), createdAt: Timestamp.now() }))
    await assertFails(getDoc(ref(anonymous('laptop'), '123456')))
    await assertFails(updateDoc(ref(anonymous('laptop'), '123456'), { status: 'connected', usedAt: serverTimestamp(), consumerUid: 'laptop' }))
  })
  it('allows only a creator to delete a still-waiting code and blocks consumed code deletion', async () => {
    await assertSucceeds(issue('mobile', '123456'))
    await assertFails(revoke('other', '123456'))
    await assertSucceeds(revoke('mobile', '123456'))
    await assertSucceeds(issue('mobile', '123457'))
    await assertSucceeds(updateDoc(ref(anonymous('laptop'), '123457'), { status: 'connected', usedAt: serverTimestamp(), consumerUid: 'laptop' }))
    await assertFails(revoke('mobile', '123457'))
  })

  describe('create/delete budget (per-user quota)', () => {
    it("refuses a create or delete that is not charged to the caller's quota", async () => {
      await assertFails(setDoc(ref(anonymous('mobile'), '123456'), session('123456')))
      await assertSucceeds(issue('mobile', '123456'))
      await assertFails(deleteDoc(ref(anonymous('mobile'), '123456')))
      await assertSucceeds(revoke('mobile', '123456'))
    })
    it('lets a whole class of 30 phones each issue a code at the same time', async () => {
      const students = Array.from({ length: 30 }, (_, index) => `student-${index}`)
      await Promise.all(students.map((uid, index) => assertSucceeds(issue(uid, String(100000 + index)))))
    })
    it('allows 20 operations in a window per user and refuses the 21st, but not other users', async () => {
      for (let step = 0; step < 10; step += 1) {
        await assertSucceeds(issue('busy', String(200000 + step)))
        await assertSucceeds(revoke('busy', String(200000 + step)))
      }
      await assertFails(issue('busy', '299999'))
      await assertSucceeds(issue('someone-else', '299998'))
    })
    it('starts a fresh window once the old one has expired', async () => {
      await environment.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), 'pairingQuota', 'busy'), { windowStart: Timestamp.fromMillis(Date.now() - 11 * 60_000), count: 20 }))
      await assertSucceeds(issue('busy', '300000'))
    })
    it('cannot be reset, rewound, borrowed from, or deleted by the client', async () => {
      await assertSucceeds(issue('mobile', '123456'))
      const db = anonymous('mobile')
      await assertFails(setDoc(quotaRef(db, 'mobile'), { windowStart: serverTimestamp(), count: 1 }))
      await assertFails(updateDoc(quotaRef(db, 'mobile'), { count: 0 }))
      await assertFails(deleteDoc(quotaRef(db, 'mobile')))
      await assertFails(setDoc(quotaRef(db, 'victim'), { windowStart: serverTimestamp(), count: 1 }))
      await assertFails(getDoc(quotaRef(anonymous('attacker'), 'mobile')))
    })
  })
})
