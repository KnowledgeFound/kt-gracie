// Public API for the on-device Gracie feature (issue #50, AI Gracie Phase 1).
export { GracieAIProvider, useGracieAI } from './context';
export { useLearnerFacts } from './hooks/useLearnerFacts';
export { askGracie } from './ask';
export { classify } from './classify';
export { bandFor, CITY_TIERS } from './tiers';
export { guardReply, templateReply, scriptedReply, leadSentence } from './replies';
export { shapeReply, usableNudge } from './shape';
export { MODEL, engineSupported } from './engine';

export { default as GracieChat } from './components/GracieChat';
export { default as GracieChatLauncher } from './components/GracieChatLauncher';
export { default as GracieFeedback } from './components/GracieFeedback';
export { default as ModelStatusCard } from './components/ModelStatusCard';
export { default as ModelSetupModal } from './components/ModelSetupModal';
export { default as SourceBadge } from './components/SourceBadge';

export type {
	GracieMode,
	EngineStatus,
	ReplySource,
	LearnerFacts,
	GracieReply,
	ChatTurn,
	DownloadProgress,
} from './types';
