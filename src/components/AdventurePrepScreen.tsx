import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  GROWTH_PRIORITY_OPTIONS,
  REGION_OPTIONS,
  type CareerRange,
  type GrowthPriority,
  type Region,
  type SchoolLevel,
} from '../data/adventure'
import { beginMainThemeReveal, noteAudioUserGesture } from '../lib/audioManager'
import type { AudioSettings } from '../lib/audioController'
import { loadPrepDraft, savePrepDraft, clearPrepDraft, type Profile, type PrepDraft } from '../lib/storage'
import { toggleGrowthPriority as getNextGrowthPriorities } from '../lib/prepSelection'
import { CompassSeal, Icon } from './VisualPrimitives'
import '../entry.css'
import type { TunerScreen } from '../features/entry/visualTuning'
import { PrepOneChoiceCards } from './prep/PrepOneChoiceCards'
import { PrepTwoChoiceCards } from './prep/PrepTwoChoiceCards'
import { ChoiceCards } from './prep/ChoiceCards'
import { PrepProgress } from './prep/PrepProgress'
import {
  STEP_IMAGES,
  growthIcons,
  choiceFrameNeutral,
  choiceFrameSelected,
  prepFourReference,
  loadingMaster,
  portalAcademy,
  prepOneWorldBackdrop,
  prepOneCleanPlate,
  prepTwoCleanPlate,
  ctaDisabled,
  ctaEnabled,
  ctaHover,
  ctaActive,
  prepTwoBack,
  prepTwoCtaEnabled,
  prepTwoCtaDisabled,
  prepNavBack,
  prepNavCtaEnabled,
  prepNavCtaDisabled,
  type PrepStep,
} from './prep/prepAssets'

type AdventurePrepScreenProps = {
  initialProfile: Profile | null
  audio: AudioSettings
  exiting: boolean
  isOffline: boolean
  onComplete: (profile: Profile) => Promise<{ ok: boolean }>
  onScreenChange: (screen: TunerScreen) => void
}

