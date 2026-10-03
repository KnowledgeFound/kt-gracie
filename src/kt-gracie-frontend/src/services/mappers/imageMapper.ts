// imageResolver.ts
import anti_corruption_img from '/assets/city/anti-corruption.jpeg';
import community_img from '/assets/city/community.jpeg';
import policy_img from '/assets/city/policy.jpeg';
import youth_led_img from '/assets/city/youth-led.jpeg';
import digital_innovation_img from '/assets/city/digital-innovation.jpeg';

// Ruined counterparts, shown while the city is corrupt. Same keys as below.
const CORRUPT_IMAGES = {
  anti_corruption_img: '/assets/corrupted-city/left-up.png',
  policy_img: '/assets/corrupted-city/central.png',
  youth_led_img: '/assets/corrupted-city/youth-led.png',
  digital_innovation_img: '/assets/corrupted-city/right-up.png',
  community_img: '/assets/corrupted-city/right-down.png',
} as const;

// Default fallback image
const FALLBACK_IMAGE = anti_corruption_img;

// Map variable names, filenames, and kebab-case keys to imported assets
const IMAGE_MAP: Record<string, string> = {
  // Direct variable / backend key matches
  anti_corruption_img,
  community_img,
  policy_img,
  youth_led_img,
  digital_innovation_img,

  // Filename stems (with hyphens)
  'anti-corruption': anti_corruption_img,
  'community': community_img,
  'policy': policy_img,
  'youth-led': youth_led_img,
  'digital-innovation': digital_innovation_img,

  // Full filenames with extensions
  'anti-corruption.jpeg': anti_corruption_img,
  'community.jpeg': community_img,
  'policy.jpeg': policy_img,
  'youth-led.jpeg': youth_led_img,
  'digital-innovation.jpeg': digital_innovation_img,
};

/** The healthy asset an incoming key points at, or null if unmatched. */
function lookup(imageKey?: string | null): string | null {
  if (!imageKey) return null;
  const trimmed = imageKey.trim();

  // 1. Direct match (e.g., "community_img" or "youth-led")
  if (IMAGE_MAP[trimmed]) return IMAGE_MAP[trimmed];

  // 2. Normalized match (lowercase, strip file extension)
  const normalized = trimmed.toLowerCase().replace(/\.(jpe?g|png|webp|svg)$/i, '');
  if (IMAGE_MAP[normalized]) return IMAGE_MAP[normalized];

  return null;
}

/**
 * Resolves an incoming backend image string to its bundled asset URL.
 * Falls back to anti_corruption_img if not provided or unmatched.
 */
export function resolveImage(imageKey?: string | null): string {
  return lookup(imageKey) ?? FALLBACK_IMAGE;
}

/**
 * The ruined version of the same artwork, for the corrupt city. Resolves the
 * key exactly as {@link resolveImage} does, then swaps in the counterpart.
 */
export function resolveCorruptImage(imageKey?: string | null): string {
  const healthy = lookup(imageKey) ?? FALLBACK_IMAGE;
  const entry = (Object.keys(CORRUPT_IMAGES) as (keyof typeof CORRUPT_IMAGES)[]).find(
    (k) => IMAGE_MAP[k] === healthy,
  );
  return entry ? CORRUPT_IMAGES[entry] : CORRUPT_IMAGES.anti_corruption_img;
}