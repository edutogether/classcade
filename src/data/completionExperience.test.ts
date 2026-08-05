import { describe, expect, it } from 'vitest'
import { CLASSCADE_VIDEO_CATALOG, buildShareCardModel, rankVideos, recommendationTags } from './completionExperience'
import { GAME_CANDIDATES } from './classroomGameBuilder'
import { PROVISIONAL_NBTI_RESULTS } from './nbtiResults.provisional'

describe('completion recommendation and sharing contract', () => {
  const conditions = { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' }
  it('builds result-specific recommendation tags for every provisional NBTI result', () => {
    for (const result of PROVISIONAL_NBTI_RESULTS) {
      const tags = recommendationTags(result.directions, conditions, GAME_CANDIDATES[0], { competition: '낮게' })
      expect(tags.length).toBeGreaterThan(3)
      expect(new Set(tags).size).toBe(tags.length)
      expect(tags).toContain('초등')
    }
  })
  it('keeps a stable, duplicate-free empty state until confirmed video URLs are supplied', () => {
    expect(CLASSCADE_VIDEO_CATALOG).toEqual([])
    expect(rankVideos(['협력', '교실'])).toEqual([])
  })
  it('never includes direct or indirect profile identifiers in a share card model', () => {
    const model = buildShareCardModel('든든한 항해사', '교실의 흐름을 설계합니다.', GAME_CANDIDATES[0], ['협력', '교실'])
    expect(JSON.stringify(model)).not.toMatch(/nickname|region|career|schoolName|email|phone|firebase|answer/i)
    expect(model).toMatchObject({ resultTitle: '든든한 항해사', gameTitle: GAME_CANDIDATES[0].title })
  })
})
