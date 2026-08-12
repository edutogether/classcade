import { useEffect, useState, type RefObject } from 'react'
import { noteAudioUserGesture, playAudioCue, playSceneTheme } from '../../lib/audioManager'
import type { JourneyAction, JourneyState } from './journeyState'
import { CompleteScene, GameAdjustScene, GameCandidatesScene, GameChoiceScene, GameConceptsScene, GameConditionsScene, GameIntroScene, ShakeScene, ShareScene } from './scenes/GameScenes'
import { QuestionScene, ResultScene, StartScene } from './scenes/NbtiScenes'
import { PairingEntryScene, PairingScene } from '../pairing/PairingScreens'
import { JourneyExitDialog } from './components/JourneyExitDialog'
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
  onNextParticipant?: () => void
}

const PAIRING_GATE_OPEN_KEY = 'classcade.pairing-gate-open.v1'
function loadPairingGateOpen() { try { return localStorage.getItem(PAIRING_GATE_OPEN_KEY) === 'true' } catch { return false } }
function savePairingGateOpen(open: boolean) { try { if (open) localStorage.setItem(PAIRING_GATE_OPEN_KEY, 'true'); else localStorage.removeItem(PAIRING_GATE_OPEN_KEY) } catch { /* Pairing remains usable when browser storage is unavailable. */ } }

export function JourneyApp({ state, notice, onAction, onTeacherOpen, teacherTriggerRef, profile, journeyId, pairingEntry = false, onPaired, onStartHere, onExitPairingEntry, onNextParticipant }: JourneyAppProps) {
  const [pairingOpen, setPairingOpen] = useState(loadPairingGateOpen)
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [exitDialogMode, setExitDialogMode] = useState<'home' | 'next'>('home')
  useEffect(() => {
    /* One track per phase: the main theme announces the start screen, a lighter track
       carries the questions, and everything fades out at the result. */
    const theme = state.stage === 'nbti_start' ? 'main' : state.stage === 'nbti_question' ? 'question' : state.stage === 'nbti_result' ? 'result' : null
    playSceneTheme(theme, state.audio.bgmEnabled, state.audio.bgmVolume)
  }, [state.audio.bgmEnabled, state.audio.bgmVolume, state.stage])
  useEffect(() => { if (state.stage !== 'nbti_result') { savePairingGateOpen(false); setPairingOpen(false) } }, [state.stage])

  const dispatch = (action: JourneyAction) => {
    noteAudioUserGesture()
    if (['ANSWER_NBTI', 'ANSWER_GAME', 'NEXT_NBTI', 'NEXT_GAME'].includes(action.type)) playAudioCue('choice', state.audio)
    if (action.type === 'OPEN_GAME_INTRO') playAudioCue('reveal', state.audio)
    if (action.type === 'OPEN_SHARING') playAudioCue('complete', state.audio)
    onAction(action)
  }
  const sceneProps: JourneySceneProps = { state, notice, onAction: dispatch, onTeacherOpen, teacherTriggerRef, profile: profile ?? undefined, onRequestHome: () => { setExitDialogMode('home'); setExitDialogOpen(true) }, onNextParticipant: onNextParticipant ? () => { setExitDialogMode('next'); setExitDialogOpen(true) } : undefined }

  let content: React.ReactNode
  /* 2026-08-13: the journey now ends at the result screen. The pairing and game-builder
     scenes below are kept in the codebase but are no longer reachable — any stage that
     still points at them (a restored session, a stale saved stage) falls back to the
     result screen rather than dead-ending on a disconnected page. */
  if (pairingEntry) content = <PairingEntryScene {...sceneProps} onPaired={(payload) => onPaired?.(payload)} onStart={() => onStartHere?.()} onBack={() => onExitPairingEntry?.()} />
  else if (state.stage === 'nbti_start') content = <StartScene {...sceneProps} />
  else if (state.stage === 'nbti_question') content = <QuestionScene {...sceneProps} />
  else content = <ResultScene {...sceneProps} onPair={() => { savePairingGateOpen(true); setPairingOpen(true) }} />

  const disconnectedScenes = (): React.ReactNode => {
    if (state.stage === 'nbti_result' && pairingOpen && profile) return <PairingScene {...sceneProps} profile={profile} journeyId={journeyId} onBack={() => { savePairingGateOpen(false); setPairingOpen(false) }} />
    if (state.stage === 'game_intro') return <GameIntroScene {...sceneProps} />
    if (state.stage === 'game_conditions') return <GameConditionsScene {...sceneProps} />
    if (state.stage === 'game_concepts') return <GameConceptsScene {...sceneProps} />
    if (state.stage === 'game_candidates') return <GameCandidatesScene {...sceneProps} />
    if (state.stage === 'game_adjust') return <GameAdjustScene {...sceneProps} />
    if (state.stage === 'game_choice') return <GameChoiceScene {...sceneProps} />
    if (state.stage === 'game_shake') return <ShakeScene {...sceneProps} />
    if (state.stage === 'game_complete') return <CompleteScene {...sceneProps} />
    return <ShareScene {...sceneProps} />
  }
  void disconnectedScenes

  return <>{content}<JourneyExitDialog open={exitDialogOpen} mode={exitDialogMode} onContinue={() => setExitDialogOpen(false)} onHome={() => { setExitDialogOpen(false); dispatch({ type: 'GO_HOME' }) }} onNewSession={() => { setExitDialogOpen(false); if (exitDialogMode === 'next') onNextParticipant?.(); else dispatch({ type: 'RESET_NBTI' }) }} /></>
}
