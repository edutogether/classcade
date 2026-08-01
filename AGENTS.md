# CLASSCADE Agent Instructions

## Mission

Build **같교오락실 / CLASSCADE**, an immersive educational adventure for teachers and classroom demonstrations.

The product journey is:

1. Enter through `edutogether.kr`
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

## Git workflow

- default branch: `main`
- work in a feature branch
- recommended first branch: `feature/nbti-visual-vertical-slice`
- do not push secrets or `.env` files
- keep commits small and descriptive
- do not merge to `main` without user approval
- use a draft pull request for review

## Current status

The repository is initialized. The next task is project foundation and a design specification for the first start scene. Do not implement the final visual scene until the user has reviewed and approved its detailed specification or updated mockup.
