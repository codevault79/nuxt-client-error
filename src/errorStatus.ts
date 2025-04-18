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
 * @description A function that takes an error and a translation function and returns a computed property with the error status message.
 * It handles specific error messages, HTTP status codes, and custom error messages.
 * @param error - A Ref object containing the error to be handled.
 * @param t - A function that takes a key and returns a translated string.
 * @param customError - An optional function that takes an error and returns a custom error message.
 * @returns A computed property with the error status message.
 */
export function errorStatus(
	error: Ref<Error | string | number | null | undefined>,
	t: (key: string) => string,
	customError?: CustomError
) {
	return computed(() => {
		try {
			if (!error || !t) {
				console.warn("errorStatus: Missing required parameters.")
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
				const httpStatusCodes = [400, 401, 403, 404, 408, 429, 500, 502, 503, 504]

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
			console.error("Error:", (error as Error)?.message)
			return t("errStatus.unexpectedError")
		}
	})
}
