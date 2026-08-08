import { useEffect, useRef } from 'react'
import './JourneyExitDialog.css'

type Props = { open: boolean; mode?: 'home' | 'next'; onContinue: () => void; onHome: () => void; onNewSession: () => void }

export function JourneyExitDialog({ open, mode = 'home', onContinue, onHome, onNewSession }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const continueRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    continueRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onContinue(); return }
      if (event.key !== 'Tab') return
      const items = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)')
      if (!items?.length) return
      const first = items[0]; const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onContinue])

  if (!open) return null
  return <div className="journey-exit-dialog__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onContinue() }}>
    <div className="journey-exit-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="journey-exit-title" aria-describedby="journey-exit-description">
      <p className="journey-kicker">여정 제어</p><h2 id="journey-exit-title">{mode === 'next' ? '다음 참가자를 준비할까요?' : '진행을 종료할까요?'}</h2>
      <p id="journey-exit-description">{mode === 'next' ? '현재 참가자의 결과를 이 기기에서 지우고 다음 참가자를 시작합니다.' : '현재 선택 내용은 이 기기에 남아 있습니다. 처음 화면으로 나가거나 새로 시작할 수 있습니다.'}</p>
      <div className="journey-exit-dialog__actions"><button ref={continueRef} type="button" onClick={onContinue}>{mode === 'next' ? '현재 결과 유지' : '계속 진행'}</button>{mode === 'home' && <button type="button" onClick={onHome}>처음 화면으로</button>}<button className="is-danger" type="button" onClick={onNewSession}>{mode === 'next' ? '다음 참가자 시작' : '새로 시작'}</button></div>
    </div>
  </div>
}
