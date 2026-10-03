/**
 * Local-only password handling. The backend has no accounts, so the password
 * never leaves the device: it is stretched with PBKDF2 and only the salted
 * hash is kept in local storage next to the profile.
 */

const ITERATIONS = 100_000;

function toHex(bytes: ArrayBuffer | Uint8Array): string {
	return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> {
	const bytes = hex.match(/.{2}/g)?.map((h) => parseInt(h, 16)) ?? [];
	return new Uint8Array(new ArrayBuffer(bytes.length)).map((_, i) => bytes[i]);
}

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password.normalize('NFC')),
		'PBKDF2',
		false,
		['deriveBits'],
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
		key,
		256,
	);
	return toHex(bits);
}

/** Hash a new password with a fresh random salt. Both are hex strings. */
export async function hashPassword(
	password: string,
): Promise<{ passwordHash: string; passwordSalt: string }> {
	const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
	return { passwordHash: await derive(password, salt), passwordSalt: toHex(salt) };
}

/** True when `password` matches the stored salted hash. */
export async function verifyPassword(
	password: string,
	passwordSalt: string,
	passwordHash: string,
): Promise<boolean> {
	const candidate = await derive(password, fromHex(passwordSalt));
	// Constant-time compare — both are fixed-length hex strings.
	if (candidate.length !== passwordHash.length) return false;
	let diff = 0;
	for (let i = 0; i < candidate.length; i++) {
		diff |= candidate.charCodeAt(i) ^ passwordHash.charCodeAt(i);
	}
	return diff === 0;
}
