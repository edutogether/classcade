import { useLayoutEffect, useRef } from 'react'

/** Keeps `value` readable via `.current` without putting it in an effect's dependency
 *  array — several interlude timers in this app intentionally exclude a fresh-every-render
 *  callback from their deps so an unrelated re-render can't restart the timer (see call
 *  sites). Assigning `ref.current = value` directly during render is what
 *  `react-hooks/refs` (eslint-plugin-react-hooks 7) flags; this does the same assignment
 *  in a layout effect that runs before paint on every render, so any effect declared after
 *  this hook in the same component still reads the latest value within the same commit. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
