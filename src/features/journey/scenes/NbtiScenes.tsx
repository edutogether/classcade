import { useEffect, useRef, useState, type ReactNode } from 'react'
import { prepNavBack, prepNavMainBack, prepNavCtaEnabled, prepNavCtaDisabled, resultCtaEnabled, resultCtaDisabled } from '../../../components/prep/prepAssets'
import { ArtLoadingScreen } from '../../../components/prep/ArtLoadingScreen'
import { JOURNEY_SCENE_ASSETS } from '../../../data/sceneAssets'
import profileAvatar from '../../../assets/brand/profile-avatar-front.webp'
import { ClasscadeLockup, Icon } from '../../../components/VisualPrimitives'
import { NBTI_AXES, NBTI_QUESTIONS, NBTI_TOTAL_QUESTIONS, type NbtiAxis, type NbtiDirection } from '../../../data/nbti.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { nbtiResultArt } from '../../../data/nbtiResultArt'
import { ResultRecommendations } from '../components/ResultRecommendations'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'
import { playSceneTheme } from '../../../lib/audioManager'

const journeyItems = [{ icon: 'clock' as const, title: '약 1분', detail: '간단한 여정' }, { icon: 'spark' as const, title: '캐릭터 성장', detail: '선택이 힘이 돼요' }, { icon: 'gamepad' as const, title: '우리 반 게임', detail: '까지 연결돼요' }]
const directionLabels: Record<NbtiDirection, string> = { design: '설계', response: '반응', whole: '전체', individual: '개별', criteria: '기준', empathy: '공감', completion: '완성', expansion: '확장' }
const directionEmoji: Record<NbtiDirection, string> = { design: '📐', response: '⚡', whole: '🤝', individual: '🌱', criteria: '📏', empathy: '💗', completion: '🧩', expansion: '🌈' }

/** Real MBTI letters (E/I, S/N, T/F, J/P), built from the 16 questions' answers.
 *  `result.code` (e.g. "P01") is only an internal lookup id for
 *  PROVISIONAL_NBTI_RESULTS, never meant for display.
 *  Each of our four axes maps onto the MBTI dichotomy it reads closest to:
 *  participation(전체/개별) -> E/I, flow(설계/반응) -> S/N, judgment(기준/공감,
 *  the direct match) -> T/F, learning(완성/확장) -> J/P. `directions` arrives in
 *  NBTI_AXES order (flow, participation, judgment, learning); the output is
 *  reassembled into MBTI's own canonical E-I-S-N-T-F-J-P slot order. */
const mbtiLetter: Record<NbtiDirection, string> = { whole: 'E', individual: 'I', design: 'S', response: 'N', criteria: 'T', empathy: 'F', completion: 'J', expansion: 'P' }
function nbtiTypeCode(directions: readonly NbtiDirection[]) {
  const [flowDir, participationDir, judgmentDir, learningDir] = directions
  return [participationDir, flowDir, judgmentDir, learningDir].map((direction) => mbtiLetter[direction]).join('')
}

/** First matching keyword wins, so more specific fragments are listed before the
 *  generic ones they overlap with (e.g. '안전' before '관계', '분위기' before '회복'). */
const strengthEmojiRules: readonly [string, string][] = [
  ['호기심', '🔍'], ['관찰', '👀'], ['가능성', '🌟'], ['운영', '🗂️'], ['감각', '🧠'],
  ['성취', '🏆'], ['설계', '📐'], ['대화', '💬'], ['확장', '🌱'], ['피드백', '📣'],
  ['완성', '🧩'], ['경로', '🧭'], ['기준', '📏'], ['질문', '❓'], ['동행', '🤝'],
  ['안전', '🛡️'], ['마음', '💗'], ['새', '🌠'], ['판단', '⚖️'], ['리듬', '🎵'],
  ['분위기', '🌈'], ['완주', '🏁'], ['해결', '🔧'], ['변화', '🔄'], ['추진력', '🚀'],
  ['에너지', '⚡'], ['전환', '🔀'], ['지원', '🤲'], ['문제', '🕵️'], ['실행력', '💪'],
  ['발상', '💭'], ['포착', '📸'], ['연결', '🔗'], ['도전', '🔥'], ['속도', '⏱️'],
  ['존중', '🙏'], ['참여', '🙌'], ['신호', '📶'], ['발견', '💡'], ['관계', '💞'], ['회복', '💚'],
]
function strengthEmoji(text: string) { return strengthEmojiRules.find(([keyword]) => text.includes(keyword))?.[1] ?? '✨' }

