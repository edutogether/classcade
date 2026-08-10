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

export type GameConceptId = 'story' | 'team' | 'strategy' | 'quick'

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

// --- 2x2 concept-combination system -----------------------------------------------------
// Four axes, two options each (16 total combinations). Each option carries pre-written
// complete-sentence fragments so composed text stays grammatically correct in Korean
// regardless of which combination is picked (no runtime particle concatenation).

export type GameAxisId = 'scene' | 'mechanism' | 'world' | 'twist'
export const GAME_AXIS_ORDER: readonly GameAxisId[] = ['scene', 'mechanism', 'world', 'twist']

export type GameAxisOption = {
  id: string
  title: string
  caption: string
  introFragment: string
  step: string
  ruleNote: string
}

export const GAME_AXES: Record<GameAxisId, { label: string; helper: string; options: readonly [GameAxisOption, GameAxisOption] }> = {
  scene: {
    label: '장면', helper: '어떤 장소에서 모험이 펼쳐질까요?',
    options: [
      { id: 'treasure-room', title: '보물 교실', caption: '일상 속 숨겨진 보물이 가득한 교실', introFragment: '평범한 교실 곳곳에 숨겨진 보물을 찾는 이야기로 시작해요.', step: '교실 곳곳에 숨겨 둔 단서나 보물 카드를 확인합니다.', ruleNote: '숨겨 둔 자리는 안전하고 찾기 쉬운 곳으로 미리 확인합니다.' },
      { id: 'mystic-library', title: '신비한 도서관', caption: '책 속 비밀이 살아 숨 쉬는 도서관', introFragment: '책과 이야기 속에 숨은 비밀을 함께 풀어 가는 도서관 모험이에요.', step: '이야기 속 단서가 담긴 책이나 카드를 펼쳐 봅니다.', ruleNote: '책이나 자료는 조심히 다루고 제자리에 정리합니다.' },
    ],
  },
  mechanism: {
    label: '메커니즘', helper: '어떤 방식으로 미션을 해결할까요?',
    options: [
      { id: 'relay', title: '릴레이 해결', caption: '다음 친구에게 이어지는 릴레이 미션', introFragment: '한 사람씩 이어받아 다음 단계로 전달하는 릴레이 방식으로 진행돼요.', step: '순서를 정해 한 사람씩 미션을 이어받아 해결합니다.', ruleNote: '차례를 지키고, 자기 순서가 아니면 조용히 응원합니다.' },
      { id: 'teamwork', title: '협력 미션', caption: '함께 힘을 모아 문제를 해결해요', introFragment: '팀 전체가 역할을 나눠 함께 힘을 모으는 협력 방식으로 진행돼요.', step: '팀원이 역할을 나누고 함께 의논해 미션을 해결합니다.', ruleNote: '한 사람이 혼자 다 하지 않고, 모두가 한 번 이상 참여합니다.' },
    ],
  },
  world: {
    label: '세계관', helper: '어떤 세계관 속에서 모험할까요?',
    options: [
      { id: 'academy', title: '마법 아카데미', caption: '마법과 지식이 가득한 학교 세계', introFragment: '마법과 지식이 가득한 아카데미의 학생이 되어 모험을 떠나요.', step: '아카데미 속 마법 규칙이나 지식 카드를 함께 확인합니다.', ruleNote: '마법 설정은 우리 반이 정한 규칙 안에서만 사용합니다.' },
      { id: 'space-station', title: '우주 기지', caption: '미래의 우주에서 펼쳐지는 모험', introFragment: '먼 미래의 우주 기지 대원이 되어 낯선 임무를 함께 수행해요.', step: '우주 기지의 임무 카드나 신호를 함께 확인합니다.', ruleNote: '임무 설정은 우리 반이 정한 규칙 안에서만 사용합니다.' },
    ],
  },
  twist: {
    label: '비틀기', helper: '어떤 색다른 규칙이 모험을 바꿀까요?',
    options: [
      { id: 'role-swap', title: '역할 교환', caption: '선생님과 학생의 역할이 바뀌어요', introFragment: '중간에 선생님과 학생의 역할이 바뀌는 특별한 반전이 있어요.', step: '정해진 순간에 선생님과 학생의 역할을 바꿔 진행합니다.', ruleNote: '역할을 바꾼 뒤에도 서로를 존중하는 말투를 유지합니다.' },
      { id: 'time-limit', title: '시간 제한', caption: '주어진 시간 안에 미션을 완료해요', introFragment: '정해진 시간 안에 완료해야 하는 긴장감 있는 제한이 있어요.', step: '남은 시간을 확인하며 미션을 마무리합니다.', ruleNote: '시간이 부족하면 가장 중요한 목표부터 먼저 완료합니다.' },
    ],
  },
}

export type GameComboSelection = Record<GameAxisId, string>

function axisOption(axis: GameAxisId, optionId: string): GameAxisOption {
  const option = GAME_AXES[axis].options.find((candidate) => candidate.id === optionId)
  if (!option) throw new Error(`Unknown ${axis} option: ${optionId}`)
  return option
}

