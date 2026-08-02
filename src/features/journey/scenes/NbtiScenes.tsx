import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { NBTI_QUESTIONS, NBTI_TOTAL_QUESTIONS } from '../../../data/nbti.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { JOURNEY_SCENE_ASSETS } from '../../../data/sceneAssets'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'

const journeyItems = [
  { icon: 'clock' as const, title: '약 1분', detail: '간단한 여정' },
  { icon: 'spark' as const, title: '캐릭터 성장', detail: '선택이 힘이 돼요' },
  { icon: 'gamepad' as const, title: '우리 반 게임', detail: '까지 연결돼요' },
]

export function StartScene(props: JourneySceneProps) {
  return (
    <SceneFrame scene="start" {...props}>
      <div className="journey-start__copy journey-enter">
        <p className="journey-kicker"><span>✦</span> NBTI ADVENTURE <span>✦</span></p>
        <h1 data-tune-id="main-title"><span>당신의</span><span>교실 플레이 <em>모험이</em></span><span>시작됩니다</span></h1>
        <p className="journey-start__description" data-tune-id="main-description">여러분의 선택으로 나의 교실 유형을 발견하고, 선생님 캐릭터를 성장시켜 보세요.</p>
        <div className="journey-start__sparkles" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        <ul className="journey-start__cards" aria-label="여정 정보">
          {journeyItems.map((item) => <li key={item.title}><Icon name={item.icon} size={25} /><span><b>{item.title}</b><small>{item.detail}</small></span></li>)}
        </ul>
        <div className="journey-start__actions">
          <PrimaryButton onClick={() => props.onAction({ type: 'START_NBTI' })} tuneId="main-primary-cta">교실 NBTI 시작하기</PrimaryButton>
          <SecondaryButton onClick={() => props.onAction({ type: 'RESET_NBTI' })} tuneId="main-resume-cta"><Icon name="reset" size={20} />이전 여정 이어가기</SecondaryButton>
        </div>
        <p className="journey-start__audio-note" data-tune-id="main-headphone-note"><Icon name="speaker" size={17} />헤드폰을 착용하면 BGM과 효과음이 더욱 몰입감을 높여줘요.</p>
      </div>
      {JOURNEY_SCENE_ASSETS.start.showQuestBoard && <aside className="journey-start__quest-board" aria-hidden="true">
        <b>✦ 오늘의 모험 안내 ✦</b>
        <span><Icon name="notebook" size={16} />나의 교실 유형 찾기</span>
        <span><Icon name="spark" size={16} />캐릭터 성장</span>
        <span><Icon name="gamepad" size={16} />학급 게임 연결</span>
      </aside>}
    </SceneFrame>
  )
}

export function QuestionScene(props: JourneySceneProps) {
  const question = NBTI_QUESTIONS[props.state.questionIndex]
  const selected = props.state.answers[question.id]
  const last = props.state.questionIndex === NBTI_TOTAL_QUESTIONS - 1
  const growth = Math.round(((props.state.questionIndex + (selected ? 1 : 0)) / NBTI_TOTAL_QUESTIONS) * 100)
  return (
    <SceneFrame scene="question" {...props} compact>
      <div className="journey-panel journey-question journey-enter">
        <div className="journey-panel__topline"><p>{`질문 ${props.state.questionIndex + 1}`}</p><Progress current={props.state.questionIndex + 1} total={NBTI_TOTAL_QUESTIONS} label="진행률" /></div>
        <div className="journey-question__body">
          <div className="journey-question__copy"><p className="journey-kicker">{question.chapter}</p><h1>{question.prompt}</h1><p>{question.helper}</p><div className="journey-question__growth" aria-label={`캐릭터 성장 ${growth}%`}><CompassSeal /><span>성장</span><div className="journey-question__growth-track" aria-hidden="true"><i style={{ width: `${growth}%` }} /></div><b>{growth}%</b></div></div>
          <div className="journey-question__choices" role="group" aria-label={question.prompt}>
            {question.choices.map((choice, index) => (
              <button className={`journey-choice ${selected === choice.id ? 'is-selected' : ''}`} type="button" key={choice.id} onClick={() => props.onAction({ type: 'ANSWER_NBTI', questionId: question.id, choiceId: choice.id })} aria-pressed={selected === choice.id}>
                <span className="journey-choice__number">0{index + 1}</span><b>{choice.label}</b><small>{choice.detail}</small><i aria-hidden="true"><Icon name={index ? 'spark' : 'notebook'} size={29} /></i>
              </button>
            ))}
          </div>
        </div>
        <div className="journey-panel__footer">
          <SecondaryButton onClick={() => props.onAction({ type: 'PREVIOUS_NBTI' })} className="journey-button--back"><span aria-hidden="true">←</span> 이전 질문</SecondaryButton>
          <PrimaryButton onClick={() => props.onAction({ type: 'NEXT_NBTI' })} disabled={!selected}>{last ? '나의 플레이 결과 보기' : '다음 질문으로'}</PrimaryButton>
        </div>
        <p className="journey-panel__fineprint">이 탐색은 체험용 교실 플레이 안내이며, 과학적 성격 진단이 아닙니다.</p>
      </div>
    </SceneFrame>
  )
}

export function ResultScene(props: JourneySceneProps) {
  const result = getProvisionalResult(props.state.resultCode)
  return (
    <SceneFrame scene="result" {...props}>
      <div className={`journey-result journey-result--${result.palette} journey-enter`}>
        <div className="journey-result__copy"><p className="journey-kicker">✦ 나의 교실 플레이 결과 ✦</p><p className="journey-result__eyebrow">나의 교실 플레이 타입</p><h1>{result.title}</h1><p className="journey-result__description">{result.description}</p><div className="journey-result__strengths">{result.strengths.map((strength) => <span key={strength}><Icon name="spark" size={16} />{strength}</span>)}</div><p className="journey-result__disclaimer">공식 진단이 아닌 체험용 탐색 결과입니다.</p><PrimaryButton onClick={() => props.onAction({ type: 'OPEN_GAME_INTRO' })}>나의 다음 게임 열기</PrimaryButton><SecondaryButton onClick={() => props.onAction({ type: 'RESET_NBTI' })}><Icon name="reset" size={19} />다시 탐색하기</SecondaryButton></div>
        <aside className="journey-result__reveal" aria-label="결과 해금 연출"><CompassSeal /><p>{result.subtitle}</p><span>빛나는 문양이 기록되었습니다</span><i /><i /><i /></aside>
      </div>
    </SceneFrame>
  )
}
