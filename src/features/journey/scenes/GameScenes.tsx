import { useMemo, useState, type CSSProperties } from 'react'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { getGameVariantForResult } from '../../../data/gameVariants.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { GAME_AXES, GAME_AXIS_ORDER, GAME_CONDITIONS, buildGameFromCombo, candidatesForCombo, defaultGameConditions, getGameCandidate, recommendComboSelection, type GameAxisId, type GameCandidate, type GameComboSelection, type GameConditions } from '../../../data/classroomGameBuilder'
import type { JourneyState } from '../journeyState'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'
import { CompletionExperience } from '../components/CompletionExperience'
import { CanonicalGameScene, CanonicalHotspot, CanonicalMobileHero, ScreenReaderText } from '../components/CanonicalGameScene'
import { isFlat } from '../../../config/visualMode'
import conditionsArt from '../../../assets/classcade/game-builder/classroom-conditions-master.webp'
import candidatesArt from '../../../assets/classcade/game-builder/game-candidates-master.webp'
import resultArt from '../../../assets/classcade/game-builder/game-result-master.webp'

const fallbackConditions: GameConditions = { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' }
const conditionLabels: Record<keyof GameConditions, string> = { schoolLevel: '학교급', size: '참여 인원', time: '수업 시간', space: '공간', mood: '원하는 분위기' }

/** Art vs flat is resolved per screen - see src/config/visualMode.ts. */

/** Recovery fallback if a saved candidateId cannot be decoded — reconstructs a sensible candidate from state. */
function buildFallbackCandidate(state: Pick<JourneyState, 'gameCombo' | 'gameConditions' | 'resultCode'>): GameCandidate {
  const conditions = state.gameConditions ?? fallbackConditions
  const combo = state.gameCombo ?? recommendComboSelection(getProvisionalResult(state.resultCode).directions, conditions)
  return buildGameFromCombo(combo, conditions)
}

export function GameConditionsScene(props: JourneySceneProps) {
  const [conditions, setConditions] = useState(props.state.gameConditions ?? (props.profile ? defaultGameConditions(props.profile) : fallbackConditions))
  if (!isFlat('gameConditions')) return <SceneFrame scene="game" canonicalGame {...props}>
    <CanonicalGameScene screen="conditions" art={conditionsArt}>
      <CanonicalMobileHero art={conditionsArt} screen="conditions" eyebrow="01 · 우리 반 조건" title="우리 반 교실의 모험 조건" description="교실 장면을 고르고, 우리 반에 맞는 게임을 준비해요." />
      {(Object.keys(GAME_CONDITIONS).filter((key) => key !== 'mood') as (keyof typeof GAME_CONDITIONS)[]).map((key) => <div className={`canonical-condition canonical-condition--${key}`} key={key} role="group" aria-label={conditionLabels[key]}>
        <b className="canonical-mobile-group-title">{conditionLabels[key]}</b>{GAME_CONDITIONS[key].map((option, index) => <CanonicalHotspot key={option.id} type="button" style={{ '--mobile-art': `url(${conditionsArt})`, '--mobile-index': `${index}` } as CSSProperties} selected={conditions[key] === option.id} onClick={() => setConditions({ ...conditions, [key]: option.id })} aria-pressed={conditions[key] === option.id}>
          <span className="canonical-mobile-label" aria-hidden="true">{option.label}</span><span className="canonical-mobile-choice-note" aria-hidden="true">{conditionLabels[key]} 선택</span><ScreenReaderText>{`${conditionLabels[key]}: ${option.label}`}</ScreenReaderText>
        </CanonicalHotspot>)}
      </div>)}
      <fieldset className="canonical-condition-mood"><legend>원하는 분위기</legend>{GAME_CONDITIONS.mood.map((option) => <CanonicalHotspot key={option.id} type="button" selected={conditions.mood === option.id} onClick={() => setConditions({ ...conditions, mood: option.id })} aria-pressed={conditions.mood === option.id}>{option.label}</CanonicalHotspot>)}</fieldset>
      <CanonicalHotspot className="canonical-next canonical-next--conditions" type="button" onClick={() => props.onAction({ type: 'SET_GAME_CONDITIONS', conditions })}><ScreenReaderText>콘셉트 카드 고르기</ScreenReaderText></CanonicalHotspot>
    </CanonicalGameScene>
  </SceneFrame>
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>01 · 우리 반 조건</p><Progress current={1} total={4} label="게임 만들기" /></div>
      <h1>우리 반 교실의 모험 조건</h1><p>교실 장면을 고르고, 우리 반에 맞는 게임을 준비해요.</p>
      <div className="journey-builder-groups">
        {(Object.keys(GAME_CONDITIONS) as (keyof typeof GAME_CONDITIONS)[]).map((key) => <div className="journey-builder-group" key={key} role="group" aria-label={conditionLabels[key]}>
          <b>{conditionLabels[key]}</b>
          <div className="journey-builder-options">
            {GAME_CONDITIONS[key].map((option) => <button key={option.id} type="button" className={`journey-choice ${conditions[key] === option.id ? 'is-selected' : ''}`} aria-pressed={conditions[key] === option.id} onClick={() => setConditions({ ...conditions, [key]: option.id })}>
              <b>{option.label}</b>
            </button>)}
          </div>
        </div>)}
      </div>
      <PrimaryButton onClick={() => props.onAction({ type: 'SET_GAME_CONDITIONS', conditions })}>콘셉트 카드 고르기</PrimaryButton>
    </div>
  </SceneFrame>
}

export function GameConceptsScene(props: JourneySceneProps) {
  const result = getProvisionalResult(props.state.resultCode)
  const conditions = props.state.gameConditions ?? fallbackConditions
  const recommended = useMemo(() => recommendComboSelection(result.directions, conditions), [result.directions, conditions])
  const [combo, setCombo] = useState<GameComboSelection>(props.state.gameCombo ?? recommended)
  const setAxis = (axis: GameAxisId, optionId: string) => setCombo((current) => ({ ...current, [axis]: optionId }))
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>02 · 모험 콘셉트 조합</p><Progress current={2} total={4} label="게임 만들기" /></div>
      <h1>우리 반의 모험을 조합해요</h1><p>네 가지 요소를 하나씩 골라 조합하면, 우리 반만의 특별한 모험이 완성돼요.</p>
      <div className="journey-builder-groups">
        {GAME_AXIS_ORDER.map((axis, axisIndex) => <div className="journey-builder-group" key={axis} role="group" aria-label={GAME_AXES[axis].label}>
          <b>{String(axisIndex + 1).padStart(2, '0')} {GAME_AXES[axis].label}<small style={{ display: 'block', fontWeight: 600, marginTop: '2px', opacity: .75 }}>{GAME_AXES[axis].helper}</small></b>
          <div className="journey-builder-options" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {GAME_AXES[axis].options.map((option) => <button key={option.id} type="button" className={`journey-choice ${combo[axis] === option.id ? 'is-selected' : ''}`} aria-pressed={combo[axis] === option.id} onClick={() => setAxis(axis, option.id)}>
              <b>{option.title}</b><small>{option.caption}</small>
            </button>)}
          </div>
        </div>)}
      </div>
      <PrimaryButton onClick={() => props.onAction({ type: 'SELECT_GAME_COMBO', combo })}>이 조합으로 후보 만들기</PrimaryButton>
    </div>
  </SceneFrame>
}

export function GameCandidatesScene(props: JourneySceneProps) {
  const conditions = props.state.gameConditions ?? fallbackConditions
  const combo = props.state.gameCombo ?? recommendComboSelection(getProvisionalResult(props.state.resultCode).directions, conditions)
  const candidates = candidatesForCombo(combo, conditions)
  const [selectedId, setSelectedId] = useState(candidates[0]?.id ?? '')
  const selected = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0]
  if (!isFlat('gameCandidates')) return <SceneFrame scene="game" canonicalGame {...props}>
    <CanonicalGameScene screen="candidates" art={candidatesArt}>
      <CanonicalMobileHero art={candidatesArt} screen="candidates" eyebrow="03 · 게임 후보" title="우리 반의 모험 후보" description="캐릭터와 도시 장면에서 실제 후보를 골라요." />
      <div className="canonical-candidate-list" role="list">{candidates.map((candidate, index) => <CanonicalHotspot className={`canonical-candidate canonical-candidate--${index + 1}`} key={candidate.id} type="button" style={{ '--canonical-art': `url(${candidatesArt})`, '--canonical-row': `${index}` } as CSSProperties} selected={selectedId === candidate.id} onClick={() => setSelectedId(candidate.id)} aria-pressed={selectedId === candidate.id}><span className="canonical-mobile-label" aria-hidden="true">{candidate.title}</span><span className="canonical-mobile-choice-note" aria-hidden="true">{candidate.people} · {candidate.duration} · {candidate.space}</span><span className="canonical-mobile-reason" aria-hidden="true">{candidate.fit}</span><ScreenReaderText>{`${candidate.title}. ${candidate.intro}`}</ScreenReaderText></CanonicalHotspot>)}</div>
      {selected && <section className="canonical-candidate-detail" aria-live="polite"><b>{selected.title}</b><span>{selected.people} · {selected.duration}</span><p>{selected.intro}</p></section>}
      <CanonicalHotspot className="canonical-next canonical-next--candidates" type="button" onClick={() => selected && props.onAction({ type: 'SELECT_GAME_CANDIDATE', candidateId: selected.id })}><ScreenReaderText>{selected ? `${selected.title} 이 후보로 결정하기` : '이 후보로 결정하기'}</ScreenReaderText></CanonicalHotspot>
    </CanonicalGameScene>
  </SceneFrame>
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>03 · 게임 후보</p><Progress current={3} total={4} label="게임 만들기" /></div>
      <h1>우리 반의 모험 후보</h1><p>우리 반 조건과 성향을 반영한 실제 후보 중 하나를 골라요.</p>
      <div className="journey-builder-cards" role="list">
        {candidates.map((candidate) => <button key={candidate.id} type="button" className={`journey-choice ${selectedId === candidate.id ? 'is-selected' : ''}`} aria-pressed={selectedId === candidate.id} onClick={() => setSelectedId(candidate.id)}>
          <b>{candidate.title}</b><small>{candidate.people} · {candidate.duration} · {candidate.space}</small><small>{candidate.fit}</small>
        </button>)}
      </div>
      {selected && <p className="journey-panel__fineprint" aria-live="polite">{selected.intro}</p>}
      <PrimaryButton onClick={() => selected && props.onAction({ type: 'SELECT_GAME_CANDIDATE', candidateId: selected.id })} disabled={!selected}>{selected ? `${selected.title} 이 후보로 결정하기` : '이 후보로 결정하기'}</PrimaryButton>
    </div>
  </SceneFrame>
}

