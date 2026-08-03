import officialTuning from '../../config/front120-tuning.v1.json'

export const TUNER_STORAGE_KEY = 'classcade.front120.tuner.v1'
export const TUNER_SCREENS = ['prep-1', 'prep-2', 'prep-3', 'prep-4', 'nickname', 'loading', 'main'] as const
export type TunerScreen = typeof TUNER_SCREENS[number]
export type TuningValues = Record<string, number>
export type Front120Tuning = { version: 1; updatedAt: string; global: TuningValues; screens: Record<TunerScreen, TuningValues> }

export type TuneControl = { key: string; label: string; min: number; max: number; step: number; unit: string }
export type TuneGroup = { label: string; controls: TuneControl[] }

export const TUNE_GROUPS: TuneGroup[] = [
  { label: 'Panel', controls: [
    { key: 'panel-max-width', label: '최대 너비', min: 520, max: 1200, step: 10, unit: 'px' },
    { key: 'panel-min-height', label: '최소 높이', min: 420, max: 900, step: 10, unit: 'px' },
    { key: 'panel-top', label: '상단 위치', min: 0, max: 90, step: 1, unit: 'px' },
    { key: 'panel-radius', label: '모서리', min: 0, max: 32, step: 1, unit: 'px' },
    { key: 'panel-padding', label: '양피지 여백', min: 16, max: 80, step: 1, unit: 'px' },
  ]},
  { label: 'Type', controls: [
    { key: 'title-size', label: '제목 크기', min: 26, max: 86, step: 1, unit: 'px' },
    { key: 'title-leading', label: '제목 행간', min: .8, max: 1.5, step: .02, unit: '' },
    { key: 'helper-size', label: '설명 크기', min: 11, max: 26, step: 1, unit: 'px' },
    { key: 'title-gap', label: '제목/설명 간격', min: 4, max: 40, step: 1, unit: 'px' },
  ]},
  { label: 'Choices', controls: [
    { key: 'card-height', label: '카드 높이', min: 48, max: 210, step: 1, unit: 'px' },
    { key: 'card-gap', label: '카드 간격', min: 4, max: 32, step: 1, unit: 'px' },
    { key: 'card-font-size', label: '카드 글자', min: 11, max: 30, step: 1, unit: 'px' },
    { key: 'card-icon-size', label: '카드 아이콘', min: 12, max: 42, step: 1, unit: 'px' },
    { key: 'selected-glow', label: '선택 발광', min: 0, max: 1, step: .05, unit: '' },
    { key: 'hover-lift', label: '호버 이동', min: 0, max: 10, step: 1, unit: 'px' },
  ]},
  { label: 'Scene', controls: [
    { key: 'scene-width', label: '장면 너비', min: 25, max: 100, step: 1, unit: '%' },
    { key: 'scene-x', label: '장면 X', min: -25, max: 25, step: 1, unit: '%' },
    { key: 'scene-y', label: '장면 Y', min: -25, max: 25, step: 1, unit: '%' },
    { key: 'scene-scale', label: '장면 배율', min: .7, max: 1.5, step: .02, unit: '' },
    { key: 'scene-brightness', label: '밝기', min: .4, max: 1.4, step: .05, unit: '' },
    { key: 'scene-saturation', label: '채도', min: .3, max: 1.5, step: .05, unit: '' },
    { key: 'scene-opacity', label: '오버레이 투명도', min: .1, max: 1, step: .05, unit: '' },
  ]},
  { label: 'CTA & motion', controls: [
    { key: 'cta-height', label: '버튼 높이', min: 44, max: 96, step: 1, unit: 'px' },
    { key: 'cta-gap', label: '버튼 간격', min: 4, max: 32, step: 1, unit: 'px' },
    { key: 'cta-font-size', label: '버튼 글자', min: 13, max: 30, step: 1, unit: 'px' },
    { key: 'mote-opacity', label: '입자 투명도', min: 0, max: 1, step: .05, unit: '' },
    { key: 'glow-strength', label: '발광 강도', min: 0, max: 1.5, step: .05, unit: '' },
  ]},
  { label: 'Loading & main', controls: [
    { key: 'loading-emblem-size', label: '마법진 크기', min: 80, max: 280, step: 1, unit: 'px' },
    { key: 'loading-track-height', label: '진행바 높이', min: 12, max: 40, step: 1, unit: 'px' },
    { key: 'main-content-x', label: '메인 콘텐츠 X', min: -15, max: 15, step: 1, unit: '%' },
    { key: 'main-character-x', label: '메인 캐릭터 X', min: -15, max: 15, step: 1, unit: '%' },
  ]},
]

const defaults: TuningValues = {
  'panel-max-width': 1040, 'panel-min-height': 680, 'panel-top': 42, 'panel-radius': 0, 'panel-padding': 58,
  'title-size': 48, 'title-leading': 1.15, 'helper-size': 17, 'title-gap': 15,
  'card-height': 128, 'card-gap': 12, 'card-font-size': 19, 'card-icon-size': 29, 'selected-glow': .38, 'hover-lift': 2,
  'scene-width': 54, 'scene-x': 0, 'scene-y': 0, 'scene-scale': 1, 'scene-brightness': .82, 'scene-saturation': .88, 'scene-opacity': .9,
  'cta-height': 54, 'cta-gap': 13, 'cta-font-size': 20, 'mote-opacity': .66, 'glow-strength': 1,
  'loading-emblem-size': 190, 'loading-track-height': 22, 'main-content-x': 0, 'main-character-x': 0,
}

function cloneOfficial(): Front120Tuning {
  return JSON.parse(JSON.stringify(officialTuning)) as Front120Tuning
}
export function createTuning(): Front120Tuning { return cloneOfficial() }
export function isTunerEnabled() { return import.meta.env.DEV && new URLSearchParams(window.location.search).get('tuner') === '1' }
export function validateTuning(input: unknown): input is Front120Tuning {
  if (!input || typeof input !== 'object') return false
  const value = input as Partial<Front120Tuning>
  if (value.version !== 1 || !value.global || !value.screens || typeof value.global !== 'object') return false
  return TUNER_SCREENS.every((screen) => value.screens?.[screen] && typeof value.screens[screen] === 'object' && validValues(value.screens[screen])) && validValues(value.global)
}
function validValues(values: TuningValues) { return Object.entries(values).every(([key, number]) => key in defaults && typeof number === 'number' && Number.isFinite(number) && withinRange(key, number)) }
export function withinRange(key: string, value: number) { const control = TUNE_GROUPS.flatMap((group) => group.controls).find((item) => item.key === key); return Boolean(control && value >= control.min && value <= control.max) }
export function valuesFor(tuning: Front120Tuning, screen: TunerScreen) { return { ...defaults, ...tuning.global, ...tuning.screens[screen] } }
export function applyTuning(tuning: Front120Tuning, screen: TunerScreen) {
  const root = document.documentElement
  for (const [key, value] of Object.entries(valuesFor(tuning, screen))) root.style.setProperty(`--front120-tune-${key}`, String(value))
  root.dataset.front120TuneScreen = screen
}
export function cssVariableText(tuning: Front120Tuning, screen: TunerScreen) { return Object.entries(valuesFor(tuning, screen)).map(([key, value]) => `--front120-tune-${key}: ${value};`).join('\n') }
