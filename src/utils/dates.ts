export function getCurrentQuarter(): number {
  const today = new Date();
  // getMonth() returns a zero-based month (0 for January, 11 for December).
  // Adding 1 makes it a 1-based month (1 for January, 12 for December).
  const month = today.getMonth() + 1;
  // Divide the month by 3 and use Math.ceil to round up to the nearest integer.
  // This groups months into quarters (e.g., 1-3 -> 1st quarter, 4-6 -> 2nd quarter).
  const quarter = Math.ceil(month / 3);
  return quarter;
}

function getWeekOfPeriod(d: Date, periodStart: Date) {
  const dp = Math.floor((Number(d) - Number(periodStart)) / 86400000); // Calculate the days passed since periodStart (1000 * 60 * 60 * 24 = 86400000)
  const sw = periodStart.getDay();
  const so = sw === 0 ? 6 : sw - 1; // Adjust Sunday (0) to 6 (ISO starts Monday)
  return Math.floor((dp + so) / 7) + 1;
}

export function getCurrentWeekInQuarter(): number {
  const today = new Date();
  const quarter = getCurrentQuarter();
  const quarterStart = new Date(today.getFullYear(), (quarter - 1) * 3, 1);

  return getWeekOfPeriod(today, quarterStart);
}