const adjustmentFields = [['time', '게임 시간'], ['teams', '팀 구성'], ['competition', '경쟁 강도'], ['teacher', '교사 개입'], ['materials', '준비물 차이']] as const
export function GameAdjustScene(props: JourneySceneProps) {
  const candidate = getGameCandidate(props.state.selectedGameId, props.state.gameConditions) ?? buildFallbackCandidate(props.state)
  const adjustments = props.state.gameAdjustments
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>04 · 마지막 조정</p><Progress current={4} total={4} label="게임 만들기" /></div>
      <h1>{candidate.title}</h1><p>{candidate.intro}</p>
      <div className="journey-builder-adjustments">
        {adjustmentFields.map(([key, label]) => <label key={key}><b>{label}</b><select value={adjustments[key] ?? '기본'} onChange={(event) => props.onAction({ type: 'SET_GAME_ADJUSTMENT', key, value: event.target.value })}><option>기본</option><option>낮게</option><option>높게</option></select></label>)}
      </div>
      <PrimaryButton onClick={() => props.onAction({ type: 'COMPLETE_GAME_BUILDER' })}>우리 반 게임 완성하기</PrimaryButton>
    </div>
  </SceneFrame>
}

export function GameIntroScene(props: JourneySceneProps) {
  const result = getProvisionalResult(props.state.resultCode)
  return <SceneFrame scene="game" {...props}><div className="journey-game-intro journey-enter">
    <p className="journey-game-intro__badge"><Icon name="spark" size={16} />{result.title}에게 어울리는 우리 반 게임</p>
    <h1>우리 반 게임<br />만들기</h1><p>학급 조건과 성향을 함께 반영해, 바로 실행할 수 있는 게임을 완성해 보세요.</p>
    <div className="journey-game-intro__facts"><span><Icon name="gamepad" size={23} />조건 5가지</span><span><Icon name="clock" size={23} />4단계 선택</span><span><Icon name="spark" size={23} />실행 카드 완성</span></div>
    <PrimaryButton onClick={() => props.onAction({ type: 'START_GAME' })}>우리 반 게임 시작하기</PrimaryButton><SecondaryButton onClick={() => props.onAction({ type: 'OPEN_RESULT' })}>NBTI 결과 다시 보기</SecondaryButton>
  </div></SceneFrame>
}

