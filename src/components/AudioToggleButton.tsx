import { Icon, type IconName } from './VisualPrimitives'

type AudioToggleButtonProps = {
  kind: 'bgm' | 'sfx'
  enabled: boolean
  onToggle: () => void
}

export function AudioToggleButton({ kind, enabled, onToggle }: AudioToggleButtonProps) {
  const noun = kind === 'bgm' ? '배경음악' : '효과음'
  const icon: IconName = kind === 'bgm' ? 'music' : 'speaker'
  const label = `${noun} ${enabled ? '끄기' : '켜기'}`

  return (
    <button className={`audio-toggle ${enabled ? 'is-enabled' : 'is-muted'}`} type="button" onClick={onToggle} aria-pressed={enabled} aria-label={label} data-tooltip={label}>
      <Icon name={icon} size={20} />
      {!enabled && <span className="audio-toggle__slash" aria-hidden="true" />}
    </button>
  )
}
