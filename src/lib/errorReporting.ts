import * as Sentry from '@sentry/react'

/** Optional: stays fully inactive until VITE_SENTRY_DSN is configured (a Sentry project
 *  has to be created in their console first — nothing here can do that). Scoped to
 *  production only, no session replay/tracing, and PII is never attached — this is meant
 *  to answer "did anything crash today", not to collect what a visitor typed. */
export function initErrorReporting() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn || !import.meta.env.PROD) return
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_BUILD_SHA,
    /* Sentry 11 replaced `sendDefaultPii` with `dataCollection`, and an unset
       `dataCollection` now collects MORE (user info, cookies, request bodies) than v10's
       `sendDefaultPii: false` did. This spells out v10's restrictive baseline so the
       privacy policy's "no personal data attached" stays true — never leave it unset. */
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: {
        request: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
        response: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
      },
      httpBodies: [],
      urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
      genAI: { inputs: false, outputs: false },
      databaseQueryData: false,
      queues: false,
      graphQL: { document: false, variables: false },
    },
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
}

export function reportError(error: unknown) {
  Sentry.captureException(error)
}
