/** Returns a 0–100 meter fill only when a meaningful ratio exists. */
export function statMeterPercent(
  numerator: number,
  denominator: number,
): number | undefined {
  if (denominator <= 0 || numerator <= 0) {
    return undefined;
  }

  return Math.min(100, Math.round((numerator / denominator) * 100));
}