export function AdventurePrepScreen({ initialProfile, audio, exiting, isOffline, onComplete, onScreenChange }: AdventurePrepScreenProps) {
  // A finished profile always wins; a draft only matters for a first-time run that got
  // interrupted (refresh, dropped connection) before there was a profile to restore from.
  const [draft] = useState<PrepDraft | null>(() => (initialProfile ? null : loadPrepDraft().value))
  const [step, setStep] = useState<PrepStep>(draft?.step ?? 1)
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(initialProfile?.schoolLevel ?? draft?.schoolLevel ?? null)
  const [schoolPreview, setSchoolPreview] = useState<SchoolLevel | null>(null)
  const [careerRange, setCareerRange] = useState<CareerRange | null>(initialProfile?.careerRange ?? draft?.careerRange ?? null)
  const [careerPreview, setCareerPreview] = useState<CareerRange | null>(null)
  const [region, setRegion] = useState<Region | null>(initialProfile?.region ?? draft?.region ?? null)
  const [growthPriorities, setGrowthPriorities] = useState<GrowthPriority[]>(initialProfile?.growthPriorities ?? draft?.growthPriorities ?? [])
  const [otherText, setOtherText] = useState(initialProfile?.growthPriorityOther ?? draft?.growthPriorityOther ?? '')
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? draft?.nickname ?? '')
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
    if (step === 'loading') return
    savePrepDraft({ version: 1, step, schoolLevel, careerRange, region, growthPriorities, growthPriorityOther: otherText, nickname })
  }, [step, schoolLevel, careerRange, region, growthPriorities, otherText, nickname])

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
    clearPrepDraft()
  }

  if (step === 'loading') {
    return <main className={`entry-loading ${exiting ? 'is-exiting' : ''}`} aria-live="polite">
    <img className="entry-loading__reference" src={loadingMaster} alt="" aria-hidden="true" />
      <div className="entry-loading__veil" aria-hidden="true" />
      <div className="entry-motes entry-motes--loading" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      <section className="entry-loading__copy">
        <span data-tune-id="loading-emblem"><CompassSeal className="entry-loading__seal" /></span>
        <h1>교실 모험을 준비하는 중…</h1>
        <p>선생님의 플레이 여정을 정리하고 있어요…</p>
        <div className="entry-loading__dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="entry-loading__track" aria-label={`모험 준비 ${loadingProgress}%`}><i style={{ width: `${loadingProgress}%` }} /></div>
        <p className="entry-loading__wait">잠시만 기다려 주세요</p>
        {loadingError && <p className="entry-loading__error">{loadingError}</p>}
      </section>
    </main>
  }

  if (step === 'nickname') {
    return <main className={`entry-prep entry-prep--nickname ${exiting ? 'is-exiting' : ''}`} aria-labelledby="nickname-title">
      <img className="entry-prep__world" src={portalAcademy} alt="" aria-hidden="true" />
      <img className="entry-prep__reference" src={stageImage} alt="" aria-hidden="true" />
      <div className="entry-prep__vignette" aria-hidden="true" />
      <div className="entry-motes" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div>
      <section className="entry-prep__panel entry-prep__panel--nickname" data-tune-id="nickname-panel">
        <header className="entry-prep__header"><div className="entry-prep__brand"><CompassSeal /><span>CLASSCADE ADVENTURE</span></div><PrepProgress step={4} /></header>
        <div className="entry-nickname">
          <span className="entry-nickname__orb"><CompassSeal /></span>
          <p className="entry-kicker">✦ 여정의 마지막 준비 ✦</p>
          <h1 id="nickname-title"><span>용사님의 닉네임을</span><span>알려주세요</span></h1>
          <p>이 여정에서 불릴 이름이에요.</p>
          <label><span>용사 닉네임</span><input value={nickname} maxLength={16} autoComplete="off" placeholder="예: 플레이메이커쌤" onChange={(event) => setNickname(event.target.value.slice(0, 16))} /></label>
          <small>실제 이름이나 학교명 대신, 이 모험에서 사용할 별명을 적어 주세요.</small>
        </div>
        <footer className="entry-prep__footer"><button type="button" className="entry-button entry-button--back" onClick={previousStep}>← 이전 질문</button><button type="button" className="entry-button entry-button--next" disabled={!nicknameReady} onClick={beginLoading} data-tune-id="prep-next-button"><CompassSeal />모험 준비 완료 <Icon name="arrow" size={22} /></button></footer>
      </section>
    </main>
  }

  const canContinue = step === 1 ? Boolean(schoolLevel) : step === 2 ? Boolean(careerRange) : step === 3 ? Boolean(region) : growthReady
  if (step === 1) {
    return <main className={`entry-prep entry-prep--1 entry-prep01-stage ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-1-title">
      <img className="entry-prep01-stage__background" src={prepOneWorldBackdrop} alt="" aria-hidden="true" />
      <div className="entry-motes entry-motes--prep01" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} />)}</div>
      <section className="entry-prep01-plate" aria-labelledby="prep-1-title">
        <img className="entry-prep01-plate__image" src={prepOneCleanPlate} alt="" aria-hidden="true" />
        <h1 id="prep-1-title" className="sr-only">모험 준비 — 어느 교실에서 함께하고 있나요?</h1>
        <PrepOneChoiceCards value={schoolLevel} previewValue={schoolPreview} onChange={setSchoolLevel} onPreviewChange={setSchoolPreview} />
        <button type="button" className="entry-prep01-plate__cta" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로">
          <img className="entry-prep01-plate__cta-disabled" src={ctaDisabled} alt="" aria-hidden="true" />
          <img className="entry-prep01-plate__cta-enabled" src={ctaEnabled} alt="" aria-hidden="true" />
          <img className="entry-prep01-plate__cta-hover" src={ctaHover} alt="" aria-hidden="true" />
          <img className="entry-prep01-plate__cta-active" src={ctaActive} alt="" aria-hidden="true" />
        </button>
        <p className="entry-prep01-plate__note"><Icon name="notebook" size={13} />입력한 정보는 언제든지 변경할 수 있어요.</p>
        {isOffline && <p className="entry-prep__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
      </section>
    </main>
  }

  if (step === 2) {
    return <main className={`entry-prep entry-prep--2 entry-prep02-stage ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-2-title">
      <img className="entry-prep02-stage__plate" src={prepTwoCleanPlate} alt="" aria-hidden="true" />
      <div className="entry-motes entry-motes--prep02" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
      <section className="entry-prep02-plate" aria-labelledby="prep-2-title">
        <h1 id="prep-2-title" className="sr-only">모험 준비 — 선생님의 교실 여정은 어느 정도인가요?</h1>
        <svg className="entry-prep02-plate__path" viewBox="0 0 1484 1060" preserveAspectRatio="none" aria-hidden="true"><path d="M196 690 Q 340 706 454 672 T 634 690 T 813 672 T 993 690 Q 1080 702 1128 692" /></svg>
        <PrepTwoChoiceCards value={careerRange} previewValue={careerPreview} onChange={setCareerRange} onPreviewChange={setCareerPreview} />
        <button type="button" className="entry-prep02-plate__back entry-nav-img" onClick={previousStep} aria-label="이전 질문"><img src={prepTwoBack} alt="" aria-hidden="true" /></button>
        <button type="button" className="entry-prep02-plate__cta entry-nav-img" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로"><img src={canContinue ? prepTwoCtaEnabled : prepTwoCtaDisabled} alt="" aria-hidden="true" /></button>
        {isOffline && <p className="entry-prep02-plate__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
      </section>
    </main>
  }

  return <main className={`entry-prep entry-prep--${step} ${exiting ? 'is-exiting' : ''}`} aria-labelledby={`prep-${step}-title`}>
    <img className="entry-prep__world" src={portalAcademy} alt="" aria-hidden="true" />
    <img className="entry-prep__reference" src={stageImage} alt="" aria-hidden="true" data-tune-id={`prep-${step}-hero`} />
    {step === 3 && region && <i className={`entry-prep__region-marker entry-prep__region-marker--${REGION_OPTIONS.findIndex((option) => option.value === region) + 1}`} aria-hidden="true" />}
    {step === 4 && growthPriorities.length > 0 && <div className={`entry-prep__growth-nodes entry-prep__growth-nodes--${growthPriorities.length}`} aria-hidden="true">{growthPriorities.map((priority, index) => <i key={priority} style={{ '--node': index } as CSSProperties} />)}</div>}
    <div className="entry-prep__vignette" aria-hidden="true" />
    <div className="entry-motes" aria-hidden="true">{Array.from({ length: 24 }, (_, index) => <i key={index} />)}</div>
    <section className="entry-prep__panel">
      <header className="entry-prep__header">
        <div className="entry-prep__brand"><CompassSeal /><span>CLASSCADE ADVENTURE</span></div>
        <PrepProgress step={stepNumber} />
      </header>
      <div className="entry-prep__intro">
        <h1>모험 준비</h1>
        <p>교실 모험을 시작하기 전,<br />간단한 정보를 선택해 주세요.</p>
      </div>
      <section className={`entry-prep__question entry-prep__question--${step}`} aria-labelledby={`prep-${step}-title`}>
        <p className="entry-prep__question-number">{title.number}</p>
        <h2 id={`prep-${step}-title`} data-tune-id={`prep-${step}-title`}>{title.question}</h2>
        <p>{title.helper} {step === 4 && <strong aria-live="polite">{growthPriorities.length} / 3</strong>}</p>
        {step === 3 && region && <p className="entry-prep__next-cue" role="status">지역을 선택했어요 · 아래의 다음 질문 버튼으로 이어가요 ↓</p>}
        {step === 3 && <ChoiceCards options={REGION_OPTIONS} value={region} onChange={setRegion} icons={['region']} tunePrefix="prep-3" compact />}
        {step === 4 && growthPriorities.length === 3 && <p className="entry-prep__next-cue" role="status">선택 완료 · 아래의 다음 질문 버튼으로 이어가요 ↓</p>}
        {step === 4 && <div className="entry-growth-grid" role="group" aria-label="교실 성장 우선순위">
          {GROWTH_PRIORITY_OPTIONS.map((option, index) => {
            const selected = growthPriorities.includes(option.value)
            return <button key={option.value} className={`entry-growth-card ${selected ? 'is-selected' : ''}`} type="button" style={{ '--frame-neutral': `url(${choiceFrameNeutral})`, '--frame-selected': `url(${choiceFrameSelected})` } as CSSProperties} aria-pressed={selected} data-tune-id={`prep-4-option-${index + 1}`} onClick={() => toggleGrowthPriority(option.value)}><Icon name={growthIcons[index]} size={24} /><span>{option.label}</span>{selected && <i aria-hidden="true"><Icon name="check" size={15} /></i>}</button>
          })}
          {otherSelected && <label className="entry-growth-other"><span>기타 직접 입력</span><input value={otherText} maxLength={30} placeholder="직접 입력해 주세요." onChange={(event) => setOtherText(event.target.value.slice(0, 30))} /></label>}
          <p className="entry-growth-message" aria-live="polite">{selectionMessage}</p>
        </div>}
      </section>
      <footer className="entry-prep__footer">
        <button type="button" className="entry-button entry-button--back entry-nav-img" onClick={previousStep} aria-label="이전 질문"><img src={prepNavBack} alt="" aria-hidden="true" /></button>
        <button type="button" className="entry-button entry-button--next entry-nav-img" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로"><img src={canContinue ? prepNavCtaEnabled : prepNavCtaDisabled} alt="" aria-hidden="true" /></button>
      </footer>
      {isOffline && <p className="entry-prep__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
    </section>
  </main>
}
