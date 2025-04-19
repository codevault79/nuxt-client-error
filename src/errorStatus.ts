import { computed, Ref } from "vue"

/**
 * @description Type definition for a custom error handler function.
 * This function takes an error (of type Error, string, number, null, or undefined) and returns a string or null.
 * It can be used to handle specific error messages or formats.
 * @param error - The error to be handled, which can be of various types.
 */
export type CustomError = (
	error: Error | string | number | null | undefined
) => string | null

/**
 * @description Type definition for the options parameter of the errorStatus function.
 * It includes debug and serverOnly properties, both of which are optional and of type boolean.
 * @param debug - A boolean indicating whether to enable debug mode.
 * @param serverOnly - A boolean indicating whether to restrict the function to server-side errors only.
 */
export interface ErrorStatusOptions {
	debug?: boolean
	serverOnly?: boolean
}

/**
 * @description A function that takes an error and a translation function and returns a computed property with the error status message.
 * It handles specific error messages, HTTP status codes, and custom error messages.
 * @param error - A Ref object containing the error to be handled.
 * @param t - A function that takes a key and returns a translated string.
 * @param customError - An optional function that takes an error and returns a custom error message.
 * @param options - An optional object containing debug and serverOnly properties.
 * @returns A computed property with the error status message.
 */
export function errorStatus(
	error: Ref<Error | string | number | null | undefined>,
	t: (key: string) => string,
	customError?: CustomError,
	options?: ErrorStatusOptions
) {
	return computed(() => {
		try {
			if (!error || !t) {
				if (logOption(options)) {
					console.warn("errorStatus: Missing required parameters.")
				}

				return t("errStatus.missingParameters")
			}

			// Handle specific error
			if (error.value) {
				let errorMessage: string

				if (typeof error.value === "string") {
					errorMessage = error.value
				} else if (error.value instanceof Error) {
					errorMessage = error.value.message
				} else if (typeof error.value === "number") {
					errorMessage = error.value.toString()
				} else {
					errorMessage = ""
				}

				// First check for special error types
				if (errorMessage.includes("aborted")) {
					return t("errStatus.abortError")
				} else if (errorMessage.includes("timeout")) {
					return t("errStatus.408")
				}

				// Check for HTTP status codes
				const httpStatusCodes = [
					400, 401, 403, 404, 408, 429, 500, 502, 503, 504,
				]

				// Direct check if error.value is a number
				if (
					typeof error.value === "number" &&
					httpStatusCodes.includes(error.value)
				) {
					return t(`errStatus.${error.value}`)
				}

				// String-based check
				for (const code of httpStatusCodes) {
					if (errorMessage.includes(code.toString())) {
						return t(`errStatus.${code}`)
					}
				}

				// Check for custom error handler
				if (customError) {
					const customMessage = customError(error.value)
					if (customMessage) return customMessage
				}
			}

			return t("errStatus.defaultStatusError")
		} catch (error) {
			if (logOption(options)) {
				console.error("Error:", (error as Error)?.message)
			}

			return t("errStatus.unexpectedError")
		}
	})
}

/**
 * @description Determines if logging should occur based on debug and serverOnly options.
 * It checks if debug mode is enabled and whether the code is running on the server.
 * If debug is enabled but serverOnly is not, it logs everywhere.
 * If both debug and serverOnly are true, it logs only on the server.
 * @param options - An optional object containing debug and serverOnly properties.
 * @returns A boolean indicating whether logging should occur.
 */
function logOption(options?: ErrorStatusOptions): boolean {
	// No logging if debug is not explicitly enabled
	if (!options?.debug) {
		return false
	}

	// If debug is enabled but serverOnly is not, log everywhere
	if (!options.serverOnly) {
		return true
	}

	// Log only on server if both debug and serverOnly are true
	return isServer()
}

/**
 * @description Checks if the code is running on the server side.
 * It uses a Nuxt-specific check to determine if the process is running on the server.
 * It also checks if the window object is undefined, which indicates a Node.js environment.
 * @return A boolean indicating whether the code is running on the server side.
 */
function isServer(): boolean {
	return (
		// Nuxt-specific check with type safety
		(typeof process !== "undefined" &&
			process &&
			"server" in process &&
			process.server === true) ||
		typeof window === "undefined" // Node.js environment check (no window object)
	)
}
