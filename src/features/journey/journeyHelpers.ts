import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import type { CompletionState, JourneyState } from './journeyTypes'

export function stamp(state: JourneyState, changes: Partial<JourneyState>): JourneyState {
  return { ...state, ...changes, updatedAt: new Date().toISOString() }
}

export function isChoiceForQuestion(questionId: string, choiceId: string) {
  return NBTI_QUESTIONS.find((question) => question.id === questionId)?.choices.some((choice) => choice.id === choiceId) ?? false
}

export function isCompletedNbti(answers: Record<string, string>) {
  return NBTI_QUESTIONS.every((question) => isChoiceForQuestion(question.id, answers[question.id] ?? ''))
}

export function isGameAdjustments(value: unknown): value is Record<string, string> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value as Record<string, unknown>).every((item) => typeof item === 'string')
}

export function isCompletionState(value: unknown): value is CompletionState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const completion = value as Record<string, unknown>
  return Array.isArray(completion.recommendationTags) && completion.recommendationTags.every((tag) => typeof tag === 'string') && Array.isArray(completion.recommendedVideoIds) && completion.recommendedVideoIds.every((id) => typeof id === 'string') && (completion.shareCardFormat === null || completion.shareCardFormat === 'square' || completion.shareCardFormat === 'story') && typeof completion.shareCardGenerated === 'boolean' && (completion.lastCompletedStep === null || typeof completion.lastCompletedStep === 'string')
}

export function gameVariantForState(state: JourneyState) {
  return getGameVariantForResult(state.resultCode)
}
