import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  CAREER_RANGE_OPTIONS,
  GROWTH_PRIORITY_OPTIONS,
  REGION_OPTIONS,
  SCHOOL_LEVEL_OPTIONS,
  type CareerRange,
  type GrowthPriority,
  type Region,
  type SchoolLevel,
} from '../data/adventure'
import { beginMainThemeReveal, noteAudioUserGesture } from '../lib/audioManager'
import type { AudioSettings } from '../lib/audioController'
import type { Profile } from '../lib/storage'
import { toggleGrowthPriority as getNextGrowthPriorities } from '../lib/prepSelection'
import prepFourReference from '../assets/front120/prep-4.png'
import prepTwoMaster from '../assets/classcade/master-screens/prep-02-master.png'
import prepThreeMaster from '../assets/classcade/master-screens/prep-03-master.png'
import prepFourMaster from '../assets/classcade/master-screens/prep-04-master.png'
import loadingMaster from '../assets/classcade/master-screens/loading-master.png'
import portalAcademy from '../assets/portal-academy-background.png'
import prepOneWorldBackdrop from '../assets/classcade/prep-01-interactive/prep-01-world-backdrop-16x9.png'
import prepOneCleanPlate from '../assets/classcade/prep-01-interactive/prep-01-clean-plate.png'
import prepTwoCleanPlate from '../assets/classcade/prep-02-interactive/prep-02-clean-plate.png'
import prepTwoPreserviceNeutral from '../assets/classcade/prep-02-interactive/prep-02-card-preservice-neutral.png'
import prepTwoPreserviceSelected from '../assets/classcade/prep-02-interactive/prep-02-card-preservice-selected.png'
import prepTwoOneToFiveNeutral from '../assets/classcade/prep-02-interactive/prep-02-card-1-5-neutral.png'
import prepTwoOneToFiveSelected from '../assets/classcade/prep-02-interactive/prep-02-card-1-5-selected.png'
import prepTwoSixToTenNeutral from '../assets/classcade/prep-02-interactive/prep-02-card-6-10-neutral.png'
import prepTwoSixToTenSelected from '../assets/classcade/prep-02-interactive/prep-02-card-6-10-selected.png'
import prepTwoElevenToTwentyNeutral from '../assets/classcade/prep-02-interactive/prep-02-card-11-20-neutral.png'
import prepTwoElevenToTwentySelected from '../assets/classcade/prep-02-interactive/prep-02-card-11-20-selected.png'
import prepTwoTwentyOnePlusNeutral from '../assets/classcade/prep-02-interactive/prep-02-card-21plus-neutral.png'
import prepTwoTwentyOnePlusSelected from '../assets/classcade/prep-02-interactive/prep-02-card-21plus-selected.png'
import kindergartenNeutral from '../assets/classcade/prep-01-interactive/prep-01-card-preschool-neutral.png'
import kindergartenSelected from '../assets/classcade/prep-01-interactive/prep-01-card-preschool-selected-v4.png'
import kindergartenHover from '../assets/classcade/prep-01-interactive/prep-01-card-preschool-hover-v4.png'
import elementaryNeutral from '../assets/classcade/prep-01-interactive/prep-01-card-elementary-neutral.png'
import elementarySelected from '../assets/classcade/prep-01-interactive/prep-01-card-elementary-selected-v4.png'
import elementaryHover from '../assets/classcade/prep-01-interactive/prep-01-card-elementary-hover-v4.png'
import middleNeutral from '../assets/classcade/prep-01-interactive/prep-01-card-middle-neutral.png'
import middleSelected from '../assets/classcade/prep-01-interactive/prep-01-card-middle-selected-v4.png'
import middleHover from '../assets/classcade/prep-01-interactive/prep-01-card-middle-hover-v4.png'
import highNeutral from '../assets/classcade/prep-01-interactive/prep-01-card-high-neutral.png'
import highSelected from '../assets/classcade/prep-01-interactive/prep-01-card-high-selected-v4.png'
import highHover from '../assets/classcade/prep-01-interactive/prep-01-card-high-hover-v4.png'
import specialNeutral from '../assets/classcade/prep-01-interactive/prep-01-card-special-neutral.png'
import specialSelected from '../assets/classcade/prep-01-interactive/prep-01-card-special-selected-v4.png'
import specialHover from '../assets/classcade/prep-01-interactive/prep-01-card-special-hover-v4.png'
import ctaDisabled from '../assets/classcade/prep-01-interactive/prep-01-cta-disabled.png'
import ctaEnabled from '../assets/classcade/prep-01-interactive/prep-01-cta-enabled.png'
import ctaHover from '../assets/classcade/prep-01-interactive/prep-01-cta-hover.png'
import ctaActive from '../assets/classcade/prep-01-interactive/prep-01-cta-active.png'
import { CompassSeal, Icon, type IconName } from './VisualPrimitives'
import '../front120.css'
import type { TunerScreen } from '../features/front120/visualTuning'

