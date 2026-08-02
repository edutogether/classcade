import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import { NBTI_QUESTIONS, NBTI_TOTAL_QUESTIONS } from '../../data/nbti.provisional'
import { getProvisionalResult } from '../../data/nbtiResults.provisional'
import { JOURNEY_SCENE_ASSETS, type JourneySceneAsset } from '../../data/sceneAssets'
import { playAudioCue } from '../../lib/audioManager'
import { toggleAudioChannel } from '../../lib/audioController'
import { AudioToggleButton } from '../../components/AudioToggleButton'
import { CompassSeal, Icon, LogoSlot } from '../../components/VisualPrimitives'
import type { JourneyAction, JourneyState } from './journeyState'
import './journey.css'

type JourneyAppProps = {
  state: JourneyState
  notice: string
  onAction: (action: JourneyAction) => void
  onTeacherOpen: (button: HTMLButtonElement) => void
  teacherTriggerRef: RefObject<HTMLButtonElement | null>
}

type SceneName = 'start' | 'question' | 'result' | 'game' | 'complete'

type SceneFrameProps = {
  scene: SceneName
  children: React.ReactNode
  state: JourneyState
  onAction: (action: JourneyAction) => void
  onTeacherOpen: (button: HTMLButtonElement) => void
  teacherTriggerRef: RefObject<HTMLButtonElement | null>
  notice: string
  compact?: boolean
}

const journeyItems = [
  { icon: 'clock' as const, title: '약 1분', detail: '간단한 여정' },
  { icon: 'spark' as const, title: '캐릭터 성장', detail: '선택이 힘이 돼요' },
  { icon: 'gamepad' as const, title: '우리 반 게임', detail: '결과와 이어져요' },
]

function JourneyHeader({ state, onAction, onTeacherOpen, teacherTriggerRef }: Pick<SceneFrameProps, 'state' | 'onAction' | 'onTeacherOpen' | 'teacherTriggerRef'>) {
  return (
    <header className="journey-header">
      <LogoSlot />
      <nav className="journey-header__nav" aria-label="여정 안내">
        <span><Icon name="school" size={16} />교실 여정</span>
        <span><Icon name="notebook" size={16} />탐험 기록</span>
        <span><Icon name="spark" size={16} />플레이 실험</span>
      </nav>
      <div className="journey-header__actions">
        <AudioToggleButton kind="bgm" enabled={state.audio.bgmEnabled} onToggle={() => onAction({ type: 'SET_AUDIO', audio: toggleAudioChannel(state.audio, 'bgm') })} />
        <AudioToggleButton kind="sfx" enabled={state.audio.sfxEnabled} onToggle={() => onAction({ type: 'SET_AUDIO', audio: toggleAudioChannel(state.audio, 'sfx') })} />
        <button className="journey-header__teacher" type="button" ref={teacherTriggerRef} onClick={() => { if (teacherTriggerRef.current) onTeacherOpen(teacherTriggerRef.current) }} aria-haspopup="dialog" aria-label="선생님 패널 열기">
          <span aria-hidden="true">교</span><b>선생님</b><Icon name="chevron" size={16} />
        </button>
      </div>
    </header>
  )
}

function SceneArt({ asset }: { asset: JourneySceneAsset }) {
  return (
    <div className={`journey-art journey-art--${asset.tone}`} aria-hidden="true">
      <img src={asset.src} alt="" style={{ objectPosition: asset.position }} />
      <div className="journey-art__wash" />
      <div className="journey-art__motes"><i /><i /><i /><i /><i /><i /></div>
      <div className="journey-art__leaves"><i /><i /><i /></div>
    </div>
  )
}

function SceneFrame({ scene, children, state, onAction, onTeacherOpen, teacherTriggerRef, notice, compact = false }: SceneFrameProps) {
  return (
    <main className={`journey-scene journey-scene--${scene}${compact ? ' is-compact' : ''}`}>
      <SceneArt asset={JOURNEY_SCENE_ASSETS[scene]} />
      <JourneyHeader state={state} onAction={onAction} onTeacherOpen={onTeacherOpen} teacherTriggerRef={teacherTriggerRef} />
      <section className="journey-scene__stage">{children}</section>
      {notice && <p className="journey-notice" aria-live="polite">{notice}</p>}
    </main>
  )
}

function PrimaryButton({ children, onClick, disabled = false, className = '' }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return <button className={`journey-button journey-button--primary ${className}`} type="button" onClick={onClick} disabled={disabled}><CompassSeal className="journey-button__seal" /><span>{children}</span><Icon name="arrow" size={25} /></button>
}

function SecondaryButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return <button className={`journey-button journey-button--secondary ${className}`} type="button" onClick={onClick}>{children}</button>
}

function StartScene({ dispatch, frameProps }: { dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  return (
    <SceneFrame scene="start" {...frameProps}>
      <div className="journey-start__copy journey-enter">
        <p className="journey-kicker"><span>✦</span> NBTI ADVENTURE <span>✦</span></p>
        <h1>당신의 교실 플레이<br /><em>모험이</em><br />시작됩니다</h1>
        <p className="journey-start__description">여러분의 선택으로 나의 교실 유형을 발견하고,<br />선생님 캐릭터를 성장시켜 보세요.</p>
        <ul className="journey-start__cards" aria-label="여정 정보">
          {journeyItems.map((item) => <li key={item.title}><Icon name={item.icon} size={25} /><span><b>{item.title}</b><small>{item.detail}</small></span></li>)}
        </ul>
        <div className="journey-start__actions">
          <PrimaryButton onClick={() => dispatch({ type: 'START_NBTI' })}>교실 NBTI 시작하기</PrimaryButton>
          <SecondaryButton onClick={() => dispatch({ type: 'RESET_NBTI' })}><Icon name="reset" size={20} />처음부터 준비하기</SecondaryButton>
        </div>
        <p className="journey-start__audio-note"><Icon name="speaker" size={15} />사운드 옵션은 준비되어 있어요. 승인된 오디오 자산 전까지는 무음으로 동작합니다.</p>
      </div>
      <aside className="journey-start__quest-board" aria-label="오늘의 모험 안내">
        <b>✦ 오늘의 모험 안내 ✦</b>
        <span><Icon name="notebook" size={16} />나의 교실 유형 찾기</span>
        <span><Icon name="spark" size={16} />캐릭터 성장</span>
        <span><Icon name="gamepad" size={16} />학급 게임 연결</span>
      </aside>
    </SceneFrame>
  )
}

function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)))
  return <div className="journey-progress" aria-label={`${label} ${current} / ${total}`}><div><b>{label}</b><span>{current} / {total}</span></div><div className="journey-progress__track"><i style={{ width: `${percent}%` }} /></div></div>
}

function QuestionScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  const question = NBTI_QUESTIONS[state.questionIndex]
  const selected = state.answers[question.id]
  const last = state.questionIndex === NBTI_TOTAL_QUESTIONS - 1
  return (
    <SceneFrame scene="question" {...frameProps} compact>
      <div className="journey-panel journey-question journey-enter">
        <div className="journey-panel__topline"><p>CLASS PLAY EXPLORATION · PROVISIONAL</p><Progress current={state.questionIndex + 1} total={NBTI_TOTAL_QUESTIONS} label={`질문 ${state.questionIndex + 1}`} /></div>
        <div className="journey-question__body">
          <div className="journey-question__copy"><p className="journey-kicker">{question.chapter}</p><h1>{question.prompt}</h1><p>{question.helper}</p></div>
          <div className="journey-question__choices" role="group" aria-label={question.prompt}>
            {question.choices.map((choice, index) => (
              <button className={`journey-choice ${selected === choice.id ? 'is-selected' : ''}`} type="button" key={choice.id} onClick={() => dispatch({ type: 'ANSWER_NBTI', questionId: question.id, choiceId: choice.id })} aria-pressed={selected === choice.id}>
                <span className="journey-choice__number">0{index + 1}</span><b>{choice.label}</b><small>{choice.detail}</small><i aria-hidden="true"><Icon name={index ? 'spark' : 'notebook'} size={29} /></i>
              </button>
            ))}
          </div>
        </div>
        <div className="journey-panel__footer">
          <SecondaryButton onClick={() => dispatch({ type: 'PREVIOUS_NBTI' })} className="journey-button--back" ><span aria-hidden="true">←</span> 이전 질문</SecondaryButton>
          <PrimaryButton onClick={() => dispatch({ type: 'NEXT_NBTI' })} disabled={!selected}>{last ? '나의 플레이 결과 보기' : '다음 질문으로'}</PrimaryButton>
        </div>
        <p className="journey-panel__fineprint">이 탐색은 체험용 교실 플레이 안내이며, 과학적 성격 진단이 아닙니다.</p>
      </div>
    </SceneFrame>
  )
}

function ResultScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  const result = getProvisionalResult(state.resultCode)
  return (
    <SceneFrame scene="result" {...frameProps}>
      <div className={`journey-result journey-result--${result.palette} journey-enter`}>
        <div className="journey-result__copy"><p className="journey-kicker">✦ NBTI PLAY RESULT · PROVISIONAL ✦</p><p className="journey-result__eyebrow">나의 교실 플레이 타입</p><h1>{result.title}</h1><p className="journey-result__code">{result.code}</p><p className="journey-result__description">{result.description}</p><div className="journey-result__strengths">{result.strengths.map((strength) => <span key={strength}><Icon name="spark" size={16} />{strength}</span>)}</div><p className="journey-result__disclaimer">공식 진단이 아닌 체험용 탐색 결과입니다.</p><PrimaryButton onClick={() => dispatch({ type: 'OPEN_GAME_INTRO' })}>나의 다음 게임 열기</PrimaryButton><SecondaryButton onClick={() => dispatch({ type: 'RESET_NBTI' })}><Icon name="reset" size={19} />다시 탐색하기</SecondaryButton></div>
        <aside className="journey-result__reveal" aria-label="결과 해금 연출"><CompassSeal /><p>{result.subtitle}</p><span>빛나는 문양이 기록되었습니다</span><i /><i /><i /></aside>
      </div>
    </SceneFrame>
  )
}

function GameIntroScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  const variant = getGameVariantForResult(state.resultCode)
  return (
    <SceneFrame scene="game" {...frameProps}>
      <div className="journey-game-intro journey-enter"><p className="journey-kicker">RESULT-DEPENDENT CLASS QUEST</p><p className="journey-game-intro__badge"><Icon name="spark" size={16} />{getProvisionalResult(state.resultCode).title}에게 열린 퀘스트</p><h1>{variant.title}</h1><p>{variant.summary}</p><div className="journey-game-intro__facts"><span><Icon name="gamepad" size={23} />선택형 학급 게임</span><span><Icon name="clock" size={23} />약 2분 체험</span><span><Icon name="share" size={23} />완성 카드 저장</span></div><PrimaryButton onClick={() => dispatch({ type: 'START_GAME' })}>이 퀘스트 시작하기</PrimaryButton><SecondaryButton onClick={() => dispatch({ type: 'OPEN_RESULT' })}>NBTI 결과 다시 보기</SecondaryButton></div>
    </SceneFrame>
  )
}

function GameChoiceScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  const variant = getGameVariantForResult(state.resultCode)
  const choice = variant.choices[state.gameStep]
  const selected = state.gameChoices[choice.id]
  const last = state.gameStep === variant.choices.length - 1
  return (
    <SceneFrame scene="game" {...frameProps} compact>
      <div className="journey-panel journey-game-choice journey-enter"><div className="journey-panel__topline"><p>{variant.title}</p><Progress current={state.gameStep + 1} total={variant.choices.length} label="퀘스트 선택" /></div><div className="journey-game-choice__body"><p className="journey-kicker">CLASS QUEST CHOICE</p><h1>{choice.prompt}</h1><p>{choice.helper}</p><div className="journey-game-choice__options" role="group" aria-label={choice.prompt}>{choice.options.map((option, index) => <button key={option.id} className={`journey-choice journey-choice--game ${selected === option.id ? 'is-selected' : ''}`} type="button" onClick={() => dispatch({ type: 'ANSWER_GAME', choiceId: option.id })} aria-pressed={selected === option.id}><span className="journey-choice__number">0{index + 1}</span><b>{option.label}</b><small>{option.detail}</small><i aria-hidden="true"><Icon name={index ? 'spark' : 'gamepad'} size={29} /></i></button>)}</div></div><div className="journey-panel__footer"><span className="journey-panel__fineprint">선택은 마지막 완성 카드에 반영됩니다.</span><PrimaryButton onClick={() => dispatch({ type: 'NEXT_GAME' })} disabled={!selected}>{last ? '보물 상자 열기' : '다음 선택으로'}</PrimaryButton></div></div>
    </SceneFrame>
  )
}

function ShakeScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  return <SceneFrame scene="game" {...frameProps}><ShakeInteraction progress={state.shakeProgress} onProgress={(amount) => dispatch({ type: 'ADD_SHAKE', amount })} /></SceneFrame>
}

