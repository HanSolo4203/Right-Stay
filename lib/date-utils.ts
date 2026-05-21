/**
 * Date utility functions to handle dates without timezone issues
 */

/**
 * Parse a date string (YYYY-MM-DD) as a local date without timezone conversion
 * This prevents the "day behind" issue when displaying dates
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Parse a date string and add 1 day for display purposes
 * This ensures booking summary dates match calendar selection
 */
export const parseLocalDatePlusOne = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);
  return date;
};

/**
 * Format a date string for display
 */
export const formatDateForDisplay = (
  dateString: string,
  locale: string = 'en-ZA',
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, options);
};

/**
 * Format a date string for full date display
 */
export const formatFullDate = (
  dateString: string,
  locale: string = 'en-ZA'
): string => {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString(locale, { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

