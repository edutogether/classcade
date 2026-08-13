import type { CSSProperties } from 'react'
import type { CareerRange, SchoolLevel } from '../../data/adventure'
import type { IconName } from '../VisualPrimitives'

import prepFourReference from '../../assets/entry/prep-4.webp'
import prepTwoMaster from '../../assets/classcade/master-screens/prep-02-master.webp'
import prepThreeCleanPlate from '../../assets/classcade/prep-03-interactive/prep-03-clean-plate.webp'
import prepFourCleanPlate from '../../assets/classcade/prep-04-interactive/prep-04-clean-plate.webp'
import choiceFrameNeutral from '../../assets/classcade/prep-nav/choice-frame-neutral.webp'
import choiceFrameSelected from '../../assets/classcade/prep-nav/choice-frame-selected.webp'
import loadingMaster from '../../assets/classcade/master-screens/loading-master-v5.webp'
/** Shared backdrop for prep 1-4. Authored at 16:9 so it fills wide screens without the
 *  side gaps the previous 4:3-ish plate left. */
import portalAcademy from '../../assets/classcade/prep-01-interactive/prep-world-backdrop-16x9-v2.webp'
import prepOneWorldBackdrop from '../../assets/classcade/prep-01-interactive/prep-01-world-backdrop-16x9.webp'
import prepOneCleanPlate from '../../assets/classcade/prep-01-interactive/prep-01-clean-plate.webp'
import prepTwoCleanPlate from '../../assets/classcade/prep-02-interactive/prep-02-clean-plate.webp'
import prepTwoPreserviceNeutral from '../../assets/classcade/prep-02-interactive/prep-02-card-preservice-neutral.png'
import prepTwoPreserviceSelected from '../../assets/classcade/prep-02-interactive/prep-02-card-preservice-selected.webp'
import prepTwoOneToFiveNeutral from '../../assets/classcade/prep-02-interactive/prep-02-card-1-5-neutral.png'
import prepTwoOneToFiveSelected from '../../assets/classcade/prep-02-interactive/prep-02-card-1-5-selected.webp'
import prepTwoSixToTenNeutral from '../../assets/classcade/prep-02-interactive/prep-02-card-6-10-neutral.webp'
import prepTwoSixToTenSelected from '../../assets/classcade/prep-02-interactive/prep-02-card-6-10-selected.webp'
import prepTwoElevenToTwentyNeutral from '../../assets/classcade/prep-02-interactive/prep-02-card-11-20-neutral.png'
import prepTwoElevenToTwentySelected from '../../assets/classcade/prep-02-interactive/prep-02-card-11-20-selected.webp'
import prepTwoTwentyOnePlusNeutral from '../../assets/classcade/prep-02-interactive/prep-02-card-21plus-neutral.png'
import prepTwoTwentyOnePlusSelected from '../../assets/classcade/prep-02-interactive/prep-02-card-21plus-selected.webp'
import kindergartenNeutral from '../../assets/classcade/prep-01-interactive/prep-01-card-preschool-neutral.png'
import kindergartenSelected from '../../assets/classcade/prep-01-interactive/prep-01-card-preschool-selected-v4.png'
import kindergartenHover from '../../assets/classcade/prep-01-interactive/prep-01-card-preschool-hover-v4.png'
import elementaryNeutral from '../../assets/classcade/prep-01-interactive/prep-01-card-elementary-neutral.png'
import elementarySelected from '../../assets/classcade/prep-01-interactive/prep-01-card-elementary-selected-v4.png'
import elementaryHover from '../../assets/classcade/prep-01-interactive/prep-01-card-elementary-hover-v4.png'
import middleNeutral from '../../assets/classcade/prep-01-interactive/prep-01-card-middle-neutral.png'
import middleSelected from '../../assets/classcade/prep-01-interactive/prep-01-card-middle-selected-v4.png'
import middleHover from '../../assets/classcade/prep-01-interactive/prep-01-card-middle-hover-v4.png'
import highNeutral from '../../assets/classcade/prep-01-interactive/prep-01-card-high-neutral.png'
import highSelected from '../../assets/classcade/prep-01-interactive/prep-01-card-high-selected-v4.png'
import highHover from '../../assets/classcade/prep-01-interactive/prep-01-card-high-hover-v4.png'
import specialNeutral from '../../assets/classcade/prep-01-interactive/prep-01-card-special-neutral.png'
import specialSelected from '../../assets/classcade/prep-01-interactive/prep-01-card-special-selected-v4.png'
import specialHover from '../../assets/classcade/prep-01-interactive/prep-01-card-special-hover-v4.png'
import ctaDisabled from '../../assets/classcade/prep-01-interactive/prep-01-cta-disabled.webp'
import ctaEnabled from '../../assets/classcade/prep-01-interactive/prep-01-cta-enabled.webp'
import ctaHover from '../../assets/classcade/prep-01-interactive/prep-01-cta-hover.webp'
import ctaActive from '../../assets/classcade/prep-01-interactive/prep-01-cta-active.webp'
import prepTwoBack from '../../assets/classcade/prep-02-interactive/prep-02-back.webp'
import prepTwoCtaEnabled from '../../assets/classcade/prep-02-interactive/prep-02-cta-enabled.webp'
import prepTwoCtaDisabled from '../../assets/classcade/prep-02-interactive/prep-02-cta-disabled.webp'
import prepNavBack from '../../assets/classcade/prep-nav/prep-nav-back-norm.webp'
import prepNavMainBack from '../../assets/classcade/prep-nav/prep-nav-main-back.webp'
import prepNavCtaEnabled from '../../assets/classcade/prep-nav/prep-nav-cta-enabled-norm.webp'
import prepNavCtaDisabled from '../../assets/classcade/prep-nav/prep-nav-cta-disabled-norm.webp'
/* Final "모험 준비 완료" plaque. The four drawings arrived on four different canvases with
   different frame thicknesses, so they were re-registered onto one 1505x470 canvas with the
   green enamel panel pinned to identical pixels — state changes must not move the plaque. */
