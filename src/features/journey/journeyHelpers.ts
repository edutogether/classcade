import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import type { JourneyState } from './journeyTypes'

export function stamp(state: JourneyState, changes: Partial<JourneyState>): JourneyState {
  return { ...state, ...changes, updatedAt: new Date().toISOString() }
}

export function isChoiceForQuestion(questionId: string, choiceId: string) {
  return NBTI_QUESTIONS.find((question) => question.id === questionId)?.choices.some((choice) => choice.id === choiceId) ?? false
}

export function isCompletedNbti(answers: Record<string, string>) {
  return NBTI_QUESTIONS.every((question) => isChoiceForQuestion(question.id, answers[question.id] ?? ''))
}
