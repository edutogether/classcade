import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { CompassSeal } from '../../../components/VisualPrimitives'
import { CLASSCADE_VIDEO_CATALOG, rankVideos, recommendationTags } from '../../../data/completionExperience'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import type { JourneyState } from '../journeyState'

function Thumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(!src)
  if (failed) return <span className="result-rec__thumb result-rec__thumb--fallback" aria-hidden="true"><CompassSeal /></span>
  return <span className="result-rec__thumb"><img src={src} alt="" onError={() => setFailed(true)} /></span>
}

/** 16개 유형별 고정 추천 2편 (2026-08-13 큐레이션, 같은 날 2차 개정).
 *  32칸 전원 서로 다른 영상 — 겹침 0. 카탈로그 32편 중 32편 사용. */
const RESULT_VIDEO_PICKS: Record<string, readonly [string, string]> = {
  ESTJ: ['Xg1H8VxHHQw', '7HwVXE0nn_A'],
  ESTP: ['vavIDO8aylM', 'cXscAK2BNYY'],
  ESFJ: ['QcBhWQcgZ1M', 'ThrM-DF8LIk'],
  ESFP: ['lCXQViQsx68', 'UcjGov-rTaE'],
  ISTJ: ['V9-S5PSF18o', 'RLgcV1G-rsw'],
  ISTP: ['HLx2aITlp38', 'e2v9haWE8l8'],
  ISFJ: ['JfPPgWwpwIE', 'MDrhMgRtZ5o'],
  ISFP: ['WsLyuXeJYpE', '9rBMbog0Ni0'],
  ENTJ: ['3Do4tKizwGo', 'a3CWqrC-4is'],
  ENTP: ['wlworcNm5x0', 'Avcj1XyY1q4'],
  ENFJ: ['poF_K05cWKc', 'O-SvbyszcMI'],
  ENFP: ['_YdS72-_6k8', 'n-TorcNfaHE'],
  INTJ: ['rShRhcF-hzU', '2aFmilWMJp4'],
  INTP: ['In7CdmAs1qY', 'RhkgPKafY0E'],
  INFJ: ['zBZhr45zjh8', 'RvfJM9IejXA'],
  INFP: ['KzyngYUEm30', 'EJ4SKGMw2lo'],
}

/** Recommendations opened straight from the result screen. Each card carries a QR that
 *  encodes THE VIDEO'S OWN YouTube URL — scanning opens YouTube directly on the phone,
 *  with no dependency on this app existing at any particular address. */
export function ResultRecommendations({ state, mbti }: { state: JourneyState; mbti: string }) {
  const result = getProvisionalResult(state.resultCode)
  /* Fixed two picks per type; the tag ranking only backfills if a pick is unpublished. */
  const videos = useMemo(() => {
    const picks = RESULT_VIDEO_PICKS[mbti] ?? []
    const picked = picks.map((id) => CLASSCADE_VIDEO_CATALOG.find((video) => video.id === id && video.published)).filter((video) => video !== undefined)
    if (picked.length === 2) return picked
    const tags = recommendationTags(result.directions, null, null, {})
    const ranked = rankVideos(tags, null).map((entry) => entry.video).filter((video) => !picked.some((pick) => pick.id === video.id))
    return [...picked, ...ranked].slice(0, 2)
  }, [mbti, result.directions])

  const [qrs, setQrs] = useState<Record<string, string>>({})
  useEffect(() => {
    let alive = true
    void Promise.all(videos.map((video) =>
      QRCode.toDataURL(video.youtubeUrl, { margin: 1, width: 240, color: { dark: '#2b3a24', light: '#fffaf0' } })
        .then((data) => [video.id, data] as const)
        .catch(() => null),
    )).then((entries) => { if (alive) setQrs(Object.fromEntries(entries.filter((entry) => entry !== null))) })
    return () => { alive = false }
  }, [videos])

  /* The panel's bottom edge is pinned to the primary CTA button's bottom edge — content
     length (description length varies by MBTI type) and viewport height both move that
     button, so this is measured live rather than approximated with a fixed CSS offset. */
  const panelRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const align = () => {
      const panel = panelRef.current
      const button = document.querySelector('.journey-result__actions .journey-button--primary')
      if (!panel || !button) return
      const buttonBottom = button.getBoundingClientRect().bottom
      const panelHeight = panel.getBoundingClientRect().height
      panel.style.top = `${Math.max(0, buttonBottom - panelHeight)}px`
    }
    align()
    const raf = requestAnimationFrame(align)
    window.addEventListener('resize', align)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', align) }
  }, [videos, qrs])

  return (
    <aside ref={panelRef} className="result-rec" aria-label="같이교육 추천 영상">
      <p className="journey-kicker">같이교육 PICK</p>
      <h2>나의 성향 놀이 추천 ✨</h2>
      <p className="result-rec__lead">선생님의 성향에 맞춘 같이교육의 추천 영상이에요.</p>
      <div className="result-rec__list">
        {videos.map((video) => (
          <article key={video.id}>
            <a href={video.youtubeUrl} target="_blank" rel="noreferrer" aria-label={`${video.title} - 같이교육 영상 보기`}><Thumb src={video.thumbnailUrl} /></a>
            <div className="result-rec__card-foot">
              <h3>{video.title}</h3>
              <small className="result-rec__desc">{video.shortDescription}</small>
              {qrs[video.id] && <span className="result-rec__card-qr"><img src={qrs[video.id]} alt={`${video.title} 유튜브로 바로 가는 QR`} /></span>}
            </div>
          </article>
        ))}
      </div>
    </aside>
  )
}
