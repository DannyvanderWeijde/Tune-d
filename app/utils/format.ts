/**
 * Formats a duration in milliseconds into a standard "mm:ss" music timestamp string.
 *
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} A string representing minutes and seconds (e.g., "3:45").
 *
 * @example
 * formatDuration(205000) // returns "3:25"
 * formatDuration(6000) // returns "0:06"
 */
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  // padStart ensures we get "3:05" instead of "3:5"
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}