type PrepStep = 1 | 2 | 3 | 4 | 'nickname' | 'loading'

type AdventurePrepScreenProps = {
  initialProfile: Profile | null
  audio: AudioSettings
  exiting: boolean
  isOffline: boolean
  onComplete: (profile: Profile) => Promise<{ ok: boolean }>
  onScreenChange: (screen: TunerScreen) => void
}

const STEP_IMAGES: Record<Exclude<PrepStep, 'nickname' | 'loading'>, string> = {
  1: prepOneWorldBackdrop,
  2: prepTwoMaster,
  3: prepThreeMaster,
  4: prepFourMaster,
}

const growthIcons: IconName[] = ['gamepad', 'school', 'spark', 'notebook', 'career', 'leaf', 'notebook', 'region', 'career', 'spark']

const PREP_ONE_CARD_ASSETS: Record<SchoolLevel, { neutral: string; selected: string; hover: string }> = {
  kindergarten: { neutral: kindergartenNeutral, selected: kindergartenSelected, hover: kindergartenHover },
  elementary: { neutral: elementaryNeutral, selected: elementarySelected, hover: elementaryHover },
  middle: { neutral: middleNeutral, selected: middleSelected, hover: middleHover },
  high: { neutral: highNeutral, selected: highSelected, hover: highHover },
  special: { neutral: specialNeutral, selected: specialSelected, hover: specialHover },
}

const PREP_ONE_CARD_POSITIONS: Record<SchoolLevel, CSSProperties> = {
  kindergarten: { '--card-x': '14.56%', '--card-y': '55.47%', '--card-w': '10.51%', '--card-h': '15.85%' } as CSSProperties,
  elementary: { '--card-x': '26.21%', '--card-y': '55.57%', '--card-w': '10.78%', '--card-h': '15.47%' } as CSSProperties,
  middle: { '--card-x': '37.13%', '--card-y': '55.57%', '--card-w': '10.78%', '--card-h': '15.47%' } as CSSProperties,
  high: { '--card-x': '48.79%', '--card-y': '55.57%', '--card-w': '10.78%', '--card-h': '15.47%' } as CSSProperties,
  special: { '--card-x': '60.18%', '--card-y': '55.47%', '--card-w': '8.36%', '--card-h': '15.57%' } as CSSProperties,
}

