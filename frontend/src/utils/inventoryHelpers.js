// ─── Inventory colour palette (burgundy gradient per group) ───────────────────
export const BLOOD_GROUP_COLORS = {
  'A+':  '#D95364',
  'A-':  '#C84859',
  'B+':  '#BC3A4D',
  'B-':  '#A92F41',
  'AB+': '#9B1D30',
  'AB-': '#881829',
  'O+':  '#681120',
  'O-':  '#4D0A16',
};

// Fallback colour for unknown groups
export const defaultGroupColor = '#C52233';

// ─── Status from available unit count ─────────────────────────────────────────
export function getInventoryStatus(available) {
  if (available >= 100) return 'Optimal';
  if (available >= 40)  return 'Adequate';
  if (available >= 10)  return 'Low';
  return 'Critical';
}

// ─── Aggregate totals across all blood groups ─────────────────────────────────
export function aggregateInventory(inventory = []) {
  return inventory.reduce(
    (acc, item) => ({
      available: acc.available + (item.available_units || 0),
      reserved:  acc.reserved  + (item.reserved_units  || 0),
      issued:    acc.issued    + (item.issued_units     || 0),
      expired:   acc.expired   + (item.expired_units    || 0),
      total:     acc.total     + (item.total_units      || 0),
    }),
    { available: 0, reserved: 0, issued: 0, expired: 0, total: 0 }
  );
}

// ─── Health score (0–100) based on available vs non-issued ───────────────────
export function calcHealthScore(totals) {
  const base = totals.available + totals.reserved + totals.expired;
  if (base === 0) return 0;
  return Math.round((totals.available / base) * 100);
}

export function healthLabel(score) {
  if (score >= 85) return 'Healthy';
  if (score >= 60) return 'Moderate';
  return 'At Risk';
}

// ─── Critical-low groups (available < 10 units) ───────────────────────────────
export function getCriticalLowGroups(inventory = [], threshold = 10) {
  return inventory
    .filter((item) => item.available_units < threshold)
    .map((item) => ({
      group: item.blood_group,
      units: `${item.available_units} unit${item.available_units !== 1 ? 's' : ''}`,
    }));
}

// ─── Demand profile: group pending requests by blood group ────────────────────
export function buildDemandProfile(requests = []) {
  const counts = {};
  requests.forEach((req) => {
    const g = req.blood_group;
    counts[g] = (counts[g] || 0) + 1;
  });
  const list = Object.entries(counts)
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const max = Math.max(...list.map((d) => d.count), 1);
  return list.map((item) => ({
    ...item,
    percentage: Math.round((item.count / max) * 100),
  }));
}

// ─── Relative-time formatter ──────────────────────────────────────────────────
export function formatTimeAgo(dateStr) {
  if (!dateStr) return 'unknown';
  const date = new Date(dateStr);
  const nowMs = Date.now();
  const diffMs = nowMs - date.getTime();
  if (diffMs < 0) return 'just now';
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1)  return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs  < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

// ─── Short date formatter (e.g. "Oct 8") ─────────────────────────────────────
export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });
}
