import { useMemo, useState } from 'react'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { CLASSCADE_VIDEO_CATALOG, rankVideos, recommendationTags } from '../../../data/completionExperience'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import type { JourneyState } from '../journeyState'

function Thumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(!src)
  if (failed) return <span className="result-rec__thumb result-rec__thumb--fallback" aria-hidden="true"><CompassSeal /></span>
  return <span className="result-rec__thumb"><img src={src} alt="" onError={() => setFailed(true)} /></span>
}

/** Recommendations opened straight from the result screen — the game builder and the
 *  notebook-pairing flow are no longer part of this path. */
export function ResultRecommendations({ state }: { state: JourneyState }) {
  const result = getProvisionalResult(state.resultCode)
  /* No game data on this path, so conditions/candidate are null: the ranking runs on the
     NBTI direction tags alone. Backfilled so the panel always has three to show. */
  const videos = useMemo(() => {
    const tags = recommendationTags(result.directions, null, null, {})
    const ranked = rankVideos(tags, null).map((entry) => entry.video)
    const seen = new Set(ranked.map((video) => video.id))
    const fill = CLASSCADE_VIDEO_CATALOG.filter((video) => video.published && !seen.has(video.id))
    return [...ranked, ...fill].slice(0, 3)
  }, [result.directions])
  const [message, setMessage] = useState('')

  /* Share must be called synchronously inside the handler (iOS drops the gesture after
     an await). Desktop browsers mostly lack navigator.share, so copying the link is the
     documented fallback — the teacher pastes it into KakaoTalk's 나와의 채팅. */
  function sendToChat(title: string, url: string) {
    setMessage('')
    if (navigator.share) {
      navigator.share({ title, text: `${title} · 같이교육`, url })
        .then(() => setMessage('공유 창을 열었어요. 카카오톡 → 나와의 채팅을 고르면 나에게 보낼 수 있어요.'))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
          copyLink(url)
        })
      return
    }
    copyLink(url)
  }

  function copyLink(url: string) {
    navigator.clipboard?.writeText(url)
      .then(() => setMessage('링크를 복사했어요. 카카오톡 → 나와의 채팅에 붙여넣으면 저장됩니다.'))
      .catch(() => setMessage('복사에 실패했어요. 영상 링크를 길게 눌러 복사해 주세요.'))
  }

  return (
    <aside className="result-rec journey-enter" aria-label="같이교육 추천 영상">
      <p className="journey-kicker">WAITING BONUS</p>
      <h2>기다리는 동안 둘러보세요 ✨</h2>
      <p className="result-rec__lead">{result.title} 성향에 맞춘 같이교육의 짧은 활동 영상이에요.</p>
      <div className="result-rec__list">
        {videos.map((video) => (
          <article key={video.id}>
            <a href={video.youtubeUrl} target="_blank" rel="noreferrer" aria-label={`${video.title} - 같이교육 영상 보기`}><Thumb src={video.thumbnailUrl} /></a>
            <div>
              <h3>{video.title}</h3>
              <small>{video.duration} · {video.materials}</small>
              <div className="result-rec__actions">
                <a href={video.youtubeUrl} target="_blank" rel="noreferrer">영상 보기 ↗</a>
                <button type="button" onClick={() => sendToChat(video.title, video.youtubeUrl)}><Icon name="share" size={14} />나에게 보내기</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="result-rec__message" aria-live="polite">{message}</p>
    </aside>
  )
}
