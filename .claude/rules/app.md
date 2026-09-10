# CLASSCADE 개별 규칙
헌법(D:\Projects\CLAUDE.md → _shared/CONVENTIONS.md, COMMON_STANDARDS.md)에 없는 것만.

## 앱
- 무엇: 교사가 교실 NBTI 16문항을 풀고 성향에 맞는 같이교육 놀이 영상을 추천받는 몰입형 웹 앱
- 사용자: 실사용 중인 교사 (전시·시연이 아니라 상시 서비스)
- 배포: **Firebase Hosting** — `main` 푸시 시 `.github/workflows/deploy.yml`이 자동 배포한다. 주소는 `https://classcade.edutogether.kr`. 2026-09-09에 GitHub Pages에서 이전했다: Pages는 응답 헤더를 설정할 수 없어 CSP를 `<meta>`로만 둘 수 있었고 `frame-ancestors` 같은 지시어는 아예 적용되지 않았다. 보안 헤더는 `firebase.json`의 `hosting.headers`에 있다.

## 배포 폴더
- `firebase.json`의 `hosting.public` = `dist`. 이 파일은 Firestore 규칙과 Hosting(재작성·응답 헤더)을 **둘 다** 담는다 — 2026-09-09 Firebase Hosting 이전 때 `hosting` 블록이 추가됐다.
- 산출물은 `dist/`이고 Vite가 생성한다. `_docs/`·`.claude/`는 `dist/`에 들어가지 않는다(빌드 입력이 `index.html`과 `src/`, `public/`뿐). 확인일 9/10

## 데이터
- 개인정보·미성년자 데이터: **학생 정보는 일절 수집하지 않는다.** 교사 본인에 대해 5개 항목만 받는다 — 학교급·교직 경력 구간·지역(광역)·성장 우선순위(최대 3개, 기타 30자)·닉네임(16자). 이름·이메일·전화·학교명은 어떤 항목에서도 받지 않는다.
- 보관·삭제 정책: 기본은 `sessionStorage`(탭을 닫으면 소멸). `?device=personal`로 접속한 경우에만 `localStorage`. 선생님 패널의 "전체 여정 초기화"로 즉시 삭제 가능. 서버에 남는 것은 페어링 사용 시의 `pairingSessions` 문서뿐이며 5분 후 조회 불가가 된다.
- rules: `firestore.rules` 있음 + `npm run rules:test`로 에뮬레이터 테스트(CI에서도 실행). Storage는 사용하지 않아 `storage.rules` 없음(의도적 생략).

## 운영 콘솔 설정 (코드로 확인 불가 — 대표가 직접 설정한 값의 기록)

감사 세션은 이 값들을 코드로 검증할 수 없다. 아래는 대표가 콘솔에서 직접 설정하고 확인해준 실제 상태이므로, 감사 시 "확인 불가"로 남기지 말고 이 기록을 근거로 삼는다(값이 바뀌면 대표가 알려줄 때 여기를 갱신한다).

- **GCP 예산 알림 (2026-09-07 설정 완료)**: `classcade-budget-alert`, 프로젝트 `classcade-together`, 월 ₩25,000, 임계값 50%/90%/100%, 이메일 알림 켜짐. **Alerts only — spend cap enforcement가 아니다**: 한도를 넘어도 서비스가 자동으로 멈추지는 않고 메일만 온다.
- **App Check enforcement (2026-09-07 전환 완료)**: Cloud Firestore를 Monitoring → **Enforced**. 전환 직전 검증된 요청 100%/미검증 0%를 확인한 뒤 진행했고, 전환 후 라이브(`?pairing=1`)에서 여섯 자리 코드를 실제 제출해 Firestore 조회가 정상 통과하는 것("코드를 찾지 못했어요" = 정상 invalid 응답, 네트워크·권한 오류 아님)과 콘솔 에러 0건을 확인함.
- **App Check — Authentication(PREVIEW)은 Monitoring 유지**: 아직 정식 기능이 아니고, 잘못 걸리면 로그인이 전면 차단되는 위험이 Firestore보다 크다는 판단. 정식 출시되면 그때 재검토한다.
- **Sentry DSN 등록 (2026-09-08 완료)**: Sentry 프로젝트 생성 + GitHub Actions secret `VITE_SENTRY_DSN` 등록 완료. 배포 번들 실측으로 확인함 — DSN 문자열(`...ingest.us.sentry.io/4512045242449920`)과 `Sentry.init` 옵션 객체(`sendDefaultPii`/`replaysOnErrorSampleRate`)가 실제로 들어가 있다(등록 전에는 이 둘 다 번들에서 0건이라 `initErrorReporting()`이 통째로 죽은 코드였음). 이제 `reportError()` 호출이 프로덕션에서 실제로 전송된다. 처리방침(`public/privacy.html` §3)의 Sentry 고지는 등록 **전에** 먼저 반영해뒀으므로 지금은 문구와 실제 동작이 일치한다.

