import { useMemo, useState } from 'react'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { getGameVariantForResult } from '../../../data/gameVariants.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { GAME_CANDIDATES, GAME_CONDITIONS, candidatesForConcept, defaultGameConditions, getGameCandidate, recommendConcepts, type GameConditions } from '../../../data/classroomGameBuilder'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'

const fallbackConditions: GameConditions = { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' }
const conditionLabels: Record<keyof GameConditions, string> = { schoolLevel: '학교급', size: '참여 인원', time: '수업 시간', space: '공간', mood: '원하는 분위기' }

export function GameConditionsScene(props: JourneySceneProps) {
  const [conditions, setConditions] = useState(props.state.gameConditions ?? (props.profile ? defaultGameConditions(props.profile) : fallbackConditions))
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>01 · 우리 반 조건</p><Progress current={1} total={4} label="게임 만들기" /></div>
      <h1>오늘의 교실은<br />어떤 모습인가요?</h1>
      <p>조건을 먼저 고르면, 우리 반에 맞는 4가지 게임 콘셉트를 추천해 드려요.</p>
      <div className="journey-builder-groups">
        {(Object.keys(GAME_CONDITIONS) as (keyof typeof GAME_CONDITIONS)[]).map((key) => <section className="journey-builder-group" key={key} aria-label={conditionLabels[key]}>
          <b>{conditionLabels[key]}</b><div className="journey-builder-options" role="group">
            {GAME_CONDITIONS[key].map((option) => <button className={`journey-choice journey-choice--game ${conditions[key] === option.id ? 'is-selected' : ''}`} key={option.id} type="button" onClick={() => setConditions({ ...conditions, [key]: option.id })} aria-pressed={conditions[key] === option.id}><b>{option.label}</b></button>)}
          </div>
        </section>)}
      </div>
      <PrimaryButton onClick={() => props.onAction({ type: 'SET_GAME_CONDITIONS', conditions })}>콘셉트 고르기</PrimaryButton>
    </div>
  </SceneFrame>
}

export function GameConceptsScene(props: JourneySceneProps) {
  const result = getProvisionalResult(props.state.resultCode)
  const concepts = recommendConcepts(result.directions, props.state.gameConditions ?? fallbackConditions)
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>02 · 모험 콘셉트</p><Progress current={2} total={4} label="게임 만들기" /></div>
      <h1>우리 반의 첫 장면을<br />골라 주세요</h1>
      <div className="journey-builder-cards" role="list">
        {concepts.map((concept, index) => <button className="journey-choice journey-choice--game" key={concept.id} type="button" onClick={() => props.onAction({ type: 'SELECT_GAME_CONCEPT', concept: concept.id })} role="listitem">
          <span className="journey-choice__number">0{index + 1}</span><b>{concept.title}</b><small>{concept.detail}</small><em>{concept.direction === result.directions[2] || concept.direction === result.directions[3] ? '성향 추천' : '다른 모험'}</em>
        </button>)}
      </div>
    </div>
  </SceneFrame>
}

export function GameCandidatesScene(props: JourneySceneProps) {
  const candidates = candidatesForConcept(props.state.gameConcept ?? 'team')
  return <SceneFrame scene="game" {...props}>
    <div className="journey-panel journey-game-builder journey-enter">
      <div className="journey-panel__topline"><p>03 · 게임 후보 4개</p><Progress current={3} total={4} label="게임 만들기" /></div>
      <h1>우리 반에 맞는 게임을<br />골라 주세요</h1>
      <p>첫 후보는 방금 고른 콘셉트에 맞춘 추천이에요.</p>
      <div className="journey-builder-cards" role="list">
        {candidates.map((candidate, index) => <button className="journey-choice journey-choice--game" key={candidate.id} type="button" onClick={() => props.onAction({ type: 'SELECT_GAME_CANDIDATE', candidateId: candidate.id })} role="listitem">
          <span className="journey-choice__number">0{index + 1}</span><b>{candidate.title}</b><small>{candidate.intro} · {candidate.people} · {candidate.duration}</small>{index === 0 && <em>추천</em>}
        </button>)}
      </div>
    </div>
  </SceneFrame>
}

const adjustmentFields = [['time', '게임 시간'], ['teams', '팀 구성'], ['competition', '경쟁 강도'], ['teacher', '교사 개입'], ['materials', '준비물 차이']] as const
export function GameAdjustScene(props: JourneySceneProps) {
  const candidate = getGameCandidate(props.state.selectedGameId) ?? GAME_CANDIDATES[0]
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
  const candidate = getGameCandidate(props.state.selectedGameId) ?? GAME_CANDIDATES[0]
  const result = getProvisionalResult(props.state.resultCode)
  const adjustments = Object.entries(props.state.gameAdjustments).filter(([, value]) => value !== '기본').map(([key, value]) => `${adjustmentFields.find(([id]) => id === key)?.[1]} ${value}`)
  return <SceneFrame scene="complete" {...props}><div className="journey-panel journey-game-complete journey-enter">
    <p className="journey-kicker">우리 반 게임 완성</p><h1>{candidate.title}</h1><p className="journey-complete__lead">{result.title}의 성향과 우리 반 조건을 반영한 실행 카드예요.</p>
    <div className="journey-game-complete__facts"><span>{candidate.people}</span><span>{candidate.duration}</span><span>{candidate.space}</span><span>{candidate.materials}</span></div>
    <section><h2>준비</h2><ul>{candidate.preparation.map((item) => <li key={item}>{item}</li>)}</ul></section>
    <section><h2>진행 순서</h2><ol>{candidate.steps.map((item) => <li key={item}>{item}</li>)}</ol></section>
    <section><h2>규칙과 운영</h2><p><b>규칙</b> {candidate.rules.join(' ')}</p><p><b>조용한 학생</b> {candidate.quiet}</p><p><b>의견 충돌</b> {candidate.conflict}</p><p><b>변형</b> {candidate.variation}</p><p><b>마무리</b> {candidate.closing}</p></section>
    <aside><b>NBTI 반영</b><p>{candidate.fit}</p><small>{conditionSummary(props.state.gameConditions)}{adjustments.length ? ` · ${adjustments.join(' · ')}` : ''}</small></aside>
    <SecondaryButton onClick={() => props.onAction({ type: 'OPEN_RESULT' })}>NBTI 결과 보기</SecondaryButton>
  </div></SceneFrame>
}

export function ShareScene(props: JourneySceneProps) {
  const candidate = getGameCandidate(props.state.selectedGameId) ?? GAME_CANDIDATES[0]
  const result = getProvisionalResult(props.state.resultCode)
  const text = useMemo(() => `${result.title} · ${candidate.title}`, [candidate.title, result.title])
  return <SceneFrame scene="complete" {...props} compact><div className="journey-share journey-enter"><p className="journey-kicker">이전 완성 기록</p><h1>{candidate.title}</h1><p>{text}</p><SecondaryButton onClick={() => props.onAction({ type: 'CLOSE_SHARING' })}>완성 화면으로 돌아가기</SecondaryButton></div></SceneFrame>
}
