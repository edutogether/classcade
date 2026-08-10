# CLAUDE.md — classcade (CLASSCADE)

교실 NBTI 기반 몰입형 교육 게임 (React/TS/Vite/Firebase). 상위 원칙은 [D:\Project\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

## 현재 상태 (2026-08-10 기준)
- 브랜치: `feature/front120-entry-flow-v1` (origin보다 1커밋 앞섬)
- 활발히 개발 중 — 미커밋 변경 다수 있는 게 정상 상태 (진행 중인 작업)
- 2026-08-10 외부 리뷰: `docs/EXTERNAL_HEALTH_REVIEW_20260810.md`

## 알려진 이슈

리뷰 결과 구조는 견실함. **테스트 밀도만 다소 낮음** — googler/aiways-incheon처럼 급하게 처리할 구조적 문제는 없고, 여유 있을 때 테스트 커버리지 보강하는 정도로 접근하면 됨.

## 이번 라운드 목표 — 마감 있음 (2026-08-10 갱신)

**수요일(2026-08-12)부터 실제로 작동해야 함. 마감: 화요일(2026-08-11) 밤.** 여기는 googler/aiways-incheon과 달리 "전시/시연"이 아니라 실사용 대상이라 기준이 더 높다.

만점(10/10) 기준으로 지금 남은 갭:
1. **front120-entry-flow-v1 WIP 완료** — 현재 17개 파일 미커밋 상태(+524/-161). 화요일 밤까지 기능적으로 끝내고 커밋할 것. 테스트/lint 통과뿐 아니라 **실제 브라우저로 골든 패스 확인 필수** (최상위 CLAUDE.md 공통 원칙).
2. **`AdventurePrepScreen.tsx`(434줄, 사용자가 제일 많이 보는 화면), `App.tsx`(239줄) 테스트 추가** — 마감 전 가능하면, 안 되면 최소한 수동 브라우저 확인으로 대체.
3. **`.gitignore`에 `*-debug.log` 추가** — `firebase-debug.log`/`firestore-debug.log`가 안 걸려있어 실수로 커밋될 위험. 30초짜리, 지금 해도 됨.

## 다음 작업 후보 (마감 이후, 급하지 않음)
- 나머지 테스트 커버리지 보강
