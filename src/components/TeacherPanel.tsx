import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  CAREER_RANGE_OPTIONS,
  GROWTH_PRIORITY_OPTIONS,
  REGION_OPTIONS,
  SCHOOL_LEVEL_OPTIONS,
  optionLabel,
  type JourneyStatus,
} from '../data/adventure'
import type { DeviceMode, Journey, Profile } from '../lib/storage'
import { Icon } from './VisualPrimitives'

type PendingAction = 'restart-nbti' | 'reset-all' | 'new-participant' | null

type TeacherPanelProps = {
  open: boolean
  profile: Profile
  journey: Journey
  deviceMode: DeviceMode
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onEdit: () => void
  onRestartNbti: () => boolean
  onResetAll: () => boolean
  onStartNewShared: () => boolean
  onPlaceholderAction: (label: string) => void
}

const statusLabel: Record<JourneyStatus, string> = {
  new: '새 모험 준비 완료',
  nbti_in_progress: 'NBTI 여정 진행 중',
  nbti_complete: 'NBTI 여정 완료',
}

function confirmationCopy(action: Exclude<PendingAction, null>) {
  if (action === 'restart-nbti') {
    return {
      title: 'NBTI를 처음부터 다시 시작할까요?',
      description: '선택한 기본 정보는 유지되지만,\nNBTI 답변과 이후 진행 내용은 초기화됩니다.',
      confirm: 'NBTI 처음부터 다시하기',
    }
  }
  if (action === 'new-participant') {
    return {
      title: '이 기기의 현재 진행 내용만 지우고\n새 참가자로 시작할까요?',
      description: '이전 참가자의 다른 기기 기록은 삭제되지 않습니다.',
      confirm: '새 참가자로 시작',
    }
  }
  return {
    title: '전체 여정을 초기화할까요?',
    description: '모험 준비 정보, NBTI 답변, 이후 진행 내용이 이 기기에서 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.',
    confirm: '전체 여정 초기화',
  }
}

export function TeacherPanel({ open, profile, journey, deviceMode, returnFocusRef, onClose, onEdit, onRestartNbti, onResetAll, onStartNewShared, onPlaceholderAction }: TeacherPanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [working, setWorking] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!open) {
      setPendingAction(null)
      setWorking(false)
      setActionError('')
      return
    }
    panelRef.current?.focus()
    const manageDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled])')]
      if (!focusable.length) return
      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
      if (event.shiftKey && (currentIndex <= 0 || document.activeElement === panelRef.current)) {
        event.preventDefault()
        focusable.at(-1)?.focus()
      } else if (!event.shiftKey && (currentIndex === -1 || currentIndex === focusable.length - 1)) {
        event.preventDefault()
        focusable[0]?.focus()
      }
    }
    window.addEventListener('keydown', manageDialogKeys)
    return () => window.removeEventListener('keydown', manageDialogKeys)
  }, [onClose, open])

  function closePanel() {
    onClose()
    window.setTimeout(() => returnFocusRef.current?.focus(), 0)
  }

  function beginConfirmation(action: Exclude<PendingAction, null>) {
    setActionError('')
    setPendingAction(action)
  }

  function confirmAction() {
    if (!pendingAction) return
    setWorking(true)
    const completed = pendingAction === 'restart-nbti'
      ? onRestartNbti()
      : pendingAction === 'new-participant'
        ? onStartNewShared()
        : onResetAll()
    if (!completed) {
      setWorking(false)
      setActionError('현재 기기의 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
      return
    }
    setWorking(false)
    setPendingAction(null)
  }

  if (!open) return null

  const growthLabels = profile.growthPriorities.map((priority) => priority === 'other' ? profile.growthPriorityOther : optionLabel(GROWTH_PRIORITY_OPTIONS, priority))
  const confirmation = pendingAction ? confirmationCopy(pendingAction) : null

  return (
    <div className="teacher-panel-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closePanel() }}>
      <aside className="teacher-panel" role="dialog" aria-modal="true" aria-labelledby="teacher-panel-title" ref={panelRef} tabIndex={-1}>
        <header className="teacher-panel__header">
          <div><p>{deviceMode === 'shared' ? '공용 기기 · 현재 세션' : '나의 모험 기록'}</p><h2 id="teacher-panel-title">{profile.nickname?.trim() ? `${profile.nickname.trim()} 선생님` : '선생님'}</h2></div>
          <button className="panel-close" type="button" onClick={closePanel} aria-label="선생님 패널 닫기"><Icon name="close" /></button>
        </header>

        <section className="teacher-panel__section" aria-labelledby="teacher-profile-title">
          <h3 id="teacher-profile-title">모험 준비 정보</h3>
          <dl className="profile-summary">
            <div><dt>학교급</dt><dd>{optionLabel(SCHOOL_LEVEL_OPTIONS, profile.schoolLevel)}</dd></div>
            <div><dt>교직 경력</dt><dd>{optionLabel(CAREER_RANGE_OPTIONS, profile.careerRange)}</dd></div>
            <div><dt>지역</dt><dd>{optionLabel(REGION_OPTIONS, profile.region)}</dd></div>
            <div><dt>더 키우고 싶은 것</dt><dd><ul className="profile-summary__growth">{growthLabels.map((label) => <li key={label}>{label}</li>)}</ul></dd></div>
          </dl>
          <button className="panel-action panel-action--edit" type="button" onClick={onEdit}><Icon name="edit" size={17} /> 선택 정보 수정</button>
        </section>

        <section className="teacher-panel__section teacher-panel__section--status" aria-labelledby="teacher-status-title">
          <h3 id="teacher-status-title">현재 여정 상태</h3>
          <p><span className="status-orb" aria-hidden="true" />{statusLabel[journey.status]}</p>
          <div className="panel-link-grid">
            <button type="button" onClick={() => onPlaceholderAction('NBTI 결과 다시 보기')}><Icon name="notebook" size={17} />NBTI 결과 다시 보기</button>
            <button type="button" onClick={() => onPlaceholderAction('이어 하던 여정')}><Icon name="gamepad" size={17} />이어 하던 여정</button>
          </div>
          <button className="panel-action panel-action--restart" type="button" onClick={() => beginConfirmation('restart-nbti')}><Icon name="reset" size={17} /> NBTI 처음부터 다시하기</button>
        </section>

        <footer className="teacher-panel__footer">
          {!confirmation ? (
            <div className="panel-danger-actions">
              {deviceMode === 'shared' && <button className="panel-new-participant" type="button" onClick={() => beginConfirmation('new-participant')}><Icon name="reset" size={17} />새 참가자로 시작</button>}
              <button className="panel-reset" type="button" onClick={() => beginConfirmation('reset-all')}><Icon name="reset" size={17} />전체 여정 초기화</button>
            </div>
          ) : (
            <div className="reset-confirmation" role="alert">
              <p className="reset-confirmation__title">{confirmation.title}</p>
              <p className="reset-confirmation__description">{confirmation.description}</p>
              <div><button type="button" onClick={confirmAction} disabled={working}>{working ? '초기화하는 중…' : confirmation.confirm}</button><button type="button" onClick={() => setPendingAction(null)} disabled={working}>돌아가기</button></div>
              {actionError && <p className="reset-confirmation__error" aria-live="polite">{actionError}</p>}
            </div>
          )}
        </footer>
      </aside>
    </div>
  )
}
