import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChunkErrorBoundary } from './ChunkErrorBoundary'

function Bomb(): never {
  throw new Error('chunk load failed')
}

describe('ChunkErrorBoundary', () => {
  it('renders children normally when nothing fails', () => {
    render(<ChunkErrorBoundary><p>다음 화면</p></ChunkErrorBoundary>)
    expect(screen.getByText('다음 화면')).toBeInTheDocument()
  })

  it('shows a retry fallback and reloads on click when a child throws', async () => {
    const reload = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload })
    const onError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<ChunkErrorBoundary><Bomb /></ChunkErrorBoundary>)

    expect(screen.getByText(/다음 화면을 불러오지 못했어요/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(reload).toHaveBeenCalledTimes(1)

    onError.mockRestore()
    vi.unstubAllGlobals()
  })
})
