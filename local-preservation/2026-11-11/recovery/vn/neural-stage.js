const SVG_NS = 'http://www.w3.org/2000/svg';
const KINDS = new Set(['assistant', 'message', 'neural', 'system', 'broadcast']);
const LABELS = {
  assistant: '곁의 목소리', message: '개인 메시지', neural: '뉴럴피드',
  system: '처리 기록', broadcast: '도시 방송',
};
const ACCENTS = { teal: '#a2d7ce', cyan: '#b1dee3', ice: '#b1dee3', mint: '#a2d7ce', warm: '#e5c397', amber: '#e5c397', violet: '#c2b4e7', rose: '#e0a9a5' };
let nextReaderId = 0;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}

function svgNode(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
  return element;
}

function createMark(kind) {
  const svg = svgNode('svg', { viewBox: '0 0 48 48', fill: 'none', 'aria-hidden': 'true', focusable: 'false' });
  svg.classList.add('neural-mark');
  if (kind === 'assistant') {
    svg.append(svgNode('circle', { cx: 24, cy: 24, r: 7, class: 'neural-mark-core' }));
    svg.append(svgNode('ellipse', { cx: 24, cy: 24, rx: 19, ry: 11, transform: 'rotate(-35 24 24)', class: 'neural-mark-orbit' }));
    svg.append(svgNode('path', { d: 'M5 26c6 0 5-9 10-9s6 15 11 15 5-10 9-10h8', class: 'neural-mark-voice' }));
  } else if (kind === 'message') {
    svg.append(svgNode('path', { d: 'M10 13h28v20H23l-9 5v-5h-4z M15 20h18 M15 25h11' }));
  } else if (kind === 'neural') {
    svg.append(svgNode('circle', { cx: 24, cy: 24, r: 16 }));
    svg.append(svgNode('path', { d: 'M24 3v9 M24 36v9 M3 24h9 M36 24h9 M17 24l5 5 10-12' }));
  } else if (kind === 'broadcast') {
    svg.append(svgNode('path', { d: 'M20 18l11-5v22l-11-5h-7V18z M35 16c5 4 5 12 0 16 M17 31l3 8h5l-3-8' }));
  } else {
    svg.append(svgNode('path', { d: 'M13 7h22v34H13z M18 16h12 M18 23h12 M18 30h7' }));
  }
  return svg;
}

function createField(kind) {
  const field = node('div', `neural-field neural-field-${kind}`);
  field.setAttribute('aria-hidden', 'true');
  if (kind === 'neural') {
    const svg = svgNode('svg', { viewBox: '0 0 760 460', fill: 'none', focusable: 'false', preserveAspectRatio: 'xMidYMid meet' });
    svg.classList.add('neural-field-svg');
    const rings = svgNode('g', { class: 'neural-rings' });
    [114, 151, 186, 219].forEach((radius, index) => rings.append(svgNode('circle', {
      cx: 380, cy: 230, r: radius, class: `neural-ring neural-ring-${index}`,
    })));
    const orbit = svgNode('g', { class: 'neural-orbital' });
    orbit.append(svgNode('ellipse', { cx: 380, cy: 230, rx: 310, ry: 129, transform: 'rotate(-17 380 230)' }));
    orbit.append(svgNode('path', { d: 'M95 230H192 M568 230h97 M380 12v47 M380 401v47' }));
    orbit.append(svgNode('circle', { cx: 182, cy: 351, r: 3, class: 'neural-orbit-point' }));
    orbit.append(svgNode('circle', { cx: 577, cy: 109, r: 3, class: 'neural-orbit-point' }));
    const trails = svgNode('g', { class: 'neural-trails' });
    trails.append(svgNode('path', { d: 'M170 323a229 229 0 0 1 15-214 M579 100a229 229 0 0 1 26 213' }));
    trails.append(svgNode('path', { d: 'M235 61a223 223 0 0 1 185-48 M343 449a223 223 0 0 1-134-53' }));
    svg.append(rings, orbit, trails);
    field.append(svg, node('i', 'neural-memory-plane neural-memory-before'), node('i', 'neural-memory-plane neural-memory-after'));
  } else if (kind === 'assistant') {
    const svg = svgNode('svg', { viewBox: '0 0 460 180', fill: 'none', focusable: 'false' });
    svg.classList.add('neural-presence-wave');
    svg.append(svgNode('path', { d: 'M0 91c45 0 52-23 86-23s40 49 76 49 42-68 80-68 42 82 79 82 56-40 139-40' }));
    svg.append(svgNode('path', { d: 'M0 91c54 0 59 13 96 13s40-30 78-30 45 45 85 45 50-28 83-28h118' }));
    field.append(svg);
  } else if (kind === 'broadcast') {
    field.append(node('i', 'neural-broadcast-beam'), node('i', 'neural-broadcast-edge'));
  }
  return field;
}

