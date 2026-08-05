import { NBTI_AXES, type NbtiDirection } from '../../data/nbti.provisional'
import { scoreNbtiAnswers } from '../../data/nbtiScoring.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import type { AudioSettings } from '../../lib/audioController'
import type { JourneyState } from '../journey/journeyState'
import type { Profile } from '../../lib/storage'

export const PAIRING_SCHEMA_VERSION = 1
export const PAIRING_TTL_MS = 5 * 60 * 1000
export type PairingStatus = 'issuing' | 'waiting' | 'checking' | 'connected' | 'expired' | 'used' | 'invalid' | 'network_error' | 'reissue_ready'
export type PairingProfile = Pick<Profile, 'schoolLevel' | 'careerRange' | 'region' | 'growthPriorityOther'> & { growthPriorities: readonly Profile['growthPriorities'][number][] }
export type PairingPayload = { version: 1; journeyId: string; answers: Record<string, string>; directions: Record<string, NbtiDirection>; resultCode: string; profile: PairingProfile }
export type PairingRecord = { version: 1; code: string; payload: PairingPayload; createdAt: number; expiresAt: number; usedAt: number | null }
export type PairingStore = { create(record: PairingRecord): Promise<'created' | 'collision'>; consume(code: string, now: number): Promise<{ status: 'connected'; record: PairingRecord } | { status: 'invalid' | 'expired' | 'used' }>; revoke(code: string): Promise<void> }

export function createPairingPayload(state: JourneyState, profile: Profile, journeyId: string): PairingPayload {
  if (!state.resultCode) throw new Error('NBTI result is required for pairing')
  const scores = scoreNbtiAnswers(state.answers)
  const directions = Object.fromEntries(NBTI_AXES.map((axis) => [axis.id, axis.directions[scores[axis.id].direction]])) as Record<string, NbtiDirection>
  return { version: 1, journeyId, answers: { ...state.answers }, directions, resultCode: state.resultCode, profile: { schoolLevel: profile.schoolLevel, careerRange: profile.careerRange, region: profile.region, growthPriorities: [...profile.growthPriorities], growthPriorityOther: profile.growthPriorityOther } }
}
export function restorePairingJourney(payload: PairingPayload, audio: AudioSettings): JourneyState {
  return { version: 2, stage: 'nbti_result', questionIndex: 15, answers: { ...payload.answers }, resultCode: payload.resultCode, gameVariantId: getGameVariantForResult(payload.resultCode).id, gameStep: 0, gameChoices: {}, shakeProgress: 0, audio, updatedAt: new Date().toISOString(), completedAt: null, gameConditions: null, gameConcept: null, selectedGameId: null, gameAdjustments: {}, completion: { recommendationTags: [], recommendedVideoIds: [], shareCardFormat: null, shareCardGenerated: false, lastCompletedStep: null } }
}
export function sixDigitCode(random: () => number = Math.random) { return String(Math.floor(random() * 1_000_000)).padStart(6, '0') }
export async function issuePairingCode(store: PairingStore, payload: PairingPayload, now = Date.now(), random: () => number = Math.random) { for (let attempt = 0; attempt < 8; attempt += 1) { const code = sixDigitCode(random); const record: PairingRecord = { version: 1, code, payload, createdAt: now, expiresAt: now + PAIRING_TTL_MS, usedAt: null }; if (await store.create(record) === 'created') return record } throw new Error('pairing_code_collision_limit') }
export class MemoryPairingStore implements PairingStore { private readonly records = new Map<string, PairingRecord>(); async create(record: PairingRecord) { if (this.records.has(record.code)) return 'collision' as const; this.records.set(record.code, record); return 'created' as const } async consume(code: string, now: number) { const record = this.records.get(code); if (!record) return { status: 'invalid' as const }; if (record.expiresAt <= now) return { status: 'expired' as const }; if (record.usedAt) return { status: 'used' as const }; const consumed = { ...record, usedAt: now }; this.records.set(code, consumed); return { status: 'connected' as const, record: consumed } } async revoke(code: string) { this.records.delete(code) } }
/** No Firebase project/config exists. This prevents UI from claiming a local-only code is cross-device. */
export class UnavailablePairingStore implements PairingStore { async create(record: PairingRecord): Promise<'created' | 'collision'> { void record; throw new Error('pairing_backend_unconfigured') } async consume(code: string, now: number): Promise<{ status: 'connected'; record: PairingRecord } | { status: 'invalid' | 'expired' | 'used' }> { void code; void now; throw new Error('pairing_backend_unconfigured') } async revoke(code: string) { void code } }
