import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { loadingMaster } from './prepAssets'

/* The gold bar frame's inner slot, pixel-scanned from loading-master-v5.png.
   If the loading art is ever replaced, re-scan and update ONLY these numbers. */
const ART = { width: 1672, height: 941, slotX: 687, slotY: 610, slotW: 342, slotH: 11 }

type SlotRect = { left: number; top: number; width: number; height: number }

/** Full-bleed loading scene shared by the prep flow and the journey interludes.
 *  The art keeps its baked text and bar frame and cover-fills EVERY viewport ratio
 *  (no letterbox bars, no blurred backdrop layer); the live fill finds the frame by
 *  computing where the cover fit places it, and follows it on resize. */
export function ArtLoadingScreen({ progress, label, className = '', children }: {
  progress: number; label: string; className?: string; children?: ReactNode
}) {
  const mainRef = useRef<HTMLElement>(null)
  const [slot, setSlot] = useState<SlotRect | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const el = mainRef.current
      if (!el) return
      const cw = el.clientWidth
      const ch = el.clientHeight
      const scale = Math.max(cw / ART.width, ch / ART.height)
      const offsetX = (cw - ART.width * scale) / 2
      const offsetY = (ch - ART.height * scale) / 2
      setSlot({
        left: offsetX + ART.slotX * scale,
        top: offsetY + ART.slotY * scale,
        width: ART.slotW * scale,
        height: ART.slotH * scale,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <main ref={mainRef} className={`entry-loading entry-loading--art entry-loading--cover ${className}`} aria-live="polite">
      <img className="entry-loading__art" src={loadingMaster} alt="" aria-hidden="true" />
      {slot && (
        <i
          className="entry-loading__fill"
          style={{ height: slot.height, left: slot.left, top: slot.top, width: (slot.width * Math.min(100, Math.max(0, progress))) / 100 }}
          aria-hidden="true"
        />
      )}
      <p className="sr-only" role="status">{label} {progress}%</p>
      {children}
    </main>
  )
}
