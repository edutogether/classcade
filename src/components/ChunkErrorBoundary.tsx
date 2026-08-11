import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

/**
 * Suspense catches the pending state of a lazy import but not a failed one - a chunk
 * fetch dropped by a flaky connection throws, and with no boundary that's a blank page
 * with no way back short of the user knowing to manually reload. This catches it and
 * offers a retry that just reloads (the next fetch attempt gets a fresh URL anyway).
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div style={{ alignItems: 'center', background: '#050c07', color: '#fff3c6', display: 'grid', gap: '16px', justifyItems: 'center', minHeight: '100svh', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '17px', fontWeight: 700, maxWidth: '360px' }}>다음 화면을 불러오지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.</p>
          <button type="button" onClick={() => window.location.reload()} style={{ background: 'linear-gradient(112deg, #70ad4b 0%, #2f884f 48%, #07563a 100%)', border: '1px solid #eadb9c', borderRadius: '12px', color: '#fffdee', cursor: 'pointer', fontSize: '15px', fontWeight: 800, minHeight: '52px', padding: '0 28px' }}>다시 시도</button>
        </div>
      )
    }
    return this.props.children
  }
}
