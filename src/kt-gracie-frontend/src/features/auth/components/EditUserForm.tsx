import { FormEvent } from 'react';
import type { User, UpdateUserInput, AgeBucket, Gender, Region } from '../types';
import {
	AGE_BUCKET_LABELS,
	GENDER_LABELS,
	REGION_LABELS,
} from '../constants';
import { Button } from '@/components/ui';

interface EditUserFormProps {
	user: User;
	onSubmit: (updates: UpdateUserInput) => void;
	onCancel: () => void;
}

export default function EditUserForm({
	user,
	onSubmit,
	onCancel,
}: EditUserFormProps) {
	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		onSubmit({
			firstName: (fd.get('firstName') as string).trim() || undefined,
			ageBucket: fd.get('ageBucket') as AgeBucket,
			gender: fd.get('gender') as Gender,
			region: fd.get('region') as Region,
			country: (fd.get('country') as string).trim() || undefined,
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-5 bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full"
		>
			<h2 className="text-2xl font-bold text-indigo-700">Edit Profile</h2>

			<Field label="First Name" htmlFor="firstName">
				<input
					id="firstName"
					name="firstName"
					type="text"
					defaultValue={user.firstName}
					className={inputCls}
				/>
			</Field>

			<Field label="Age Range" htmlFor="ageBucket">
				<select
					id="ageBucket"
					name="ageBucket"
					defaultValue={user.ageBucket}
					className={inputCls}
				>
					{Object.entries(AGE_BUCKET_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			<Field label="Gender" htmlFor="gender">
				<select
					id="gender"
					name="gender"
					defaultValue={user.gender}
					className={inputCls}
				>
					{Object.entries(GENDER_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			<Field label="Region" htmlFor="region">
				<select
					id="region"
					name="region"
					defaultValue={user.region}
					className={inputCls}
				>
					{Object.entries(REGION_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			<Field label="Country (local only)" htmlFor="country">
				<input
					id="country"
					name="country"
					type="text"
					defaultValue={user.country}
					className={inputCls}
				/>
			</Field>

			<div className="flex gap-3 pt-2">
				<Button type="submit" size="lg" className="flex-1 justify-center">
					Save Changes
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="lg"
					onClick={onCancel}
					className="flex-1 justify-center"
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

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
