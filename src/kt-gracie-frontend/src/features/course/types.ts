export interface LessonVideo {
	/** Any YouTube link (watch, youtu.be, embed or shorts). */
	url: string;
	/** Learner must watch to the end before continuing. Defaults to true. */
	required?: boolean;
}

export interface LessonEmbed {
	/** Google Drive file link (video, PDF, slides…) shown in an inline viewer. */
	url: string;
	title?: string;
}

export interface LessonSection {
	id: string;
	title: string;
	markdown: string;
	/** Optional video shown above the text; compulsory unless `required: false`. */
	video?: LessonVideo;
	/** Optional Drive file viewer shown above the text. Never gates Continue. */
	embed?: LessonEmbed;
}

/** Which surface of the course the learner is on. */
export type CourseScreen = 'welcome' | 'lesson' | 'quiz' | 'results' | 'flashcards' | 'summary';
