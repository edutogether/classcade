# CLASSCADE 개별 규칙
헌법(D:\Projects\CLAUDE.md → _shared/CONVENTIONS.md, COMMON_STANDARDS.md)에 없는 것만.

## 앱
- 무엇: 교사가 교실 NBTI 16문항을 풀고 성향에 맞는 같이교육 놀이 영상을 추천받는 몰입형 웹 앱
- 사용자: 실사용 중인 교사 (전시·시연이 아니라 상시 서비스)
- 배포: **GitHub Pages** — 헌법 3.2의 명시적 예외. `main` 푸시 시 `.github/workflows/deploy-pages.yml`이 자동 배포한다. Firebase Hosting을 쓰지 않는 이유는 `edutogether.kr`이 portal 저장소로 넘어갔고(2026-08-13) 이 앱은 `edutogether.github.io/classcade` 기본 URL을 그대로 쓰기로 확정됐기 때문이다.

## 배포 폴더
- Firebase Hosting을 쓰지 않으므로 `firebase.json`에 `hosting`/`public` 항목이 **없다** — 이 파일은 `firestore.rules` 배포 전용이다.
- Pages 산출물은 `dist/`이고 Vite가 생성한다. `_docs/`·`.claude/`는 `dist/`에 들어가지 않는다(빌드 입력이 `index.html`과 `src/`, `public/`뿐). 확인일 9/8

## 데이터
- 개인정보·미성년자 데이터: **학생 정보는 일절 수집하지 않는다.** 교사 본인에 대해 5개 항목만 받는다 — 학교급·교직 경력 구간·지역(광역)·성장 우선순위(최대 3개, 기타 30자)·닉네임(16자). 이름·이메일·전화·학교명은 어떤 항목에서도 받지 않는다.
- 보관·삭제 정책: 기본은 `sessionStorage`(탭을 닫으면 소멸). `?device=personal`로 접속한 경우에만 `localStorage`. 선생님 패널의 "전체 여정 초기화"로 즉시 삭제 가능. 서버에 남는 것은 페어링 사용 시의 `pairingSessions` 문서뿐이며 5분 후 조회 불가가 된다.
- rules: `firestore.rules` 있음 + `npm run rules:test`로 에뮬레이터 테스트(CI에서도 실행). Storage는 사용하지 않아 `storage.rules` 없음(의도적 생략).

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

- **`index.html`의 CSP에서 아래를 빼지 않는다.** 각각을 빼면 조용히 기능이 죽는다(에러가 눈에 띄지 않는다):
  - `script-src`/`frame-src`의 `https://www.google.com`, `https://www.gstatic.com` — App Check의 reCAPTCHA v3 스크립트가 여기서 온다. **Firestore App Check가 Enforced로 전환된 뒤(2026-09-07)로는 토큰이 없으면 Firestore가 요청을 거부하므로, 이걸 빼면 페어링이 경고가 아니라 완전히 차단된다.**
  - `connect-src`의 `https://*.ingest.us.sentry.io` — Sentry 전송 대상이다. 실제로 2026-09-08에 이게 빠진 채 배포되어 모니터링이 전량 차단된 적이 있다.
  - CSP를 조이는 변경을 할 때는 반드시 라이브에서 `?pairing=1`에 여섯 자리 코드를 넣어 제출까지 해보고(정상이면 "코드를 찾지 못했어요"), 콘솔에 CSP 위반이 없는지 확인한다.

- **`prep-03-map-master.webp`를 "중복 파일"이라는 이유로 지우지 않는다.** 이 파일은 `prep-world-backdrop-16x9-v2.webp`와 SHA-256이 같지만 중복이 아니라 **의도된 자리표시자**다 — 3단계 아트모드의 지역 지도 원화가 아직 없어서 배경 이미지를 임시로 같은 경로에 놓아둔 것이고, 그 취지가 `src/components/prep/prepAssets.ts`의 import 주석에 적혀 있다("swap the real drawing in at this exact path, no code change needed"). 해시 기준으로 중복 자산을 훑는 정리 작업이 이걸 지우면 진짜 원화가 들어올 자리가 사라지고 3단계 아트모드 렌더가 깨진다. 빌드 시 Vite가 두 참조를 한 파일로 합치므로 방문자가 받는 바이트는 애초에 늘지 않는다.

- **`firebase.json`의 `Cache-Control: no-cache`를 `**/*.html` 같은 패턴으로 좁히지 않는다.** 그 패턴은 **루트 요청(`/`)에 매칭되지 않아** Firebase 기본값 `max-age=3600`이 걸리고, 그러면 배포 후 최대 1시간 동안 재방문자가 옛 HTML(=옛 자산 해시)을 받습니다. 2026-09-09 이전 작업에서 실제로 이렇게 나가서 실측으로 잡았습니다. 전역 `**` 블록에 `no-cache`를 두고 `/assets/**`(해시 붙은 자산)만 immutable로 덮는 지금 구조를 유지하세요. JSON이라 이 설명을 파일 안에 주석으로 둘 수 없어 여기 적습니다.

- **PC/모바일 화면의 시각 디자인(배치·색·간격·아트)을 임의로 바꾸지 않는다.** Bumm님이 직접 픽셀 단위로 다듬는 영역이다. 동작 버그와 접근성 결함은 정상적으로 고친다.

## 명령
- 테스트: `npm run test` (vitest + `tsc -b --noEmit`)
- 린트: `npm run lint`
- 로컬 실행: `npm run dev`
- 빌드: `npm run build`
- 에뮬레이터(Firestore 규칙 테스트): `npm run rules:test` — JDK 21 필요

## 자주 틀리는 것

- **설정값이 비어 있거나 막혀 있어도 빌드·배포는 조용히 성공한다.** 두 번 났다: 2026-08-17 Firebase 시크릿 4종이 워크플로에 주입되지 않아 프로덕션 페어링이 항상 실패, 2026-09-08 CSP `connect-src`가 Sentry 전송을 막아 모니터링 이벤트가 0건. 둘 다 빌드·테스트·배포가 전부 초록이었다. 시크릿 4종은 이제 CI가 빌드 전에 막지만, **"각각은 검증을 통과했는데 합쳐지니 서로를 무효화하는"** 조합은 여전히 자동으로 안 잡힌다 — 설정을 건드렸으면 라이브에서 그 기능이 실제로 동작하는지 눈으로 확인한다.

- **유닛 테스트가 전부 통과해도 실제 브라우저에서만 드러나는 결함이 있다.** 두 번 났다: 2~4단계 이전/다음 버튼이 미완성 "PLACEHOLDER" 문구가 박힌 PNG였던 것, 모바일에서 1단계 안내 문구가 넘쳐 "다음 질문" 버튼을 덮어 폰에서는 1단계를 통과할 수 없었던 것. 화면에 영향 있는 변경은 실제 브라우저에서 데스크톱·모바일 폭 둘 다 확인한다.
