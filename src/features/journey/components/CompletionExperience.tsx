import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { CompassSeal, Icon } from '../../../components/VisualPrimitives'
import { buildShareCardModel, rankVideos, recommendationTags, type ShareCardFormat, type ShareCardModel } from '../../../data/completionExperience'
import { getGameCandidate } from '../../../data/classroomGameBuilder'
import { getProvisionalResult } from '../../../data/nbtiResults.provisional'
import type { JourneyAction, JourneyState } from '../journeyState'

type Props = { state: JourneyState; onAction: (action: JourneyAction) => void; onNextParticipant?: () => void }

function VideoThumbnail({ src }: { src?: string }) {
  const [failed, setFailed] = useState(!src)
  return <div className="completion-video__thumb">{failed ? <CompassSeal /> : <img src={src} alt="" onError={() => setFailed(true)} />}</div>
}

function wrap(ctx: CanvasRenderingContext2D, value: string, width: number, lineHeight: number, x: number, y: number, maxLines: number) {
  const words = Array.from(value)
  let line = ''; let lineIndex = 0
  for (const character of words) {
    const next = line + character
    if (ctx.measureText(next).width > width && line) { ctx.fillText(line, x, y + lineIndex * lineHeight); line = character; lineIndex += 1; if (lineIndex >= maxLines) return }
    else line = next
  }
  if (lineIndex < maxLines) ctx.fillText(line, x, y + lineIndex * lineHeight)
}

async function loadImage(src: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src }) }

/** iOS Safari only allows navigator.share() when called synchronously inside the
 *  click handler - any `await` before it silently drops the user-gesture and the
 *  call throws. Decoding the data URL with atob keeps this fully synchronous. */
function dataUrlToFile(dataUrl: string, filename: string) {
  const [header, base64] = dataUrl.split(',')
  const mime = /data:(.*?);base64/.exec(header)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new File([bytes], filename, { type: mime })
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number, alpha = 1) {
  const ratio = Math.max(width / image.width, height / image.height)
  const imageWidth = image.width * ratio; const imageHeight = image.height * ratio
  ctx.globalAlpha = alpha
  ctx.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight)
  ctx.globalAlpha = 1
}

/** With a booth/selfie photo the card reads like a normal story post - photo first, brand
 *  as a bottom overlay - instead of a generic ad card nobody wants to post. */
async function renderCard(model: ShareCardModel, format: ShareCardFormat, photoDataUrl: string | null) {
  const width = 1080; const height = format === 'square' ? 1080 : 1920
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('canvas_unavailable')

  if (photoDataUrl) {
    const photo = await loadImage(photoDataUrl)
    drawCoverImage(ctx, photo, width, height)
    const veil = ctx.createLinearGradient(0, 0, 0, height)
    veil.addColorStop(0, 'rgba(2,9,6,.05)'); veil.addColorStop(.62, 'rgba(2,9,6,.18)'); veil.addColorStop(1, 'rgba(1,6,4,.94)')
    ctx.fillStyle = veil; ctx.fillRect(0, 0, width, height)
  } else {
    const background = ctx.createLinearGradient(0, 0, width, height); background.addColorStop(0, '#061811'); background.addColorStop(.58, '#0d4231'); background.addColorStop(1, '#020906'); ctx.fillStyle = background; ctx.fillRect(0, 0, width, height)
    try { drawCoverImage(ctx, await loadImage('/og/classcade-share-v2.png'), width, height, .42) } catch { /* The card remains usable with its in-canvas fantasy field. */ }
    const shade = ctx.createLinearGradient(0, 0, width, height); shade.addColorStop(0, 'rgba(1,9,6,.16)'); shade.addColorStop(.68, 'rgba(2,11,7,.58)'); shade.addColorStop(1, 'rgba(1,7,5,.92)'); ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height)
  }

  ctx.strokeStyle = 'rgba(239,202,105,.82)'; ctx.lineWidth = 3; ctx.strokeRect(46, 46, width - 92, height - 92); ctx.strokeStyle = 'rgba(239,202,105,.34)'; ctx.lineWidth = 1; ctx.strokeRect(63, 63, width - 126, height - 126)
  ctx.fillStyle = '#f3d77d'; ctx.font = '800 28px serif'; ctx.fillText('✦ CLASSCADE · 같이교육 ✦', 105, 145)

  if (!photoDataUrl) {
    ctx.fillStyle = '#fff5cf'; ctx.font = '800 76px serif'; wrap(ctx, model.resultTitle, 820, 92, 105, format === 'square' ? 285 : 360, 2)
    ctx.fillStyle = '#e9dfbd'; ctx.font = '600 32px sans-serif'; wrap(ctx, model.resultSummary, 790, 47, 105, format === 'square' ? 475 : 570, 3)
  }

  const panelY = photoDataUrl ? height - 372 : (format === 'square' ? 665 : 1020)
  if (photoDataUrl) { ctx.fillStyle = '#fff5cf'; ctx.font = '800 58px serif'; wrap(ctx, model.resultTitle, 870, 68, 105, panelY - 24, 1) }
  ctx.fillStyle = 'rgba(7,35,23,.81)'; ctx.fillRect(86, panelY, 908, 242); ctx.strokeStyle = 'rgba(239,202,105,.52)'; ctx.strokeRect(86, panelY, 908, 242)
  ctx.fillStyle = '#e9c86a'; ctx.font = '800 24px sans-serif'; ctx.fillText('우리 반 게임', 125, panelY + 58); ctx.fillStyle = '#fff4c7'; ctx.font = '800 46px serif'; wrap(ctx, model.gameTitle, 760, 56, 125, panelY + 125, 2)
  ctx.font = '700 22px sans-serif'; let tagX = 125; for (const tag of model.tags) { const label = `#${tag}`; const tagWidth = ctx.measureText(label).width + 28; if (tagX + tagWidth > 930) break; ctx.fillStyle = 'rgba(229,196,98,.15)'; ctx.strokeStyle = 'rgba(239,202,105,.55)'; ctx.strokeRect(tagX, panelY + 180, tagWidth, 38); ctx.fillStyle = '#f6e4a8'; ctx.fillText(label, tagX + 14, panelY + 207); tagX += tagWidth + 10 }
  ctx.fillStyle = 'rgba(255,243,202,.78)'; ctx.font = '600 22px sans-serif'; ctx.fillText('같이교육 · 교실 놀이를 함께 만드는 모험', 105, height - 112)
  return canvas.toDataURL('image/png')
}

