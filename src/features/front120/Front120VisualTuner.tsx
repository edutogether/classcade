import { useEffect, useMemo, useState } from 'react'
import { TUNE_GROUPS, TUNER_STORAGE_KEY, type Front120Tuning, type TunerScreen, applyTuning, createTuning, cssVariableText, isTunerEnabled, validateTuning, valuesFor } from './visualTuning'
import './front120Tuner.css'

type Props = { screen: TunerScreen }
const readSaved = () => { try { const saved = JSON.parse(localStorage.getItem(TUNER_STORAGE_KEY) ?? ''); return validateTuning(saved) ? saved : createTuning() } catch { return createTuning() } }

export function Front120VisualTuner({ screen }: Props) {
  const enabled = isTunerEnabled()
  const [tuning, setTuning] = useState<Front120Tuning>(readSaved)
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<Front120Tuning[]>([])
  const [future, setFuture] = useState<Front120Tuning[]>([])
  const [io, setIo] = useState('')
  useEffect(() => { applyTuning(tuning, screen); if (enabled) localStorage.setItem(TUNER_STORAGE_KEY, JSON.stringify(tuning)) }, [enabled, screen, tuning])
  const screenValues = tuning.screens[screen]
  const resolvedValues = valuesFor(tuning, screen)
  const update = (key: string, value: number) => setTuning((current) => {
    setHistory((past) => [...past.slice(-39), current]); setFuture([])
    return { ...current, updatedAt: new Date().toISOString(), screens: { ...current.screens, [screen]: { ...current.screens[screen], [key]: value } } }
  })
  const resetScreen = () => updateMany({})
  const updateMany = (next: Record<string, number>) => setTuning((current) => {
    setHistory((past) => [...past.slice(-39), current]); setFuture([])
    return { ...current, updatedAt: new Date().toISOString(), screens: { ...current.screens, [screen]: next } }
  })
  const undo = () => { const previous = history.at(-1); if (!previous) return; setFuture((items) => [tuning, ...items]); setHistory((items) => items.slice(0, -1)); setTuning(previous) }
  const redo = () => { const next = future[0]; if (!next) return; setHistory((items) => [...items, tuning]); setFuture((items) => items.slice(1)); setTuning(next) }
  const exportJson = () => setIo(JSON.stringify(tuning, null, 2))
  const importJson = () => { try { const value = JSON.parse(io); if (!validateTuning(value)) throw new Error('invalid'); setHistory((past) => [...past, tuning]); setFuture([]); setTuning(value) } catch { setIo('허용된 token과 범위를 갖는 JSON만 가져올 수 있습니다.') } }
  const title = useMemo(() => `${screen} · ${window.innerWidth}×${window.innerHeight}`, [screen])
  if (!enabled) return null
  return <aside className={`front120-tuner ${open ? 'is-open' : ''}`} aria-label="Front120 Visual Tuner">
    <button className="front120-tuner__toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Tune</button>
    {open && <div className="front120-tuner__sheet">
      <header><strong>Front120 Visual Tuner</strong><span>{title}</span><button type="button" onClick={() => setOpen(false)}>닫기</button></header>
      <p className="front120-tuner__note">개발 전용 · 현재 화면의 CSS 값만 조정합니다.</p>
      {TUNE_GROUPS.map((group) => <details key={group.label} open><summary>{group.label}</summary>{group.controls.map((control) => <label key={control.key}><span>{control.label}</span><input aria-label={`${control.label} 슬라이더`} type="range" min={control.min} max={control.max} step={control.step} value={resolvedValues[control.key]} onChange={(event) => update(control.key, Number(event.target.value))} /><input aria-label={`${control.label} 숫자 입력`} type="number" min={control.min} max={control.max} step={control.step} value={resolvedValues[control.key]} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) update(control.key, value) }} /><em>{screenValues[control.key] ?? '기본'}{control.unit}</em></label>)}</details>)}
      <div className="front120-tuner__actions"><button onClick={undo} disabled={!history.length}>Undo</button><button onClick={redo} disabled={!future.length}>Redo</button><button onClick={resetScreen}>현재 화면 초기화</button><button onClick={() => { setHistory((items) => [...items, tuning]); setTuning(createTuning()) }}>전체 초기화</button></div>
      <div className="front120-tuner__io"><button onClick={exportJson}>JSON 내보내기</button><button onClick={() => setIo(cssVariableText(tuning, screen))}>CSS 변수 복사</button><textarea value={io} onChange={(event) => setIo(event.target.value)} placeholder="JSON을 붙여 넣어 가져오기" /><button onClick={importJson}>JSON 가져오기</button></div>
    </div>}
  </aside>
}
