export type { JourneyStage, JourneyState, JourneyAction } from './journeyTypes'
export { createJourneyState } from './journeyTypes'
export { journeyReducer } from './journeyReducer'
export { validateJourneyState } from './journeyValidation'

import type { JourneyStage } from './journeyTypes'
import type { JourneyStatus } from '../../data/adventure'

export function journeyStatusForStage(stage: JourneyStage): JourneyStatus {
  if (stage === 'nbti_start') return 'new'
  if (stage === 'nbti_question') return 'nbti_in_progress'
  return 'nbti_complete'
}
