import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Profile } from '../../lib/storage'
import { ClasscadeLockup, CompassSeal, Icon } from '../../components/VisualPrimitives'
import { PrimaryButton, SceneFrame, SecondaryButton, type JourneySceneProps } from '../journey/components/SceneFrame'
import { FirestorePairingStore, watchPairing } from './firestorePairingStore'
import { createPairingPayload, issuePairingCode, type PairingPayload, type PairingStatus } from './pairingContract'
import { loadActivePairingCode, saveActivePairingCode } from './activePairingCode'
import { getProvisionalResult } from '../../data/nbtiResults.provisional'
import { CLASSCADE_VIDEO_CATALOG, rankVideos, recommendationTags } from '../../data/completionExperience'
import type { NbtiDirection } from '../../data/nbti.provisional'

const store = new FirestorePairingStore()
function statusCopy(status: PairingStatus) { return ({ issuing: '연결 문을 여는 중…', waiting: '노트북의 응답을 기다리는 중…', checking: '기록을 불러오는 중…', connected: '연결 완료! 노트북에서 놀이 제작 모험이 이어집니다.', expired: '연결 문이 닫혔어요. 새 연결 문을 열어 주세요.', used: '이 연결 코드는 이미 사용되었어요.', invalid: '코드를 찾지 못했어요. 여섯 자리를 다시 확인해 주세요.', network_error: '연결 상태를 확인하지 못했어요. 네트워크를 확인해 주세요.', reissue_ready: '새 연결 문을 열 수 있어요.' } satisfies Record<PairingStatus, string>)[status] }

function PairingVideoThumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(!src)
  if (failed) return <span className="pairing-videos__thumb-fallback" aria-hidden="true"><CompassSeal /></span>
  /* The wrapper carries a soft play-button overlay so the thumbnail reads as pressable. */
  return <span className="pairing-videos__thumb"><img src={src} alt="" onError={() => setFailed(true)} /></span>
}

function MobileWaitingContent({ directions }: { directions: readonly NbtiDirection[] }) {
  const videos = useMemo(() => {
    /* Ranked by the player's NBTI direction tags (no game data exists yet at pairing
       time, so conditions/candidate are null). Backfilled from the catalogue so the
       panel always shows two, even for types whose tags match little. */
    const ranked = rankVideos(recommendationTags(directions, null, null, {}), null).map((entry) => entry.video)
    const seen = new Set(ranked.map((video) => video.id))
    const fill = CLASSCADE_VIDEO_CATALOG.filter((video) => video.published && !seen.has(video.id))
    return [...ranked, ...fill].slice(0, 2)
  }, [directions])
  return <aside className="pairing-waiting" aria-label="기다리는 동안 추천 영상"><section><p className="journey-kicker">WAITING BONUS</p><h2>기다리는 동안 둘러보세요 ✨</h2><p>나의 교실 플레이 성향에 맞춘 같이교육의 짧은 활동 영상이에요.<br />코드는 그대로 유지됩니다.</p><div className="pairing-videos">{videos.map((video) => <a key={video.id} href={video.youtubeUrl} target="_blank" rel="noreferrer"><PairingVideoThumb src={video.thumbnailUrl} /><span><b>{video.title}</b><small>{video.shortDescription}</small><em>같이교육 영상 열기 ↗</em></span></a>)}</div></section></aside>
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
  {/* profile is destructured out of sceneProps above, so it must be handed to SceneFrame
      explicitly — otherwise the header falls back to the generic '선생님'. */}
  return <SceneFrame scene="result" state={state} profile={profile} {...sceneProps}>
    <div className="pairing-mobile-flow journey-enter"><div className="pairing-gate" data-tune-id="pairing-mobile-gate"><p className="journey-kicker">✦ NOTEBOOK LINK ✦</p><ClasscadeLockup /><h1><span>이제 노트북으로</span> <span>이동해주세요</span></h1><p><b>{result.title}</b> 결과가 준비되었습니다. 이 코드를 CLASSCADE 노트북에 입력하면 우리 반 게임 만들기가 이어집니다.</p><output className="pairing-gate__code" aria-label={`연결 코드 ${record?.code?.split('').join(' ') ?? ''}`}>{record?.code ? `${record.code.slice(0, 3)} ${record.code.slice(3)}` : '··· ···'}</output><p className="pairing-gate__timer">남은 시간 <b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</b></p><p className={`pairing-gate__status is-${status}`} aria-live="polite">{statusCopy(status)}</p><PrimaryButton onClick={create} disabled={status === 'issuing'}>{status === 'expired' || status === 'network_error' ? '새 코드 만들기' : record ? '새 코드 발급' : '연결 문 여는 중'}</PrimaryButton><div className="pairing-gate__row"><SecondaryButton onClick={onBack}>결과로 돌아가기</SecondaryButton><SecondaryButton onClick={() => { onBack(); sceneProps.onAction({ type: 'OPEN_GAME_INTRO' }) }}>이 기기에서 이어하기</SecondaryButton></div></div><MobileWaitingContent directions={result.directions} /></div>
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
