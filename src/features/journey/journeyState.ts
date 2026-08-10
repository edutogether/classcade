import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import { resultCodeFromAnswers } from '../../data/nbtiScoring.provisional'
import { PROVISIONAL_NBTI_RESULTS } from '../../data/nbtiResults.provisional'
import type { JourneyStatus } from '../../data/adventure'
import { DEFAULT_BGM_VOLUME, clampBgmVolume, type AudioSettings } from '../../lib/audioController'
import { isGameConditions, isGameComboSelection, decodeGameComboId, type GameConditions, type GameComboSelection } from '../../data/classroomGameBuilder'

export type JourneyStage = 'nbti_start' | 'nbti_question' | 'nbti_result' | 'game_intro' | 'game_conditions' | 'game_concepts' | 'game_candidates' | 'game_adjust' | 'game_choice' | 'game_shake' | 'game_complete' | 'sharing'

export type CompletionState = { recommendationTags: string[]; recommendedVideoIds: string[]; shareCardFormat: 'square' | 'story' | null; shareCardGenerated: boolean; lastCompletedStep: string | null }

export type JourneyState = {
  version: 2
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
  gameConditions: GameConditions | null
  gameCombo: GameComboSelection | null
  selectedGameId: string | null
  gameAdjustments: Record<string, string>
  completion: CompletionState
  resumeStage: JourneyStage | null
}

export type JourneyAction =
  | { type: 'START_NBTI' }
  | { type: 'ANSWER_NBTI'; questionId: string; choiceId: string }
  | { type: 'NEXT_NBTI' }
  | { type: 'PREVIOUS_NBTI' }
  | { type: 'PREVIOUS_STAGE' }
  | { type: 'GO_HOME' }
  | { type: 'RESUME_JOURNEY' }
  | { type: 'OPEN_GAME_INTRO' }
  | { type: 'SET_GAME_CONDITIONS'; conditions: GameConditions }
  | { type: 'SELECT_GAME_COMBO'; combo: GameComboSelection }
  | { type: 'SELECT_GAME_CANDIDATE'; candidateId: string }
  | { type: 'SET_GAME_ADJUSTMENT'; key: string; value: string }
  | { type: 'COMPLETE_GAME_BUILDER' }
  | { type: 'SET_COMPLETION_STATE'; recommendationTags: string[]; recommendedVideoIds: string[]; shareCardFormat: CompletionState['shareCardFormat']; shareCardGenerated: boolean; lastCompletedStep: string }
  | { type: 'START_GAME' }
  | { type: 'ANSWER_GAME'; choiceId: string }
  | { type: 'NEXT_GAME' }
  | { type: 'ADD_SHAKE'; amount: number }
  | { type: 'OPEN_SHARING' }
  | { type: 'CLOSE_SHARING' }
  | { type: 'RESET_NBTI' }
  | { type: 'SET_AUDIO'; audio: AudioSettings }
  | { type: 'OPEN_RESULT' }

const defaultAudio: AudioSettings = { bgmEnabled: true, bgmVolume: DEFAULT_BGM_VOLUME, sfxEnabled: false }

export function createJourneyState(stage: JourneyStage = 'nbti_start', audio: AudioSettings = defaultAudio): JourneyState {
  return {
    version: 2,
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
    gameConditions: null,
    gameCombo: null,
    selectedGameId: null,
    gameAdjustments: {},
    completion: { recommendationTags: [], recommendedVideoIds: [], shareCardFormat: null, shareCardGenerated: false, lastCompletedStep: null },
    resumeStage: null,
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

function isGameAdjustments(value: unknown): value is Record<string, string> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value as Record<string, unknown>).every((item) => typeof item === 'string')
}