function textValue(value) {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function metadata(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => metadata(entry)).slice(0, 4);
  if (typeof value === 'object') {
    if ('label' in value || 'value' in value) return [[textValue(value.label), textValue(value.value)].filter(Boolean).join(' · ')].filter(Boolean);
    return Object.values(value).map(textValue).filter(Boolean).slice(0, 4);
  }
  return [textValue(value)].filter(Boolean);
}

function excerpt(text, max = 160) {
  const characters = Array.from(text);
  if (characters.length <= max) return { text, shortened: false };
  let copy = characters.slice(0, max).join('');
  const sentence = Math.max(copy.lastIndexOf('다.'), copy.lastIndexOf('요.'), copy.lastIndexOf('!'), copy.lastIndexOf('?'), copy.lastIndexOf('\n'));
  if (sentence > max * .58) copy = copy.slice(0, sentence + (copy[sentence] === '다' || copy[sentence] === '요' ? 2 : 1));
  return { text: `${copy.trimEnd()}…`, shortened: true };
}

/** Returns lossless numeric ledger fields, or null when prose is ambiguous. */
export function parseNeuralLedger(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  // A decimal point is never a boundary: punctuation must be followed by space.
  const parts = text.split(/((?<=[.!?。！？])\s+|(?:\r\n|\r|\n)+)/u);
  const fields = [];
  let leading = '';
  for (let index = 0; index < parts.length; index += 2) {
    const content = parts[index];
    const separator = parts[index + 1] || '';
    if (!content.trim()) {
      if (fields.length) fields[fields.length - 1].separator += content + separator;
      else leading += content + separator;
      continue;
    }
    const numericAt = content.search(/[+\-−]?\d/u);
    if (numericAt < 0) return null;
    fields.push({ label: leading + content.slice(0, numericAt), value: content.slice(numericAt), separator });
    leading = '';
  }
  if (fields.length < 2 || fields.map(({ label, value, separator }) => label + value + separator).join('') !== text) return null;
  return fields;
}

function ledgerBody(fields) {
  const body = node('dl', 'neural-body neural-ledger');
  for (const field of fields) {
    const row = node('div', 'neural-ledger-field');
    row.append(node('dt', 'neural-ledger-label', field.label), node('dd', 'neural-ledger-value', field.value));
    body.append(row);
    if (field.separator) body.append(document.createTextNode(field.separator));
  }
  return body;
}

/**
 * Scene-bound communications. A primary packet is the single reading surface;
 * sensory narration keeps the original dialogue box below the perception field.
 * An optional onRecall(presentation) owns the full-text view; without it, the
 * expand button opens a bounded reader inside the same scene footprint.
 */
