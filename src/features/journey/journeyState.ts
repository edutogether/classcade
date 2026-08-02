import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import { resultCodeFromAnswers } from '../../data/nbtiScoring.provisional'
import { PROVISIONAL_NBTI_RESULTS } from '../../data/nbtiResults.provisional'
import type { JourneyStatus } from '../../data/adventure'
import type { AudioSettings } from '../../lib/audioController'

export type JourneyStage = 'nbti_start' | 'nbti_question' | 'nbti_result' | 'game_intro' | 'game_choice' | 'game_shake' | 'game_complete' | 'sharing'

export type JourneyState = {
  version: 1
  stage: JourneyStage
  questionIndex: number
  answers: Record<string, string>
  resultCode: string | null
  gameVariantId: string | null
  gameStep: number
  gameChoices: Record<string, string>
  shakeProgress: number
  audio: AudioSettings
  updatedAt: string
  completedAt: string | null
}

export type JourneyAction =
  | { type: 'START_NBTI' }
  | { type: 'ANSWER_NBTI'; questionId: string; choiceId: string }
  | { type: 'NEXT_NBTI' }
  | { type: 'PREVIOUS_NBTI' }
  | { type: 'OPEN_GAME_INTRO' }
  | { type: 'START_GAME' }
  | { type: 'ANSWER_GAME'; choiceId: string }
  | { type: 'NEXT_GAME' }
  | { type: 'ADD_SHAKE'; amount: number }
  | { type: 'OPEN_SHARING' }
  | { type: 'CLOSE_SHARING' }
  | { type: 'RESET_NBTI' }
  | { type: 'SET_AUDIO'; audio: AudioSettings }
  | { type: 'OPEN_RESULT' }

const defaultAudio: AudioSettings = { bgmEnabled: false, sfxEnabled: false }

export function createJourneyState(stage: JourneyStage = 'nbti_start', audio: AudioSettings = defaultAudio): JourneyState {
  return {
    version: 1,
    stage,
    questionIndex: 0,
    answers: {},
    resultCode: null,
    gameVariantId: null,
    gameStep: 0,
    gameChoices: {},
    shakeProgress: 0,
    audio,
    updatedAt: new Date().toISOString(),
    completedAt: null,
  }
}

function stamp(state: JourneyState, changes: Partial<JourneyState>): JourneyState {
  return { ...state, ...changes, updatedAt: new Date().toISOString() }
}

function isChoiceForQuestion(questionId: string, choiceId: string) {
  return NBTI_QUESTIONS.find((question) => question.id === questionId)?.choices.some((choice) => choice.id === choiceId) ?? false
}

function isCompletedNbti(answers: Record<string, string>) {
  return NBTI_QUESTIONS.every((question) => isChoiceForQuestion(question.id, answers[question.id] ?? ''))
}

