import { ContentType } from '@/ENUMS/enums';
import { absoluteUrl } from './utils';
import { youtubeId } from './youtube';

/** How a lesson video is played: a YouTube embed, or a media file in a `<video>` tag. */
export type VideoKind = 'youtube' | 'file';

/** File extensions the browser's own player can stream. */
const VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'webm', 'ogv', 'ogg', 'mov', 'm3u8']);

/**
 * Work out whether a corpus link is a video the lesson can play, and how.
 *
 * Corpus videos used to be YouTube links; they are now hosted as plain MP4
 * files (media.knowledgefound.org), so a link counts as a video when it is a
 * YouTube URL, points at a media file, or is marked `VIDEO` in the corpus and
 * has no file extension to contradict it (a bare streaming URL). A Drive link
 * is left alone — it has its own inline viewer and cannot be streamed into a
 * `<video>` tag. Anything else (an article, a PDF, a `#` placeholder) is not a
 * video.
 */
export function videoKind(
	url: string | undefined | null,
	contentType?: ContentType | string | null,
): VideoKind | null {
	if (youtubeId(url)) return 'youtube';

	const absolute = absoluteUrl(url);
	if (!absolute) return null;

	const { hostname, pathname } = new URL(absolute);
	const extension = /\.([a-z0-9]+)$/i.exec(pathname)?.[1]?.toLowerCase();

	if (extension) return VIDEO_EXTENSIONS.has(extension) ? 'file' : null;
	if (contentType === ContentType.VIDEO && hostname !== 'drive.google.com') return 'file';
	return null;
}

/** The `src` to hand a `<video>` tag for a file video, or null when the link is unusable. */
export function videoFileSrc(url: string | undefined | null): string | null {
	return videoKind(url) === 'file' ? absoluteUrl(url) : null;
}
