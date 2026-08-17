# CLAUDE.md — classcade (CLASSCADE)

교실 NBTI 기반 몰입형 교육 게임 (React/TS/Vite/Firebase). 상위 원칙은 [D:\Project\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 앱 전용 상태/이슈만 기록한다.

## 현재 상태 (2026-08-14 기준) — **프리즈됨**

`classcade-freeze-20260814` 태그로 복구 지점 고정. `.githooks/pre-push`(portal/googler와 동일 패턴)로 이 태그의 삭제·이동을 막음 — 새 클론에서는 `git config core.hooksPath .githooks`로 활성화해야 보호가 걸린다.

- 배포: `https://edutogether.github.io/classcade/` (GitHub Pages Actions, `main` 푸시 시 자동 배포)
- **⚠️ `edutogether.kr` 커스텀 도메인을 이 저장소에 다시 설정하지 말 것.** 그 도메인은
  2026-08-13에 `edutogether/portal`(같교오락실 포털)로 이전됐고 지금 그쪽이 쓰고 있음.
  여기서 재설정하면 포털이 즉시 깨짐. 배포 주소는 위 GitHub Pages 기본 URL 그대로 유지.
- 브랜치: `main`에서 직접 작업(다른 앱들과 동일한 방식으로 통일, `feature/front120-entry-flow-v1`은 내용 동일한 채 보관만)
- 이번 프리즈까지 반영된 것: entry flow 전체(prep 1-4 → 닉네임 → 로딩 → journey), 로딩 화면 v6 아트 전환 + 문구 라이브 DOM화, NBTI "다시 탐색하기"·"메인 화면으로" 인터루드, 헤더 로고 글로우, BGM 볼륨 디바운스, PNG→WebP 전량 전환
- 2026-08-10 외부 리뷰: `docs/EXTERNAL_HEALTH_REVIEW_20260810.md`
- **2026-08-17 감사 후 수정**: 배포 워크플로우가 Firebase 환경변수 4개(API_KEY/AUTH_DOMAIN/PROJECT_ID/APP_ID)를 전혀 주입하지 않아 프로덕션에서 페어링 기능이 항상 실패하던 치명적 버그 발견·수정. `.github/workflows/deploy-pages.yml`에 `secrets.*` 참조를 추가했으나 **실제 GitHub Actions secret 값 4개는 아직 등록 전** — 등록 전까지 페어링은 여전히 깨진 상태다. Firestore 규칙 테스트(40여개)도 CI에서 한 번도 실행된 적 없었던 것을 발견해 `rules:test` 스텝(JDK21 + firebase-tools 에뮬레이터)으로 연결, CI 통과 확인함.

## 알려진 이슈

리뷰 결과 구조는 견실함. **테스트 밀도만 다소 낮음** — googler/aiways-incheon처럼 급하게 처리할 구조적 문제는 없고, 여유 있을 때 테스트 커버리지 보강하는 정도로 접근하면 됨.

## ⚠️ 미해결 — 사용자 조치 필요

GitHub repo Settings → Secrets and variables → Actions에 아래 4개를 Firebase 콘솔 값으로 등록해야 페어링 기능이 실제로 살아난다(이 세션은 API 키를 직접 다루지 않으므로 등록은 사용자가 직접 해야 함):
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`.
등록 후 다음 `main` 배포에서 자동 반영되며, 배포 후 `?pairing=1`로 실제 페어링 코드 생성이 되는지 반드시 브라우저로 확인할 것.

`.firebaserc`도 저장소에 없어 Firestore 규칙을 CLI로 라이브 배포하는 경로가 CI에 없다 — 저장소의 `firestore.rules`가 실제 운영 중인 규칙과 같다는 보장이 없다. Firebase 프로젝트 ID를 아는 사람이 `firebase use --add`로 채워야 함.

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
