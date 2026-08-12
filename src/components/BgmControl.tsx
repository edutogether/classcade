import { useRef, useState } from 'react'
import { Icon } from './VisualPrimitives'

type BgmControlProps = {
  enabled: boolean
  volume: number
  onToggle: () => void
  onVolumeChange: (volume: number) => void
}

export function BgmControl({ enabled, volume, onToggle, onVolumeChange }: BgmControlProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const label = `배경음악 ${enabled ? '끄기' : '켜기'}`

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
        <input type="range" min="0" max="1" step="0.01" value={volume} aria-label="배경음악 볼륨 조절" onChange={(event) => onVolumeChange(Number(event.target.value))} />
      </div>
    </div>
  )
}
