/** Per-type result backdrops. Files are discovered by name, so dropping
 *  `nbti-result-<MBTI>.png` into assets/classcade/nbti-results/ wires that type up with
 *  zero code changes; types without a file fall back to the scene's default plate. */
const modules = import.meta.glob('../assets/classcade/nbti-results/nbti-result-*.{png,webp}', { eager: true, import: 'default' }) as Record<string, string>

const byType: Record<string, string> = {}
for (const [path, url] of Object.entries(modules)) {
  const match = path.match(/nbti-result-([A-Z]{4})\.(?:png|webp)$/)
  if (match) byType[match[1]] = url
}

export function nbtiResultArt(mbti: string): string | undefined {
  /* Until all sixteen drawings exist, ESTJ's art stands in for every type — each new
     nbti-result-<MBTI>.png dropped into the folder takes over its own type automatically. */
  return byType[mbti] ?? byType.ESTJ
}
