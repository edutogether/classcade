import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary'
import { initErrorReporting, reportError } from './lib/errorReporting'
import './index.css'

initErrorReporting()

window.addEventListener('unhandledrejection', (event) => reportError(event.reason))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Top-level boundary: previously ChunkErrorBoundary only wrapped the lazy-loaded
        JourneyApp, so a render exception anywhere else (AdventurePrepScreen, the screen
        every visitor sees first) unmounted the whole tree with no recovery UI — a blank
        screen after the boot splash had already been removed. */}
    <ChunkErrorBoundary>
      <App />
    </ChunkErrorBoundary>
  </StrictMode>,
)
