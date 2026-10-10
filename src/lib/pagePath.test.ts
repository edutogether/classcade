import { describe, expect, it } from 'vitest'
import { samePagePath } from './pagePath'

describe('samePagePath', () => {
  it('keeps ordinary paths and collapses leading slashes so the result cannot name another host', () => {
    expect(samePagePath('/')).toBe('/')
    expect(samePagePath('/classcade/')).toBe('/classcade/')
    expect(samePagePath('//evil.example/x')).toBe('/evil.example/x')
    expect(samePagePath('///evil.example')).toBe('/evil.example')
    expect(new URL(samePagePath('//evil.example/x'), 'https://classcade.edutogether.kr').origin).toBe('https://classcade.edutogether.kr')
  })
})
