# CHANGELOG

## 2026-10-10 — 보안 강화 (지시 Bumm 10/10, 팀장 경유)

- 페어링 호출 한도 검사 보강, 배포 잡을 `main`에서만 돌리고 `production` 환경에 붙임, 오류 리포트에서 페이지 주소의 쿼리·조각 제거, 경로 재설정 방어. 관련 테스트 추가(규칙 테스트 12·전체 132 통과). 복구 지점: `classcade-freeze-20261010b-audited-100`.

## 2026-10-10 — 종합감사 10/10 (지시 Bumm 10/10, 팀장 경유)

- 마지막 감사 태그(9/10) 이후 쌓인 커밋을 대상으로 종합감사를 돌렸다. 찾은 결함은 모두 고쳤다: 낡은 `dependabot.yml` 무시 규칙 제거(보안 업데이트까지 막고 있었고 전제가 이미 사라짐), 마이너·패치 의존성 갱신, README의 Vite 버전 오기와 낡은 CLAUDE.md 감사 주기·상태 정정, `app.md`에 `overrides`·`pairingQuota` TTL 기록.
- README에 «실운영 상태» 절을 두었다(자동으로 도는 것·사람이 할 일·문제 시 순서).
- 복구 지점: `classcade-freeze-20261010-audited-100`. Dependabot·code scanning·secret scanning 열린 알림 모두 0건, `npm audit` 0건.

## 2026-10-10 — 저장소 정리와 의존성 갱신(보안 패치 포함) (승인 Bumm 10/10)

- `.codex/`를 지우고 `.gitignore`에 넣었다. 쓰임이 끝난 인계용 원격 가지(`codex/classcade-claude-handoff-20261005`)를 정리했다.
- 개발 도구와 Firestore 서버용 의존성을 안전한 버전으로 올려 `npm audit`와 Dependabot 열린 알림을 모두 0으로 만들었다(`firebase-tools` 15.33.0, `package.json` `overrides`). 화면에 나가는 번들은 그대로이고 테스트·에뮬레이터 규칙 테스트도 그대로 통과한다.

## 2026-10-08 — 파비콘 주소에 버전 붙임 (승인 Bumm 10/8)

- 아이콘 링크를 `favicon-emblem.png?v=20261008`로 바꿔, 새 아이콘이 캐시(최대 1시간) 없이 바로 보이게 했다.

## 2026-10-08 — 파비콘 메달을 칸에 꽉 채움 (승인 Bumm 10/8)

- 파비콘을 둥근 메달 바깥 테두리에 정사각 칸을 맞춰 메달이 칸을 꽉 채우게 했다(상하좌우 뾰족한 장식은 칸 밖에서 잘림, 금색 링은 안 잘림). 원본 무손실 PNG를 자르기만 했고 밝기 보정은 그대로. 파일 이름·링크는 그대로.

## 2026-10-07 — 파비콘을 더 크고 밝게 (승인 Bumm 10/7)

- 탭 파비콘이 작고 어두워 잘 안 보인다는 지적에 따라, 엠블럼 전체(뾰족한 장식 끝까지)를 바깥 여백 없이 64칸 가로 끝까지 채우고
  밝기·대비·채도를 올렸다(원본 무손실 PNG에서 원화소로 잘라 줄임, 새로 그리지 않음). 파일 이름·링크는 그대로.

## 2026-10-07 — 파비콘을 CLASSCADE 엠블럼으로 (승인 Bumm 10/7, §33 개정 반영)

- 탭·즐겨찾기 파비콘을 같이교육 로고 대신 **CLASSCADE 자체 금색 엠블럼**(`favicon-emblem.png`, 64×64)으로 바꿨다.
  원본 `src/assets/brand/classcade-emblem`(1536×781)에서 엠블럼 영역(897×778화소)만 원화소 그대로 잘라 4% 투명 여백의
  정사각 캔버스에 넣고 64px로 줄였다(새로 그리지 않음). 회색 전환 폐기는 그대로.

## 2026-10-07 — 파비콘 통일, 비활성 회색 전환 폐기 (승인 Bumm 10/7)

- 탭·즐겨찾기 파비콘을 같이교육 로고(`favicon-black.png`, Calendar와 같은 파일)로 통일하고, 탭이 백그라운드일 때 회색으로 바꾸던 코드와 회색 아이콘을 지웠다. 홈 화면 아이콘은 그대로.

## 2026-10-07 — 페어링 호출 한도·배포 도구 버전 고정 (승인 Bumm 10/7)

- 페어링 세션 생성·삭제에 사용자별 호출 한도를 넣었다(`firestore.rules`의 `pairingQuota`, 10분 20회).
  한 반 30명이 동시에 접속해도 막히지 않음을 규칙 테스트로 확인했다.
