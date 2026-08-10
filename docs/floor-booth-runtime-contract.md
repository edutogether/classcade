# Floor booth runtime contract

This contract reserves the runtime boundary for the later floor-booth phase. It intentionally creates no operator UI, pairing transport, or reset flow.

## Runtime configuration

```ts
type BoothRuntimeConfig = {
  operatingMode: 'open' | 'paused'
  allowNewSessions: boolean
  deviceId?: string // local device identity only; never a participant identity
  singleLaptopFallback: boolean
}
```

`operatingMode: 'paused'` and `allowNewSessions: false` are the future interruption boundary. Current entry flow continues to use its existing local journey storage and does not consume this configuration yet.

## Participant state

`new | resumable | active | completed`

Future commands are `resetCurrentSession`, `resetDeviceForNextTimeslot`, and `pairingRecovery`. A later pairing backend owns communication between laptops; neither browser localStorage nor this contract transfers participant state across devices.

## Operations assumptions

- A: 10:00–12:00; pause: 12:00–13:00; B: 13:00–15:00; C: 15:00–17:00.
- Each time slot supports four participants; laptop A/B can work on the same role.
- A participant's flow is not reassigned mid-experience.
- Single-laptop fallback is supported by keeping the same UI and storage semantics.
- Admin/pause/reset controls are explicitly deferred to phase 8.
