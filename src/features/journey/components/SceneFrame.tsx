import { useEffect, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { BgmControl } from '../../../components/BgmControl'
import { SCENE_THEMES } from '../../../lib/audioSceneThemes'
import { ClasscadeEmblem, ClasscadeWordmark, CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { moteHash } from '../../../lib/moteHash'
import profileAvatar from '../../../assets/brand/profile-avatar-front.webp'
import classcadeWordmarkTrimmed from '../../../assets/brand/classcade-wordmark-trimmed.webp'
import { JOURNEY_SCENE_ASSETS, type JourneySceneAsset } from '../../../data/sceneAssets'
import { toggleAudioChannel } from '../../../lib/audioController'
import type { JourneyAction, JourneyState } from '../journeyState'
import type { Profile } from '../../../lib/storage'
import './JourneyControls.css'

export type SceneName = 'start' | 'question' | 'result' | 'game' | 'complete'

type SceneContext = {
  state: JourneyState
  onAction: (action: JourneyAction) => void
  onTeacherOpen: (button: HTMLButtonElement) => void
  teacherTriggerRef: RefObject<HTMLButtonElement | null>
  notice: string
  profile?: Profile
  onRequestHome?: () => void
  onNextParticipant?: () => void
}

export type JourneySceneProps = SceneContext

type SceneFrameProps = SceneContext & {
  scene: SceneName
  children: ReactNode
  compact?: boolean
  artSrc?: string
  canonicalGame?: boolean
}

/* Header shows whichever track this scene is actually playing. */
const SCENE_BGM_TITLE: Record<SceneName, string> = {
  start: SCENE_THEMES.main.title,
  question: SCENE_THEMES.question.title,
  result: SCENE_THEMES.result.title,
  game: SCENE_THEMES.question.title,
  complete: SCENE_THEMES.main.title,
}

function JourneyHeader({ state, onAction, onTeacherOpen, teacherTriggerRef, profile, scene }: Omit<SceneContext, 'notice'> & { scene: SceneName }) {
  return (
    <header className="journey-header">
      <div className="journey-brand" aria-label="브랜드 로고"><ClasscadeEmblem /><ClasscadeWordmark src={classcadeWordmarkTrimmed} /></div>
      <div className="journey-header__actions">
        {/* One translucent pill holding the whole cluster, as in the reference header. */}
        <div className="journey-cluster">
          <BgmControl enabled={state.audio.bgmEnabled} volume={state.audio.bgmVolume} onToggle={() => onAction({ type: 'SET_AUDIO', audio: toggleAudioChannel(state.audio, 'bgm') })} onVolumeChange={(bgmVolume) => onAction({ type: 'SET_AUDIO', audio: { ...state.audio, bgmVolume } })} />
          {/* Leftward tape marquee; the text is doubled so the loop has no visible seam. */}
          <span className="journey-song" aria-label={SCENE_BGM_TITLE[scene]}>
            <span className="journey-song__track" aria-hidden="true"><span>{SCENE_BGM_TITLE[scene]}</span><span>{SCENE_BGM_TITLE[scene]}</span></span>
          </span>
          <span className={`journey-equalizer ${state.audio.bgmEnabled ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} />)}</span>
          <span className="journey-cluster__divider" aria-hidden="true" />
          {/* The profile IS the teacher-panel trigger now — there is no second button. */}
          <button className="journey-header__profile" type="button" ref={teacherTriggerRef} onClick={() => { if (teacherTriggerRef.current) onTeacherOpen(teacherTriggerRef.current) }} aria-haspopup="dialog" aria-label="선생님 패널 열기">
            <img src={profileAvatar} alt="" aria-hidden="true" />
            <span className="journey-header__identity"><small>교실 탐험가</small><strong>{profile?.nickname ?? '선생님'}</strong></span>
            <Icon name="chevron" size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

function SceneArt({ asset, artSrc }: { asset: JourneySceneAsset; artSrc?: string }) {
  return (
    <div className={`journey-art journey-art--${asset.tone}`} aria-hidden="true">
      <picture><source media="(max-width: 700px)" srcSet={artSrc ?? asset.mobileSrc ?? asset.src} /><img src={artSrc ?? asset.src} alt="" style={{ '--scene-position': asset.position } as CSSProperties} /></picture>
      <div className="journey-art__wash" />
      {/* Firefly field — position/phase/size per mote via CSS vars, same hash-scatter
          recipe as the prep screens' EntryMotes (a linear walk drew a visible diagonal). */}
      <div className="journey-art__motes">
        {Array.from({ length: 96 }, (_, index) => (
          <i key={index} style={{
            '--x': `${(moteHash(index * 7 + 101) * 94 + 2).toFixed(1)}%`,
            '--y': `${(moteHash(index * 7 + 102) * 92 + 1).toFixed(1)}%`,
            '--s': 3 + Math.floor(moteHash(index * 7 + 103) * 8),
            /* Independent cycle per mote (negative delay = random mid-flight start). */
            '--dur': `${(6 + moteHash(index * 7 + 104) * 7).toFixed(2)}s`,
            '--delay': `-${(moteHash(index * 7 + 105) * 13).toFixed(2)}s`,
            '--amp': (8 + moteHash(index * 7 + 106) * 20).toFixed(1),
          } as CSSProperties} />
        ))}
      </div>
      <div className="journey-art__leaves"><i /><i /><i /></div>
    </div>
  )
}

/** The notice pill fades in AND out: the element stays mounted 450ms after the text
 *  clears so the out-animation can run — an instant unmount was the last visible
 *  "jolt" on scene entry (found by pixel-diffing burst captures). */
function ScenePill({ notice }: { notice: string }) {
  const [shown, setShown] = useState(notice)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    if (notice) { setShown(notice); setLeaving(false); return }
    if (!shown) return
    setLeaving(true)
    const timer = window.setTimeout(() => { setShown(''); setLeaving(false) }, 450)
    return () => window.clearTimeout(timer)
  }, [notice, shown])
  if (!shown) return null
  return <p className={`journey-notice ${leaving ? 'is-leaving' : ''}`} aria-live="polite">{shown}</p>
}

export function SceneFrame({ scene, children, state, onAction, onTeacherOpen, teacherTriggerRef, notice, profile, compact = false, artSrc, canonicalGame = false }: SceneFrameProps) {
  return (
    <main className={`journey-scene journey-scene--${scene}${canonicalGame ? ' journey-scene--canonical-game' : ''}${compact ? ' is-compact' : ''}`}>
      <SceneArt asset={JOURNEY_SCENE_ASSETS[scene]} artSrc={artSrc} />
      <JourneyHeader state={state} onAction={onAction} onTeacherOpen={onTeacherOpen} teacherTriggerRef={teacherTriggerRef} profile={profile} scene={scene} />
      <section className="journey-scene__stage">{children}</section>
      {scene !== 'question' && <ScenePill notice={notice} />}
    </main>
  )
}

export function PrimaryButton({ children, onClick, disabled = false, className = '', tuneId }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string; tuneId?: string }) {
  return <button className={`journey-button journey-button--primary ${className}`} type="button" onClick={onClick} disabled={disabled} data-tune-id={tuneId}><CompassSeal className="journey-button__seal" /><span>{children}</span><Icon name="arrow" size={25} /></button>
}

export function SecondaryButton({ children, onClick, className = '', tuneId }: { children: ReactNode; onClick: () => void; className?: string; tuneId?: string }) {
  return <button className={`journey-button journey-button--secondary ${className}`} type="button" onClick={onClick} data-tune-id={tuneId}>{children}</button>
}

export function Progress({ current, total, label }: { current: number; total: number; label: string }) {
  const percent = Math.max(0, Math.min(100, Math.round((current / total) * 100)))
  return <div className="journey-progress" aria-label={`${label} ${current} / ${total}`}><div><b>{label}</b><span>{current} / {total}</span></div><div className="journey-progress__track"><i style={{ width: `${percent}%` }} /></div></div>
}
