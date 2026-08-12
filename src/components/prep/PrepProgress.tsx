/** Five steps: the four questions plus the nickname screen that closes the prep flow. */
const STEPS = [1, 2, 3, 4, 5] as const

export function PrepProgress({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  return <div className="entry-progress" aria-label={`모험 준비 ${step} / ${STEPS.length}`}>
    <b>{step} / {STEPS.length}</b>
    <span>{STEPS.map((value) => <i className={value <= step ? 'is-complete' : ''} key={value} />)}</span>
  </div>
}
