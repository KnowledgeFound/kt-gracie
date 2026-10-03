import type { Module, ModuleAssessment } from '@/features/city/types';
import type { LessonSection } from '@/features/course/types';
import { videoKind } from '@/features/course/video';
import { getCorpus } from './corpusService';

type RawTeaching = { id: number; sections?: LessonSection[] };
type RawKU = { id: string; teachings: RawTeaching[] };

/**
 * Lesson text lives in gracie-ku-corpus.json as `teachings[].sections`. The
 * canister only serves the link + description, so the sections are read from
 * the bundled corpus and matched by knowledge-unit id and teaching id.
 */
async function authoredSections(kuId: string, teachingId: number): Promise<LessonSection[]> {
	const corpusJson = await getCorpus();

	const ku = (corpusJson.knowledgeUnits as unknown as RawKU[]).find((k) => k.id === kuId);
	return ku?.teachings.find((t) => t.id === teachingId)?.sections ?? [];
}

/**
 * Sections for one teaching. A teaching with no authored text still gets a
 * single readable section built from what the corpus does carry, so a module
 * is never a dead end.
 */
export async function getLessonSections(module: Module, teaching: ModuleAssessment): Promise<LessonSection[]> {
	const authored = await authoredSections(module.kuId, teaching.id);
	const sourceUrl = teaching.content?.url;
	// YouTube link or a hosted media file (the corpus now links MP4s directly).
    const isVideo = videoKind(sourceUrl, teaching.content?.contentType) !== null;

	if (authored.length > 0) {
		// A video source that no section embeds becomes a compulsory first section.
		if (isVideo && !authored.some((s) => s.video)) {
			return [videoSection(teaching), ...authored];
		}
		return authored;
	}

	const objectives = Array.isArray(module.objectives) ? module.objectives : [];
	const lines = [
		`# ${teaching.title}`,
		'',
		String(teaching.content?.detailedDescription || module.description),
		...(objectives.length ? ['', '**In this lesson you will:**', '', ...objectives.map((o) => `- ${o}`)] : []),
		//...(sourceUrl && !isVideo ? ['', `Read more: [${teaching.content?.name}](${sourceUrl})`] : []),
	];
	const overview: LessonSection = { id: 'overview', title: teaching.title, markdown: lines.join('\n') };
	return isVideo ? [videoSection(teaching), overview] : [overview];
}

function videoSection(teaching: ModuleAssessment): LessonSection {
	return {
		id: 'video',
		title: teaching.content?.name || 'Watch',
		markdown: `# ${teaching.title}\n\nWatch the video to the end to continue.\n\n${teaching.content?.detailedDescription ?? ''}`,
		video: { url: teaching.content!.url, required: true },
	};
}
