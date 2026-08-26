import { DEFAULT_BGM_VOLUME, type AudioSettings } from '../../lib/audioController'

export type JourneyStage = 'nbti_start' | 'nbti_question' | 'nbti_result'

export type JourneyState = {
  version: 3
  stage: JourneyStage
  questionIndex: number
  answers: Record<string, string>
  resultCode: string | null
  audio: AudioSettings
  updatedAt: string
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
  | { type: 'REVIEW_NBTI' }
  | { type: 'RESET_NBTI' }
  | { type: 'SET_AUDIO'; audio: AudioSettings }
  | { type: 'OPEN_RESULT' }

const defaultAudio: AudioSettings = { bgmEnabled: true, bgmVolume: DEFAULT_BGM_VOLUME, sfxEnabled: false }

export function createJourneyState(stage: JourneyStage = 'nbti_start', audio: AudioSettings = defaultAudio): JourneyState {
  return {
    version: 3,
    stage,
    questionIndex: 0,
    answers: {},
    resultCode: null,
    audio,
    updatedAt: new Date().toISOString(),
    resumeStage: null,
  }
}
