import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ResultRecommendations } from './ResultRecommendations'
import { CLASSCADE_VIDEO_CATALOG } from '../../../data/completionExperience'
import { createJourneyState } from '../journeyState'

/* QR generation is an async canvas round-trip that jsdom cannot do; the picking logic
   under test does not depend on it. */
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,stub')) } }))

const state = { ...createJourneyState('nbti_result'), resultCode: 'P00' }

function renderFor(mbti: string) {
  render(<ResultRecommendations state={state} mbti={mbti} />)
}

function shownTitles() {
  return screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
}

beforeEach(() => vi.clearAllMocks())

describe('ResultRecommendations', () => {
  it('shows exactly two recommendations for a known MBTI type', async () => {
    renderFor('ESTJ')
    await waitFor(() => expect(shownTitles()).toHaveLength(2))
  })

  it('gives every one of the sixteen types two distinct published videos', () => {
    const types = ['ESTJ', 'ESTP', 'ESFJ', 'ESFP', 'ISTJ', 'ISTP', 'ISFJ', 'ISFP', 'ENTJ', 'ENTP', 'ENFJ', 'ENFP', 'INTJ', 'INTP', 'INFJ', 'INFP']
    for (const type of types) {
      const { unmount } = render(<ResultRecommendations state={state} mbti={type} />)
      const titles = shownTitles()
      expect(titles, `${type} should show two videos`).toHaveLength(2)
      expect(new Set(titles).size, `${type} should not repeat a video`).toBe(2)
      unmount()
    }
  })

  /* The fixed per-type picks are the normal path; the tag ranking exists only to backfill
     if a pick is ever unpublished. Without the backfill the result screen would silently
     render with one card instead of two. */
  it('backfills from the tag ranking when a fixed pick is unpublished', async () => {
    const pick = CLASSCADE_VIDEO_CATALOG.find((video) => video.id === 'Xg1H8VxHHQw')
    expect(pick, 'fixture assumption: this ESTJ pick exists in the catalog').toBeDefined()
    const mutable = pick as { published: boolean; title: string }
    const unpublishedTitle = mutable.title
    mutable.published = false

    try {
      renderFor('ESTJ')
      await waitFor(() => expect(shownTitles()).toHaveLength(2))
      // The slot was refilled by a different video, not left short or filled with the
      // unpublished one.
      expect(shownTitles()).not.toContain(unpublishedTitle)
    } finally {
      mutable.published = true
    }
  })

  it('still fills two slots for an unknown MBTI string instead of rendering an empty panel', async () => {
    renderFor('NOPE')
    await waitFor(() => expect(shownTitles()).toHaveLength(2))
  })

  it('links each recommendation straight to YouTube in a new tab, without a referrer', async () => {
    renderFor('INFP')
    await waitFor(() => expect(shownTitles()).toHaveLength(2))

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('href', expect.stringContaining('https://www.youtube.com/watch?v='))
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    }
  })
})
