import { describe, expect, it } from 'vitest'
import { CLASSCADE_VIDEO_CATALOG, EDUTOGETHER_YOUTUBE_CHANNEL, buildShareCardModel, rankVideos, recommendationTags } from './completionExperience'
import { buildGameFromCombo } from './classroomGameBuilder'
import { PROVISIONAL_NBTI_RESULTS } from './nbtiResults.provisional'

describe('completion recommendation and sharing contract', () => {
  const conditions = { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' }
  const sampleCandidate = buildGameFromCombo({ scene: 'treasure-room', mechanism: 'teamwork', world: 'academy', twist: 'role-swap' }, conditions)
  it('builds result-specific recommendation tags for every provisional NBTI result', () => {
    for (const result of PROVISIONAL_NBTI_RESULTS) {
      const tags = recommendationTags(result.directions, conditions, sampleCandidate, { competition: '낮게' })
      expect(tags.length).toBeGreaterThan(3)
      expect(new Set(tags).size).toBe(tags.length)
      expect(tags).toContain('초등')
    }
  })
  it('keeps only confirmed 같이교육 videos and supplied URL formats', () => {
    expect(CLASSCADE_VIDEO_CATALOG).toHaveLength(27)
    expect(new Set(CLASSCADE_VIDEO_CATALOG.map((video) => video.id)).size).toBe(27)
    expect(EDUTOGETHER_YOUTUBE_CHANNEL).toEqual({ id: 'UCxwEDzU4bGOyvIrpTkqN5jg', name: '같이교육' })
    for (const video of CLASSCADE_VIDEO_CATALOG) {
      expect(video.youtubeUrl).toBe(`https://www.youtube.com/watch?v=${video.id}`)
      expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`)
    }
  })
  it('ranks only condition-compatible videos, with stable matched-tag reasons', () => {
    const relationship = rankVideos(['협력', '전원 참여', '관계'], { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' })
    const calmIndividual = rankVideos(['개별 참여', '차분한 몰입', '자리 활동'], { schoolLevel: 'elementary', size: 'small', time: 'standard', space: 'seated', mood: 'calm' })
    const strategyYoung = rankVideos(['전략형', '도전과 전략'], { schoolLevel: 'elementary', size: 'small', time: 'standard', space: 'seated', mood: 'challenge' })
    /* 2026-08-12: 카탈로그를 같이교육 채널 27건으로 재구축한 뒤의 랭킹 상위값. */
    expect(relationship[0]?.video.id).toBe('QcBhWQcgZ1M')
    expect(calmIndividual[0]?.video.id).toBe('WsLyuXeJYpE')
    expect(strategyYoung[0]?.video.id).toBe('vavIDO8aylM')
    for (const entries of [relationship, calmIndividual, strategyYoung]) {
      expect(entries.length).toBeGreaterThan(0); expect(entries.length).toBeLessThanOrEqual(3)
      expect(new Set(entries.map(({ video }) => video.id)).size).toBe(entries.length)
      for (const { video, matchedTags } of entries) expect(matchedTags.every((tag) => video.tags.includes(tag))).toBe(true)
    }
  })
  it('uses an intentional no-match state instead of filling with poor candidates', () => {
    expect(rankVideos(['협력', '교실'], { schoolLevel: 'high', size: 'large', time: 'long', space: 'outdoor', mood: 'challenge' })).toEqual([])
  })
  it('never includes direct or indirect profile identifiers in a share card model', () => {
    const model = buildShareCardModel('든든한 항해사', '교실의 흐름을 설계합니다.', sampleCandidate, ['협력', '교실'])
    expect(JSON.stringify(model)).not.toMatch(/nickname|region|career|schoolName|email|phone|firebase|answer/i)
    expect(model).toMatchObject({ resultTitle: '든든한 항해사', gameTitle: sampleCandidate.title })
  })
})