// Baked card art sliced from prep-02-master (see PREP2-ASSET-SPEC). Rect = source slot in the 1484x1060 plate.
const PREP_TWO_CARD_ART: Record<CareerRange, { neutral?: string; selected?: string; rect: CSSProperties }> = {
  'pre-service': { neutral: prepTwoPreserviceNeutral, selected: prepTwoPreserviceSelected, rect: { '--art-x': '9.97%', '--art-y': '53.96%', '--art-w': '10.78%', '--art-h': '18.49%' } as CSSProperties },
  '1-5': { neutral: prepTwoOneToFiveNeutral, selected: prepTwoOneToFiveSelected, rect: { '--art-x': '22.03%', '--art-y': '53.96%', '--art-w': '10.78%', '--art-h': '18.49%' } as CSSProperties },
  '6-10': { neutral: prepTwoSixToTenNeutral, selected: prepTwoSixToTenSelected, rect: { '--art-x': '33.83%', '--art-y': '52.45%', '--art-w': '11.19%', '--art-h': '20.19%' } as CSSProperties },
  '11-20': { neutral: prepTwoElevenToTwentyNeutral, selected: prepTwoElevenToTwentySelected, rect: { '--art-x': '46.23%', '--art-y': '53.96%', '--art-w': '10.24%', '--art-h': '18.49%' } as CSSProperties },
  '21-plus': { neutral: prepTwoTwentyOnePlusNeutral, selected: prepTwoTwentyOnePlusSelected, rect: { '--art-x': '57.21%', '--art-y': '53.30%', '--art-w': '9.84%', '--art-h': '18.87%' } as CSSProperties },
}

function PrepOneChoiceCards({ value, previewValue, onChange, onPreviewChange }: {
  value: SchoolLevel | null
  previewValue: SchoolLevel | null
  onChange: (value: SchoolLevel) => void
  onPreviewChange: (value: SchoolLevel | null) => void
}) {
  const visualValue = previewValue ?? value

  return <div className="front120-prep01-plate__cards" role="radiogroup" aria-label="함께하는 학생들의 학교급">
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
      return <button key={option.value} type="button" className={`front120-prep01-plate__card is-${visualState}`} style={PREP_ONE_CARD_POSITIONS[option.value]} role="radio" aria-checked={selected} aria-label={option.label} tabIndex={selected || (!value && index === 0) ? 0 : -1} data-tune-id={`prep-1-option-${index + 1}`} onPointerEnter={() => onPreviewChange(option.value)} onPointerLeave={() => onPreviewChange(null)} onFocus={() => onPreviewChange(option.value)} onBlur={() => onPreviewChange(null)} onKeyDown={moveFocus} onClick={() => { noteAudioUserGesture(); onChange(option.value) }}>
        <img src={assets[visualState]} alt="" aria-hidden="true" />
      </button>
    })}
  </div>
}

function PrepTwoChoiceCards({ value, previewValue, onChange, onPreviewChange }: {
  value: CareerRange | null
  previewValue: CareerRange | null
  onChange: (value: CareerRange) => void
  onPreviewChange: (value: CareerRange | null) => void
}) {
  return <div className="front120-prep02-plate__cards" role="radiogroup" aria-label="선생님의 교실 여정">
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
      return <button key={option.value} type="button" className={`front120-prep02-plate__cardart ${selected ? 'is-selected' : ''} ${previewed ? 'is-hover' : ''}`} style={art.rect} role="radio" aria-checked={selected} aria-label={option.label} tabIndex={selected || (!value && index === 0) ? 0 : -1} data-tune-id={`prep-2-option-${index + 1}`} onPointerEnter={() => onPreviewChange(option.value)} onPointerLeave={() => onPreviewChange(null)} onFocus={() => onPreviewChange(option.value)} onBlur={() => onPreviewChange(null)} onKeyDown={moveFocus} onClick={() => { noteAudioUserGesture(); onChange(option.value) }}>
        <img src={artSrc} alt="" aria-hidden="true" />
      </button>
    })}
  </div>
}

