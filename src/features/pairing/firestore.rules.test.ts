import { readFileSync } from 'node:fs'
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } from 'firebase/firestore'

let environment: RulesTestEnvironment
const projectId = 'classcade-pairing-rules-test'
const anonymous = (uid: string) => environment.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore()
const session = (code: string, expiresAt = Date.now() + 4 * 60_000) => ({
  version: 1, code, payload: { version: 1, journeyId: 'journey-safe', answers: { 'unit-opening': 'unit-opening-a' }, directions: { flow: 'design' }, resultCode: 'P00', profile: { schoolLevel: 'elementary', careerRange: '1-5', region: 'seoul', growthPriorities: ['engagement'], growthPriorityOther: '' } }, createdAt: serverTimestamp(), expiresAt: Timestamp.fromMillis(expiresAt), usedAt: null, creatorUid: 'mobile', consumerUid: null, status: 'waiting',
})
const ref = (db: ReturnType<typeof anonymous>, code: string) => doc(db, 'pairingSessions', code)

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
    await assertSucceeds(setDoc(ref(anonymous('mobile'), '123456'), session('123456')))
  })
  it('denies malformed codes, extra fields, direct identifiers, and long expiry', async () => {
    await assertFails(setDoc(ref(anonymous('mobile'), 'abc'), session('abc')))
    await assertFails(setDoc(ref(anonymous('mobile'), '123456'), { ...session('123456'), email: 'blocked@example.test' }))
    await assertFails(setDoc(ref(anonymous('mobile'), '123457'), { ...session('123457'), payload: { ...session('123457').payload, profile: { ...session('123457').payload.profile, schoolName: 'blocked' } } }))
    await assertFails(setDoc(ref(anonymous('mobile'), '123458'), session('123458', Date.now() + 6 * 60_000)))
  })
  it('denies oversized string and map fields', async () => {
    const oversized = session('123459')
    await assertFails(setDoc(ref(anonymous('mobile'), '123459'), { ...oversized, payload: { ...oversized.payload, journeyId: 'x'.repeat(101) } }))
    await assertFails(setDoc(ref(anonymous('mobile'), '123459'), { ...oversized, payload: { ...oversized.payload, profile: { ...oversized.payload.profile, growthPriorityOther: 'x'.repeat(31) } } }))
  })
  it('allows exactly one unchanged payload consumption and blocks listing, mutation, and reuse', async () => {
    await assertSucceeds(setDoc(ref(anonymous('mobile'), '123456'), session('123456')))
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
    await assertSucceeds(setDoc(ref(anonymous('mobile'), '123456'), session('123456')))
    await assertFails(deleteDoc(ref(anonymous('other'), '123456')))
    await assertSucceeds(deleteDoc(ref(anonymous('mobile'), '123456')))
    await assertSucceeds(setDoc(ref(anonymous('mobile'), '123457'), session('123457')))
    await assertSucceeds(updateDoc(ref(anonymous('laptop'), '123457'), { status: 'connected', usedAt: serverTimestamp(), consumerUid: 'laptop' }))
    await assertFails(deleteDoc(ref(anonymous('mobile'), '123457')))
  })
})
