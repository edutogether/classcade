import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StartScene, QuestionScene, ResultScene } from './NbtiScenes'
import { createJourneyState } from '../journeyState'
import { NBTI_QUESTIONS } from '../../../data/nbti.provisional'
import type { JourneySceneProps } from '../components/SceneFrame'

function baseProps(overrides: Partial<JourneySceneProps> = {}): JourneySceneProps {
  return {
    state: createJourneyState(),
    onAction: vi.fn(),
    onTeacherOpen: vi.fn(),
    teacherTriggerRef: { current: null },
    notice: '',
    ...overrides,
  }
}

describe('StartScene', () => {
  it('renders the entry headline and lets a fresh visitor start the NBTI', () => {
    render(<StartScene {...baseProps()} />)
    expect(screen.getByText('교실 NBTI 시작하기')).toBeInTheDocument()
    expect(screen.getByText('새로 시작하기')).toBeInTheDocument()
  })

  it('offers to resume instead of restart when a resumable journey exists', () => {
    render(<StartScene {...baseProps({ state: { ...createJourneyState(), resumeStage: 'nbti_question' } })} />)
    expect(screen.getByText('이전 여정 이어가기')).toBeInTheDocument()
    expect(screen.queryByText('새로 시작하기')).not.toBeInTheDocument()
  })
})

describe('QuestionScene', () => {
  it('renders the first question and reports an answer through onAction', async () => {
    const onAction = vi.fn()
    const state = { ...createJourneyState('nbti_question'), questionIndex: 0 }
    render(<QuestionScene {...baseProps({ state, onAction })} />)

    const question = NBTI_QUESTIONS[0]
    expect(screen.getByText(question.prompt)).toBeInTheDocument()

    const firstChoiceLabel = question.choices[0].label
    await userEvent.click(screen.getByText(firstChoiceLabel))

    expect(onAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ANSWER_NBTI', questionId: question.id }),
    )
  })

  it('disables the next-question control until an answer is selected', () => {
    const state = { ...createJourneyState('nbti_question'), questionIndex: 0 }
    render(<QuestionScene {...baseProps({ state })} />)
    expect(screen.getByRole('button', { name: '다음 질문으로' })).toBeDisabled()
  })

  it('enables the next-question control once the current question is answered', () => {
    const question = NBTI_QUESTIONS[0]
    const state = { ...createJourneyState('nbti_question'), questionIndex: 0, answers: { [question.id]: question.choices[0].id } }
    render(<QuestionScene {...baseProps({ state })} />)
    expect(screen.getByRole('button', { name: '다음 질문으로' })).toBeEnabled()
  })
})

describe('ResultScene', () => {
  it('renders the provisional result matching the stored result code', () => {
    const state = { ...createJourneyState('nbti_result'), resultCode: 'P00' }
    render(<ResultScene {...baseProps({ state })} onPair={vi.fn()} />)
    expect(screen.getByText('든든한 항해사')).toBeInTheDocument()
  })

  it('reveals the game recommendations panel only after the visitor asks for it', async () => {
    const state = { ...createJourneyState('nbti_result'), resultCode: 'P00' }
    render(<ResultScene {...baseProps({ state })} onPair={vi.fn()} />)

    expect(screen.queryByLabelText('기다리는 동안 추천 영상')).not.toBeInTheDocument()
    await userEvent.click(screen.getByText('우리 교실 놀이 추천받기'))
    expect(screen.getByText('처음부터 시작하기')).toBeInTheDocument()
  })
})
