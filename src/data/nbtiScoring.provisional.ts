import { NBTI_AXES, NBTI_QUESTIONS, type NbtiAxis } from './nbti.provisional'

export type NbtiScores = Record<NbtiAxis, { direction: 0 | 1; zero: number; one: number; total: number }>

export function scoreNbtiAnswers(answers: Record<string, string>): NbtiScores {
  const scores = Object.fromEntries(NBTI_AXES.map(({ id }) => [id, { direction: 0 as 0 | 1, zero: 0, one: 0, total: 0 }])) as NbtiScores
  for (const question of NBTI_QUESTIONS) {
    const choice = question.choices.find((candidate) => candidate.id === answers[question.id])
    if (!choice) continue
    scores[question.axis][choice.direction === 0 ? 'zero' : 'one'] += question.weight
    scores[question.axis].total += question.weight
  }
  for (const axis of NBTI_AXES) {
    const score = scores[axis.id]
    // Every completed axis totals seven points (3+2+1+1), so equality cannot occur.
    score.direction = score.one > score.zero ? 1 : 0
  }
  return scores
}

export function resultCodeFromAnswers(answers: Record<string, string>) {
  const scores = scoreNbtiAnswers(answers)
  const bits = NBTI_AXES.map((axis) => String(scores[axis.id].direction)).join('')
  return `P${Number.parseInt(bits, 2).toString().padStart(2, '0')}`
}
