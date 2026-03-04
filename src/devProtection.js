import disableDevtool from 'disable-devtool';

export function initDevProtection() {
  if (process.env.NODE_ENV !== 'production') return;

  /* ── 1. DevTools detection ──────────────────────────────────────────
   *  Detects DevTools via timing/size tricks and reloads the page.
   *  clearLog: clears console each check cycle.
   *  disableMenu: disables right-click context menu.
   * ────────────────────────────────────────────────────────────────── */
  disableDevtool({
    ondevtoolopen: () => {
      document.body.innerHTML = '';
      window.location.reload();
    },
    clearLog:          true,
    disableMenu:       true,
    clearIntervalTime: 1000,
  });

  /* ── 2. Block hotkey shortcuts ──────────────────────────────────────
   *  F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
   * ────────────────────────────────────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    const ctrl  = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;
    if (
      e.key === 'F12' ||
      (ctrl && shift && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
      (ctrl && e.key.toUpperCase() === 'U')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  /* ── 3. Console warning (Facebook-style) ───────────────────────────
   *  Shows a prominent warning in the console.
   * ────────────────────────────────────────────────────────────────── */
  const stop = '%cSTOP!';
  const msg  = '%cThis is a browser feature intended for developers. Do not paste any code here.';
  setTimeout(() => {
    console.log(stop, 'color:red;font-size:48px;font-weight:900;');
    console.log(msg,  'color:#333;font-size:14px;');
  }, 500);
}
