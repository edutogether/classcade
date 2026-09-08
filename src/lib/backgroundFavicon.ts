const COLOUR = './favicon-32x32.png'
const GRAYSCALE = './favicon-32x32-gray.png'

/**
 * Dims the tab's favicon while the tab sits in the background. Lives here rather than as
 * an inline <script> in index.html because the CSP sets `script-src 'self'` with no hash
 * or nonce — an inline script is blocked outright, which silently killed this swap.
 */
export function watchBackgroundFavicon() {
  const icon = document.getElementById('favicon')
  if (!(icon instanceof HTMLLinkElement)) return
  document.addEventListener('visibilitychange', () => {
    icon.href = document.hidden ? GRAYSCALE : COLOUR
  })
}
