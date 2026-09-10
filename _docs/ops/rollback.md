# 롤백 절차

배포 후 실사용자에게 영향을 주는 문제가 발견됐을 때 되돌리는 절차. 두 가지
방법이 있다 — 상황에 맞는 쪽을 쓴다.

## 방법 A — Firebase Hosting 콘솔에서 즉시 되돌리기 (가장 빠름, 대표 전용)

Firebase Hosting은 배포마다 릴리스 이력을 남기고 직전 릴리스로 즉시 되돌리는
기능을 콘솔에서 제공한다(코드 변경·재배포 없이 몇 초 안에 적용됨). Firebase
콘솔 → Hosting → 릴리스 이력에서 되돌릴 릴리스를 선택해 진행한다. **이건
Firebase 프로젝트 콘솔 접근 권한이 있는 사람만 할 수 있다** — 세션은 콘솔에
접근할 수 없으므로 이 방법은 대표가 직접 수행한다.

이 방법은 **`main` 브랜치를 되돌리지 않는다** — 다음에 누군가 `main`에 push하면
문제가 있던 코드가 다시 배포된다. 근본 원인은 반드시 방법 B로 코드 자체를
되돌리거나 고쳐야 한다.

## 방법 B — git으로 코드 자체를 되돌리기 (근본 해결, 세션이 수행 가능)

이 저장소는 주요 지점마다 `classcade-freeze-*` 태그를 남긴다(`git tag -l`로
목록 확인). 각 태그는 그 시점에 실제로 검증됐던 상태다. `.githooks/pre-push`가
기존 freeze 태그의 삭제·이동을 막는다(새 클론에서는
`git config core.hooksPath .githooks`로 활성화해야 보호가 걸린다 — 이 값이
이미 설정돼 있는지는 `git config core.hooksPath`로 확인).

1. 되돌릴 지점 확인: `git tag -n99 -l 'classcade-freeze-*'`로 태그 메시지를
   읽고, `CLAUDE.md`의 "현재 상태" 절에서 가장 최근 유효한 복구 지점을 확인한다.
2. 문제가 된 커밋만 되돌릴 수 있으면(권장 — 범위가 좁다):
   `git revert <문제 커밋 SHA>` 후 `git push origin main` — 자동으로
   `.github/workflows/deploy.yml`이 재배포한다.
3. 여러 커밋을 한 번에 되돌려야 하면(freeze 지점으로 완전히 복귀):
   `git revert --no-commit <freeze 태그>..HEAD && git commit` 후 push. **`git
   reset --hard`로 `main`을 되돌리지 않는다** — 이미 push된 커밋을 강제로
   지우면 원격 이력이 깨지고 다른 세션·Codex 작업과 충돌한다. 항상 `revert`로
   새 커밋을 쌓아 되돌린다.
4. push 후 `.github/workflows/deploy.yml`의 스모크 체크가 라이브 응답에
   보안 헤더 5종이 실려 있는지, 그리고 CSP 안에서 App Check(reCAPTCHA)와
   Sentry가 의존하는 허용 5가지가 값까지 그대로인지 자동 확인한다 — 실패하면
   배포 자체가 실패로 끝나 옛 상태가 그대로 남는다(=안전).
   **다만 "배포 실패 = 라이브 안전"은 동시에 "고친 것이 나가지 않았다"는 뜻이기도
   하다.** 2026-09-10에 배포가 이틀 연속 실패했는데 라이브가 멀쩡해 보여서 아무도
   눈치채지 못한 일이 있었다. push 뒤에는 `gh run list --limit 1 --json headSha`로
   **그 커밋의** 실행이 성공했는지 확인한다(최근 실행이 아니라 방금 만든 커밋의 것).
5. 되돌린 뒤 라이브에서 실제로 문제가 사라졌는지 브라우저로 확인한다
   (`.claude/rules/app.md`의 "자주 틀리는 것" — 빌드·배포가 초록이어도
   실제 동작은 별도로 확인해야 한다).

## 콘솔 설정(App Check·CSP·Sentry)은 git으로 안 돌아온다

Firebase 콘솔에서 대표가 직접 설정한 값(App Check enforcement, 예산 알림,
reCAPTCHA 승인 도메인 등, `.claude/rules/app.md`의 "운영 콘솔 설정" 참고)은
git 되돌리기로 원상복구되지 않는다. 이 값들이 원인인 장애라면 콘솔에서 대표가
직접 되돌려야 한다.