export function GameChoiceScene(props: JourneySceneProps) {
  const variant = getGameVariantForResult(props.state.resultCode)
  const choice = variant.choices[props.state.gameStep]
  const selected = props.state.gameChoices[choice.id]
  return <SceneFrame scene="game" {...props} compact><div className="journey-panel journey-game-choice journey-enter"><div className="journey-panel__topline"><p>{variant.title}</p><Progress current={props.state.gameStep + 1} total={variant.choices.length} label="이전 게임 선택" /></div><h1>{choice.prompt}</h1><p>{choice.helper}</p><div className="journey-game-choice__options">{choice.options.map((option, index) => <button key={option.id} className={`journey-choice journey-choice--game ${selected === option.id ? 'is-selected' : ''}`} type="button" onClick={() => props.onAction({ type: 'ANSWER_GAME', choiceId: option.id })} aria-pressed={selected === option.id}><span className="journey-choice__number">0{index + 1}</span><b>{option.label}</b><small>{option.detail}</small></button>)}</div><PrimaryButton onClick={() => props.onAction({ type: 'NEXT_GAME' })} disabled={!selected}>다음 선택으로</PrimaryButton></div></SceneFrame>
}

export function ShakeScene(props: JourneySceneProps) {
  return <SceneFrame scene="game" {...props}><div className="journey-shake journey-enter"><div className="journey-shake__chest"><CompassSeal /></div><h1>보물 상자를 열어 볼까요?</h1><p>기기를 흔들 수 없는 환경에서도 아래 버튼으로 계속할 수 있어요.</p><Progress current={props.state.shakeProgress} total={100} label="열기 진행" /><PrimaryButton onClick={() => props.onAction({ type: 'ADD_SHAKE', amount: 25 })}>별빛 모으기</PrimaryButton></div></SceneFrame>
}