/* Full-board region-map master for step 3 (art mode): buttons painted on the left,
   Korea map on the right that lights up per selected region. NOTE: currently a stand-in
   binary — swap the real drawing in at this exact path, no code change needed. */
import prepThreeMapMaster from '../../assets/classcade/prep-03-interactive/prep-03-map-master.webp'
import prepFinalCtaEnabled from '../../assets/classcade/prep-nav/prep-final-cta-enabled.webp'
import prepFinalCtaDisabled from '../../assets/classcade/prep-nav/prep-final-cta-disabled.webp'
import prepFinalCtaHover from '../../assets/classcade/prep-nav/prep-final-cta-hover.webp'
import prepFinalCtaActive from '../../assets/classcade/prep-nav/prep-final-cta-active.webp'

export {
  prepFourReference,
  prepTwoMaster,
  prepThreeCleanPlate,
  prepFourCleanPlate,
  choiceFrameNeutral,
  choiceFrameSelected,
  loadingMaster,
  portalAcademy,
  prepOneWorldBackdrop,
  prepOneCleanPlate,
  prepTwoCleanPlate,
  ctaDisabled,
  ctaEnabled,
  ctaHover,
  ctaActive,
  prepTwoBack,
  prepTwoCtaEnabled,
  prepTwoCtaDisabled,
  prepNavBack,
  prepNavMainBack,
  prepNavCtaEnabled,
  prepNavCtaDisabled,
  prepFinalCtaEnabled,
  prepFinalCtaDisabled,
  prepFinalCtaHover,
  prepFinalCtaActive,
  prepThreeMapMaster,
}

/* Geometry for the step-3 map master, all in % of the image so every viewport lands on
   the painting. Plaques: 4 columns x 4 rows + 제주 centred on column 2; same order as
   REGION_OPTIONS. Glows: one anchor per region on the painted Korea map. */
const plaqueCol = [19.7, 28.5, 37.3, 45.9]
const plaqueRow = [54.8, 60.2, 65.5, 70.8, 75.75]
export const PREP3_PLAQUES: readonly { l: number; t: number }[] = [
  ...plaqueRow.slice(0, 4).flatMap((t) => plaqueCol.map((l) => ({ l, t }))),
  { l: plaqueCol[1], t: plaqueRow[4] },
]
export const PREP3_GLOWS: Record<string, { l: number; t: number }> = {
  seoul: { l: 58.0, t: 33.5 },
  busan: { l: 66.5, t: 56.5 },
  daegu: { l: 64.0, t: 51.5 },
  incheon: { l: 56.3, t: 35.5 },
  gwangju: { l: 57.5, t: 58.0 },
  daejeon: { l: 60.0, t: 47.0 },
  ulsan: { l: 67.5, t: 53.5 },
  sejong: { l: 59.0, t: 44.5 },
  gyeonggi: { l: 59.5, t: 36.5 },
  gangwon: { l: 63.5, t: 31.5 },
  chungbuk: { l: 62.0, t: 43.0 },
  chungnam: { l: 57.5, t: 45.5 },
  jeonbuk: { l: 59.0, t: 52.5 },
  jeonnam: { l: 56.5, t: 61.0 },
  gyeongbuk: { l: 65.0, t: 45.5 },
  gyeongnam: { l: 62.5, t: 56.0 },
  jeju: { l: 57.0, t: 74.5 },
}

