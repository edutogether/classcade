import { describe, expect, it } from 'vitest'
import { NBTI_QUESTIONS } from '../../data/nbti.provisional'
import { getGameVariantForResult } from '../../data/gameVariants.provisional'
import { resultCodeFromAnswers } from '../../data/nbtiScoring.provisional'
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
    const variant = getGameVariantForResult(state.resultCode)
    for (const step of variant.choices) {
      state = journeyReducer(state, { type: 'ANSWER_GAME', choiceId: step.options[0].id })
      state = journeyReducer(state, { type: 'NEXT_GAME' })
    }
    expect(state.stage).toBe('game_shake')
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
    expect(validateJourneyState(createJourneyState())).toMatchObject({ stage: 'nbti_start' })
  })
})
