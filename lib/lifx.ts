/**
 * LIFX API helper functions
 * Provides utilities for color conversion and LIFX API interactions
 */

/**
 * Convert hex color (e.g., #ff0000) to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  if (hex.length !== 6) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert hex color to LIFX color format
 * LIFX accepts both hex format (#ff0000) and rgb format (rgb:255,0,0)
 * We'll use the hex format as it's simpler
 */
export function hexToLifxColor(hex: string): string {
  // LIFX accepts hex colors directly
  return hex.startsWith("#") ? hex : `#${hex}`;
}

/**
 * Get default selector from env or fallback
 */
export function getDefaultSelector(): string {
  return process.env.LIFX_DEFAULT_SELECTOR || "all";
}

/**
 * Get LIFX API token from env
 */
export function getLifxToken(): string | undefined {
  return process.env.LIFX_API_TOKEN;
}