/** One small line-icon per NBTI direction (not per question) — 8 icons cover all 16 questions' 32 choice slots, since each choice always maps to one of the 8 directions. Drawn locally rather than added to the shared Icon set, since these are specific to NBTI choice cards. */
const directionIconPaths: Record<NbtiDirection, ReactNode> = {
  design: <><rect x="4.5" y="4.5" width="15" height="15" rx="1.6" /><path d="M4.5 11h15M11 4.5v15" /></>,
  response: <><path d="M4 12c3-6 13-6 16 0" /><path d="M16 8l4 4-4 4" /></>,
  whole: <><circle cx="12" cy="6.3" r="2.1" /><circle cx="6" cy="17" r="2.1" /><circle cx="18" cy="17" r="2.1" /><path d="M12 8.4 7.4 15M12 8.4l4.6 6.6M8.4 17h7.2" /></>,
  individual: <><circle cx="12" cy="8.2" r="3" /><path d="M6 20c0-4 2.7-6.2 6-6.2s6 2.2 6 6.2" /><circle cx="12" cy="12" r="9" strokeDasharray="1.5 3.2" /></>,
  criteria: <><path d="M12 3v18M7 7h10" /><path d="M7 7l-3 6a3 3 0 0 0 6 0L7 7ZM17 7l-3 6a3 3 0 0 0 6 0l-3-6Z" /></>,
  empathy: <path d="M12 20s-7-4.4-9.3-8.6C1.2 8 3 4.5 6.5 4.5c2 0 3.4 1.1 4 2.2.6-1.1 2-2.2 4-2.2 3.5 0 5.3 3.5 3.8 6.9C19 15.6 12 20 12 20Z" />,
  completion: <><circle cx="12" cy="9.7" r="6.5" /><path d="m9.2 9.7 1.9 1.9 3.7-3.7" /><path d="M9.3 15.6 7.3 21l4.7-2 4.7 2-2-5.4" /></>,
  expansion: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
}
/** 문항·선택지 내용에 맞춘 32개 개별 이모지(질문 id 기준) - 방향별 8개 선화 아이콘이
 *  계속 반복되어 밋밋하다는 1일차 피드백의 교체분. Windows/모바일 컬러 이모지로 렌더. */
const QUESTION_EMOJI: Record<string, readonly [string, string]> = {
  'unit-opening': ['🗺️', '💬'],
  'quiet-student': ['🧭', '🤲'],
  'opinion-conflict': ['⚖️', '🫂'],
  'early-finish': ['✅', '🚀'],
  'material-failure': ['🧰', '💡'],
  'few-speakers': ['🙋', '✍️'],
  'repeated-rule': ['📜', '🔍'],
  'interesting-solution': ['🏁', '🌌'],
  'unexpected-question': ['📌', '🌊'],
  'group-pace': ['⛳', '🪜'],
  'awkward-room': ['🚧', '🕊️'],
  'curious-ending': ['📘', '🔭'],
  'student-proposal': ['🗂️', '🎢'],
  'class-ahead': ['🚌', '🌱'],
  'effort-feedback': ['🎯', '🌟'],
  'closing-memory': ['🏆', '🌈'],
}

