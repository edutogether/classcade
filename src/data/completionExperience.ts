import type { NbtiDirection } from './nbti.provisional'
import type { GameCandidate, GameConditions } from './classroomGameBuilder'

export type RecommendationVideo = {
  id: string
  title: string
  youtubeUrl: string
  thumbnailUrl?: string
  shortDescription: string
  schoolLevels: readonly string[]
  timeFits: readonly string[]
  spaces: readonly string[]
  duration: string
  materials: string
  tags: readonly string[]
  published: boolean
  priority: number
}

/** Confirmed public 같이교육 records only. No URLs are generated beyond these supplied IDs. */
export const EDUTOGETHER_YOUTUBE_CHANNEL = {
  id: 'UCxwEDzU4bGOyvIrpTkqN5jg',
  name: '같이교육',
} as const

/** Confirmed public 같이교육 records only. No URLs are generated beyond these supplied IDs. */
export const CLASSCADE_VIDEO_CATALOG: readonly RecommendationVideo[] = [
  { id: 'QcBhWQcgZ1M', title: '학급 분위기와 관계를 여는 대화', youtubeUrl: 'https://www.youtube.com/watch?v=QcBhWQcgZ1M', thumbnailUrl: 'https://i.ytimg.com/vi/QcBhWQcgZ1M/hqdefault.jpg', shortDescription: '공통점과 관계를 발견하며 학급 분위기를 여는 활동입니다.', schoolLevels: ['elementary', 'middle', 'high'], timeFits: ['short', 'standard'], spaces: ['seated', 'room'], duration: '10~20분', materials: '거의 없음', tags: ['관계', '학급 분위기', '전원 참여', '협력', '신체 활동', '빠른 준비', '규칙 변경 가능'], published: true, priority: 8 },
  { id: 'P-7JxuKIc9Q', title: '감정 표현과 관계를 위한 대화', youtubeUrl: 'https://www.youtube.com/watch?v=P-7JxuKIc9Q', thumbnailUrl: 'https://i.ytimg.com/vi/P-7JxuKIc9Q/hqdefault.jpg', shortDescription: '감정을 표현하고 서로를 이해하는 관계 대화 묶음입니다.', schoolLevels: ['elementary', 'middle'], timeFits: ['short', 'standard'], spaces: ['room'], duration: '10~20분', materials: '없음', tags: ['관계', '감정 표현', '협력', '전원 참여', '학기 초', '빠른 준비'], published: true, priority: 7 },
  { id: 'KYufBL49Cik', title: '친구와 함께하는 대화', youtubeUrl: 'https://www.youtube.com/watch?v=KYufBL49Cik', thumbnailUrl: 'https://i.ytimg.com/vi/KYufBL49Cik/hqdefault.jpg', shortDescription: '친구와 함께 추리하고 질문하며 관계를 만드는 대화입니다.', schoolLevels: ['elementary', 'middle'], timeFits: ['short', 'standard'], spaces: ['room'], duration: '10~20분', materials: '거의 없음', tags: ['친구', '질문', '추리', '관계', '전원 참여', '빠른 준비'], published: true, priority: 6 },
  { id: 'emAwxLcKBes', title: '협동능력을 키우는 대화', youtubeUrl: 'https://www.youtube.com/watch?v=emAwxLcKBes', thumbnailUrl: 'https://i.ytimg.com/vi/emAwxLcKBes/hqdefault.jpg', shortDescription: '공동 목표와 역할 분담을 경험하는 협동 활동입니다.', schoolLevels: ['elementary', 'middle'], timeFits: ['standard'], spaces: ['room', 'wide'], duration: '20분 안팎', materials: '없음', tags: ['협력', '모둠', '공동 목표', '역할', '전원 참여', '신체 활동', '관계'], published: true, priority: 10 },
  { id: 'KjHDS59tGS4', title: '개인 활동으로 이어 보는 대화', youtubeUrl: 'https://www.youtube.com/watch?v=KjHDS59tGS4', thumbnailUrl: 'https://i.ytimg.com/vi/KjHDS59tGS4/hqdefault.jpg', shortDescription: '혼자서도 참여하며 자신의 생각과 결과를 만드는 활동입니다.', schoolLevels: ['elementary', 'middle'], timeFits: ['short', 'standard'], spaces: ['seated'], duration: '10~20분', materials: '없음', tags: ['개별 참여', '차분한 몰입', '자리 활동', '조용한 학생 참여', '빠른 준비', '마무리', '자기 표현'], published: true, priority: 8 },
  { id: 'OXQqEbDYxBg', title: '친해지며 생각하는 대화', youtubeUrl: 'https://www.youtube.com/watch?v=OXQqEbDYxBg', thumbnailUrl: 'https://i.ytimg.com/vi/OXQqEbDYxBg/hqdefault.jpg', shortDescription: '질문과 회고로 서로를 알아가는 관계 활동입니다.', schoolLevels: ['elementary', 'middle', 'high'], timeFits: ['short', 'standard'], spaces: ['room'], duration: '10~20분', materials: '없음', tags: ['관계', '회고', '질문', '학급 분위기', '전원 참여', '빠른 준비'], published: true, priority: 9 },
  { id: 'UcjGov-rTaE', title: '세계의 전통과 함께하는 활동', youtubeUrl: 'https://www.youtube.com/watch?v=UcjGov-rTaE', thumbnailUrl: 'https://i.ytimg.com/vi/UcjGov-rTaE/hqdefault.jpg', shortDescription: '전통 놀이를 몸과 리듬으로 함께 경험하는 활동입니다.', schoolLevels: ['elementary'], timeFits: ['short', 'standard'], spaces: ['room', 'wide'], duration: '10~20분', materials: '확인 필요', tags: ['전통 놀이', '문화', '신체 활동', '전원 참여', '리듬', '협력', '초등'], published: true, priority: 5 },
  { id: 'HLx2aITlp38', title: '수학 보드게임 활동', youtubeUrl: 'https://www.youtube.com/watch?v=HLx2aITlp38', thumbnailUrl: 'https://i.ytimg.com/vi/HLx2aITlp38/hqdefault.jpg', shortDescription: '저학년의 전략과 수 감각을 함께 경험하는 보드게임 활동입니다.', schoolLevels: ['elementary'], timeFits: ['standard'], spaces: ['seated'], duration: '20분 안팎', materials: '보드게임 자료', tags: ['수학', '보드게임', '전략형', '저학년', '자리 활동', '도전과 전략', '소그룹'], published: true, priority: 6 },
]

