import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Profile } from '../../lib/storage'
import { CompassSeal, Icon } from '../../components/VisualPrimitives'
import { PrimaryButton, SceneFrame, SecondaryButton, type JourneySceneProps } from '../journey/components/SceneFrame'
import { FirestorePairingStore, watchPairing } from './firestorePairingStore'
import { createPairingPayload, issuePairingCode, type PairingPayload, type PairingStatus } from './pairingContract'
import { loadActivePairingCode, saveActivePairingCode } from './activePairingCode'
import { getProvisionalResult } from '../../data/nbtiResults.provisional'
import { CLASSCADE_VIDEO_CATALOG } from '../../data/completionExperience'

const store = new FirestorePairingStore()
function statusCopy(status: PairingStatus) { return ({ issuing: '연결 문을 여는 중…', waiting: '노트북의 응답을 기다리는 중…', checking: '기록을 불러오는 중…', connected: '연결 완료! 노트북에서 놀이 제작 모험이 이어집니다.', expired: '연결 문이 닫혔어요. 새 연결 문을 열어 주세요.', used: '이 연결 코드는 이미 사용되었어요.', invalid: '코드를 찾지 못했어요. 여섯 자리를 다시 확인해 주세요.', network_error: '연결 상태를 확인하지 못했어요. 네트워크를 확인해 주세요.', reissue_ready: '새 연결 문을 열 수 있어요.' } satisfies Record<PairingStatus, string>)[status] }

async function createResultStory(title: string, strengths: readonly string[]) {
  const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1920
  const context = canvas.getContext('2d'); if (!context) throw new Error('canvas_unavailable')
  const field = context.createLinearGradient(0, 0, 1080, 1920); field.addColorStop(0, '#051b14'); field.addColorStop(.55, '#0d5139'); field.addColorStop(1, '#020b08'); context.fillStyle = field; context.fillRect(0, 0, 1080, 1920)
  try { const art = await new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = '/og/classcade-share-v2.png' }); const ratio = Math.max(1080 / art.width, 1920 / art.height); context.globalAlpha = .46; context.drawImage(art, (1080 - art.width * ratio) / 2, (1920 - art.height * ratio) / 2, art.width * ratio, art.height * ratio); context.globalAlpha = 1 } catch { /* Canvas gradient remains a safe fallback. */ }
  context.strokeStyle = 'rgba(245,210,111,.84)'; context.lineWidth = 4; context.strokeRect(48, 48, 984, 1824); context.strokeStyle = 'rgba(245,210,111,.36)'; context.lineWidth = 1; context.strokeRect(68, 68, 944, 1784)
  context.fillStyle = '#f7dc87'; context.font = '800 32px serif'; context.fillText('✦ CLASSCADE · 같이교육 ✦', 112, 172)
  context.fillStyle = '#fff5d1'; context.font = '800 54px serif'; context.fillText('나의 교실 플레이 유형', 112, 312)
  context.fillStyle = '#f2cf64'; context.font = '800 78px serif'; context.fillText(title, 112, 425)
  context.fillStyle = 'rgba(5,30,20,.78)'; context.fillRect(100, 1160, 880, 330); context.strokeStyle = 'rgba(245,210,111,.6)'; context.strokeRect(100, 1160, 880, 330)
  context.fillStyle = '#fff0b9'; context.font = '800 32px sans-serif'; context.fillText('나의 핵심 성향', 150, 1245)
  context.font = '700 29px sans-serif'; strengths.slice(0, 4).forEach((strength, index) => context.fillText(`✦ ${strength}`, 150, 1325 + index * 54))
  context.fillStyle = 'rgba(255,244,207,.82)'; context.font = '600 23px sans-serif'; context.fillText('교실 놀이를 함께 만드는 모험', 112, 1760)
  return canvas.toDataURL('image/png')
}

function PairingVideoThumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(!src)
  return failed ? <span className="pairing-videos__thumb-fallback" aria-hidden="true"><CompassSeal /></span> : <img src={src} alt="" onError={() => setFailed(true)} />
}

