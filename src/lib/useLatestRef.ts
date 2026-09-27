import { useLayoutEffect, useRef } from 'react'

/** Keeps `value` synced onto a real, settable ref without assigning `ref.current = value`
 *  directly during render (what `react-hooks/refs`, eslint-plugin-react-hooks 7, flags) —
 *  the assignment happens in a layout effect that runs before paint on every render, so any
 *  effect declared after this hook in the same component still reads the latest value
 *  within the same commit. Use this only when the ref is also WRITTEN to from elsewhere
 *  (an animation loop, a plain event handler) — a value that's only ever READ inside an
 *  effect should use `useEffectEvent` from 'react' instead, which needs no ref at all. */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}
