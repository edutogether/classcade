export type NbtiAxis = 'flow' | 'participation' | 'judgment' | 'learning'
export type NbtiDirection = 'design' | 'response' | 'whole' | 'individual' | 'criteria' | 'empathy' | 'completion' | 'expansion'

export type NbtiAxisDefinition = { id: NbtiAxis; label: string; directions: readonly [NbtiDirection, NbtiDirection] }
export type NbtiChoice = { id: string; label: string; detail: string; direction: 0 | 1 }
export type NbtiQuestion = { id: string; scene: number; chapter: string; prompt: string; helper: string; axis: NbtiAxis; weight: 1 | 2 | 3; choices: readonly [NbtiChoice, NbtiChoice] }

export const NBTI_AXES = [
  { id: 'flow', label: '흐름을 만드는 방식', directions: ['design', 'response'] },
  { id: 'participation', label: '참여를 바라보는 방식', directions: ['whole', 'individual'] },
  { id: 'judgment', label: '판단을 세우는 방식', directions: ['criteria', 'empathy'] },
  { id: 'learning', label: '배움을 이어가는 방식', directions: ['completion', 'expansion'] },
] as const satisfies readonly NbtiAxisDefinition[]

const q = (id: string, scene: number, chapter: string, prompt: string, axis: NbtiAxis, weight: 1 | 2 | 3, left: readonly [string, string], right: readonly [string, string]): NbtiQuestion => ({ id, scene, chapter, prompt, helper: '두 선택 모두 좋은 교사의 방식입니다. 교실에서 조금 더 자주 하는 쪽을 골라 주세요.', axis, weight, choices: [{ id: `${id}-a`, label: left[0], detail: left[1], direction: 0 }, { id: `${id}-b`, label: right[0], detail: right[1], direction: 1 }] })

