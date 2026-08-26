import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

/* vite.config.ts's test block doesn't set `globals: true`, so @testing-library/react's
   own auto-cleanup (which relies on a global `afterEach`) never registers — without this,
   every render() in a test file stacks its DOM onto the previous test's leftover tree
   instead of replacing it, and later tests in the same file see both. */
afterEach(cleanup)
