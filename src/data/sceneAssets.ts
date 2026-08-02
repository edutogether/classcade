import classcadeStartMaster from '../assets/classcade-start-master.png'
import portalAcademyBackground from '../assets/portal-academy-background.png'

export type JourneySceneAsset = {
  src: string
  alt: string
  position: string
  tone: 'gate' | 'academy' | 'study'
  showQuestBoard?: boolean
}

export const JOURNEY_SCENE_ASSETS: Record<'start' | 'question' | 'result' | 'game' | 'complete', JourneySceneAsset> = {
  start: { src: classcadeStartMaster, alt: '어두운 성문 너머로 밝은 판타지 학교가 펼쳐진 장면', position: 'center center', tone: 'gate', showQuestBoard: true },
  question: { src: portalAcademyBackground, alt: '판타지 학교와 하늘섬이 보이는 장면', position: 'center 42%', tone: 'study' },
  result: { src: classcadeStartMaster, alt: '빛나는 학교를 바라보는 모험가', position: 'center center', tone: 'gate' },
  game: { src: portalAcademyBackground, alt: '모험을 시작할 수 있는 판타지 학교 장면', position: 'center 46%', tone: 'academy' },
  complete: { src: classcadeStartMaster, alt: '모험가와 판타지 학교의 완성 장면', position: 'center center', tone: 'gate' },
}