function ShakeInteraction({ progress, onProgress }: { progress: number; onProgress: (amount: number) => void }) {
  const [motionEnabled, setMotionEnabled] = useState(false)
  const [motionMessage, setMotionMessage] = useState('휴대폰에서는 기기 흔들기를 허용할 수 있어요.')
  const lastMagnitude = useRef(0)

  useEffect(() => {
    if (!motionEnabled) return
    const handleMotion = (event: DeviceMotionEvent) => {
      const data = event.accelerationIncludingGravity
      const magnitude = Math.abs(data?.x ?? 0) + Math.abs(data?.y ?? 0) + Math.abs(data?.z ?? 0)
      if (magnitude > 25 && Date.now() - lastMagnitude.current > 360) { lastMagnitude.current = Date.now(); onProgress(10) }
    }
    window.addEventListener('devicemotion', handleMotion)
    return () => window.removeEventListener('devicemotion', handleMotion)
  }, [motionEnabled, onProgress])

  async function enableMotion() {
    try {
      const motionEvent = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }
      if (motionEvent.requestPermission) {
        const permission = await motionEvent.requestPermission()
        if (permission !== 'granted') { setMotionMessage('기기 흔들기 권한이 허용되지 않았어요. 아래 버튼으로 계속할 수 있어요.'); return }
      }
      setMotionEnabled(true)
      setMotionMessage('기기를 흔들거나 아래 버튼을 눌러 보물 상자를 열어 주세요.')
    } catch { setMotionMessage('기기 흔들기를 사용할 수 없어요. 아래 버튼으로 계속할 수 있어요.') }
  }

  return <div className="journey-shake journey-enter"><p className="journey-kicker">FINAL CLASS QUEST</p><div className="journey-shake__chest" aria-hidden="true"><CompassSeal /><i /><i /><i /></div><h1>보물 상자를 열어 볼까요?</h1><p>{motionMessage}</p><Progress current={progress} total={100} label="해금 진행" /><div className="journey-shake__actions"><PrimaryButton onClick={() => { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(12); onProgress(25) }}>별빛을 모으기</PrimaryButton>{!motionEnabled && <SecondaryButton onClick={() => void enableMotion()}><Icon name="spark" size={19} />기기 흔들기 허용</SecondaryButton>}</div><small>키보드에서는 ‘별빛을 모으기’ 버튼을 Space 또는 Enter로 눌러 같은 흐름을 진행할 수 있어요.</small></div>
}

function selectionSummary(state: JourneyState) {
  const variant = getGameVariantForResult(state.resultCode)
  return variant.choices.map((choice) => choice.options.find((option) => option.id === state.gameChoices[choice.id])?.label).filter(Boolean).join(' · ')
}

function CompleteScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  const result = getProvisionalResult(state.resultCode)
  const variant = getGameVariantForResult(state.resultCode)
  return <SceneFrame scene="complete" {...frameProps}><div className="journey-complete journey-enter"><p className="journey-kicker">✦ QUEST COMPLETE ✦</p><h1>{variant.title}<br />완성</h1><p className="journey-complete__lead">{result.title}의 선택으로 우리 반 퀘스트가 한 장면 완성되었어요.</p><article className="journey-complete__card"><CompassSeal /><div><span>오늘의 완성 기록</span><b>{selectionSummary(state)}</b><small>{state.completedAt ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(state.completedAt)) : '오늘'}</small></div></article><PrimaryButton onClick={() => dispatch({ type: 'OPEN_SHARING' })}>완성 카드 저장·공유</PrimaryButton><SecondaryButton onClick={() => dispatch({ type: 'OPEN_RESULT' })}>NBTI 결과 보기</SecondaryButton></div></SceneFrame>
}

function ShareScene({ state, dispatch, frameProps }: { state: JourneyState; dispatch: (action: JourneyAction) => void; frameProps: Omit<SceneFrameProps, 'scene' | 'children'> }) {
  const result = getProvisionalResult(state.resultCode)
  const variant = getGameVariantForResult(state.resultCode)
  const summary = selectionSummary(state)
  return <SceneFrame scene="complete" {...frameProps} compact><ShareActions resultTitle={result.title} gameTitle={variant.title} summary={summary} onClose={() => dispatch({ type: 'CLOSE_SHARING' })} /></SceneFrame>
}

