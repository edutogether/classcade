import { describe, expect, it } from 'vitest'
import { REGION_OPTIONS, SCHOOL_LEVEL_OPTIONS } from './data/adventure'
import { createJourneyState } from './features/journey/journeyState'
import { validateProfile } from './lib/storage'

const validProfile = {
  version: 1,
  schoolLevel: 'elementary',
  careerRange: '1-5',
  region: 'seoul',
  growthPriorities: ['engagement'],
  growthPriorityOther: '',
  nickname: '플레이메이커쌤',
  createdAt: '2026-08-03T00:00:00.000Z',
  updatedAt: '2026-08-03T00:00:00.000Z',
}

describe('Front120 entry-flow guardrails', () => {
  it('uses five school choices without the removed other option', () => {
    expect(SCHOOL_LEVEL_OPTIONS.map((option) => option.label)).toEqual(['유아', '초등', '중등', '고등', '특수'])
  })

  it('uses exactly ten regional choices without Jeju', () => {
    expect(REGION_OPTIONS).toHaveLength(10)
    expect(REGION_OPTIONS.some((option) => option.label.includes('제주'))).toBe(false)
  })

  it('restores the nickname and constrains it to the safe UI length', () => {
    const profile = validateProfile({ ...validProfile, nickname: '  모험가플레이메이커선생님123456  ' })
    expect(profile?.nickname).toBe('모험가플레이메이커선생님123456'.slice(0, 16))
  })

  it('migrates existing special and regional selections into the new preparation options', () => {
    const profile = validateProfile({ ...validProfile, schoolLevel: 'special-other', region: 'busan' })
    expect(profile).toMatchObject({ schoolLevel: 'special', region: 'busan-ulsan-gyeongnam' })
  })

  it('enables BGM by default for a first-time journey without overriding restored preferences', () => {
    expect(createJourneyState().audio).toEqual({ bgmEnabled: true, bgmVolume: .28, sfxEnabled: false })
  })
})