const directionTags: Record<NbtiDirection, readonly string[]> = {
  design: ['구조화'], response: ['즉흥 변주'], whole: ['전원 참여'], individual: ['개별 참여'],
  criteria: ['규칙 기반'], empathy: ['협력'], completion: ['마무리'], expansion: ['이야기형'],
}

const conditionTags: Record<keyof GameConditions, Record<string, string>> = {
  schoolLevel: { elementary: '초등', middle: '중등', high: '고등' },
  size: { small: '소규모', medium: '중규모', large: '전원 참여', xlarge: '대규모' },
  time: { short: '10분', standard: '20분', long: '긴 활동' },
  space: { seated: '자리 활동', room: '교실', wide: '넓은 공간', outdoor: '야외' },
  mood: { calm: '차분한 몰입', lively: '신체 활동', cooperative: '협력', challenge: '도전과 전략' },
}

export function recommendationTags(directions: readonly NbtiDirection[], conditions: GameConditions | null, candidate: GameCandidate | null, adjustments: Record<string, string>) {
  const tags = new Set<string>(directions.flatMap((direction) => directionTags[direction]))
  if (conditions) (Object.keys(conditions) as (keyof GameConditions)[]).forEach((key) => tags.add(conditionTags[key][conditions[key]]))
  if (candidate) tags.add(candidate.collaboration).add(candidate.concept === 'story' ? '이야기형' : candidate.concept === 'strategy' ? '전략형' : candidate.concept === 'quick' ? '빠른 준비' : '협력')
  if (adjustments.competition === '낮게') tags.delete('경쟁')
  if (adjustments.materials === '낮게') tags.add('준비물 없음')
  return [...tags].filter(Boolean).slice(0, 12)
}

export function rankVideos(tags: readonly string[], conditions: GameConditions | null) {
  const tagSet = new Set(tags)
  return CLASSCADE_VIDEO_CATALOG.filter((video) => video.published).map((video) => {
    const matchedTags = video.tags.filter((tag) => tagSet.has(tag))
    if (conditions && !video.schoolLevels.includes(conditions.schoolLevel)) return { video, score: Number.NEGATIVE_INFINITY, matchedTags }
    let score = matchedTags.length * 3 + video.priority
    if (conditions && !video.spaces.includes(conditions.space)) score -= 8
    if (conditions && !video.timeFits.includes(conditions.time)) score -= 6
    return { video, score, matchedTags }
  }).filter(({ score, matchedTags }) => score >= 6 && matchedTags.length > 0).sort((left, right) => right.score - left.score || right.video.priority - left.video.priority || left.video.id.localeCompare(right.video.id)).slice(0, 3)
}

export type ShareCardFormat = 'square' | 'story'
export type ShareCardModel = { resultTitle: string; resultSummary: string; gameTitle: string; gameIntro: string; tags: readonly string[] }

/** Excludes profile, name, region, career, code, Firebase and answer data by construction. */
export function buildShareCardModel(resultTitle: string, resultSummary: string, candidate: GameCandidate, tags: readonly string[]): ShareCardModel {
  return { resultTitle, resultSummary, gameTitle: candidate.title, gameIntro: candidate.intro, tags: tags.slice(0, 4) }
}
