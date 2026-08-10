import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AdventurePrepScreen } from './components/AdventurePrepScreen'
import { SharedSessionGate } from './components/SharedSessionGate'
import { TeacherPanel } from './components/TeacherPanel'

/** Deferred: the NBTI + game-builder flow is the heavier half of the bundle and isn't
 *  needed until the prep screens finish, so most first loads skip downloading it. */
const JourneyApp = lazy(() => import('./features/journey/JourneyApp').then((module) => ({ default: module.JourneyApp })))
import { loadJourneyState, saveJourneyState } from './features/journey/journeyPersistence'
import { createJourneyState, journeyReducer, journeyStatusForStage, type JourneyAction, type JourneyState } from './features/journey/journeyState'
import { resolveEntryState } from './lib/entryState'
import { preloadMainTheme } from './lib/audioManager'
import { EntryVisualTuner } from './features/entry/EntryVisualTuner'
import type { PairingPayload } from './features/pairing/pairingContract'
import { restorePairingJourney } from './features/pairing/pairingContract'
import { revokeActivePairingCode } from './features/pairing/activePairingCode'
import { applyTuning, createTuning, type TunerScreen } from './features/entry/visualTuning'
import {
  clearActiveSession,
  clearNbtiAndProgress,
  ensureAnonymousJourneyId,
  hasActiveSession,
  loadJourney,
  loadProfile,
  resolveDeviceMode,
  resolveDeviceRole,
  saveJourney,
  saveProfile,
  type DeviceMode,
  type Journey,
  type Profile,
} from './lib/storage'
import './App.css'

type Screen = 'prep' | 'journey'
type SaveAttempt = { ok: true } | { ok: false }
type ActiveJourneyResetMode = 'mobile-new-journey' | 'laptop-next-participant'

function nextJourney(state: JourneyState): Journey {
  return { version: 1, status: journeyStatusForStage(state.stage), updatedAt: state.updatedAt }
}

function isBrowserOnline() {
  return typeof navigator === 'undefined' || navigator.onLine
}