function DirectionIcon({ direction, size = 26 }: { direction: NbtiDirection; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{directionIconPaths[direction]}</svg>
}

/** Tallies weighted votes for the axis's answered-so-far choices. Three outcomes:
 *  `null` — nothing in this axis answered yet (sidebar shows "?", still forming);
 *  `'neutral'` — at least one answer exists but the weighted tally is exactly tied
 *  (sidebar shows "중립" — a real, stable outcome, not a placeholder); or a direction
 *  once one side leads. */
function axisLeaning(axis: NbtiAxis, answers: Record<string, string>): NbtiDirection | 'neutral' | null {
  const axisDef = NBTI_AXES.find((entry) => entry.id === axis)
  if (!axisDef) return null
  let scoreA = 0, scoreB = 0, answeredAny = false
  for (const question of NBTI_QUESTIONS) {
    if (question.axis !== axis) continue
    const choiceId = answers[question.id]
    if (!choiceId) continue
    const choice = question.choices.find((entry) => entry.id === choiceId)
    if (!choice) continue
    answeredAny = true
    if (choice.direction === 0) scoreA += question.weight; else scoreB += question.weight
  }
  if (!answeredAny) return null
  if (scoreA === scoreB) return 'neutral'
  return scoreA > scoreB ? axisDef.directions[0] : axisDef.directions[1]
}

/* Colour emoji instead of the thin line icons — same OS-native set the choice cards use. */
const SKILLS: readonly { emoji: string; name: string }[] = [
  { emoji: '🌱', name: '새싹 감각' },
  { emoji: '🏮', name: '마음 등불' },
  { emoji: '🗺️', name: '방향 감각' },
  { emoji: '🌳', name: '든든한 뿌리' },
]
const ITEMS: readonly { emoji: string | null; name: string }[] = [
  { emoji: '📔', name: '모험 노트' },
  { emoji: '🧭', name: '나침반' },
  { emoji: null, name: '빈 슬롯' },
  { emoji: null, name: '빈 슬롯' },
]

function GrowingPlayerPanel({ growth, answers, nickname }: { growth: number; answers: Record<string, string>; nickname?: string }) {
  const unlockedSkills = Math.min(SKILLS.length, Math.floor(growth / 25))
  return (
    <aside className="journey-panel journey-question__sidebar" aria-label="만들어지는 나의 교실 플레이어">
      <p className="journey-kicker">✦ 만들어지는</p>
      <h2>나의 교실 플레이어</h2>
      <div className="journey-question__sidebar-profile">
        <img src={profileAvatar} alt="" aria-hidden="true" />
        <span><small>교실 탐험가</small><strong>{nickname ?? '선생님'}</strong></span>
      </div>
      <div className="journey-question__sidebar-stat"><span>현재 완성도</span><b>{growth}%</b></div>
      <div className="journey-question__sidebar-track" aria-hidden="true"><i style={{ width: `${growth}%` }} /></div>
      <div className="journey-question__sidebar-block">
        <p>나의 성향 <small>(형성 중)</small></p>
        <div className="journey-question__sidebar-chips">
          {NBTI_AXES.map((axis) => {
            const leaning = axisLeaning(axis.id, answers)
            const label = leaning === 'neutral' ? '중립' : leaning ? directionLabels[leaning] : '?'
            return <span key={axis.id} className={leaning !== null ? 'is-revealed' : ''}>{label}</span>
          })}
        </div>
      </div>
      <div className="journey-question__sidebar-block">
        <p>보유 스킬 <small>(잠금 해제 예정)</small></p>
        <div className="journey-question__sidebar-slots journey-question__sidebar-slots--labeled">
          {SKILLS.map((skill, index) => (
            <figure key={skill.name}>
              <span className={index < unlockedSkills ? 'is-unlocked' : ''}>{index < unlockedSkills ? skill.emoji : '🔒'}</span>
              <figcaption>{skill.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="journey-question__sidebar-block">
        <p>소지 아이템</p>
        <div className="journey-question__sidebar-slots journey-question__sidebar-slots--labeled">
          {ITEMS.map((item, index) => (
            <figure key={`${item.name}-${index}`}>
              {item.emoji ? <span className="is-unlocked">{item.emoji}</span> : <span aria-hidden="true">➕</span>}
              <figcaption>{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function StartScene(props: JourneySceneProps) {
  /* Same loading interlude the prep flow uses, so entering the questions reads as a
     scene change rather than an instant swap. */
  /* 'questions' opens the NBTI; 'reset' wipes everything (닉네임 포함) and lands back on
     prep step 1 — both behind the same loading interlude. */
  const [starting, setStarting] = useState<false | 'questions' | 'reset'>(false)
  const [startProgress, setStartProgress] = useState(0)
  /* onAction is a fresh function on every JourneyApp render; going through a ref keeps
     it OUT of the effect deps. With it as a dep, any unrelated re-render (a notice
     fading, audio state syncing) restarted the interlude stopwatch and the bar visibly
     ran BACKWARD before creeping forward again. */
  const startActionRef = useRef(props.onAction)
  startActionRef.current = props.onAction
  useEffect(() => {
    if (!starting) return
    playSceneTheme(null, props.state.audio.bgmEnabled, props.state.audio.bgmVolume)
    const mode = starting
    /* Decode the QUESTION backdrop during the interlude and hold the handoff for it
       (capped) — switching before it was ready made the scene visibly pop in ("탁"). */
    const nextArt = new Image()
    nextArt.src = JOURNEY_SCENE_ASSETS.question.src
    const nextSceneReady = Promise.race([
      nextArt.decode?.().catch(() => undefined) ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 4600)),
    ])
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round((Date.now() - startedAt) / 22))
      setStartProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        if (mode === 'reset') { restartFromScratch(); return }
        void nextSceneReady.then(() => startActionRef.current({ type: 'START_NBTI' }))
      }
    }, 80)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot interlude: BGM fade + stopwatch must not restart on re-render
  }, [starting])
  if (starting) {
    return starting === 'reset'
      ? <ArtLoadingScreen progress={startProgress} title="새 모험을 준비하는 중..." subtitle="모든 기록을 새로 시작할게요..." />
      : <ArtLoadingScreen progress={startProgress} title="교실 장면을 여는 중..." subtitle="선생님만의 교실 이야기를 시작할게요..." />
  }
  return (
    <SceneFrame scene="start" {...props}>
      {/* v4 art carries no UI text on the left, so the copy is live DOM again, matching the
          reference lockup: kicker, headline with the gold word, sub-copy, fact chips,
          stacked buttons, headphone note. The quest board is painted into the art. */}
      <div className="journey-start__copy journey-enter">
        <p className="journey-kicker"><span>✦</span> NBTI ADVENTURE <span>✦</span></p>
        <h1 data-tune-id="main-title"><span>당신의 교실 속 플레이,</span><span><em>모험이</em> 시작됩니다 !</span></h1>
        <p className="journey-start__description" data-tune-id="main-description">나의 교실 유형을 발견하며, 캐릭터를 성장시켜 보세요.</p>
        <ul className="journey-start__cards" aria-label="여정 정보">
          {journeyItems.map((item) => <li key={item.title}><Icon name={item.icon} size={25} /><span><b>{item.title}</b><small>{item.detail}</small></span></li>)}
        </ul>
        <div className="journey-start__actions">
          {props.state.resumeStage ? <SecondaryButton onClick={() => props.onAction({ type: 'RESUME_JOURNEY' })} tuneId="main-resume-cta"><Icon name="reset" size={20} />이전 여정 이어가기</SecondaryButton> : <SecondaryButton onClick={() => setStarting('reset')} tuneId="main-resume-cta"><Icon name="reset" size={20} />새로 시작하기</SecondaryButton>}
          <PrimaryButton onClick={() => setStarting('questions')} tuneId="main-primary-cta">교실 NBTI 시작하기</PrimaryButton>
        </div>
        <p className="journey-start__audio-note" data-tune-id="main-headphone-note"><Icon name="speaker" size={17} />더욱 몰입감을 높이고 싶다면 BGM을 켜고 플레이해보세요 !</p>
      </div>
    </SceneFrame>
  )
}

export function QuestionScene(props: JourneySceneProps) {
  const question = NBTI_QUESTIONS[props.state.questionIndex]
  const axisDirections = NBTI_AXES.find((axis) => axis.id === question.axis)!.directions
  const selected = props.state.answers[question.id]
  const last = props.state.questionIndex === NBTI_TOTAL_QUESTIONS - 1
  const growth = Math.round(((props.state.questionIndex + (selected ? 1 : 0)) / NBTI_TOTAL_QUESTIONS) * 100)
  /* Same loading interlude the prep flow uses, played before the 16th answer reveals the
     result — the reveal itself is instant, so the bar is pure theatre (~2.6s). */
  const [revealing, setRevealing] = useState(false)
  const [revealProgress, setRevealProgress] = useState(0)
  /* Ref, not dep: a re-render mid-interlude must not restart the stopwatch (see StartScene). */
  const revealActionRef = useRef(props.onAction)
  revealActionRef.current = props.onAction
  useEffect(() => {
    if (!revealing) return
    playSceneTheme(null, props.state.audio.bgmEnabled, props.state.audio.bgmVolume)
    /* All 16 answers exist by reveal time, so the RESULT backdrop for the actual type
       can be decoded during the interlude; the handoff waits for it (capped) so the
       result scene never pops its background in late ("탁"). */
    /* By reveal time every axis has all 4 of its questions answered, so a genuine tie
       is possible; falling back to directions[0] here is only a tiebreak for computing
       ONE definite type code — the mid-question sidebar shows the tie honestly as
       "중립" instead of guessing (see axisLeaning). */
    const directions = NBTI_AXES.map((axis) => {
      const leaning = axisLeaning(axis.id, props.state.answers)
      return leaning && leaning !== 'neutral' ? leaning : axis.directions[0]
    })
    const resultArt = new Image()
    resultArt.src = nbtiResultArt(nbtiTypeCode(directions)) ?? JOURNEY_SCENE_ASSETS.result.src
    const resultReady = Promise.race([
      resultArt.decode?.().catch(() => undefined) ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 4600)),
    ])
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round((Date.now() - startedAt) / 26))
      setRevealProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        void resultReady.then(() => revealActionRef.current({ type: 'NEXT_NBTI' }))
      }
    }, 80)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot interlude: BGM fade + stopwatch must not restart on re-render
  }, [revealing])
  /* Q1's back slot ("메인 화면으로") used to dispatch GO_HOME instantly — an abrupt cut
     while every OTHER scene change in the app goes through this same loading interlude
     first. */
  const [returningHome, setReturningHome] = useState(false)
  const [returnProgress, setReturnProgress] = useState(0)
  const returnActionRef = useRef(props.onAction)
  returnActionRef.current = props.onAction
  useEffect(() => {
    if (!returningHome) return
    playSceneTheme(null, props.state.audio.bgmEnabled, props.state.audio.bgmVolume)
    const startArt = new Image()
    startArt.src = JOURNEY_SCENE_ASSETS.start.src
    const startReady = Promise.race([
      startArt.decode?.().catch(() => undefined) ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 4600)),
    ])
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round((Date.now() - startedAt) / 22))
      setReturnProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        void startReady.then(() => returnActionRef.current({ type: 'GO_HOME' }))
      }
    }, 80)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot interlude: BGM fade + stopwatch must not restart on re-render
  }, [returningHome])
  if (revealing) {
    return <ArtLoadingScreen progress={revealProgress} title="나의 플레이 결과를 여는 중..." subtitle="선생님의 선택들을 모으고 있어요..." />
  }
  if (returningHome) {
    return <ArtLoadingScreen progress={returnProgress} title="메인 화면으로 돌아가는 중..." subtitle="잠시 후 처음 화면에서 다시 만나요..." />
  }
  return (
    <SceneFrame scene="question" {...props} compact>
      {/* Two separate boards with an open gap between them, so the backdrop's centre —
          where the painting's subject sits — stays visible instead of being covered by
          one full-width panel. */}
      <div className="journey-question-split journey-enter">
        <div className="journey-panel journey-question">
          {/* current uses the SAME "answered so far" basis as growth below (not "which
              question am I viewing") — with the old questionIndex+1 basis, this bar sat
              at 16/16 the instant Q16 loaded (before any answer), while growth was still
              at 94/100; selecting Q16's answer then visibly yanked ONLY the growth bar
              the rest of the way to a ceiling this bar had already been idling at. Now
              both climb together and land on 100% at the same moment, on every question. */}
          <div className="journey-panel__topline"><p>{`장면 ${question.scene}`}</p><Progress current={props.state.questionIndex + (selected ? 1 : 0)} total={NBTI_TOTAL_QUESTIONS} label="진행률" /></div>
          <div className="journey-question__body">
            <div className="journey-question__copy"><p className="journey-kicker">{question.chapter}</p><h1>{question.prompt}</h1><p>{question.helper}</p><div className="journey-question__growth" aria-label={`캐릭터 성장 ${growth}%`}><i className="journey-question__growth-stage" aria-hidden="true">{['🌱', '🍀', '🌻', '🌳'][Math.min(3, Math.floor(props.state.questionIndex / 4))]}</i><span>성장</span><div className="journey-question__growth-track" aria-hidden="true"><i style={{ width: `${growth}%` }} /></div><b>{growth}%</b></div></div>
            <p className="journey-panel__fineprint journey-panel__fineprint--above">이 탐색은 체험용 교실 플레이 안내이며, 과학적 성격 진단이 아닙니다.</p>
            {/* Display order flips on a per-question hash: with the data's fixed order,
                always picking the TOP answer walked straight to one type (and the bottom
                to its opposite). Scoring still reads choice ids, so only the on-screen
                position shuffles — the emoji follows its choice via `direction`. */}
            <div className="journey-question__choices" role="group" aria-label={question.prompt}>
              {([...question.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 2 === 1 ? [...question.choices].reverse() : question.choices).map((choice, index) => (
                <button className={`journey-choice ${selected === choice.id ? 'is-selected' : ''}`} type="button" key={choice.id} onClick={() => props.onAction({ type: 'ANSWER_NBTI', questionId: question.id, choiceId: choice.id })} aria-pressed={selected === choice.id}>
                  <span className="journey-choice__number">0{index + 1}</span><b>{choice.label}</b><small>{choice.detail}</small><i aria-hidden="true" className="journey-choice__emoji">{QUESTION_EMOJI[question.id]?.[choice.direction] ?? <DirectionIcon direction={axisDirections[choice.direction]} size={29} />}</i>
                </button>
              ))}
            </div>
          </div>
          <div className="journey-panel__footer">
            {/* Q1 has no previous question — its back slot returns to the main screen
                (GO_HOME keeps state.resumeStage so 새로 시작하기 becomes 이전 여정
                이어가기 there) instead of dispatching PREVIOUS_NBTI into nothing. */}
            {props.state.questionIndex === 0
              ? <JourneyNavArt art={prepNavMainBack} label="← 메인 화면으로" onClick={() => setReturningHome(true)} variant="back" />
              : <JourneyNavArt art={prepNavBack} label="← 이전 질문" onClick={() => props.onAction({ type: 'PREVIOUS_NBTI' })} variant="back" />}
            {/* The drawn plaque says "다음 질문으로"; the final question needs different
                copy, so it keeps the CSS button. */}
            {last
              ? <JourneyNavArt art={selected ? resultCtaEnabled : resultCtaDisabled} label='나의 플레이 결과 보기' onClick={() => setRevealing(true)} disabled={!selected} variant='result' />
              : <JourneyNavArt art={selected ? prepNavCtaEnabled : prepNavCtaDisabled} label="다음 질문으로" onClick={() => props.onAction({ type: 'NEXT_NBTI' })} disabled={!selected} variant="next" />}
          </div>
        </div>
        <GrowingPlayerPanel growth={growth} answers={props.state.answers} nickname={props.profile?.nickname} />
      </div>
    </SceneFrame>
  )
}

