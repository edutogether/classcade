import type { Profile } from '../lib/storage'
import type { NbtiDirection } from './nbti.provisional'

export const GAME_CONDITIONS = {
  schoolLevel: [
    { id: 'elementary', label: '초등학교' },
    { id: 'middle', label: '중학교' },
    { id: 'high', label: '고등학교' },
  ],
  size: [{ id: 'small', label: '4~8명' }, { id: 'medium', label: '9~16명' }, { id: 'large', label: '17~24명' }, { id: 'xlarge', label: '25명 이상' }],
  time: [{ id: 'short', label: '10분 이내' }, { id: 'standard', label: '20분 안팎' }, { id: 'long', label: '30분 이상' }],
  space: [{ id: 'seated', label: '자리 중심 교실' }, { id: 'room', label: '교실 전체 사용' }, { id: 'wide', label: '복도·넓은 공간' }, { id: 'outdoor', label: '야외' }],
  mood: [{ id: 'calm', label: '차분하게 몰입' }, { id: 'lively', label: '움직이며 신나게' }, { id: 'cooperative', label: '협력하고 함께' }, { id: 'challenge', label: '도전과 전략 중심' }],
} as const

export type GameConditionKey = keyof typeof GAME_CONDITIONS
export type GameConditions = { [Key in GameConditionKey]: string }

export const defaultGameConditions = (profile: Pick<Profile, 'schoolLevel' | 'growthPriorities'>): GameConditions => ({
  schoolLevel: profile.schoolLevel,
  size: 'large',
  time: 'standard',
  space: 'room',
  mood: profile.growthPriorities.includes('class-community') ? 'cooperative' : 'calm',
})

export const GAME_CONCEPTS = [
  { id: 'story', title: '이야기 탐험', detail: '단서와 상상으로 우리 반의 모험 지도를 완성해요.', direction: 'expansion' },
  { id: 'team', title: '협력 미션', detail: '서로 다른 역할을 모아 함께 문제를 해결해요.', direction: 'empathy' },
  { id: 'strategy', title: '전략 도전', detail: '명확한 규칙과 선택으로 목표를 완성해요.', direction: 'criteria' },
  { id: 'quick', title: '빠른 변주', detail: '짧은 라운드로 교실의 에너지를 바꿔요.', direction: 'response' },
] as const
export type GameConceptId = (typeof GAME_CONCEPTS)[number]['id']

export type GameCandidate = {
  id: string
  concept: GameConceptId
  title: string
  intro: string
  people: string
  duration: string
  space: string
  materials: string
  preparation: readonly string[]
  collaboration: string
  teacher: string
  goal: string
  steps: readonly string[]
  rules: readonly string[]
  quiet: string
  conflict: string
  variation: string
  closing: string
  fit: string
}

