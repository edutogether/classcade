import { useEffect, useMemo, useRef, useState } from 'react'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { getGameVariantForResult } from '../../../data/gameVariants.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'
import type { JourneyState } from '../journeyState'

export function GameIntroScene(props: JourneySceneProps) {
  const variant = getGameVariantForResult(props.state.resultCode)
  return (
    <SceneFrame scene="game" {...props}>
      <div className="journey-game-intro journey-enter"><p className="journey-game-intro__badge"><Icon name="spark" size={16} />{getProvisionalResult(props.state.resultCode).title}에게 열린 퀘스트</p><h1>{variant.title}</h1><p>{variant.summary}</p><div className="journey-game-intro__facts"><span><Icon name="gamepad" size={23} />선택형 학급 게임</span><span><Icon name="clock" size={23} />약 2분 체험</span><span><Icon name="share" size={23} />완성 카드 저장</span></div><PrimaryButton onClick={() => props.onAction({ type: 'START_GAME' })}>이 퀘스트 시작하기</PrimaryButton><SecondaryButton onClick={() => props.onAction({ type: 'OPEN_RESULT' })}>NBTI 결과 다시 보기</SecondaryButton></div>
    </SceneFrame>
  )
}

export function GameChoiceScene(props: JourneySceneProps) {
  const variant = getGameVariantForResult(props.state.resultCode)
  const choice = variant.choices[props.state.gameStep]
  const selected = props.state.gameChoices[choice.id]
  const last = props.state.gameStep === variant.choices.length - 1
  return (
    <SceneFrame scene="game" {...props} compact>
      <div className="journey-panel journey-game-choice journey-enter"><div className="journey-panel__topline"><p>{variant.title}</p><Progress current={props.state.gameStep + 1} total={variant.choices.length} label="퀘스트 선택" /></div><div className="journey-game-choice__body"><h1>{choice.prompt}</h1><p>{choice.helper}</p><div className="journey-game-choice__options" role="group" aria-label={choice.prompt}>{choice.options.map((option, index) => <button key={option.id} className={`journey-choice journey-choice--game ${selected === option.id ? 'is-selected' : ''}`} type="button" onClick={() => props.onAction({ type: 'ANSWER_GAME', choiceId: option.id })} aria-pressed={selected === option.id}><span className="journey-choice__number">0{index + 1}</span><b>{option.label}</b><small>{option.detail}</small><i aria-hidden="true"><Icon name={index ? 'spark' : 'gamepad'} size={29} /></i></button>)}</div></div><div className="journey-panel__footer"><span className="journey-panel__fineprint">선택은 마지막 완성 카드에 반영됩니다.</span><PrimaryButton onClick={() => props.onAction({ type: 'NEXT_GAME' })} disabled={!selected}>{last ? '보물 상자 열기' : '다음 선택으로'}</PrimaryButton></div></div>
    </SceneFrame>
  )
}

export function ShakeScene(props: JourneySceneProps) {
  return <SceneFrame scene="game" {...props}><ShakeInteraction progress={props.state.shakeProgress} onProgress={(amount) => props.onAction({ type: 'ADD_SHAKE', amount })} /></SceneFrame>
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

  return <div className="journey-shake journey-enter"><div className="journey-shake__chest" aria-hidden="true"><CompassSeal /><i /><i /><i /></div><h1>보물 상자를 열어 볼까요?</h1><p>{motionMessage}</p><Progress current={progress} total={100} label="해금 진행" /><div className="journey-shake__actions"><PrimaryButton onClick={() => { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(12); onProgress(25) }}>별빛을 모으기</PrimaryButton>{!motionEnabled && <SecondaryButton onClick={() => void enableMotion()}><Icon name="spark" size={19} />기기 흔들기 허용</SecondaryButton>}</div><small>키보드에서는 ‘별빛을 모으기’ 버튼을 Space 또는 Enter로 눌러 같은 흐름을 진행할 수 있어요.</small></div>
}

