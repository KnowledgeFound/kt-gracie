import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackMenu = ({ to }: { to?: string | number }) => {
	const navigate = useNavigate();

	function handleBack() {
		if (typeof to === 'string') {
			navigate(to);
		} else {
			navigate(to ?? -1);
		}
	}

	return (
		<div className="flex items-center justify-start gap-4 px-4 py-12 mb-8">
			<button
				onClick={handleBack}
				className="flex items-center gap-1.5 text-ink-muted hover:text-ink-deep transition-colors text-sm font-medium"
			>
				<ArrowLeft className="w-4 h-4" />
				Back
			</button>
		</div>
	);
};

export default BackMenu;
