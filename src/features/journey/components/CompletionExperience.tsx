import { useMemo, useState } from 'react'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { rankVideos, recommendationTags } from '../../../data/completionExperience'
import { getGameCandidate } from '../../../data/classroomGameBuilder'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import type { JourneyAction, JourneyState } from '../journeyState'

type Props = { state: JourneyState; onAction: (action: JourneyAction) => void; onNextParticipant?: () => void }

function VideoThumbnail({ src }: { src?: string }) {
  const [failed, setFailed] = useState(!src)
  return <div className="completion-video__thumb">{failed ? <CompassSeal /> : <img src={src} alt="" onError={() => setFailed(true)} />}</div>
}

export function CompletionExperience({ state, onAction, onNextParticipant }: Props) {
  const result = getProvisionalResult(state.resultCode); const candidate = getGameCandidate(state.selectedGameId, state.gameConditions)
  const tags = useMemo(() => recommendationTags(result.directions, state.gameConditions, candidate, state.gameAdjustments), [candidate, result.directions, state.gameAdjustments, state.gameConditions])
  const videos = useMemo(() => rankVideos(tags, state.gameConditions), [tags, state.gameConditions])
  const [message, setMessage] = useState('')

  if (!candidate) return null

  /* The 2026-08-12 rework replaced the canvas share-image with a plain-text game card:
     the point of sharing is handing the actual play instructions to colleagues, and text
     survives every messenger. */
  const gameCardText = [
    `🎲 CLASSCADE 우리 반 게임 · ${candidate.title}`,
    `${candidate.people} · ${candidate.duration} · ${candidate.space} · 준비물: ${candidate.materials}`,
    '',
    '[준비]',
    ...candidate.preparation.map((item) => `- ${item}`),
    '',
    '[진행 순서]',
    ...candidate.steps.map((item, index) => `${index + 1}. ${item}`),
    '',
    '[규칙과 운영]',
    ...candidate.rules.map((item) => `- ${item}`),
    `- 변형: ${candidate.variation}`,
    `- 마무리: ${candidate.closing}`,
    '',
    '[같이교육 추천 영상]',
    ...videos.slice(0, 2).map(({ video }) => `- ${video.title}: ${video.youtubeUrl}`),
    '',
    `${result.title} 선생님의 CLASSCADE · 같이교육`,
  ].join('\n')

  const markShared = () => onAction({ type: 'SET_COMPLETION_STATE', recommendationTags: tags, recommendedVideoIds: videos.map(({ video }) => video.id), shareCardFormat: 'story', shareCardGenerated: true, lastCompletedStep: 'share-card-generated' })

  function copyCard() {
    navigator.clipboard?.writeText(gameCardText)
      .then(() => setMessage('놀이 카드를 복사했어요. 카카오톡·메모 등 어디든 붙여넣어 전달하세요.'))
      .catch(() => setMessage('복사에 실패했어요. 화면의 내용을 직접 드래그해 복사해 주세요.'))
    markShared()
  }

  /* navigator.share must run synchronously in the click handler (iOS drops the user
     gesture after any await); text-only payloads are safe everywhere it exists. */
  function shareCard() {
    setMessage('')
    if (!navigator.share) { copyCard(); return }
    navigator.share({ title: `CLASSCADE 우리 반 게임 · ${candidate!.title}`, text: gameCardText })
      .then(() => { setMessage('공유 창을 열었어요 - 동료 선생님께 놀이 카드를 전달해 주세요.'); markShared() })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') { setMessage('공유를 취소했어요.'); return }
        copyCard()
      })
  }

  return <section className="completion-experience" aria-label="같이교육 추천과 놀이 공유">
    <header><p className="journey-kicker">같이교육 추천</p><h2>우리 반의 다음 장면</h2><p>완성한 게임의 조건과 성향을 바탕으로 추천 태그를 만들었어요.</p></header>
    <div className="completion-tags" aria-label="추천 태그">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    {videos.length ? <div className="completion-videos">{videos.map(({ video, matchedTags }) => <article key={video.id}><a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="completion-video__thumb-link" aria-label={`${video.title} - 같이교육 영상 보기`}><VideoThumbnail src={video.thumbnailUrl} /></a><div><h3>{video.title}</h3><p>{video.shortDescription}</p><small>{video.duration} · {video.materials}</small><p className="completion-video__reason">{matchedTags.slice(0, 3).map((tag) => `#${tag}`).join(' ')} 조건과 일치해 추천합니다.</p><a href={video.youtubeUrl} target="_blank" rel="noreferrer">같이교육 영상 보기</a></div></article>)}</div> : <div className="completion-videos__empty"><Icon name="notebook" size={28} /><div><b>현재 조건에 맞는 공개 영상을 찾지 못했습니다.</b><p>다른 게임 조건을 선택하거나, 다음 공개 영상이 추가될 때 다시 확인해 주세요.</p></div></div>}
    <div className="completion-primary-actions">
      <button type="button" className="completion-share-button" onClick={shareCard}><Icon name="share" size={18} />놀이 카드 공유하기</button>
      <button type="button" className="completion-done-button" onClick={() => onNextParticipant ? onNextParticipant() : onAction({ type: 'GO_HOME' })}>완료</button>
    </div>
    <p className="completion-share__message" aria-live="polite">{message}</p>
    <button className="completion-restart" type="button" onClick={() => onAction({ type: 'RESET_NBTI' })}><Icon name="reset" size={18} />처음부터 다시 시작하기</button>
  </section>
}
