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
    sendDefaultPii: false,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
}

export function reportError(error: unknown) {
  Sentry.captureException(error)
}
