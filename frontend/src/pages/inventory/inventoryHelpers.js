// ─── Centralized UI Presentation Thresholds ────────────────────────────────────
// IMPORTANT DATA INTEGRITY NOTE:
// The backend database and REST API do NOT define clinical, medical, or authoritative
// blood-bank inventory thresholds or reserve minimums.
// The classifications below are strictly FRONTEND PRESENTATION CONVENTIONS designed
// to visually categorize volume ranges for user interface indicators only.
export const UI_PRESENTATION_THRESHOLDS = {
  LIMITED: 15,   // Units < 15: Highlighted as "Limited" volume in UI
  AVAILABLE: 50, // Units 15 to 49: Displayed as "Available"
  // Units 50+: Displayed as "Substantial"
};

/**
 * Returns a neutral frontend-only display status based on unit counts.
 * Uses descriptive volume terms ("Depleted", "Limited", "Available", "Substantial")
 * rather than medical assertions.
 * 
 * @param {number} availableUnits 
 * @returns {'Depleted' | 'Limited' | 'Available' | 'Substantial'}
 */
export function getStockStatus(availableUnits) {
  const count = Number(availableUnits) || 0;
  if (count === 0) return 'Depleted';
  if (count < UI_PRESENTATION_THRESHOLDS.LIMITED) return 'Limited';
  if (count < UI_PRESENTATION_THRESHOLDS.AVAILABLE) return 'Available';
  return 'Substantial';
}

/**
 * Visual styling configuration for UI status badges & indicators.
 * Calmed palette to avoid presenting healthy inventory as alarming.
 */
export const STOCK_STATUS_CONFIG = {
  Depleted: {
    label: 'No Units',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    barColor: 'bg-rose-600',
    description: 'Zero units currently available in storage',
  },
  Limited: {
    label: 'Limited Stock',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    barColor: 'bg-amber-500',
    description: 'Current unit count is limited',
  },
  Available: {
    label: 'In Stock',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    barColor: 'bg-emerald-600',
    description: 'Units available for allocation',
  },
  Substantial: {
    label: 'Well Stocked',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    barColor: 'bg-emerald-600',
    description: 'Robust supply across storage reserves',
  },
};

/**
 * Aggregates all inventory summary metrics directly from GET /api/inventory response items.
 * @param {Array} inventoryList 
 */
export function aggregateInventoryData(inventoryList = []) {
  return inventoryList.reduce(
    (acc, item) => ({
      available: acc.available + (Number(item.available_units) || 0),
      reserved:  acc.reserved  + (Number(item.reserved_units)  || 0),
      issued:    acc.issued    + (Number(item.issued_units)    || 0),
      expired:   acc.expired   + (Number(item.expired_units)   || 0),
      total:     acc.total     + (Number(item.total_units)     || 0),
    }),
    { available: 0, reserved: 0, issued: 0, expired: 0, total: 0 }
  );
}

/**
 * Formats date into standard Indian localized short string
 * @param {string} dateStr 
 */
export function formatInventoryDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates days remaining until expiration
 * @param {string} expiryDateStr 
 */
export function getDaysUntilExpiry(expiryDateStr) {
  if (!expiryDateStr) return null;
  const expiry = new Date(expiryDateStr);
  const now = new Date();
  // Strip time parts for accurate day diff
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
