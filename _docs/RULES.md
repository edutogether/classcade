# RULES — CLASSCADE 규칙 장부

> Bumm님이 정하거나 바로잡은 것을 **들은 그 자리에서 한 줄로** 적는 장부다(헌법 §12, `COMMON_STANDARDS.md` §38).
> 대화에만 두면 요약 · 전달 · 다음 날에서 샌다. 팀장이 전한 지시도 받은 세션이 여기에 적는다.
> 일을 시작하기 전에 이 표를 끝까지 읽고, 그 일에 걸린 규칙을 **모두** 검사기에 넣는다.
> 바뀐 규칙은 지우지 않고 상태를 «대체됨 → R-n»으로 바꾼다. 사고의 사연은 `.claude/rules/app.md`에 두고 여기엔 규칙만.
> 이 파일은 `CLAUDE.md`의 `@_docs/RULES.md`로 세션마다 저절로 읽힌다 — 한 규칙 한 줄로 짧게 쓰고, 대체된 줄이 쌓이면
> `_docs/archive/RULES-superseded.md`로 옮긴다(번호는 그대로). 일을 시작할 때와 완료 보고에 «읽은 것: R-3 · R-7»을 적는다.
> 원본 양식: `D:\Projects\_shared\doc-kit\`

**«검사» 칸**: 검사기 이름(`scripts/…`, 시험 이름) · «직접 열어 확인»(실제 프로그램으로 연다) · «검사기 없음» 셋 중 하나.
«검사기 없음»이 남아 있으면 그 규칙은 지켜진다는 보장이 없는 것이다 — 그 규칙이 걸린 일을 시작하기 전에 검사기를 만든다.

**«Bumm님 원문» 칸**: 원문을 이 대화 기록에서 확인할 수 있는 줄만 «»로 적었다. 나머지는 출처 문서를 적었다(원문이 없는 줄을 지어내지 않는다).

| 번호 | 날짜 | 범위 | 규칙 | Bumm님 원문 | 검사 | 상태 |
|---|---|---|---|---|---|---|
| R-1 | 2026-11-14 | 전체(말 · 문서 · 커밋) | 모든 답 · 진행 설명 · 다른 세션에 보내는 메시지 · 보고 · 커밋 설명을 한국어로만 쓴다. 코드 · 명령어 · 파일 이름 · 원문 인용만 원래 표기 | «뭐라고 얘기하는지 하나도 모르겠어 한글로 말해라» (출처: `CLAUDE.md` 맨 위) | 직접 열어 확인(커밋 메시지 · 보고) | 유효 |
| R-2 | 2026-11-14 | 문서 수정 | 팀장이 전한 지시는 Bumm님 지시다 — `CLAUDE.md` · `AGENTS.md` · `.claude/rules/` 수정과 커밋은 재확인 없이 한다. 예외는 `.claude/settings*.json` 하나(Bumm님이 이 창에 직접 지시할 때만) | 출처: `CLAUDE.md` 맨 위, COMMON_STANDARDS §9 | 검사기 없음 | 유효 |
| R-3 | 2026-09-11 | 전체(세션이 쓰는 모든 글) | 앱은 정식 이름 «CLASSCADE» 하나로만 부른다. 줄임말 · 별명 · 번역어 금지 | 출처: `_shared/constitution.md` §2 | 검사기 없음 | 유효 |
| R-4 | 2026-10-01 | 화면 문구 · 대화 · 문서 | 느낌표 앞에는 한 칸을 띄운다(`촬영 완료 !`). 코드 연산자 · 명령어 · URL · 원문 인용은 제외 | 출처: COMMON_STANDARDS §32 | 검사기 없음 | 유효 |
| R-5 | 2026-10-31 | 배포가 필요한 push | push 전에 팀장에게 «배포 직전 한 줄»을 보내고 «승인» 답을 받은 뒤 push한다. 화면 차이가 0이어도 같다. 지시 메시지가 명시적으로 «이 메시지가 승인»이라 하면 따로 보내지 않는다 | 출처: `.claude/rules/app.md` 「자주 틀리는 것」 | 검사기 없음 | 유효 |
| R-6 | 2026-09-10 | push 뒤 | push한 뒤에는 «그 커밋»의 CI 실행 결과를 `gh run list --json headSha,…`로 확인한다. 산출물을 지울 때는 그것을 단언하는 `deploy.yml` 줄도 같은 커밋에서 고친다 | 출처: `.claude/rules/app.md`, COMMON_STANDARDS §21-7 | `deploy.yml`의 Verify build artifact(`require_file`) | 유효 |
| R-7 | 2026-08-13 | 배포 · 도메인 | `edutogether.kr` 커스텀 도메인을 이 저장소에 다시 설정하지 않는다(포털이 쓰는 중). CNAME 파일 금지, 워크플로의 방어 가드도 지우지 않는다. 이 앱은 `classcade.edutogether.kr`만 쓴다 | 출처: `CLAUDE.md` LOCKED | `deploy.yml` 방어 가드 | 유효 |
| R-8 | 2026-08-26 | 페어링(`src/features/pairing/`) | 페어링은 보류(아카이브)된 기능이다. 결함으로 잡거나 감점하거나 삭제를 제안하지 않고 «되살릴까 지울까»를 다시 묻지 않는다. 임의로 손대지 않는다(1회성 예외 4건은 `CLAUDE.md` LOCKED에 기록) | 출처: `CLAUDE.md` LOCKED(대표 결정 2026-08-26, 2026-09-07 표현 정정) | 직접 열어 확인(diff에 pairing 경로가 있는지) | 유효 |
| R-9 | 2026-08-27 | 게임 만들기 | 게임 만들기 서브시스템은 코드 · 데이터 · 아트 전부 삭제됐다. 되살리거나 «아직 구현 전»으로 서술하지 않는다 | 출처: `AGENTS.md` Mission 정정, `_docs/archive/game-builder-deletion-20260827.md` | 검사기 없음 | 유효 |
| R-10 | 2026-09-07 | CSP(`firebase.json` `hosting.headers`) | `script-src`/`frame-src`의 `www.google.com` · `www.gstatic.com`, `connect-src`의 `*.ingest.us.sentry.io`, `frame-ancestors 'none'`을 빼지 않는다. CSP를 조이면 라이브 `?pairing=1`에서 여섯 자리 제출까지 확인한다 | 출처: `.claude/rules/app.md` | `deploy.yml` CSP 스모크(값까지 대조) | 유효 |
| R-11 | 2026-09-09 | `firebase.json` 캐시 헤더 | `Cache-Control: no-cache`를 `**/*.html` 같은 패턴으로 좁히지 않는다. 전역 `**`에 `no-cache`, `/assets/**`만 immutable인 구조를 유지한다 | 출처: `.claude/rules/app.md` | 직접 열어 확인(라이브 `/` 응답 헤더) | 유효 |
| R-12 | 2026-09-10 | `prep-03-map-master.webp` | «중복 파일»이라는 이유로 지우지 않는다. 3단계 아트모드 지도 원화의 의도된 자리표시자다 | 출처: `.claude/rules/app.md` | 검사기 없음 | 유효 |
| R-13 | 2026-08-02 | PC · 모바일 화면 | 시각 디자인(배치 · 색 · 간격 · 아트)을 임의로 바꾸지 않는다. Bumm님이 픽셀 단위로 다듬는 영역이다. 동작 버그와 접근성 결함은 정상적으로 고친다 | 출처: `.claude/rules/app.md`, `AGENTS.md` | 직접 열어 확인(PC · 모바일 폭 둘 다) | 유효 |
| R-14 | 2026-11-11 | 연출(CSS · 코드) | «움직임 줄이기»(`prefers-reduced-motion`) 신호로 연출을 멈추지 않는다. 이 미디어 쿼리를 다시 넣지 않는다(여덟 앱 공통). 확인은 `emulateMedia({ reducedMotion })` reduce · no-preference 둘 다에서 `document.getAnimations()`가 running인지 본다 | «여덟 앱 모두, 움직임 줄이기와 상관없이 늘 정상처럼 돌게» (팀장 전달, 출처: `.claude/rules/app.md`) | `src/lib/reducedMotion.test.ts` | 유효 |
| R-15 | 2026-11-01 | Firebase CLI | `firebase-tools`를 `package.json` · 잠금 파일에 두지 않고 `npx --yes firebase-tools@<정확한 판>`로 부른다(현재 15.37.0: `deploy.yml` 2곳 + `rules:test`). `@latest` · 범위 금지. 판을 올릴 때 3곳을 사람이 같이 바꾼다 | 출처: `.claude/rules/app.md`, CONVENTIONS §3.7 | 검사기 없음 | 유효 |
| R-16 | 2026-11-19 | 의존성 · 도구 판 | 앱도 컴퓨터도 안정된 최신판만 보관하고 지난 판은 지운다. Dependabot에 맡겨 두지 않고 직접 올린다(Node 26, 고정 판 최신화 포함). `package.json`의 `overrides`는 지우거나 낮추지 않는다 | «지금 아홉 앱을 전부 올린다. 앱도 컴퓨터도 최신 버전만 보관하고, 겹치는 이전 버전은 보관하지 않는다.» (팀장 전달, 출처: `_docs/CHANGELOG.md` 2026-11-19) | `npm audit` 0건 · `npm run test` | 유효 |
| R-17 | 2026-11-19 | 에뮬레이터 포트 | 에뮬레이터 포트는 `firebase.json`의 `emulators`에 6300~6308로 고정한다. 시험 · 스크립트에 포트 숫자를 박지 않고 `FIRESTORE_EMULATOR_HOST`에서 읽는다 | 출처: COMMON_STANDARDS §37(팀장 전달 2026-11-19) | `npm run rules:test` | 유효 |
| R-18 | 2026-10-05 | Sentry | `src/lib/errorReporting.ts`의 `dataCollection`(`infer_ip: 'never'` 포함)을 지우거나 느슨하게 하지 않는다. Sentry로 나가는 오류에는 페이지 주소의 `?…` · `#…`를 싣지 않는다 | 출처: `.claude/rules/app.md` | `errorReporting.test.ts` · `errorReporting.url.test.ts` | 유효 |
| R-19 | 2026-10-10 | 경로 이동 | `location` · `history`에 경로를 넣을 땐 `samePagePath()`(`src/lib/pagePath.ts`)를 거친다 | 출처: `.claude/rules/app.md` | `pagePath.test.ts` | 유효 |
| R-20 | 2026-10-10 | 배포 잡 | `deploy` · `firestore-rules` 잡은 `main`에서만 돌고 `environment: production`에 붙는다. 이 조건을 지우지 않고, 비밀 6종은 저장소 수준 비밀로 둔다 | 출처: `.claude/rules/app.md` | 직접 열어 확인(`deploy.yml`) | 유효 |
| R-21 | 2026-10-05 | 워크플로 `uses:` | 액션은 태그가 아니라 커밋 SHA로 고정하고 뒤에 `# vX.Y.Z`를 단다. 새 버전은 Dependabot PR로 받아 `pr-checks`가 초록일 때 병합한다 | 출처: `.claude/rules/app.md` | 직접 열어 확인(`deploy.yml` · `pr-checks.yml`) | 유효 |
| R-22 | 2026-10-07 | 파비콘 | 탭 · 즐겨찾기 파비콘은 CLASSCADE 엠블럼 한 개로 고정하고 탭 포커스에 따라 바꾸지 않는다(회색 전환 폐기, 되살리지 않는다). 그림을 바꾸면 `index.html` 아이콘 링크의 `?v=`(날짜)도 같이 올린다 | 출처: `.claude/rules/app.md`, COMMON_STANDARDS §33 | `deploy.yml`(파일 존재만) · 직접 열어 확인 | 유효 |
| R-23 | 2026-09-08 | 개인정보 | 학생 정보는 일절 수집하지 않는다. 교사 본인 5개 항목(학교급 · 경력 구간 · 지역 · 성장 우선순위 · 닉네임)만 받고 이름 · 이메일 · 전화 · 학교명은 받지 않는다. 처리방침(`public/privacy.html`)의 문구와 실제 동작을 일치시킨다 | 출처: `.claude/rules/app.md` 「데이터」 | 검사기 없음 | 유효 |
| R-24 | 2026-09-10 | 카카오톡 공유 카드 | `index.html`의 og/twitter 태그는 Portal 기준 문구 · 그림(`{앱 이름} \| {hook}`)으로 통일한다. 포털이 바꾸면 여기도 같이 바꾼다 | 출처: `.claude/rules/app.md` | 직접 열어 확인(og 태그) | 유효 |
| R-25 | 2026-09-22 | 브라우저 확인 | 확인은 세션 자체 브라우저(Browser 패널 · 헤드리스)로 한다. Bumm님 Chrome은 지시 시 또는 로그인이 필요한 «쓰기» 작업일 때만, 쓰기 전에 팀장에게 먼저 보고한다. 소리는 끄고 탭은 닫는다. 확인 도중 제품 기본 동작은 바꾸지 않는다 | 출처: `.claude/rules/app.md` 「브라우저」, 헌법 §5 | 검사기 없음 | 유효 |
| R-26 | 2026-10-06 | 캡처 | Bumm님께 보여 주는 캡처는 원본 해상도로 찍는다(PC 2560 가로 이상, 모바일 3배). 전/후는 따로 파일, 합성 · 축소본 금지 | 출처: 헌법 §5(2026-10-06 Bumm님 지시) | 직접 열어 확인 | 유효 |
| R-27 | 2026-09-08 | 화면 변경 | 화면에 영향 있는 변경은 실제 브라우저에서 데스크톱 · 모바일 폭 둘 다 확인한다(유닛 테스트 통과만으로 끝내지 않는다). 가로 넘침 · 한글 잘림 · 일그러진 그림이 없어야 한다 | 출처: `.claude/rules/app.md`, `AGENTS.md` Quality checks | 직접 열어 확인 | 유효 |
| R-28 | 2026-10-09 | 보고 | 앱 세션은 팀장 지시 하나에 보고를 한 번만 보낸다(끝 · 막힘 · 결정 필요). 결정 질문은 AskUserQuestion이 아니라 «번호 + 선택지 + ⭐추천 + 근거»로 팀장에게 SendMessage한다. 발송이 막히면 다시 시도하지 않고 창의 마지막 말로 남긴다 | «왜 메시징 안 하고 지네꺼에 띄우냐, 일일이 내가 들어가야 되게» (2026-10-10, 출처: 헌법 §9) | 검사기 없음 | 유효 |
| R-29 | 2026-09-08 | 코드 품질 | 한 번에 완성한다 — «일단 · 차선책 · 우회 · 나중에»와 `TODO`/`FIXME`/`임시` 금지. 검사를 느슨하게 하거나 빼서 통과시키지 않는다. 제대로 못 하면 멈추고 보고한다 | 출처: 헌법 §7, `AGENTS.md` | `npm run lint` · 직접 열어 확인(diff) | 유효 |
| R-30 | 2026-10-31 | 점수 · 복구 지점 | 새 freeze 태그를 찍을 때 `CLAUDE.md`의 현재 상태 줄(태그 이름 · 점수)도 같은 날 갱신한다. 점수는 `10/10`에 트리 날짜를 붙이고 커밋 건수를 박지 않는다. 저장소가 공개이므로 취약점 상세를 커밋 · CHANGELOG · 문서에 쓰지 않는다 | 출처: `CLAUDE.md` 현재 상태, COMMON_STANDARDS §4 | 검사기 없음 | 유효 |
| R-31 | 2026-11-21 | 규칙 장부 | Bumm님의 지시는 들은 자리에서 이 장부에 적는다. 일을 시작할 때와 완료 보고에 «읽은 것: RULES R-n, RUNBOOK §n»을 적는다. 자잘한 수정 중에는 전체 검사기를 돌리지 않고 한 덩어리가 끝나면 한 번 돌린다 | «중간중간 지시한 게 새는 것도 엄청 많고, 해 놓은 줄 알았는데 나중에 보면 엉망인 적도 많다» (출처: 헌법 §12) | 직접 열어 확인(보고 양식) | 유효 |
