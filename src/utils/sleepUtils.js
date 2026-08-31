/**
 * Sleep Utility Functions for TakMan App
 */

/**
 * Calculate sleep duration in hours from bedtime and wake time.
 * Handles midnight crossover correctly:
 * e.g., Bedtime: 23:00, Wake: 06:00 -> 7 hours
 * If wake time <= bedtime (same day), treat as next day.
 * 
 * @param {string} bedtime - Time string in HH:mm 24h format (e.g., "23:00")
 * @param {string} wakeTime - Time string in HH:mm 24h format (e.g., "06:00")
 * @returns {number} duration in hours rounded to 1 decimal place
 */
export const calculateSleepDuration = (bedtime, wakeTime) => {
  if (!bedtime || !wakeTime) return 0;

  const [bH, bM] = bedtime.split(':').map(Number);
  const [wH, wM] = wakeTime.split(':').map(Number);

  if (isNaN(bH) || isNaN(bM) || isNaN(wH) || isNaN(wM)) return 0;

  const bedtimeMinutes = bH * 60 + bM;
  const wakeMinutes = wH * 60 + wM;

  let diffMinutes;
  if (wakeMinutes <= bedtimeMinutes) {
    // Crosses midnight: bedtime to 24:00 (1440 mins) + 00:00 to wakeTime
    diffMinutes = (1440 - bedtimeMinutes) + wakeMinutes;
  } else {
    // Same day
    diffMinutes = wakeMinutes - bedtimeMinutes;
  }

  const hours = diffMinutes / 60;
  return parseFloat(hours.toFixed(1));
};

/**
 * Evaluate sleep quality based on duration in hours.
 * Rules:
 * - Less than 5 hours -> Poor
 * - 5 to 7 hours -> Average
 * - 7 to 9 hours -> Good
 * - More than 9 hours -> Oversleep
 * 
 * @param {number} durationHours
 * @returns {string} Quality label ('Poor' | 'Average' | 'Good' | 'Oversleep')
 */
export const evaluateSleepQuality = (durationHours) => {
  const hours = Number(durationHours);
  if (isNaN(hours) || hours <= 0) return 'Poor';

  if (hours < 5) {
    return 'Poor';
  } else if (hours < 7) {
    return 'Average';
  } else if (hours <= 9) {
    return 'Good';
  } else {
    return 'Oversleep';
  }
};

/**
 * Get display label with emoji for sleep quality.
 * Examples:
 * - Good -> "Good sleep ✅"
 * - Poor -> "Poor sleep ❌"
 * - Average -> "Average sleep ⚠️"
 * - Oversleep -> "Oversleep ⚠️"
 * 
 * @param {string} quality
 * @returns {string}
 */
export const getSleepQualityLabel = (quality) => {
  if (!quality) return 'Average sleep ⚠️';
  
  if (quality.startsWith('Poor')) return 'Poor sleep ❌';
  if (quality.startsWith('Average')) return 'Average sleep ⚠️';
  if (quality.startsWith('Good') || quality.startsWith('Great')) return 'Good sleep ✅';
  if (quality.startsWith('Fair')) return 'Average sleep ⚠️';
  if (quality.startsWith('Oversleep')) return 'Oversleep ⚠️';

  switch (quality) {
    case 'Poor':
      return 'Poor sleep ❌';
    case 'Average':
      return 'Average sleep ⚠️';
    case 'Good':
      return 'Good sleep ✅';
    case 'Oversleep':
      return 'Oversleep ⚠️';
    default:
      return `${quality} sleep ⚠️`;
  }
};
