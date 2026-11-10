export function directedPortrait(direction, assets, fallback = '') {
  const focus = direction?.cast?.find((person) => person.id === direction.focus);
  if (focus && assets?.[focus.id]) return { id: focus.id, name: focus.name, side: focus.side };
  if (fallback && assets?.[fallback]) return { id: fallback, name: '', side: 'left' };
  return null;
}

export function directedCast(direction, assets, fallback = '') {
  const present = (direction?.cast ?? []).filter((person) => !person.remote && assets?.[person.id]);
  const ordered = [...present].sort((a, b) => Number(b.id === direction?.focus) - Number(a.id === direction?.focus));
  const visible = ordered.slice(0, 2).map((person) => ({ id: person.id, name: person.name, side: person.side, focus: person.id === direction?.focus }));
  if (visible.length > 1 && visible[0].side === visible[1].side) visible[1].side = visible[0].side === 'left' ? 'right' : 'left';
  if (!visible.length && fallback && assets?.[fallback]) visible.push({ id: fallback, name: '', side: 'left', focus: false });
  return visible;
}

export function sceneClass(scene) {
  return String(scene ?? 'neutral').replace(/[^a-z0-9_-]/gi, '') || 'neutral';
}

const motifLines = {
  clay: [['path', { d: 'M81 34 Q91 40 103 34 L99 70 Q96 83 81 78 Q68 74 70 62 Z' }], ['path', { d: 'M79 34 Q91 28 104 34 M74 89 Q93 82 112 89 M68 96 Q92 101 118 95' }], ['circle', { cx: 93, cy: 58, r: 3 }]],
  bread: [['path', { d: 'M44 85 Q42 68 57 62 Q66 44 83 53 Q99 38 112 56 Q132 52 138 69 Q150 83 136 91 Q111 99 67 94 Z' }], ['path', { d: 'M69 60 l8 13 M91 55 l8 14 M113 59 l8 13' }], ['path', { d: 'M158 50 h42 v39 h-42 z M164 58 h30 M164 67 h24 M164 76 h19' }]],
  metal: [['path', { d: 'M51 83 L78 64 L103 68 L126 45 L163 57 L184 47' }], ['path', { d: 'M54 90 L82 72 L108 77 L130 54 L163 66 L185 56' }], ['path', { d: 'M78 64 L82 72 M126 45 L130 54 M163 57 L163 66' }]],
  note: [['path', { d: 'M70 34 H145 L165 53 V105 H70 Z' }], ['path', { d: 'M145 34 V54 H165 M88 65 H145 M88 76 H139 M88 87 H132' }], ['path', { d: 'M113 34 V54 H145' }]],
  water: [['path', { d: 'M39 78 H83 L78 101 H45 Z M99 69 H143 L138 101 H105 Z M159 78 H203 L198 101 H165 Z' }], ['path', { d: 'M61 46 C55 56 53 60 61 64 C69 60 67 55 61 46 Z M121 42 C115 52 113 56 121 60 C129 56 127 51 121 42 Z M181 48 C175 58 173 62 181 66 C189 62 187 57 181 48 Z' }], ['path', { d: 'M61 102 V115 H181 V102' }]],
  pot: [['path', { d: 'M73 54 H145 L138 91 Q135 99 109 99 Q83 99 80 91 Z M73 62 H59 Q53 62 55 72 Q57 78 79 77 M145 62 H159 Q165 62 163 72 Q161 78 139 77' }], ['path', { d: 'M99 47 Q109 39 119 47 M103 41 H115' }], ['path', { d: 'M90 108 Q109 102 128 108' }]],
  tower: [['path', { d: 'M89 102 V50 L109 34 L129 50 V102 Z M83 102 H135 M100 58 H107 V66 H100 Z M116 58 H123 V66 H116 Z M100 74 H107 V82 H100 Z M116 74 H123 V82 H116 Z M105 102 V89 H114 V102' }], ['path', { d: 'M57 93 Q64 83 72 91 M151 91 Q159 81 168 89' }], ['circle', { cx: 109, cy: 24, r: 3 }]],
  plants: [['path', { d: 'M53 96 H91 L87 110 H58 Z M105 96 H143 L139 110 H110 Z M157 96 H195 L191 110 H162 Z' }], ['path', { d: 'M72 95 V62 M72 77 Q52 73 56 58 Q70 60 72 77 M72 70 Q90 67 88 51 Q74 55 72 70 M124 95 V55 M124 75 Q104 72 108 58 Q122 60 124 75 M124 66 Q142 64 139 48 Q126 52 124 66 M176 95 V64 M176 79 Q158 76 160 62 Q174 64 176 79 M176 70 Q192 67 190 53 Q178 57 176 70' }]],
  ledger: [['path', { d: 'M56 35 H162 L180 52 V105 H56 Z M162 35 V52 H180 M72 63 H163 M72 74 H163 M72 85 H163 M107 57 V96 M137 57 V96' }], ['path', { d: 'M67 57 h30 M67 68 h30 M67 79 h30 M67 90 h30' }]],
};

export function createMotifSVG(motif, large = false) {
  if (!motifLines[motif]) return null;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 240 140'); svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('motif-art'); if (large) svg.classList.add('large');
  const glow = document.createElementNS(ns, 'ellipse'); glow.setAttribute('cx', '120'); glow.setAttribute('cy', '111'); glow.setAttribute('rx', '84'); glow.setAttribute('ry', '9'); glow.setAttribute('class', 'motif-glow'); svg.append(glow);
  for (const [tag, attrs] of motifLines[motif]) {
    const shape = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) shape.setAttribute(key, value);
    shape.setAttribute('class', 'motif-stroke'); svg.append(shape);
  }
  return svg;
}