function isCompletionState(value: unknown): value is CompletionState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const completion = value as Record<string, unknown>
  return Array.isArray(completion.recommendationTags) && completion.recommendationTags.every((tag) => typeof tag === 'string') && Array.isArray(completion.recommendedVideoIds) && completion.recommendedVideoIds.every((id) => typeof id === 'string') && (completion.shareCardFormat === null || completion.shareCardFormat === 'square' || completion.shareCardFormat === 'story') && typeof completion.shareCardGenerated === 'boolean' && (completion.lastCompletedStep === null || typeof completion.lastCompletedStep === 'string')
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
    case 'PREVIOUS_STAGE': {
      const previous: Partial<Record<JourneyStage, JourneyStage>> = { nbti_result: 'nbti_question', game_intro: 'nbti_result', game_conditions: 'game_intro', game_concepts: 'game_conditions', game_candidates: 'game_concepts', game_adjust: 'game_candidates', game_choice: 'game_intro', game_shake: 'game_choice', game_complete: 'game_adjust', sharing: 'game_complete' }
      if (state.stage === 'nbti_question') return state.questionIndex > 0 ? stamp(state, { questionIndex: state.questionIndex - 1 }) : stamp(state, { stage: 'nbti_start' })
      const stage = previous[state.stage]
      return stage ? stamp(state, { stage, questionIndex: stage === 'nbti_question' ? NBTI_QUESTIONS.length - 1 : state.questionIndex }) : state
    }
    case 'GO_HOME': return state.stage === 'nbti_start' ? state : stamp(state, { resumeStage: state.stage, stage: 'nbti_start' })
    case 'RESUME_JOURNEY': return state.stage === 'nbti_start' && state.resumeStage ? stamp(state, { stage: state.resumeStage, resumeStage: null }) : state
    case 'OPEN_GAME_INTRO':
      return state.stage === 'nbti_result' && state.resultCode ? stamp(state, { stage: 'game_intro' }) : state
    case 'START_GAME':
      return state.stage === 'game_intro' && state.resultCode ? stamp(state, { stage: 'game_conditions', gameStep: 0, gameChoices: {}, shakeProgress: 0 }) : state
    case 'SET_GAME_CONDITIONS': return state.stage === 'game_conditions' && isGameConditions(action.conditions) ? stamp(state, { gameConditions: action.conditions, gameCombo: null, selectedGameId: null, gameAdjustments: {}, completion: createJourneyState().completion, stage: 'game_concepts' }) : state
    case 'SELECT_GAME_COMBO': return state.stage === 'game_concepts' && isGameComboSelection(action.combo) ? stamp(state, { gameCombo: action.combo, selectedGameId: null, gameAdjustments: {}, completion: createJourneyState().completion, stage: 'game_candidates' }) : state
    case 'SELECT_GAME_CANDIDATE': return state.stage === 'game_candidates' && !!decodeGameComboId(action.candidateId) ? stamp(state, { selectedGameId: action.candidateId, stage: 'game_adjust' }) : state
    case 'SET_GAME_ADJUSTMENT': return state.stage === 'game_adjust' ? stamp(state, { gameAdjustments: { ...state.gameAdjustments, [action.key]: action.value } }) : state
    case 'COMPLETE_GAME_BUILDER': return state.stage === 'game_adjust' && state.selectedGameId ? stamp(state, { stage: 'game_complete', completedAt: new Date().toISOString() }) : state
    case 'SET_COMPLETION_STATE': return state.stage === 'game_complete' ? stamp(state, { completion: { recommendationTags: [...new Set(action.recommendationTags)].slice(0, 12), recommendedVideoIds: [...new Set(action.recommendedVideoIds)].slice(0, 3), shareCardFormat: action.shareCardFormat, shareCardGenerated: action.shareCardGenerated, lastCompletedStep: action.lastCompletedStep } }) : state
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
  if (stage === 'game_intro' || stage === 'game_conditions' || stage === 'game_concepts' || stage === 'game_candidates' || stage === 'game_adjust') return 'game_in_progress'
  return 'complete'
}

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