function ChoiceCards<T extends string>({ options, value, onChange, onPreviewChange, previewValue, icons, tunePrefix, compact = false }: {
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
    <div className={`front120-choice-grid ${compact ? 'front120-choice-grid--compact' : ''}`} role="radiogroup">
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
        return <button key={option.value} type="button" className={`front120-choice-card ${selected ? 'is-selected' : ''} ${previewed ? 'is-previewed' : ''}`} role="radio" aria-checked={selected} tabIndex={selected || (!value && index === 0) ? 0 : -1} data-tune-id={`${tunePrefix}-option-${index + 1}`} onPointerEnter={() => onPreviewChange?.(option.value)} onPointerLeave={() => onPreviewChange?.(null)} onFocus={() => onPreviewChange?.(option.value)} onBlur={() => onPreviewChange?.(null)} onKeyDown={moveFocus} onClick={() => { noteAudioUserGesture(); onChange(option.value) }}>
          <span className="front120-choice-card__icon"><Icon name={icon} size={compact ? 20 : 29} /></span>
          <b>{option.label}</b>
          {selected && <span className="front120-choice-card__check" aria-label="선택됨"><Icon name="check" size={15} /></span>}
        </button>
      })}
    </div>
  )
}

function PrepProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return <div className="front120-progress" aria-label={`모험 준비 ${step} / 4`}><b>{step} / 4</b><span>{[1, 2, 3, 4].map((value) => <i className={value <= step ? 'is-complete' : ''} key={value} />)}</span></div>
}