export function CompletionExperience({ state, onAction, onNextParticipant }: Props) {
  const result = getProvisionalResult(state.resultCode); const candidate = getGameCandidate(state.selectedGameId, state.gameConditions)
  const tags = useMemo(() => recommendationTags(result.directions, state.gameConditions, candidate, state.gameAdjustments), [candidate, result.directions, state.gameAdjustments, state.gameConditions])
  const videos = useMemo(() => rankVideos(tags, state.gameConditions), [tags, state.gameConditions])
  const format: ShareCardFormat = 'story'
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const markGenerated = () => onAction({ type: 'SET_COMPLETION_STATE', recommendationTags: tags, recommendedVideoIds: videos.map(({ video }) => video.id), shareCardFormat: format, shareCardGenerated: true, lastCompletedStep: 'share-card-generated' })

  async function generate() {
    if (!candidate) return null
    setBusy(true)
    try {
      const value = await renderCard(buildShareCardModel(result.title, result.description, candidate, tags), format, photoDataUrl)
      setPreview(value)
      markGenerated()
      return value
    } catch {
      setMessage('공유 이미지 생성에 실패했어요. 완성 게임 결과는 그대로 보존됩니다.')
      return null
    } finally {
      setBusy(false)
    }
  }

  // Pre-generate the card in the background (photo added/removed, or on first render)
  // so the "공유하기" click handler can call navigator.share() synchronously - see dataUrlToFile.
  useEffect(() => {
    if (preview || busy || !candidate) return
    void generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoDataUrl, preview, busy, candidate])

  if (!candidate) return null

  function handlePhotoChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setPhotoDataUrl(typeof reader.result === 'string' ? reader.result : null); setPreview(null) }
    reader.readAsDataURL(file)
  }

  function downloadImage(imageData: string) {
    const link = document.createElement('a'); link.href = imageData; link.download = 'classcade-share.png'; link.click()
    setMessage('이 기기에서는 직접 공유를 지원하지 않아 이미지를 다운로드했어요. 인스타그램·카카오톡에 직접 첨부해 주세요.')
  }

  function shareNow() {
    setMessage('')
    if (!preview) { void generateThenShare(); return }
    const file = dataUrlToFile(preview, 'classcade-share.png')
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) { downloadImage(preview); return }
    navigator.share({ title: 'CLASSCADE 우리 반 게임', text: `${result.title} · ${candidate!.title}`, files: [file] })
      .then(() => setMessage('공유 창을 열었어요 - 인스타그램, 카카오톡(나와의 채팅 포함) 등 원하는 곳에 올려 주세요.'))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') { setMessage('공유를 취소했어요.'); return }
        downloadImage(preview)
      })
  }

  // Fallback for the rare case a click lands before the background pre-generation finishes.
  async function generateThenShare() {
    const imageData = await generate()
    if (!imageData) return
    const file = dataUrlToFile(imageData, 'classcade-share.png')
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) { downloadImage(imageData); return }
    try {
      await navigator.share({ title: 'CLASSCADE 우리 반 게임', text: `${result.title} · ${candidate!.title}`, files: [file] })
      setMessage('공유 창을 열었어요 - 인스타그램, 카카오톡(나와의 채팅 포함) 등 원하는 곳에 올려 주세요.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') { setMessage('공유를 취소했어요.'); return }
      downloadImage(imageData)
    }
  }

  return <section className="completion-experience" aria-label="같이교육 추천과 공유">
    <header><p className="journey-kicker">같이교육 추천</p><h2>우리 반의 다음 장면</h2><p>완성한 게임의 조건과 성향을 바탕으로 추천 태그를 만들었어요.</p></header>
    <div className="completion-tags" aria-label="추천 태그">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    {videos.length ? <div className="completion-videos">{videos.map(({ video, matchedTags }) => <article key={video.id}><a href={video.youtubeUrl} target="_blank" rel="noreferrer" className="completion-video__thumb-link" aria-label={`${video.title} - 같이교육 영상 보기`}><VideoThumbnail src={video.thumbnailUrl} /></a><div><h3>{video.title}</h3><p>{video.shortDescription}</p><small>{video.duration} · {video.materials}</small><p className="completion-video__reason">{matchedTags.slice(0, 3).map((tag) => `#${tag}`).join(' ')} 조건과 일치해 추천합니다.</p><a href={video.youtubeUrl} target="_blank" rel="noreferrer">같이교육 영상 보기</a></div></article>)}</div> : <div className="completion-videos__empty"><Icon name="notebook" size={28} /><div><b>현재 조건에 맞는 공개 영상을 찾지 못했습니다.</b><p>다른 게임 조건을 선택하거나, 다음 공개 영상이 추가될 때 다시 확인해 주세요.</p></div></div>}
    <section className="completion-share" aria-label="공유 이미지">
      <p className="journey-kicker">결과 공유 이미지</p><h2>우리 반 게임을 자랑해 주세요</h2><p>부스 사진이나 셀카를 한 장 넣으면, 오늘 여기서 찍은 나만의 카드가 돼요.</p>
      <label className="completion-photo-picker">
        <input type="file" accept="image/*" onChange={handlePhotoChosen} />
        {photoDataUrl ? <img className="completion-photo-picker__preview" src={photoDataUrl} alt="선택한 사진 미리보기" /> : <span className="completion-photo-picker__empty"><Icon name="spark" size={22} />사진 찍기 · 사진 넣기</span>}
      </label>
      {photoDataUrl && <button type="button" className="completion-photo-picker__retake" onClick={() => { setPhotoDataUrl(null); setPreview(null) }}>사진 다시 찍기</button>}
      <div className="completion-primary-actions">
        <button type="button" className="completion-share-button" onClick={() => void shareNow()} disabled={busy}>{busy ? '준비하는 중…' : '공유하기'}</button>
        <button type="button" className="completion-done-button" onClick={() => onNextParticipant ? onNextParticipant() : onAction({ type: 'GO_HOME' })}>완료</button>
      </div>
      {preview && <img className="completion-share__preview is-story" src={preview} alt={`${result.title} ${candidate.title} 공유 이미지 미리보기`} />}
      <p className="completion-share__message" aria-live="polite">{message}</p>
      <div className="completion-share__guide"><b>공유한 뒤, 실제 뽑기를 안전하게 진행하세요.</b><p>인스타그램·카카오톡 공유 화면을 학급 학생들에게 보여 주면 실제 뽑기에 참여할 수 있어요. 뽑기권 발급, 번호, 경품, 참여 기록은 이 서비스에서 처리하지 않습니다.</p></div>
    </section>
    <button className="completion-restart" type="button" onClick={() => onAction({ type: 'RESET_NBTI' })}><Icon name="reset" size={18} />처음부터 다시 시작하기</button>
  </section>
}