export const GAME_CANDIDATES: readonly GameCandidate[] = [
  {
    id: 'story-map', concept: 'story', title: '별빛 단서 지도', intro: '팀마다 단서를 이어 우리 반의 모험 지도를 완성합니다.', people: '9~24명', duration: '20분', space: '자리·교실 전체', materials: '종이, 필기구, 포스트잇',
    preparation: ['교실에 단서 카드 6장을 숨겨 둡니다.', '팀마다 지도 종이와 색연필을 1세트씩 둡니다.'], collaboration: '협력 중심', teacher: '차분한 안내', goal: '관찰과 이야기 연결',
    steps: ['팀별 첫 단서를 받습니다.', '단서를 찾아 지도 조각에 기록합니다.', '조각을 이어 한 문장으로 발표합니다.'], rules: ['모든 팀원이 한 번 이상 기록합니다.', '다른 팀 단서는 허락 없이 옮기지 않습니다.'], quiet: '기록자·정리자 역할부터 맡아 말없이도 참여할 수 있어요.', conflict: '정답 대신 근거를 말하게 하고, 팀이 다음 단서를 고르게 합니다.', variation: '10분 수업에서는 단서 3장과 한 문장 발표로 줄입니다.', closing: '지도에서 발견한 가치를 다음 수업 질문으로 연결합니다.', fit: '확장 성향의 이야기를 다음 배움으로 이어 줍니다.',
  },
  {
    id: 'bridge-mission', concept: 'team', title: '연결의 다리 수호대', intro: '모두의 역할을 이어 제한된 재료로 다리를 완성합니다.', people: '4~24명', duration: '20분', space: '자리 중심', materials: '종이, 테이프, 역할 카드',
    preparation: ['팀별로 종이 10장과 테이프를 둡니다.', '설계·제작·기록·발표 역할 카드를 나눕니다.'], collaboration: '높음', teacher: '관찰·조율', goal: '역할 분담과 공동 해결',
    steps: ['팀원이 역할 카드를 한 장씩 받습니다.', '제한 시간 안에 다리 설계를 합의합니다.', '완성 뒤 서로의 전략 한 가지를 나눕니다.'], rules: ['말하기 전에 기록한 설계안을 먼저 확인합니다.', '한 사람이 계속 제작하지 않습니다.'], quiet: '시간 지킴이·기록자도 같은 무게의 역할로 참여합니다.', conflict: '의견이 갈리면 두 안의 장점을 적고 다음 라운드에서 선택합니다.', variation: '큰 학급은 4인 팀으로 나누고 발표는 갤러리 워크로 바꿉니다.', closing: '협력으로 아낀 시간을 서로 한 번씩 말합니다.', fit: '공감 성향이 참여의 빈틈을 함께 채울 수 있어요.',
  },
  {
    id: 'strategy-vault', concept: 'strategy', title: '황금 규칙 금고', intro: '선택 카드와 근거로 가장 높은 탐험 점수를 설계합니다.', people: '9~30명', duration: '20분', space: '자리 중심', materials: '선택 카드, 칠판',
    preparation: ['선택 카드 12장과 점수판을 준비합니다.', '공통 목표와 점수 규칙을 칠판에 적습니다.'], collaboration: '전략·가벼운 경쟁', teacher: '규칙 안내', goal: '근거 있는 의사결정',
    steps: ['공통 목표와 점수 규칙을 확인합니다.', '팀이 두 장의 선택 카드를 고릅니다.', '근거를 발표하고 점수를 계산합니다.'], rules: ['카드 선택 전 팀 모두 근거를 한 번씩 말합니다.', '점수보다 근거를 먼저 발표합니다.'], quiet: '카드를 고르고 근거를 기록한 뒤 발표에 참여할 수 있어요.', conflict: '점수 계산은 함께 보고, 다음 라운드의 전략을 바꿉니다.', variation: '10분 수업에서는 카드 6장과 한 라운드만 사용합니다.', closing: '좋았던 규칙 하나를 우리 반 약속으로 옮깁니다.', fit: '기준 성향의 명확한 목표와 피드백을 만듭니다.',
  },
  {
    id: 'quick-spark', concept: 'quick', title: '번개 별빛 릴레이', intro: '짧은 라운드로 아이디어를 이어 교실 에너지를 깨웁니다.', people: '4~30명', duration: '10분', space: '자리·교실 전체', materials: '없음 또는 공 1개',
    preparation: ['한 문장 주제와 시작 신호를 정합니다.', '교실 이동 동선을 짧게 비워 둡니다.'], collaboration: '신나는 협력', teacher: '에너지 조절', goal: '빠른 참여와 반응',
    steps: ['한 문장 주제를 제시합니다.', '10초 안에 아이디어를 이어 갑니다.', '팀이 가장 이어진 연결 하나를 고릅니다.'], rules: ['같은 학생이 연속으로 두 번 말하지 않습니다.', '패스는 가능하지만 다음 친구를 지목합니다.'], quiet: '먼저 한 문장을 만든 뒤 신호로 참여할 수 있어요.', conflict: '속도를 낮추고 손 신호로 차례를 다시 맞춥니다.', variation: '차분한 반에서는 자리에서 카드만 넘기는 릴레이로 바꿉니다.', closing: '오늘 나온 아이디어를 한 화면에 기록합니다.', fit: '반응 성향이 교실의 현재 에너지를 주도적으로 바꿉니다.',
  },
] as const

export function recommendConcepts(directions: readonly NbtiDirection[], conditions: GameConditions) {
  return [...GAME_CONCEPTS].sort((left, right) => scoreConcept(right, directions, conditions) - scoreConcept(left, directions, conditions))
}

function scoreConcept(concept: (typeof GAME_CONCEPTS)[number], directions: readonly NbtiDirection[], conditions: GameConditions) {
  const primary = directions[3]
  const secondary = directions[2]
  let score = concept.direction === primary ? 8 : concept.direction === secondary ? 4 : 0
  if (conditions.mood === 'cooperative' && concept.id === 'team') score += 4
  if (conditions.mood === 'challenge' && concept.id === 'strategy') score += 4
  if (conditions.mood === 'lively' && concept.id === 'quick') score += 4
  if (conditions.mood === 'calm' && concept.id === 'story') score += 4
  if (conditions.time === 'short' && concept.id === 'quick') score += 2
  if (conditions.space === 'seated' && concept.id === 'strategy') score += 2
  if (conditions.size === 'small' && concept.id === 'team') score += 1
  return score + GAME_CONCEPTS.findIndex((item) => item.id === concept.id) / 100
}

export function candidatesForConcept(concept: GameConceptId) {
  const selected = GAME_CANDIDATES.find((candidate) => candidate.concept === concept)
  return selected ? [selected, ...GAME_CANDIDATES.filter((candidate) => candidate.id !== selected.id)] : [...GAME_CANDIDATES]
}

export function getGameCandidate(candidateId: string | null) {
  return GAME_CANDIDATES.find((candidate) => candidate.id === candidateId) ?? null
}
