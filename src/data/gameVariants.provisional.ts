export type GameChoice = {
  id: string
  prompt: string
  helper: string
  options: readonly { id: string; label: string; detail: string }[]
}

export type GameVariant = {
  id: string
  title: string
  subtitle: string
  summary: string
  resultCodes: readonly string[]
  choices: readonly GameChoice[]
}

export const PROVISIONAL_GAME_VARIANTS = [
  {
    id: 'mapmakers-guild',
    title: '별빛 지도 제작단',
    subtitle: '교실 곳곳에 흩어진 단서를 연결해요.',
    summary: '관찰과 기록을 바탕으로 우리 반만의 탐험 지도를 완성하는 협력 게임이에요.',
    resultCodes: ['P00', 'P04', 'P08', 'P12'],
    choices: [
      { id: 'map-start', prompt: '첫 번째 단서는 어디에 숨길까요?', helper: '학급에 맞게 가장 끌리는 무대를 골라 보세요.', options: [{ id: 'desk', label: '책상 위 지도', detail: '익숙한 공간을 새로운 탐험지로 바꿔요.' }, { id: 'hall', label: '복도 별자리', detail: '함께 움직이며 단서를 찾아요.' }] },
      { id: 'map-finish', prompt: '마지막 지도 조각은 어떻게 완성할까요?', helper: '선택은 완성 카드에 기록됩니다.', options: [{ id: 'story', label: '이야기로 잇기', detail: '발견한 단서를 한 편의 이야기로 묶어요.' }, { id: 'symbol', label: '문양으로 남기기', detail: '우리 반만의 상징을 만들어 남겨요.' }] },
    ],
  },
  {
    id: 'idea-workshop',
    title: '상상 공방의 불씨',
    subtitle: '작은 아이디어를 교실의 발명품으로 키워요.',
    summary: '호기심에서 출발해 도구와 이야기를 조합하는 창작형 게임이에요.',
    resultCodes: ['P01', 'P05', 'P09', 'P13'],
    choices: [
      { id: 'workshop-start', prompt: '공방의 첫 재료는 무엇일까요?', helper: '우리 반이 즐길 수 있는 재료를 골라 보세요.', options: [{ id: 'paper', label: '기록의 종이', detail: '생각을 모아 보물 지도를 만들어요.' }, { id: 'object', label: '발견한 물건', detail: '평범한 물건에 새로운 역할을 부여해요.' }] },
      { id: 'workshop-finish', prompt: '발명품을 누구와 나눌까요?', helper: '완성 카드의 마지막 문장이 됩니다.', options: [{ id: 'pair', label: '짝과 먼저', detail: '작은 대화로 아이디어를 다듬어요.' }, { id: 'circle', label: '모두와 함께', detail: '교실 전체의 상상으로 확장해요.' }] },
    ],
  },
  {
    id: 'guild-of-bridges',
    title: '연결의 다리 수호대',
    subtitle: '서로 다른 힘을 한 미션으로 이어요.',
    summary: '역할과 대화를 연결해 모두가 주인공이 되는 협력형 게임이에요.',
    resultCodes: ['P02', 'P06', 'P10', 'P14'],
    choices: [
      { id: 'bridge-start', prompt: '첫 팀의 역할은 무엇일까요?', helper: '교실의 오늘 에너지에 맞는 역할을 골라 보세요.', options: [{ id: 'scout', label: '단서 탐색대', detail: '교실 곳곳의 힌트를 모아요.' }, { id: 'keeper', label: '빛 지킴이', detail: '팀의 약속과 순서를 지켜요.' }] },
      { id: 'bridge-finish', prompt: '다리를 완성하는 신호는?', helper: '함께 시작할 수 있는 신호를 남겨 보세요.', options: [{ id: 'clap', label: '함께하는 박수', detail: '모두의 리듬으로 문을 열어요.' }, { id: 'phrase', label: '우리 반의 문장', detail: '한 문장으로 마음을 모아요.' }] },
    ],
  },
  {
    id: 'dawn-quest',
    title: '여명의 퀘스트단',
    subtitle: '교실의 다음 장면을 힘차게 열어요.',
    summary: '가벼운 도전과 빠른 실행으로 오늘의 모험을 시작하는 에너지형 게임이에요.',
    resultCodes: ['P03', 'P07', 'P11', 'P15'],
    choices: [
      { id: 'dawn-start', prompt: '첫 퀘스트의 신호는?', helper: '모두가 바로 움직일 수 있는 신호를 골라 보세요.', options: [{ id: 'spark', label: '별빛 손짓', detail: '작은 몸짓으로 모두를 초대해요.' }, { id: 'call', label: '모험의 외침', detail: '한 번에 에너지를 모아 출발해요.' }] },
      { id: 'dawn-finish', prompt: '마지막 보물은 무엇일까요?', helper: '완성 카드에 우리 반의 보물이 기록됩니다.', options: [{ id: 'bravery', label: '새로운 용기', detail: '다음 도전을 향한 마음을 얻어요.' }, { id: 'memory', label: '함께한 기억', detail: '오늘의 웃음을 다음 장면으로 가져가요.' }] },
    ],
  },
] as const satisfies readonly GameVariant[]

export function getGameVariantForResult(resultCode: string | null) {
  return PROVISIONAL_GAME_VARIANTS.find((variant) => (variant.resultCodes as readonly string[]).includes(resultCode ?? '')) ?? PROVISIONAL_GAME_VARIANTS[0]
}
