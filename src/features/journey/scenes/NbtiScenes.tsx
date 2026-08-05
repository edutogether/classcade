import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { NBTI_AXES, NBTI_QUESTIONS, NBTI_TOTAL_QUESTIONS, type NbtiDirection } from '../../../data/nbti.provisional'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import { JOURNEY_SCENE_ASSETS } from '../../../data/sceneAssets'
import { PrimaryButton, Progress, SceneFrame, SecondaryButton, type JourneySceneProps } from '../components/SceneFrame'

const journeyItems = [{ icon: 'clock' as const, title: '약 2분', detail: '교실 장면 16개' }, { icon: 'spark' as const, title: '정답 없음', detail: '중립 선택 없음' }, { icon: 'gamepad' as const, title: '우리 반 놀이', detail: '결과로 이어져요' }]
const directionLabels: Record<NbtiDirection, string> = { design: '설계', response: '반응', whole: '전체', individual: '개별', criteria: '기준', empathy: '공감', completion: '완성', expansion: '확장' }

export function StartScene(props: JourneySceneProps) {
  return (
    <SceneFrame scene="start" {...props}>
      <div className="journey-start__copy journey-enter">
        <p className="journey-kicker"><span>✦</span> NBTI ADVENTURE <span>✦</span></p>
        <h1 data-tune-id="main-title"><span>교실 속 나를 발견하다.</span><span><em>놀이로</em> 확장하다.</span></h1>
        <p className="journey-start__description" data-tune-id="main-description">16개의 교실 장면에서 발견한 성향이, 우리 반 놀이의 시작점이 됩니다.</p>
        <p className="journey-start__guide">평소의 성격이 아니라, 학생들 앞에 선 순간의 나를 떠올려 주세요.<br />두 선택 모두 좋은 교사의 방식입니다. 완전히 같지 않아도 교실에서 조금 더 자주 하는 쪽을 골라 주세요.</p>
        <div className="journey-start__sparkles" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div>
        <ul className="journey-start__cards" aria-label="여정 정보">
          {journeyItems.map((item) => <li key={item.title}><Icon name={item.icon} size={25} /><span><b>{item.title}</b><small>{item.detail}</small></span></li>)}
        </ul>
        <div className="journey-start__actions">
          <PrimaryButton onClick={() => props.onAction({ type: 'START_NBTI' })} tuneId="main-primary-cta">16개의 교실 장면 시작하기</PrimaryButton>
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
        <div className="journey-panel__topline"><p>{`장면 ${question.scene}`}</p><Progress current={props.state.questionIndex + 1} total={NBTI_TOTAL_QUESTIONS} label="진행률" /></div>
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

export function ResultScene(props: JourneySceneProps & { onPair: () => void }) {
  const result = getProvisionalResult(props.state.resultCode)
  return (
    <SceneFrame scene="result" {...props}>
      <div className={`journey-result journey-result--${result.palette} journey-enter`}>
        <div className="journey-result__copy"><p className="journey-kicker">✦ 나의 교실 플레이 결과 ✦</p><p className="journey-result__eyebrow">나의 교실 플레이 유형은</p><h1>{result.title}</h1><p className="journey-result__description">{result.description}</p><div className="journey-result__directions" aria-label="나의 네 성향">{NBTI_AXES.map((axis, index) => <span key={axis.id}><small>{axis.label}</small><b>{directionLabels[result.directions[index]]}</b></span>)}</div><div className="journey-result__strengths">{result.strengths.map((strength) => <span key={strength}><Icon name="spark" size={16} />{strength}</span>)}</div><p className="journey-result__caution"><b>다음 장면</b>{result.caution}</p><p className="journey-result__next">교실 속 나를 발견하다. 놀이로 확장하다.</p><p className="journey-result__disclaimer">이 결과는 선생님의 모든 모습을 규정하지 않아요. 오늘의 교실 장면에서 가장 자주 드러난 선택을 보여 줍니다.</p><PrimaryButton onClick={props.onPair}>노트북에서 우리 반 게임 만들기</PrimaryButton><SecondaryButton onClick={() => props.onAction({ type: 'OPEN_GAME_INTRO' })}>이 기기에서 계속하기</SecondaryButton><SecondaryButton onClick={() => props.onAction({ type: 'RESET_NBTI' })}><Icon name="reset" size={19} />다시 탐색하기</SecondaryButton></div>
        <aside className="journey-result__reveal" aria-label="결과 해금 연출"><CompassSeal /><p>{result.subtitle}</p><span>빛나는 문양이 기록되었습니다</span><i /><i /><i /></aside>
      </div>
    </SceneFrame>
  )
}
