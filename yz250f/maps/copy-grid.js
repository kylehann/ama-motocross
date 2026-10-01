/**
 * Copy-grid polish for YZ250F Maps (Janecoon).
 * Wire: <script type="module" src="maps/copy-grid.js"></script>
 * Usage: import { formatMapForCopy, copyText, attachCopyButtons } from './copy-grid.js'
 * Does not invent FI/IG numbers — only formats what maps.json already has.
 */
export function formatGrid(grid, label) {
  if (!grid || !Array.isArray(grid)) return `${label}: (no numbers yet)\n`;
  const rows = grid.map((row) =>
    (row || []).map((c) => (c === null || c === undefined ? '—' : String(c))).join('\t')
  );
  return `${label} (rows = RPM low→high, cols = POSITION low→high)\n${rows.join('\n')}\n`;
}

export function formatMapForCopy(map, axes) {
  const lines = [];
  lines.push(map.label || map.id || 'Map');
  if (map.suggestedSlot || map.suggested_slot) {
    lines.push(`Suggested slot: ${map.suggestedSlot || map.suggested_slot}`);
  }
  lines.push(`When: ${map.whenToUse || map.when_to_use || ''}`);
  if (axes) {
    lines.push(
      `Axes — POSITION: ${(axes.throttle_opening || axes.position || []).join(', ')} | RPM: ${(axes.engine_speed || axes.rpm || []).join(', ')}`
    );
  }
  lines.push('IMPORTANT: Match POSITION % and RPM labels in Power Tuner before entering cells.');
  lines.push('');
  const fi = map.fiGrid || map.fi;
  const ig = map.igGrid || map.ig;
  lines.push(formatGrid(fi, 'FI (fuel)'));
  lines.push(formatGrid(ig, 'IG (ignition)'));
  lines.push('Load: create map → enter cells → upload arrow → assign Map1/Map2.');
  lines.push('Not warranty advice. Verify on your bike.');
  return lines.join('\n');
}

export async function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return ok;
}

export function toast(msg) {
  let el = document.getElementById('yz-copy-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'yz-copy-toast';
    el.setAttribute('role', 'status');
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#16a34a',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: '999px',
      fontWeight: '600',
      zIndex: '9999',
      boxShadow: '0 4px 20px rgba(0,0,0,.35)',
      opacity: '0',
      transition: 'opacity .2s',
    });
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.style.opacity = '0';
  }, 1600);
}

/** Attach to buttons with data-map-id; pass maps array + optional axes */
export function attachCopyButtons(root, maps, axes) {
  const byId = Object.fromEntries((maps || []).map((m) => [m.id, m]));
  (root || document).querySelectorAll('[data-copy-map]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-copy-map');
      const map = byId[id];
      if (!map) {
        toast('Map not found');
        return;
      }
      const text = formatMapForCopy(map, axes);
      const ok = await copyText(text);
      toast(ok ? 'Copied for Power Tuner' : 'Copy failed');
      btn.textContent = ok ? 'Copied ✓' : 'Copy failed';
      setTimeout(() => {
        btn.textContent = btn.getAttribute('data-label') || 'Copy grid';
      }, 1800);
    });
  });
}

// Auto: if window.YZ_MAPS is set, bind [data-copy-map]
if (typeof window !== 'undefined') {
  window.YZCopyGrid = { formatMapForCopy, copyText, toast, attachCopyButtons, formatGrid };
  window.addEventListener('DOMContentLoaded', () => {
    if (window.YZ_MAPS && window.YZ_MAPS.maps) {
      attachCopyButtons(document, window.YZ_MAPS.maps, window.YZ_MAPS.axes || window.YZ_MAPS.fi_ig_grid_template?.axes);
    }
  });
}