export type PrepStep = 1 | 2 | 3 | 4 | 'nickname' | 'loading'

export const STEP_IMAGES: Record<Exclude<PrepStep, 'nickname' | 'loading'>, string> = {
  1: prepOneWorldBackdrop,
  2: prepTwoMaster,
  3: prepThreeCleanPlate,
  4: prepFourCleanPlate,
}

export const growthIcons: IconName[] = ['gamepad', 'school', 'spark', 'notebook', 'career', 'leaf', 'notebook', 'region', 'career', 'spark']

export const PREP_ONE_CARD_ASSETS: Record<SchoolLevel, { neutral: string; selected: string; hover: string }> = {
  kindergarten: { neutral: kindergartenNeutral, selected: kindergartenSelected, hover: kindergartenHover },
  elementary: { neutral: elementaryNeutral, selected: elementarySelected, hover: elementaryHover },
  middle: { neutral: middleNeutral, selected: middleSelected, hover: middleHover },
  high: { neutral: highNeutral, selected: highSelected, hover: highHover },
  special: { neutral: specialNeutral, selected: specialSelected, hover: specialHover },
}

export const PREP_ONE_CARD_POSITIONS: Record<SchoolLevel, CSSProperties> = {
  kindergarten: { '--card-x': '14.56%', '--card-y': '55.47%', '--card-w': '10.51%', '--card-h': '15.85%' } as CSSProperties,
  elementary: { '--card-x': '26.21%', '--card-y': '55.57%', '--card-w': '10.78%', '--card-h': '15.47%' } as CSSProperties,
  middle: { '--card-x': '37.13%', '--card-y': '55.57%', '--card-w': '10.78%', '--card-h': '15.47%' } as CSSProperties,
  high: { '--card-x': '48.79%', '--card-y': '55.57%', '--card-w': '10.78%', '--card-h': '15.47%' } as CSSProperties,
  special: { '--card-x': '60.18%', '--card-y': '55.47%', '--card-w': '8.36%', '--card-h': '15.57%' } as CSSProperties,
}

// Baked card art sliced from prep-02-master (see PREP2-ASSET-SPEC). Rect = source slot in the 1484x1060 plate.
export const PREP_TWO_CARD_ART: Record<CareerRange, { neutral?: string; selected?: string; rect: CSSProperties }> = {
  'pre-service': { neutral: prepTwoPreserviceNeutral, selected: prepTwoPreserviceSelected, rect: { '--art-x': '9.97%', '--art-y': '53.96%', '--art-w': '10.78%', '--art-h': '18.49%' } as CSSProperties },
  '1-5': { neutral: prepTwoOneToFiveNeutral, selected: prepTwoOneToFiveSelected, rect: { '--art-x': '22.03%', '--art-y': '53.96%', '--art-w': '10.78%', '--art-h': '18.49%' } as CSSProperties },
  '6-10': { neutral: prepTwoSixToTenNeutral, selected: prepTwoSixToTenSelected, rect: { '--art-x': '33.83%', '--art-y': '52.45%', '--art-w': '11.19%', '--art-h': '20.19%' } as CSSProperties },
  '11-20': { neutral: prepTwoElevenToTwentyNeutral, selected: prepTwoElevenToTwentySelected, rect: { '--art-x': '46.23%', '--art-y': '53.96%', '--art-w': '10.24%', '--art-h': '18.49%' } as CSSProperties },
  '21-plus': { neutral: prepTwoTwentyOnePlusNeutral, selected: prepTwoTwentyOnePlusSelected, rect: { '--art-x': '57.21%', '--art-y': '53.30%', '--art-w': '9.84%', '--art-h': '18.87%' } as CSSProperties },
}

/* "나의 플레이 결과 보기" — the NBTI flow's final CTA, drawn 2026-08-13.
   All four states share one 2058x764 canvas with a transparent background. */
import resultCtaEnabled from '../../assets/classcade/prep-nav/result-cta-enabled.webp'
import resultCtaDisabled from '../../assets/classcade/prep-nav/result-cta-disabled.webp'
import resultCtaHover from '../../assets/classcade/prep-nav/result-cta-hover.webp'
import resultCtaActive from '../../assets/classcade/prep-nav/result-cta-active.webp'
export { resultCtaEnabled, resultCtaDisabled, resultCtaHover, resultCtaActive }
