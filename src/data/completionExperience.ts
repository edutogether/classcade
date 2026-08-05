import type { NbtiDirection } from './nbti.provisional'
import type { GameCandidate, GameConditions } from './classroomGameBuilder'

export type RecommendationVideo = {
  id: string
  title: string
  youtubeUrl: string
  thumbnailUrl?: string
  shortDescription: string
  schoolLevel: string
  duration: string
  space: string
  materials: string
  tags: readonly string[]
  published: boolean
  priority: number
}

/** Confirmed 같이교육 URLs only. This starts empty until the channel supplies real records. */
export const CLASSCADE_VIDEO_CATALOG: readonly RecommendationVideo[] = []

const directionTags: Record<NbtiDirection, readonly string[]> = {
  design: ['구조화'], response: ['즉흥 변주'], whole: ['전원 참여'], individual: ['개별 참여'],
  criteria: ['규칙 기반'], empathy: ['협력'], completion: ['마무리'], expansion: ['이야기형'],
}

const conditionTags: Record<keyof GameConditions, Record<string, string>> = {
  schoolLevel: { elementary: '초등', middle: '중등', high: '고등' },
  size: { small: '소규모', medium: '중규모', large: '전원 참여', xlarge: '대규모' },
  time: { short: '10분', standard: '20분', long: '긴 활동' },
  space: { seated: '자리 활동', room: '교실', wide: '넓은 공간', outdoor: '야외' },
  mood: { calm: '차분한 몰입', lively: '신체 활동', cooperative: '협력', challenge: '경쟁' },
}

export function recommendationTags(directions: readonly NbtiDirection[], conditions: GameConditions | null, candidate: GameCandidate | null, adjustments: Record<string, string>) {
  const tags = new Set<string>(directions.flatMap((direction) => directionTags[direction]))
  if (conditions) (Object.keys(conditions) as (keyof GameConditions)[]).forEach((key) => tags.add(conditionTags[key][conditions[key]]))
  if (candidate) tags.add(candidate.collaboration).add(candidate.concept === 'story' ? '이야기형' : candidate.concept === 'strategy' ? '전략형' : candidate.concept === 'quick' ? '빠른 준비' : '협력')
  if (adjustments.competition === '낮게') tags.delete('경쟁')
  if (adjustments.materials === '낮게') tags.add('준비물 없음')
  return [...tags].filter(Boolean).slice(0, 12)
}

export function rankVideos(tags: readonly string[]) {
  const tagSet = new Set(tags)
  return CLASSCADE_VIDEO_CATALOG.filter((video) => video.published).map((video) => ({ video, score: video.tags.reduce((score, tag) => score + (tagSet.has(tag) ? 1 : 0), 0) + video.priority })).sort((left, right) => right.score - left.score || left.video.id.localeCompare(right.video.id)).slice(0, 3)
}

export type ShareCardFormat = 'square' | 'story'
export type ShareCardModel = { resultTitle: string; resultSummary: string; gameTitle: string; gameIntro: string; tags: readonly string[] }

/** Excludes profile, name, region, career, code, Firebase and answer data by construction. */
export function buildShareCardModel(resultTitle: string, resultSummary: string, candidate: GameCandidate, tags: readonly string[]): ShareCardModel {
  return { resultTitle, resultSummary, gameTitle: candidate.title, gameIntro: candidate.intro, tags: tags.slice(0, 4) }
}
