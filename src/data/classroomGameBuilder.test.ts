import { describe, expect, it } from 'vitest'
import { GAME_AXES, GAME_AXIS_ORDER, buildGameFromCombo, candidatesForCombo, decodeGameComboId, defaultGameConditions, encodeGameComboId, isGameComboSelection, recommendComboSelection } from './classroomGameBuilder'
import { PROVISIONAL_NBTI_RESULTS } from './nbtiResults.provisional'
import type { Profile } from '../lib/storage'
import type { GameAxisId, GameComboSelection } from './classroomGameBuilder'

const conditions = { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' } as const

function allCombos(): GameComboSelection[] {
  const combos: GameComboSelection[] = []
  for (const scene of GAME_AXES.scene.options) for (const mechanism of GAME_AXES.mechanism.options) for (const world of GAME_AXES.world.options) for (const twist of GAME_AXES.twist.options) {
    combos.push({ scene: scene.id, mechanism: mechanism.id, world: world.id, twist: twist.id })
  }
  return combos
}

describe('classroom game builder 2x2 combination contract', () => {
  it('has exactly four axes with exactly two options each', () => {
    expect(GAME_AXIS_ORDER).toHaveLength(4)
    for (const axis of GAME_AXIS_ORDER) expect(GAME_AXES[axis].options).toHaveLength(2)
  })

  it('produces all sixteen distinct, fully composed candidates from the axis combinations', () => {
    const combos = allCombos()
    expect(combos).toHaveLength(16)
    const built = combos.map((combo) => buildGameFromCombo(combo, conditions))
    expect(new Set(built.map((candidate) => candidate.id)).size).toBe(16)
    expect(new Set(built.map((candidate) => candidate.title)).size).toBeGreaterThan(1)
    for (const candidate of built) {
      expect(candidate.intro.length).toBeGreaterThan(10)
      expect(candidate.steps.length).toBeGreaterThanOrEqual(4)
      expect(candidate.rules.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('round-trips combo ids through encode/decode', () => {
    for (const combo of allCombos()) {
      const id = encodeGameComboId(combo)
      expect(decodeGameComboId(id)).toEqual(combo)
    }
    expect(decodeGameComboId('not-a-real-id')).toBeNull()
    expect(decodeGameComboId('a.b.c')).toBeNull()
  })

  it('validates combo selections strictly', () => {
    expect(isGameComboSelection({ scene: 'treasure-room', mechanism: 'teamwork', world: 'academy', twist: 'role-swap' })).toBe(true)
    expect(isGameComboSelection({ scene: 'not-real', mechanism: 'teamwork', world: 'academy', twist: 'role-swap' })).toBe(false)
    expect(isGameComboSelection(null)).toBe(false)
  })

  it('recommends a valid combo for every provisional NBTI result', () => {
    for (const result of PROVISIONAL_NBTI_RESULTS) {
      const combo = recommendComboSelection(result.directions, conditions)
      expect(isGameComboSelection(combo)).toBe(true)
    }
  })

  it('presents the chosen combination plus distinct one-axis remixes as candidates', () => {
    const combo: GameComboSelection = { scene: 'treasure-room', mechanism: 'teamwork', world: 'academy', twist: 'role-swap' }
    const candidates = candidatesForCombo(combo, conditions)
    expect(candidates.length).toBeGreaterThanOrEqual(2)
    expect(candidates.length).toBeLessThanOrEqual(3)
    expect(candidates[0].id).toBe(encodeGameComboId(combo))
    expect(new Set(candidates.map((candidate) => candidate.id)).size).toBe(candidates.length)
    for (const candidate of candidates) {
      const decoded = decodeGameComboId(candidate.id)
      expect(decoded).not.toBeNull()
      const differingAxes = (GAME_AXIS_ORDER as readonly GameAxisId[]).filter((axis) => decoded![axis] !== combo[axis])
      expect(differingAxes.length).toBeLessThanOrEqual(1)
    }
  })

  it('defaults conditions from the existing preparation profile without storing identifiers', () => {
    const profile: Pick<Profile, 'schoolLevel' | 'growthPriorities'> = { schoolLevel: 'middle', growthPriorities: ['class-community'] }
    expect(defaultGameConditions(profile)).toMatchObject({ schoolLevel: 'middle', mood: 'cooperative', size: 'large' })
  })
})