function MobileWaitingContent({ resultTitle, strengths }: { resultTitle: string; strengths: readonly string[] }) {
  const [story, setStory] = useState<string | null>(null); const [message, setMessage] = useState('')
  const videos = useMemo(() => CLASSCADE_VIDEO_CATALOG.filter((video) => video.published).slice(0, 3), [])
  const generate = async () => { try { setMessage('Story 이미지를 만드는 중이에요…'); setStory(await createResultStory(resultTitle, strengths)); setMessage('Story 이미지가 준비됐어요.') } catch { setMessage('Story 이미지 생성에 실패했어요. 코드 연결은 그대로 유지됩니다.') } }
  const download = async () => { const image = story ?? await createResultStory(resultTitle, strengths); if (!story) setStory(image); const link = document.createElement('a'); link.href = image; link.download = 'classcade-result-story.png'; link.click(); setMessage('Story 이미지 저장을 시작했어요.') }
  const share = async () => { try { const image = story ?? await createResultStory(resultTitle, strengths); if (!story) setStory(image); const blob = await (await fetch(image)).blob(); const file = new File([blob], 'classcade-result-story.png', { type: 'image/png' }); if (!navigator.share || !navigator.canShare?.({ files: [file] })) throw new Error('unsupported'); await navigator.share({ title: 'CLASSCADE 나의 교실 플레이', text: resultTitle, files: [file] }); setMessage('기기 공유 창을 열었어요.') } catch { await download(); setMessage('이 기기에서는 직접 공유를 지원하지 않아 이미지를 저장했어요. Instagram Story에서 저장한 이미지를 선택해 주세요.') } }
  return <div className="pairing-waiting" aria-label="기다리는 동안 콘텐츠"><section><p className="journey-kicker">WAITING BONUS</p><h2>기다리는 동안 둘러보세요 ✨</h2><p>코드는 그대로 유지됩니다. 노트북으로 이동하기 전, 같이교육의 짧은 활동을 살펴보세요.</p><div className="pairing-videos">{videos.map((video) => <a key={video.id} href={video.youtubeUrl} target="_blank" rel="noreferrer"><PairingVideoThumb src={video.thumbnailUrl} /><span><b>{video.title}</b><small>{video.shortDescription}</small><em>같이교육 영상 열기 ↗</em></span></a>)}</div></section><section className="pairing-story"><p className="journey-kicker">RESULT STORY</p><h2>내 결과를 Story로 남기기</h2><p>연결 코드와 닉네임은 이미지에 포함하지 않아요.</p><div><button type="button" onClick={() => void generate()}>Story 이미지 만들기</button><button type="button" onClick={() => void share()}>공유하기</button><button type="button" onClick={() => void download()}>이미지 저장</button></div>{story && <img src={story} alt={`${resultTitle} Story 이미지 미리보기`} />}{message && <p aria-live="polite" className="pairing-story__message">{message}</p>}</section></div>
}

