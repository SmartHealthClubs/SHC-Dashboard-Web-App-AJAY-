// Chart.js draws on a <canvas> and can't resolve CSS custom properties
// (var(--color-brand-blue)) the way DOM/CSSOM styling can — canvas fillStyle/
// strokeStyle need literal color values. These mirror src/styles/tokens.css
// exactly; keep both in sync if the brand palette ever changes.
export const BRAND_BLUE = '#3d8fed';
export const BRAND_CYAN = '#43c1e8';
export const BRAND_NAVY = '#1e2f51';
export const BRAND_PALE = '#dafbff';
export const BRAND_GOLD = '#ffc869';
export const BRAND_ORANGE = '#ff914d';
export const TEXT_SECONDARY = '#555a5b';
export const STATUS_POSITIVE = '#1fb68a';
export const STATUS_NEGATIVE = '#e5544b';
export const STATUS_WARNING = '#ffc869';

/** Ranked bar chart palette — same rotation order used throughout the React app. */
export const BAR_COLORS = [BRAND_BLUE, BRAND_CYAN, BRAND_GOLD, BRAND_ORANGE, BRAND_NAVY];
