import { useCallback, useEffect, useRef, useState } from 'react'
import type { Profile } from '../../lib/storage'
import { CompassSeal, Icon } from '../../components/VisualPrimitives'
import { PrimaryButton, SceneFrame, SecondaryButton, type JourneySceneProps } from '../journey/components/SceneFrame'
import { FirestorePairingStore, watchPairing } from './firestorePairingStore'
import { createPairingPayload, issuePairingCode, type PairingPayload, type PairingStatus } from './pairingContract'

const ISSUED_CODE_KEY = 'classcade.pairing-issued-code.v1'
const store = new FirestorePairingStore()
function statusCopy(status: PairingStatus) { return ({ issuing: '연결 문을 여는 중…', waiting: '노트북의 응답을 기다리는 중…', checking: '기록을 불러오는 중…', connected: '연결 완료! 노트북에서 놀이 제작 모험이 이어집니다.', expired: '연결 문이 닫혔어요. 새 연결 문을 열어 주세요.', used: '이 연결 코드는 이미 사용되었어요.', invalid: '코드를 찾지 못했어요. 여섯 자리를 다시 확인해 주세요.', network_error: '연결 상태를 확인하지 못했어요. 네트워크를 확인해 주세요.', reissue_ready: '새 연결 문을 열 수 있어요.' } satisfies Record<PairingStatus, string>)[status] }
function issuedCode(): { code: string; expiresAt: number } | null { try { const value = JSON.parse(localStorage.getItem(ISSUED_CODE_KEY) ?? '{}') as { code?: string; expiresAt?: number }; return typeof value.code === 'string' && typeof value.expiresAt === 'number' && value.expiresAt > Date.now() ? { code: value.code, expiresAt: value.expiresAt } : null } catch { return null } }
function saveIssued(code: string, expiresAt: number) { localStorage.setItem(ISSUED_CODE_KEY, JSON.stringify({ code, expiresAt })) }

export function PairingScene({ state, profile, journeyId, onBack, ...sceneProps }: JourneySceneProps & { profile: Profile; journeyId: string; onBack: () => void }) {
  const [record, setRecord] = useState<{ code: string; expiresAt: number } | null>(issuedCode)
  const [status, setStatus] = useState<PairingStatus>(record ? 'waiting' : 'issuing')
  const [seconds, setSeconds] = useState(0)
  const create = useCallback(async () => {
    setStatus('issuing')
    try {
      if (record && status === 'waiting') await store.revoke(record.code)
      const created = await issuePairingCode(store, createPairingPayload(state, profile, journeyId))
      const next = { code: created.code, expiresAt: created.expiresAt }
      saveIssued(next.code, next.expiresAt); setRecord(next); setStatus('waiting')
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
  return <SceneFrame scene="result" state={state} {...sceneProps}>
    <div className="pairing-gate journey-enter" data-tune-id="pairing-mobile-gate"><p className="journey-kicker">✦ MAGIC LINK ✦</p><CompassSeal /><h1>당신의 놀이 기록이 준비됐어요</h1><p>가까운 노트북에서 아래 코드를 입력하면, 방금 발견한 교실 성향으로 우리 반 게임 만들기를 이어갈 수 있어요.</p><output className="pairing-gate__code" aria-label="연결 코드">{record?.code ?? '······'}</output><p className="pairing-gate__timer">남은 시간 <b>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</b></p><p className={`pairing-gate__status is-${status}`} aria-live="polite">{statusCopy(status)}</p><PrimaryButton onClick={create} disabled={status === 'issuing'}>{record ? '새 연결 문 열기' : '연결 문 여는 중'}</PrimaryButton><SecondaryButton onClick={onBack}>결과로 돌아가기</SecondaryButton></div>
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
    <div className="pairing-entry journey-enter" data-tune-id="pairing-laptop-entry"><p className="journey-kicker">✦ CLASSCADE LINK ✦</p><h1>모바일에서 NBTI를 완료했어요</h1><p>받은 6자리 코드를 입력하면 교실 성향과 결과를 그대로 불러옵니다.</p><label><span>연결 코드</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" aria-describedby="pairing-status" /></label><p id="pairing-status" className={`pairing-entry__status is-${status}`} aria-live="polite">{status === 'waiting' ? '코드는 한 번만 사용할 수 있어요.' : statusCopy(status)}</p><PrimaryButton onClick={consume} disabled={code.length !== 6 || status === 'checking'}>내 기록 이어오기</PrimaryButton><section><h2>아직 시작한 모험이 없나요?</h2><p>지금 자리가 여유롭다면 이 노트북에서 NBTI부터 시작해도 좋아요.</p><SecondaryButton onClick={onStart}>이 자리에서 처음 시작하기</SecondaryButton></section><button className="pairing-entry__back" type="button" onClick={onBack}><Icon name="arrow" size={16} />돌아가기</button></div>
  </SceneFrame>
}
