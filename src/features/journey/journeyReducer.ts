import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { resultCodeFromAnswers } from '../../data/nbtiScoring.provisional'
import type { JourneyAction, JourneyState } from './journeyTypes'
import { createJourneyState } from './journeyTypes'
import { stamp, isChoiceForQuestion, isCompletedNbti } from './journeyHelpers'

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
      return stamp(state, { stage: 'nbti_result', resultCode })
    }
    case 'PREVIOUS_NBTI':
      return state.stage === 'nbti_question' && state.questionIndex > 0 ? stamp(state, { questionIndex: state.questionIndex - 1 }) : state
    case 'PREVIOUS_STAGE': {
      if (state.stage === 'nbti_question') return state.questionIndex > 0 ? stamp(state, { questionIndex: state.questionIndex - 1 }) : stamp(state, { stage: 'nbti_start' })
      if (state.stage === 'nbti_result') return stamp(state, { stage: 'nbti_question', questionIndex: NBTI_QUESTIONS.length - 1 })
      return state
    }
    case 'GO_HOME': return state.stage === 'nbti_start' ? state : stamp(state, { resumeStage: state.stage, stage: 'nbti_start' })
    case 'RESUME_JOURNEY': return state.stage === 'nbti_start' && state.resumeStage ? stamp(state, { stage: state.resumeStage, resumeStage: null }) : state
    case 'REVIEW_NBTI':
      /* Back to question 1 with every answer preserved, so re-exploring means flipping
         through pre-checked cards rather than answering 16 questions again. */
      return state.stage === 'nbti_result' ? stamp(state, { stage: 'nbti_question', questionIndex: 0 }) : state
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
