import { describe, expect, it } from 'vitest'
import { NBTI_AXES, NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { scoreNbtiAnswers, resultCodeFromAnswers } from '../../data/nbtiScoring.provisional'
import { PROVISIONAL_NBTI_RESULTS } from '../../data/nbtiResults.provisional'
import { createJourneyState, journeyReducer, journeyStatusForStage, validateJourneyState } from './journeyState'

function completeNbti() {
  let state = journeyReducer(createJourneyState(), { type: 'START_NBTI' })
  for (const question of NBTI_QUESTIONS) {
    state = journeyReducer(state, { type: 'ANSWER_NBTI', questionId: question.id, choiceId: question.choices[0].id })
    state = journeyReducer(state, { type: 'NEXT_NBTI' })
  }
  return state
}

describe('golden-path journey reducer', () => {
  it('defines sixteen single-axis scenes with a seven-point, non-tied decision on every axis', () => {
    expect(NBTI_QUESTIONS).toHaveLength(16)
    for (const axis of NBTI_AXES) {
      const questions = NBTI_QUESTIONS.filter((question) => question.axis === axis.id)
      expect(questions).toHaveLength(4)
      expect(questions.reduce((total, question) => total + question.weight, 0)).toBe(7)
    }
  })

  it('maps every one of the sixteen direction combinations to exactly one result', () => {
    expect(PROVISIONAL_NBTI_RESULTS).toHaveLength(16)
    for (let value = 0; value < 16; value += 1) {
      const bits = value.toString(2).padStart(4, '0').split('').map(Number)
      const answers = Object.fromEntries(NBTI_QUESTIONS.map((question) => [question.id, question.choices[bits[NBTI_AXES.findIndex((axis) => axis.id === question.axis)] as 0 | 1].id]))
      const expected = `P${value.toString().padStart(2, '0')}`
      expect(resultCodeFromAnswers(answers)).toBe(expected)
      expect(PROVISIONAL_NBTI_RESULTS.filter((result) => result.code === expected)).toHaveLength(1)
      for (const score of Object.values(scoreNbtiAnswers(answers))) expect(score.zero + score.one).toBe(7)
    }
  })

  it('guards NBTI forward navigation until the current choice is valid', () => {
    const started = journeyReducer(createJourneyState(), { type: 'START_NBTI' })
    expect(journeyReducer(started, { type: 'NEXT_NBTI' })).toBe(started)
    expect(journeyReducer(started, { type: 'ANSWER_NBTI', questionId: 'wrong', choiceId: 'also-wrong' })).toBe(started)
  })

  it('calculates a deterministic provisional result after all questions', () => {
    const answers = Object.fromEntries(NBTI_QUESTIONS.map((question) => [question.id, question.choices[0].id]))
    expect(resultCodeFromAnswers(answers)).toBe('P00')
    const complete = completeNbti()
    expect(complete).toMatchObject({ stage: 'nbti_result', resultCode: 'P00' })
    expect(journeyStatusForStage(complete.stage)).toBe('nbti_complete')
  })

  it('returns to the preceding NBTI question and preserves the selected answer', () => {
    let state = journeyReducer(createJourneyState(), { type: 'START_NBTI' })
    const first = NBTI_QUESTIONS[0]
    state = journeyReducer(state, { type: 'ANSWER_NBTI', questionId: first.id, choiceId: first.choices[0].id })
    state = journeyReducer(state, { type: 'NEXT_NBTI' })
    state = journeyReducer(state, { type: 'PREVIOUS_STAGE' })
    expect(state).toMatchObject({ stage: 'nbti_question', questionIndex: 0, answers: { [first.id]: first.choices[0].id } })
  })

  it('steps back from the result to the last question via PREVIOUS_STAGE', () => {
    const result = completeNbti()
    const back = journeyReducer(result, { type: 'PREVIOUS_STAGE' })
    expect(back).toMatchObject({ stage: 'nbti_question', questionIndex: NBTI_QUESTIONS.length - 1 })
  })

  it('returns home without deleting progress and resumes the exact stored stage', () => {
    const result = completeNbti()
    const home = journeyReducer(result, { type: 'GO_HOME' })
    expect(home).toMatchObject({ stage: 'nbti_start', resumeStage: 'nbti_result', resultCode: 'P00' })
    expect(journeyReducer(home, { type: 'RESUME_JOURNEY' })).toMatchObject({ stage: 'nbti_result', resumeStage: null, resultCode: 'P00' })
  })

  it('re-explores from question 1 with every answer preserved', () => {
    const result = completeNbti()
    const reviewed = journeyReducer(result, { type: 'REVIEW_NBTI' })
    expect(reviewed.stage).toBe('nbti_question')
    expect(reviewed.questionIndex).toBe(0)
    expect(reviewed.answers).toEqual(result.answers)
  })

  it('preserves audio toggles across a full reset', () => {
    let state = journeyReducer(createJourneyState(), { type: 'SET_AUDIO', audio: { bgmEnabled: true, bgmVolume: .42, sfxEnabled: true } })
    state = journeyReducer(state, { type: 'RESET_NBTI' })
    expect(state).toMatchObject({ stage: 'nbti_start', audio: { bgmEnabled: true, bgmVolume: .42, sfxEnabled: true } })
  })

  it('rejects malformed restored journey records', () => {
    expect(validateJourneyState({ version: 2, stage: 'nbti_result' })).toBeNull()
    expect(validateJourneyState({ ...createJourneyState(), questionIndex: 99 })).toBeNull()
    expect(validateJourneyState(createJourneyState())).toMatchObject({ version: 3, stage: 'nbti_start' })
  })
})
