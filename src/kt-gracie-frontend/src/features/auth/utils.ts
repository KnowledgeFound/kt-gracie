/** Generates a RFC 4122 v4 UUID using the Web Crypto API. */
export function generateUUID(): string {
	return crypto.randomUUID();
}

/** Returns the current time as an ISO 8601 string. */
export function now(): string {
	return new Date().toISOString();
}

/** NFC-normalises a string and trims whitespace. */
export function normaliseName(raw: string): string {
	return raw.normalize('NFC').trim();
}
