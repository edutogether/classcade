import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PairingScene } from './PairingScreens'
import { createJourneyState } from '../journey/journeyState'
import type { JourneySceneProps } from '../journey/components/SceneFrame'
import type { Profile } from '../../lib/storage'

/* PairingScreens.tsx is LOCKED (see CLAUDE.md) — its two react-hooks/set-state-in-effect
   fixes must not change observable behavior: (1) the code-issuance effect is now written
   as an inline promise chain instead of calling create(), guarded by issuingRef against
   Strict Mode's dev-only double-invocation, and (2) the watchPairing catch was removed
   because watchPairing itself now routes a synchronous setup failure to onError (see
   firestorePairingStore.test.ts for that half). This file proves the transitions
   PairingScreens.tsx itself is responsible for.
   The mock store below duplicates MemoryPairingStore's trivial create() logic rather than
   importing it, because vi.mock factories are hoisted above top-level imports; `counters`
   is declared via vi.hoisted for the same reason. */

const counters = vi.hoisted(() => ({ createCalls: 0 }))
let watchPairingImpl: typeof import('./firestorePairingStore').watchPairing = () => () => {}

vi.mock('./firestorePairingStore', () => {
  class MockFirestorePairingStore {
    private records = new Map<string, unknown>()
    async create(record: { code: string }) {
      counters.createCalls += 1
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
  counters.createCalls = 0
})

describe('PairingScene (LOCKED — behavior must not change)', () => {
  it('issues a code on a fresh mount and reaches waiting status', async () => {
    render(<PairingScene {...baseProps()} profile={profile()} journeyId="journey-1" onBack={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('노트북의 응답을 기다리는 중…')).toBeInTheDocument())
    expect(screen.getByLabelText(/연결 코드/)).toHaveTextContent(/\d{3} \d{3}/)
  })

  it('reaches network_error when watchPairing reports a setup failure via onError', async () => {
    /* watchPairing's own contract (proven separately in firestorePairingStore.test.ts) is
       that it never throws — it calls onError instead. This proves PairingScreens.tsx's
       side of that contract: it does nothing but forward onError into setStatus. */
    watchPairingImpl = (_code, _cb, onError) => { onError(); return () => {} }
    render(<PairingScene {...baseProps()} profile={profile()} journeyId="journey-2" onBack={vi.fn()} />)
    await waitFor(() => expect(screen.getByText('연결 상태를 확인하지 못했어요. 네트워크를 확인해 주세요.')).toBeInTheDocument())
  })

  it('issues exactly one code under Strict Mode double-invocation of effects', async () => {
    render(<StrictMode><PairingScene {...baseProps()} profile={profile()} journeyId="journey-3" onBack={vi.fn()} /></StrictMode>)
    await waitFor(() => expect(screen.getByText('노트북의 응답을 기다리는 중…')).toBeInTheDocument())
    expect(counters.createCalls).toBe(1)
  })
})