export function AdventurePrepScreen({ initialProfile, audio, exiting, isOffline, onComplete, onScreenChange }: AdventurePrepScreenProps) {
  const [step, setStep] = useState<PrepStep>(1)
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(initialProfile?.schoolLevel ?? null)
  const [schoolPreview, setSchoolPreview] = useState<SchoolLevel | null>(null)
  const [careerRange, setCareerRange] = useState<CareerRange | null>(initialProfile?.careerRange ?? null)
  const [careerPreview, setCareerPreview] = useState<CareerRange | null>(null)
  const [region, setRegion] = useState<Region | null>(initialProfile?.region ?? null)
  const [growthPriorities, setGrowthPriorities] = useState<GrowthPriority[]>(initialProfile?.growthPriorities ?? [])
  const [otherText, setOtherText] = useState(initialProfile?.growthPriorityOther ?? '')
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? '')
  const [selectionMessage, setSelectionMessage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(4)
  const [loadingError, setLoadingError] = useState('')

  const otherSelected = growthPriorities.includes('other')
  const growthReady = growthPriorities.length > 0 && (!otherSelected || Boolean(otherText.trim()))
  const nicknameReady = nickname.trim().length > 0
  const stageImage = step === 'nickname' ? prepFourReference : STEP_IMAGES[step as Exclude<PrepStep, 'nickname' | 'loading'>]
  const stepNumber = typeof step === 'number' ? step : 4

  useEffect(() => {
    onScreenChange(step === 'nickname' || step === 'loading' ? step : `prep-${step}` as TunerScreen)
  }, [onScreenChange, step])

  useEffect(() => {
    if (step !== 'loading') return
    const progressTimers = [
      window.setTimeout(() => setLoadingProgress(18), 120),
      window.setTimeout(() => setLoadingProgress(46), 540),
      window.setTimeout(() => setLoadingProgress(74), 980),
      window.setTimeout(() => setLoadingProgress(92), 1420),
      window.setTimeout(() => setLoadingProgress(100), 1850),
    ]
    const audioTimer = window.setTimeout(() => beginMainThemeReveal(audio.bgmEnabled, audio.bgmVolume), 1240)
    const finishTimer = window.setTimeout(async () => {
      const now = new Date().toISOString()
      const result = await onComplete({
        version: 1,
        schoolLevel: schoolLevel!,
        careerRange: careerRange!,
        region: region!,
        growthPriorities,
        growthPriorityOther: otherSelected ? otherText.trim() : '',
        nickname: nickname.trim(),
        createdAt: initialProfile?.createdAt ?? now,
        updatedAt: now,
      })
      if (!result.ok) setLoadingError('모험 기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.')
    }, 2110)
    return () => {
      progressTimers.forEach(window.clearTimeout)
      window.clearTimeout(audioTimer)
      window.clearTimeout(finishTimer)
    }
  }, [audio.bgmEnabled, audio.bgmVolume, careerRange, growthPriorities, initialProfile?.createdAt, nickname, onComplete, otherSelected, otherText, region, schoolLevel, step])

  const title = useMemo(() => {
    if (step === 1) return { number: '01', question: '어느 교실에서 함께하고 있나요?', helper: '함께하고 있는 학생들의 학교급을 선택해 주세요.' }
    if (step === 2) return { number: '02', question: '선생님의 교실 여정은 어느 정도인가요?', helper: '선생님의 경험에 가장 가까운 단계를 선택해 주세요.' }
    if (step === 3) return { number: '03', question: '어느 지역에서 오셨나요?', helper: '현재 거주하시는 권역을 선택해 주세요.' }
    return { number: '04', question: '지금 교실에서 더 키우고 싶은 것은 무엇인가요?', helper: '최대 3개까지 선택할 수 있어요.' }
  }, [step])

  function nextStep() {
    noteAudioUserGesture()
    if (step === 1 && schoolLevel) setStep(2)
    else if (step === 2 && careerRange) setStep(3)
    else if (step === 3 && region) setStep(4)
    else if (step === 4 && growthReady) setStep('nickname')
  }

  function previousStep() {
    setSelectionMessage('')
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
    else if (step === 4) setStep(3)
    else if (step === 'nickname') setStep(4)
  }

  function toggleGrowthPriority(value: GrowthPriority) {
    noteAudioUserGesture()
    setSelectionMessage('')
    const next = getNextGrowthPriorities(growthPriorities, value)
    if (next.reachedLimit) {
      setSelectionMessage('최대 3개까지 선택할 수 있어요.')
      return
    }
    if (next.clearsOtherText) setOtherText('')
    setGrowthPriorities(next.values)
  }

  function beginLoading() {
    if (!nicknameReady) return
    noteAudioUserGesture()
    setLoadingError('')
    setLoadingProgress(4)
    setStep('loading')
  }

  if (step === 'loading') {
    return <main className={`front120-loading ${exiting ? 'is-exiting' : ''}`} aria-live="polite">
    <img className="front120-loading__reference" src={loadingMaster} alt="" aria-hidden="true" />
      <div className="front120-loading__veil" aria-hidden="true" />
      <div className="front120-motes front120-motes--loading" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      <section className="front120-loading__copy">
        <span data-tune-id="loading-emblem"><CompassSeal className="front120-loading__seal" /></span>
        <h1>교실 모험을 준비하는 중…</h1>
        <p>선생님의 플레이 여정을 정리하고 있어요…</p>
        <div className="front120-loading__dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="front120-loading__track" aria-label={`모험 준비 ${loadingProgress}%`}><i style={{ width: `${loadingProgress}%` }} /></div>
        <p className="front120-loading__wait">잠시만 기다려 주세요</p>
        {loadingError && <p className="front120-loading__error">{loadingError}</p>}
      </section>
    </main>
  }

  if (step === 'nickname') {
    return <main className={`front120-prep front120-prep--nickname ${exiting ? 'is-exiting' : ''}`} aria-labelledby="nickname-title">
      <img className="front120-prep__world" src={portalAcademy} alt="" aria-hidden="true" />
      <img className="front120-prep__reference" src={stageImage} alt="" aria-hidden="true" />
      <div className="front120-prep__vignette" aria-hidden="true" />
      <div className="front120-motes" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div>
      <section className="front120-prep__panel front120-prep__panel--nickname" data-tune-id="nickname-panel">
        <header className="front120-prep__header"><div className="front120-prep__brand"><CompassSeal /><span>CLASSCADE ADVENTURE</span></div><PrepProgress step={4} /></header>
        <div className="front120-nickname">
          <span className="front120-nickname__orb"><CompassSeal /></span>
          <p className="front120-kicker">✦ 여정의 마지막 준비 ✦</p>
          <h1 id="nickname-title"><span>용사님의 닉네임을</span> <span>알려주세요</span></h1>
          <p>이 여정에서 불릴 이름이에요.</p>
          <label><span>용사 닉네임</span><input value={nickname} maxLength={16} autoComplete="off" placeholder="예: 플레이메이커쌤" onChange={(event) => setNickname(event.target.value.slice(0, 16))} /></label>
          <small>실제 이름이나 학교명 대신, 이 모험에서 사용할 별명을 적어 주세요.</small>
        </div>
        <footer className="front120-prep__footer"><button type="button" className="front120-button front120-button--back" onClick={previousStep}>← 이전 질문</button><button type="button" className="front120-button front120-button--next" disabled={!nicknameReady} onClick={beginLoading} data-tune-id="prep-next-button"><CompassSeal />모험 준비 완료 <Icon name="arrow" size={22} /></button></footer>
      </section>
    </main>
  }

  const canContinue = step === 1 ? Boolean(schoolLevel) : step === 2 ? Boolean(careerRange) : step === 3 ? Boolean(region) : growthReady
  if (step === 1) {
    return <main className={`front120-prep front120-prep--1 front120-prep01-stage ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-1-title">
      <img className="front120-prep01-stage__background" src={prepOneWorldBackdrop} alt="" aria-hidden="true" />
      <div className="front120-motes front120-motes--prep01" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div>
      <section className="front120-prep01-plate" aria-labelledby="prep-1-title">
        <img className="front120-prep01-plate__image" src={prepOneCleanPlate} alt="" aria-hidden="true" />
        <h1 id="prep-1-title" className="sr-only">모험 준비 — 어느 교실에서 함께하고 있나요?</h1>
        <PrepOneChoiceCards value={schoolLevel} previewValue={schoolPreview} onChange={setSchoolLevel} onPreviewChange={setSchoolPreview} />
        <button type="button" className="front120-prep01-plate__cta" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로">
          <img className="front120-prep01-plate__cta-disabled" src={ctaDisabled} alt="" aria-hidden="true" />
          <img className="front120-prep01-plate__cta-enabled" src={ctaEnabled} alt="" aria-hidden="true" />
          <img className="front120-prep01-plate__cta-hover" src={ctaHover} alt="" aria-hidden="true" />
          <img className="front120-prep01-plate__cta-active" src={ctaActive} alt="" aria-hidden="true" />
        </button>
        <p className="front120-prep01-plate__note"><Icon name="notebook" size={13} />입력한 정보는 언제든지 변경할 수 있어요.</p>
        {isOffline && <p className="front120-prep__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
      </section>
    </main>
  }

  if (step === 2) {
    return <main className={`front120-prep front120-prep--2 front120-prep02-stage ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-2-title">
      <img className="front120-prep02-stage__plate" src={prepTwoCleanPlate} alt="" aria-hidden="true" />
      <div className="front120-motes front120-motes--prep02" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      <section className="front120-prep02-plate" aria-labelledby="prep-2-title">
        <h1 id="prep-2-title" className="sr-only">모험 준비 — 선생님의 교실 여정은 어느 정도인가요?</h1>
        <svg className="front120-prep02-plate__path" viewBox="0 0 1484 1060" preserveAspectRatio="none" aria-hidden="true"><path d="M196 690 Q 340 706 454 672 T 634 690 T 813 672 T 993 690 Q 1080 702 1128 692" /></svg>
        <PrepTwoChoiceCards value={careerRange} previewValue={careerPreview} onChange={setCareerRange} onPreviewChange={setCareerPreview} />
        <button type="button" className="front120-prep02-plate__back" onClick={previousStep} aria-label="이전 질문">← 이전 질문</button>
        <button type="button" className="front120-prep02-plate__cta" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로">다음 질문으로 <Icon name="arrow" size={22} /></button>
        {isOffline && <p className="front120-prep02-plate__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
      </section>
    </main>
  }

  return <main className={`front120-prep front120-prep--${step} ${exiting ? 'is-exiting' : ''}`} aria-labelledby={`prep-${step}-title`}>
    <img className="front120-prep__world" src={portalAcademy} alt="" aria-hidden="true" />
    <img className="front120-prep__reference" src={stageImage} alt="" aria-hidden="true" data-tune-id={`prep-${step}-hero`} />
    {step === 3 && region && <i className={`front120-prep__region-marker front120-prep__region-marker--${REGION_OPTIONS.findIndex((option) => option.value === region) + 1}`} aria-hidden="true" />}
    {step === 4 && growthPriorities.length > 0 && <div className={`front120-prep__growth-nodes front120-prep__growth-nodes--${growthPriorities.length}`} aria-hidden="true">{growthPriorities.map((priority, index) => <i key={priority} style={{ '--node': index } as CSSProperties} />)}</div>}
    <div className="front120-prep__vignette" aria-hidden="true" />
    <div className="front120-motes" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</div>
    <section className="front120-prep__panel">
      <header className="front120-prep__header">
        <div className="front120-prep__brand"><CompassSeal /><span>CLASSCADE ADVENTURE</span></div>
        <PrepProgress step={stepNumber} />
      </header>
      <div className="front120-prep__intro">
        <h1>모험 준비</h1>
        <p>교실 모험을 시작하기 전,<br />간단한 정보를 선택해 주세요.</p>
      </div>
      <section className={`front120-prep__question front120-prep__question--${step}`} aria-labelledby={`prep-${step}-title`}>
        <p className="front120-prep__question-number">{title.number}</p>
        <h2 id={`prep-${step}-title`} data-tune-id={`prep-${step}-title`}>{title.question}</h2>
        <p>{title.helper} {step === 4 && <strong aria-live="polite">{growthPriorities.length} / 3</strong>}</p>
        {step === 3 && region && <p className="front120-prep__next-cue" role="status">지역을 선택했어요 · 아래의 다음 질문 버튼으로 이어가요 ↓</p>}
        {step === 3 && <ChoiceCards options={REGION_OPTIONS} value={region} onChange={setRegion} icons={['region']} tunePrefix="prep-3" compact />}
        {step === 4 && growthPriorities.length === 3 && <p className="front120-prep__next-cue" role="status">선택 완료 · 아래의 다음 질문 버튼으로 이어가요 ↓</p>}
        {step === 4 && <div className="front120-growth-grid" role="group" aria-label="교실 성장 우선순위">
          {GROWTH_PRIORITY_OPTIONS.map((option, index) => {
            const selected = growthPriorities.includes(option.value)
            return <button key={option.value} className={`front120-growth-card ${selected ? 'is-selected' : ''}`} type="button" aria-pressed={selected} data-tune-id={`prep-4-option-${index + 1}`} onClick={() => toggleGrowthPriority(option.value)}><Icon name={growthIcons[index]} size={24} /><span>{option.label}</span>{selected && <i aria-hidden="true"><Icon name="check" size={15} /></i>}</button>
          })}
          {otherSelected && <label className="front120-growth-other"><span>기타 직접 입력</span><input value={otherText} maxLength={30} placeholder="직접 입력해 주세요." onChange={(event) => setOtherText(event.target.value.slice(0, 30))} /></label>}
          <p className="front120-growth-message" aria-live="polite">{selectionMessage}</p>
        </div>}
      </section>
      <footer className="front120-prep__footer">
        <button type="button" className="front120-button front120-button--back" onClick={previousStep} aria-label="이전 질문">← 이전 질문</button>
        <button type="button" className="front120-button front120-button--next" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로">다음 질문으로 <Icon name="arrow" size={22} /></button>
      </footer>
      {isOffline && <p className="front120-prep__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
    </section>
  </main>
}
