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
/* 2026-08-12 재구축: 같이교육 채널 업로드 탭에서 실측 수집한 26개 놀이 영상
   (채널 페이지 videoId+제목 스크레이핑, 브이로그 3건 제외). 제목은 채널 원문 그대로.
   태그는 rankVideos가 읽는 어휘(방향 태그·조건 태그)에 맞춰 부여했다. */
const v = (id: string, title: string, shortDescription: string, schoolLevels: readonly string[], timeFits: readonly string[], spaces: readonly string[], duration: string, materials: string, tags: readonly string[], priority: number): RecommendationVideo =>
  ({ id, title, youtubeUrl: `https://www.youtube.com/watch?v=${id}`, thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, shortDescription, schoolLevels, timeFits, spaces, duration, materials, tags, published: true, priority })

export const CLASSCADE_VIDEO_CATALOG: readonly RecommendationVideo[] = [
  v('QcBhWQcgZ1M', '학급 세우기 놀이 | 당신은 당신의 이웃과 통하십니까', '공통점을 발견하며 학급 분위기를 여는 자리 바꾸기 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['room'], '10~20분', '의자만 있으면 돼요', ['관계', '학급 분위기', '전원 참여', '협력', '신체 활동', '빠른 준비'], 9),
  v('In7CdmAs1qY', '학급 세우기 놀이 | 심리다우트', '서로의 마음을 추리하며 가까워지는 학급 세우기 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['seated', 'room'], '10~20분', '없음', ['관계', '학급 분위기', '전원 참여', '이야기형', '규칙 기반'], 8),
  v('rShRhcF-hzU', '소통놀이 | 뒤죽박축 글자 맞히기', '섞인 글자를 함께 맞히며 소통하는 두뇌 놀이입니다.', ['elementary', 'middle'], ['short'], ['seated', 'room'], '10분 안팎', '칠판/종이', ['관계', '전원 참여', '규칙 기반', '자리 활동', '차분한 몰입'], 7),
  v('3Do4tKizwGo', '교실체육놀이 | 늘였다 줄였다 이어달리기', '규칙이 계속 바뀌는 이어달리기로 몸을 움직이는 체육 놀이입니다.', ['elementary', 'middle'], ['standard'], ['room', 'wide'], '20분 안팎', '거의 없음', ['신체 활동', '전원 참여', '협력', '즉흥 변주', '규칙 기반'], 8),
  v('_YdS72-_6k8', '체육 표현활동 | 박쥐와 나방', '소리에 의지해 움직이는 표현·감각 놀이입니다.', ['elementary'], ['short', 'standard'], ['room', 'wide'], '10~20분', '안대', ['신체 활동', '전원 참여', '즉흥 변주', '개별 참여'], 6),
  v('O-SvbyszcMI', '신체놀이 | 직업 가가볼', '직업 테마를 얹은 가가볼 변형 신체 놀이입니다.', ['elementary', 'middle'], ['standard'], ['wide'], '20분 안팎', '공', ['신체 활동', '전원 참여', '도전과 전략', '규칙 기반'], 6),
  v('cXscAK2BNYY', '신체놀이 | 핑퐁 투호', '탁구공으로 즐기는 투호 변형 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['room'], '10~20분', '탁구공, 통', ['신체 활동', '도전과 전략', '전원 참여', '소규모'], 6),
  v('V9-S5PSF18o', '신체놀이 | 책상컬링', '책상 위에서 즐기는 컬링 변형 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['seated', 'room'], '10~20분', '지우개/병뚜껑', ['도전과 전략', '자리 활동', '소규모', '규칙 기반'], 7),
  v('ThrM-DF8LIk', '체육놀이 | 풍선배구', '풍선으로 안전하게 즐기는 배구형 협력 놀이입니다.', ['elementary', 'middle'], ['standard'], ['room', 'wide'], '20분 안팎', '풍선', ['신체 활동', '협력', '전원 참여', '규칙 기반'], 8),
  v('UcjGov-rTaE', '세계 전통놀이 | 짐바놀이(아프리카)', '아프리카 전통 놀이를 몸과 리듬으로 경험하는 활동입니다.', ['elementary'], ['short', 'standard'], ['room', 'wide'], '10~20분', '확인 필요', ['전통 놀이', '문화', '신체 활동', '전원 참여', '협력'], 5),
  v('vavIDO8aylM', '수학 보드게임 | 골드 러시', '수 감각과 전략을 함께 쓰는 수학 보드게임입니다.', ['elementary', 'middle'], ['standard'], ['seated'], '20분 안팎', '보드게임 자료', ['수학', '보드게임', '전략형', '도전과 전략', '자리 활동', '소규모'], 7),
  v('HLx2aITlp38', '수학놀이 | 십삼지신 보드게임', '저학년의 전략과 수 감각을 키우는 보드게임 활동입니다.', ['elementary'], ['standard'], ['seated'], '20분 안팎', '보드게임 자료', ['수학', '보드게임', '전략형', '저학년', '자리 활동', '도전과 전략'], 6),
  v('RLgcV1G-rsw', '수학놀이 | 도형 만들기', '몸과 도구로 도형을 만들며 수학 감각을 키우는 놀이입니다.', ['elementary'], ['short', 'standard'], ['seated', 'room'], '10~20분', '끈/막대', ['수학', '협력', '구조화', '자리 활동', '개별 참여'], 6),
  v('9rBMbog0Ni0', '에듀테크 | 너의 그림이 들려', '그림과 설명을 연결하는 에듀테크 소통 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['seated'], '10~20분', '기기', ['자리 활동', '차분한 몰입', '개별 참여', '이야기형', '관계'], 6),
  v('KzyngYUEm30', '에듀테크 | 이야기 핑퐁', '이야기를 주고받으며 이어 가는 에듀테크 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['seated'], '10~20분', '기기', ['이야기형', '즉흥 변주', '자리 활동', '개별 참여'], 6),
  v('Xg1H8VxHHQw', '에듀테크 | 우리반 퀴즈', '우리 반 이야기로 만드는 퀴즈 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['seated'], '10~20분', '기기', ['규칙 기반', '전원 참여', '자리 활동', '도전과 전략', '학급 분위기'], 7),
  v('WsLyuXeJYpE', '진로 놀이 | 감정 탐정', '감정 단서를 추리하며 서로를 이해하는 진로·정서 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['seated', 'room'], '10~20분', '감정 카드', ['관계', '이야기형', '개별 참여', '차분한 몰입', '자리 활동'], 7),
  v('n-TorcNfaHE', '진로놀이 | 직업 흉내극장', '몸짓으로 직업을 표현하고 맞히는 진로 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['room'], '10~20분', '없음', ['즉흥 변주', '이야기형', '전원 참여', '신체 활동'], 6),
  v('zBZhr45zjh8', '진로놀이 | 감정 딕싯', '그림 카드로 감정과 생각을 나누는 진로·정서 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['seated'], '10~20분', '그림 카드', ['이야기형', '개별 참여', '차분한 몰입', '관계', '자리 활동'], 7),
  v('JfPPgWwpwIE', '보드게임 | 마음의 실타래', '마음을 나누며 관계를 잇는 보드게임 활동입니다.', ['elementary', 'middle'], ['standard'], ['seated'], '20분 안팎', '보드게임 자료', ['보드게임', '관계', '차분한 몰입', '자리 활동', '개별 참여'], 6),
  v('e2v9haWE8l8', '보드게임 | 띵!', '순발력과 집중력을 겨루는 보드게임 놀이입니다.', ['elementary', 'middle'], ['short'], ['seated'], '10분 안팎', '보드게임 자료', ['보드게임', '규칙 기반', '도전과 전략', '자리 활동', '소규모'], 6),
  v('7HwVXE0nn_A', '과학놀이 | 실험실 안전 수칙', '실험실 안전 수칙을 놀이로 익히는 과학 활동입니다.', ['elementary', 'middle'], ['short'], ['seated', 'room'], '10분 안팎', '없음', ['규칙 기반', '구조화', '자리 활동', '전원 참여'], 5),
  v('2aFmilWMJp4', '사회놀이 | 라이어게임', '설명 속 거짓을 찾아내는 추리형 사회 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['seated', 'room'], '10~20분', '없음', ['이야기형', '즉흥 변주', '전원 참여', '관계', '규칙 기반'], 8),
  v('lCXQViQsx68', '야 너두? | 변형놀이', '익숙한 놀이에 반전을 더한 변형 놀이입니다.', ['elementary', 'middle'], ['short'], ['room'], '10분 안팎', '없음', ['즉흥 변주', '전원 참여', '학급 분위기', '빠른 준비'], 7),
  v('Avcj1XyY1q4', '용암 건너기 | 변형놀이', '바닥을 용암 삼아 건너는 협력 변형 놀이입니다.', ['elementary'], ['standard'], ['room', 'wide'], '20분 안팎', '매트/종이', ['신체 활동', '협력', '전원 참여', '도전과 전략', '즉흥 변주'], 7),
  v('wlworcNm5x0', 'OOO꽃이 피었습니다! | 변형놀이', '무궁화 꽃이 피었습니다의 규칙을 비틀어 즐기는 변형 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['room', 'wide'], '10~20분', '없음', ['신체 활동', '전원 참여', '즉흥 변주', '규칙 기반'], 7),
  v('MDrhMgRtZ5o', '기억의 조각 | 학기말 놀이', '한 학기의 기억을 함께 돌아보는 학기말 회고 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['seated'], '10~20분', '종이, 필기구', ['마무리', '회고', '차분한 몰입', '관계', '개별 참여', '자리 활동'], 6),
  /* 2026-08-13 추가 5편: 유형별 고정 추천 32칸을 전부 고유 영상으로 채우기 위한 보강
     (채널 재스크레이핑으로 확보, oEmbed로 공개 상태 확인). */
  v('a3CWqrC-4is', '보드게임 | 스플렌더', '보석을 모아 엔진을 설계하는 전략 보드게임입니다.', ['elementary', 'middle', 'high'], ['standard'], ['seated'], '20분 안팎', '보드게임 자료', ['보드게임', '전략형', '도전과 전략', '규칙 기반', '자리 활동', '소규모'], 7),
  v('poF_K05cWKc', '존중놀이 | 추앙전단지', '친구의 좋은 점을 전단지로 만들어 서로를 추앙하는 존중 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['seated'], '10~20분', '종이, 필기구', ['관계', '협력', '학급 분위기', '이야기형', '개별 참여'], 7),
  v('RhkgPKafY0E', '과학영재놀이 | 지문을 찾아라', '지문 단서를 관찰하고 추리하는 과학 탐구 놀이입니다.', ['elementary', 'middle'], ['standard'], ['seated'], '20분 안팎', '실험 재료', ['규칙 기반', '차분한 몰입', '도전과 전략', '자리 활동', '개별 참여'], 6),
  v('RvfJM9IejXA', '존중놀이 | 나의 장점은', '서로의 장점을 발견하고 나눠 주는 존중 놀이입니다.', ['elementary', 'middle'], ['short', 'standard'], ['seated'], '10~20분', '종이, 필기구', ['관계', '차분한 몰입', '개별 참여', '이야기형', '자리 활동'], 7),
  v('EJ4SKGMw2lo', '소통놀이 | 포인트 비밀 경매', '내가 아끼는 가치를 비밀 경매로 나누는 소통 놀이입니다.', ['elementary', 'middle', 'high'], ['short', 'standard'], ['seated'], '10~20분', '종이, 필기구', ['이야기형', '관계', '자리 활동', '개별 참여', '규칙 기반'], 6),
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
