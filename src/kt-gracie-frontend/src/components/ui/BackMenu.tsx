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
		<button
			onClick={handleBack}
			className="flex items-center gap-1.5 text-ink-muted hover:text-ink-deep transition-colors text-sm font-medium"
		>
			<ArrowLeft className="w-4 h-4" />
			Back
		</button>
	);
};

export default BackMenu;
