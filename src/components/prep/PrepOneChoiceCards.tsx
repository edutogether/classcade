import type { KeyboardEvent } from 'react'
import { SCHOOL_LEVEL_OPTIONS, type SchoolLevel } from '../../data/adventure'
import { noteAudioUserGesture } from '../../lib/audioManager'
import { PREP_ONE_CARD_ASSETS, PREP_ONE_CARD_POSITIONS } from './prepAssets'

export function PrepOneChoiceCards({ value, previewValue, onChange, onPreviewChange }: {
  value: SchoolLevel | null
  previewValue: SchoolLevel | null
  onChange: (value: SchoolLevel) => void
  onPreviewChange: (value: SchoolLevel | null) => void
}) {
  const visualValue = previewValue ?? value

  return <div className="entry-prep01-plate__cards" role="radiogroup" aria-label="함께하는 학생들의 학교급">
    {SCHOOL_LEVEL_OPTIONS.map((option, index) => {
      const selected = value === option.value
      const visualState = visualValue === option.value ? (previewValue ? 'hover' : 'selected') : 'neutral'
      const assets = PREP_ONE_CARD_ASSETS[option.value]
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
      return <button key={option.value} type="button" className={`entry-prep01-plate__card is-${visualState}`} style={PREP_ONE_CARD_POSITIONS[option.value]} role="radio" aria-checked={selected} aria-label={option.label} tabIndex={selected || (!value && index === 0) ? 0 : -1} data-tune-id={`prep-1-option-${index + 1}`} onPointerEnter={() => onPreviewChange(option.value)} onPointerLeave={() => onPreviewChange(null)} onFocus={() => onPreviewChange(option.value)} onBlur={() => onPreviewChange(null)} onKeyDown={moveFocus} onClick={() => { noteAudioUserGesture(); onChange(option.value) }}>
        <img src={assets[visualState]} alt="" aria-hidden="true" />
      </button>
    })}
  </div>
}