/** Same drawn nav plaques as the prep flow, with the same guarantee: if the image fails
 *  to load, the flat CSS button comes back instead of an invisible click target. */
function JourneyNavArt({ art, label, onClick, disabled, variant }: { art: string; label: string; onClick: () => void; disabled?: boolean; variant: 'back' | 'next' | 'result' }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return variant === 'back'
      ? <SecondaryButton onClick={onClick} className="journey-button--back">{label}</SecondaryButton>
      : <PrimaryButton onClick={onClick} disabled={disabled}>{label}</PrimaryButton>
  }
  return (
    <button type="button" className={`journey-nav-img journey-nav-img--${variant}`} onClick={onClick} disabled={disabled} aria-label={label}>
      <img src={art} alt="" aria-hidden="true" onError={() => setFailed(true)} />
    </button>
  )
}

/** 부스 다음 참가자용 완전 초기화: 닉네임을 포함한 이 앱의 모든 저장값을 지우고
 *  모험 준비 1단계부터 깨끗하게 다시 시작한다. 리로드가 어떤 상태 초기화보다 확실하다. */
function restartFromScratch() {
  try {
    for (const key of Object.keys(localStorage)) if (key.startsWith('classcade.')) localStorage.removeItem(key)
    sessionStorage.clear()
  } catch { /* storage unavailable - reload alone still resets the in-memory run */ }
  window.location.href = window.location.pathname
}

