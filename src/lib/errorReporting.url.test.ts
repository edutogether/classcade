import { describe, it, expect, vi } from 'vitest'
import * as Sentry from '@sentry/react'

/* A visitor's page URL carries query values (shared-result `type`, device mode, …). Sentry attaches
   the current URL to every error event, so this pins that neither the query nor the fragment is
   ever sent. Kept in its own file: the Sentry transport caches the first `fetch` it sees, so a
   second init in the same module registry would never reach this test's stub. */
describe('initErrorReporting URL privacy', () => {
  it('never sends the page URL query or fragment (result type, shared-link values) with an error', async () => {
    const bodies: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: { body?: unknown }) => {
      bodies.push(String(init?.body))
      return new Response('{}', { status: 200 })
    }))
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_SENTRY_DSN', 'https://examplePublicKey@o0.ingest.us.sentry.io/0')
    window.history.pushState({}, '', '/?type=ISFJ&probeparam=zzz-query-value#zzz-fragment-value')

    const { initErrorReporting, reportError } = await import('./errorReporting')
    initErrorReporting()
    reportError(new Error('query-leak probe'))
    await Sentry.flush(3000)
    await Sentry.close(1000)

    const envelope = bodies.join('\n')
    expect(envelope).toContain('query-leak probe')
    expect(envelope).not.toContain('ISFJ')
    expect(envelope).not.toContain('zzz-query-value')
    expect(envelope).not.toContain('zzz-fragment-value')
  })
})
