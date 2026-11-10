import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// 2026-11-11 Bumm님 결정: «움직임 줄이기» 신호가 와도 연출은 늘 정상처럼 돈다.
// 원격 접속 등으로 브라우저가 이 신호를 잘못 보고해도 앱의 움직임이 멈추면 안 된다.
const SRC = join(__dirname, '..');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(css|ts|tsx)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.test.tsx') ? [path] : [];
  });

describe('움직임 줄이기 신호로 연출을 멈추지 않는다', () => {
  it('src 아래 어떤 스타일·코드도 prefers-reduced-motion을 읽지 않는다', () => {
    const offenders = sourceFiles(SRC).filter((file) => /prefers-reduced-motion/i.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});
