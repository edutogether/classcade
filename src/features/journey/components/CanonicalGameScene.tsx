import type { CSSProperties, ReactNode } from 'react'

export type CanonicalGameScreen = 'conditions' | 'concepts' | 'candidates' | 'result'

type CanonicalGameSceneProps = {
  screen: CanonicalGameScreen
  art: string
  children: ReactNode
  className?: string
}

/**
 * The four supplied masters are coordinate systems, not screenshot-shaped UI.
 * Interactive controls are deliberately placed over their matching painted
 * parchment/card areas, so the image stays scenery while every control remains
 * a real semantic DOM element.
 */
export function CanonicalGameScene({ screen, art, children, className = '' }: CanonicalGameSceneProps) {
  return <section className={`canonical-game-scene canonical-game-scene--${screen} ${className}`} data-canonical-screen={screen}>
    <img className="canonical-game-scene__master" src={art} alt="" />
    <div className="canonical-game-scene__hotspots">{children}</div>
  </section>
}

export function CanonicalHotspot({ children, className = '', selected = false, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button {...props} className={`canonical-hotspot ${selected ? 'is-selected' : ''} ${className}`} style={style as CSSProperties}>{children}</button>
}

export function ScreenReaderText({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}

export function CanonicalMobileHero({ art, screen, eyebrow, title, description }: { art: string; screen: CanonicalGameScreen; eyebrow: string; title: string; description?: string }) {
  return <header className={`canonical-mobile-hero canonical-mobile-hero--${screen}`} style={{ backgroundImage: `url(${art})` }}>
    <div><p>{eyebrow}</p><h1>{title}</h1>{description && <span>{description}</span>}</div>
  </header>
}
