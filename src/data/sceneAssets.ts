/** 16:9 start art, v4: no painted UI text on the left — the headline, chips and buttons
 *  are live DOM again. Only the quest board on the right is painted into the art. */
import classcadeStartMaster from '../assets/classcade/master-screens/start-master-v4.webp'
import academyGatewayPlate from '../assets/classcade/master-screens/mobile-scene-parts/academy-gateway-plate.webp'
import nbtiQuestionBackdrop from '../assets/classcade/journey-interactive/nbti-question-backdrop.webp'

export type JourneySceneAsset = {
  src: string
  alt: string
  position: string
  tone: 'gate' | 'academy' | 'study'
  mobileSrc?: string
  showQuestBoard?: boolean
}

export const JOURNEY_SCENE_ASSETS: Record<'start' | 'question' | 'result', JourneySceneAsset> = {
  start: { src: classcadeStartMaster, mobileSrc: academyGatewayPlate, alt: '어두운 성문 너머로 밝은 판타지 학교가 펼쳐진 장면', position: 'center center', tone: 'gate', showQuestBoard: false },
  question: { src: nbtiQuestionBackdrop, mobileSrc: nbtiQuestionBackdrop, alt: '책상 앞에서 마법 노트를 쓰는 모험가 선생님과 토끼', position: '58% 34%', tone: 'study' },
  /* Deliberately NOT the start master: that art has the start screen's headline and chips
     painted into it, which showed through behind the result panel as a second, wrong
     headline. Uses the textless plate until the 16 per-type result arts land. */
  result: { src: academyGatewayPlate, mobileSrc: academyGatewayPlate, alt: '빛나는 학교를 바라보는 모험가', position: 'center center', tone: 'gate' },
}
