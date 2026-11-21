# RUNBOOK — CLASSCADE

> 이 저장소에서 되풀이하는 일을 **그대로 따라 하면 끝나는 순서**로 적는다. 명령은 복사해서 바로 돌릴 수 있게 쓰고,
> 단계마다 «됐는지 확인하는 법»을 붙인다. 무엇을 지켜야 하는지는 `_docs/RULES.md`, 함정이 생긴 사연은
> `.claude/rules/app.md`에 있다 — 이 문서는 «어떻게 하나»만 다룬다(원본 양식: `D:\Projects\_shared\doc-kit\`).
> 일을 시작할 때 그 일의 절을 열고, 첫 진행 설명과 완료 보고에 «읽은 것: RUNBOOK §1»을 적는다.
> 검사기는 자잘하게 고치는 동안 돌리지 않는다 — 한 덩어리가 끝나면 «이제 검사기를 한 번에 돌리겠습니다»라고 알리고 한 번 돌린다.

## 목차

| 일 | 언제 하나 | 절 |
|---|---|---|
| 로컬 실행 | 화면 · 동작을 눈으로 볼 때 | §1 |
| 검사(린트 · 테스트 · 빌드) | 한 덩어리 수정이 끝났을 때 | §2 |
| Firestore 규칙 시험 | 규칙 · 페어링 · 의존성을 건드렸을 때 | §3 |
| 배포(push) | 팀장 승인을 받은 뒤 | §4 |
| 배포 후 라이브 확인 | push 직후 | §5 |
| 화면 변경 확인 | 화면에 영향 있는 변경 | §6 |
| CSP · 보안 헤더 변경 | `firebase.json` 헤더를 건드릴 때 | §7 |
| 의존성 · 도구 판 올리기 | 정기 최신화, 팀장 지시 | §8 |
| 복구 지점(freeze 태그) | 큰 변경 전, 감사 뒤 | §9 |
| 롤백 | 배포 뒤 실사용 문제가 나왔을 때 | §10 |
| 에셋 계측 | 배경 이미지 · CSS 미디어쿼리를 건드렸을 때 | §11 |

## 1. 로컬 실행

- **언제**: 화면이나 동작을 눈으로 확인할 때
- **시작 전에 읽을 규칙**: `RULES.md` R-13, R-14, R-25
- **순서**
  1. `npm run dev` → **확인**: 터미널에 로컬 주소가 뜨고 첫 화면이 열린다
  2. 세션 자체 브라우저(Browser 패널)로 연다 → **확인**: 콘솔 오류 0건, 제목 CLASSCADE
  3. 확인이 끝나면 서버를 끄고 탭을 닫는다
- **끝나면 남길 것**: 없음(확인만)
- **막히면**: 포트가 이미 쓰이면 서버를 끄고 다시 띄운다. 다른 앱의 서버를 끄지 않는다

## 2. 검사(린트 · 테스트 · 빌드)

- **언제**: 한 덩어리 수정이 끝났을 때(글자 하나 고치는 동안에는 돌리지 않는다)
- **시작 전에 읽을 규칙**: `RULES.md` R-29, R-31
- **순서**
  1. `npm run lint` → **확인**: 오류 0건으로 끝난다
  2. `npm run test` → **확인**: vitest 전부 통과(건너뛴 시험은 에뮬레이터 필요분), `tsc -b --noEmit` 오류 없음
  3. `npm run build` → **확인**: `dist/`가 생기고 오류 없이 끝난다
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄(배포가 나가는 변경이면)
- **막히면**: 첫 실행에서 시간 초과로 한 건 빨개지면 부하를 의심해 한 번 더 돌려 본다. 시험 코드를 건드려 통과시키지 않는다

## 3. Firestore 규칙 시험

- **언제**: `firestore.rules` · 페어링 · `firebase` 의존성을 건드렸을 때, 또는 §8 뒤
- **시작 전에 읽을 규칙**: `RULES.md` R-8, R-15, R-17
- **순서**
  1. JDK 21이 있는지 본다: `java -version` → **확인**: 21
  2. `npm run rules:test` → **확인**: `Tests 12 passed (12)`, 로그에 firestore websocket 6304가 찍힌다
- **끝나면 남길 것**: 없음
- **막히면**: 포트는 `firebase.json`의 `emulators`(6300~6308)에 고정돼 있다 — **포트를 바꾸지 말고** 점유한 프로세스(`netstat -ano | grep 630`)가 끝나기를 기다렸다 다시 돌린다. 호출 한도 시험이 5초 제한을 넘기면 부하이므로 재실행한다

## 4. 배포(push)

- **언제**: 팀장 «승인»을 받은 뒤(`main` push = 라이브 배포)
- **시작 전에 읽을 규칙**: `RULES.md` R-5, R-6, R-20, R-30
- **순서**
  1. §2를 돌려 통과를 확인한다
  2. 배포가 필요한 변경이면 팀장에게 «배포 직전 한 줄»(무엇 · 화면 차이 · 복구 지점)을 보내고 «승인» 답을 기다린다. 상관없는 일만 계속한다
  3. 승인 뒤 `git push origin main` (force push 금지, 파일은 구체적으로 stage) → **확인**: `a4192ce..1452d63  main -> main`처럼 범위가 찍힌다
  4. 그 커밋의 실행 결과를 본다:

     ```powershell
     gh run list --limit 6 --json headSha,conclusion,status,name
     ```

     → **확인**: 방금 push한 SHA의 `Deploy CLASSCADE to Firebase Hosting`과 `Push on main`이 `completed/success`
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄, 팀장에게 결과 한 번 보고
- **막히면**: 실패하면 로그의 원인 한 줄을 팀장에게 보고한다. 배포 실패는 라이브가 옛 상태로 남는 것이라 «안전하지만 고친 것이 나가지 않음»이다. 문서만 바뀐 push는 `changes` 잡이 배포를 건너뛴다. Node 26에서 `superstatic` EBADENGINE 경고는 알려진 것이고 배포는 성공한다

## 5. 배포 후 라이브 확인

- **언제**: §4 직후
- **시작 전에 읽을 규칙**: `RULES.md` R-25, R-10
- **순서**
  1. 세션 자체 브라우저로 `https://classcade.edutogether.kr`을 연다 → **확인**: 제목 CLASSCADE, 이미지 로드, 콘솔 오류 0건
  2. 페어링 · 의존성 · CSP를 건드렸으면 `https://classcade.edutogether.kr/?pairing=1`에서 여섯 자리(예: 950324)를 제출한다 → **확인**: «코드를 찾지 못했어요. 여섯 자리를 다시 확인해 주세요»가 뜬다(App Check 토큰 · 익명 로그인 · Firestore 통과). 403 · «네트워크를 확인해 주세요»면 실패
  3. 탭을 닫는다
- **끝나면 남길 것**: 팀장 보고에 확인 결과를 적는다
- **막히면**: 헤드리스 자동화(Playwright)는 reCAPTCHA 때문에 2번에서 403이 정상이다 — Browser 패널로 한다(2026-11-19 실측). 콘솔(Firebase · GCP) 값 확인은 Bumm님이 직접 하는 일이므로 팀장에게 보고한다

## 6. 화면 변경 확인

- **언제**: 화면에 영향 있는 변경(CSS · 컴포넌트 · 이미지)
- **시작 전에 읽을 규칙**: `RULES.md` R-13, R-14, R-26, R-27
- **순서**
  1. §1로 띄운다
  2. 데스크톱 1920×1080(또는 2560 가로)과 모바일 390×844 두 폭에서 본다 → **확인**: 가로 넘침 · 한글 잘림 · 일그러진 그림 없음, 포커스 표시 보임
  3. 연출을 건드렸으면 `emulateMedia({ reducedMotion })`의 reduce · no-preference 둘 다에서 `document.getAnimations()`가 running → **확인**: 둘 다 running
  4. Bumm님께 보여 줄 캡처는 원본 해상도로, 전/후를 따로 파일로 찍는다
- **끝나면 남길 것**: CHANGELOG 한 줄
- **막히면**: 배치 · 색 · 간격 · 아트는 임의로 바꾸지 않는다(R-13) — 필요하면 팀장에게 묻는다

## 7. CSP · 보안 헤더 변경

- **언제**: `firebase.json`의 `hosting.headers`를 건드릴 때
- **시작 전에 읽을 규칙**: `RULES.md` R-10, R-11, R-6
- **순서**
  1. `www.google.com` · `www.gstatic.com`(script-src · frame-src), `*.ingest.us.sentry.io`(connect-src), `frame-ancestors 'none'`이 그대로인지 diff로 본다 → **확인**: 하나도 빠지지 않았다
  2. §2 → §4로 배포한다. `deploy.yml`의 스모크가 값까지 대조한다 → **확인**: 배포 잡 success
  3. §5의 2번(여섯 자리 제출)까지 한다 → **확인**: 콘솔에 CSP 위반 없음
- **끝나면 남길 것**: CHANGELOG 한 줄, `app.md`에 새 함정이 생겼으면 그 자리에서 적는다
- **막히면**: 캐시 헤더(`no-cache`)를 `**/*.html`로 좁히지 않는다

## 8. 의존성 · 도구 판 올리기

- **언제**: 팀장 지시(안정된 최신판으로, 지난 판은 지운다)
- **시작 전에 읽을 규칙**: `RULES.md` R-15, R-16, R-17, R-21
- **순서**
  1. 동결 태그를 찍는다(§9) → **확인**: `git tag -l 'classcade-freeze-*'`에 보인다
  2. 가지를 따서 판을 올린다: `npm outdated` → 안정판만 `package.json`에 반영 → `npm install` → **확인**: `npm audit` 0건
  3. 고정 판 3곳(`deploy.yml` 2곳 + `package.json`의 `rules:test`)의 `firebase-tools@<판>`, 워크플로의 SHA 고정 액션도 최신 정식판으로 맞춘다
  4. §2, §3을 돌린다 → **확인**: 전부 통과
  5. PR → CI(`pr-checks` test · CodeQL) 초록 → 병합 → §4의 4번 → §5의 2번
- **끝나면 남길 것**: CHANGELOG에 전 → 후 판 목록, 올리지 못한 것과 이유 한 줄(예: typescript 7은 typescript-eslint peer 범위 때문에 6.0.3에서 멈춤)
- **막히면**: Dependabot PR은 손으로 닫지 않는다 — 이 갱신에 흡수되면 GitHub가 닫는다. `overrides`는 지우거나 낮추지 않는다. 판이 지원되지 않으면 낮추지 말고 팀장에게 한 줄 보고한다

## 9. 복구 지점(freeze 태그)

- **언제**: 큰 변경(의존성 · 도구 판 · 설정) 전, 종합감사 뒤
- **시작 전에 읽을 규칙**: `RULES.md` R-30
- **순서**
  1. `git tag classcade-freeze-<YYYYMMDD>-<이름>` → **확인**: `git tag -n99 -l 'classcade-freeze-*'`에 보인다
  2. `git push origin <태그>` → **확인**: `* [new tag]`
  3. 점수 기준 태그(감사 뒤)를 새로 찍으면 `CLAUDE.md` 「현재 상태」 줄을 같은 날 갱신한다
- **끝나면 남길 것**: CHANGELOG에 복구 지점 이름
- **막히면**: `.githooks/pre-push`가 기존 freeze 태그의 삭제 · 이동을 막는다. 새 클론에서는 `git config core.hooksPath .githooks`로 켠다. 현재 점수 기준 태그는 `classcade-freeze-20261031-audited-100`이다

## 10. 롤백

- **언제**: 배포 뒤 실사용자에게 영향을 주는 문제가 나왔을 때
- **시작 전에 읽을 규칙**: `RULES.md` R-5, R-6, R-7
- **순서**
  1. 문제 커밋만 되돌릴 수 있으면 `git revert <SHA>` → 팀장 승인 → `git push origin main` → **확인**: §4의 4번
  2. 여러 커밋이면 `git revert --no-commit <freeze 태그>..HEAD && git commit` 후 같은 순서. `git reset --hard`로 `main`을 되돌리지 않는다
  3. 가장 빠른 즉시 복구(Firebase 콘솔 Hosting 릴리스 이력)는 Bumm님이 직접 한다 — 팀장에게 보고한다
- **끝나면 남길 것**: CHANGELOG, `app.md`에 사고 사연
- **막히면**: 전체 절차는 `_docs/ops/rollback.md`

## 11. 에셋 계측

- **언제**: 배경 이미지나 CSS 미디어쿼리를 건드렸을 때
- **시작 전에 읽을 규칙**: `RULES.md` R-12, R-13
- **순서**
  1. Playwright가 의존성에 없으므로 최초 1회 스크래치 폴더에 설치한다(스크립트 맨 위 주석 참고)
  2. `npm run measure:assets <URL>` → **확인**: 스크립트 맨 위 주석의 정상값과 같다
- **끝나면 남길 것**: CHANGELOG 한 줄(수치가 바뀌었으면)
- **막히면**: `prep-03-map-master.webp`는 «중복»이어도 지우지 않는다(R-12)

## 따로 있는 상세 런북

- `_docs/ops/rollback.md` — 롤백 두 방법(콘솔 · git revert)과 스모크 실패 시 해석
- `_docs/ops/DOMAIN_ROLLBACK_20260802.md` — 도메인 이전 당시의 되돌리기 기록
- `_docs/ops/smoke.json` — 배포 후 스모크 기준값
