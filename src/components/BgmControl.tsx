import { useEffect, useRef, useState } from 'react'
import { Icon } from './VisualPrimitives'

type BgmControlProps = {
  enabled: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
}

const TWEEN_MS = 260
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

export function BgmControl({ enabled, volume, onToggle, onVolumeChange }: BgmControlProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const label = `배경음악 ${enabled ? '끄기' : '켜기'}`

  /* The slider handle itself animates on mute/unmute, independent of the stored volume:
     off pulls it to the left end; on stretches it back out to whatever level it was at
     (not always 100%) — the stored `volume` never changes from this, only its on-screen
     position does. A plain range input can't transition its own `value`, so a local
     tween drives what's rendered while `volume` stays the source of truth underneath. */
  const [displayVolume, setDisplayVolume] = useState(enabled ? volume : 0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const target = enabled ? volume : 0
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const start = displayVolume
    const delta = target - start
    if (Math.abs(delta) < 0.001) { setDisplayVolume(target); return }
    const startedAt = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / TWEEN_MS)
      setDisplayVolume(start + delta * easeOutCubic(t))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else rafRef.current = null
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-tweening on every displayVolume tick would restart the animation each frame
  }, [enabled, volume])

  function cancelClose() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  function scheduleClose() {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setPanelOpen(false), 180)
  }

  return (
    <div className="bgm-control" data-tune-id="main-bgm-control" onMouseEnter={() => { cancelClose(); setPanelOpen(true) }} onMouseLeave={scheduleClose} onFocusCapture={() => { cancelClose(); setPanelOpen(true) }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose() }}>
      <button className={`audio-toggle ${enabled ? 'is-enabled' : 'is-muted'}`} type="button" onClick={onToggle} aria-pressed={enabled} aria-label={label} data-tooltip={label}>
        <Icon name="music" size={20} />
        {!enabled && <span className="audio-toggle__slash" aria-hidden="true" />}
      </button>
      {/* Hover reveals only the volume slider — the label row and on/off button made the
          popover collide with the pill; on/off lives on the music icon itself. */}
      <div className={`bgm-control__panel ${panelOpen ? 'is-open' : ''}`} aria-label="배경음악 볼륨 패널">
        <input type="range" min="0" max="1" step="0.01" value={displayVolume} disabled={!enabled} aria-label="배경음악 볼륨 조절" onChange={(event) => onVolumeChange(Number(event.target.value))} />
      </div>
    </div>
  )
}
