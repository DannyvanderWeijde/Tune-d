/**
 * Creates a debounced version of a function that delays its execution until after
 * `waitFor` milliseconds have elapsed since the last time it was invoked.
 *
 * Useful for search inputs to prevent making an API request on every keystroke.
 *
 * @template T - The type of the original function.
 * @param {T} func - The function to debounce.
 * @param {number} waitFor - The delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void} A new function that accepts the same arguments as `func` but returns void.
 *
 * @example
 * const search = debounce((query: string) => { console.log(query) }, 500);
 * search('a'); // canceled
 * search('ab'); // canceled
 * search('abc'); // executes after 500ms
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>): void => {
    // Clear the previous timer if the function is called again quickly
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Set a new timer
    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, waitFor)
  }
}