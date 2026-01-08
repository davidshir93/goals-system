/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(hexColor: string): number {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply gamma correction
  const [rLin, gLin, bLin] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  // Calculate luminance
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Determine if text should be dark or light based on background color
 * Returns 'dark' for dark text, 'light' for light text
 */
export function getContrastTextColor(bgColor: string): 'dark' | 'light' {
  try {
    const luminance = getLuminance(bgColor);
    // Use 0.5 as threshold (higher = more sensitive to light backgrounds)
    return luminance > 0.5 ? 'dark' : 'light';
  } catch {
    return 'dark'; // Default to dark text
  }
}

/**
 * Get the actual text color value
 */
export function getTextColorForBg(bgColor: string): string {
  return getContrastTextColor(bgColor) === 'dark'
    ? 'rgba(0, 0, 0, 0.87)'
    : 'rgba(255, 255, 255, 0.95)';
}
