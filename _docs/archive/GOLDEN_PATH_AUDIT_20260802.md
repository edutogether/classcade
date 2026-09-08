# CLASSCADE Golden Path Audit — 2026-08-02

## Scope and rollback point

- Active repository: `D:\Project\edutogether\classcade`
- Work branch: `feature/nbti-visual-vertical-slice`
- Verified pre-build backup: `D:\Project\edutogether\_backups\classcade-golden-path-prebuild-20260802`
- The backup contains the complete `src` tree and project configuration required to restore the pre-golden-path WIP. It intentionally excludes Git metadata, dependencies, build output, coverage, and captures.
- No files under `D:\Project\edutogether\googler` are in scope.

## Current structure

- `src/App.tsx` owns boot, device mode, profile selection, the shared-session gate, teacher panel, audio settings, and the current entry/start hand-off.
- `src/lib/storage.ts` already isolates browser storage through a guarded local/session backend and preserves the profile, anonymous journey ID, and coarse journey status.
- `src/lib/entryState.ts` resolves personal versus shared entry and is covered by tests.
- `src/components/AdventurePrepScreen.tsx`, `SharedSessionGate.tsx`, and `TeacherPanel.tsx` are functioning entry controls that must remain in the user journey.
- `src/components/NbtiStartScreen.tsx` is a visual start-scene implementation. It currently has no real NBTI transition target.

## Existing assets

| Asset | Dimensions | Current role | Use in reconstruction |
| --- | ---: | --- | --- |
| `src/assets/classcade-start-master.png` | 1672 × 941 | Raw dark-gate / adventurer / academy plate | Start scene and dark fantasy scene art, with DOM UI overlaid |
| `src/assets/portal-academy-background.png` | 1448 × 1086 | Portal academy plate | Preparation, shared entry, and parchment-like journey scenes |

No character sprite, final-result art set, audio file, video, or third-party game asset is present. The golden path must therefore use the available plates as scene art and build the actual controls, progress, feedback, and final cards in DOM/CSS. Missing audio remains safely silent rather than pretending that a track was played.

## State and persistence audit

The legacy `Journey` record only stores a coarse status (`new`, `nbti_in_progress`, `nbti_complete`, `game_in_progress`, `complete`). It cannot reliably restore a question index, NBTI answer, result code, game choice, or completion payload. The reconstruction therefore adds a versioned detailed journey record while retaining the legacy record for compatibility and teacher-panel status.

The detailed record must own:

- current scene stage
- selected NBTI answers and question index
- deterministic provisional result code
- selected game variant and game-choice progress
- shake/fallback progress and final completion data
- BGM/SFX preferences

Every transition is guarded by stage and required data. A malformed or old detailed record is discarded safely and the user resumes at a valid start state; profile and device-mode data remain intact.

## Existing behaviors to preserve

- personal and shared device-mode isolation
- anonymous journey ID creation
- shared-session validation gate
- profile selection/editing and teacher panel
- reset behavior, offline/storage-failure notices, and journey status
- BGM/SFX control state
- the existing storage and entry-state test coverage

## Reconstruction plan

1. Add provisional NBTI question, scoring, result, game-variant, static scene-asset, and audio-manifest data.
2. Add a versioned reducer and persistence adapter, then map it to the legacy journey status without bypassing storage guards.
3. Render only stage-specific scene components through one `JourneyApp` coordinator: start, questions, result, second-game intro, game choices, shake/fallback, completion, and sharing.
4. Reuse a fantasy stage shell, semantic DOM panels, progress cues, accessible interaction states, and reduced-motion support instead of cloning screens.
5. Test reducer guards and complete personal/shared flows, then verify visual breakpoints in a real browser before a local-only commit.

## Visual debt to avoid

- Do not turn the journey into white rounded SaaS cards.
- Do not treat the artwork as a screenshot containing controls; all actionable controls remain DOM.
- Do not claim official diagnosis, scientific validity, completed audio playback, device motion, saved sharing, or connectivity when unavailable.
- Do not force the old start plate into `cover` crops that destroy the approved gate-to-world composition.
