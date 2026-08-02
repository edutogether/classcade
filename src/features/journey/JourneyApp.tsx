import { useEffect, type RefObject } from 'react'
import { noteAudioUserGesture, playAudioCue, syncMainTheme } from '../../lib/audioManager'
import type { JourneyAction, JourneyState } from './journeyState'
import { CompleteScene, GameChoiceScene, GameIntroScene, ShakeScene, ShareScene } from './scenes/GameScenes'
import { QuestionScene, ResultScene, StartScene } from './scenes/NbtiScenes'
import type { JourneySceneProps } from './components/SceneFrame'
import './journey.css'

type JourneyAppProps = {
  state: JourneyState
  notice: string
  onAction: (action: JourneyAction) => void
  onTeacherOpen: (button: HTMLButtonElement) => void
  teacherTriggerRef: RefObject<HTMLButtonElement | null>
}

export function JourneyApp({ state, notice, onAction, onTeacherOpen, teacherTriggerRef }: JourneyAppProps) {
  useEffect(() => {
    syncMainTheme(state.audio.bgmEnabled, state.stage, state.audio.bgmVolume)
  }, [state.audio.bgmEnabled, state.audio.bgmVolume, state.stage])

  const dispatch = (action: JourneyAction) => {
    noteAudioUserGesture()
    if (['ANSWER_NBTI', 'ANSWER_GAME', 'NEXT_NBTI', 'NEXT_GAME'].includes(action.type)) playAudioCue('choice', state.audio)
    if (action.type === 'OPEN_GAME_INTRO') playAudioCue('reveal', state.audio)
    if (action.type === 'OPEN_SHARING') playAudioCue('complete', state.audio)
    onAction(action)
  }
  const sceneProps: JourneySceneProps = { state, notice, onAction: dispatch, onTeacherOpen, teacherTriggerRef }

  if (state.stage === 'nbti_start') return <StartScene {...sceneProps} />
  if (state.stage === 'nbti_question') return <QuestionScene {...sceneProps} />
  if (state.stage === 'nbti_result') return <ResultScene {...sceneProps} />
  if (state.stage === 'game_intro') return <GameIntroScene {...sceneProps} />
  if (state.stage === 'game_choice') return <GameChoiceScene {...sceneProps} />
  if (state.stage === 'game_shake') return <ShakeScene {...sceneProps} />
  if (state.stage === 'game_complete') return <CompleteScene {...sceneProps} />
  return <ShareScene {...sceneProps} />
}
