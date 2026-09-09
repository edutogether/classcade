# CHANGELOG

이 저장소의 굵직한 변경을 시간순(최신이 위)으로 기록한다. git 로그·태그에서
**확인되는 사실만** 적는다 — 추정이나 요약이 아닌 근거는 커밋 해시로 남긴다.
2026-09-10에 처음 만들었고, 그 이전 이력은 기존 `CLAUDE.md`·`.claude/rules/app.md`·
freeze 태그 메시지·git 로그를 근거로 소급 채웠다. 앞으로는 배포·수정이 나갈 때마다
여기 한 줄씩 추가한다.

## 2026-09-10

- 카카오톡 등 공유 카드(og/twitter 태그)를 Portal(`apps.ts`) 기준 문구·그림으로
  통일. `og:image`는 Portal 원본(`edutogether.kr/assets/og/classcade.jpg`)을
  받아 `public/og.jpg`로 이 저장소 자체 도메인에서 배포(다른 저장소 배포가
  막혀도 이 앱 카드는 영향받지 않게). 옛 `og/classcade-share-v1·v2.png` 정리.
  (`f769127`)

## 2026-09-09 — GitHub Pages → Firebase Hosting 이전

- 배포 대상을 GitHub Pages에서 Firebase Hosting으로 전환. 사유: Pages는 응답
  헤더를 설정할 수 없어 CSP를 `<meta>`로만 둘 수 있었고 `frame-ancestors`
  같은 지시어가 아예 무시됨. (`51062e2`)
- 보안 응답 헤더 5종(CSP·X-Frame-Options·X-Content-Type-Options·
  Referrer-Policy·Permissions-Policy)을 `firebase.json`의 `hosting.headers`로
  이전, `index.html`의 CSP `<meta>` 제거(두 벌 금지).
- 배포 주소를 `classcade.edutogether.kr`(Firebase 맞춤 도메인)로 교체. 옛
  주소 `edutogether.github.io/classcade`는 404 처리, GitHub Pages는 새 주소
  검증 후 비활성화. (`8ac14c6`)
- 루트(`/`) 요청이 `**/*.html` 캐시 규칙에 안 걸려 Firebase 기본값
  `max-age=3600`이 적용되던 결함을 발견해 전역 `no-cache`로 수정. (`d776f2c`)
- `classcade-freeze-20260909-firebase-migration` 태그로 이전 완료 지점 고정.
  Intent 문서(사후 기록) `_docs/intents/2026-09-09-firebase-hosting-migration/`.
- `docs/` → `_docs/`로 폴더 이름 통일, intent-kit 워크플로 도입.

## 2026-09-07~08 — 콘솔 설정 확정 및 CSP/Sentry 충돌 수정

- Firestore App Check를 Monitoring → Enforced로 전환(Bumm님 콘솔 작업).
  (`7ed5af5`에 기록)
- Sentry DSN을 GitHub Actions secret으로 등록. 등록 시점에 CSP
  `connect-src`에 Sentry 전송 도메인이 빠져 있어 모니터링 이벤트가 전량
  차단되던 것을 발견해 `https://*.ingest.us.sentry.io` 추가로 수정.
- GCP 예산 알림 설정(월 ₩25,000, 임계값 50/90/100%, alert-only).

## 2026-09-02 — 감사 후속 조치 2라운드

- 번들 분할(첫 로드 청크 축소), `firestore.rules`에 필드 크기 상한 추가
  (문서 크기 무제한 취약점 수정), `storage.ts` 어댑터 경계로 저장 오류
  리포팅 일원화, 게임빌더 삭제 잔재·오래된 카피 정리, 자산 무게 축소.
  (`2c6a2f4`, `39cafca`)
- 개인정보 처리방침에 Sentry 고지 반영. (`5105fe9`)

## 2026-08-27 — 교실 게임 만들기 서브시스템 완전 삭제

- `disconnectedScenes()`에 갇혀 있던 교실 게임 만들기(9/12 스테이지) 전체를
  Bumm님 결정으로 완전 삭제. `GameScenes.tsx`·`classroomGameBuilder.ts`
  등과 전용 아트 자산 제거, `JourneyState` 버전 2→3. (`5a8cad6`, 후속 정리
  `df5715e`, `39cafca`)
- 페어링(코드발급 UI)은 별도 결정으로 **보류(아카이브)** 유지 — 삭제 아님.
- 개인정보 처리방침 페이지 신설. (`50b9616`)

## 2026-08-26 — App Check 도입, 정밀감사 전 프리즈

- Firebase App Check(reCAPTCHA v3)를 프로덕션에 연결. (`e9f8efc`)
- `classcade-freeze-20260826` 태그.

## 2026-08-23 — 도메인 재claim 방어 가드

- 배포 워크플로우에 `edutogether.kr` 도메인이 실수로 이 저장소에 재연결되어
  portal이 깨지는 사고를 CI 단계에서 막는 가드 추가. (`f27cd7e`)
- `classcade-freeze-20260823` 태그(외부 재감사 이후).

## 2026-08-17 — 배포 파이프라인 치명적 버그 발견·수정

- 배포 워크플로우가 Firebase 환경변수 4종을 전혀 주입하지 않아 프로덕션에서
  페어링 기능이 항상 실패하던 버그 발견·수정. Firestore 규칙 테스트를
  JDK 21 + 에뮬레이터로 CI에 연결. (`f65c429`, `5ef21ce`)
- `classcade-freeze-20260817` 태그.

## 2026-08-13 — 도메인 이전

- `edutogether.kr` 커스텀 도메인이 `edutogether/portal`로 이전, 이 저장소는
  서브도메인(현재 `classcade.edutogether.kr`)만 쓰도록 정리. (`066be11`)

## 2026-08-11~12 — 프렙(모험 준비) 화면 CSS 평면화, 카탈로그 확충

- 프렙 1~4단계·완료 화면을 이미지 배경+좌표버튼 방식에서 CSS 평면 방식으로
  전환(저사양 대응). (`22c0ff5`, `258f790`)
- 첫 로드 870KB 단일 JS 청크를 `JourneyApp` 지연 로드로 분할. (`c0fdf22`)
- 같이교육 놀이 영상 카탈로그를 27개로 확충, 게임 인트로 삭제. (`78238db`)

## 2026-08-05 — 페어링·게임빌더 초기 구현

- 모바일-노트북 페어링을 Firebase로 연결. (`6c17e9f`)
- 교실 게임 만들기 흐름 최초 구현(2026-08-27에 완전 삭제됨). (`747866e`)

## 2026-08-01~02 — 저장소 시작

- 저장소 초기화, CLASSCADE 프로덕션 경험 최초 배포(GitHub Pages,
  `edutogether.kr` 서브경로). (`276c7c8`, `b13dedc`)
