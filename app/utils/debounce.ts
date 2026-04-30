/**
 * Debounce to delay execution of a function
 *
 * @param {Function} func
 * @param {number} waitFor
 *
 * @returns {(...args: Parameters<any>) => void}
 */
export function debounce<T extends (...args: any[]) => any> (
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