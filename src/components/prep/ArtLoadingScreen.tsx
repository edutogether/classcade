import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { loadingMaster } from './prepAssets'

/* The gold bar frame's inner slot and the empty space around it where text used to be
   baked into the art, pixel-scanned from loading-master-v6.png. If the loading art is
   ever replaced, re-scan and update ONLY these numbers. */
const ART = { width: 1672, height: 941, slotX: 694, slotY: 531, slotW: 344, slotH: 11 }
const TEXT_X = 866
/* Dots sit just above the bar and the subtitle just below it. The subtitle line's own
   leading eats into its box, so it needs a bigger art-px offset than the dots' tight
   circle box to read as an equally-sized visible gap on both sides of the bar. */
const TEXT = {
  title: { x: TEXT_X, y: 455 },
  dots: { x: TEXT_X, y: 512 },
  subtitle: { x: TEXT_X, y: 574 },
}

type SlotRect = { left: number; top: number; width: number; height: number }
type Geometry = { scale: number; slot: SlotRect; text: Record<keyof typeof TEXT, { left: number; top: number }> }

/** Full-bleed loading scene shared by the prep flow and the journey interludes.
 *  The art keeps its bar frame and logo but carries no text (baked Korean text always
 *  rendered soft/blurry) — the bar fill AND every line of copy are live DOM, positioned
 *  by computing where the art's own cover-fit places its pixel coordinates, so both
 *  track the image exactly at any viewport ratio and size with it on resize. */
export function ArtLoadingScreen({ progress, title, subtitle, className = '', children }: {
  progress: number; title: string; subtitle: string; className?: string; children?: ReactNode
}) {
  const mainRef = useRef<HTMLElement>(null)
  const [geo, setGeo] = useState<Geometry | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const el = mainRef.current
      if (!el) return
      const cw = el.clientWidth
      const ch = el.clientHeight
      const scale = Math.max(cw / ART.width, ch / ART.height)
      const offsetX = (cw - ART.width * scale) / 2
      const offsetY = (ch - ART.height * scale) / 2
      const toScreen = (x: number, y: number) => ({ left: offsetX + x * scale, top: offsetY + y * scale })
      setGeo({
        scale,
        slot: { left: offsetX + ART.slotX * scale, top: offsetY + ART.slotY * scale, width: ART.slotW * scale, height: ART.slotH * scale },
        text: { title: toScreen(TEXT.title.x, TEXT.title.y), subtitle: toScreen(TEXT.subtitle.x, TEXT.subtitle.y), dots: toScreen(TEXT.dots.x, TEXT.dots.y) },
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <main ref={mainRef} className={`entry-loading entry-loading--art entry-loading--cover ${className}`} aria-live="polite">
      <img className="entry-loading__art" src={loadingMaster} alt="" aria-hidden="true" />
      {geo && (
        <>
          <i
            className="entry-loading__fill"
            style={{ height: geo.slot.height, left: geo.slot.left, top: geo.slot.top, width: (geo.slot.width * Math.min(100, Math.max(0, progress))) / 100 }}
            aria-hidden="true"
          />
          <p className="entry-loading__live-title" style={{ left: geo.text.title.left, top: geo.text.title.top, fontSize: 34 * geo.scale } as CSSProperties} aria-hidden="true">{title}</p>
          <div className="entry-loading__live-dots" style={{ left: geo.text.dots.left, top: geo.text.dots.top, gap: 10 * geo.scale } as CSSProperties} aria-hidden="true">
            <i style={{ width: 7 * geo.scale, height: 7 * geo.scale }} />
            <i style={{ width: 7 * geo.scale, height: 7 * geo.scale }} />
            <i style={{ width: 7 * geo.scale, height: 7 * geo.scale }} />
          </div>
          <p className="entry-loading__live-subtitle" style={{ left: geo.text.subtitle.left, top: geo.text.subtitle.top, fontSize: 18 * geo.scale } as CSSProperties} aria-hidden="true">{subtitle}</p>
        </>
      )}
      <p className="sr-only" role="status">{title} {progress}%</p>
      {children}
    </main>
  )
}
