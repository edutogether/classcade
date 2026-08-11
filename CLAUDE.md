# CLAUDE.md — classcade (CLASSCADE)

교실 NBTI 기반 몰입형 교육 게임 (React/TS/Vite/Firebase). 상위 원칙은 [D:\Project\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

## 현재 상태 (2026-08-10 기준)
- 브랜치: `feature/front120-entry-flow-v1` (origin과 동기화됨, 커밋 `38003de`)
- 2026-08-10 외부 리뷰: `docs/EXTERNAL_HEALTH_REVIEW_20260810.md`
- entry flow WIP 커밋 완료 + 브라우저 검증 중 발견한 런칭 블로커 3건 수정·푸시 완료 (아래 참고)

## 알려진 이슈

리뷰 결과 구조는 견실함. **테스트 밀도만 다소 낮음** — googler/aiways-incheon처럼 급하게 처리할 구조적 문제는 없고, 여유 있을 때 테스트 커버리지 보강하는 정도로 접근하면 됨.

## 이번 라운드 목표 — 마감 있음 (2026-08-10 갱신)

**수요일(2026-08-12)부터 실제로 작동해야 함. 마감: 화요일(2026-08-11) 밤.** 여기는 googler/aiways-incheon과 달리 "전시/시연"이 아니라 실사용 대상이라 기준이 더 높다.

만점(10/10) 기준으로 지금 남은 갭:
1. ~~**front120-entry-flow-v1 WIP 완료**~~ — 완료 (커밋 `38003de`). vitest/eslint/tsc/build 통과 + Playwright로 데스크톱·모바일(390x844) 골든 패스(prep 1-4 → 닉네임 → 로딩 → journey 진입, 뒤로가기 포함) 실제 브라우저 확인 완료. 그 과정에서 유닛 테스트로는 안 잡히는 런칭 블로커 3건을 찾아 수정함:
   - 2~4단계 이전/다음 버튼이 실제로는 미완성 "PLACEHOLDER" 텍스트가 박힌 PNG였음(`prep-02-*`, `prep-nav-*` 에셋). 이미 스타일이 갖춰져 있던 텍스트 버튼(`front120-button`, `front120-prep02-plate__*`)으로 되돌림.
   - 닉네임 화면 제목이 데스크톱 폭에서 `<span>` 사이 공백 없이 "닉네임을알려주세요"로 붙어 나옴 → 공백 추가.
   - **가장 심각**: 모바일 뷰포트(폰)에서 1단계 안내 문구가 `white-space:nowrap`으로 넘쳐서 "다음 질문으로" CTA 버튼 위를 덮어 클릭을 가로챔 — 폰에서는 1단계를 절대 통과할 수 없었음. `overflow:hidden` + `pointer-events:none`으로 수정.
2. **`AdventurePrepScreen.tsx`(434줄, 사용자가 제일 많이 보는 화면), `App.tsx`(239줄) 테스트 추가** — 마감 전 가능하면, 안 되면 최소한 수동 브라우저 확인으로 대체. (수동 브라우저 확인은 위 1번에서 완료했지만, 회귀 방지용 자동 테스트는 아직 없음.)
3. ~~**`.gitignore`에 `*-debug.log` 추가**~~ — 완료 (기존 WIP 커밋에 포함됨).

## 다음 작업 후보 (마감 이후, 급하지 않음)
- 나머지 테스트 커버리지 보강
