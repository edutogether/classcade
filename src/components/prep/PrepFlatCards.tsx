import { useState, type CSSProperties, type KeyboardEvent } from 'react'
import { noteAudioUserGesture } from '../../lib/audioManager'
import { Icon, type IconName } from '../VisualPrimitives'

/**
 * Flat CSS choice cards for the prep flow. Every card is a real DOM box drawn in CSS,
 * so a screen can never render blank because a master image failed to load. The art
 * version of these screens still lives in PrepOneChoiceCards / PrepTwoChoiceCards.
 */
export function PrepFlatCards<T extends string>({ options, value, onChange, tunePrefix, ariaLabel, icons, columns, compact = false, art }: {
  options: readonly { value: T; label: string }[]
  value: T | null
  onChange: (value: T) => void
  tunePrefix: string
  ariaLabel: string
  icons?: readonly IconName[]
  columns?: number
  compact?: boolean
  /** Finished per-option card artwork. Falls back to the CSS card if an image fails. */
  art?: Partial<Record<T, { neutral: string; selected: string }>>
}) {
  const [brokenArt, setBrokenArt] = useState<Set<T>>(new Set())
  return <div className={`entry-flat-cards ${compact ? 'is-compact' : ''}`} role="radiogroup" aria-label={ariaLabel} style={columns ? ({ '--flat-columns': `${columns}` } as CSSProperties) : undefined}>
    {options.map((option, index) => {
      const selected = value === option.value
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
      const cardArt = art?.[option.value]
      const useArt = cardArt && !brokenArt.has(option.value)
      return <button
        key={option.value}
        type="button"
        className={`entry-flat-card ${selected ? 'is-selected' : ''} ${useArt ? 'is-art' : ''}`}
        role="radio"
        aria-checked={selected}
        tabIndex={selected || (!value && index === 0) ? 0 : -1}
        data-tune-id={`${tunePrefix}-option-${index + 1}`}
        onKeyDown={moveFocus}
        onClick={() => { noteAudioUserGesture(); onChange(option.value) }}
      >
        {useArt ? (
          <img
            src={selected ? cardArt.selected : cardArt.neutral}
            alt={option.label}
            onError={() => setBrokenArt((current) => new Set(current).add(option.value))}
          />
        ) : (
          <>
            {icons?.[index] && <Icon name={icons[index]} size={compact ? 17 : 27} />}
            <span>{option.label}</span>
            {selected && <i aria-hidden="true"><Icon name="check" size={13} /></i>}
          </>
        )}
      </button>
    })}
  </div>
}
