// @vitest-environment-options { "url": "https://localhost/" }
import { describe, it, expect, vi } from 'vitest'
import * as Sentry from '@sentry/react'

/* Sentry 11 replaced `sendDefaultPii` with `dataCollection`, whose UNSET default collects
   more than v10's `sendDefaultPii: false` did — notably it asks Sentry's servers to infer
   and store the visitor's IP (`sdk.settings.infer_ip: 'auto'`). The privacy policy says no
   personal data is attached, so this pins the restrictive baseline: if someone removes or
   loosens `dataCollection` in errorReporting.ts, this fails. */
describe('initErrorReporting privacy baseline', () => {
  it('never lets Sentry infer the visitor IP and attaches no cookies or user', async () => {
    const bodies: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init?: { body?: unknown }) => {
      bodies.push(String(init?.body))
      return new Response('{}', { status: 200 })
    }))
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_SENTRY_DSN', 'https://examplePublicKey@o0.ingest.us.sentry.io/0')
    document.cookie = 'secret_session=abc123; Secure; SameSite=Strict'
    expect(document.cookie).toContain('secret_session')

    const { initErrorReporting, reportError } = await import('./errorReporting')
    initErrorReporting()
    reportError(new Error('privacy-baseline probe'))
    await Sentry.flush(3000)
    await Sentry.close(1000)

    const envelope = bodies.join('\n')
    const eventLine = envelope.split('\n').find((line) => line.startsWith('{') && line.includes('"exception"'))
    expect(eventLine).toBeDefined()
    const event = JSON.parse(eventLine as string)
    expect(event.sdk.settings.infer_ip).toBe('never')
    expect(event.user).toBeUndefined()
    expect(envelope).not.toContain('secret_session')
  })
})
