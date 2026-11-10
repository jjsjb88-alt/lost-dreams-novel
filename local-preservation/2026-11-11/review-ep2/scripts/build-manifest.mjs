// settings/ 와 manuscript/ 의 Markdown 파일 목록을 manifest.json 으로 만든다.
// 배포할 때 GitHub Actions가 자동으로 실행한다. 로컬 미리보기: node scripts/build-manifest.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

// 초반 후킹 재편 과정에서 원문 보존용으로 남겨 둔 파일.
// 저장소에는 존재할 수 있지만 독자용 manifest에서는 노출하지 않는다.
const HIDDEN_MANUSCRIPT = new Set([
  'ep002-1.md', // 태린/재현 사건: 12화 이후 재사용 후보
  'ep003-1.md', // 핵심 선택권 장면을 9-1에 흡수
  'ep006-2.md', // ep007-2.md로 이동(394f6d3) 후 2026-10-13 7-2를 정본으로 재집필 — 원본 보존용
  'ep011-1.md', // ep011.md 인터컷으로 흡수
  'ep008-1.md', // 2026-10-13 작가 결정(8화 원본 속도 복원)으로 숨김, 원고 보존
  'ep008-2.md', // 위와 같음
]);

const episodeKey = filename => {
  // 8화 범퍼 재번호(2026-10-13): 2026-10-14 시간순 개고: ep008=8 전날 밤, ep007-3=8-1 의결권 없음(회의), ep008-3=8-2 측정 상한, ep008-4=8-3 환자 이름.
  if (filename === 'ep007-3.md') return [8, 1, filename];
  if (filename === 'ep008-3.md') return [8, 2, filename];
  if (filename === 'ep008-4.md') return [8, 3, filename];
  const m = filename.match(/^ep(\d+)(?:-(\d+))?\.md$/);
  if (!m) return [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, filename];
  return [Number(m[1]), Number(m[2] || 0), filename];
};

const compareEpisode = (a, b) => {
  const ak = episodeKey(a);
  const bk = episodeKey(b);
  return ak[0] - bk[0] || ak[1] - bk[1] || ak[2].localeCompare(bk[2]);
};

const list = dir => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .filter(f => dir !== 'manuscript' || !HIDDEN_MANUSCRIPT.has(f))
    .sort(dir === 'manuscript' ? compareEpisode : (a, b) => a.localeCompare(b))
    .map(f => {
      const path = `${dir}/${f}`;
      const text = readFileSync(path, 'utf8');
      const heading = text.match(/^#\s+(.+)$/m);
      return {
        path,
        title: heading ? heading[1].trim() : f.replace(/\.md$/, ''),
        chars: text.replace(/^#.*$/m, '').replace(/\s/g, '').length,
      };
    });
};

const manifest = {
  generatedAt: new Date().toISOString(),
  settings: list('settings'),
  manuscript: list('manuscript'),
};

writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest.json: 설정 ${manifest.settings.length}개, 원고 ${manifest.manuscript.length}화`);
