import type { CSSProperties, KeyboardEvent } from 'react'
import { noteAudioUserGesture } from '../../lib/audioManager'
import { Icon, type IconName } from '../VisualPrimitives'
import { choiceFrameNeutral, choiceFrameSelected } from './prepAssets'

export function ChoiceCards<T extends string>({ options, value, onChange, onPreviewChange, previewValue, icons, tunePrefix, compact = false }: {
  options: readonly { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
  onPreviewChange?: (value: T | null) => void
  previewValue?: T | null
  icons: readonly IconName[]
  tunePrefix: string
  compact?: boolean
}) {
  return (
    <div className={`entry-choice-grid ${compact ? 'entry-choice-grid--compact' : ''}`} role="radiogroup">
      {options.map((option, index) => {
        const selected = value === option.value
        const previewed = previewValue === option.value
        const icon = icons[index % icons.length]
        const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            const buttons = Array.from(event.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])
            const currentIndex = buttons.indexOf(event.currentTarget)
            const nextIndex = event.key === 'ArrowRight'
              ? (currentIndex + 1) % buttons.length
              : (currentIndex - 1 + buttons.length) % buttons.length
            buttons[nextIndex]?.focus()
            return
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            noteAudioUserGesture()
            onChange(option.value)
          }
        }
        return <button key={option.value} type="button" className={`entry-choice-card ${selected ? 'is-selected' : ''} ${previewed ? 'is-previewed' : ''}`} style={{ '--frame-neutral': `url(${choiceFrameNeutral})`, '--frame-selected': `url(${choiceFrameSelected})` } as CSSProperties} role="radio" aria-checked={selected} tabIndex={selected || (!value && index === 0) ? 0 : -1} data-tune-id={`${tunePrefix}-option-${index + 1}`} onPointerEnter={() => onPreviewChange?.(option.value)} onPointerLeave={() => onPreviewChange?.(null)} onFocus={() => onPreviewChange?.(option.value)} onBlur={() => onPreviewChange?.(null)} onKeyDown={moveFocus} onClick={() => { noteAudioUserGesture(); onChange(option.value) }}>
          <span className="entry-choice-card__icon"><Icon name={icon} size={compact ? 20 : 29} /></span>
          <b>{option.label}</b>
          {selected && <span className="entry-choice-card__check" aria-label="선택됨"><Icon name="check" size={15} /></span>}
        </button>
      })}
    </div>
  )
}
