import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { PROFILE_STORAGE_KEY, JOURNEY_STATE_STORAGE_KEY } from './lib/storage'
import { createJourneyState } from './features/journey/journeyState'
import type { Profile } from './lib/storage'

function validProfile(): Profile {
  const now = new Date().toISOString()
  return {
    version: 1,
    schoolLevel: 'elementary',
    careerRange: '1-5',
    region: 'seoul',
    growthPriorities: ['engagement'],
    growthPriorityOther: '',
    nickname: '테스트교사',
    createdAt: now,
    updatedAt: now,
  }
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('App boot behavior', () => {
  it('renders the adventure-prep screen on a completely fresh session', () => {
    render(<App />)
    expect(screen.getByText('모험 준비')).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
  })

  it('restores a saved profile and journey state straight into the journey screen', async () => {
    window.sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(validProfile()))
    const state = { ...createJourneyState('nbti_result'), resultCode: 'P00' }
    window.sessionStorage.setItem(JOURNEY_STATE_STORAGE_KEY, JSON.stringify(state))

    render(<App />)

    expect(screen.queryByText('모험 준비')).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('.journey-header')).toBeInTheDocument())
  })

  it('routes a ?type= shared-result deep link straight to the journey screen with no saved profile', async () => {
    window.history.pushState({}, '', '/?type=ESTJ')

    render(<App />)

    expect(screen.queryByText('모험 준비')).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('.journey-header')).toBeInTheDocument())
  })

  it('discards a malformed stored journey state instead of crashing', () => {
    window.sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(validProfile()))
    window.sessionStorage.setItem(JOURNEY_STATE_STORAGE_KEY, '{not valid json')

    render(<App />)

    // Falls back to a fresh journey state safely; the corrupted key is discarded rather
    // than surfacing a crash or an unhandled exception during boot.
    expect(window.sessionStorage.getItem(JOURNEY_STATE_STORAGE_KEY)).toBeNull()
  })
})