**⚠️ App Check Enforced와 CSP는 서로 묶여 있다**(CSP는 2026-09-09 이전으로 `index.html`의 `<meta>`가 아니라 `firebase.json`의 `hosting.headers`에 있다). Enforced 상태에서는 App Check 토큰이 없으면 Firestore가 요청을 아예 거부한다. 그 토큰은 reCAPTCHA v3 스크립트(`www.google.com`/`www.gstatic.com`)를 받아와야 발급되므로, CSP의 `script-src`/`frame-src`에서 이 두 도메인을 빼면 페어링이 경고 수준이 아니라 **완전히 막힌다**. CSP를 조이는 변경을 할 때는 반드시 라이브 `?pairing=1`에서 여섯 자리 코드 제출까지 실제로 확인할 것(현재 조합은 2026-09-09 새 도메인에서 재검증 완료).

## 이 앱에서 절대 하면 안 되는 것

- **`edutogether.kr` 커스텀 도메인을 이 저장소에 다시 설정하지 않는다.** 그 도메인은 2026-08-13에 `edutogether/portal`로 이전됐고 지금 그쪽이 쓰고 있다. 여기에 CNAME 파일이 하나라도 들어가면 Pages가 도메인을 다시 이 앱으로 가져가 포털이 즉시 깨진다. 배포 워크플로에 방어 가드가 있지만 가드를 지우는 것도 금지.

- **페어링 서브시스템은 보류(아카이브)된 기능이다 — 결함으로 잡거나 삭제를 제안하지 않는다.** 코드발급 UI가 도달 불가한 것은 버그가 아니라 Bumm님이 두 차례 확인해 내린 결정(2026-08-26)이다. 감사에서 감점하지 않고(COMMON_STANDARDS §4-4), "되살릴까 지울까"는 이미 닫힌 질문이라 다시 올리지 않는다. 모바일·PC 에셋이 완성되어 화면을 더 안 고치는 시점에 UX 3안 중 하나로 재설계하며 그때 함께 의논한다.

  재설계할 때 **함께 풀어야 할 것들** (지금 고치지 말 것, 목록으로만 유지):
  - `src/features/pairing/pairingContract.ts:24` — 이관 코드를 `Math.random()`으로 만든다. 프로필과 NBTI 답변 전체를 넘기는 토큰이므로 `crypto.getRandomValues`로 바꿔야 한다.
  - `firestore.rules`의 `allow get` — 6자리 형식만 요구해서 이론상 10⁶개 전수 조회로 `waiting` 세션의 payload를 읽을 수 있다. 코드 자릿수를 늘리거나 시도 제한이 필요하다.
  - `src/features/pairing/activePairingCode.ts`, `src/features/journey/JourneyApp.tsx:27-29` — `lib/storage.ts` 어댑터를 우회해 `localStorage`를 직접 만진다. 특히 페어링 게이트 키는 "전체 여정 초기화"를 살아남는다.
  - `src/features/pairing/PairingScreens.tsx:19` — 썸네일 `<img>`에 `referrerPolicy="no-referrer"`가 빠져 결과 화면과 불일치한다.
  - Firestore 콘솔 — `pairingSessions.expiresAt`에 TTL 정책이 없어 만료 문서가 계속 쌓인다.
  - `?pairing=1`(`PairingEntryScene`) 진입자는 개인정보 처리방침에 도달할 방법이 없다. 프렙 5단계와 결과 화면에는 링크가 있지만 이 진입 경로는 둘 다 거치지 않는다(2026-09-08 Playwright 실측: 링크 0개). 이 화면이 동결 대상이라 그때 함께 처리한다.

