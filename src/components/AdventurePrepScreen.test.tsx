import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdventurePrepScreen } from './AdventurePrepScreen'
import { PREP_DRAFT_STORAGE_KEY, type PrepDraft } from '../lib/storage'
import type { AudioSettings } from '../lib/audioController'

const audio: AudioSettings = { bgmEnabled: true, bgmVolume: 1, sfxEnabled: false }

function renderScreen(overrides: Partial<Parameters<typeof AdventurePrepScreen>[0]> = {}) {
  const onComplete = vi.fn(async () => ({ ok: true }))
  const onScreenChange = vi.fn()
  const onAudioChange = vi.fn()
  const utils = render(
    <AdventurePrepScreen
      initialProfile={null}
      audio={audio}
      exiting={false}
      isOffline={false}
      onComplete={onComplete}
      onScreenChange={onScreenChange}
      onAudioChange={onAudioChange}
      {...overrides}
    />,
  )
  return { ...utils, onComplete, onScreenChange, onAudioChange }
}

function nextButton() {
  return screen.getByRole('button', { name: '다음 질문' })
}

function backButton() {
  return screen.getByRole('button', { name: '← 이전 질문' })
}

function readDraft(): PrepDraft | null {
  const raw = window.sessionStorage.getItem(PREP_DRAFT_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

beforeEach(() => {
  window.sessionStorage.clear()
  window.localStorage.clear()
})

describe('AdventurePrepScreen golden path (flat rendering, the shipped default)', () => {
  it('keeps step 1 next disabled until a school level is chosen, then advances to step 2', () => {
    renderScreen()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(nextButton()).toBeDisabled()

    fireEvent.click(screen.getByText('초등'))
    expect(nextButton()).toBeEnabled()

    fireEvent.click(nextButton())
    expect(screen.getByText('02')).toBeInTheDocument()
  })

  it('walks all four steps in order and back again without losing earlier answers', () => {
    renderScreen()
    fireEvent.click(screen.getByText('초등'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('1~5년'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('서울'))
    fireEvent.click(nextButton())
    expect(screen.getByText('04')).toBeInTheDocument()

    fireEvent.click(backButton())
    expect(screen.getByText('03')).toBeInTheDocument()
    // 서울 is still selected — the radio button reflects the preserved value.
    expect(screen.getByText('서울').closest('button')).toHaveAttribute('aria-checked', 'true')
  })

  it('blocks a 4th growth priority with a limit message and lets deselecting free a slot', () => {
    renderScreen()
    fireEvent.click(screen.getByText('초등'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('1~5년'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('서울'))
    fireEvent.click(nextButton())

    fireEvent.click(screen.getByText('학생 참여·몰입'))
    fireEvent.click(screen.getByText('학급 관계·공동체'))
    fireEvent.click(screen.getByText('창의력·문제해결력'))
    expect(nextButton()).toBeEnabled()

    fireEvent.click(screen.getByText('AI·디지털 활용'))
    expect(document.querySelector('.entry-growth-message')).toHaveTextContent('최대 3개까지 선택할 수 있어요.')

    fireEvent.click(screen.getByText('학생 참여·몰입'))
    fireEvent.click(screen.getByText('AI·디지털 활용'))
    expect(nextButton()).toBeEnabled()
  })

  it('selects the "기타" priority by typing, and clearing the text deselects it', () => {
    renderScreen()
    fireEvent.click(screen.getByText('초등'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('1~5년'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('서울'))
    fireEvent.click(nextButton())

    fireEvent.click(screen.getByText('기타 직접 입력'))
    const input = screen.getByLabelText('기타 항목 직접 입력')
    fireEvent.change(input, { target: { value: '학부모 소통' } })
    expect(nextButton()).toBeEnabled()

    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    expect(nextButton()).toBeDisabled()
  })

  it('requires a nickname before the final CTA is enabled', () => {
    renderScreen()
    fireEvent.click(screen.getByText('초등'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('1~5년'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('서울'))
    fireEvent.click(nextButton())
    fireEvent.click(screen.getByText('학생 참여·몰입'))
    fireEvent.click(nextButton())

    expect(screen.getByText('용사님의 닉네임을 알려주세요')).toBeInTheDocument()
    const finalCta = screen.getByRole('button', { name: '모험 준비 완료' })
    expect(finalCta).toBeDisabled()

    fireEvent.change(screen.getByLabelText('용사 닉네임'), { target: { value: '테스트교사' } })
    expect(finalCta).toBeEnabled()
  })

  it('persists in-progress answers to the prep draft as each step changes', () => {
    renderScreen()
    fireEvent.click(screen.getByText('중등'))
    fireEvent.click(nextButton())

    expect(readDraft()).toMatchObject({ version: 1, step: 2, schoolLevel: 'middle' })
  })

  it('restores an interrupted draft instead of starting over from step 1', () => {
    const draft: PrepDraft = {
      version: 1,
      step: 3,
      schoolLevel: 'high',
      careerRange: '6-10',
      region: null,
      growthPriorities: [],
      growthPriorityOther: '',
      nickname: '',
    }
    window.sessionStorage.setItem(PREP_DRAFT_STORAGE_KEY, JSON.stringify(draft))

    renderScreen()

    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('shows the offline notice when isOffline is true', () => {
    renderScreen({ isOffline: true })
    expect(screen.getByRole('status')).toHaveTextContent('오프라인 상태예요')
  })
})
