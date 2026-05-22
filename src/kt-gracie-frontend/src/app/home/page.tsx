import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui';

export default function HomePage() {
	const navigate = useNavigate();

	return (
		<MainLayout>
			<div className="flex justify-center mt-6 items-center">
				<Button size="lg" onClick={() => navigate('/auth')}>
					Get Started
				</Button>
			</div>
		</MainLayout>
	);
}
