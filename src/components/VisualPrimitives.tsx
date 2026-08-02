import type { ReactNode } from 'react'

export type IconName = 'clock' | 'spark' | 'gamepad' | 'arrow' | 'music' | 'speaker' | 'chevron' | 'close' | 'edit' | 'reset' | 'check' | 'school' | 'career' | 'region' | 'leaf' | 'notebook' | 'share'

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  const paths: Record<IconName, ReactNode> = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    spark: <path d="m12 2 1.8 7.1L21 12l-7.2 2.1L12 22l-2-7.9L3 12l7-2.9L12 2Z" />,
    gamepad: <><path d="M7 8h10c2.4 0 4 2.4 4 5.2 0 2.7-1.3 4.8-3 4.8-1.2 0-2.2-1.1-3.4-2H9.4c-1.2.9-2.2 2-3.4 2-1.7 0-3-2.1-3-4.8C3 10.4 4.6 8 7 8Z" /><path d="M7 12v4M5 14h4M16.5 13.5h.01M18.5 15.5h.01" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    speaker: <><path d="M5 10v4h3l4 3V7l-4 3H5Z" /><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    edit: <><path d="m4 16.5-.7 4.2 4.2-.7L19 8.5 15.5 5 4 16.5Z" /><path d="m13.8 6.8 3.5 3.5" /></>,
    reset: <><path d="M4 4v5h5" /><path d="M5.5 15a7.5 7.5 0 1 0 .8-7" /></>,
    check: <path d="m5 12 4.3 4.3L19 6.8" />,
    school: <><path d="m3 10 9-6 9 6v9H3v-9Z" /><path d="M7 19v-5h10v5M9 10h.01M12 10h.01M15 10h.01" /></>,
    career: <><path d="M4 8h16v11H4z" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16M10 13v2h4v-2" /></>,
    region: <><path d="M20 10c0 5-8 10-8 10S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    leaf: <path d="M20 4C10 4 4 8.2 4 15c0 2.3 1.7 4 4.1 4C15 19 20 11.4 20 4ZM5 19c2.2-4.4 5.7-7.5 10.3-9.3" />,
    notebook: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v18M12 8h4M12 12h4M12 16h3" /></>,
    share: <><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

export function CompassSeal({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="31" fill="rgba(11,42,36,.86)" stroke="#d8b865" strokeWidth="2" />
      <circle cx="36" cy="36" r="24" fill="none" stroke="#e7cf82" strokeOpacity=".7" />
      <path d="m36 12 5.3 18.7L60 36l-18.7 5.3L36 60l-5.3-18.7L12 36l18.7-5.3L36 12Z" fill="#d8efcc" stroke="#e7cf82" strokeWidth="1.4" />
      <path d="m36 20 2.8 13.2L52 36l-13.2 2.8L36 52l-2.8-13.2L20 36l13.2-2.8L36 20Z" fill="#3c8272" />
      <circle cx="36" cy="36" r="4" fill="#f7e6a0" />
    </svg>
  )
}

export function LogoSlot() {
  return (
    <div className="logo-slot" aria-label="로고 교체 영역" title="최종 로고 준비 중">
      <span className="logo-slot__mark" aria-hidden="true" />
    </div>
  )
}
