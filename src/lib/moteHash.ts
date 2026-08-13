/** Deterministic hash in [0,1) for firefly scatter — a plain `(i*37)%93` walk put every
 *  mote on one visible diagonal line; this scatters them like real fireflies while
 *  staying stable per index (no per-render flicker). */
export function moteHash(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
