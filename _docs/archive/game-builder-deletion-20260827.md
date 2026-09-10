# 2026-08-27 — 게임빌더 서브시스템 완전 삭제 (완료, 대표 결정)

> `CLAUDE.md`에서 2026-09-10 문서 정리 때 옮겨왔다. 완전히 끝난 사건 기록이라
> 더 이상 "지금 유효한 규칙"이 아니지만, 근거로 남긴다. 요약은
> `_docs/CHANGELOG.md`의 2026-08-27 항목 참고.

2026-08-25 발견된 문제("코드발급 미호출로 페어링 구조적 도달 불가능")를 다시 들여다보니, `disconnectedScenes()`에 갇혀 있던 게 페어링(코드발급 UI) 하나가 아니라 그 뒤에 이어지는 **교실 게임 만들기 전체(9/12 스테이지 — game_intro~sharing)** 였다는 게 2026-08-26 재감사에서 드러났다. 대표는 이 둘을 분리해서 결정했다:

- **페어링(코드발급 UI, `PairingScene`)** — 여전히 **보류**(`CLAUDE.md`의 LOCKED 섹션 참고, 안 바뀜).
- **게임 만들기 서브시스템** — **완전 삭제로 결정**("나중에 다시 만들 수도 있지만 지금 이 상태로는 아니다, 시기 미정"). 삭제 완료됨:
  - `scenes/GameScenes.tsx`(196줄), `data/classroomGameBuilder.ts`(198줄), `data/gameVariants.provisional.ts`(66줄), `components/CanonicalGameScene.tsx`(37줄), `components/CompletionExperience.tsx`(80줄) 전부 삭제.
  - 게임빌더 전용 아트 3장 + 이미 죽어있던 고아 PNG 1장(`concept-selection-master.png`, 3.5MB) 삭제.
  - `JourneyStage`/`JourneyState`/`JourneyAction`에서 game_* 필드·액션 전부 제거, `version` 2→**3**으로 올려 옛 형식의 저장된 세션은 안전하게 폐기되도록 함(파싱 실패 시 새 여정으로 폴백하는 기존 메커니즘 그대로 재사용).
  - `recommendationTags`/`rankVideos`(둘 다 살아있는 "놀이 추천" 기능이 씀)에서 항상 `null`이던 조건 필터링 인자를 제거해 시그니처 단순화 — 실제 동작은 완전히 동일(원래도 조건이 늘 null이었음).
  - README/AGENTS.md의 "우리 반 게임 만들기" 관련 서술 제거·정정.
  - 검증: tsc/eslint/vitest(71개 통과)/build/rules:test 전부 통과 + 실브라우저로 시작→NBTI 16문항→결과→놀이추천 골든패스 전체 재확인(콘솔 에러 0).

**⚠️ 부수 발견 — 코드로 못 고치는 것(2026-09-10 기준 아직 미해결, `.claude/rules/app.md` "알려진 이슈"로 이관)**: 시작 화면 퀘스트보드와 결과 화면 팻말에 "학급 게임 연결" / "우리 반 게임 만들기"라는 문구가 **정적 아트 이미지에 직접 그려져(painted) 있음** — 라이브 DOM 텍스트가 아니라서 코드 수정으로 안 고쳐짐. 새 아트를 받거나 크롭/가리기 전까지는 화면에 남아있는 상태(`start-master-v4.webp`, 결과 화면 배경 아트). 다음 아트 작업 라운드에서 같이 처리 필요.

이 정리로 첫 화면 번들이 게임빌더 코드/아트만큼은 줄었지만(index 청크 실측 801.73KB, 이후 2026-09-02·09-09 추가 최적화로 더 줄었다 — 최신 수치는 `CLAUDE.md`/CI 빌드 로그 참고), 페어링이 여전히 보류 상태라 Firebase SDK는 그대로 딸려 들어간다 — 로딩 무게 문제의 근본 해결은 페어링 결정이 나야 완결된다.
