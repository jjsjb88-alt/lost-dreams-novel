/** A single reading surface, with only already-read adjacent signal fragments. */
export function preparePerception(chapter, index, resolve, wasRead = () => true) {
  const beat = chapter?.beats?.[index];
  if (!beat || typeof resolve !== 'function') return null;
  const source = resolve(chapter, beat, index);
  if (!source || source.body !== beat.text) return null;
  const canLead = (cue, entry) => Boolean(cue?.primary && cue.kind !== 'neural' && !entry?.choice && Array.from(entry?.text || '').length <= 360);
  const primary = canLead(source, beat);
  const history = [];
  let start = index;
  for (let i = index - 1; i >= 0; i--) {
    if (!wasRead(i)) break;
    const past = chapter.beats[i], cue = resolve(chapter, past, i);
    if (!cue || cue.body !== past.text || cue.kind !== source.kind || cue.sender !== source.sender || cue.title !== source.title) break;
    start = i;
    if (primary && canLead(cue, past) && history.length < 3) history.unshift({ id: cue.id, body: past.text });
  }
  return {
    source, primary,
    groupId: `${chapter.id}:${start}:${source.kind}:${source.sender || ''}`,
    presentation: { ...source, body: primary ? beat.text : '', history },
  };
}

export function communicationReadDelay(text, revealMs = 0) {
  return Math.min(18000, Math.max(2200, Array.from(String(text || '')).length * 48 + Math.min(1500, Math.max(0, Number(revealMs) || 0))));
}

/** An active sensory scene persists through its narration, ending at a real scene boundary. */
export function sensoryContextForBeat(chapter, index, resolve) {
  const current = chapter?.beats?.[index];
  if (!current || current.direction?.mood !== 'dream') return false;
  const place = current.direction?.place || '';
  for (let i = index; i >= 0; i--) {
    const past = chapter.beats[i];
    if (past.scene !== current.scene || past.direction?.mood !== 'dream' || (past.direction?.place || '') !== place) break;
    if (resolve(chapter, past, i)?.kind === 'neural') return true;
  }
  return false;
}