export const NBTI_QUESTIONS = [
  q('unit-opening', 1, '첫 수업의 문', '새로운 단원을 시작하는 첫 시간, 학생들이 무엇을 해야 할지 기다리고 있다면 나는 어떻게 시작할까요?', 'flow', 3, ['오늘의 목표와 활동 순서를 짧고 분명하게 안내한 뒤 시작한다.', '설계'], ['학생들이 이미 알고 있거나 궁금해하는 것을 먼저 물으며 시작점을 함께 찾는다.', '반응']),
  q('quiet-student', 2, '참여의 불빛', '모둠 활동이 시작됐지만 한 학생만 말없이 친구들을 바라보고 있다면 나는 어떻게 할까요?', 'participation', 1, ['모둠 전체가 자연스럽게 역할을 나누도록 공통 진행 방식을 다시 안내한다.', '전체'], ['그 학생이 편하게 시작할 수 있는 작은 역할이나 참여 방법을 따로 제안한다.', '개별']),
  q('opinion-conflict', 3, '갈림길의 대화', '학생 둘의 의견 충돌로 수업 흐름이 잠시 멈췄다면 나는 무엇을 먼저 할까요?', 'judgment', 3, ['서로 지켜야 할 기준과 해결할 쟁점을 분명히 정리한다.', '기준'], ['각자 왜 그렇게 느꼈는지 차분히 듣고 관계의 맥락부터 살핀다.', '공감']),
  q('early-finish', 4, '남은 시간의 선택', '학생들이 과제를 예상보다 일찍 완성해 시간이 남았다면 나는 어떻게 이어갈까요?', 'learning', 1, ['결과를 점검하고 오늘 배운 내용을 분명하게 정리하며 마무리한다.', '완성'], ['학생들이 발견한 질문이나 새로운 가능성을 골라 한 단계 더 탐색한다.', '확장']),
  q('material-failure', 5, '뜻밖의 변수', '준비한 수업 자료가 갑자기 작동하지 않는다면 나는 어떻게 대응할까요?', 'flow', 2, ['준비해 둔 대체 자료나 활동으로 빠르게 전환해 수업 흐름을 유지한다.', '설계'], ['현재 교실에 있는 자료와 학생들의 아이디어를 활용해 새로운 방식으로 바꾼다.', '반응']),
  q('few-speakers', 6, '모두의 목소리', '발표를 좋아하는 몇 명만 계속 손을 들고 다른 학생들은 조용하다면 나는 어떻게 할까요?', 'participation', 3, ['모두가 한 번씩 참여할 수 있는 공통 순서나 방식을 새로 정한다.', '전체'], ['발표가 어려운 학생도 참여할 수 있도록 짝 대화나 짧은 기록 기회를 마련한다.', '개별']),
  q('repeated-rule', 7, '약속의 이유', '한 학생이 정해진 규칙을 반복해서 지키지 않는다면 나는 무엇을 먼저 확인할까요?', 'judgment', 1, ['규칙의 이유와 지켜야 할 선을 다시 분명히 안내한다.', '기준'], ['그 행동이 반복되는 이유와 학생이 겪는 어려움을 먼저 살펴본다.', '공감']),
  q('interesting-solution', 8, '다른 풀이', '학생들이 정답과는 다르지만 흥미로운 방식으로 문제를 해결했다면 나는 어떻게 할까요?', 'learning', 2, ['그 방식의 장점을 인정한 뒤 목표와 기준에 맞게 결과를 정리한다.', '완성'], ['왜 그런 방식이 나왔는지 함께 탐색하며 새로운 해결 가능성을 넓힌다.', '확장']),
  q('unexpected-question', 9, '예상 밖의 질문', '수업 중 학생의 예상 밖 질문이 지금 계획보다 더 흥미롭게 느껴진다면 나는 어떻게 할까요?', 'flow', 1, ['질문을 기록해 두고 현재 목표를 마친 뒤 충분히 다룬다.', '설계'], ['현재 수업과 연결되는 지점을 찾아 흐름을 잠시 바꾸어 함께 살펴본다.', '반응']),
  q('group-pace', 10, '다른 속도', '모둠마다 활동 속도와 완성도가 크게 달라지고 있다면 나는 어떻게 조율할까요?', 'participation', 2, ['공통 중간 목표를 제시해 모든 모둠이 같은 흐름으로 다시 만나게 한다.', '전체'], ['각 모둠의 속도와 필요에 맞게 역할이나 도움의 수준을 다르게 조정한다.', '개별']),
  q('awkward-room', 11, '어색해진 공기', '수업 중 한 학생의 말로 교실 분위기가 갑자기 어색해졌다면 나는 어떻게 할까요?', 'judgment', 2, ['문제가 된 표현과 지켜야 할 소통 기준을 분명히 짚는다.', '기준'], ['상처받거나 당황한 학생들의 감정을 먼저 안정시키고 대화를 이어간다.', '공감']),
  q('curious-ending', 12, '남은 질문', '수업 목표는 달성했지만 학생들이 더 알고 싶다는 질문을 계속 꺼낸다면 나는 어떻게 마무리할까요?', 'learning', 3, ['오늘의 핵심을 명확하게 정리하고 다음 시간에 이어갈 질문을 남긴다.', '완성'], ['가장 흥미로운 질문 하나를 골라 지금 가능한 만큼 함께 더 탐색한다.', '확장']),
  q('student-proposal', 13, '새로운 흐름', '계획한 활동보다 학생들이 제안한 다른 방식에 교실 전체가 더 몰입한다면 나는 어떻게 할까요?', 'flow', 1, ['좋은 아이디어로 기록하되 오늘의 목표에 맞춰 원래 활동을 안정적으로 이어간다.', '설계'], ['오늘의 목표를 해치지 않는 범위에서 학생들의 방식을 수업 흐름에 반영한다.', '반응']),
  q('class-ahead', 14, '함께 가는 속도', '학급 전체는 빠르게 다음 단계로 가고 싶어 하지만 몇 명은 아직 이해하지 못했다면 나는 어떻게 할까요?', 'participation', 1, ['전체 흐름을 유지하면서 짧은 확인 단계와 추가 도움의 기회를 함께 마련한다.', '전체'], ['이해가 필요한 학생들의 상태를 먼저 확인하고 충분히 따라올 시간을 확보한다.', '개별']),
  q('effort-feedback', 15, '성장의 피드백', '학생이 결과는 부족하지만 과정에서 큰 노력과 변화를 보여 주었다면 나는 어떻게 피드백할까요?', 'judgment', 1, ['잘한 과정은 인정하면서도 다음에 도달해야 할 기준을 구체적으로 알려 준다.', '기준'], ['노력과 변화가 어떤 의미였는지 충분히 인정하고 자신감을 이어 주는 말을 먼저 건넨다.', '공감']),
  q('closing-memory', 16, '마지막 장면', '수업을 마치는 순간 학생들에게 한 가지를 남길 수 있다면 나는 무엇을 더 중요하게 생각할까요?', 'learning', 1, ['오늘 무엇을 이해하고 해냈는지 스스로 분명히 확인하게 한다.', '완성'], ['오늘의 배움에서 다음 질문이나 새로운 가능성을 떠올리게 한다.', '확장']),
] as const satisfies readonly NbtiQuestion[]

export const NBTI_TOTAL_QUESTIONS = NBTI_QUESTIONS.length
