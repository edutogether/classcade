/** A same-origin path for reassigning `location` or `history`: a pathname that starts with two or
 *  more slashes (`//host/…`, reachable through hosts that do not canonicalise it) would be read as a
 *  protocol-relative URL and leave this site, so leading slashes collapse to one. */
export function samePagePath(pathname: string) { return pathname.replace(/^\/{2,}/, '/') }