function gameVariantForState(state: JourneyState) {
  return getGameVariantForResult(state.resultCode)
}

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'START_NBTI':
      return state.stage === 'nbti_start' ? stamp(state, { stage: 'nbti_question', questionIndex: 0 }) : state
    case 'ANSWER_NBTI': {
      if (state.stage !== 'nbti_question') return state
      const current = NBTI_QUESTIONS[state.questionIndex]
      if (!current || current.id !== action.questionId || !isChoiceForQuestion(action.questionId, action.choiceId)) return state
      return stamp(state, { answers: { ...state.answers, [action.questionId]: action.choiceId } })
    }
    case 'NEXT_NBTI': {
      if (state.stage !== 'nbti_question') return state
      const current = NBTI_QUESTIONS[state.questionIndex]
      if (!current || !isChoiceForQuestion(current.id, state.answers[current.id] ?? '')) return state
      if (state.questionIndex < NBTI_QUESTIONS.length - 1) return stamp(state, { questionIndex: state.questionIndex + 1 })
      if (!isCompletedNbti(state.answers)) return state
      const resultCode = resultCodeFromAnswers(state.answers)
      return stamp(state, { stage: 'nbti_result', resultCode, gameVariantId: getGameVariantForResult(resultCode).id, gameStep: 0, gameChoices: {}, shakeProgress: 0 })
    }
    case 'PREVIOUS_NBTI':
      return state.stage === 'nbti_question' && state.questionIndex > 0 ? stamp(state, { questionIndex: state.questionIndex - 1 }) : state
    case 'OPEN_GAME_INTRO':
      return state.stage === 'nbti_result' && state.resultCode ? stamp(state, { stage: 'game_intro' }) : state
    case 'START_GAME':
      return state.stage === 'game_intro' && state.resultCode ? stamp(state, { stage: 'game_choice', gameStep: 0, gameChoices: {}, shakeProgress: 0 }) : state
    case 'ANSWER_GAME': {
      if (state.stage !== 'game_choice') return state
      const choice = gameVariantForState(state).choices[state.gameStep]
      if (!choice || !choice.options.some((option) => option.id === action.choiceId)) return state
      return stamp(state, { gameChoices: { ...state.gameChoices, [choice.id]: action.choiceId } })
    }
    case 'NEXT_GAME': {
      if (state.stage !== 'game_choice') return state
      const variant = gameVariantForState(state)
      const current = variant.choices[state.gameStep]
      if (!current || !current.options.some((option) => option.id === state.gameChoices[current.id])) return state
      if (state.gameStep < variant.choices.length - 1) return stamp(state, { gameStep: state.gameStep + 1 })
      return stamp(state, { stage: 'game_shake' })
    }
    case 'ADD_SHAKE': {
      if (state.stage !== 'game_shake' || !Number.isFinite(action.amount) || action.amount <= 0) return state
      const shakeProgress = Math.min(100, state.shakeProgress + action.amount)
      return shakeProgress >= 100
        ? stamp(state, { stage: 'game_complete', shakeProgress: 100, completedAt: new Date().toISOString() })
        : stamp(state, { shakeProgress })
    }
    case 'OPEN_SHARING':
      return state.stage === 'game_complete' && state.resultCode ? stamp(state, { stage: 'sharing' }) : state
    case 'CLOSE_SHARING':
      return state.stage === 'sharing' ? stamp(state, { stage: 'game_complete' }) : state
    case 'OPEN_RESULT':
      return state.resultCode ? stamp(state, { stage: 'nbti_result' }) : state
    case 'RESET_NBTI':
      return createJourneyState('nbti_start', state.audio)
    case 'SET_AUDIO':
      return stamp(state, { audio: action.audio })
    default:
      return state
  }
}

export function journeyStatusForStage(stage: JourneyStage): JourneyStatus {
  if (stage === 'nbti_start') return 'new'
  if (stage === 'nbti_question') return 'nbti_in_progress'
  if (stage === 'nbti_result') return 'nbti_complete'
  if (stage === 'game_intro' || stage === 'game_choice' || stage === 'game_shake') return 'game_in_progress'
  return 'complete'
}

export function validateJourneyState(value: unknown): JourneyState | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  const validStages: JourneyStage[] = ['nbti_start', 'nbti_question', 'nbti_result', 'game_intro', 'game_choice', 'game_shake', 'game_complete', 'sharing']
  if (candidate.version !== 1 || !validStages.includes(candidate.stage as JourneyStage)) return null
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
  const needsResult = ['nbti_result', 'game_intro', 'game_choice', 'game_shake', 'game_complete', 'sharing'].includes(stage)
  if (needsResult && (!resultCode || !PROVISIONAL_NBTI_RESULTS.some((result) => result.code === resultCode))) return null
  if (!needsResult && resultCode !== null) return null
  if (!Object.entries(answers).every(([questionId, choiceId]) => isChoiceForQuestion(questionId, choiceId as string))) return null
  if (needsResult && !isCompletedNbti(answers as Record<string, string>)) return null

  const expectedVariant = resultCode ? getGameVariantForResult(resultCode) : null
  if (expectedVariant && candidate.gameVariantId !== expectedVariant.id) return null
  if (!expectedVariant && candidate.gameVariantId !== null) return null
  if (expectedVariant && (candidate.gameStep as number) >= expectedVariant.choices.length) return null
  if (expectedVariant && !Object.entries(gameChoices).every(([stepId, optionId]) => expectedVariant.choices.find((choice) => choice.id === stepId)?.options.some((option) => option.id === optionId as string))) return null
  if (['game_complete', 'sharing'].includes(stage) && typeof candidate.completedAt !== 'string') return null

  return {
    version: 1,
    stage,
    questionIndex: candidate.questionIndex as number,
    answers: answers as Record<string, string>,
    resultCode,
    gameVariantId: candidate.gameVariantId as string | null,
    gameStep: candidate.gameStep as number,
    gameChoices: gameChoices as Record<string, string>,
    shakeProgress: candidate.shakeProgress as number,
    audio: { bgmEnabled: audio.bgmEnabled as boolean, sfxEnabled: audio.sfxEnabled as boolean },
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : new Date().toISOString(),
    completedAt: candidate.completedAt as string | null,
  }
}
