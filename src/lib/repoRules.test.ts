import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// 규칙 장부(_docs/RULES.md)의 R-9 · R-12 · R-15를 재는 가벼운 검사.
const ROOT = join(__dirname, '..', '..');
const read = (rel: string) => readFileSync(join(ROOT, rel), 'utf8');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(name) && name !== 'repoRules.test.ts' ? [path] : [];
  });

describe('R-9 게임 만들기 서브시스템은 삭제된 채로 둔다', () => {
  it('삭제된 파일이 되살아나지 않는다', () => {
    for (const rel of [
      'src/scenes/GameScenes.tsx',
      'src/data/classroomGameBuilder.ts',
      'src/data/gameVariants.provisional.ts',
      'src/components/CanonicalGameScene.tsx',
      'src/components/CompletionExperience.tsx',
    ]) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(false);
    }
  });

  it('소스에 게임 만들기 식별자가 없다', () => {
    const hits = sourceFiles(join(ROOT, 'src')).filter((file) =>
      /classroomGameBuilder|GameScenes|CanonicalGameScene/.test(readFileSync(file, 'utf8')),
    );
    expect(hits).toEqual([]);
  });
});

describe('R-12 prep-03-map-master.webp 자리표시자는 지우지 않는다', () => {
  it('파일이 있고 prepAssets가 가져다 쓴다', () => {
    expect(existsSync(join(ROOT, 'src/assets/classcade/prep-03-interactive/prep-03-map-master.webp'))).toBe(true);
    expect(read('src/components/prep/prepAssets.ts')).toContain('prep-03-map-master.webp');
  });
});

describe('R-15 firebase-tools는 정확한 한 판으로 박아 부른다', () => {
  it('package.json·잠금 파일에 의존성으로 없다', () => {
    const pkg = JSON.parse(read('package.json'));
    expect({ ...pkg.dependencies, ...pkg.devDependencies }).not.toHaveProperty('firebase-tools');
    expect(read('package-lock.json')).not.toMatch(/"node_modules\/firebase-tools"/);
  });

  it('rules:test와 deploy.yml이 같은 정확한 판을 쓰고 @latest·범위가 없다', () => {
    const sources = [read('package.json'), read('.github/workflows/deploy.yml')].join('\n');
    const refs = [...sources.matchAll(/firebase-tools@(\S*)/g)].map((m) => m[1]);
    expect(refs.length).toBeGreaterThanOrEqual(3);
    for (const ref of refs) expect(ref).toMatch(/^\d+\.\d+\.\d+(?![\w.-])/);
    expect(new Set(refs.map((ref) => ref.match(/^\d+\.\d+\.\d+/)![0])).size).toBe(1);
  });
});