function selectionSummary(state: JourneyState) {
  const variant = getGameVariantForResult(state.resultCode)
  return variant.choices.map((choice) => choice.options.find((option) => option.id === state.gameChoices[choice.id])?.label).filter(Boolean).join(' · ')
}

export function CompleteScene(props: JourneySceneProps) {
  const result = getProvisionalResult(props.state.resultCode)
  const variant = getGameVariantForResult(props.state.resultCode)
  return <SceneFrame scene="complete" {...props}><div className="journey-complete journey-enter"><p className="journey-kicker">✦ 퀘스트 완성 ✦</p><h1>{variant.title}<br />완성</h1><p className="journey-complete__lead">{result.title}의 선택으로 우리 반 퀘스트가 한 장면 완성되었어요.</p><article className="journey-complete__card"><CompassSeal /><div><span>오늘의 완성 기록</span><b>{selectionSummary(props.state)}</b><small>{props.state.completedAt ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(props.state.completedAt)) : '오늘'}</small></div></article><PrimaryButton onClick={() => props.onAction({ type: 'OPEN_SHARING' })}>완성 카드 저장·공유</PrimaryButton><SecondaryButton onClick={() => props.onAction({ type: 'OPEN_RESULT' })}>NBTI 결과 보기</SecondaryButton></div></SceneFrame>
}

export function ShareScene(props: JourneySceneProps) {
  const result = getProvisionalResult(props.state.resultCode)
  const variant = getGameVariantForResult(props.state.resultCode)
  const summary = selectionSummary(props.state)
  return <SceneFrame scene="complete" {...props} compact><ShareActions resultTitle={result.title} gameTitle={variant.title} summary={summary} onClose={() => props.onAction({ type: 'CLOSE_SHARING' })} /></SceneFrame>
}

function ShareActions({ resultTitle, gameTitle, summary, onClose }: { resultTitle: string; gameTitle: string; summary: string; onClose: () => void }) {
  const [message, setMessage] = useState('저장 또는 공유할 방법을 선택해 주세요.')
  const url = typeof window === 'undefined' ? '' : window.location.href
  const shareText = `${resultTitle}의 CLASSCADE 퀘스트: ${gameTitle} · ${summary}`
  const exportSvg = useMemo(() => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#07130c"/><circle cx="990" cy="130" r="260" fill="#27593e" opacity=".6"/><text x="80" y="125" fill="#e9c96c" font-size="28" font-family="sans-serif" letter-spacing="5">CLASSCADE · 퀘스트 완성</text><text x="80" y="240" fill="#fff6d6" font-size="68" font-weight="700" font-family="sans-serif">${escapeSvg(gameTitle)}</text><text x="80" y="330" fill="#d9e5bd" font-size="38" font-family="sans-serif">${escapeSvg(resultTitle)}</text><text x="80" y="420" fill="#f2e4be" font-size="30" font-family="sans-serif">${escapeSvg(summary || '우리 반의 새로운 모험')}</text><text x="80" y="550" fill="#abc59a" font-size="22" font-family="sans-serif">체험용 교실 플레이 완성 카드</text></svg>`, [gameTitle, resultTitle, summary])

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

  return <div className="journey-share journey-enter"><p className="journey-kicker">완성 카드</p><h1>오늘의 모험을<br />기록으로 남기세요</h1><p>{shareText}</p><div className="journey-share__preview"><CompassSeal /><span>{gameTitle}</span><b>{resultTitle}</b></div><div className="journey-share__actions"><PrimaryButton onClick={downloadCard}>이미지 저장</PrimaryButton><SecondaryButton onClick={() => void nativeShare()}><Icon name="share" size={19} />기기 공유</SecondaryButton><SecondaryButton onClick={() => void copyLink()}><Icon name="notebook" size={19} />링크 복사</SecondaryButton></div><p className="journey-share__message" aria-live="polite">{message}</p><button className="journey-share__close" type="button" onClick={onClose}>완성 화면으로 돌아가기</button></div>
}

function escapeSvg(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character] ?? character)
}
