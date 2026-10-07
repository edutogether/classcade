import { useEffect, useState, type RefObject } from 'react'
import { noteAudioUserGesture, playAudioCue, playSceneTheme } from '../../lib/audioManager'
import type { JourneyAction, JourneyState } from './journeyState'
import { QuestionScene, ResultScene, StartScene } from './scenes/NbtiScenes'
import { PairingEntryScene, PairingScene } from '../pairing/PairingScreens'
import { JourneyExitDialog } from './components/JourneyExitDialog'
import type { PairingPayload } from '../pairing/pairingContract'
import { PAIRING_GATE_OPEN_STORAGE_KEY, getStorageBackend, resolveDeviceMode, type Profile } from '../../lib/storage'
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

/* Same per-device-mode store as the rest of the journey, so a reset or a new participant on a
   shared device does not inherit an open pairing screen. */
const pairingGateBackend = () => getStorageBackend(resolveDeviceMode())
function loadPairingGateOpen() { try { return pairingGateBackend()?.getItem(PAIRING_GATE_OPEN_STORAGE_KEY) === 'true' } catch { return false } }
function savePairingGateOpen(open: boolean) { try { if (open) pairingGateBackend()?.setItem(PAIRING_GATE_OPEN_STORAGE_KEY, 'true'); else pairingGateBackend()?.removeItem(PAIRING_GATE_OPEN_STORAGE_KEY) } catch { /* Pairing remains usable when browser storage is unavailable. */ } }

export function JourneyApp({ state, notice, onAction, onTeacherOpen, teacherTriggerRef, profile, journeyId, pairingEntry = false, onPaired, onStartHere, onExitPairingEntry, onNextParticipant }: JourneyAppProps) {
  const [pairingOpen, setPairingOpen] = useState(loadPairingGateOpen)
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  const [exitDialogMode, setExitDialogMode] = useState<'home' | 'next'>('home')
  /* Close the pairing gate the moment the stage leaves nbti_result — during render (not
     in an effect) so react-hooks/set-state-in-effect doesn't flag it. The storage
     write is idempotent (removeItem), so running it a render earlier than the old effect
     did changes nothing observable. */
  const [pairingGateStage, setPairingGateStage] = useState(state.stage)
  if (state.stage !== pairingGateStage) {
    setPairingGateStage(state.stage)
    if (state.stage !== 'nbti_result') { savePairingGateOpen(false); setPairingOpen(false) }
  }
  useEffect(() => {
    /* One track per phase: the main theme announces the start screen, a lighter track
       carries the questions, and everything fades out at the result. */
    const theme = state.stage === 'nbti_start' ? 'main' : state.stage === 'nbti_question' ? 'question' : state.stage === 'nbti_result' ? 'result' : null
    playSceneTheme(theme, state.audio.bgmEnabled, state.audio.bgmVolume)
  }, [state.audio.bgmEnabled, state.audio.bgmVolume, state.stage])
  /* Unmount = leaving the journey (처음으로 -> prep): without this the last track kept
     playing straight through the prep screens. */
  useEffect(() => () => playSceneTheme(null, false, 0), [])

  const dispatch = (action: JourneyAction) => {
    noteAudioUserGesture()
    if (action.type === 'ANSWER_NBTI' || action.type === 'NEXT_NBTI') playAudioCue('choice', state.audio)
    onAction(action)
  }
  const sceneProps: JourneySceneProps = { state, notice, onAction: dispatch, onTeacherOpen, teacherTriggerRef, profile: profile ?? undefined, onRequestHome: () => { setExitDialogMode('home'); setExitDialogOpen(true) }, onNextParticipant: onNextParticipant ? () => { setExitDialogMode('next'); setExitDialogOpen(true) } : undefined }

  let content: React.ReactNode
  /* 2026-08-13: the journey now ends at the result screen. The game-builder stages that
     used to follow it are gone entirely (see below); any stage value that no longer
     exists (a stale saved session) falls through the if/else chain to the result screen
     rather than dead-ending on a disconnected page. */
  if (pairingEntry) content = <PairingEntryScene {...sceneProps} onPaired={(payload) => onPaired?.(payload)} onStart={() => onStartHere?.()} onBack={() => onExitPairingEntry?.()} />
  else if (state.stage === 'nbti_start') content = <StartScene {...sceneProps} />
  else if (state.stage === 'nbti_question') content = <QuestionScene {...sceneProps} />
  else content = <ResultScene {...sceneProps} onPair={() => { savePairingGateOpen(true); setPairingOpen(true) }} />

  /* 2026-08-27: the classroom-game-builder scenes that used to live here (game_intro
     through sharing) were deleted entirely — 대표 decided against reviving them. Only
     the pairing code-issuance screen remains unreachable, pending the separate LOCKED
     pairing-redesign decision in this repo's CLAUDE.md. */
  const disconnectedScenes = (): React.ReactNode => {
    if (state.stage === 'nbti_result' && pairingOpen && profile) return <PairingScene {...sceneProps} profile={profile} journeyId={journeyId} onBack={() => { savePairingGateOpen(false); setPairingOpen(false) }} />
    return null
  }
  void disconnectedScenes

  return <>{content}<JourneyExitDialog open={exitDialogOpen} mode={exitDialogMode} onContinue={() => setExitDialogOpen(false)} onHome={() => { setExitDialogOpen(false); dispatch({ type: 'GO_HOME' }) }} onNewSession={() => { setExitDialogOpen(false); if (exitDialogMode === 'next') onNextParticipant?.(); else dispatch({ type: 'RESET_NBTI' }) }} /></>
}
