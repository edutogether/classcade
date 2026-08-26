import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { PROVISIONAL_NBTI_RESULTS } from '../../data/nbtiResults.provisional'
import { DEFAULT_BGM_VOLUME, clampBgmVolume } from '../../lib/audioController'
import type { JourneyStage, JourneyState } from './journeyTypes'
import { isChoiceForQuestion, isCompletedNbti } from './journeyHelpers'

export function validateJourneyState(value: unknown): JourneyState | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  const validStages: JourneyStage[] = ['nbti_start', 'nbti_question', 'nbti_result']
  // Version 3 dropped the game-builder stages/fields entirely; a v2 record with those
  // fields is invalidated here rather than partially restored.
  if (candidate.version !== 3 || !validStages.includes(candidate.stage as JourneyStage)) return null
  if (!Number.isInteger(candidate.questionIndex) || (candidate.questionIndex as number) < 0 || (candidate.questionIndex as number) >= NBTI_QUESTIONS.length) return null
  if (!candidate.answers || typeof candidate.answers !== 'object' || Array.isArray(candidate.answers)) return null
  if (candidate.resultCode !== null && typeof candidate.resultCode !== 'string') return null
  if (!candidate.audio || typeof candidate.audio !== 'object') return null
  const audio = candidate.audio as Record<string, unknown>
  if (typeof audio.bgmEnabled !== 'boolean' || typeof audio.sfxEnabled !== 'boolean') return null

  const answers = candidate.answers as Record<string, unknown>
  if (!Object.values(answers).every((answer) => typeof answer === 'string')) return null
  const stage = candidate.stage as JourneyStage
  const resultCode = candidate.resultCode as string | null
  const needsResult = stage === 'nbti_result'
  if (needsResult && (!resultCode || !PROVISIONAL_NBTI_RESULTS.some((result) => result.code === resultCode))) return null
  if (!needsResult && resultCode !== null) return null
  if (!Object.entries(answers).every(([questionId, choiceId]) => isChoiceForQuestion(questionId, choiceId as string))) return null
  if (needsResult && !isCompletedNbti(answers as Record<string, string>)) return null

  return {
    version: 3,
    stage,
    questionIndex: candidate.questionIndex as number,
    answers: answers as Record<string, string>,
    resultCode,
    audio: {
      bgmEnabled: audio.bgmEnabled as boolean,
      bgmVolume: clampBgmVolume(typeof audio.bgmVolume === 'number' ? audio.bgmVolume : DEFAULT_BGM_VOLUME),
      sfxEnabled: audio.sfxEnabled as boolean,
    },
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    resumeStage: validStages.includes(candidate.resumeStage as JourneyStage) ? candidate.resumeStage as JourneyStage : null,
  }
}