function ShareActions({ resultTitle, gameTitle, summary, onClose }: { resultTitle: string; gameTitle: string; summary: string; onClose: () => void }) {
  const [message, setMessage] = useState('저장 또는 공유할 방법을 선택해 주세요.')
  const url = typeof window === 'undefined' ? '' : window.location.href
  const shareText = `${resultTitle}의 CLASSCADE 퀘스트: ${gameTitle} · ${summary}`
  const exportSvg = useMemo(() => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#07130c"/><circle cx="990" cy="130" r="260" fill="#27593e" opacity=".6"/><text x="80" y="125" fill="#e9c96c" font-size="28" font-family="sans-serif" letter-spacing="5">CLASSCADE · QUEST COMPLETE</text><text x="80" y="240" fill="#fff6d6" font-size="68" font-weight="700" font-family="sans-serif">${escapeSvg(gameTitle)}</text><text x="80" y="330" fill="#d9e5bd" font-size="38" font-family="sans-serif">${escapeSvg(resultTitle)}</text><text x="80" y="420" fill="#f2e4be" font-size="30" font-family="sans-serif">${escapeSvg(summary || '우리 반의 새로운 모험')}</text><text x="80" y="550" fill="#abc59a" font-size="22" font-family="sans-serif">체험용 교실 플레이 완성 카드</text></svg>`, [gameTitle, resultTitle, summary])

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(url)
      setMessage('현재 페이지 링크를 클립보드에 복사했어요.')
    } catch { setMessage('이 브라우저에서는 자동 복사가 허용되지 않았어요. 주소창의 링크를 직접 복사해 주세요.') }
  }

  async function nativeShare() {
    if (!navigator.share) { await copyLink(); return }
    try { await navigator.share({ title: 'CLASSCADE 퀘스트 완성', text: shareText, url }); setMessage('기기의 공유 창을 통해 전송했어요.') } catch { setMessage('공유를 취소했거나 이 기기에서 공유를 완료하지 않았어요.') }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  }

  async function downloadCard() {
    try {
      const svgBlob = new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' })
      const imageUrl = URL.createObjectURL(svgBlob)
      const image = new Image()
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('image conversion failed')); image.src = imageUrl })
      const canvas = document.createElement('canvas')
      canvas.width = 1200
      canvas.height = 630
      const context = canvas.getContext('2d')
      if (!context) throw new Error('canvas unavailable')
      context.drawImage(image, 0, 0)
      URL.revokeObjectURL(imageUrl)
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!pngBlob) throw new Error('png conversion failed')
      downloadBlob(pngBlob, 'classcade-quest-complete.png')
      setMessage('완성 카드를 PNG 이미지로 저장했어요.')
    } catch {
      try {
        downloadBlob(new Blob([exportSvg], { type: 'image/svg+xml;charset=utf-8' }), 'classcade-quest-complete.svg')
        setMessage('PNG 변환은 지원되지 않아 SVG 완성 카드를 저장했어요.')
      } catch { setMessage('이미지 저장을 시작하지 못했어요. 브라우저의 다운로드 권한을 확인해 주세요.') }
    }
  }

  return <div className="journey-share journey-enter"><p className="journey-kicker">SAVE & SHARE</p><h1>오늘의 모험을<br />기록으로 남기세요</h1><p>{shareText}</p><div className="journey-share__preview"><CompassSeal /><span>{gameTitle}</span><b>{resultTitle}</b></div><div className="journey-share__actions"><PrimaryButton onClick={downloadCard}>이미지 저장</PrimaryButton><SecondaryButton onClick={() => void nativeShare()}><Icon name="share" size={19} />기기 공유</SecondaryButton><SecondaryButton onClick={() => void copyLink()}><Icon name="notebook" size={19} />링크 복사</SecondaryButton></div><p className="journey-share__message" aria-live="polite">{message}</p><button className="journey-share__close" type="button" onClick={onClose}>완성 화면으로 돌아가기</button></div>
}

function escapeSvg(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character] ?? character) }

export function JourneyApp({ state, notice, onAction, onTeacherOpen, teacherTriggerRef }: JourneyAppProps) {
  const frameProps = { state, onAction, onTeacherOpen, teacherTriggerRef, notice }
  const dispatch = (action: JourneyAction) => {
    if (['ANSWER_NBTI', 'ANSWER_GAME', 'NEXT_NBTI', 'NEXT_GAME'].includes(action.type)) playAudioCue('choice', state.audio)
    if (action.type === 'OPEN_GAME_INTRO') playAudioCue('reveal', state.audio)
    if (action.type === 'OPEN_SHARING') playAudioCue('complete', state.audio)
    onAction(action)
  }
  if (state.stage === 'nbti_start') return <StartScene dispatch={dispatch} frameProps={frameProps} />
  if (state.stage === 'nbti_question') return <QuestionScene state={state} dispatch={dispatch} frameProps={frameProps} />
  if (state.stage === 'nbti_result') return <ResultScene state={state} dispatch={dispatch} frameProps={frameProps} />
  if (state.stage === 'game_intro') return <GameIntroScene state={state} dispatch={dispatch} frameProps={frameProps} />
  if (state.stage === 'game_choice') return <GameChoiceScene state={state} dispatch={dispatch} frameProps={frameProps} />
  if (state.stage === 'game_shake') return <ShakeScene state={state} dispatch={dispatch} frameProps={frameProps} />
  if (state.stage === 'game_complete') return <CompleteScene state={state} dispatch={dispatch} frameProps={frameProps} />
  return <ShareScene state={state} dispatch={dispatch} frameProps={frameProps} />
}
