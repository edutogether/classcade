import type { NbtiDirection } from './nbti.provisional'

export type ProvisionalNbtiResult = { code: string; title: string; subtitle: string; description: string; directions: readonly NbtiDirection[]; strengths: readonly [string, string, string]; caution: string; palette: 'moss' | 'gold' | 'violet' | 'sky' }
const r = (code: string, title: string, description: string, directions: readonly NbtiDirection[], strengths: readonly [string, string, string], caution: string, palette: ProvisionalNbtiResult['palette']): ProvisionalNbtiResult => ({ code, title, subtitle: '교실의 선택이 만든 나만의 항로', description, directions, strengths, caution, palette })

export const PROVISIONAL_NBTI_RESULTS = [
  r('P00', '든든한 항해사', '분명한 목표와 안정적인 흐름으로 학급 전체가 함께 도착할 길을 만드는 선생님', ['design', 'whole', 'criteria', 'completion'], ['안정적인 수업 설계', '공동 목표 정렬', '분명한 마무리'], '계획 밖의 작은 신호도 다음 항로의 단서가 될 수 있어요.', 'moss'),
  r('P01', '별길을 여는 설계자', '탄탄한 기준 위에서 학급 전체가 새로운 가능성을 발견하도록 이끄는 선생님', ['design', 'whole', 'criteria', 'expansion'], ['구조 속의 호기심', '전체 흐름 관찰', '가능성 연결'], '새로운 길을 열 때에도 학생별 속도를 한 번 더 살펴봐요.', 'gold'),
  r('P02', '온기를 품은 지휘자', '모두의 마음을 살피면서 안정적인 리듬과 성취를 만들어 내는 선생님', ['design', 'whole', 'empathy', 'completion'], ['따뜻한 공동 운영', '관계 감각', '성취의 정리'], '모두를 챙기느라 나의 수업 에너지를 비우지 않도록 해요.', 'moss'),
  r('P03', '이야기를 엮는 안내자', '학급의 관계와 분위기를 하나의 흐름으로 엮어 새로운 배움으로 넓히는 선생님', ['design', 'whole', 'empathy', 'expansion'], ['관계 중심 설계', '공동 대화', '배움의 확장'], '흥미로운 이야기도 오늘의 핵심과 연결해 주면 더 오래 남아요.', 'gold'),
  r('P04', '정밀한 성장 설계자', '학생마다 필요한 기준과 다음 단계를 세심하게 설계하는 선생님', ['design', 'individual', 'criteria', 'completion'], ['개별 성장 설계', '명확한 피드백', '꾸준한 완성'], '세심한 설계가 모든 학생에게 같은 속도를 요구하지 않도록 해요.', 'moss'),
  r('P05', '가능성을 그리는 지도 제작자', '개별 학생의 현재 위치를 읽고 더 넓은 성장 경로를 그려 주는 선생님', ['design', 'individual', 'criteria', 'expansion'], ['성장 경로 발견', '개별 기준 설정', '다음 질문 만들기'], '가능성을 넓힐 때에는 지금 해낸 성취도 함께 기록해요.', 'gold'),
  r('P06', '마음을 밝히는 등불지기', '한 사람의 마음과 속도를 살피며 끝까지 성취의 순간으로 동행하는 선생님', ['design', 'individual', 'empathy', 'completion'], ['세심한 동행', '안전한 관계', '작은 성취 발견'], '도움이 필요한 순간에도 학생이 스스로 선택할 여백을 남겨요.', 'moss'),
  r('P07', '숨은 별을 찾는 관찰자', '조용한 가능성과 작은 변화를 발견해 새로운 배움의 문을 열어 주는 선생님', ['design', 'individual', 'empathy', 'expansion'], ['잠재력 관찰', '마음 읽기', '새 길 제안'], '관찰한 가능성이 실제 시도로 이어지도록 작은 기준도 함께 세워요.', 'gold'),
  r('P08', '판을 바로잡는 조율자', '변화하는 교실 흐름 속에서도 모두가 도착할 기준과 리듬을 빠르게 되찾는 선생님', ['response', 'whole', 'criteria', 'completion'], ['상황 판단', '공동 리듬 회복', '현장 해결'], '빠른 조율 뒤에는 왜 그렇게 바꾸었는지 함께 돌아봐요.', 'violet'),
  r('P09', '길을 개척하는 선봉장', '교실의 에너지를 읽고 과감한 선택으로 새로운 학급의 길을 여는 선생님', ['response', 'whole', 'criteria', 'expansion'], ['변화 이끌기', '공동 추진력', '도전 설계'], '새로운 시도에 조용한 학생도 참여할 자리를 마련해요.', 'sky'),
  r('P10', '함께 뛰는 응원대장', '교실 전체의 감정과 에너지를 모아 모두가 완주의 기쁨을 느끼게 하는 선생님', ['response', 'whole', 'empathy', 'completion'], ['에너지 모으기', '분위기 회복', '함께 완주'], '분위기를 살리는 것과 어려운 문제를 다루는 일을 구분해 보세요.', 'violet'),
  r('P11', '바람을 타는 모험가', '아이들의 반응을 따라 살아 움직이는 흐름과 새로운 이야기를 만드는 선생님', ['response', 'whole', 'empathy', 'expansion'], ['교실 에너지 감지', '관계적 전환', '새로운 이야기'], '좋은 즉흥도 다음 시간에 이어 갈 기록으로 남기면 힘이 됩니다.', 'sky'),
  r('P12', '순간을 읽는 해결사', '학생마다 다른 상황을 빠르게 파악하고 가장 필요한 해결책으로 이끄는 선생님', ['response', 'individual', 'criteria', 'completion'], ['즉각적 지원', '핵심 문제 파악', '실행력'], '빠른 해결 뒤에는 학생의 관점에서 이유를 들을 시간도 남겨요.', 'violet'),
  r('P13', '가능성을 깨우는 탐험가', '예상 밖의 생각을 발견하면 새로운 도전과 성장의 기회로 바꾸는 선생님', ['response', 'individual', 'criteria', 'expansion'], ['발상 포착', '도전 연결', '개별 확장'], '새로운 가능성이 너무 많아질 때에는 하나의 다음 걸음을 골라요.', 'sky'),
  r('P14', '곁을 지키는 회복술사', '학생의 감정과 속도에 맞춰 다시 참여하고 끝까지 해낼 힘을 되찾게 하는 선생님', ['response', 'individual', 'empathy', 'completion'], ['정서적 회복', '개별 속도 존중', '참여 회복'], '곁을 지키는 동안에도 공동의 약속을 함께 확인해 주세요.', 'violet'),
  r('P15', '빛을 잇는 길잡이', '작은 신호와 마음을 따라 학생마다 다른 가능성을 새로운 배움으로 이어 주는 선생님', ['response', 'individual', 'empathy', 'expansion'], ['신호 발견', '관계 기반 확장', '가능성 연결'], '공감한 이야기를 실제 배움의 다음 장면으로 구체화해 보세요.', 'sky'),
] as const satisfies readonly ProvisionalNbtiResult[]

export function getProvisionalResult(code: string | null) { return PROVISIONAL_NBTI_RESULTS.find((result) => result.code === code) ?? PROVISIONAL_NBTI_RESULTS[0] }

/** MBTI letters -> internal result code, for the QR "폰으로 받기" deep link
 *  (`?type=ESTJ`). Built from `directions` so it can never drift from the results
 *  table: axis order is flow, participation, judgment, learning; MBTI reads
 *  participation(E/I), flow(S/N), judgment(T/F), learning(J/P). */
const MBTI_LETTER: Record<NbtiDirection, string> = { whole: 'E', individual: 'I', design: 'S', response: 'N', criteria: 'T', empathy: 'F', completion: 'J', expansion: 'P' }
const CODE_BY_MBTI: Record<string, string> = Object.fromEntries(PROVISIONAL_NBTI_RESULTS.map((result) => {
  const [flow, participation, judgment, learning] = result.directions
  return [[participation, flow, judgment, learning].map((direction) => MBTI_LETTER[direction]).join(''), result.code]
}))

export function resultCodeForMbti(mbti: string): string | null {
  return CODE_BY_MBTI[mbti.toUpperCase()] ?? null
}
