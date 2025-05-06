# Nuxt Client Error

A utility for handling and displaying client error statuses in Nuxt 3 applications.

## Installation

```bash
npm install @codevault79/nuxt-client-error
```

## Usage

```typescript
import { useI18n } from "vue-i18n"
import { errorStatus } from "@codevault79/nuxt-client-error"

export default {
	setup() {
		const error = ref(new Error("404 Not Found"))
		const { t } = useI18n()

		const status = errorStatus(error, t)

		return { status }
	},
}
```

### With Custom Error

```typescript
import { useI18n } from "vue-i18n"
import { errorStatus, type CustomError } from "@codevault79/nuxt-client-error"

export default {
	setup() {
		const error = ref(new Error("Custom error message"))
		const { t } = useI18n()

		const customError = (err) => {
			if (err && err.message.includes("Custom")) {
				return "This is a custom error"
			}
			return null
		}

		const status = errorStatus(error, t, customError)

		return { status }
	},
}
```

### With Debug Options

```typescript
import { useI18n } from "vue-i18n"
import { errorStatus } from "@codevault79/nuxt-client-error"

export default {
	setup() {
		const error = ref(new Error("500 Server Error"))
		const { t } = useI18n()

		// Enable debug logging on server side only
		const status = errorStatus(error, t, null, {
			debug: true, // Enable debug logging
			serverOnly: true, // Only log on server
		})

		return { status }
	},
}
```

## Required i18n Translations

Your i18n configuration should include the following keys:

```json
{
	"errStatus": {
		"missingParameters": "Missing required parameters",
		"abortError": "Request was aborted",
		"defaultStatusError": "An error occurred",
		"unexpectedError": "Unexpected error",
		"400": "Bad request",
		"401": "Unauthorized",
		"403": "Forbidden",
		"404": "Not found",
		"408": "Timed out",
		"429": "Too many requests",
		"500": "Server error",
		"502": "Bad gateway",
		"503": "Service unavailable",
		"504": "Gateway timeout"
	}
}
```

## License

MIT
