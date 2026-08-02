import { useEffect, useRef, useState } from 'react'
import portalAcademy from '../assets/portal-academy-background.png'
import { CompassSeal, Icon } from './VisualPrimitives'

type SharedSessionGateProps = {
  onResume: () => void
  onStartNew: () => boolean
}

/** A neutral gate: shared-device visitors never see a prior participant's profile or result. */
export function SharedSessionGate({ onResume, onStartNew }: SharedSessionGateProps) {
  const [confirming, setConfirming] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')
  const resumeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!confirming) resumeButtonRef.current?.focus()
  }, [confirming])

  function beginNewParticipant() {
    setError('')
    setConfirming(true)
  }

  function confirmNewParticipant() {
    setClearing(true)
    const completed = onStartNew()
    if (!completed) {
      setClearing(false)
      setError('현재 기기의 진행 내용을 지우지 못했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <main className="shared-session-scene" aria-labelledby="shared-session-title">
      <div className="shared-session-scene__world" aria-hidden="true"><img src={portalAcademy} alt="" /></div>
      <div className="shared-session-scene__vignette" aria-hidden="true" />
      <div className="shared-session-scene__motes" aria-hidden="true"><i /><i /><i /><i /></div>
      <section className="shared-session-gate" role="dialog" aria-modal="true" aria-labelledby="shared-session-title">
        {!confirming ? (
          <>
            <CompassSeal className="shared-session-gate__seal" />
            <p className="parchment-kicker"><span>✦</span> SHARED DEVICE <span>✦</span></p>
            <h1 id="shared-session-title">이 기기에 진행 중인 여정이 있습니다</h1>
            <p className="shared-session-gate__description">이어서 진행하거나 새 참가자로 시작할 수 있어요.</p>
            <div className="shared-session-gate__actions">
              <button ref={resumeButtonRef} className="shared-session-gate__resume" type="button" onClick={onResume}><Icon name="arrow" size={20} />이어서 진행하기</button>
              <button className="shared-session-gate__new" type="button" onClick={beginNewParticipant}><Icon name="reset" size={19} />새 참가자로 시작</button>
            </div>
          </>
        ) : (
          <>
            <p className="parchment-kicker"><span>✦</span> NEW PARTICIPANT <span>✦</span></p>
            <h1 id="shared-session-title" className="shared-session-gate__confirmation-title">이 기기의 현재 진행 내용만 지우고{`\n`}새 참가자로 시작할까요?</h1>
            <p className="shared-session-gate__description">이전 참가자의 다른 기기 기록은 삭제되지 않습니다.</p>
            <div className="shared-session-gate__actions">
              <button className="shared-session-gate__resume" type="button" onClick={confirmNewParticipant} disabled={clearing}>{clearing ? '진행 내용을 지우는 중…' : '현재 기기만 초기화'}</button>
              <button className="shared-session-gate__new" type="button" onClick={() => setConfirming(false)} disabled={clearing}>돌아가기</button>
            </div>
            {error && <p className="shared-session-gate__error" aria-live="polite">{error}</p>}
          </>
        )}
      </section>
    </main>
  )
}
