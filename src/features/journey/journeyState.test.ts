import { describe, expect, it } from 'vitest'
import { NBTI_AXES, NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
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

  it('maps every one of the sixteen direction combinations to exactly one result and game variant', () => {
    expect(PROVISIONAL_NBTI_RESULTS).toHaveLength(16)
    for (let value = 0; value < 16; value += 1) {
      const bits = value.toString(2).padStart(4, '0').split('').map(Number)
      const answers = Object.fromEntries(NBTI_QUESTIONS.map((question) => [question.id, question.choices[bits[NBTI_AXES.findIndex((axis) => axis.id === question.axis)] as 0 | 1].id]))
      const expected = `P${value.toString().padStart(2, '0')}`
      expect(resultCodeFromAnswers(answers)).toBe(expected)
      expect(PROVISIONAL_NBTI_RESULTS.filter((result) => result.code === expected)).toHaveLength(1)
      expect(getGameVariantForResult(expected).resultCodes).toContain(expected)
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
    expect(complete).toMatchObject({ stage: 'nbti_result', resultCode: 'P00', gameVariantId: 'mapmakers-guild' })
    expect(journeyStatusForStage(complete.stage)).toBe('nbti_complete')
  })

  it('maps every provisional result to a playable game variant', () => {
    for (let index = 0; index < 16; index += 1) expect(getGameVariantForResult(`P${index.toString().padStart(2, '0')}`).resultCodes).toContain(`P${index.toString().padStart(2, '0')}`)
  })

  it('makes result-dependent game choices and reaches the shake stage', () => {
    let state = completeNbti()
    state = journeyReducer(state, { type: 'OPEN_GAME_INTRO' })
    state = journeyReducer(state, { type: 'START_GAME' })
    expect(state.stage).toBe('game_conditions')
    state = journeyReducer(state, { type: 'SET_GAME_CONDITIONS', conditions: { schoolLevel: 'elementary', size: 'large', time: 'standard', space: 'room', mood: 'cooperative' } })
    state = journeyReducer(state, { type: 'SELECT_GAME_CONCEPT', concept: 'team' })
    state = journeyReducer(state, { type: 'SELECT_GAME_CANDIDATE', candidateId: 'bridge-mission' })
    state = journeyReducer(state, { type: 'SET_GAME_ADJUSTMENT', key: 'time', value: '낮게' })
    state = journeyReducer(state, { type: 'COMPLETE_GAME_BUILDER' })
    expect(state).toMatchObject({ stage: 'game_complete', selectedGameId: 'bridge-mission', gameAdjustments: { time: '낮게' } })
    expect(validateJourneyState(state)).toMatchObject({ stage: 'game_complete', selectedGameId: 'bridge-mission' })
  })

  it('supports the accessible shake fallback and only completes at 100%', () => {
    let state = completeNbti()
    state = { ...state, stage: 'game_shake' }
    state = journeyReducer(state, { type: 'ADD_SHAKE', amount: 75 })
    expect(state).toMatchObject({ stage: 'game_shake', shakeProgress: 75 })
    state = journeyReducer(state, { type: 'ADD_SHAKE', amount: 25 })
    expect(state.stage).toBe('game_complete')
    expect(state.completedAt).toEqual(expect.any(String))
  })

  it('only opens sharing after completion and preserves audio toggles across reset', () => {
    let state = journeyReducer(createJourneyState(), { type: 'OPEN_SHARING' })
    expect(state.stage).toBe('nbti_start')
    state = journeyReducer(state, { type: 'SET_AUDIO', audio: { bgmEnabled: true, bgmVolume: .42, sfxEnabled: true } })
    state = journeyReducer(state, { type: 'RESET_NBTI' })
    expect(state).toMatchObject({ stage: 'nbti_start', audio: { bgmEnabled: true, bgmVolume: .42, sfxEnabled: true } })
  })

  it('rejects malformed restored journey records', () => {
    expect(validateJourneyState({ version: 1, stage: 'game_complete' })).toBeNull()
    expect(validateJourneyState({ ...createJourneyState(), questionIndex: 99 })).toBeNull()
    expect(validateJourneyState(createJourneyState())).toMatchObject({ version: 2, stage: 'nbti_start' })
  })
})
