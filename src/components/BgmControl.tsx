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

  /* The slider handle animates ONLY on mute/unmute — dragging it must track the pointer
     1:1 with zero lag. The first version tweened on every `volume` change, which
     includes drag input: each pointermove restarted a 260ms ease chasing a constantly
     moving target, so the thumb never caught up and felt sluggish. Keying the effect on
     `enabled` alone (not `volume`) means only the on/off click starts a tween; dragging
     updates displayVolume synchronously below and never touches this effect. */
  const [displayVolume, setDisplayVolume] = useState(enabled ? volume : 0)
  const rafRef = useRef<number | null>(null)
  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const displayVolumeRef = useRef(displayVolume)
  displayVolumeRef.current = displayVolume
  useEffect(() => {
    const target = enabled ? volumeRef.current : 0
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const start = displayVolumeRef.current
    const delta = target - start
    if (Math.abs(delta) < 0.001) { setDisplayVolume(target); return }
    const startedAt = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / TWEEN_MS)
      const next = start + delta * easeOutCubic(t)
      displayVolumeRef.current = next
      setDisplayVolume(next)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else rafRef.current = null
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [enabled])

  function handleDrag(next: number) {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    displayVolumeRef.current = next
    setDisplayVolume(next)
    onVolumeChange(next)
  }

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
        <input type="range" min="0" max="1" step="0.01" value={displayVolume} disabled={!enabled} aria-label="배경음악 볼륨 조절" onChange={(event) => handleDrag(Number(event.target.value))} />
      </div>
    </div>
  )
}