- **CSP에서 아래를 빼지 않는다.** CSP는 2026-09-09 이전 이후 `index.html`의 `<meta>`가 아니라 **`firebase.json`의 `hosting.headers`**에 있다(`index.html`에는 그 사실을 알리는 주석만 남아 있다). 각각을 빼면 조용히 기능이 죽는다(에러가 눈에 띄지 않는다):
  - `script-src`/`frame-src`의 `https://www.google.com`, `https://www.gstatic.com` — App Check의 reCAPTCHA v3 스크립트가 여기서 온다. **Firestore App Check가 Enforced로 전환된 뒤(2026-09-07)로는 토큰이 없으면 Firestore가 요청을 거부하므로, 이걸 빼면 페어링이 경고가 아니라 완전히 차단된다.**
  - `connect-src`의 `https://*.ingest.us.sentry.io` — Sentry 전송 대상이다. 실제로 2026-09-08에 이게 빠진 채 배포되어 모니터링이 전량 차단된 적이 있다.
  - CSP를 조이는 변경을 할 때는 반드시 라이브에서 `?pairing=1`에 여섯 자리 코드를 넣어 제출까지 해보고(정상이면 "코드를 찾지 못했어요"), 콘솔에 CSP 위반이 없는지 확인한다.
  - 배포 워크플로의 스모크 검사가 이 다섯 가지 허용(`script-src`의 google·gstatic, `frame-src`의 google, `connect-src`의 sentry, `frame-ancestors 'none'`)을 **값까지** 대조해 하나라도 빠지면 배포를 실패시킨다(2026-09-10 추가). 헤더가 있는지만 보던 이전 검사는 이 다섯 개를 다 빼도 통과했다. 기대 목록은 워크플로에 직접 적혀 있다 — `firebase.json`에서 읽어오면 감시 대상과 항상 같아져 감시가 되지 않기 때문이다.

- **`prep-03-map-master.webp`를 "중복 파일"이라는 이유로 지우지 않는다.** 이 파일은 `prep-world-backdrop-16x9-v2.webp`와 SHA-256이 같지만 중복이 아니라 **의도된 자리표시자**다 — 3단계 아트모드의 지역 지도 원화가 아직 없어서 배경 이미지를 임시로 같은 경로에 놓아둔 것이고, 그 취지가 `src/components/prep/prepAssets.ts`의 import 주석에 적혀 있다("swap the real drawing in at this exact path, no code change needed"). 해시 기준으로 중복 자산을 훑는 정리 작업이 이걸 지우면 진짜 원화가 들어올 자리가 사라지고 3단계 아트모드 렌더가 깨진다. 빌드 시 Vite가 두 참조를 한 파일로 합치므로 방문자가 받는 바이트는 애초에 늘지 않는다.

- **`firebase.json`의 `Cache-Control: no-cache`를 `**/*.html` 같은 패턴으로 좁히지 않는다.** 그 패턴은 **루트 요청(`/`)에 매칭되지 않아** Firebase 기본값 `max-age=3600`이 걸리고, 그러면 배포 후 최대 1시간 동안 재방문자가 옛 HTML(=옛 자산 해시)을 받습니다. 2026-09-09 이전 작업에서 실제로 이렇게 나가서 실측으로 잡았습니다. 전역 `**` 블록에 `no-cache`를 두고 `/assets/**`(해시 붙은 자산)만 immutable로 덮는 지금 구조를 유지하세요. JSON이라 이 설명을 파일 안에 주석으로 둘 수 없어 여기 적습니다.

- **PC/모바일 화면의 시각 디자인(배치·색·간격·아트)을 임의로 바꾸지 않는다.** Bumm님이 직접 픽셀 단위로 다듬는 영역이다. 동작 버그와 접근성 결함은 정상적으로 고친다.

## 카카오톡 공유 카드
- `index.html`의 og/twitter 태그는 Portal(`apps.ts`) 기준 문구·그림으로 통일한다(2026-09-10). 그림은 Portal(`edutogether.kr/assets/og/classcade.jpg`) 원본을 받아 `public/og.jpg`로 이 저장소 자체 도메인에서 배포한다 — Portal 쪽 배포가 막혀도 이 앱 카드는 영향받지 않게 하기 위해서다.
- **포털이 카드 그림·문구를 바꾸면 여기도 같이 바꾼다.** `og:title` 규칙은 `{앱 이름} | {hook}` 형식으로 6개 앱이 동일하다.