export function ResultScene(props: JourneySceneProps & { onPair: () => void }) {
  const result = getProvisionalResult(props.state.resultCode)
  const typeArt = nbtiResultArt(nbtiTypeCode(result.directions))
  /* A QR visitor arrived *for* the recommendations, so open the panel immediately rather
     than making them find the button on a phone. */
  const [showRecommendations, setShowRecommendations] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('type'))
  /* Same loading interlude as everywhere else, then the full wipe + reload. */
  const [restarting, setRestarting] = useState(false)
  const [restartProgress, setRestartProgress] = useState(0)
  useEffect(() => {
    if (!restarting) return
    playSceneTheme(null, props.state.audio.bgmEnabled, props.state.audio.bgmVolume)
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round((Date.now() - startedAt) / 22))
      setRestartProgress(percent)
      if (percent >= 100) { window.clearInterval(timer); restartFromScratch() }
    }, 80)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- BGM fade fires once at interlude start
  }, [restarting])
  /* "NBTI 다시 탐색하기" kept answers and jumped back to Q1 with no transition — every
     other scene change in the app goes through this same loading interlude. */
  const [reviewing, setReviewing] = useState(false)
  const [reviewProgress, setReviewProgress] = useState(0)
  const reviewActionRef = useRef(props.onAction)
  reviewActionRef.current = props.onAction
  useEffect(() => {
    if (!reviewing) return
    playSceneTheme(null, props.state.audio.bgmEnabled, props.state.audio.bgmVolume)
    const questionArt = new Image()
    questionArt.src = JOURNEY_SCENE_ASSETS.question.src
    const questionReady = Promise.race([
      questionArt.decode?.().catch(() => undefined) ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 4600)),
    ])
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round((Date.now() - startedAt) / 22))
      setReviewProgress(percent)
      if (percent >= 100) {
        window.clearInterval(timer)
        void questionReady.then(() => reviewActionRef.current({ type: 'REVIEW_NBTI' }))
      }
    }, 80)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot interlude: BGM fade + stopwatch must not restart on re-render
  }, [reviewing])
  if (restarting) {
    return <ArtLoadingScreen progress={restartProgress} title="새 모험을 준비하는 중..." subtitle="모든 기록을 새로 시작할게요..." />
  }
  if (reviewing) {
    return <ArtLoadingScreen progress={reviewProgress} title="첫 질문으로 돌아가는 중..." subtitle="선생님의 답변은 그대로 남아있어요..." />
  }
  return (
    <SceneFrame scene="result" {...props} artSrc={typeArt}>
      <div className={`journey-result journey-result--${result.palette} ${typeArt ? 'journey-result--art' : ''} ${showRecommendations ? 'has-recommendations' : ''} journey-enter`}>
        <div className="journey-result__copy"><p className="journey-kicker">✦ 나의 교실 플레이 결과 ✦</p><p className="journey-result__eyebrow">나의 교실 플레이 유형은</p><h1>{result.title}</h1><div className="journey-result__badges"><span className="journey-result__code">{nbtiTypeCode(result.directions)}</span><div className="journey-result__strengths">{result.strengths.map((strength) => <span key={strength}>{strengthEmoji(strength)} {strength}</span>)}</div></div><p className="journey-result__description">{result.description}</p><div className="journey-result__directions" aria-label="나의 네 성향">{NBTI_AXES.map((axis, index) => <span key={axis.id}><small>{axis.label}</small><b>{directionEmoji[result.directions[index]]} {directionLabels[result.directions[index]]}</b></span>)}</div><p className="journey-result__caution"><b>다음 장면</b>{result.caution}</p><p className="journey-result__next">교실 속 나를 발견하다. 놀이로 확장하다.</p><p className="journey-result__disclaimer">이 결과는 선생님의 모든 모습을 규정하지 않아요. 오늘의 교실 장면에서 가장 자주 드러난 선택을 보여 줍니다.</p><div className="journey-result__actions"><SecondaryButton onClick={() => setReviewing(true)}><Icon name="reset" size={19} />NBTI 다시 탐색하기</SecondaryButton>{showRecommendations ? <PrimaryButton onClick={() => setRestarting(true)}>처음부터 시작하기</PrimaryButton> : <PrimaryButton onClick={() => setShowRecommendations(true)}>우리 교실 놀이 추천받기</PrimaryButton>}</div></div>
        <aside className="journey-result__reveal" aria-label="결과 해금 연출"><ClasscadeLockup /><p>{result.subtitle}</p><span>빛나는 문양이 기록되었습니다</span><i /><i /><i /></aside>
        {showRecommendations && <ResultRecommendations state={props.state} mbti={nbtiTypeCode(result.directions)} />}
      </div>
    </SceneFrame>
  )
}
