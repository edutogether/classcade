export type Option<Value extends string = string> = {
  value: Value
  label: string
}

export const SCHOOL_LEVEL_OPTIONS = [
  { value: 'kindergarten', label: '유아' },
  { value: 'elementary', label: '초등' },
  { value: 'middle', label: '중등' },
  { value: 'high', label: '고등' },
  { value: 'special', label: '특수' },
] as const satisfies readonly Option[]

export const CAREER_RANGE_OPTIONS = [
  { value: 'pre-service', label: '예비교사' },
  { value: '1-5', label: '1~5년' },
  { value: '6-10', label: '6~10년' },
  { value: '11-20', label: '11~20년' },
  { value: '21-plus', label: '21년 이상' },
] as const satisfies readonly Option[]

export const REGION_OPTIONS = [
  { value: 'seoul', label: '서울' },
  { value: 'busan', label: '부산' },
  { value: 'daegu', label: '대구' },
  { value: 'incheon', label: '인천' },
  { value: 'gwangju', label: '광주' },
  { value: 'daejeon', label: '대전' },
  { value: 'ulsan', label: '울산' },
  { value: 'sejong', label: '세종' },
  { value: 'gyeonggi', label: '경기' },
  { value: 'gangwon', label: '강원' },
  { value: 'chungbuk', label: '충북' },
  { value: 'chungnam', label: '충남' },
  { value: 'jeonbuk', label: '전북' },
  { value: 'jeonnam', label: '전남' },
  { value: 'gyeongbuk', label: '경북' },
  { value: 'gyeongnam', label: '경남' },
  { value: 'jeju', label: '제주' },
] as const satisfies readonly Option[]

export const GROWTH_PRIORITY_OPTIONS = [
  { value: 'engagement', label: '학생 참여·몰입' },
  { value: 'class-community', label: '학급 관계·공동체' },
  { value: 'creativity-problem-solving', label: '창의력·문제해결력' },
  { value: 'ai-digital', label: 'AI·디지털 활용' },
  { value: 'basic-learning-assessment', label: '기초학력·평가' },
  { value: 'emotion-self-regulation', label: '정서·자기조절' },
  { value: 'literacy-expression', label: '문해력·표현' },
  { value: 'career-self-understanding', label: '진로·자기이해' },
  { value: 'lesson-workload', label: '수업 준비·업무 경감' },
  { value: 'other', label: '기타 직접 입력' },
] as const satisfies readonly Option[]

export type SchoolLevel = typeof SCHOOL_LEVEL_OPTIONS[number]['value']
export type CareerRange = typeof CAREER_RANGE_OPTIONS[number]['value']
export type Region = typeof REGION_OPTIONS[number]['value']
export type GrowthPriority = typeof GROWTH_PRIORITY_OPTIONS[number]['value']

export type JourneyStatus = 'new' | 'nbti_in_progress' | 'nbti_complete'

export function optionLabel(options: readonly Option[], value: string) {
  return options.find((option) => option.value === value)?.label ?? '선택 정보 없음'
}
