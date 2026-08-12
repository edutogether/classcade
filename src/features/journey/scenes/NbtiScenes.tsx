import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { prepNavBack, prepNavCtaEnabled, prepNavCtaDisabled, loadingMaster, resultCtaEnabled, resultCtaDisabled } from '../../../components/prep/prepAssets'
import profileAvatar from '../../../assets/brand/profile-avatar-front.png'
import { ClasscadeEmblem, ClasscadeLockup, Icon, type IconName } from '../../../components/VisualPrimitives'
import { NBTI_AXES, NBTI_QUESTIONS, NBTI_TOTAL_QUESTIONS, type NbtiAxis, type NbtiDirection } from '../../../data/nbti.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { nbtiResultArt } from '../../../data/nbtiResultArt'
import { ResultRecommendations } from '../components/ResultRecommendations'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'

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
function DirectionIcon({ direction, size = 26 }: { direction: NbtiDirection; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{directionIconPaths[direction]}</svg>
}

/** Tallies weighted votes for the axis's two answered-so-far choices; returns the current leader, or null until at least one of the axis's questions has been answered. */
function axisLeaning(axis: NbtiAxis, answers: Record<string, string>): NbtiDirection | null {
  const axisDef = NBTI_AXES.find((entry) => entry.id === axis)
  if (!axisDef) return null
  let scoreA = 0, scoreB = 0
  for (const question of NBTI_QUESTIONS) {
    if (question.axis !== axis) continue
    const choiceId = answers[question.id]
    if (!choiceId) continue
    const choice = question.choices.find((entry) => entry.id === choiceId)
    if (!choice) continue
    if (choice.direction === 0) scoreA += question.weight; else scoreB += question.weight
  }
  if (scoreA === scoreB) return null
  return scoreA > scoreB ? axisDef.directions[0] : axisDef.directions[1]
}

const SKILLS: readonly { icon: IconName; name: string }[] = [
  { icon: 'sprout', name: '새싹 감각' },
  { icon: 'lantern', name: '마음 등불' },
  { icon: 'compass', name: '방향 감각' },
  { icon: 'tree', name: '든든한 뿌리' },
]
const ITEMS: readonly { icon: IconName | null; name: string }[] = [
  { icon: 'notebook', name: '모험 노트' },
  { icon: 'compass', name: '나침반' },
  { icon: null, name: '빈 슬롯' },
  { icon: null, name: '빈 슬롯' },
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
            return <span key={axis.id} className={leaning ? 'is-revealed' : ''}>{leaning ? directionLabels[leaning] : '?'}</span>
          })}
        </div>
      </div>
      <div className="journey-question__sidebar-block">
        <p>보유 스킬 <small>(잠금 해제 예정)</small></p>
        <div className="journey-question__sidebar-slots journey-question__sidebar-slots--labeled">
          {SKILLS.map((skill, index) => (
            <figure key={skill.name}>
              <span className={index < unlockedSkills ? 'is-unlocked' : ''}><Icon name={index < unlockedSkills ? skill.icon : 'lock'} size={18} /></span>
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
              {item.icon ? <span className="is-unlocked"><Icon name={item.icon} size={18} /></span> : <span aria-hidden="true">+</span>}
              <figcaption>{item.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function StartScene(props: JourneySceneProps) {
  return (
    <SceneFrame scene="start" {...props}>
      {/* v4 art carries no UI text on the left, so the copy is live DOM again, matching the
          reference lockup: kicker, headline with the gold word, sub-copy, fact chips,
          stacked buttons, headphone note. The quest board is painted into the art. */}
      <div className="journey-start__copy journey-enter">
        <p className="journey-kicker"><span>✦</span> NBTI ADVENTURE <span>✦</span></p>
        <h1 data-tune-id="main-title"><span>당신의 교실 플레이</span><span><em>모험이</em> 시작됩니다</span></h1>
        <p className="journey-start__description" data-tune-id="main-description">여러분의 선택으로 나의 교실 유형을 발견하고,<br />선생님 캐릭터를 성장시켜 보세요.</p>
        <ul className="journey-start__cards" aria-label="여정 정보">
          {journeyItems.map((item) => <li key={item.title}><Icon name={item.icon} size={25} /><span><b>{item.title}</b><small>{item.detail}</small></span></li>)}
        </ul>
        <div className="journey-start__actions">
          <PrimaryButton onClick={() => props.onAction({ type: 'START_NBTI' })} tuneId="main-primary-cta">교실 NBTI 시작하기</PrimaryButton>
          {props.state.resumeStage ? <SecondaryButton onClick={() => props.onAction({ type: 'RESUME_JOURNEY' })} tuneId="main-resume-cta"><Icon name="reset" size={20} />이전 여정 이어가기</SecondaryButton> : <SecondaryButton onClick={() => props.onAction({ type: 'RESET_NBTI' })} tuneId="main-resume-cta"><Icon name="reset" size={20} />새로 시작하기</SecondaryButton>}
        </div>
        <p className="journey-start__audio-note" data-tune-id="main-headphone-note"><Icon name="speaker" size={17} />헤드폰을 착용하면 BGM과 효과음이 더욱 몰입감을 높여줘요.</p>
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
  const onActionRef = props.onAction
  useEffect(() => {
    if (!revealing) return
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const percent = Math.min(100, Math.round((Date.now() - startedAt) / 26))
      setRevealProgress(percent)
      if (percent >= 100) { window.clearInterval(timer); onActionRef({ type: 'NEXT_NBTI' }) }
    }, 80)
    return () => window.clearInterval(timer)
  }, [revealing, onActionRef])
  if (revealing) {
    return (
      <main className="entry-loading entry-loading--art" aria-live="polite">
        <div className="entry-loading__stage">
          <img className="entry-loading__art" src={loadingMaster} alt="" aria-hidden="true" />
          <i className="entry-loading__fill" style={{ '--progress': `${revealProgress}%` } as CSSProperties} aria-hidden="true" />
        </div>
        <p className="sr-only" role="status">나의 플레이 결과를 여는 중 {revealProgress}%</p>
      </main>
    )
  }
  return (
    <SceneFrame scene="question" {...props} compact>
      {/* Two separate boards with an open gap between them, so the backdrop's centre —
          where the painting's subject sits — stays visible instead of being covered by
          one full-width panel. */}
      <div className="journey-question-split journey-enter">
        <div className="journey-panel journey-question">
          <div className="journey-panel__topline"><p>{`장면 ${question.scene}`}</p><Progress current={props.state.questionIndex + 1} total={NBTI_TOTAL_QUESTIONS} label="진행률" /></div>
          <div className="journey-question__body">
            <div className="journey-question__copy"><p className="journey-kicker">{question.chapter}</p><h1>{question.prompt}</h1><p>{question.helper}</p><div className="journey-question__growth" aria-label={`캐릭터 성장 ${growth}%`}><ClasscadeEmblem /><span>성장</span><div className="journey-question__growth-track" aria-hidden="true"><i style={{ width: `${growth}%` }} /></div><b>{growth}%</b></div></div>
            <p className="journey-panel__fineprint journey-panel__fineprint--above">이 탐색은 체험용 교실 플레이 안내이며, 과학적 성격 진단이 아닙니다.</p>
            <div className="journey-question__choices" role="group" aria-label={question.prompt}>
              {question.choices.map((choice, index) => (
                <button className={`journey-choice ${selected === choice.id ? 'is-selected' : ''}`} type="button" key={choice.id} onClick={() => props.onAction({ type: 'ANSWER_NBTI', questionId: question.id, choiceId: choice.id })} aria-pressed={selected === choice.id}>
                  <span className="journey-choice__number">0{index + 1}</span><b>{choice.label}</b><small>{choice.detail}</small><i aria-hidden="true"><DirectionIcon direction={axisDirections[choice.direction]} size={29} /></i>
                </button>
              ))}
            </div>
          </div>
          <div className="journey-panel__footer">
            <JourneyNavArt art={prepNavBack} label="← 이전 질문" onClick={() => props.onAction({ type: 'PREVIOUS_NBTI' })} variant="back" />
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

export function ResultScene(props: JourneySceneProps & { onPair: () => void }) {
  const result = getProvisionalResult(props.state.resultCode)
  const typeArt = nbtiResultArt(nbtiTypeCode(result.directions))
  /* A QR visitor arrived *for* the recommendations, so open the panel immediately rather
     than making them find the button on a phone. */
  const [showRecommendations, setShowRecommendations] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('type'))
  return (
    <SceneFrame scene="result" {...props} artSrc={typeArt}>
      <div className={`journey-result journey-result--${result.palette} ${typeArt ? 'journey-result--art' : ''} ${showRecommendations ? 'has-recommendations' : ''} journey-enter`}>
        <div className="journey-result__copy"><p className="journey-kicker">✦ 나의 교실 플레이 결과 ✦</p><p className="journey-result__eyebrow">나의 교실 플레이 유형은</p><h1>{result.title}</h1><div className="journey-result__badges"><span className="journey-result__code">{nbtiTypeCode(result.directions)}</span><div className="journey-result__strengths">{result.strengths.map((strength) => <span key={strength}>{strengthEmoji(strength)} {strength}</span>)}</div></div><p className="journey-result__description">{result.description}</p><div className="journey-result__directions" aria-label="나의 네 성향">{NBTI_AXES.map((axis, index) => <span key={axis.id}><small>{axis.label}</small><b>{directionEmoji[result.directions[index]]} {directionLabels[result.directions[index]]}</b></span>)}</div><p className="journey-result__caution"><b>다음 장면</b>{result.caution}</p><p className="journey-result__next">교실 속 나를 발견하다. 놀이로 확장하다.</p><p className="journey-result__disclaimer">이 결과는 선생님의 모든 모습을 규정하지 않아요. 오늘의 교실 장면에서 가장 자주 드러난 선택을 보여 줍니다.</p><div className="journey-result__actions"><PrimaryButton onClick={() => setShowRecommendations(true)}>추천받기</PrimaryButton><SecondaryButton onClick={() => props.onAction({ type: 'RESET_NBTI' })}><Icon name="reset" size={19} />다시 탐색하기</SecondaryButton></div></div>
        <aside className="journey-result__reveal" aria-label="결과 해금 연출"><ClasscadeLockup /><p>{result.subtitle}</p><span>빛나는 문양이 기록되었습니다</span><i /><i /><i /></aside>
        {showRecommendations && <ResultRecommendations state={props.state} mbti={nbtiTypeCode(result.directions)} />}
      </div>
    </SceneFrame>
  )
}
