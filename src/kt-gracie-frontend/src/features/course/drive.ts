/** File id from a Google Drive share link (/file/d/<id>/… or ?id=<id>), or null. */
export function driveFileId(url: string | undefined | null): string | null {
	if (!url) return null;
	try {
		const u = new URL(url);
		if (u.hostname !== 'drive.google.com') return null;
		const m = /\/file\/d\/([\w-]+)/.exec(u.pathname);
		return m ? m[1] : u.searchParams.get('id');
	} catch {
		return null;
	}
}

/** Embeddable viewer URL. The file must be shared as "Anyone with the link". */
export function driveEmbedUrl(id: string): string {
	return `https://drive.google.com/file/d/${id}/preview`;
}