export function PairingScene({ state, profile, journeyId, onBack, ...sceneProps }: JourneySceneProps & { profile: Profile; journeyId: string; onBack: () => void }) {
  const [record, setRecord] = useState<{ code: string; expiresAt: number } | null>(loadActivePairingCode)
  const [status, setStatus] = useState<PairingStatus>(record ? 'waiting' : 'issuing')
  const [seconds, setSeconds] = useState(0)
  const create = useCallback(async () => {
    setStatus('issuing')
    try {
      if (record && status === 'waiting') await store.revoke(record.code, Date.now())
      const created = await issuePairingCode(store, createPairingPayload(state, profile, journeyId))
      const next = { code: created.code, expiresAt: created.expiresAt }
      saveActivePairingCode(next.code, next.expiresAt); setRecord(next); setStatus('waiting')
    } catch { setStatus('network_error') }
  }, [journeyId, profile, record, state, status])
  useEffect(() => { if (!record) void create() }, [record, create])
  useEffect(() => {
    if (!record) return
    const tick = () => { const left = Math.max(0, Math.ceil((record.expiresAt - Date.now()) / 1000)); setSeconds(left); if (!left) setStatus('expired') }
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer)
  }, [record])
  const activeCode = status === 'expired' ? undefined : record?.code
  useEffect(() => {
    if (!activeCode) return
    let unsubscribe: (() => void) | undefined
    try { unsubscribe = watchPairing(activeCode, (next) => setStatus(next === 'connected' ? 'connected' : next === 'expired' ? 'expired' : 'waiting'), () => setStatus('network_error')) } catch { setStatus('network_error') }
    return () => unsubscribe?.()
  }, [activeCode])
  const result = getProvisionalResult(state.resultCode)
  return <SceneFrame scene="result" state={state} {...sceneProps}>
    <div className="pairing-mobile-flow journey-enter"><div className="pairing-gate" data-tune-id="pairing-mobile-gate"><p className="journey-kicker">✦ NOTEBOOK LINK ✦</p><CompassSeal /><h1>이제 노트북으로 이동해주세요</h1><p><b>{result.title}</b> 결과가 준비되었습니다. 이 코드를 CLASSCADE 노트북에 입력하면 우리 반 게임 만들기가 이어집니다.</p><output className="pairing-gate__code" aria-label={`연결 코드 ${record?.code?.split('').join(' ') ?? ''}`}>{record?.code ? `${record.code.slice(0, 3)} ${record.code.slice(3)}` : '··· ···'}</output><p className="pairing-gate__timer">남은 시간 <b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</b></p><p className={`pairing-gate__status is-${status}`} aria-live="polite">{statusCopy(status)}</p><PrimaryButton onClick={create} disabled={status === 'issuing'}>{status === 'expired' || status === 'network_error' ? '새 코드 만들기' : record ? '새 코드 발급' : '연결 문 여는 중'}</PrimaryButton><SecondaryButton onClick={onBack}>결과로 돌아가기</SecondaryButton><SecondaryButton onClick={() => sceneProps.onRequestHome?.()}>처음으로</SecondaryButton></div><MobileWaitingContent resultTitle={result.title} strengths={result.strengths} /></div>
  </SceneFrame>
}

export function PairingEntryScene({ state, onPaired, onStart, onBack, ...sceneProps }: JourneySceneProps & { onPaired: (payload: PairingPayload) => void; onStart: () => void; onBack: () => void }) {
  const [code, setCode] = useState(''); const [status, setStatus] = useState<PairingStatus>('waiting'); const busy = useRef(false)
  const consume = async () => {
    if (busy.current || code.length !== 6) return
    busy.current = true; setStatus('checking')
    try { const result = await store.consume(code, Date.now()); if (result.status === 'connected') { onPaired(result.record.payload); setStatus('connected') } else setStatus(result.status) } catch { setStatus('network_error') } finally { busy.current = false }
  }
  return <SceneFrame scene="start" state={state} {...sceneProps}>
    <div className="pairing-entry journey-enter" data-tune-id="pairing-laptop-entry"><p className="journey-kicker">✦ CLASSCADE LINK ✦</p><h1>이 노트북에서 여정을 시작할까요?</h1><p>모바일에서 만든 결과를 불러오거나, 이 자리에서 라운드 1부터 직접 시작할 수 있어요.</p><label><span>모바일 결과 불러오기 · 연결 코드</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" aria-describedby="pairing-status" /></label><p id="pairing-status" className={`pairing-entry__status is-${status}`} aria-live="polite">{status === 'waiting' ? '코드는 한 번만 사용할 수 있어요.' : statusCopy(status)}</p><PrimaryButton onClick={consume} disabled={code.length !== 6 || status === 'checking'}>모바일 결과 불러오기</PrimaryButton><section><h2>이 노트북에서 직접 시작</h2><p>코드 없이도 같은 질문과 추천 흐름으로 라운드 1을 시작할 수 있어요.</p><SecondaryButton onClick={onStart}>이 노트북에서 처음 시작하기</SecondaryButton></section>{['expired', 'invalid', 'used', 'network_error'].includes(status) && <div className="pairing-entry__recovery"><SecondaryButton onClick={() => { setCode(''); setStatus('waiting') }}>다른 코드 입력</SecondaryButton><SecondaryButton onClick={onStart}>이 노트북에서 처음 시작하기</SecondaryButton></div>}<button className="pairing-entry__back" type="button" onClick={onBack}><Icon name="arrow" size={16} />처음으로</button></div>
  </SceneFrame>
}