- 배포 도구 `firebase-tools`를 정확한 버전(15.32.1)으로 고정했다(액션은 10/5에 SHA 고정 완료).
- 공용 기기에서 다음 참가자가 이전 참가자의 페어링 세션 정보를 이어받지 않도록, 발급 코드·게이트 값을
  기기 모드별 저장 계층으로 옮기고 «초기화»가 함께 지우게 했다(화면 변화 없음).

## 2026-10-05 — 의존성 갱신: @sentry/react 11 (승인 Bumm 10/5)

- Dependabot #34를 그대로 병합하지 않고 직접 마이그레이션했다 — 11은 `sendDefaultPii`를
  `dataCollection`으로 바꾸고 기본값을 넓혀(방문자 IP 추론 등), 옵션을 지우기만 하면
  개인정보 처리방침과 어긋나는 수집이 조용히 시작된다. `src/lib/errorReporting.ts`에
  v10의 제한 상태를 명시하고 `errorReporting.test.ts`로 고정했다(수정 없이는 실패함을 확인).
- 검증: 린트·tsc·vitest 124통과·규칙 테스트 6통과·빌드 성공. 산출물은 파일 구성 동일(84개),
  JS 청크 4개 해시 변경, 총량 +4.4KB(+0.45%).
- 같은 날 `@eslint/js` 10(#35, eslint 10과 짝 맞춤)도 병합했다.
- firebase 12.19(앞선 갱신 묶음)는 Bumm님이 실브라우저에서 `?pairing=1` 제출로 정상 확인했다(`app.md` 참고).

## 2026-10-05 — 의존성 갱신(보안 패치 포함) 12건 병합, Dependabot 한도·묶음 설정 (승인 Bumm 10/5)

- Dependabot PR 12건을 하나씩 rebase·PR 검사 확인 후 병합했고, 병합마다 배포 4개 잡
  성공과 라이브 응답(200·CSP 필수 허용 5종·보안 헤더)을 확인했다. 개발 도구의 보안
  패치 6건(fast-uri·undici·morgan·brace-expansion·hono·ip-address), typescript-eslint
  8.71, globals 17, 액션 메이저 3건(checkout 7·setup-java 6·setup-node 7 — SHA 고정 유지),
  마지막으로 프로덕션 번들에 실리는 firebase 12.19.
- 남은 알림은 `@grpc/grpc-js`·`stream-json` 뿐이고, 둘 다 `firebase`/`firebase-tools`가
  구버전을 고정 요구해 상류 갱신을 기다린다(`dependabot.yml`의 ignore 목록 참고).
- 이어서 올라온 개발 도구 묶음·`@types/node` 26도 같은 방식으로 병합·배포했다.
  TypeScript 7(#32)은 린트 도구(typescript-eslint)가 아직 TS 7을 지원하지 않아
  병합하지 않고 `dependabot.yml`에 메이저 ignore를 걸었다 — 지원판이 나오면 해제한다.
  (확인: TS 7에서 tsc·테스트·빌드는 통과했고 산출물 해시는 현재와 동일.)
- `.github/dependabot.yml`: npm·github-actions에 `open-pull-requests-limit: 3` 추가,
  개발 도구의 마이너·패치(npm)와 액션의 마이너·패치만 묶음 — 메이저·프로덕션 의존성은
  묶지 않고 개별 PR로 남긴다.

## 2026-10-05 — CI 위생: 워크플로 액션을 커밋 SHA로 고정 (승인 Bumm 10/5)

- `deploy.yml`·`pr-checks.yml`의 `actions/checkout`·`setup-node`·`setup-java` 11곳을
  태그(`@v6`·`@v4`)에서 커밋 SHA 고정(`# v6.1.0`·`# v4.4.0`·`# v4.9.1` 주석)으로 바꿈.
  `.github/dependabot.yml`에 `github-actions` 항목을 추가해 새 버전은 갱신 PR로 받는다.
  워크플로 로직·산출물은 그대로이고 제품 코드 변경 없음.

## 2026-09-27 — vite 8 · eslint 10 · react-hooks 7 동시 업그레이드 (승인 Bumm 9/27, 배포 완료)

- `vite`(7→8.3.0, 기본 번들러 Rollup→Rolldown 전환) · `@vitejs/plugin-react`(5→6.1.1,
  vite 8 필수 peer) · `eslint`(9→10.11.0) · `eslint-plugin-react-hooks`(5→7.1.1, eslint
  10 필수 peer)를 한 가지에서 함께 올림 — 각각 따로는 peer dependency 충돌로 설치 자체가
  안 됨(Dependabot PR #6/#9 단독 실패로 확인).
- react-hooks 7의 신규 규칙(`react-hooks/refs`, `react-hooks/set-state-in-effect`)이
  잡은 12곳을 전부 구조적으로 고침(eslint-disable도, 규칙을 우회하는 마이크로태스크
  지연도 없음 — 팀장 1차 검토에서 마이크로태스크 지연 3곳을 "우회"로 지적받아 재작업함):
  - 5곳(`AdventurePrepScreen.tsx` 1·`NbtiScenes.tsx` 4)은 React 19.2+ 정식 API
    `useEffectEvent`로 전환 — "최신 콜백을 이펙트 deps 없이 호출"이 바로 이 훅의
    설계 목적이라 `useLatestRef` 자체 훅이 필요 없어짐.
  - `BgmControl.tsx` 2곳 중 1곳(`volumeRef`, 읽기 전용)도 `useEffectEvent`로 전환.
    나머지 1곳(`displayVolumeRef`)은 rAF 루프·드래그 핸들러 등 이펙트 밖에서도 값을
    "쓰는" 진짜 ref라 `useEffectEvent`로 대체 불가 — `useLatestRef`(신설,
    `src/lib/useLatestRef.ts`) 유지, 이유를 PR에 남김.
  - `SceneFrame.tsx` 공지 배지: "사라지기 시작" 판단도 렌더 중 이전 값 비교로 파생,
    실제 타이머는 `leaving` 상태에만 반응하도록 재구성 — 마이크로태스크 제거.
  - **LOCKED 페어링(`PairingScreens.tsx` 2곳, 대표 9/27 직접 승인 예외, CLAUDE.md
    기록·PR #12)**: 코드 발급 이펙트는 `create()` 호출 대신 인라인 프로미스 체인으로
    재작성(그 이펙트 분기에서 status는 이미 초기값으로 'issuing'이라 동기 setState
    자체가 불필요했음), Strict Mode 이중 실행에서 코드가 두 번 발급되지 않도록
    `issuingRef` 가드 추가. `watchPairing`의 동기 throw는 `firestorePairingStore.ts`
    자체가 잡아 `onError` 콜백으로 넘기도록 고쳐 호출부의 try/catch를 아예 없앰.
  - 새 테스트로 증명: `PairingScreens.test.tsx`(코드 발급→waiting, onError→
    network_error, **Strict Mode 이중 실행에서도 발급 정확히 1회**),
    `firestorePairingStore.test.ts`(watchPairing 동기 실패 시 throw 없이 onError 호출).
  린트·타입체크·vitest(123통과)·rules:test(6통과)·build·실제 브라우저(로컬 dev, 프렙
  전 구간·NBTI 인터루드 3종·BGM 토글·선생님 패널 재설정) 전부 확인, 콘솔 에러 0건.
  Vite 8의 Rolldown 전환으로 산출물 청크 구성이 바뀌었으나(`rolldown-runtime` 청크
  신규) 배포 워크플로가 요구하는 고정 경로 산출물·용량 하한은 전부 그대로 존재함을
  확인.
- **PR #12를 대표 승인으로 squash 병합**(`444ca04`, 지시 Bumm 9/27) 후 가지 삭제.
  `main` 배포 워크플로 4개 잡(changes·test·deploy·firestore-rules) 전부 success,
  약 1분 50초. 라이브(`https://classcade.edutogether.kr`)에서 세션 자신의 브라우저로
  `_docs/ops/smoke.json`의 첫 화면 문구 3개 확인, 콘솔 에러 0건. 응답 헤더에서
  CSP 5개 필수 허용값(script-src google·gstatic, frame-src google, connect-src
  sentry, frame-ancestors none)과 보안 헤더 5종, 캐시 정책(루트 `no-cache` ·
  해시 자산 `immutable`) 전부 확인. 로컬 빌드가 만든 것과 같은 해시의
  `rolldown-runtime-hePW80VL.js`가 라이브에 실제로 떠 있음을 직접 확인.

## 2026-09-27 — LOCKED 페어링 규칙에 1회성 lint 예외 기록 (대표 직접 승인)

- `eslint-plugin-react-hooks` 7.x 도입에 필요한 `PairingScreens.tsx` 2곳의
  `react-hooks/set-state-in-effect` 위반 수정을 이번 건에 한해 허용하는 예외를
  CLAUDE.md LOCKED 절에 날짜와 함께 기록. 동작 불변 조건, "되살리기/삭제/재설계"
  질문 재개 아님을 명시.

## 2026-09-27 — PR 검사 워크플로 신설 (지시 Bumm 경유 팀장)

- `.github/workflows/pr-checks.yml` 신설 — `main` 대상 PR을 열면 배포 워크플로의 `test`
  잡(npm ci·vitest·`tsc`·`rules:test`·lint·build)과 동일한 검사가 비밀 키·배포 없이
  자동으로 돈다. 검증용 가지(`ci/pr-checks-verify`)로 PR(#11)을 열어 초록(1분 9초)을
  확인한 뒤 합치지 않고 닫고 가지를 삭제, 같은 파일을 `main`에 직접 커밋함.
  AGENTS.md 배포 절에 한 줄 추가(180줄 유지, 기존 줄에 문장만 덧붙여 줄 수 안 늘림).

## 2026-09-27 — AGENTS.md 금지 목록에 app.md 참조 추가 (지시 Bumm 경유 팀장)

- Codex는 `.claude/rules/app.md`를 자동으로 읽지 않으므로, AGENTS.md "절대 하면 안 되는 것"
  목록에 "app.md의 금지·함정 목록도 반드시 읽는다"는 5번 항목을 추가함. 자리 확보를 위해
  기존 로컬 전용 작업 설명 한 줄을 병합, 180줄 유지. 문서만 변경.

## 2026-09-27 — AGENTS.md에 조직 공통 규칙 절 추가 (지시 Bumm 경유 팀장)

- Codex 클라우드·Claude 클라우드 등 `D:\Projects` 공통 문서를 못 보는 도구를 위해,
  `_shared/constitution.md` 요약 절("조직 공통 규칙")을 `AGENTS.md`에 그대로 옮겨 넣음.
  "로컬 전용 작업" 줄에 이 앱 전용 항목(App Check·Sentry·예산 알림 콘솔 확인, `?pairing=1`
  라이브 코드 제출 확인)을 덧붙임. 문서만 바뀜(DOC-STANDARD 180줄 이내).

## 2026-09-27 — React 19.3.0 업그레이드 (지시 Bumm 9/27)

- `react`·`react-dom`·`@types/react`·`@types/react-dom`을 19.1.1 계열에서 19.3.0으로
  올림. 이번엔 이 네 패키지만 — Vite·TypeScript 등은 건드리지 않음(한 번에 한 변화).
  린트·`tsc -b --noEmit`·vitest(119 통과)·`rules:test`(에뮬레이터 6개 통과)·빌드 전부
  로컬 통과, 새로 생긴 경고 없음. 로컬 dev 서버에서 프렙 1→2단계 선택·전환·콘솔 에러
  0건 확인. 업그레이드 직전 지점을 `classcade-freeze-20260927-pre-react1930` 태그로
  고정.

## 2026-09-11 — 로딩 화면 두 바퀴 하한 (COMMON_STANDARDS §27)

- 모든 로딩 인터루드(프렙 완료·NBTI 시작/재시작/복귀/결과 전환, 총 6곳)의 점 애니메이션
  (`entry-pulse`, 1.2초 주기)이 실제로는 2.2~2.6초 만에 다음 화면으로 넘어가 빠른/캐시
  조건에서 두 바퀴(2.4초)를 못 채우고 끊길 수 있었다. `MIN_LOADING_DISPLAY_MS`(2400ms)
  상수를 도입해 6곳 전부 이 값 기준으로 최소 표시 시간을 계산하도록 통일했고, 기존
  타임아웃 상한(자산 디코드 대기 4.6초 등)은 손대지 않았다.
- 검증: vitest로 인터루드 하나를 fake timer로 재서 2320ms 시점엔 아직 전환 안 됨·
  2480ms 시점엔 전환됨을 확인, 고치기 전 값(22)으로 되돌려 실제로 레드가 뜨는 것까지
  확인 후 복구(`src/features/journey/scenes/NbtiScenes.test.tsx`). 실제 개발 서버에서
  세션을 시드해 재방문(캐시 있음) 조건으로 클릭→화면 전환까지 MutationObserver로
  정밀 측정, 4,626ms 동안 떠 있는 것(하한 2,400ms 대비 여유) 확인.

## 2026-09-10 — 종합감사 10/10, 배포 파이프라인 정비

- 카카오톡 공유 카드를 Portal 기준으로 통일, `_docs/CHANGELOG.md` 신설,
  DOC-STANDARD 기준 문서 정리(CLAUDE.md 82→38줄, `_docs/ops/rollback.md`
  신설), COMMON_STANDARDS §7 방식 종합감사 10/10(연속 2회
  배포 실패를 일으키던 배포 워크플로의 산출물 검증 결함과 CSP 값 미검증
  결함 발견·수정, npm audit devDependency 12건→8건, App.test.tsx 간헐
  실패 수정), `classcade-freeze-20260910-audited-100` 태그.
- COMMON_STANDARDS §23 지시로 배포 워크플로를 test/changes/deploy/
  firestore-rules 잡으로 분리 — 문서 전용 커밋은 배포를 건너뛴다.
  (`8b4ea54`)

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
