# CLASSCADE Agent Instructions

## Mission

Build **같교오락실 / CLASSCADE**, an immersive educational adventure for teachers and classroom demonstrations.

The product journey is:

1. Enter through `edutogether.github.io/classcade/`
2. Complete Classroom NBTI on mobile or PC
3. Grow a small animated 2D character through choices
4. Reveal a high-fidelity final character illustration and result
5. Continue to a laptop through QR or a six-digit code
6. Create a classroom game
7. Generate and save a shareable Story result

## Visual source of truth

The user-approved start, question, and result mockups are **minimum implementation quality**, not mood references.

The implementation must preserve:

- overall composition and visual density
- the balance between interface and large illustration
- cinematic lighting, shadows, depth, and atmosphere
- fantasy classroom-adventure worldbuilding
- premium Korean typography and spacing
- the strong presence of the character
- tactile, game-like choices rather than generic form controls
- the character-building panel and progression feeling
- the result screen as a collectible finale

Allowed changes are limited to:

- final logo and brand marks
- navigation labels and menu count
- actual NBTI questions, result names, descriptions, and codes
- functional copy and accessibility labels
- responsive rearrangement that preserves equivalent quality

Do not simplify the visual direction for implementation convenience.

## Hard rejections

The following are immediate failures:

- white SaaS page with rounded cards
- emoji or generic icon used as the main character
- generic survey or onboarding layout
- one background image used as a fake full-screen screenshot
- shrinking or removing the main illustration because responsive work is difficult
- implementing all screens first and planning to add art later
- replacing approved scenes with placeholders and calling the screen complete
- reducing the mobile experience to an ordinary form
- copying identifiable characters, UI, music, or assets from existing game franchises

## Required implementation method

Use real layered web UI:

- semantic HTML and accessible controls
- responsive CSS
- separate background, foreground, character, equipment, particles, and UI layers
- optimized WebP/AVIF/PNG/WebM assets as appropriate
- sprite sheets or equivalent for the small 2D character
- user-initiated audio start for BGM and effects
- state-driven character growth

Do not flatten the entire screen into one image.

## Approval gate

Work one visual scene at a time.

1. Implement only the requested scene.
2. Run tests, lint, and production build.
3. Capture the actual browser at the required desktop and mobile sizes.
4. Compare it against the approved mockup.
5. Report visible differences honestly.
6. Stop and wait for user visual approval.
7. Proceed to the next scene only after explicit approval.

For the first vertical slice, the order is:

1. Start scene
2. Main question and growing 2D character
3. Result reveal

No backend, Firebase, QR pairing, Story sharing, or full classroom-game flow may be implemented before the visual vertical slice is approved, unless the user explicitly changes this order.

## Initial target viewports

- Desktop primary: 1920 × 1080
- Laptop validation: 1366 × 768
- Tablet validation: 1024 × 768
- Mobile primary: 390 × 844

All primary actions and essential information must remain visible and usable.

## Quality checks

Before presenting a scene:

- no horizontal overflow
- no clipped Korean text
- no distorted illustration
- keyboard focus is visible
- reduced-motion mode remains usable
- audio is optional and muted until user interaction
- asset loading failures have a graceful fallback
- production build passes
- screenshots are from the real implementation, not design exports

## Git workflow (2026-08-26 정정 — 아래는 개발 극초반에 쓴 것으로 지금 실제 방식과 다름)

**실제로는 `main`에서 직접 작업하고, push까지 자율 진행한다** — feature 브랜치·draft PR·머지 승인 절차는 초기 계획이었고 채택되지 않았다. 최신 워크플로우·승인 절차는 이 폴더의 `CLAUDE.md`와 최상위 `D:\Projects\CLAUDE.md`를 따른다 — 충돌 시 그쪽이 우선.

- do not push secrets or `.env` files
- keep commits small and descriptive

## Current status (2026-08-26 정정)

~~The repository is initialized.~~ — 이건 개발 극초반(2026-08-02) 시점 기록이다. 지금은 골든패스 전체가 구현되어 실제 라이브 서비스 중이다(`edutogether.github.io/classcade`). 위 "Mission"·"Visual source of truth"·"Hard rejections" 섹션은 여전히 제품 설계 원칙으로 유효하지만, 이 섹션과 아래 진행상황 서술은 더 이상 현재 상태가 아니다 — 최신 상태는 `CLAUDE.md` 참고.

## Golden-path priority — 2026-08-02

The user has approved a local, end-to-end golden-path implementation: preparation, NBTI start and questions, provisional result, the result-dependent second game, accessible shake fallback, completion, and sharing. Keep the existing visual contract and entry/storage behavior, but make every transition work before adding new art directions or backend integrations. Any result or NBTI label must be clearly presented as provisional exploration rather than a scientific diagnosis.
