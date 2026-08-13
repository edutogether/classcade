import { DEFAULT_BGM_VOLUME, type AudioSettings } from '../../lib/audioController'
import type { GameConditions, GameComboSelection } from '../../data/classroomGameBuilder'

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
  | { type: 'REVIEW_NBTI' }
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
