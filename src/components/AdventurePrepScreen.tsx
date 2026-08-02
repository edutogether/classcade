import { useMemo, useState, type FormEvent } from 'react'
import {
  CAREER_RANGE_OPTIONS,
  GROWTH_PRIORITY_OPTIONS,
  REGION_OPTIONS,
  SCHOOL_LEVEL_OPTIONS,
  type CareerRange,
  type GrowthPriority,
  type Option,
  type Region,
  type SchoolLevel,
} from '../data/adventure'
import type { Profile } from '../lib/storage'
import { toggleGrowthPriority as getNextGrowthPriorities } from '../lib/prepSelection'
import portalAcademy from '../assets/portal-academy-background.png'
import { CompassSeal, Icon } from './VisualPrimitives'

type AdventurePrepScreenProps = {
  initialProfile: Profile | null
  exiting: boolean
  isOffline: boolean
  onComplete: (profile: Profile) => Promise<{ ok: boolean }>
}

type ChoiceChipGroupProps<T extends string> = {
  options: readonly Option<T>[]
  value: T | null
  onChange: (value: T) => void
  label: string
  className?: string
}

export function ChoiceChipGroup<T extends string>({ options, value, onChange, label, className = '' }: ChoiceChipGroupProps<T>) {
  return (
    <div className={`choice-chip-group ${className}`} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button key={option.value} className={`choice-chip ${selected ? 'is-selected' : ''}`} type="button" role="radio" aria-checked={selected} onClick={() => onChange(option.value)}>
            <span className="choice-chip__check" aria-hidden="true"><Icon name="check" size={13} /></span>
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function AdventurePrepScreen({ initialProfile, exiting, isOffline, onComplete }: AdventurePrepScreenProps) {
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(initialProfile?.schoolLevel ?? null)
  const [careerRange, setCareerRange] = useState<CareerRange | null>(initialProfile?.careerRange ?? null)
  const [region, setRegion] = useState<Region | null>(initialProfile?.region ?? null)
  const [growthPriorities, setGrowthPriorities] = useState<GrowthPriority[]>(initialProfile?.growthPriorities ?? [])
  const [otherText, setOtherText] = useState(initialProfile?.growthPriorityOther ?? '')
  const [selectionMessage, setSelectionMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const otherSelected = growthPriorities.includes('other')
  const isReady = Boolean(schoolLevel && careerRange && region && growthPriorities.length >= 1 && (!otherSelected || otherText.trim()))
  const ctaHint = useMemo(() => {
    if (saving) return '선택 정보를 저장하고 있어요.'
    if (isReady) return '선택을 저장하고 모험을 시작합니다.'
    if (otherSelected && !otherText.trim()) return '기타 내용을 입력해 주세요.'
    return '필수 선택을 완료하면 모험을 시작할 수 있어요.'
  }, [isReady, otherSelected, otherText, saving])

  function toggleGrowthPriority(value: GrowthPriority) {
    if (saving) return
    setSaveError('')
    setSelectionMessage('')
    const next = getNextGrowthPriorities(growthPriorities, value)
    if (next.reachedLimit) {
      setSelectionMessage('최대 3개까지 선택할 수 있어요.')
      return
    }
    if (next.clearsOtherText) setOtherText('')
    setGrowthPriorities(next.values)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedOther = otherText.trim()
    if (saving || !schoolLevel || !careerRange || !region || !growthPriorities.length || (otherSelected && !trimmedOther)) return
    setSaveError('')
    setSaving(true)
    const now = new Date().toISOString()
    const completed = await onComplete({
      version: 1,
      schoolLevel,
      careerRange,
      region,
      growthPriorities,
      growthPriorityOther: otherSelected ? trimmedOther : '',
      createdAt: initialProfile?.createdAt ?? now,
      updatedAt: now,
    })
    if (!completed.ok) {
      setSaveError('선택 정보를 저장하지 못했어요.\n잠시 후 다시 시도해 주세요.')
      setSaving(false)
    }
  }

  return (
    <main className={`adventure-prep ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-title">
      <div className="prep-world" aria-hidden="true"><img src={portalAcademy} alt="" /></div>
      <div className="prep-vignette" aria-hidden="true" />
      <div className="prep-motes" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <section className="parchment-panel">
        <header className="parchment-panel__heading">
          <p className="parchment-kicker"><span>✦</span> CLASSCADE ADVENTURE <span>✦</span></p>
          <h1 id="prep-title">모험 준비</h1>
          <p>교실 모험을 시작하기 전,<br />간단한 정보를 선택해 주세요.</p>
          <CompassSeal className="parchment-compass" />
        </header>

        <form className="adventure-prep__form" onSubmit={submit}>
          <fieldset className="prep-fieldset" disabled={saving}>
            <legend><span>01</span> 어느 교실에서 함께하고 있나요?</legend>
            <ChoiceChipGroup options={SCHOOL_LEVEL_OPTIONS} value={schoolLevel} onChange={setSchoolLevel} label="학교급" className="choice-chip-group--five" />
          </fieldset>

          <fieldset className="prep-fieldset" disabled={saving}>
            <legend><span>02</span> 선생님의 교실 여정은 어느 정도인가요?</legend>
            <ChoiceChipGroup options={CAREER_RANGE_OPTIONS} value={careerRange} onChange={setCareerRange} label="교직 경력" className="choice-chip-group--five" />
          </fieldset>

          <fieldset className="prep-fieldset prep-fieldset--region" disabled={saving}>
            <legend><span>03</span> 어느 지역에서 오셨나요?</legend>
            <ChoiceChipGroup options={REGION_OPTIONS} value={region} onChange={setRegion} label="지역" className="choice-chip-group--region" />
          </fieldset>

          <fieldset className="prep-fieldset prep-fieldset--growth" disabled={saving}>
            <legend><span>04</span> 지금 교실에서 더 키우고 싶은 것은 무엇인가요?</legend>
            <p className="field-helper">최대 3개까지 선택할 수 있어요. <strong aria-live="polite">{growthPriorities.length} / 3</strong></p>
            <div className="growth-chip-grid" aria-label="교실 성장 우선순위">
              {GROWTH_PRIORITY_OPTIONS.map((option) => {
                const selected = growthPriorities.includes(option.value)
                return (
                  <button key={option.value} className={`growth-chip ${selected ? 'is-selected' : ''}`} type="button" aria-pressed={selected} onClick={() => toggleGrowthPriority(option.value)}>
                    <span className="growth-chip__check" aria-hidden="true"><Icon name="check" size={13} /></span>
                    {option.label}
                  </button>
                )
              })}
            </div>
            <p className="choice-message" aria-live="polite">{selectionMessage}</p>
            {otherSelected && (
              <label className="other-input">
                <span>기타 직접 입력</span>
                <input value={otherText} onChange={(event) => { setSaveError(''); setOtherText(event.target.value.slice(0, 30)) }} maxLength={30} placeholder="직접 입력해 주세요." autoComplete="off" disabled={saving} />
              </label>
            )}
          </fieldset>

          <footer className="prep-footer">
            <p>이름과 학교명은 받지 않으며,<br />선택 정보는 체험 운영과 익명 통계에 활용됩니다.</p>
            <div>
              <button className={`prep-submit ${saving ? 'is-saving' : ''}`} type="submit" disabled={!isReady || saving} aria-describedby="prep-cta-hint prep-save-error">
                <CompassSeal className="prep-submit__seal" />
                <span>{saving ? '모험을 준비하고 있어요…' : '모험 시작하기'}</span>
                <Icon name="arrow" size={23} />
              </button>
              <p id="prep-cta-hint" className={`prep-cta-hint ${isReady ? 'is-ready' : ''}`}>{ctaHint}</p>
              <p id="prep-save-error" className="prep-save-error" aria-live="assertive">{saveError}</p>
            </div>
            {isOffline && <p className="offline-storage-notice" role="status">오프라인 상태예요.{`\n`}현재 선택은 이 기기에 저장되며, 기기 연결 기능은 온라인에서 사용할 수 있어요.</p>}
          </footer>
        </form>
      </section>
    </main>
  )
}
