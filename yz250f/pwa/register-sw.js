/** Register SW (scope = this /yz250f/ folder only) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((e) => console.warn('SW register failed', e));
  });
}
