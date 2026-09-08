import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRef } from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TeacherPanel } from './TeacherPanel'
import type { DeviceMode, Journey, Profile } from '../lib/storage'

function profile(): Profile {
  const now = new Date().toISOString()
  return {
    version: 1,
    schoolLevel: 'elementary',
    careerRange: '1-5',
    region: 'seoul',
    growthPriorities: ['engagement', 'other'],
    growthPriorityOther: '학부모 소통',
    nickname: '테스트교사',
    createdAt: now,
    updatedAt: now,
  }
}

const journey: Journey = { version: 1, status: 'nbti_complete', updatedAt: new Date().toISOString() }

function renderPanel(overrides: Partial<Parameters<typeof TeacherPanel>[0]> = {}, deviceMode: DeviceMode = 'shared') {
  const handlers = {
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onRestartNbti: vi.fn(() => true),
    onResetAll: vi.fn(() => true),
    onStartNewShared: vi.fn(() => true),
    onPlaceholderAction: vi.fn(),
  }
  render(
    <TeacherPanel
      open
      profile={profile()}
      journey={journey}
      deviceMode={deviceMode}
      returnFocusRef={createRef<HTMLButtonElement>()}
      {...handlers}
      {...overrides}
    />,
  )
  return handlers
}

const resetAllButton = () => screen.getByRole('button', { name: /전체 여정 초기화/ })
const restartNbtiButton = () => screen.getByRole('button', { name: /NBTI 처음부터 다시하기/ })

beforeEach(() => vi.clearAllMocks())

describe('TeacherPanel', () => {
  it('renders nothing at all when closed', () => {
    const { container } = render(
      <TeacherPanel
        open={false}
        profile={profile()}
        journey={journey}
        deviceMode="shared"
        returnFocusRef={createRef<HTMLButtonElement>()}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onRestartNbti={vi.fn(() => true)}
        onResetAll={vi.fn(() => true)}
        onStartNewShared={vi.fn(() => true)}
        onPlaceholderAction={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the "기타" free-text label rather than the raw option value', () => {
    renderPanel()
    expect(screen.getByText('학부모 소통')).toBeInTheDocument()
  })

  it('offers the new-participant action only on a shared device', () => {
    renderPanel({}, 'shared')
    expect(screen.getByRole('button', { name: /새 참가자로 시작/ })).toBeInTheDocument()
  })

  it('hides the new-participant action on a personal device', () => {
    renderPanel({}, 'personal')
    expect(screen.queryByRole('button', { name: /새 참가자로 시작/ })).not.toBeInTheDocument()
  })

  /* Each destructive action must go through its own confirmation — a single misfired
     click should never be able to delete a participant's journey. */
  it.each([
    ['전체 여정 초기화', () => resetAllButton(), '전체 여정을 초기화할까요?'],
    ['NBTI 처음부터 다시하기', () => restartNbtiButton(), 'NBTI를 처음부터 다시 시작할까요?'],
  ])('asks for confirmation before running %s', (_label, getButton, expectedTitle) => {
    const handlers = renderPanel()
    fireEvent.click(getButton())

    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
    expect(handlers.onResetAll).not.toHaveBeenCalled()
    expect(handlers.onRestartNbti).not.toHaveBeenCalled()
  })

  it('routes each confirmed action to its own handler and no other', () => {
    const handlers = renderPanel()
    fireEvent.click(restartNbtiButton())
    // Scoped to the confirmation region: its confirm button carries the same label as
    // the trigger that opened it.
    fireEvent.click(within(screen.getByRole('alert')).getByRole('button', { name: 'NBTI 처음부터 다시하기' }))

    expect(handlers.onRestartNbti).toHaveBeenCalledTimes(1)
    expect(handlers.onResetAll).not.toHaveBeenCalled()
    expect(handlers.onStartNewShared).not.toHaveBeenCalled()
  })

  it('backing out of a confirmation runs nothing', () => {
    const handlers = renderPanel()
    fireEvent.click(resetAllButton())
    fireEvent.click(screen.getByRole('button', { name: '돌아가기' }))

    expect(handlers.onResetAll).not.toHaveBeenCalled()
    expect(resetAllButton()).toBeInTheDocument()
  })

  it('surfaces a retryable error when the action reports failure', () => {
    renderPanel({ onResetAll: vi.fn(() => false) })
    fireEvent.click(resetAllButton())
    fireEvent.click(screen.getByRole('button', { name: '전체 여정 초기화' }))

    expect(screen.getByRole('alert')).toHaveTextContent('기록을 저장하지 못했어요')
  })

  it('closes on Escape', () => {
    const handlers = renderPanel()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handlers.onClose).toHaveBeenCalledTimes(1)
  })
})
