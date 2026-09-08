# CLASSCADE final structure audit — 2026-08-02

Baseline inspected: `bacea99a218c04c5ab95e72dd35d4db41addee9f` on `feature/nbti-visual-vertical-slice`.

## Summary

- Baseline findings: **B FAIL** (`JourneyApp.tsx` was 309 lines and contained eight scene JSX blocks); **F FAIL** (CSS contained `!important` overrides and retired header-navigation selectors).
- Resolution: split only the scene JSX and shared shell, preserved the existing reducer/persistence contract, removed the noncompliant CSS overrides and central start-header menu.
- Current result: **A–H PASS**. No state, storage, desktop/mobile, or data-model rewrite was required.

## A. App responsibility — PASS

- Evidence: [`src/App.tsx`](../src/App.tsx) lines 36–76 boots device mode, profile, legacy journey, persisted detailed journey, and entry state; lines 120–145 own reducer dispatch and reset persistence; line 181 mounts `JourneyApp`.
- No detailed scene JSX is present in `App.tsx` (188 lines total).
- Required change: none.

## B. JourneyApp responsibility — PASS after targeted repair

- Baseline failure: [`src/features/journey/JourneyApp.tsx`](../src/features/journey/JourneyApp.tsx) was 309 lines with Start, Question, Result, Game Intro, Game Choice, Shake, Complete, and Share JSX blocks in one file.
- Evidence after repair: [`JourneyApp.tsx`](../src/features/journey/JourneyApp.tsx) lines 18–34 now owns only cue dispatch and `JourneyStage` scene selection. [`components/SceneFrame.tsx`](../src/features/journey/components/SceneFrame.tsx) lines 48–60 owns the common shell; [`scenes/NbtiScenes.tsx`](../src/features/journey/scenes/NbtiScenes.tsx) lines 15–78 owns NBTI scenes; [`scenes/GameScenes.tsx`](../src/features/journey/scenes/GameScenes.tsx) lines 8–140 owns game, completion, and sharing scenes.
- Required change: completed; no behavioral action names or state transitions changed.

## C. State — PASS

- Evidence: [`journeyState.ts`](../src/features/journey/journeyState.ts) lines 8–39 defines one `JourneyStage`, the full journey record, and explicit actions; lines 76–135 define the reducer; lines 145–194 validate restored state.
- `App.tsx` stores one `JourneyState` and derives the legacy status only for compatibility (`App.tsx` lines 28–30, 87–95, 120–133). `resultCode`, `gameVariantId`, and `gameChoices` are only state fields in the reducer record.
- Required change: none.

## D. Persistence and storage — PASS

- Evidence: [`journeyPersistence.ts`](../src/features/journey/journeyPersistence.ts) lines 4–41 is the sole journey-state persistence boundary; [`storage.ts`](../src/lib/storage.ts) lines 85–123 selects/guards backends.
- Scene files contain no `localStorage` or `sessionStorage` calls. Personal and shared namespaces remain selected by `DeviceMode`.
- Required change: none.

## E. Desktop/mobile structure — PASS

- Evidence: [`JourneyApp.tsx`](../src/features/journey/JourneyApp.tsx) lines 26–33 selects one scene tree; [`journey.css`](../src/features/journey/journey.css) line 32 is CSS-only responsive placement.
- No `MobileApp`, mobile scene duplicate, or `window.innerWidth` JSX branch exists.
- Required change: none.

## F. CSS integrity — PASS after targeted repair

- Baseline failure: `src/App.css` and `src/features/journey/journey.css` used `!important`; `journey.css` still included the retired `.journey-header__nav` selector family.
- Evidence after repair: [`journey.css`](../src/features/journey/journey.css) line 6 defines only the LOGO/actions header; line 13 gives the decorative quest board `pointer-events: none`; line 32 retains both audio controls on mobile without a hide selector; [`App.css`](../src/App.css) lines 24, 32, 44, and 46 contain no `!important` overrides.
- `transform: scale()` remains limited to background-art breathing/crop effects, never an overall stage scaling mechanism.
- Required change: completed.

## G. Provisional data boundary — PASS

- Evidence: [`nbti.provisional.ts`](../src/data/nbti.provisional.ts), [`nbtiScoring.provisional.ts`](../src/data/nbtiScoring.provisional.ts), [`nbtiResults.provisional.ts`](../src/data/nbtiResults.provisional.ts), and [`gameVariants.provisional.ts`](../src/data/gameVariants.provisional.ts) contain questions, scoring, results, and variants.
- [`journeyState.ts`](../src/features/journey/journeyState.ts) lines 1–4 imports those data boundaries; no standard-MBTI mapping is present.
- Required change: none.

## H. Scene art and interactive UI — PASS

- Evidence: [`sceneAssets.ts`](../src/data/sceneAssets.ts) lines 4–18 centralizes art/crop metadata; [`SceneFrame.tsx`](../src/features/journey/components/SceneFrame.tsx) lines 39–60 renders art separately from DOM controls.
- Start controls and cards are real DOM in [`NbtiScenes.tsx`](../src/features/journey/scenes/NbtiScenes.tsx) lines 17–35. The quest board is decorative, noninteractive, and switchable from the asset config (`sceneAssets.ts` line 13; `NbtiScenes.tsx` line 29; `journey.css` line 73).
- Required change: completed for the config switch and pointer-event boundary.

## Test coverage read

- `storage.test.ts`: device mode, namespacing, malformed values, and failed storage.
- `entryState.test.ts`: personal/shared entry and prep selection validation.
- `journeyState.test.ts`: guarded question flow, deterministic result, variant mapping, shake fallback, sharing, and malformed state.
- `journeyPersistence.test.ts`: mode-specific persistence and failed writes.
