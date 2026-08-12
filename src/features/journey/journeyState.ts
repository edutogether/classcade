export type { JourneyStage, CompletionState, JourneyState, JourneyAction } from './journeyTypes'
export { createJourneyState } from './journeyTypes'
export { journeyReducer } from './journeyReducer'
export { validateJourneyState } from './journeyValidation'

import type { JourneyStage } from './journeyTypes'
import type { JourneyStatus } from '../../data/adventure'

export function journeyStatusForStage(stage: JourneyStage): JourneyStatus {
  if (stage === 'nbti_start') return 'new'
  if (stage === 'nbti_question') return 'nbti_in_progress'
  if (stage === 'nbti_result') return 'nbti_complete'
  if (stage === 'game_intro' || stage === 'game_conditions' || stage === 'game_concepts' || stage === 'game_candidates' || stage === 'game_adjust') return 'game_in_progress'
  return 'complete'
}
