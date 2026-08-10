import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import { resultCodeFromAnswers } from '../../data/nbtiScoring.provisional'
import { isGameConditions, isGameComboSelection, decodeGameComboId } from '../../data/classroomGameBuilder'
import type { JourneyAction, JourneyStage, JourneyState } from './journeyTypes'
import { createJourneyState } from './journeyTypes'
import { stamp, isChoiceForQuestion, isCompletedNbti, gameVariantForState } from './journeyHelpers'

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
