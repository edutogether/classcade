import type { DeviceMode, Profile } from './storage'

export type EntryScreen = 'prep' | 'start'

export function resolveEntryState(deviceMode: DeviceMode, profile: Profile | null, hasActiveSharedSession: boolean): { screen: EntryScreen; sharedSessionGateOpen: boolean } {
  return {
    screen: profile ? 'start' : 'prep',
    sharedSessionGateOpen: deviceMode === 'shared' && hasActiveSharedSession,
  }
}
