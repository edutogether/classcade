# External Health Review — 2026-08-10

Source: cross-project review run from the `D:\Project` parent-folder Claude session (not this project's own session). Read-only investigation — no code was changed. Bring this into this project's own session to decide what (if anything) to act on.

## Method
Same rubric used on a sibling project (codyssey): file-size/god-component scan, TODO/FIXME/HACK/@ts-ignore/eslint-disable grep, `any` usage grep, tsconfig strictness, test:source LOC ratio, actually running `vitest`/`eslint`/`tsc`, Firestore rules read, secrets-in-tree check, git/CI state.

## Findings (ranked)

1. **Test coverage depth is thin relative to the sibling bar.** Test:source LOC ratio ~1:5.4 (601 test LOC vs 3,275 non-test LOC), vs. codyssey's ~1:1. The largest/most user-facing file, `src/components/AdventurePrepScreen.tsx` (434 lines), and `src/App.tsx` (239 lines) have no dedicated test files. Tests cluster around pure logic modules (`storage`, `journeyState`, `classroomGameBuilder`, `pairingContract`).
2. **Currently mid-flight, not settled.** Branch `feature/front120-entry-flow-v1`, 16 commits ahead of `main`, 1 local unpushed commit, and 17 modified/untracked files uncommitted at review time. Nothing here should be read as "shipped" — it's active WIP.
3. **Debug log hygiene gap (minor).** `firebase-debug.log` (126KB) and `firestore-debug.log` (55KB) are untracked but not covered by `.gitignore` (which only excludes `dist`, `node_modules`, `.vite/`, `*.local`) — one `git add -A` away from landing in a commit.
4. Everything else checked came back clean/strong: zero TODO/FIXME/HACK/@ts-ignore/eslint-disable, zero explicit `any` in non-test code, `tsconfig.app.json` has `strict: true` + `verbatimModuleSyntax` + `noUncheckedSideEffectImports` + `isolatedModules`, `firestore.rules` (52 lines) is uid-based with `hasOnly()` allow-lists and `allow list: if false` — no client-trusted role/name checks found anywhere in `src`. Actually running the suite: `vitest run` → 55 passed / 5 skipped (skip requires Firestore emulator via separate `rules:test` script), 0 failures; `eslint .` → clean; `tsc -b --noEmit` → clean.
5. Note on parent-folder residue: the `CLASSCADE_*review*.zip` files and `front120-*captures/` directories live in `edutogether/` (the parent of this repo), not inside `classcade/` itself — not git-tracked as part of this repo, read as visual-QA tooling output tied to the current feature branch, not a code-quality signal against this project.

## Bottom line
No structural red flags (no god-component, no debt markers, strict TS, careful Firestore rules). The only real gap vs. the sibling bar is test depth on UI-heavy files, and the fact that what's on disk right now is uncommitted in-progress work rather than settled `main`.
