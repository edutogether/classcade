import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SharedSessionGate } from './SharedSessionGate'

function renderGate(onStartNew = vi.fn(() => true)) {
  const onResume = vi.fn()
  render(<SharedSessionGate onResume={onResume} onStartNew={onStartNew} />)
  return { onResume, onStartNew }
}

const newParticipantButton = () => screen.getByRole('button', { name: /새 참가자로 시작/ })
const confirmButton = () => screen.getByRole('button', { name: '현재 기기만 초기화' })

describe('SharedSessionGate', () => {
  it('resumes without any confirmation step', () => {
    const { onResume } = renderGate()
    fireEvent.click(screen.getByRole('button', { name: /이어서 진행하기/ }))
    expect(onResume).toHaveBeenCalledTimes(1)
  })

  it('never clears the device on the first click — it asks for confirmation first', () => {
    const { onStartNew } = renderGate()
    fireEvent.click(newParticipantButton())

    expect(onStartNew).not.toHaveBeenCalled()
    expect(confirmButton()).toBeInTheDocument()
  })

  it('clears only after the confirmation is accepted', () => {
    const { onStartNew } = renderGate()
    fireEvent.click(newParticipantButton())
    fireEvent.click(confirmButton())

    expect(onStartNew).toHaveBeenCalledTimes(1)
  })

  it('backing out of the confirmation leaves the session untouched', () => {
    const { onStartNew } = renderGate()
    fireEvent.click(newParticipantButton())
    fireEvent.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(onStartNew).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /이어서 진행하기/ })).toBeInTheDocument()
  })

  it('surfaces a retryable error when clearing fails instead of pretending it worked', () => {
    renderGate(vi.fn(() => false))
    fireEvent.click(newParticipantButton())
    fireEvent.click(confirmButton())

    expect(screen.getByText(/진행 내용을 지우지 못했어요/)).toBeInTheDocument()
    // Still on the confirmation step, and the button is re-enabled so it can be retried.
    expect(confirmButton()).toBeEnabled()
  })
})
