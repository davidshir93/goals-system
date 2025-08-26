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

function getWeek(d) {
  const dt = new Date(d); // Convert input string to Date object
  const ys = new Date(dt.getFullYear(), 0, 1); // Get January 1st of the same year
  const dp = Math.floor((dt - ys) / 86400000); // Calculate the days passed since January 1st (1000 * 60 * 60 * 24 = 86400000)
  const sw = ys.getDay();
  const so = sw === 0 ? 6 : sw - 1; // Adjust Sunday (0) to 6 (ISO starts Monday)
  const wn = Math.floor((dp + so) / 7) + 1;

  return wn;
}

export function getCurrentWeekInQuarter(): number {
  const today = new Date();
  // getMonth() returns a zero-based month (0 for January, 11 for December).
  // Adding 1 makes it a 1-based month (1 for January, 12 for December).
  const month = today.getMonth() + 1;
  // Divide the month by 3 and use Math.ceil to round up to the nearest integer.
  // This groups months into quarters (e.g., 1-3 -> 1st quarter, 4-6 -> 2nd quarter).
  const quarter = Math.ceil(month / 3);

  const week = getWeek(today) - (quarter - 1) * 12;
  return Math.floor(week);
}
