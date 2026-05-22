import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackMenu = () => {
	const navigate = useNavigate();
	return (
		<div className="flex items-center justify-start gap-4 px-4 py-12 mb-8">
			<button
				onClick={() => navigate(-1)}
				className="flex items-center gap-1.5 text-ink-muted hover:text-ink-deep transition-colors text-sm font-medium"
			>
				<ArrowLeft className="w-4 h-4" />
				Back
			</button>
		</div>
	);
};

export default BackMenu;
