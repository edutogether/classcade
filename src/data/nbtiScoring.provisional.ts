import { NBTI_QUESTIONS, type NbtiAxis } from './nbti.provisional'

export type NbtiScores = Record<NbtiAxis, number>

export function scoreNbtiAnswers(answers: Record<string, string>): NbtiScores {
  const totals: NbtiScores = { explore: 0, structure: 0, connection: 0, spark: 0 }
  const counts: Record<NbtiAxis, number> = { explore: 0, structure: 0, connection: 0, spark: 0 }

  for (const question of NBTI_QUESTIONS) {
    const choice = question.choices.find((candidate) => candidate.id === answers[question.id])
    if (!choice) continue
    totals[choice.axis] += choice.value
    counts[choice.axis] += 1
  }

  return (Object.keys(totals) as NbtiAxis[]).reduce<NbtiScores>((scores, axis) => {
    scores[axis] = counts[axis] ? Math.round((totals[axis] / counts[axis]) * 100) : 0
    return scores
  }, { explore: 0, structure: 0, connection: 0, spark: 0 })
}

/** Four binary preferences make a deterministic, non-diagnostic provisional code. */
export function resultCodeFromAnswers(answers: Record<string, string>) {
  const scores = scoreNbtiAnswers(answers)
  const bits = [scores.explore, scores.structure, scores.connection, scores.spark].map((score) => score >= 50 ? '1' : '0').join('')
  return `P${Number.parseInt(bits, 2).toString().padStart(2, '0')}`
}
