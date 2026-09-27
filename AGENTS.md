# CLASSCADE Agent Instructions

## Mission

Build **같교오락실 / CLASSCADE**, an immersive educational adventure for teachers and classroom demonstrations.

The product journey is:

1. Enter through `https://classcade.edutogether.kr`
2. Complete Classroom NBTI on mobile or PC
3. Grow a small animated 2D character through choices
4. Reveal a high-fidelity final character illustration and result, with classroom play recommendations matched to it

**(2026-08-27 정정)** 원래 계획에 있던 5~7단계("노트북으로 이어하기 → 우리 반 게임 만들기 →
Story 공유")는 지금 존재하지 않는다. 게임 만들기 서브시스템은 대표 결정으로 코드·데이터·아트
전부 완전히 삭제됐다(나중에 다시 만들 수도 있으나 시기 미정). 노트북 이어하기(페어링)는 이
결정과 별개로 여전히 보류 중이며, 이 저장소 `CLAUDE.md`의 LOCKED 항목이 그 상태를 관리한다.
지금 여정은 4번(결과 확인 + 놀이 추천)에서 끝난다.

## 조직 공통 규칙 — 다른 도구·클라우드에서도 (D:\Projects 헌법 요약)

이 저장소만 받아서 일하는 도구(Codex 클라우드, Claude Code 클라우드, 다른 기기)는 `D:\Projects`의 공통
문서를 못 본다. 그래서 꼭 지켜야 할 것을 여기 옮겨 둔다. 원본은 `817beatles/projects`의 `_shared/constitution.md`.

- **사람**: 최종 결정권자는 **Bumm님**. 모든 답·문서·커밋은 **한국어**, 호칭은 늘 "Bumm님".
- **앱 이름**은 정식 이름 하나로만: CLASSCADE · Poster Studio · Be a Googler · Voice Cinema · Portal ·
  Codyssey · InKY Calculator · AI Ways Incheon (줄임말·별명·번역어 금지).
- **보고 경로**: 앱 담당은 팀장(Project Engineering)과만 주고받는다. Bumm님이 직접 말을 걸면 그 건만 직접 답한다.
- 🔴 **`main` 푸시 = 라이브 배포.** Codex·클라우드·다른 기기에서 한 작업은 `main`에 직접 푸시하지 않는다 —
  작업 가지 → PR로 내고, 합치는 것은 팀장 확인 뒤. 되돌리기는 CI로만(프리즈 태그 기준), 라이브에 직접 손대지 않는다.
- 🔴 **멈추고 Bumm님께 묻는 것**: 콘솔 전용 작업(Firebase/GCP), 돈이 드는 결정, 법률·정책 판단, 되돌리기 어렵거나
  파괴적인 행동, 영구 식별자(프로젝트·사이트 ID, 버킷 이름) 생성, 새 제품 방향.
- **한 번에 완성**: "일단", "차선책", "우회", "나중에" 금지. 제대로 못 하면 멈추고 보고. `TODO`/`FIXME`/`임시` 금지.
  검사를 느슨하게 하거나 빼서 통과시키지 않는다. 검사는 실제로 돌리고 종료 코드로 확인한다.
- **숨길 것**: 어드민 화면·기능은 저장소·배포·커밋 어디에도 드러내지 않는다. 비밀 키·토큰·인증 코드는 쓰지 않는다.
- **인계(도구·기기를 바꿔 가며 이어서 할 때)**: 단계를 끝낼 때마다 작업 가지에 올리고, PR 설명에
  "한 일 / 다음에 할 일 / 주의할 것"을 적는다. 같은 가지를 두 도구가 동시에 고치지 않는다 — 한쪽이 올린 뒤 이어받는다.
- **로컬(집 PC) 전용 작업** — 클라우드에서는 하지 않는다: 콘솔 작업, 운영 데이터 읽기·쓰기, 배포 승인,
  집 PC 모니터를 쓰는 측정. 클라우드는 코드 수정·검사·PR까지만. 이 앱에서는 구체적으로 —
  Firebase/GCP 콘솔의 App Check·Sentry·예산 알림 설정 확인·변경, 그리고 라이브 도메인에서
  `?pairing=1`에 여섯 자리 코드를 제출해 App Check·Firestore 통과 여부를 확인하는 작업(reCAPTCHA v3가 자동화를 차단해 헤드리스로는 검증 불가하다)이 여기 해당한다.

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
| 자산 계측(배경 낭비·처리방침 도달성) | `npm run measure:assets <URL>` — 배경 이미지나 CSS 미디어쿼리를 건드렸을 때 돌린다. Playwright가 의존성에 없어 최초 1회 별도 설치가 필요하며, 스크립트 맨 위 주석에 실행 방법과 정상값이 적혀 있다. |

**배포**: `main`에 push하면 `.github/workflows/deploy.yml`이 Firebase Hosting으로 자동 배포한다(`https://classcade.edutogether.kr`). 별도 배포 명령은 없다. 2026-09-09에 GitHub Pages에서 이전했다 — 보안 응답 헤더를 붙이기 위해서다(Pages는 헤더를 설정할 수 없다).

**절대 하면 안 되는 것** — 자세한 근거는 `.claude/rules/app.md`, 최신 상태는 `CLAUDE.md`.

1. **`edutogether.kr` 커스텀 도메인을 이 저장소에 설정하지 않는다.** 2026-08-13에 `edutogether/portal`로 이전됐다. CNAME 파일이 들어가면 포털이 즉시 깨진다(워크플로에 방어 가드 있음, 가드 삭제도 금지).
2. **페어링 서브시스템(`src/features/pairing/`)은 보류(아카이브)된 기능이다.** 도달 불가한 것은 버그가 아니라 확정된 결정이다 — 결함으로 보고하거나 삭제를 제안하지 않는다.
3. **CSP에서 `www.google.com`/`www.gstatic.com`(script-src·frame-src)과 `*.ingest.us.sentry.io`(connect-src)를 빼지 않는다.** CSP는 `index.html`이 아니라 **`firebase.json`의 `hosting.headers`**에 있다(2026-09-09 Firebase Hosting 이전 이후). 앞의 것을 빼면 App Check 토큰 발급이 막혀 페어링이 완전히 차단되고(Firestore가 Enforced), 뒤의 것을 빼면 오류 모니터링이 조용히 죽는다. 둘 다 실제로 발생했던 사고다.
4. **PC/모바일 화면의 시각 디자인(배치·색·간격·아트)은 임의로 바꾸지 않는다.** 소유자가 직접 다듬는 영역이다. 동작 버그와 접근성 결함은 정상적으로 고친다.
5. **`.claude/rules/app.md`의 금지·함정 목록도 반드시 읽는다.** 위 4개는 요약이고, 자산 자리표시자·캐시 헤더 패턴·CSP 스모크 검사 등 여기 없는 항목이 더 있다.

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

~~The repository is initialized.~~ — 이건 개발 극초반(2026-08-02) 시점 기록이다. 지금은 골든패스 전체가 구현되어 실제 라이브 서비스 중이다(`https://classcade.edutogether.kr`). 위 "Mission"·"Visual source of truth"·"Hard rejections" 섹션은 여전히 제품 설계 원칙으로 유효하지만, 이 섹션과 아래 진행상황 서술은 더 이상 현재 상태가 아니다 — 최신 상태는 `CLAUDE.md` 참고.

## Golden-path priority — 2026-08-02 (2026-09-08 정정 — 아래 골든패스 서술은 현행이 아님)

**정정**: 아래 문단이 말하는 "result-dependent second game", "completion", "sharing"은 게임 만들기 서브시스템이며 2026-08-27에 코드·데이터·아트가 전부 삭제됐다(위 Mission 섹션 참고). 현재 골든패스는 **프렙 1~4 → 닉네임 → 로딩 → 시작 → NBTI 16문항 → 결과 → 놀이 추천**에서 끝나며, 전부 구현·배포되어 실사용 중이다.

~~The user has approved a local, end-to-end golden-path implementation: preparation, NBTI start and questions, provisional result, the result-dependent second game, accessible shake fallback, completion, and sharing.~~ Keep the existing visual contract and entry/storage behavior, but make every transition work before adding new art directions or backend integrations. Any result or NBTI label must be clearly presented as provisional exploration rather than a scientific diagnosis.
