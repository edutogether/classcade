/**
 * 자산 계측기 — 배경 이미지 낭비와 개인정보 처리방침 도달성을 실제 브라우저로 잰다.
 *
 * 왜 별도 스크립트인가
 *   vitest(jsdom)는 실제 네트워크 요청도, 미디어쿼리 평가도 하지 못해서 "몇 바이트를
 *   받았는가"를 잴 수 없다. 구조 회귀는 vitest가 자동으로 잡고 있고(아래 참고), 이
 *   스크립트는 그 구조가 실제로 몇 바이트를 아끼는지 숫자로 확인하는 정밀 계측기다.
 *   매 커밋 돌릴 것이 아니라 배경·자산·CSS 미디어쿼리를 건드렸을 때 돌린다.
 *
 * 무엇을 재는가 / 정상값은 무엇인가  (2026-09-08 실측 기준)
 *   1. 뷰포트별 배경 이미지 요청
 *        정상: 각 뷰포트에서 배경은 정확히 1개. 낭비 0 B.
 *        결함일 때: 데스크톱·모바일 배경을 둘 다 받아 482,836 B 중 절반을 버린다.
 *        (숨긴 <img>도 브라우저는 받는다. <picture><source media>가 이걸 막는다.)
 *   2. 진입 경로별 처리방침 링크 수
 *        정상: /?type=ESTJ → 1개 이상.
 *        참고: / (프렙 1단계)는 0개가 정상 — 링크는 프렙 5단계에 있다.
 *              /?pairing=1 은 0개가 현재 상태이며 미해결 항목이다(동결된 페어링 화면이라
 *              고치지 않았다. .claude/rules/app.md 의 페어링 재설계 목록 참고).
 *
 * 픽셀 동일성에 대해
 *   <picture> 전환이 화면을 바꾸지 않았다는 것은 2026-09-08에 수정 전/후 스크린샷을
 *   pixelmatch로 대조해 확인했다(1920x1080 2,073,600픽셀 중 0개, 390x844 329,160픽셀 중
 *   0개 차이). 그 비교는 "수정 전" 빌드가 있어야 성립하므로 이 스크립트에 상시 검사로
 *   넣지 않았다 — 기준 스크린샷을 저장소에 두면 대표님이 화면을 다듬을 때마다 실패해서
 *   오히려 신뢰를 잃는다. 배경 로딩 방식을 다시 바꿀 일이 생기면 그때 같은 방법으로
 *   수정 전/후를 직접 비교할 것.
 *
 * 실행 방법 (Playwright는 devDependency가 아니다 — 저장소 무게를 늘리지 않으려고 뺐다)
 *   1) npm run build && npx vite preview --port 4180
 *   2) 다른 터미널에서:
 *        npm i -g playwright && npx playwright install chromium   # 최초 1회
 *        node scripts/measure-assets.mjs http://localhost:4180/
 *      배포본을 직접 재려면 URL 자리에 https://edutogether.github.io/classcade/ 를 넣는다.
 *
 * 종료코드: 정상 0 / 기준 위반 1 (CI에 넣을 수 있게)
 */
const BASE = process.argv[2] ?? 'http://localhost:4180/'

let chromium
try {
  ({ chromium } = await import('playwright'))
} catch {
  console.error('playwright 가 없습니다. 이 스크립트는 의존성에 넣지 않았습니다 — 위 주석의 실행 방법을 참고하세요.')
  process.exit(1)
}

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 390, height: 844 },
]
/** 프렙 화면 배경으로 쓰이는 이미지들. 뷰포트당 하나만 받아야 한다. */
const BACKDROP = /backdrop|map-master/i

const browser = await chromium.launch()
let failed = false

console.log(`대상: ${BASE}\n`)
console.log('① 뷰포트별 배경 이미지 요청 (정상: 각 1개, 낭비 0 B)')
for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await context.newPage()
  const hits = []
  page.on('response', async (res) => {
    if (!BACKDROP.test(res.url()) || !/\.(webp|png|jpe?g)$/i.test(res.url())) return
    let bytes = null
    try { bytes = (await res.body()).length } catch { /* 리다이렉트·중단된 요청 */ }
    hits.push({ file: res.url().split('/').pop(), bytes })
  })

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('.entry-prep', { timeout: 15000 })
  await page.waitForTimeout(1500)

  const wasted = hits.slice(1).reduce((sum, h) => sum + (h.bytes ?? 0), 0)
  const ok = hits.length === 1
  if (!ok) failed = true
  console.log(`   ${ok ? '통과' : '실패'} ${vp.name} ${vp.width}x${vp.height} — 배경 ${hits.length}개, 낭비 ${wasted.toLocaleString()} B`)
  for (const h of hits) console.log(`      ${h.file}  ${h.bytes?.toLocaleString() ?? '?'} B`)
  await context.close()
}

console.log('\n② 진입 경로별 처리방침 링크 (정상: ?type= 에서 1개 이상)')
for (const path of ['', '?type=ESTJ', '?pairing=1']) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const count = await page.evaluate(() =>
    document.querySelectorAll('a[href*="privacy.html"]').length)
  const required = path === '?type=ESTJ'
  if (required && count < 1) failed = true
  const note = required ? (count >= 1 ? '통과' : '실패') : '참고'
  console.log(`   ${note} /${path || ' (프렙 1단계)'} — 링크 ${count}개`)
  await context.close()
}

await browser.close()
console.log(failed ? '\n기준 위반이 있습니다.' : '\n전부 기준을 만족합니다.')
process.exit(failed ? 1 : 0)
