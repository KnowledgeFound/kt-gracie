import { Button } from '@/components/ui';

interface DeleteConfirmProps {
	onConfirm: () => void;
	onCancel: () => void;
}

export default function DeleteConfirm({
	onConfirm,
	onCancel,
}: DeleteConfirmProps) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full space-y-6 text-center">
			<div className="text-5xl">⚠️</div>
			<h2 className="text-2xl font-bold text-gray-900">Delete Profile?</h2>
			<p className="text-gray-600">
				This will permanently remove your profile and all progress from this
				device. This action cannot be undone.
			</p>
			<div className="flex gap-3 justify-center">
				<Button variant="danger" size="lg" onClick={onConfirm} className="flex-1 justify-center">
					Yes, Delete
				</Button>
				<Button variant="secondary" size="lg" onClick={onCancel} className="flex-1 justify-center">
					Cancel
				</Button>
			</div>
		</div>
	);
}
