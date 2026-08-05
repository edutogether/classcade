import { describe, expect, it } from 'vitest'
import { GAME_CANDIDATES, GAME_CONCEPTS, candidatesForConcept, defaultGameConditions, recommendConcepts } from './classroomGameBuilder'
import { PROVISIONAL_NBTI_RESULTS } from './nbtiResults.provisional'
import type { Profile } from '../lib/storage'

const conditions = { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' } as const

describe('classroom game builder recommendation contract', () => {
  it('provides four distinct concepts and four distinct candidates for P00 through P15', () => {
    expect(GAME_CONCEPTS).toHaveLength(4)
    expect(GAME_CANDIDATES).toHaveLength(4)
    for (const result of PROVISIONAL_NBTI_RESULTS) {
      const concepts = recommendConcepts(result.directions, conditions)
      expect(concepts.map((concept) => concept.id)).toHaveLength(4)
      expect(new Set(concepts.map((concept) => concept.id)).size).toBe(4)
      for (const concept of concepts) {
        const candidates = candidatesForConcept(concept.id)
        expect(candidates).toHaveLength(4)
        expect(candidates[0].concept).toBe(concept.id)
        expect(new Set(candidates.map((candidate) => candidate.id)).size).toBe(4)
      }
    }
  })

  it('changes the first recommendation when the selected classroom condition conflicts', () => {
    const result = PROVISIONAL_NBTI_RESULTS.find((item) => item.code === 'P00')!
    const calm = recommendConcepts(result.directions, { ...conditions, mood: 'calm' })[0]
    const lively = recommendConcepts(result.directions, { ...conditions, mood: 'lively', time: 'short' })[0]
    expect(calm.id).not.toBe(lively.id)
  })

  it('defaults conditions from the existing preparation profile without storing identifiers', () => {
    const profile: Pick<Profile, 'schoolLevel' | 'growthPriorities'> = { schoolLevel: 'middle', growthPriorities: ['class-community'] }
    expect(defaultGameConditions(profile)).toMatchObject({ schoolLevel: 'middle', mood: 'cooperative', size: 'large' })
  })
})