export class NeuralStage {
  constructor(host, { onRecall } = {}) {
    if (!host || typeof host.replaceChildren !== 'function') throw new TypeError('NeuralStage requires a host element.');
    this.host = host;
    this.onRecall = typeof onRecall === 'function' ? onRecall : null;
    this.current = null;
    this.frame = 0;
    this.settleTimer = 0;
    this.layoutFrame = 0;
    this.destroyed = false;
    this.readerId = `neural-reader-${++nextReaderId}`;
    this.host.classList.add('neural-stage');
    this.host.hidden = true;
    this.host.setAttribute('aria-live', 'off');
    this.measure = this.measure.bind(this);
    this.queueMeasure = this.queueMeasure.bind(this);
    this.motionQuery = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.onMotionChange = () => {
      this.host.classList.toggle('neural-reduced', Boolean(this.options?.reducedMotion || this.motionQuery?.matches));
    };
    this.motionQuery?.addEventListener?.('change', this.onMotionChange);
    window.addEventListener('resize', this.queueMeasure, { passive: true });
    this.storyBox = host.parentElement?.querySelector('#storyBox') || null;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.queueMeasure);
      if (host.parentElement) this.resizeObserver.observe(host.parentElement);
      if (this.storyBox) this.resizeObserver.observe(this.storyBox);
    }
  }

  cancelEntrance() {
    if (this.frame) cancelAnimationFrame(this.frame);
    if (this.settleTimer) clearTimeout(this.settleTimer);
    this.frame = 0;
    this.settleTimer = 0;
  }

  queueMeasure() {
    if (this.destroyed || this.layoutFrame) return;
    this.layoutFrame = requestAnimationFrame(() => {
      this.layoutFrame = 0;
      this.measure();
    });
  }

  measure() {
    if (this.destroyed || this.host.hidden || !this.host.parentElement) return;
    const bounds = this.host.parentElement.getBoundingClientRect();
    if (!bounds.height) return;
    const storyBounds = this.storyBox?.getBoundingClientRect();
    const floor = storyBounds?.height ? bounds.bottom - storyBounds.top + 22 : Math.min(300, bounds.height * .34);
    this.host.style.setProperty('--neural-floor', `${Math.max(22, floor)}px`);
    // Short viewports receive a compact composition, while keeping the story free.
    this.host.classList.toggle('neural-short', bounds.height - floor < 335);
    const history = this.host.querySelector('.neural-history');
    const card = this.host.querySelector('.neural-card');
    const scene = this.host.querySelector('.neural-scene');
    if (history && card && scene) {
      const available = Math.max(0, scene.getBoundingClientRect().height);
      const cardStyle = getComputedStyle(card);
      let fixedHeight = parseFloat(cardStyle.paddingTop) + parseFloat(cardStyle.paddingBottom);
      for (const child of card.children) {
        if (child === history || child.classList.contains('neural-body')) continue;
        const style = getComputedStyle(child);
        fixedHeight += child.getBoundingClientRect().height + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
      }
      const reserve = Math.min(96, available * .4);
      const limit = Math.max(0, Math.min(90, available * .2, available - fixedHeight - reserve - 12));
      this.host.style.setProperty('--neural-history-max', `${Math.floor(limit)}px`);
      history.hidden = limit < 18;
    }
  }

  render(presentation, { reducedMotion = false, instant = false, primary = false } = {}) {
    if (this.destroyed) return;
    if (!presentation) { this.clear(); return; }
    this.cancelEntrance();
    this.current = presentation;
    this.options = { reducedMotion, instant, primary };
    const kind = KINDS.has(presentation.kind) ? presentation.kind : 'neural';
    const priority = ['quiet', 'focus', 'interrupt'].includes(presentation.priority) ? presentation.priority : 'focus';
    const reduced = Boolean(reducedMotion || this.motionQuery?.matches);
    const duration = Math.min(1800, Math.max(360, Number(presentation.revealMs) || 780));
    this.host.dataset.neuralKind = kind;
    this.host.dataset.neuralPriority = priority;
    this.host.dataset.neuralPrimary = String(Boolean(primary));
    this.host.dataset.neuralPhase = instant || reduced ? 'settled' : 'entering';
    this.host.classList.toggle('neural-reduced', reduced);
    this.host.classList.toggle('neural-instant', instant);
    this.host.style.setProperty('--neural-reveal', `${duration}ms`);
    const accent = ACCENTS[presentation.accent] || textValue(presentation.accent);
    this.host.style.removeProperty('--neural-accent');
    if (accent && typeof CSS !== 'undefined' && CSS.supports('color', accent)) this.host.style.setProperty('--neural-accent', accent);

    const scene = node('section', `neural-scene neural-scene-${kind}`);
    scene.setAttribute('aria-label', [LABELS[kind], textValue(presentation.sender)].filter(Boolean).join(' · '));
    const field = createField(kind);
    const card = node('div', 'neural-card');
    const header = node('div', 'neural-header');
    const identity = node('div', 'neural-identity');
    const name = textValue(presentation.sender);
    identity.append(node('span', 'neural-channel', LABELS[kind]));
    if (name) identity.append(node('strong', 'neural-sender', name));
    header.append(createMark(kind), identity);
    const status = textValue(presentation.status);
    if (status) header.append(node('span', 'neural-status', status));
    card.append(header);

    const title = textValue(presentation.title);
    if (title && title !== name) card.append(node('h2', 'neural-title', title));
    const past = primary && Array.isArray(presentation.history)
      ? presentation.history.filter((entry) => entry && textValue(entry.body) && (entry.id == null || entry.id !== presentation.id)).slice(-3)
      : [];
    if (past.length) {
      const history = node('div', 'neural-history');
      history.tabIndex = 0;
      history.setAttribute('role', 'group');
      history.setAttribute('aria-label', '앞서 받은 내용');
      past.forEach((entry) => history.append(node('p', 'neural-history-entry', entry.body)));
      history.addEventListener('click', (event) => event.stopPropagation());
      history.addEventListener('pointerdown', (event) => event.stopPropagation());
      history.addEventListener('keydown', (event) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) event.stopPropagation();
      });
      card.append(history);
    }
    const body = typeof presentation.body === 'string' ? presentation.body : textValue(presentation.body);
    const sample = primary ? { text: body, shortened: false } : excerpt(body);
    if (sample.text.trim()) {
      const ledger = primary && kind === 'system' ? parseNeuralLedger(body) : null;
      const bodyNode = ledger ? ledgerBody(ledger) : node('p', 'neural-body', sample.text);
      if (primary) {
        bodyNode.tabIndex = 0;
        bodyNode.setAttribute('aria-label', '연결 내용');
        // The primary reading surface can scroll without also advancing the beat.
        bodyNode.addEventListener('click', (event) => event.stopPropagation());
        bodyNode.addEventListener('pointerdown', (event) => event.stopPropagation());
        bodyNode.addEventListener('keydown', (event) => {
          if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) event.stopPropagation();
        });
      }
      card.append(bodyNode);
    }

    const senses = Array.isArray(presentation.sense) ? presentation.sense.filter((item) => item && (textValue(item.label) || textValue(item.value))).slice(0, 4) : [];
    if (senses.length) {
      const list = node('dl', 'neural-senses');
      for (const sense of senses) {
        const entry = node('div', 'neural-sense');
        if (textValue(sense.label)) entry.append(node('dt', 'neural-sense-label', sense.label));
        if (textValue(sense.value)) entry.append(node('dd', 'neural-sense-value', sense.value));
        list.append(entry);
      }
      card.append(list);
    }

    const meta = metadata(presentation.meta);
    if (meta.length) {
      const footer = node('div', 'neural-meta');
      meta.forEach((item) => footer.append(node('span', '', item)));
      card.append(footer);
    }

    if (sample.shortened) {
      const expand = node('button', 'neural-expand', '내용 펼치기');
      expand.type = 'button';
      expand.setAttribute('aria-label', `${name || title || LABELS[kind]} 내용 전체 보기`);
      expand.addEventListener('pointerdown', (event) => event.stopPropagation());
      expand.addEventListener('keydown', (event) => event.stopPropagation());
      expand.addEventListener('keyup', (event) => event.stopPropagation());
      if (!this.onRecall) {
        expand.setAttribute('aria-controls', this.readerId);
        expand.setAttribute('aria-expanded', 'false');
      }
      const reader = !this.onRecall ? this.createReader(body, expand, scene) : null;
      expand.addEventListener('click', (event) => {
        event.stopPropagation();
        if (this.onRecall) { this.onRecall(presentation); return; }
        const open = expand.getAttribute('aria-expanded') !== 'true';
        expand.setAttribute('aria-expanded', String(open));
        expand.textContent = open ? '접어 두기' : '내용 펼치기';
        reader.hidden = !open;
        scene.classList.toggle('neural-reader-open', open);
        if (open) { reader.scrollTop = 0; reader.focus({ preventScroll: true }); }
      });
      card.append(expand);
      if (reader) scene.append(reader);
    }

    scene.prepend(field, card);
    this.host.replaceChildren(scene);
    this.host.hidden = false;
    this.measure();
    this.queueMeasure();
    if (!instant && !reduced) {
      this.frame = requestAnimationFrame(() => {
        this.frame = requestAnimationFrame(() => {
          this.frame = 0;
          if (this.current !== presentation || this.destroyed) return;
          this.host.dataset.neuralPhase = 'arriving';
          this.settleTimer = setTimeout(() => {
            this.settleTimer = 0;
            if (this.current === presentation && !this.destroyed) this.host.dataset.neuralPhase = 'settled';
          }, duration);
        });
      });
    }
  }

  createReader(body, expand, scene) {
    const reader = node('div', 'neural-reader');
    reader.id = this.readerId;
    reader.hidden = true;
    reader.tabIndex = -1;
    reader.setAttribute('role', 'region');
    reader.setAttribute('aria-label', '연결 내용 전체');
    reader.append(node('p', 'neural-reader-body', body));
    reader.addEventListener('click', (event) => event.stopPropagation());
    reader.addEventListener('pointerdown', (event) => event.stopPropagation());
    reader.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key !== 'Escape') return;
      event.preventDefault();
      reader.hidden = true;
      scene.classList.remove('neural-reader-open');
      expand.setAttribute('aria-expanded', 'false');
      expand.textContent = '내용 펼치기';
      expand.focus({ preventScroll: true });
    });
    reader.addEventListener('keyup', (event) => event.stopPropagation());
    return reader;
  }

  clear() {
    this.cancelEntrance();
    if (this.layoutFrame) cancelAnimationFrame(this.layoutFrame);
    this.layoutFrame = 0;
    this.current = null;
    this.host.hidden = true;
    this.host.replaceChildren();
    delete this.host.dataset.neuralPhase;
    delete this.host.dataset.neuralKind;
    delete this.host.dataset.neuralPriority;
    delete this.host.dataset.neuralPrimary;
  }

  destroy() {
    if (this.destroyed) return;
    this.clear();
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.queueMeasure);
    this.motionQuery?.removeEventListener?.('change', this.onMotionChange);
    this.host.classList.remove('neural-stage', 'neural-reduced', 'neural-instant', 'neural-short');
    this.host.style.removeProperty('--neural-floor');
    this.host.style.removeProperty('--neural-reveal');
    this.host.style.removeProperty('--neural-accent');
    this.host.style.removeProperty('--neural-history-max');
    this.host.removeAttribute('aria-live');
  }
}
