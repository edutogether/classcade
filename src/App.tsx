import { useEffect, useRef, useState } from 'react'
import { AdventurePrepScreen } from './components/AdventurePrepScreen'
import { SharedSessionGate } from './components/SharedSessionGate'
import { TeacherPanel } from './components/TeacherPanel'
import { JourneyApp } from './features/journey/JourneyApp'
import { loadJourneyState, saveJourneyState } from './features/journey/journeyPersistence'
import { createJourneyState, journeyReducer, journeyStatusForStage, type JourneyAction, type JourneyState } from './features/journey/journeyState'
import { resolveEntryState } from './lib/entryState'
import { preloadMainTheme } from './lib/audioManager'
import { Front120VisualTuner } from './features/front120/Front120VisualTuner'
import { applyTuning, createTuning, type TunerScreen } from './features/front120/visualTuning'
import {
  clearActiveSession,
  clearNbtiAndProgress,
  ensureAnonymousJourneyId,
  hasActiveSession,
  loadJourney,
  loadProfile,
  resolveDeviceMode,
  saveJourney,
  saveProfile,
  type DeviceMode,
  type Journey,
  type Profile,
} from './lib/storage'
import './App.css'

type Screen = 'prep' | 'journey'
type SaveAttempt = { ok: true } | { ok: false }

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
  const [profile, setProfile] = useState<Profile | null>(boot.profileResult.value)
  const [journey, setJourney] = useState<Journey>(boot.journeyResult.value)
  const [journeyState, setJourneyState] = useState<JourneyState>(() => boot.detailedJourneyResult.value ?? createJourneyState())
  const [screen, setScreen] = useState<Screen>(initialEntryState.screen === 'start' ? 'journey' : 'prep')
  const [sharedSessionGateOpen, setSharedSessionGateOpen] = useState(initialEntryState.sharedSessionGateOpen)
  const [prepExiting, setPrepExiting] = useState(false)
  const [teacherOpen, setTeacherOpen] = useState(false)
  const [tunerScreen, setTunerScreen] = useState<TunerScreen>(initialEntryState.screen === 'start' ? 'main' : 'prep-1')
  const [notice, setNotice] = useState(boot.detailedJourneyResult.ok ? '' : '이전 여정 상태를 복원하지 못해 새 여정으로 안전하게 시작합니다.')
  const [online, setOnline] = useState(isBrowserOnline)
  const teacherTriggerRef = useRef<HTMLButtonElement>(null)
  const transitionTimerRef = useRef<number | null>(null)

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

  function resetActiveJourney() {
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
    setScreen('prep')
    setNotice(deviceMode === 'shared' ? '이 기기의 진행 내용을 지우고 새 참가자 준비 화면으로 돌아왔습니다.' : '이 기기의 여정을 초기화하고 모험 준비 화면으로 돌아왔습니다.')
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

  if (sharedSessionGateOpen) return <SharedSessionGate onResume={resumeSharedSession} onStartNew={resetActiveJourney} />

  const showJourney = (screen === 'journey' || prepExiting) && !sharedSessionGateOpen
  return <>
    {showJourney && profile && <JourneyApp state={journeyState} notice={notice} onAction={handleJourneyAction} onTeacherOpen={(button) => { teacherTriggerRef.current = button; setTeacherOpen(true) }} teacherTriggerRef={teacherTriggerRef} />}
    {screen === 'prep' && <AdventurePrepScreen initialProfile={profile} audio={journeyState.audio} exiting={prepExiting} isOffline={!online} onComplete={handleProfileComplete} onScreenChange={setTunerScreen} />}
    {profile && <TeacherPanel open={teacherOpen} profile={profile} journey={journey} deviceMode={deviceMode} returnFocusRef={teacherTriggerRef} onClose={() => setTeacherOpen(false)} onEdit={() => { setTeacherOpen(false); setScreen('prep') }} onRestartNbti={restartNbti} onResetAll={resetActiveJourney} onStartNewShared={resetActiveJourney} onPlaceholderAction={handleTeacherAction} />}
    {showJourney && profile && <Front120VisualTuner screen="main" />}
    {screen === 'prep' && <Front120VisualTuner screen={tunerScreen} />}
  </>
}
