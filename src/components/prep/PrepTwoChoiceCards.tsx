import type { KeyboardEvent } from 'react'
import { CAREER_RANGE_OPTIONS, type CareerRange } from '../../data/adventure'
import { noteAudioUserGesture } from '../../lib/audioManager'
import { PREP_TWO_CARD_ART } from './prepAssets'

export function PrepTwoChoiceCards({ value, previewValue, onChange, onPreviewChange }: {
  value: CareerRange | null
  previewValue: CareerRange | null
  onChange: (value: CareerRange) => void
  onPreviewChange: (value: CareerRange | null) => void
}) {
  return <div className="entry-prep02-plate__cards" role="radiogroup" aria-label="선생님의 교실 여정">
    {CAREER_RANGE_OPTIONS.map((option, index) => {
      const selected = value === option.value
      const previewed = previewValue === option.value
      const art = PREP_TWO_CARD_ART[option.value]
      const artSrc = (selected && art.selected) ? art.selected : (art.neutral ?? art.selected)
      const moveFocus = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          const buttons = Array.from(event.currentTarget.closest('[role="radiogroup"]')?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])
          const currentIndex = buttons.indexOf(event.currentTarget)
          const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % buttons.length : (currentIndex - 1 + buttons.length) % buttons.length
          buttons[nextIndex]?.focus()
          return
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          noteAudioUserGesture()
          onChange(option.value)
        }
      }
      return <button key={option.value} type="button" className={`entry-prep02-plate__cardart ${selected ? 'is-selected' : ''} ${previewed ? 'is-hover' : ''}`} style={art.rect} role="radio" aria-checked={selected} aria-label={option.label} tabIndex={selected || (!value && index === 0) ? 0 : -1} data-tune-id={`prep-2-option-${index + 1}`} onPointerEnter={() => onPreviewChange(option.value)} onPointerLeave={() => onPreviewChange(null)} onFocus={() => onPreviewChange(option.value)} onBlur={() => onPreviewChange(null)} onKeyDown={moveFocus} onClick={() => { noteAudioUserGesture(); onChange(option.value) }}>
        <img src={artSrc} alt="" aria-hidden="true" />
      </button>
    })}
  </div>
}
