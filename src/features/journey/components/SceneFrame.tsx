import type { CSSProperties, ReactNode, RefObject } from 'react'
import { AudioToggleButton } from '../../../components/AudioToggleButton'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { JOURNEY_SCENE_ASSETS, type JourneySceneAsset } from '../../../data/sceneAssets'
import { toggleAudioChannel } from '../../../lib/audioController'
import type { JourneyAction, JourneyState } from '../journeyState'

export type SceneName = 'start' | 'question' | 'result' | 'game' | 'complete'

type SceneContext = {
  state: JourneyState
  onAction: (action: JourneyAction) => void
  onTeacherOpen: (button: HTMLButtonElement) => void
  teacherTriggerRef: RefObject<HTMLButtonElement | null>
  notice: string
}

export type JourneySceneProps = SceneContext

type SceneFrameProps = SceneContext & {
  scene: SceneName
  children: ReactNode
  compact?: boolean
}

function JourneyHeader({ state, onAction, onTeacherOpen, teacherTriggerRef }: Omit<SceneContext, 'notice'>) {
  return (
    <header className="journey-header">
      <div className="logo-slot" aria-label="브랜드 로고"><CompassSeal /></div>
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
      <img src={asset.src} alt="" style={{ '--scene-position': asset.position } as CSSProperties} />
      <div className="journey-art__wash" />
      <div className="journey-art__motes"><i /><i /><i /><i /><i /><i /></div>
      <div className="journey-art__leaves"><i /><i /><i /></div>
    </div>
  )
}

export function SceneFrame({ scene, children, state, onAction, onTeacherOpen, teacherTriggerRef, notice, compact = false }: SceneFrameProps) {
  return (
    <main className={`journey-scene journey-scene--${scene}${compact ? ' is-compact' : ''}`}>
      <SceneArt asset={JOURNEY_SCENE_ASSETS[scene]} />
      <JourneyHeader state={state} onAction={onAction} onTeacherOpen={onTeacherOpen} teacherTriggerRef={teacherTriggerRef} />
      <section className="journey-scene__stage">{children}</section>
      {notice && scene !== 'question' && <p className="journey-notice" aria-live="polite">{notice}</p>}
    </main>
  )
}

export function PrimaryButton({ children, onClick, disabled = false, className = '' }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return <button className={`journey-button journey-button--primary ${className}`} type="button" onClick={onClick} disabled={disabled}><CompassSeal className="journey-button__seal" /><span>{children}</span><Icon name="arrow" size={25} /></button>
}

export function SecondaryButton({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) {
  return <button className={`journey-button journey-button--secondary ${className}`} type="button" onClick={onClick}>{children}</button>
}

export function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)))
  return <div className="journey-progress" aria-label={`${label} ${current} / ${total}`}><div><b>{label}</b><span>{current} / {total}</span></div><div className="journey-progress__track"><i style={{ width: `${percent}%` }} /></div></div>
}