function conditionSummary(conditions: GameConditions | null) {
  if (!conditions) return ''
  return (Object.keys(GAME_CONDITIONS) as (keyof GameConditions)[]).map((key) => GAME_CONDITIONS[key].find((option) => option.id === conditions[key])?.label).filter(Boolean).join(' · ')
}

export function CompleteScene(props: JourneySceneProps) {
  const candidate = getGameCandidate(props.state.selectedGameId, props.state.gameConditions) ?? buildFallbackCandidate(props.state)
  const result = getProvisionalResult(props.state.resultCode)
  const adjustments = Object.entries(props.state.gameAdjustments).filter(([, value]) => value !== '기본').map(([key, value]) => `${adjustmentFields.find(([id]) => id === key)?.[1]} ${value}`)
  if (!isFlat('gameComplete')) return <SceneFrame scene="complete" canonicalGame {...props}><CanonicalGameScene screen="result" art={resultArt}>
    <CanonicalMobileHero art={resultArt} screen="result" eyebrow="우리 반 게임 완성" title={candidate.title} description={`${candidate.people} · ${candidate.duration} · ${candidate.space}`} />
    <section className="canonical-result-patch"><p>우리 반 게임</p><h1>{candidate.title}</h1><span>{candidate.people} · {candidate.duration}</span></section>
    <div className="canonical-result-actions"><SecondaryButton onClick={() => props.onAction({ type: 'OPEN_RESULT' })}>NBTI 결과 보기</SecondaryButton></div>
  </CanonicalGameScene><article className="canonical-result-book journey-game-complete">
    <p className="journey-kicker">완성된 게임 상세</p><h2>{candidate.title}</h2><p className="journey-complete__lead">{result.title}의 성향과 우리 반 조건을 반영한 실행 카드예요.</p>
    <div className="journey-game-complete__facts"><span>{candidate.people}</span><span>{candidate.duration}</span><span>{candidate.space}</span><span>{candidate.materials}</span></div>
    <section><h3>준비</h3><ul>{candidate.preparation.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section><h3>진행 순서</h3><ol>{candidate.steps.map((item) => <li key={item}>{item}</li>)}</ol></section>
    <section><h3>규칙과 운영</h3><p><b>규칙</b> {candidate.rules.join(' ')}</p><p><b>조용한 학생</b> {candidate.quiet}</p><p><b>의견 충돌</b> {candidate.conflict}</p><p><b>변형</b> {candidate.variation}</p><p><b>마무리</b> {candidate.closing}</p></section>
    <aside><b>NBTI 반영</b><p>{candidate.fit}</p><small>{conditionSummary(props.state.gameConditions)}{adjustments.length ? ` · ${adjustments.join(' · ')}` : ''}</small></aside>
    <CompletionExperience state={props.state} onAction={props.onAction} onNextParticipant={props.onNextParticipant} />
  </article></SceneFrame>
  return <SceneFrame scene="complete" {...props}>
    {/* Flat: no canonical hero image, so no risk of a real button drifting off whatever
        button-shaped area the master art happened to have drawn at a different aspect
        ratio - the "완성된 게임 상세" header below already shows title + full facts row,
        so nothing is lost by dropping the duplicate image-backed hero. */}
    <article className="canonical-result-book journey-game-complete">
      <p className="journey-kicker">완성된 게임 상세</p><h2>{candidate.title}</h2><p className="journey-complete__lead">{result.title}의 성향과 우리 반 조건을 반영한 실행 카드예요.</p>
      <SecondaryButton onClick={() => props.onAction({ type: 'OPEN_RESULT' })}>NBTI 결과 보기</SecondaryButton>
      <div className="journey-game-complete__facts"><span>{candidate.people}</span><span>{candidate.duration}</span><span>{candidate.space}</span><span>{candidate.materials}</span></div>
      <section><h3>준비</h3><ul>{candidate.preparation.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h3>진행 순서</h3><ol>{candidate.steps.map((item) => <li key={item}>{item}</li>)}</ol></section>
      <section><h3>규칙과 운영</h3><p><b>규칙</b> {candidate.rules.join(' ')}</p><p><b>조용한 학생</b> {candidate.quiet}</p><p><b>의견 충돌</b> {candidate.conflict}</p><p><b>변형</b> {candidate.variation}</p><p><b>마무리</b> {candidate.closing}</p></section>
      <aside><b>NBTI 반영</b><p>{candidate.fit}</p><small>{conditionSummary(props.state.gameConditions)}{adjustments.length ? ` · ${adjustments.join(' · ')}` : ''}</small></aside>
      <CompletionExperience state={props.state} onAction={props.onAction} onNextParticipant={props.onNextParticipant} />
    </article>
  </SceneFrame>
}

export function ShareScene(props: JourneySceneProps) {
  const candidate = getGameCandidate(props.state.selectedGameId, props.state.gameConditions) ?? buildFallbackCandidate(props.state)
  const result = getProvisionalResult(props.state.resultCode)
  const text = useMemo(() => `${result.title} · ${candidate.title}`, [candidate.title, result.title])
  return <SceneFrame scene="complete" {...props} compact><div className="journey-share journey-enter"><p className="journey-kicker">이전 완성 기록</p><h1>{candidate.title}</h1><p>{text}</p><SecondaryButton onClick={() => props.onAction({ type: 'CLOSE_SHARING' })}>완성 화면으로 돌아가기</SecondaryButton></div></SceneFrame>
}
