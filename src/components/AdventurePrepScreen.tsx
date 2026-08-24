import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArtLoadingScreen } from './prep/ArtLoadingScreen'
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
import { noteAudioUserGesture, playSceneTheme } from '../lib/audioManager'
import { moteHash } from '../lib/moteHash'
import { toggleAudioChannel, type AudioSettings } from '../lib/audioController'
import { AudioToggleButton } from './AudioToggleButton'
import { loadPrepDraft, savePrepDraft, clearPrepDraft, type Profile, type PrepDraft } from '../lib/storage'
import { toggleGrowthPriority as getNextGrowthPriorities } from '../lib/prepSelection'
import { ClasscadeEmblem, ClasscadeWordmark, Icon } from './VisualPrimitives'
import { degradeToFlat, isFlat, type VisualScreen } from '../config/visualMode'
import { JOURNEY_SCENE_ASSETS } from '../data/sceneAssets'
import '../entry.css'
import type { TunerScreen } from '../features/entry/visualTuning'
import { PrepOneChoiceCards } from './prep/PrepOneChoiceCards'
import { PrepTwoChoiceCards } from './prep/PrepTwoChoiceCards'
import { ChoiceCards } from './prep/ChoiceCards'
import { PrepFlatCards } from './prep/PrepFlatCards'
import { PrepProgress } from './prep/PrepProgress'
import profileAvatar from '../assets/brand/profile-avatar-front.webp'
import classcadeWordmarkTrimmed from '../assets/brand/classcade-wordmark-trimmed.webp'
import {
  STEP_IMAGES,
  growthIcons,
  choiceFrameNeutral,
  choiceFrameSelected,
  prepFourReference,
  portalAcademy,
  prepWorldBackdropMobile,
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
  prepFinalCtaEnabled,
  prepFinalCtaDisabled,
  prepFinalCtaHover,
  prepFinalCtaActive,
  prepThreeMapMaster,
  PREP3_PLAQUES,
  PREP3_GLOWS,
  type PrepStep,
} from './prep/prepAssets'

/** Art vs flat is resolved per screen - see src/config/visualMode.ts. */
const prepScreen = (step: PrepStep): VisualScreen | null =>
  step === 'nickname' ? 'nickname' : step === 'loading' ? null : (`prep${step}` as VisualScreen)

/**
 * Nav button drawn from finished artwork, falling back to the CSS button if the image
 * fails. The fallback matters: the art variant sets `color: transparent`, so a missing
 * image would leave a working but completely invisible button.
 */
function NavArtButton({ art, label, onClick, disabled, variant, tuneId }: {
  art: string; label: string; onClick: () => void; disabled?: boolean; variant: 'back' | 'next'; tuneId?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <button
      type="button"
      className={`entry-button entry-button--${variant} ${failed ? 'entry-button--flat' : 'entry-nav-img'}`}
      onClick={onClick}
      disabled={disabled}
      data-tune-id={tuneId}
      aria-label={label}
    >
      {failed ? label : <img src={art} alt="" aria-hidden="true" onError={() => setFailed(true)} />}
    </button>
  )
}

/** The final "모험 준비 완료" plaque, with hover/active swaps done in JS rather than CSS
 *  background tricks so a load failure of ANY state can fall back to the flat button. */
function FinalCtaButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  const [failed, setFailed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const art = disabled ? prepFinalCtaDisabled : pressed ? prepFinalCtaActive : hovered ? prepFinalCtaHover : prepFinalCtaEnabled
  if (failed) {
    return <button type="button" className="entry-button entry-button--next entry-button--flat" disabled={disabled} onClick={onClick} data-tune-id="prep-next-button">모험 준비 완료 <Icon name="arrow" size={20} /></button>
  }
  return (
    <button
      type="button"
      className="entry-button entry-button--next entry-nav-img entry-nav-img--final"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      data-tune-id="prep-next-button"
      aria-label="모험 준비 완료"
    >
      <img src={art} alt="" aria-hidden="true" onError={() => setFailed(true)} />
    </button>
  )
}

