import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PairingScene } from './PairingScreens'
import { createJourneyState } from '../journey/journeyState'
import type { JourneySceneProps } from '../journey/components/SceneFrame'
import type { Profile } from '../../lib/storage'

/* PairingScreens.tsx is LOCKED (see CLAUDE.md) — its two react-hooks/set-state-in-effect
   fixes (deferring create()'s and the watchPairing catch's setState by one microtask) must
   not change observable behavior. This proves the exact two transitions those fixes touch:
   a fresh mount still issues a code and reaches 'waiting', and a synchronous watchPairing
   failure still reaches 'network_error' — the same end states as before the fix, just
   arrived at one microtask later (imperceptible).
   The mock store below duplicates MemoryPairingStore's trivial create() logic rather than
   importing it, because vi.mock factories are hoisted above top-level imports. */

let watchPairingImpl: typeof import('./firestorePairingStore').watchPairing = () => () => {}

vi.mock('./firestorePairingStore', () => {
  class MockFirestorePairingStore {
    private records = new Map<string, unknown>()
    async create(record: { code: string }) {
      if (this.records.has(record.code)) return 'collision' as const
      this.records.set(record.code, record)
      return 'created' as const
    }
    async revoke() { return 'not_active' as const }
    async consume() { return { status: 'invalid' as const } }
  }
  return {
    FirestorePairingStore: MockFirestorePairingStore,
    watchPairing: (...args: Parameters<typeof import('./firestorePairingStore').watchPairing>) => watchPairingImpl(...args),
  }
})

function profile(): Profile {
  const now = new Date().toISOString()
  return { version: 1, schoolLevel: 'elementary', careerRange: '1-5', region: 'seoul', growthPriorities: ['engagement'], growthPriorityOther: '', nickname: '테스트교사', createdAt: now, updatedAt: now }
}

function baseProps(): JourneySceneProps {
  return { state: { ...createJourneyState('nbti_result'), resultCode: 'P00' }, onAction: vi.fn(), onTeacherOpen: vi.fn(), teacherTriggerRef: { current: null }, notice: '' }
}

beforeEach(() => {
  localStorage.clear()
  watchPairingImpl = () => () => {}
})

describe('PairingScene (LOCKED — behavior must not change)', () => {
  it('issues a code on a fresh mount and reaches waiting status', async () => {
    render(<PairingScene {...baseProps()} profile={profile()} journeyId="journey-1" onBack={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('노트북의 응답을 기다리는 중…')).toBeInTheDocument())
    expect(screen.getByLabelText(/연결 코드/)).toHaveTextContent(/\d{3} \d{3}/)
  })

  it('reaches network_error when watchPairing throws synchronously', async () => {
    watchPairingImpl = () => { throw new Error('boom') }
    render(<PairingScene {...baseProps()} profile={profile()} journeyId="journey-2" onBack={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('연결 상태를 확인하지 못했어요. 네트워크를 확인해 주세요.')).toBeInTheDocument())
  })
})