export function isGameConditions(value: unknown): value is GameConditions {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const conditions = value as Record<string, unknown>
  return (Object.keys(GAME_CONDITIONS) as (keyof GameConditions)[]).every((key) => typeof conditions[key] === 'string' && GAME_CONDITIONS[key].some((option) => option.id === conditions[key]))
}

export function isGameComboSelection(value: unknown): value is GameComboSelection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const combo = value as Record<string, unknown>
  return GAME_AXIS_ORDER.every((axis) => typeof combo[axis] === 'string' && GAME_AXES[axis].options.some((option) => option.id === combo[axis]))
}

export function encodeGameComboId(combo: GameComboSelection): string {
  return GAME_AXIS_ORDER.map((axis) => combo[axis]).join('.')
}

export function decodeGameComboId(id: string): GameComboSelection | null {
  const parts = id.split('.')
  if (parts.length !== GAME_AXIS_ORDER.length) return null
  const combo = Object.fromEntries(GAME_AXIS_ORDER.map((axis, index) => [axis, parts[index]])) as GameComboSelection
  return isGameComboSelection(combo) ? combo : null
}

/** Recommends a default 2x2 selection from the teacher's NBTI directions and classroom conditions. */
export function recommendComboSelection(directions: readonly NbtiDirection[], conditions: GameConditions): GameComboSelection {
  const primary = directions[3]
  return {
    scene: conditions.mood === 'calm' ? 'mystic-library' : 'treasure-room',
    mechanism: primary === 'empathy' || conditions.mood === 'cooperative' ? 'teamwork' : 'relay',
    world: primary === 'expansion' ? 'space-station' : 'academy',
    twist: conditions.time === 'short' ? 'time-limit' : 'role-swap',
  }
}

function conditionLabel(key: GameConditionKey, value: string) {
  return GAME_CONDITIONS[key].find((option) => option.id === value)?.label ?? ''
}

/** Builds a full game candidate by composing the four selected axis fragments — one of 16 possible outcomes. */
export function buildGameFromCombo(combo: GameComboSelection, conditions: GameConditions): GameCandidate {
  const scene = axisOption('scene', combo.scene)
  const mechanism = axisOption('mechanism', combo.mechanism)
  const world = axisOption('world', combo.world)
  const twist = axisOption('twist', combo.twist)
  const sizeLabel = conditionLabel('size', conditions.size)
  const timeLabel = conditionLabel('time', conditions.time)
  const spaceLabel = conditionLabel('space', conditions.space)
  return {
    id: encodeGameComboId(combo),
    concept: mechanism.id === 'relay' ? 'quick' : 'team',
    title: `${scene.title} × ${world.title}`,
    intro: `${scene.introFragment} ${world.introFragment} ${mechanism.introFragment} ${twist.introFragment}`,
    people: sizeLabel,
    duration: timeLabel,
    space: spaceLabel,
    materials: mechanism.id === 'relay' ? '순서 카드, 필기구' : '모둠 활동지, 필기구',
    preparation: [scene.step, world.step],
    collaboration: mechanism.id === 'teamwork' ? '협력 중심' : '순서 진행',
    teacher: twist.id === 'role-swap' ? '학생 주도 관찰' : '시간 안내',
    goal: `${mechanism.title}과 ${twist.title}로 완성하는 ${world.title} 모험`,
    steps: [scene.step, mechanism.step, twist.step, world.step],
    rules: [mechanism.ruleNote, twist.ruleNote],
    quiet: '역할을 나눠 맡으면 말이 적은 학생도 편하게 참여할 수 있어요.',
    conflict: '의견이 갈리면 잠시 멈추고 각자의 이유를 한 번씩 들어 봅니다.',
    variation: `${timeLabel} 수업에서는 단계를 절반으로 줄여 진행할 수 있어요.`,
    closing: `${world.title} 여정에서 발견한 점을 한 문장으로 나눠 봅니다.`,
    fit: `${scene.title}과 ${twist.title}가 만나 이 반만의 특별한 모험이 됩니다.`,
  }
}

function flipAxis(axis: GameAxisId, combo: GameComboSelection): GameComboSelection {
  const other = GAME_AXES[axis].options.find((option) => option.id !== combo[axis])
  return other ? { ...combo, [axis]: other.id } : combo
}

/** Presents the chosen combination plus two remixes as distinct candidates.
 * Flips 'scene' and 'world' specifically — title is `${scene} × ${world}`, so
 * every remix is guaranteed a visibly different title, never a same-looking duplicate. */
export function candidatesForCombo(combo: GameComboSelection, conditions: GameConditions): GameCandidate[] {
  const variants = [combo, flipAxis('world', combo), flipAxis('scene', combo)]
  const seen = new Set<string>()
  return variants
    .map((variant) => buildGameFromCombo(variant, conditions))
    .filter((candidate) => (seen.has(candidate.id) ? false : (seen.add(candidate.id), true)))
}

export function getGameCandidate(candidateId: string | null, conditions: GameConditions | null): GameCandidate | null {
  if (!candidateId) return null
  const combo = decodeGameComboId(candidateId)
  if (!combo) return null
  return buildGameFromCombo(combo, conditions ?? { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' })
}
