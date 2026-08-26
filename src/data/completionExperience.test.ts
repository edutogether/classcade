import { describe, expect, it } from 'vitest'
import { CLASSCADE_VIDEO_CATALOG, EDUTOGETHER_YOUTUBE_CHANNEL, rankVideos, recommendationTags } from './completionExperience'
import { PROVISIONAL_NBTI_RESULTS } from './nbtiResults.provisional'

describe('completion recommendation contract', () => {
  it('builds result-specific recommendation tags for every provisional NBTI result', () => {
    for (const result of PROVISIONAL_NBTI_RESULTS) {
      const tags = recommendationTags(result.directions)
      expect(tags.length).toBeGreaterThan(0)
      expect(new Set(tags).size).toBe(tags.length)
    }
  })
  it('keeps only confirmed 같이교육 videos and supplied URL formats', () => {
    expect(CLASSCADE_VIDEO_CATALOG).toHaveLength(32)
    expect(new Set(CLASSCADE_VIDEO_CATALOG.map((video) => video.id)).size).toBe(32)
    expect(EDUTOGETHER_YOUTUBE_CHANNEL).toEqual({ id: 'UCxwEDzU4bGOyvIrpTkqN5jg', name: '같이교육' })
    for (const video of CLASSCADE_VIDEO_CATALOG) {
      expect(video.youtubeUrl).toBe(`https://www.youtube.com/watch?v=${video.id}`)
      expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`)
    }
  })
  it('ranks videos by matched-tag count and only returns real matches', () => {
    const entries = rankVideos(['협력', '전원 참여', '관계'])
    expect(entries.length).toBeGreaterThan(0)
    expect(entries.length).toBeLessThanOrEqual(3)
    expect(new Set(entries.map(({ video }) => video.id)).size).toBe(entries.length)
    for (const { video, matchedTags, score } of entries) {
      expect(matchedTags.length).toBeGreaterThan(0)
      expect(matchedTags.every((tag) => video.tags.includes(tag))).toBe(true)
      expect(score).toBeGreaterThanOrEqual(6)
    }
    for (let index = 1; index < entries.length; index += 1) expect(entries[index - 1].score).toBeGreaterThanOrEqual(entries[index].score)
  })
  it('uses an intentional no-match state instead of filling with poor candidates', () => {
    expect(rankVideos(['이 태그는 어떤 영상에도 없음'])).toEqual([])
  })
})
