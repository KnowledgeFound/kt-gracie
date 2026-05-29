import { FormEvent, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { CreateSubjectInput } from '../types';
import { Button } from '@/components/ui';

interface CreateSubjectFormProps {
	onSubmit: (input: CreateSubjectInput) => void;
	onCancel: () => void;
	isPending: boolean;
	error?: string;
}

export default function CreateSubjectForm({
	onSubmit,
	onCancel,
	isPending,
	error,
}: CreateSubjectFormProps) {
	const formRef = useRef<HTMLFormElement>(null);

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);

		const name = (fd.get('name') as string).trim();
		const code = (fd.get('code') as string).trim().toUpperCase();
		const duration = parseInt(fd.get('duration') as string, 10);
		const description = (fd.get('description') as string).trim();

		if (!name || !code || isNaN(duration) || duration <= 0) return;

		onSubmit({ name, code, duration, description });
	}

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			className="bg-surface-card rounded-card shadow-card p-6 space-y-4"
		>
			<h2 className="text-lg font-bold text-ink-deep">New Subject</h2>

			{error && (
				<p className="text-sm text-danger-600 bg-danger-50 border border-danger-100 rounded-lg px-4 py-2">
					{error}
				</p>
			)}

			<Field label="Subject Name" htmlFor="name">
				<input
					id="name"
					name="name"
					type="text"
					required
					placeholder="The concept of corruption"
					className={inputCls}
					disabled={isPending}
				/>
			</Field>

			<div className="grid grid-cols-2 gap-4">
				<Field label="Code" htmlFor="code">
					<input
						id="code"
						name="code"
						type="text"
						required
						placeholder="e.g. CS101"
						className={inputCls}
						disabled={isPending}
					/>
				</Field>

				<Field label="Duration (hrs)" htmlFor="duration">
					<input
						id="duration"
						name="duration"
						type="number"
						required
						min={1}
						placeholder="e.g. 40"
						className={inputCls}
						disabled={isPending}
					/>
				</Field>
			</div>

			<Field label="Description" htmlFor="description">
				<textarea
					id="description"
					name="description"
					rows={3}
					placeholder="Brief overview of the subject…"
					className={`${inputCls} resize-none`}
					disabled={isPending}
				/>
			</Field>

			<div className="flex gap-3 pt-1">
				<Button
					type="submit"
					size="md"
					isLoading={isPending}
					className="flex-1 justify-center"
				>
					{isPending ? (
						<>
							Creating…
						</>
					) : (
						'Create Subject'
					)}
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="md"
					onClick={onCancel}
					disabled={isPending}
					className="flex-1 justify-center"
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
	'w-full px-3 py-2 border border-gray-200 rounded-lg text-ink-deep text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition disabled:opacity-50 disabled:cursor-not-allowed';

function Field({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<label htmlFor={htmlFor} className="text-xs font-semibold text-ink-muted uppercase tracking-wide">
				{label}
			</label>
			{children}
		</div>
	);
}