export default function App() {
  const [boot] = useState(() => {
    const deviceMode = resolveDeviceMode()
    const profileResult = loadProfile(deviceMode)
    const journeyResult = loadJourney(deviceMode)
    const detailedJourneyResult = loadJourneyState(deviceMode)
    const sessionResult = hasActiveSession(deviceMode)
    return { deviceMode, profileResult, journeyResult, detailedJourneyResult, sessionResult }
  })
  const initialEntryState = resolveEntryState(boot.deviceMode, boot.profileResult.value, boot.sessionResult.value)
  const [deviceMode] = useState<DeviceMode>(boot.deviceMode)
  const [deviceRole] = useState(() => resolveDeviceRole())
  const [profile, setProfile] = useState<Profile | null>(boot.profileResult.value)
  const [journey, setJourney] = useState<Journey>(boot.journeyResult.value)
  const [journeyState, setJourneyState] = useState<JourneyState>(() => boot.detailedJourneyResult.value ?? createJourneyState())
  const pairingEntryRequested = typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('pairing') === '1' || deviceRole === 'laptop-station')
  const [screen, setScreen] = useState<Screen>(pairingEntryRequested || initialEntryState.screen === 'start' ? 'journey' : 'prep')
  const [sharedSessionGateOpen, setSharedSessionGateOpen] = useState(initialEntryState.sharedSessionGateOpen)
  const [prepExiting, setPrepExiting] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [tunerScreen, setTunerScreen] = useState<TunerScreen>(initialEntryState.screen === 'start' ? 'main' : 'prep-1')
  const [notice, setNotice] = useState(boot.detailedJourneyResult.ok ? '' : '이전 여정 상태를 복원하지 못해 새 여정으로 안전하게 시작합니다.')
  const [online, setOnline] = useState(isBrowserOnline)
  const teacherTriggerRef = useRef<HTMLButtonElement>(null)
  const transitionTimerRef = useRef<number | null>(null)
  const journeyIdResult = ensureAnonymousJourneyId(deviceMode)
  const journeyId = journeyIdResult.ok ? journeyIdResult.value : ''

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const syncOnlineStatus = () => setOnline(isBrowserOnline())
    window.addEventListener('online', syncOnlineStatus)
    window.addEventListener('offline', syncOnlineStatus)
    return () => {
      window.removeEventListener('online', syncOnlineStatus)
      window.removeEventListener('offline', syncOnlineStatus)
    }
  }, [])

  useEffect(() => {
    preloadMainTheme()
  }, [])

  useEffect(() => {
    applyTuning(createTuning(), tunerScreen)
  }, [tunerScreen])

  useEffect(() => () => { if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current) }, [])

  function beginJourneyTransition() {
    setPrepExiting(true)
    transitionTimerRef.current = window.setTimeout(() => {
      setScreen('journey')
      setPrepExiting(false)
      transitionTimerRef.current = null
    }, 720)
  }

  /** Write the detailed and legacy records before moving the rendered scene. */
  function persistJourneyState(nextState: JourneyState) {
    const savedState = saveJourneyState(nextState, deviceMode)
    const nextLegacy = nextJourney(nextState)
    const savedLegacy = savedState.ok ? saveJourney(nextLegacy, deviceMode) : { ok: false as const }
    if (!savedState.ok || !savedLegacy.ok) return false
    setJourneyState(nextState)
    setJourney(nextLegacy)
    return true
  }

  async function handleProfileComplete(nextProfile: Profile): Promise<SaveAttempt> {
    const savedProfile = saveProfile(nextProfile, deviceMode)
    if (!savedProfile.ok) return { ok: false }

    if (profile) {
      setProfile(nextProfile)
      setNotice('선택 정보를 저장했습니다. 진행 중인 여정은 그대로 유지됩니다.')
      beginJourneyTransition()
      return { ok: true }
    }

    const anonymousJourney = ensureAnonymousJourneyId(deviceMode)
    const initialState = createJourneyState()
    if (!anonymousJourney.ok || !persistJourneyState(initialState)) {
      clearActiveSession(deviceMode)
      return { ok: false }
    }
    setProfile(nextProfile)
    setNotice('모험 준비가 저장되었습니다. 이제 나만의 교실 플레이를 찾아볼까요?')
    beginJourneyTransition()
    return { ok: true }
  }

  function handleJourneyAction(action: JourneyAction) {
    if (action.type === 'RESET_NBTI' && deviceRole === 'mobile-participant') { void resetMobileRoundOne(); return }
    applyJourneyAction(action)
  }

  function applyJourneyAction(action: JourneyAction) {
    const nextState = journeyReducer(journeyState, action)
    if (nextState === journeyState) {
      if (action.type === 'NEXT_NBTI' || action.type === 'NEXT_GAME') setNotice('먼저 하나의 선택을 골라 주세요.')
      return
    }
    if (!persistJourneyState(nextState)) {
      setNotice('여정 상태를 저장하지 못했어요. 현재 화면은 그대로 유지됩니다. 잠시 후 다시 시도해 주세요.')
      return
    }
    if (action.type === 'START_NBTI') setNotice('첫 번째 선택이 나만의 교실 플레이 기록을 만듭니다.')
    if (action.type === 'NEXT_NBTI' && nextState.stage === 'nbti_result') setNotice('체험용 교실 플레이 결과가 완성되었습니다.')
    if (action.type === 'ADD_SHAKE' && nextState.stage === 'game_complete') setNotice('보물 상자가 열렸어요. 완성 카드를 확인해 보세요.')
  }

  function restartNbti() {
    const cleared = clearNbtiAndProgress(deviceMode)
    const resetState = createJourneyState('nbti_start', journeyState.audio)
    if (!cleared.ok || !persistJourneyState(resetState)) {
      setNotice('NBTI 답변을 초기화하지 못했어요. 잠시 후 다시 시도해 주세요.')
      return false
    }
    setTeacherOpen(false)
    setScreen('journey')
    setNotice('NBTI와 이어지는 게임 기록을 초기화했습니다.')
    return true
  }

  function resetActiveJourney(mode: ActiveJourneyResetMode = deviceRole === 'laptop-station' ? 'laptop-next-participant' : 'mobile-new-journey') {
    const cleared = clearActiveSession(deviceMode)
    if (!cleared.ok) {
      setNotice('현재 기기의 여정을 초기화하지 못했어요. 잠시 후 다시 시도해 주세요.')
      return false
    }
    setJourney(nextJourney(createJourneyState()))
    setJourneyState(createJourneyState())
    setProfile(null)
    setTeacherOpen(false)
    setSharedSessionGateOpen(false)
    setScreen(mode === 'laptop-next-participant' ? 'journey' : 'prep')
    setNotice(mode === 'laptop-next-participant' ? '현재 참가자 기록을 지우고 노트북 빈 자리 화면으로 돌아왔습니다.' : '이 기기의 여정을 초기화하고 모험 준비 화면으로 돌아왔습니다.')
    return true
  }

  function resumeSharedSession() {
    setSharedSessionGateOpen(false)
    setScreen(profile ? 'journey' : 'prep')
  }

  function handleTeacherAction(label: string) {
    setTeacherOpen(false)
    if (label === 'NBTI 결과 다시 보기') {
      if (!journeyState.resultCode) { setNotice('아직 NBTI 결과가 없어요. 먼저 질문 여정을 완료해 주세요.'); return }
      handleJourneyAction({ type: 'OPEN_RESULT' })
      return
    }
    setScreen('journey')
    setNotice('저장된 현재 여정으로 돌아왔습니다.')
  }

  async function resetMobileRoundOne() {
    const revocation = await revokeActivePairingCode()
    if (revocation === 'network_error') { setNotice('현재 연결 코드를 안전하게 폐기하지 못했어요. 네트워크를 확인한 뒤 다시 시도해 주세요.'); return }
    applyJourneyAction({ type: 'RESET_NBTI' })
    setNotice(revocation === 'revoked' ? '기존 연결 코드를 폐기하고 새 라운드 1을 시작합니다.' : '새 라운드 1을 시작합니다.')
  }

  function restorePairedJourney(payload: PairingPayload) {
    const now = new Date().toISOString()
    const restoredProfile: Profile = { version: 1, ...payload.profile, growthPriorities: [...payload.profile.growthPriorities], nickname: '', createdAt: now, updatedAt: now }
    const restoredState = restorePairingJourney(payload, journeyState.audio)
    const savedProfile = saveProfile(restoredProfile, deviceMode)
    if (!savedProfile.ok || !persistJourneyState(restoredState)) { setNotice('연결 기록을 이 기기에 저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.'); return }
    setProfile(restoredProfile); setScreen('journey'); setNotice('모바일의 교실 플레이 기록을 불러왔습니다.')
    clearPairingEntryQuery()
  }

  function clearPairingEntryQuery() {
    if (typeof window === 'undefined') return
    const query = deviceRole === 'laptop-station' ? '?role=laptop-station' : ''
    window.history.replaceState({}, '', `${window.location.pathname}${query}`)
  }

  if (sharedSessionGateOpen) return <SharedSessionGate onResume={resumeSharedSession} onStartNew={resetActiveJourney} />

  const showJourney = (screen === 'journey' || prepExiting) && !sharedSessionGateOpen
  return <>
    {showJourney && (profile || pairingEntryRequested) && <Suspense fallback={<div style={{ background: '#050c07', minHeight: '100svh' }} />}><JourneyApp state={journeyState} notice={notice} onAction={handleJourneyAction} onTeacherOpen={(button) => { teacherTriggerRef.current = button; setTeacherOpen(true) }} teacherTriggerRef={teacherTriggerRef} profile={profile} journeyId={journeyId} pairingEntry={pairingEntryRequested && !profile} onPaired={restorePairedJourney} onStartHere={() => { setScreen('prep'); clearPairingEntryQuery() }} onExitPairingEntry={() => { setScreen('prep'); clearPairingEntryQuery() }} onNextParticipant={() => resetActiveJourney('laptop-next-participant')} /></Suspense>}
    {screen === 'prep' && <AdventurePrepScreen initialProfile={profile} audio={journeyState.audio} exiting={prepExiting} isOffline={!online} onComplete={handleProfileComplete} onScreenChange={setTunerScreen} />}
    {profile && <TeacherPanel open={teacherOpen} profile={profile} journey={journey} deviceMode={deviceMode} returnFocusRef={teacherTriggerRef} onClose={() => setTeacherOpen(false)} onEdit={() => { setTeacherOpen(false); setScreen('prep') }} onRestartNbti={restartNbti} onResetAll={resetActiveJourney} onStartNewShared={resetActiveJourney} onPlaceholderAction={handleTeacherAction} />}
    {showJourney && profile && <EntryVisualTuner screen="main" />}
    {screen === 'prep' && <EntryVisualTuner screen={tunerScreen} />}
  </>
}
