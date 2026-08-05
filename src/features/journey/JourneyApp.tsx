import { useEffect, useState, type RefObject } from 'react'
import { noteAudioUserGesture, playAudioCue, syncMainTheme } from '../../lib/audioManager'
import type { JourneyAction, JourneyState } from './journeyState'
import { CompleteScene, GameChoiceScene, GameIntroScene, ShakeScene, ShareScene } from './scenes/GameScenes'
import { QuestionScene, ResultScene, StartScene } from './scenes/NbtiScenes'
import { PairingEntryScene, PairingScene } from '../pairing/PairingScreens'
import type { PairingPayload } from '../pairing/pairingContract'
import type { Profile } from '../../lib/storage'
import type { JourneySceneProps } from './components/SceneFrame'
import './journey.css'

type JourneyAppProps = {
  state: JourneyState
  notice: string
  onAction: (action: JourneyAction) => void
  onTeacherOpen: (button: HTMLButtonElement) => void
  teacherTriggerRef: RefObject<HTMLButtonElement | null>
  profile: Profile | null
  journeyId: string
  pairingEntry?: boolean
  onPaired?: (payload: PairingPayload) => void
  onStartHere?: () => void
  onExitPairingEntry?: () => void
}

const PAIRING_GATE_OPEN_KEY = 'classcade.pairing-gate-open.v1'
function loadPairingGateOpen() { try { return localStorage.getItem(PAIRING_GATE_OPEN_KEY) === 'true' } catch { return false } }
function savePairingGateOpen(open: boolean) { try { if (open) localStorage.setItem(PAIRING_GATE_OPEN_KEY, 'true'); else localStorage.removeItem(PAIRING_GATE_OPEN_KEY) } catch { /* Pairing remains usable when browser storage is unavailable. */ } }

export function JourneyApp({ state, notice, onAction, onTeacherOpen, teacherTriggerRef, profile, journeyId, pairingEntry = false, onPaired, onStartHere, onExitPairingEntry }: JourneyAppProps) {
  const [pairingOpen, setPairingOpen] = useState(loadPairingGateOpen)
  useEffect(() => {
    syncMainTheme(state.audio.bgmEnabled, state.stage, state.audio.bgmVolume)
  }, [state.audio.bgmEnabled, state.audio.bgmVolume, state.stage])
  useEffect(() => { if (state.stage !== 'nbti_result') { savePairingGateOpen(false); setPairingOpen(false) } }, [state.stage])

  const dispatch = (action: JourneyAction) => {
    noteAudioUserGesture()
    if (['ANSWER_NBTI', 'ANSWER_GAME', 'NEXT_NBTI', 'NEXT_GAME'].includes(action.type)) playAudioCue('choice', state.audio)
    if (action.type === 'OPEN_GAME_INTRO') playAudioCue('reveal', state.audio)
    if (action.type === 'OPEN_SHARING') playAudioCue('complete', state.audio)
    onAction(action)
  }
  const sceneProps: JourneySceneProps = { state, notice, onAction: dispatch, onTeacherOpen, teacherTriggerRef }

  if (pairingEntry) return <PairingEntryScene {...sceneProps} onPaired={(payload) => onPaired?.(payload)} onStart={() => onStartHere?.()} onBack={() => onExitPairingEntry?.()} />

  if (state.stage === 'nbti_start') return <StartScene {...sceneProps} />
  if (state.stage === 'nbti_question') return <QuestionScene {...sceneProps} />
  if (state.stage === 'nbti_result' && pairingOpen && profile) return <PairingScene {...sceneProps} profile={profile} journeyId={journeyId} onBack={() => { savePairingGateOpen(false); setPairingOpen(false) }} />
  if (state.stage === 'nbti_result') return <ResultScene {...sceneProps} onPair={() => { savePairingGateOpen(true); setPairingOpen(true) }} />
  if (state.stage === 'game_intro') return <GameIntroScene {...sceneProps} />
  if (state.stage === 'game_choice') return <GameChoiceScene {...sceneProps} />
  if (state.stage === 'game_shake') return <ShakeScene {...sceneProps} />
  if (state.stage === 'game_complete') return <CompleteScene {...sceneProps} />
  return <ShareScene {...sceneProps} />
}
