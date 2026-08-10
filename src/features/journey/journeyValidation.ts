import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import { PROVISIONAL_NBTI_RESULTS } from '../../data/nbtiResults.provisional'
import { DEFAULT_BGM_VOLUME, clampBgmVolume } from '../../lib/audioController'
import { isGameConditions, isGameComboSelection, decodeGameComboId, type GameComboSelection } from '../../data/classroomGameBuilder'
import type { JourneyStage, JourneyState } from './journeyTypes'
import { isChoiceForQuestion, isCompletedNbti, isGameAdjustments, isCompletionState } from './journeyHelpers'

export function validateJourneyState(value: unknown): JourneyState | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  const validStages: JourneyStage[] = ['nbti_start', 'nbti_question', 'nbti_result', 'game_intro', 'game_conditions', 'game_concepts', 'game_candidates', 'game_adjust', 'game_choice', 'game_shake', 'game_complete', 'sharing']
  // Version 2 invalidates the former eight-question answer set before restoration.
  if (candidate.version !== 2 || !validStages.includes(candidate.stage as JourneyStage)) return null
  if (!Number.isInteger(candidate.questionIndex) || (candidate.questionIndex as number) < 0 || (candidate.questionIndex as number) >= NBTI_QUESTIONS.length) return null
  if (!candidate.answers || typeof candidate.answers !== 'object' || Array.isArray(candidate.answers)) return null
  if (!candidate.gameChoices || typeof candidate.gameChoices !== 'object' || Array.isArray(candidate.gameChoices)) return null
  if (candidate.resultCode !== null && typeof candidate.resultCode !== 'string') return null
  if (candidate.gameVariantId !== null && typeof candidate.gameVariantId !== 'string') return null
  if (!Number.isInteger(candidate.gameStep) || (candidate.gameStep as number) < 0) return null
  if (typeof candidate.shakeProgress !== 'number' || candidate.shakeProgress < 0 || candidate.shakeProgress > 100) return null
  if (!candidate.audio || typeof candidate.audio !== 'object') return null
  const audio = candidate.audio as Record<string, unknown>
  if (typeof audio.bgmEnabled !== 'boolean' || typeof audio.sfxEnabled !== 'boolean') return null
  if (candidate.completedAt !== null && typeof candidate.completedAt !== 'string') return null

  const answers = candidate.answers as Record<string, unknown>
  const gameChoices = candidate.gameChoices as Record<string, unknown>
  if (!Object.values(answers).every((answer) => typeof answer === 'string') || !Object.values(gameChoices).every((choice) => typeof choice === 'string')) return null
  const stage = candidate.stage as JourneyStage
  const resultCode = candidate.resultCode as string | null
  const needsResult = ['nbti_result', 'game_intro', 'game_conditions', 'game_concepts', 'game_candidates', 'game_adjust', 'game_choice', 'game_shake', 'game_complete', 'sharing'].includes(stage)
  if (needsResult && (!resultCode || !PROVISIONAL_NBTI_RESULTS.some((result) => result.code === resultCode))) return null
  if (!needsResult && resultCode !== null) return null
  if (!Object.entries(answers).every(([questionId, choiceId]) => isChoiceForQuestion(questionId, choiceId as string))) return null
  if (needsResult && !isCompletedNbti(answers as Record<string, string>)) return null

  const gameConditions = candidate.gameConditions === undefined || candidate.gameConditions === null ? null : isGameConditions(candidate.gameConditions) ? candidate.gameConditions : null
  const gameCombo = typeof candidate.gameCombo === 'object' && candidate.gameCombo !== null && isGameComboSelection(candidate.gameCombo) ? candidate.gameCombo as GameComboSelection : null
  const selectedGameId = typeof candidate.selectedGameId === 'string' && decodeGameComboId(candidate.selectedGameId) ? candidate.selectedGameId : null
  const gameAdjustments = candidate.gameAdjustments === undefined ? {} : isGameAdjustments(candidate.gameAdjustments) ? candidate.gameAdjustments : null
  const completion = candidate.completion === undefined ? { recommendationTags: [], recommendedVideoIds: [], shareCardFormat: null, shareCardGenerated: false, lastCompletedStep: null } : isCompletionState(candidate.completion) ? candidate.completion : null
  if (gameAdjustments === null) return null
  if (completion === null) return null
  let restoredStage = stage
  if (restoredStage === 'game_concepts' && !gameConditions) restoredStage = 'game_conditions'
  if (restoredStage === 'game_candidates' && !gameConditions) restoredStage = 'game_conditions'
  else if (restoredStage === 'game_candidates' && !gameCombo) restoredStage = 'game_concepts'
  if ((restoredStage === 'game_adjust' || restoredStage === 'game_complete') && !gameConditions) restoredStage = 'game_conditions'
  else if ((restoredStage === 'game_adjust' || restoredStage === 'game_complete') && !gameCombo) restoredStage = 'game_concepts'
  else if ((restoredStage === 'game_adjust' || restoredStage === 'game_complete') && !selectedGameId) restoredStage = 'game_candidates'

  const expectedVariant = resultCode ? getGameVariantForResult(resultCode) : null
  if (expectedVariant && candidate.gameVariantId !== expectedVariant.id) return null
  if (!expectedVariant && candidate.gameVariantId !== null) return null
  if (expectedVariant && (candidate.gameStep as number) >= expectedVariant.choices.length) return null
  if (expectedVariant && !Object.entries(gameChoices).every(([stepId, optionId]) => expectedVariant.choices.find((choice) => choice.id === stepId)?.options.some((option) => option.id === optionId as string))) return null
  if (['game_complete', 'sharing'].includes(stage) && typeof candidate.completedAt !== 'string') return null

  return {
    version: 2,
    stage: restoredStage,
    questionIndex: candidate.questionIndex as number,
    answers: answers as Record<string, string>,
    resultCode,
    gameVariantId: candidate.gameVariantId as string | null,
    gameStep: candidate.gameStep as number,
    gameChoices: gameChoices as Record<string, string>,
    shakeProgress: candidate.shakeProgress as number,
    audio: {
      bgmEnabled: audio.bgmEnabled as boolean,
      bgmVolume: clampBgmVolume(typeof audio.bgmVolume === 'number' ? audio.bgmVolume : DEFAULT_BGM_VOLUME),
      sfxEnabled: audio.sfxEnabled as boolean,
    },
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    completedAt: candidate.completedAt as string | null,
    gameConditions,
    gameCombo,
    selectedGameId,
    gameAdjustments,
    completion,
    resumeStage: validStages.includes(candidate.resumeStage as JourneyStage) ? candidate.resumeStage as JourneyStage : null,
  }
}
