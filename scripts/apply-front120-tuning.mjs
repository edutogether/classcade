import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const target = path.join(root, 'src', 'config', 'front120-tuning.v1.json')
const source = process.argv[2]
const screens = ['prep-1', 'prep-2', 'prep-3', 'prep-4', 'nickname', 'loading', 'main']
const ranges = { 'panel-max-width':[520,1200], 'panel-min-height':[420,900], 'panel-top':[0,90], 'panel-radius':[0,32], 'panel-padding':[16,80], 'title-size':[26,86], 'title-leading':[.8,1.5], 'helper-size':[11,26], 'title-gap':[4,40], 'card-height':[48,210], 'card-gap':[4,32], 'card-font-size':[11,30], 'card-icon-size':[12,42], 'selected-glow':[0,1], 'hover-lift':[0,10], 'scene-width':[25,100], 'scene-x':[-25,25], 'scene-y':[-25,25], 'scene-scale':[.7,1.5], 'scene-brightness':[.4,1.4], 'scene-saturation':[.3,1.5], 'scene-opacity':[.1,1], 'cta-height':[44,96], 'cta-gap':[4,32], 'cta-font-size':[13,30], 'mote-opacity':[0,1], 'glow-strength':[0,1.5], 'loading-emblem-size':[80,280], 'loading-track-height':[12,40], 'main-content-x':[-15,15], 'main-character-x':[-15,15] }
function validValues(values) { return values && typeof values === 'object' && Object.entries(values).every(([key, value]) => ranges[key] && typeof value === 'number' && Number.isFinite(value) && value >= ranges[key][0] && value <= ranges[key][1]) }
if (!source) throw new Error('Usage: npm run front120:tune:apply -- <exported-json-path>')
const value = JSON.parse(fs.readFileSync(path.resolve(source), 'utf8'))
if (value.version !== 1 || !validValues(value.global) || !screens.every((screen) => validValues(value.screens?.[screen]))) throw new Error('Invalid Front120 tuning schema, token, or range.')
const deterministic = { version: 1, updatedAt: value.updatedAt ?? new Date().toISOString(), global: Object.fromEntries(Object.entries(value.global).sort()), screens: Object.fromEntries(screens.map((screen) => [screen, Object.fromEntries(Object.entries(value.screens[screen]).sort())])) }
fs.writeFileSync(target, `${JSON.stringify(deterministic, null, 2)}\n`, 'utf8')
console.log(`Applied Front120 tuning to ${path.relative(root, target)}`)
