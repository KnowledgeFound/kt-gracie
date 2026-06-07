import { FormEvent, useState } from 'react';
import type { CreateUserInput, AgeBucket, Gender, Region } from '../types';
import { AGE_BUCKET_LABELS, GENDER_LABELS, REGION_LABELS } from '../constants';
import { Button } from '@/components/ui';

interface CreateUserFormProps {
	onSubmit: (input: CreateUserInput) => void;
}

export default function CreateUserForm({ onSubmit }: CreateUserFormProps) {
	const [error, setError] = useState('');

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		const fd = new FormData(e.currentTarget);

		const firstName = (fd.get('firstName') as string).trim();
		if (!firstName) {
			setError('First name is required.');
			return;
		}

		onSubmit({
			firstName,
			ageBucket: fd.get('ageBucket') as AgeBucket,
			gender: fd.get('gender') as Gender,
			region: fd.get('region') as Region,
			country: (fd.get('country') as string).trim(),
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-5 bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full"
		>
			<h2 className="text-2xl font-bold text-indigo-700">Create Profile</h2>

			{error && (
				<p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
					{error}
				</p>
			)}

			{/* First name */}
			<Field label="First Name" htmlFor="firstName">
				<input
					id="firstName"
					name="firstName"
					type="text"
					required
					placeholder="e.g. Amara"
					className={inputCls}
				/>
			</Field>

			{/* Age bucket */}
			<Field label="Age Range" htmlFor="ageBucket">
				<select id="ageBucket" name="ageBucket" className={inputCls}>
					{Object.entries(AGE_BUCKET_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			{/* Gender */}
			<Field label="Gender" htmlFor="gender">
				<select id="gender" name="gender" className={inputCls}>
					{Object.entries(GENDER_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			{/* Region */}
			<Field label="Region" htmlFor="region">
				<select id="region" name="region" className={inputCls}>
					{Object.entries(REGION_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			{/* Country (local only) */}
			<Field label="Country (local only — not shared)" htmlFor="country">
				<input
					id="country"
					name="country"
					type="text"
					placeholder="e.g. Nigeria"
					className={inputCls}
				/>
			</Field>

			<Button type="submit" size="lg" className="w-full justify-center">
				Create Profile →
			</Button>
		</form>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
	'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition';

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
			<label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
				{label}
			</label>
			{children}
		</div>
	);
}
