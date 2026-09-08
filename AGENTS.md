# CLASSCADE Agent Instructions

## Mission

Build **같교오락실 / CLASSCADE**, an immersive educational adventure for teachers and classroom demonstrations.

The product journey is:

1. Enter through `edutogether.github.io/classcade/`
2. Complete Classroom NBTI on mobile or PC
3. Grow a small animated 2D character through choices
4. Reveal a high-fidelity final character illustration and result, with classroom play recommendations matched to it

**(2026-08-27 정정)** 원래 계획에 있던 5~7단계("노트북으로 이어하기 → 우리 반 게임 만들기 →
Story 공유")는 지금 존재하지 않는다. 게임 만들기 서브시스템은 대표 결정으로 코드·데이터·아트
전부 완전히 삭제됐다(나중에 다시 만들 수도 있으나 시기 미정). 노트북 이어하기(페어링)는 이
결정과 별개로 여전히 보류 중이며, 이 저장소 `CLAUDE.md`의 LOCKED 항목이 그 상태를 관리한다.
지금 여정은 4번(결과 확인 + 놀이 추천)에서 끝난다.

## Working on this repo — read this first (2026-09-08 추가)

이 저장소는 클로드 외의 도구(Codex 등)로도 작업한다. 도구와 무관하게 아래는 그대로 적용된다.

**명령**

| 목적 | 명령 |
|---|---|
| 테스트 | `npm run test` (vitest + `tsc -b --noEmit`) |
| 린트 | `npm run lint` |
| 로컬 실행 | `npm run dev` |
| 빌드 | `npm run build` |
| Firestore 규칙 테스트 | `npm run rules:test` (JDK 21 필요) |

**배포**: `main`에 push하면 `.github/workflows/deploy-pages.yml`이 GitHub Pages로 자동 배포한다(`edutogether.github.io/classcade`). 별도 배포 명령은 없다.

**절대 하면 안 되는 것** — 자세한 근거는 `.claude/rules/app.md`, 최신 상태는 `CLAUDE.md`.

1. **`edutogether.kr` 커스텀 도메인을 이 저장소에 설정하지 않는다.** 2026-08-13에 `edutogether/portal`로 이전됐다. CNAME 파일이 들어가면 포털이 즉시 깨진다(워크플로에 방어 가드 있음, 가드 삭제도 금지).
2. **페어링 서브시스템(`src/features/pairing/`)은 보류(아카이브)된 기능이다.** 도달 불가한 것은 버그가 아니라 확정된 결정이다 — 결함으로 보고하거나 삭제를 제안하지 않는다.
3. **`index.html`의 CSP에서 `www.google.com`/`www.gstatic.com`(script-src·frame-src)과 `*.ingest.us.sentry.io`(connect-src)를 빼지 않는다.** 앞의 것을 빼면 App Check 토큰 발급이 막혀 페어링이 완전히 차단되고(Firestore가 Enforced), 뒤의 것을 빼면 오류 모니터링이 조용히 죽는다. 둘 다 실제로 발생했던 사고다.
4. **PC/모바일 화면의 시각 디자인(배치·색·간격·아트)은 임의로 바꾸지 않는다.** 소유자가 직접 다듬는 영역이다. 동작 버그와 접근성 결함은 정상적으로 고친다.

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

~~No backend, Firebase, QR pairing, Story sharing, or full classroom-game flow may be implemented before the visual vertical slice is approved~~ — **(2026-09-08 정정)** 이 순서 제약은 개발 극초반 계획이고 이미 지나갔다. 시각 슬라이스는 승인됐고 Firebase는 구현되어 라이브다. 현재 상태를 현재 규칙으로 오해하지 말 것 — 페어링은 보류(아카이브), 게임 만들기는 완전 삭제이며 둘 다 "아직 구현 전"이 아니다.

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

## Golden-path priority — 2026-08-02 (2026-09-08 정정 — 아래 골든패스 서술은 현행이 아님)

**정정**: 아래 문단이 말하는 "result-dependent second game", "completion", "sharing"은 게임 만들기 서브시스템이며 2026-08-27에 코드·데이터·아트가 전부 삭제됐다(위 Mission 섹션 참고). 현재 골든패스는 **프렙 1~4 → 닉네임 → 로딩 → 시작 → NBTI 16문항 → 결과 → 놀이 추천**에서 끝나며, 전부 구현·배포되어 실사용 중이다.

~~The user has approved a local, end-to-end golden-path implementation: preparation, NBTI start and questions, provisional result, the result-dependent second game, accessible shake fallback, completion, and sharing.~~ Keep the existing visual contract and entry/storage behavior, but make every transition work before adding new art directions or backend integrations. Any result or NBTI label must be clearly presented as provisional exploration rather than a scientific diagnosis.
