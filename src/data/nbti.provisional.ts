export type NbtiAxis = 'explore' | 'structure' | 'connection' | 'spark'

export type NbtiChoice = {
  id: string
  label: string
  detail: string
  axis: NbtiAxis
  value: 0 | 1
}

export type NbtiQuestion = {
  id: string
  chapter: string
  prompt: string
  helper: string
  choices: readonly [NbtiChoice, NbtiChoice]
}

/**
 * A deliberately provisional classroom-play exploration. It is not a diagnosis,
 * psychological test, or official NBTI instrument.
 */
export const NBTI_QUESTIONS = [
  {
    id: 'first-activity',
    chapter: '첫 장면',
    prompt: '새로운 활동을 시작할 때 나는?',
    helper: '더 자연스럽게 끌리는 선택을 골라 주세요.',
    choices: [
      { id: 'map-first', label: '먼저 지도를 그려요', detail: '목표와 순서를 살펴본 뒤 출발해요.', axis: 'explore', value: 0 },
      { id: 'trail-first', label: '발자국을 따라가요', detail: '움직이며 단서를 모아 방향을 찾아요.', axis: 'explore', value: 1 },
    ],
  },
  {
    id: 'lesson-shape',
    chapter: '준비의 주문',
    prompt: '수업의 문을 열기 전에는?',
    helper: '완벽한 답보다 지금의 나와 가까운 쪽이면 충분해요.',
    choices: [
      { id: 'frame', label: '흐름을 단단히 세워요', detail: '학생이 안심할 수 있는 뼈대를 만들어요.', axis: 'structure', value: 0 },
      { id: 'improvise', label: '여지를 남겨 두어요', detail: '상황에 따라 새로운 길을 열어 두어요.', axis: 'structure', value: 1 },
    ],
  },
  {
    id: 'class-energy',
    chapter: '동료의 등불',
    prompt: '교실의 에너지가 흐트러질 때 나는?',
    helper: '선택은 언제든 다시 시작할 수 있어요.',
    choices: [
      { id: 'listen', label: '한 명씩 이야기를 들어요', detail: '각자의 목소리에서 실마리를 찾아요.', axis: 'connection', value: 0 },
      { id: 'rally', label: '모두의 손을 모아요', detail: '함께 움직일 작은 미션을 제안해요.', axis: 'connection', value: 1 },
    ],
  },
  {
    id: 'unexpected-clue',
    chapter: '빛나는 단서',
    prompt: '뜻밖의 아이디어를 발견하면?',
    helper: '나에게 가장 먼저 떠오르는 행동을 골라 주세요.',
    choices: [
      { id: 'polish', label: '쓸모 있게 다듬어요', detail: '지금의 수업에 맞게 차분히 연결해요.', axis: 'spark', value: 0 },
      { id: 'ignite', label: '바로 불을 붙여 봐요', detail: '작은 실험으로 가능성을 확인해요.', axis: 'spark', value: 1 },
    ],
  },
  {
    id: 'new-tool',
    chapter: '탐험 도구',
    prompt: '낯선 도구를 만났을 때 나는?',
    helper: '선택한 답은 기록되어 나만의 여정이 됩니다.',
    choices: [
      { id: 'study-tool', label: '사용법부터 살펴봐요', detail: '기본을 이해한 뒤 자신 있게 써요.', axis: 'explore', value: 0 },
      { id: 'try-tool', label: '작게 시험해 봐요', detail: '직접 눌러 보며 감각을 찾아요.', axis: 'explore', value: 1 },
    ],
  },
  {
    id: 'route-change',
    chapter: '갈림길',
    prompt: '계획과 다른 일이 생기면?',
    helper: '정답은 없어요. 가장 나다운 반응을 선택해 주세요.',
    choices: [
      { id: 'return-route', label: '다시 길을 정리해요', detail: '다음 한 걸음을 분명하게 만들어요.', axis: 'structure', value: 0 },
      { id: 'open-route', label: '새로운 길을 받아들여요', detail: '뜻밖의 흐름을 수업의 재료로 써요.', axis: 'structure', value: 1 },
    ],
  },
  {
    id: 'student-idea',
    chapter: '함께 만드는 성',
    prompt: '학생의 제안이 빛날 때 나는?',
    helper: '교실에서 자주 보이는 나의 모습을 떠올려 보세요.',
    choices: [
      { id: 'invite-detail', label: '생각을 더 들여다봐요', detail: '그 제안의 이유와 마음을 함께 발견해요.', axis: 'connection', value: 0 },
      { id: 'invite-stage', label: '모두의 무대로 키워요', detail: '친구들과 이어 갈 방법을 바로 열어요.', axis: 'connection', value: 1 },
    ],
  },
  {
    id: 'final-move',
    chapter: '마지막 불꽃',
    prompt: '여정을 마칠 무렵 나는?',
    helper: '이 선택으로 체험용 교실 플레이 결과가 완성됩니다.',
    choices: [
      { id: 'keep-note', label: '다음 기록을 남겨요', detail: '배운 것을 다음 모험의 씨앗으로 남겨요.', axis: 'spark', value: 0 },
      { id: 'share-spark', label: '새로운 시작을 제안해요', detail: '오늘의 힘을 다음 모험으로 이어 가요.', axis: 'spark', value: 1 },
    ],
  },
] as const satisfies readonly NbtiQuestion[]

export const NBTI_TOTAL_QUESTIONS = NBTI_QUESTIONS.length
