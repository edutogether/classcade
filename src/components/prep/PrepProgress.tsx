export function PrepProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return <div className="entry-progress" aria-label={`모험 준비 ${step} / 4`}><b>{step} / 4</b><span>{[1, 2, 3, 4].map((value) => <i className={value <= step ? 'is-complete' : ''} key={value} />)}</span></div>
}
