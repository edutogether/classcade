import { useEffect, useMemo, useState } from 'react'
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

/** 16개 유형별 고정 추천 2편 (2026-08-13 큐레이션). 카탈로그가 27편이라 일부 영상은
 *  두 유형에 겹쳐 배정됨 — 채널에 새 영상이 확보되면 이 표만 바꾸면 된다. */
const RESULT_VIDEO_PICKS: Record<string, readonly [string, string]> = {
  ESTJ: ['Xg1H8VxHHQw', '7HwVXE0nn_A'],
  ESTP: ['vavIDO8aylM', 'cXscAK2BNYY'],
  ESFJ: ['QcBhWQcgZ1M', 'ThrM-DF8LIk'],
  ESFP: ['lCXQViQsx68', 'UcjGov-rTaE'],
  ISTJ: ['V9-S5PSF18o', 'RLgcV1G-rsw'],
  ISTP: ['HLx2aITlp38', 'e2v9haWE8l8'],
  ISFJ: ['JfPPgWwpwIE', 'MDrhMgRtZ5o'],
  ISFP: ['WsLyuXeJYpE', '9rBMbog0Ni0'],
  ENTJ: ['3Do4tKizwGo', 'Xg1H8VxHHQw'],
  ENTP: ['wlworcNm5x0', 'Avcj1XyY1q4'],
  ENFJ: ['ThrM-DF8LIk', 'O-SvbyszcMI'],
  ENFP: ['_YdS72-_6k8', 'n-TorcNfaHE'],
  INTJ: ['rShRhcF-hzU', '2aFmilWMJp4'],
  INTP: ['In7CdmAs1qY', 'e2v9haWE8l8'],
  INFJ: ['zBZhr45zjh8', 'MDrhMgRtZ5o'],
  INFP: ['KzyngYUEm30', 'WsLyuXeJYpE'],
}

/** Recommendations opened straight from the result screen — the game builder and the
 *  notebook-pairing flow are no longer part of this path. Cards are thumbnail + title
 *  only; clicking opens YouTube, and the QR carries everything to the visitor's phone. */
export function ResultRecommendations({ state, mbti }: { state: JourneyState; mbti: string }) {
  const result = getProvisionalResult(state.resultCode)
  /* The booth laptop is shared and signed in to nobody, so links have nowhere to go.
     The QR hands the result to the participant's own phone instead. */
  const [qr, setQr] = useState<string | null>(null)
  const shareUrl = useMemo(() => {
    /* BASE_URL makes the QR follow the deployment path — on GitHub Pages the app lives
       under /classcade/, and origin + '/' would point at the portal instead. */
    const origin = typeof window === 'undefined' ? 'https://edutogether.github.io' : window.location.origin
    return `${origin}${import.meta.env.BASE_URL}?type=${mbti}`
  }, [mbti])
  useEffect(() => {
    let alive = true
    void QRCode.toDataURL(shareUrl, { margin: 1, width: 320, color: { dark: '#2b3a24', light: '#fffaf0' } })
      .then((value) => { if (alive) setQr(value) })
      .catch(() => { if (alive) setQr(null) })
    return () => { alive = false }
  }, [shareUrl])
  /* Fixed two picks per type; the tag ranking only backfills if a pick is unpublished. */
  const videos = useMemo(() => {
    const picks = RESULT_VIDEO_PICKS[mbti] ?? []
    const picked = picks.map((id) => CLASSCADE_VIDEO_CATALOG.find((video) => video.id === id && video.published)).filter((video) => video !== undefined)
    if (picked.length === 2) return picked
    const tags = recommendationTags(result.directions, null, null, {})
    const ranked = rankVideos(tags, null).map((entry) => entry.video).filter((video) => !picked.some((pick) => pick.id === video.id))
    return [...picked, ...ranked].slice(0, 2)
  }, [mbti, result.directions])

  return (
    <aside className="result-rec" aria-label="같이교육 추천 영상">
      <p className="journey-kicker">같이교육 PICK</p>
      <h2>나의 성향 놀이 추천 ✨</h2>
      <p className="result-rec__lead">선생님의 성향에 맞춘 같이교육의 추천 영상이에요.</p>
      <div className="result-rec__list">
        {videos.map((video) => (
          <article key={video.id}>
            <a href={video.youtubeUrl} target="_blank" rel="noreferrer" aria-label={`${video.title} - 같이교육 영상 보기`}><Thumb src={video.thumbnailUrl} /></a>
            <div>
              <h3>{video.title}</h3>
            </div>
          </article>
        ))}
      </div>
      <div className="result-rec__qr">
        {qr && <img src={qr} alt={`${result.title} 결과와 추천 영상을 여는 QR 코드`} />}
        <div>
          <b>폰으로 가져가기</b>
          <p>휴대폰 카메라로 QR을 비추면 내 폰에서 결과와 추천 영상이 열려요. 거기서 카카오톡 <b>나와의 채팅</b>으로 보내면 저장됩니다.</p>
        </div>
      </div>
    </aside>
  )
}
