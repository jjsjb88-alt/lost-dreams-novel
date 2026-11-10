/** One entry session owns its media, listeners and fallback timer. */
export function createEpisodeOneTeaser({ dialog, video, skip, pause, status, document: doc = document, startupMs = 10000 }) {
  let active = null;
  return {
    get open() { return Boolean(active); },
    start({ src, sound, volume = 35, onFinish }) {
      if (active) return;
      const session = { done: false, timer: null };
      active = session;
      const listeners = [];
      const listen = (target, name, fn) => {
        target.addEventListener(name, fn);
        listeners.push(() => target.removeEventListener(name, fn));
      };
      const clearStartup = () => clearTimeout(session.timer);
      const finish = () => {
        if (active !== session || session.done) return;
        session.done = true; active = null; clearStartup();
        listeners.forEach(remove => remove());
        video.pause(); video.removeAttribute('src'); video.load();
        if (dialog.open) dialog.close();
        onFinish();
      };
      const resume = () => {
        if (active !== session) return;
        clearStartup(); session.timer = setTimeout(finish, startupMs);
        status.textContent = '티저를 불러오는 중…';
        try { Promise.resolve(video.play()).catch(() => { if (active === session) finish(); }); }
        catch { finish(); }
      };
      listen(skip, 'click', finish);
      listen(dialog, 'cancel', event => { event.preventDefault(); finish(); });
      listen(video, 'ended', finish);
      listen(video, 'error', finish);
      listen(video, 'playing', () => {
        clearStartup(); pause.textContent = '일시 정지';
        status.textContent = '티저 · 약 55초';
      });
      listen(video, 'pause', () => { pause.textContent = '계속 재생'; });
      listen(pause, 'click', () => {
        if (video.paused) resume();
        else { clearStartup(); video.pause(); status.textContent = '티저 일시 정지'; }
      });
      listen(doc, 'visibilitychange', () => {
        if (doc.hidden) { clearStartup(); video.pause(); status.textContent = '계속 재생하거나 건너뛸 수 있습니다.'; }
      });
      video.muted = !sound;
      video.volume = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume / 100)) : 0.35;
      video.src = src;
      pause.textContent = '일시 정지';
      dialog.showModal(); skip.focus({ preventScroll: true });
      resume();
    },
  };
}