const SCHOOL_ICONS = ['sprout', 'leaf', 'notebook', 'school', 'spark'] as const
const CAREER_ICONS = ['sprout', 'leaf', 'tree', 'lantern', 'compass'] as const

/** Firefly field. Each mote gets a deterministic pseudo-random position, phase and size
 *  through CSS vars — before this the CSS expected `--i` that was never set, so most of
 *  the 20 motes piled invisibly on one spot and only a handful ever showed. */
export function EntryMotes({ count, className = '' }: { count: number; className?: string }) {
  return (
    <div className={`entry-motes ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} style={{
          '--x': `${(moteHash(index * 7 + 1) * 94 + 2).toFixed(1)}%`,
          '--y': `${(moteHash(index * 7 + 2) * 86 + 4).toFixed(1)}%`,
          '--s': 3 + Math.floor(moteHash(index * 7 + 3) * 8),
          /* Fully independent cycle per mote — a negative delay starts each one
             mid-flight, so the field never breathes in unison. */
          '--dur': `${(5.5 + moteHash(index * 7 + 4) * 6).toFixed(2)}s`,
          '--delay': `-${(moteHash(index * 7 + 5) * 12).toFixed(2)}s`,
          '--dx': (moteHash(index * 7 + 6) * 12 - 6).toFixed(1),
          '--amp': (8 + moteHash(index * 7 + 0) * 22).toFixed(1),
        } as CSSProperties} />
      ))}
    </div>
  )
}

type AdventurePrepScreenProps = {
  initialProfile: Profile | null
  audio: AudioSettings
  exiting: boolean
  isOffline: boolean
  onComplete: (profile: Profile) => Promise<{ ok: boolean }>
  onScreenChange: (screen: TunerScreen) => void
  onAudioChange: (audio: AudioSettings) => void
}

export function AdventurePrepScreen({ initialProfile, audio, exiting, isOffline, onComplete, onScreenChange, onAudioChange }: AdventurePrepScreenProps) {
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

  /* The prep screens own the audio scene while mounted: any journey track left playing
     (e.g. after 처음으로) fades out, and the prep track starts as soon as a user gesture
     exists. The loading step fades everything out so the start theme opens clean. */
  useEffect(() => {
    playSceneTheme(step === 'loading' ? null : 'prep', audio.bgmEnabled, audio.bgmVolume)
  }, [step, audio.bgmEnabled, audio.bgmVolume])

  useEffect(() => {
    onScreenChange(step === 'nickname' || step === 'loading' ? step : `prep-${step}` as TunerScreen)
  }, [onScreenChange, step])

  useEffect(() => {
    if (step === 'loading') return
    savePrepDraft({ version: 1, step, schoolLevel, careerRange, region, growthPriorities, growthPriorityOther: otherText, nickname })
  }, [step, schoolLevel, careerRange, region, growthPriorities, otherText, nickname])

  /* onComplete is a new function on every App render; a ref keeps it out of the loading
     effect's deps so an unrelated re-render can't restart the bar timeline (which made
     the bar visibly run backward on the journey interludes before the same fix). */
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  useEffect(() => {
    if (step !== 'loading') return
    /* Decode the start screen's big backdrop while the bar fills — without this the art
       arrives a beat after the scene and the whole background visibly settles ("덜컹").
       The handoff below AWAITS this (capped): on the deployed site the multi-MB art can
       outlive the ~2s bar, and switching before it's ready made the main screen visibly
       fill itself in ("화면이 늘어나며 맞추는 느낌"). */
    const startArt = new Image()
    startArt.src = JOURNEY_SCENE_ASSETS.start.src
    const mainScreenReady = Promise.race([
      Promise.all([
        startArt.decode?.().catch(() => undefined) ?? Promise.resolve(),
        typeof document !== 'undefined' && document.fonts ? document.fonts.ready.catch(() => undefined) : Promise.resolve(),
      ]),
      new Promise((resolve) => window.setTimeout(resolve, 4600)),
    ])
    const progressTimers = [
      window.setTimeout(() => setLoadingProgress(18), 120),
      window.setTimeout(() => setLoadingProgress(46), 540),
      window.setTimeout(() => setLoadingProgress(74), 980),
      window.setTimeout(() => setLoadingProgress(92), 1420),
      window.setTimeout(() => setLoadingProgress(100), 1850),
    ]
    /* Already playing softly from prep; this raises it to the chosen volume for the journey. */
    /* Hand over to the start screen's theme: fade the prep track out here so the main
       theme can fade in as the start screen appears. */
    const audioTimer = window.setTimeout(() => playSceneTheme(null, audio.bgmEnabled, audio.bgmVolume), 1240)
    const finishTimer = window.setTimeout(async () => {
      await mainScreenReady
      const now = new Date().toISOString()
      const result = await onCompleteRef.current({
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
    /* Deps are [step] ON PURPOSE: the loading screen has no inputs, so every closed-over
       value is frozen for its whole lifetime — but onComplete SAVES the profile, which
       re-renders this component with a changed initialProfile. With the values in the
       deps the effect restarted at that moment and the finished bar visibly ran
       BACKWARD (393px → 95px) before the scene switch. */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot loading timeline; see comment above
  }, [step])

  const title = useMemo(() => {
    if (step === 1) return { number: '01', question: '어느 교실에서 함께하고 있나요?', helper: '함께하고 있는 학생들의 학교급을 선택해 주세요.' }
    if (step === 2) return { number: '02', question: '선생님의 교육 여정은 얼마나 되었나요?', helper: '선생님의 경험에 가장 가까운 단계를 선택해 주세요.' }
    if (step === 3) return { number: '03', question: '선생님의 교실은 어디에 있나요?', helper: '현재 거주하시는 권역을 선택해 주세요.' }
    return { number: '04', question: '교실에서 키우고 싶은 것은 무엇인가요?', helper: '최대 3개까지 선택할 수 있어요.' }
  }, [step])

  function nextStep() {
    noteAudioUserGesture()
    /* Autoplay needs a user gesture, so the step-effect's earlier attempt was a no-op on
       the very first interaction — retry now that the gesture flag is set. */
    playSceneTheme(step === 'loading' ? null : 'prep', audio.bgmEnabled, audio.bgmVolume)
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
    // The master art carries the heading, sub-line, dots, bar frame and wait line;
    // ArtLoadingScreen cover-fills it and positions the live fill on the drawn frame.
    return <ArtLoadingScreen progress={loadingProgress} title="교실 모험을 준비하는 중..." subtitle="선생님의 플레이 여정을 준비하고 있어요..." className={exiting ? 'is-exiting' : ''}>
      {loadingError && <p className="entry-loading__error">{loadingError}</p>}
      {/* Glyph preheat for the MAIN screen: its serif strings load their Korean font
          subsets during these loading seconds, so the start title doesn't visibly grow
          and re-centre the moment the scene appears. */}
      <span aria-hidden="true" style={{ fontFamily: "'Gowun Batang', serif", position: 'absolute', visibility: 'hidden' }}>당신의 교실 플레이 모험이 시작됩니다 여러분의 선택으로 나의 유형을 발견하고, 선생님 캐릭터를 성장시켜 보세요 NBTI 새로 더욱 더 몰입감을 높이고 싶다면 켜고 해보세요 !</span>
    </ArtLoadingScreen>
  }

  if (step === 'nickname') {
    return <main className={`entry-prep entry-prep--nickname ${isFlat('nickname') ? 'entry-prep--flat' : ''} ${exiting ? 'is-exiting' : ''}`} aria-labelledby="nickname-title">
      <img className="entry-prep__world" src={portalAcademy} alt="" aria-hidden="true" />
      <img className="entry-prep__world entry-prep__world--mobile" src={prepWorldBackdropMobile} alt="" aria-hidden="true" />
      {!isFlat('nickname') && <img className="entry-prep__reference" src={stageImage} alt="" aria-hidden="true" onError={() => degradeToFlat('nickname')} />}
      <div className="entry-prep__vignette" aria-hidden="true" />
      <EntryMotes count={96} />
      <div className="entry-prep__top-brand entry-prep__glass-bar">
        <ClasscadeEmblem /><ClasscadeWordmark src={classcadeWordmarkTrimmed} />
      </div>
      <div className="entry-prep__top-actions entry-prep__glass-bar">
        <AudioToggleButton kind="bgm" enabled={audio.bgmEnabled} onToggle={() => onAudioChange(toggleAudioChannel(audio, 'bgm'))} />
        <span className={`entry-prep__equalizer ${audio.bgmEnabled ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <i key={index} />)}</span>
        <img className="entry-prep__avatar-deco" src={profileAvatar} alt="" aria-hidden="true" />
      </div>
      <section className="entry-prep__panel entry-prep__panel--nickname" data-tune-id="nickname-panel">
        <header className="entry-prep__header"><PrepProgress step={5} /></header>
        <div className="entry-nickname">
          <p className="entry-kicker">✦ 여정의 마지막 준비 ✦</p>
          <h1 id="nickname-title"><span>용사님의 닉네임을</span> <span>알려주세요</span></h1>
          <p>이 여정에서 불릴 이름이에요.</p>
          <label><input value={nickname} maxLength={16} autoComplete="off" aria-label="용사 닉네임" placeholder="예: 우리 같이 놀아요" onChange={(event) => setNickname(event.target.value.slice(0, 16))} /></label>
        </div>
        <footer className="entry-prep__footer">
          <NavArtButton art={prepNavBack} label="← 이전 질문" onClick={previousStep} variant="back" />
          <FinalCtaButton disabled={!nicknameReady} onClick={beginLoading} />
        </footer>
      </section>
    </main>
  }

  const canContinue = step === 1 ? Boolean(schoolLevel) : step === 2 ? Boolean(careerRange) : step === 3 ? Boolean(region) : growthReady
  if (!isFlat('prep1') && step === 1) {
    return <main className={`entry-prep entry-prep--1 entry-prep01-stage ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-1-title">
      <img className="entry-prep01-stage__background" src={prepOneWorldBackdrop} alt="" aria-hidden="true" />
      <EntryMotes count={96} className="entry-motes--prep01" />
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

  if (!isFlat('prep2') && step === 2) {
    return <main className={`entry-prep entry-prep--2 entry-prep02-stage ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-2-title">
      <img className="entry-prep02-stage__plate" src={prepTwoCleanPlate} alt="" aria-hidden="true" />
      <EntryMotes count={96} className="entry-motes--prep02" />
      <section className="entry-prep02-plate" aria-labelledby="prep-2-title">
        <h1 id="prep-2-title" className="sr-only">모험 준비 — 선생님의 교육 여정은 얼마나 되었나요?</h1>
        <svg className="entry-prep02-plate__path" viewBox="0 0 1484 1060" preserveAspectRatio="none" aria-hidden="true"><path d="M196 690 Q 340 706 454 672 T 634 690 T 813 672 T 993 690 Q 1080 702 1128 692" /></svg>
        <PrepTwoChoiceCards value={careerRange} previewValue={careerPreview} onChange={setCareerRange} onPreviewChange={setCareerPreview} />
        <button type="button" className="entry-prep02-plate__back entry-nav-img" onClick={previousStep} aria-label="이전 질문"><img src={prepTwoBack} alt="" aria-hidden="true" /></button>
        <button type="button" className="entry-prep02-plate__cta entry-nav-img" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로"><img src={canContinue ? prepTwoCtaEnabled : prepTwoCtaDisabled} alt="" aria-hidden="true" /></button>
        {isOffline && <p className="entry-prep02-plate__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
      </section>
    </main>
  }

  if (!isFlat('prep3') && step === 3) {
    /* Full-board map master: everything (title, plaque labels, map, nav plaques) is painted
       into the image; the DOM contributes invisible hit targets over the painted plaques,
       a selected-state overlay that repaints the label, and the per-region map glow. */
    return <main className={`entry-prep entry-prep--3 entry-prep03-map ${exiting ? 'is-exiting' : ''}`} aria-labelledby="prep-3-title">
      <h1 id="prep-3-title" className="sr-only">모험 준비 — 선생님의 교실은 어디에 있나요?</h1>
      <div className="prep3-map">
        <img className="prep3-map__bg" src={prepThreeMapMaster} alt="" aria-hidden="true" onError={() => degradeToFlat('prep3')} />
        {REGION_OPTIONS.map((option, index) => {
          const pos = PREP3_PLAQUES[index]
          return (
            <button key={option.value} type="button"
              className={`prep3-map__plaque ${region === option.value ? 'is-selected' : ''}`}
              style={{ left: `${pos.l}%`, top: `${pos.t}%` }}
              data-label={option.label} aria-pressed={region === option.value}
              onClick={() => setRegion(option.value)}>
              <span className="sr-only">{option.label}</span>
            </button>
          )
        })}
        {region && PREP3_GLOWS[region] && <i className="prep3-map__glow" style={{ left: `${PREP3_GLOWS[region].l}%`, top: `${PREP3_GLOWS[region].t}%` }} aria-hidden="true" />}
        <button type="button" className="prep3-map__nav prep3-map__nav--back" onClick={previousStep} aria-label="이전 질문" />
        <button type="button" className="prep3-map__nav prep3-map__nav--next" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로" />
      </div>
      {isOffline && <p className="entry-prep__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
    </main>
  }

  const screen = prepScreen(step)
  const flat = screen ? isFlat(screen) : true
  return <main className={`entry-prep entry-prep--${step} ${flat ? 'entry-prep--flat' : ''} ${exiting ? 'is-exiting' : ''}`} aria-labelledby={`prep-${step}-title`}>
    <img className="entry-prep__world" src={portalAcademy} alt="" aria-hidden="true" />
    <img className="entry-prep__world entry-prep__world--mobile" src={prepWorldBackdropMobile} alt="" aria-hidden="true" />
    {!flat && <img className="entry-prep__reference" src={stageImage} alt="" aria-hidden="true" data-tune-id={`prep-${step}-hero`} onError={() => screen && degradeToFlat(screen)} />}
    {!flat && step === 3 && region && <i className={`entry-prep__region-marker entry-prep__region-marker--${REGION_OPTIONS.findIndex((option) => option.value === region) + 1}`} aria-hidden="true" />}
    {!flat && step === 4 && growthPriorities.length > 0 && <div className={`entry-prep__growth-nodes entry-prep__growth-nodes--${growthPriorities.length}`} aria-hidden="true">{growthPriorities.map((priority, index) => <i key={priority} style={{ '--node': index } as CSSProperties} />)}</div>}
    <div className="entry-prep__vignette" aria-hidden="true" />
    <EntryMotes count={96} />
    <div className="entry-prep__top-brand entry-prep__glass-bar">
      <ClasscadeEmblem /><ClasscadeWordmark src={classcadeWordmarkTrimmed} />
    </div>
    <div className="entry-prep__top-actions entry-prep__glass-bar">
      <AudioToggleButton kind="bgm" enabled={audio.bgmEnabled} onToggle={() => onAudioChange(toggleAudioChannel(audio, 'bgm'))} />
      <span className={`entry-prep__equalizer ${audio.bgmEnabled ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <i key={index} />)}</span>
      <img className="entry-prep__avatar-deco" src={profileAvatar} alt="" aria-hidden="true" />
    </div>
    <section className="entry-prep__panel">
      <header className="entry-prep__header">
        <PrepProgress step={stepNumber} />
      </header>
      <div className="entry-prep__intro">
        <h1>모험 준비</h1>
        <p>교실 모험을 시작하기 전, 간단한 정보를 선택해 주세요.</p>
      </div>
      {/* Invisible glyph preheat: the nickname screen's serif strings load their Korean
          font subsets HERE, steps earlier — without this the step-5 heading visibly
          reassembles ("찌그러졌다 펴짐") as each subset arrives. */}
      <span aria-hidden="true" style={{ fontFamily: "'Gowun Batang', serif", position: 'absolute', visibility: 'hidden' }}>용사님의 닉네임을 알려주세요 여정의 마지막 준비 이 여정에서 불릴 이름</span>
      <section className={`entry-prep__question entry-prep__question--${step}`} aria-labelledby={`prep-${step}-title`}>
        <div className="entry-prep__question-head">
          <p className="entry-prep__question-number">{title.number}</p>
          <h2 id={`prep-${step}-title`} data-tune-id={`prep-${step}-title`}>{title.question}</h2>
          <p className="entry-prep__question-helper">{title.helper} {step === 4 && <strong aria-live="polite">{growthPriorities.length} / 3</strong>}</p>
        </div>
        {flat && step === 1 && <PrepFlatCards options={SCHOOL_LEVEL_OPTIONS} value={schoolLevel} onChange={setSchoolLevel} tunePrefix="prep-1" ariaLabel="함께하는 학생들의 학교급" icons={SCHOOL_ICONS} columns={5} />}
        {flat && step === 2 && <PrepFlatCards options={CAREER_RANGE_OPTIONS} value={careerRange} onChange={setCareerRange} tunePrefix="prep-2" ariaLabel="선생님의 교실 여정" icons={CAREER_ICONS} columns={5} />}
        {step === 3 && (flat
          /* The cue hangs absolutely above the 서울 card via the relative wrapper — being
             out of flow, its appearance can never push the cards or nav. */
          ? <div className="entry-prep__region-wrap">
            <p className={`entry-prep__next-cue ${region ? 'is-visible' : ''}`} role="status" aria-hidden={!region}>지역을 선택했어요 · 아래의 다음 질문 버튼으로 이어가요 ↓</p>
            <PrepFlatCards options={REGION_OPTIONS} value={region} onChange={setRegion} tunePrefix="prep-3" ariaLabel="지역" columns={9} compact />
          </div>
          : <ChoiceCards options={REGION_OPTIONS} value={region} onChange={setRegion} icons={['region']} tunePrefix="prep-3" compact />)}
        {step === 4 && <div className="entry-growth-grid" role="group" aria-label="교실 성장 우선순위">
          {GROWTH_PRIORITY_OPTIONS.map((option, index) => {
            const selected = growthPriorities.includes(option.value)
            return <button key={option.value} className={`entry-growth-card ${selected ? 'is-selected' : ''}`} type="button" style={flat ? undefined : ({ '--frame-neutral': `url(${choiceFrameNeutral})`, '--frame-selected': `url(${choiceFrameSelected})` } as CSSProperties)} aria-pressed={selected} data-tune-id={`prep-4-option-${index + 1}`} onClick={() => toggleGrowthPriority(option.value)}><Icon name={growthIcons[index]} size={24} /><span>{option.label}</span>{selected && <i aria-hidden="true"><Icon name="check" size={15} /></i>}</button>
          })}
          {otherSelected && <label className="entry-growth-other"><input value={otherText} maxLength={30} placeholder="직접 입력해 주세요." aria-label="기타 항목 직접 입력" onChange={(event) => setOtherText(event.target.value.slice(0, 30))} /></label>}
          <p className="entry-growth-message" aria-live="polite">{selectionMessage}</p>
        </div>}
      </section>
      <footer className={`entry-prep__footer ${step === 1 ? 'entry-prep__footer--single' : ''}`}>
        {flat ? <>
          {/* Step 1 has nothing before it — a disabled-but-visible back button implied
              a step 0 that doesn't exist. Just don't render it here. */}
          {step > 1 && <NavArtButton art={prepNavBack} label="← 이전 질문" onClick={previousStep} variant="back" />}
          <NavArtButton art={canContinue ? prepNavCtaEnabled : prepNavCtaDisabled} label="다음 질문" onClick={nextStep} disabled={!canContinue} variant="next" tuneId="prep-next-button" />
        </> : <>
          {step > 1 && <button type="button" className="entry-button entry-button--back entry-nav-img" onClick={previousStep} aria-label="이전 질문"><img src={prepNavBack} alt="" aria-hidden="true" /></button>}
          <button type="button" className="entry-button entry-button--next entry-nav-img" disabled={!canContinue} onClick={nextStep} data-tune-id="prep-next-button" aria-label="다음 질문으로"><img src={canContinue ? prepNavCtaEnabled : prepNavCtaDisabled} alt="" aria-hidden="true" /></button>
        </>}
      </footer>
      {isOffline && <p className="entry-prep__offline" role="status">오프라인 상태예요. 선택 내용은 이 기기에 안전하게 보관됩니다.</p>}
    </section>
  </main>
}