## 명령
- 테스트: `npm run test` (vitest + `tsc -b --noEmit`)
- 린트: `npm run lint`
- 로컬 실행: `npm run dev`
- 빌드: `npm run build`
- 에뮬레이터(Firestore 규칙 테스트): `npm run rules:test` — JDK 21 필요

## 주소를 바꿀 때 반드시 함께 하는 것 (2026-09-09 이전에서 확인)

배포 주소가 바뀌면 **코드만 고쳐서는 앱이 조용히 죽습니다.** 콘솔 쪽 세 곳을 같이 해야 하고, 이건 대표님만 할 수 있습니다.

1. **Firebase 맞춤 도메인 추가** + DNS(CNAME)를 새 주소 → `classcade-together.web.app`으로.
2. **reCAPTCHA 승인 도메인에 새 도메인 추가.** App Check가 Firestore에서 **Enforced**이고 reCAPTCHA의 **`출처 확인(Verify the origin)`이 켜져 있어서**, 새 도메인이 목록에 없으면 토큰 발급이 403으로 막히고 **Firestore 요청이 전부 거부**됩니다. 경고가 아니라 차단입니다.
3. **Firebase 인증 승인된 도메인에 새 도메인 추가.** 익명 로그인이 페어링에 쓰입니다.

코드 쪽은 `.github/workflows/deploy.yml`의 `VITE_SITE_URL` 한 곳뿐입니다(`canonical`·`og:url`·OG 이미지가 전부 여기서 나옵니다). `VITE_BASE_PATH`는 Firebase가 루트로 서빙하므로 `/` 그대로 둡니다.

**확인 방법**: 새 도메인에서 `?pairing=1`에 아무 여섯 자리나 넣고 제출해 **"코드를 찾지 못했어요"**가 나오면 정상입니다(그 응답이 나온다는 건 App Check·익명 로그인·Firestore가 전부 통과했다는 뜻). 403이나 "네트워크를 확인해 주세요"가 나오면 위 2·3번이 안 먹은 것입니다. **헤드리스 브라우저로는 검증할 수 없습니다** — reCAPTCHA v3가 자동화를 차단해 정상 상태에서도 403이 납니다. 실제 브라우저나 헤드 모드로 확인하세요.

## 자주 틀리는 것

- **설정값이 비어 있거나 막혀 있어도 빌드·배포는 조용히 성공한다.** 두 번 났다: 2026-08-17 Firebase 시크릿 4종이 워크플로에 주입되지 않아 프로덕션 페어링이 항상 실패, 2026-09-08 CSP `connect-src`가 Sentry 전송을 막아 모니터링 이벤트가 0건. 둘 다 빌드·테스트·배포가 전부 초록이었다. 시크릿 4종은 이제 CI가 빌드 전에 막지만, **"각각은 검증을 통과했는데 합쳐지니 서로를 무효화하는"** 조합은 여전히 자동으로 안 잡힌다 — 설정을 건드렸으면 라이브에서 그 기능이 실제로 동작하는지 눈으로 확인한다.

- **반대 방향도 난다 — 배포가 실패했는데 라이브가 멀쩡해 보인다.** 2026-09-10, `public/og/classcade-share-v2.png`를 지운 뒤에도 워크플로의 "Verify build artifact"가 그 파일을 계속 단언해서 **연속 두 번의 배포가 실패**했다. 라이브는 직전 성공분(`b13f97c`)을 그대로 서빙하고 있어 화면상 아무 이상이 없었고, 아무도 몇 시간 동안 눈치채지 못했다. 그 사이에 급한 수정을 push했다면 조용히 안 나갔을 것이다. **push한 뒤에는 `gh run list --limit 1 --json headSha,conclusion`으로 "방금 그 커밋"의 실행 결과를 확인한다**("최근 실행"이 아니라 — COMMON_STANDARDS §21-7). 그리고 **산출물을 지울 때는 그것을 단언하는 CI 줄이 있는지 함께 본다.**

- **유닛 테스트가 전부 통과해도 실제 브라우저에서만 드러나는 결함이 있다.** 두 번 났다: 2~4단계 이전/다음 버튼이 미완성 "PLACEHOLDER" 문구가 박힌 PNG였던 것, 모바일에서 1단계 안내 문구가 넘쳐 "다음 질문" 버튼을 덮어 폰에서는 1단계를 통과할 수 없었던 것. 화면에 영향 있는 변경은 실제 브라우저에서 데스크톱·모바일 폭 둘 다 확인한다.
