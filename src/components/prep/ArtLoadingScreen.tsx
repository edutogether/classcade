import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { loadingMaster, loadingMasterMobile } from './prepAssets'

/* The gold bar frame's inner slot and the empty space around it where text used to be
   baked into the art, pixel-scanned from loading-master-v6.png. If the loading art is
   ever replaced, re-scan and update ONLY these numbers. */
const ART = { width: 1672, height: 941, slotX: 694, slotY: 531, slotW: 344, slotH: 11 }
const TEXT_X = 866
/* Dots sit between the bar and the subtitle, not above the bar. */
const TEXT = {
  title: { x: TEXT_X, y: 475 },
  dots: { x: TEXT_X, y: 563 },
  subtitle: { x: TEXT_X, y: 589 },
}

/* Portrait recomposition for mobile (loading-master-mobile.webp) — same recipe as ART/
   TEXT above, pixel-scanned from that image instead. The desktop image is wide (16:9)
   and its bar frame/logo run too thin and off-center once cover-fit stretches it to
   fill a phone's tall aspect ratio, so mobile gets its own image and its own coordinate
   map rather than reusing ART at a different scale. */
const ART_MOBILE = { width: 941, height: 1672, slotX: 285, slotY: 936, slotW: 372, slotH: 12 }
const TEXT_MOBILE_X = 470
const TEXT_MOBILE = {
  title: { x: TEXT_MOBILE_X, y: 872 },
  dots: { x: TEXT_MOBILE_X, y: 964 },
  subtitle: { x: TEXT_MOBILE_X, y: 990 },
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
  const [isMobile, setIsMobile] = useState(false)
  useLayoutEffect(() => {
    const measure = () => {
      const el = mainRef.current
      if (!el) return
      const mobile = window.innerWidth <= 700
      setIsMobile(mobile)
      const art = mobile ? ART_MOBILE : ART
      const text = mobile ? TEXT_MOBILE : TEXT
      const cw = el.clientWidth
      const ch = el.clientHeight
      const scale = Math.max(cw / art.width, ch / art.height)
      const offsetX = (cw - art.width * scale) / 2
      const offsetY = (ch - art.height * scale) / 2
      const toScreen = (x: number, y: number) => ({ left: offsetX + x * scale, top: offsetY + y * scale })
      setGeo({
        scale,
        slot: { left: offsetX + art.slotX * scale, top: offsetY + art.slotY * scale, width: art.slotW * scale, height: art.slotH * scale },
        text: { title: toScreen(text.title.x, text.title.y), subtitle: toScreen(text.subtitle.x, text.subtitle.y), dots: toScreen(text.dots.x, text.dots.y) },
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <main ref={mainRef} className={`entry-loading entry-loading--art entry-loading--cover ${className}`} aria-live="polite">
      <img className="entry-loading__art" src={isMobile ? loadingMasterMobile : loadingMaster} alt="" aria-hidden="true" />
      {geo && (
        <>
          <i
            className="entry-loading__fill"
            style={{ height: geo.slot.height, left: geo.slot.left, top: geo.slot.top, width: (geo.slot.width * Math.min(100, Math.max(0, progress))) / 100 }}
            aria-hidden="true"
          />
          <p className="entry-loading__live-title" style={{ left: geo.text.title.left, top: geo.text.title.top, fontSize: (isMobile ? 46 : 34) * geo.scale } as CSSProperties} aria-hidden="true">{title}</p>
          <div className="entry-loading__live-dots" style={{ left: geo.text.dots.left, top: geo.text.dots.top, gap: 10 * geo.scale } as CSSProperties} aria-hidden="true">
            <i style={{ width: 7 * geo.scale, height: 7 * geo.scale }} />
            <i style={{ width: 7 * geo.scale, height: 7 * geo.scale }} />
            <i style={{ width: 7 * geo.scale, height: 7 * geo.scale }} />
          </div>
          <p className="entry-loading__live-subtitle" style={{ left: geo.text.subtitle.left, top: geo.text.subtitle.top, fontSize: (isMobile ? 26 : 18) * geo.scale } as CSSProperties} aria-hidden="true">{subtitle}</p>
        </>
      )}
      <p className="sr-only" role="status">{title} {progress}%</p>
      {children}
    </main>
  )
}
