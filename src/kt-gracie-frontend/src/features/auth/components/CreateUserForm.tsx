import { FormEvent, useState } from 'react';
import type { CreateUserInput } from '../../../types/user';
import { AgeBucket } from '../../../ENUMS/enums';
import { AGE_BUCKET_LABELS } from '../constants';
import { COUNTRIES } from '../countries';
import { hashPassword } from '../password';
import { Button } from '@/components/ui';
import { Field, inputCls } from './formBits';

interface CreateUserFormProps {
	onSubmit: (input: CreateUserInput) => void;
	onSignIn?: () => void;
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;
const MIN_PASSWORD = 6;

export default function CreateUserForm({ onSubmit, onSignIn }: CreateUserFormProps) {
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		const fd = new FormData(e.currentTarget);

		const username = (fd.get('username') as string).trim();
		const password = fd.get('password') as string;
		const confirm = fd.get('confirmPassword') as string;
		const country = (fd.get('country') as string) ?? '';

		if (!USERNAME_RE.test(username)) {
			setError('Username must be 3–24 characters: letters, numbers or underscores.');
			return;
		}
		if (password.length < MIN_PASSWORD) {
			setError(`Password must be at least ${MIN_PASSWORD} characters.`);
			return;
		}
		if (password !== confirm) {
			setError('The two passwords do not match.');
			return;
		}
		if (!country) {
			setError('Choose your country.');
			return;
		}

		setBusy(true);
		try {
			const { passwordHash, passwordSalt } = await hashPassword(password);
			onSubmit({
				username,
				passwordHash,
				passwordSalt,
				ageBucket: fd.get('ageBucket') as AgeBucket,
				country,
			});
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setBusy(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 bg-white rounded-2xl shadow-lg p-6 max-w-md w-full"
		>
			<h2 className="text-2xl font-bold text-brand-600">Create Account</h2>

			{error && (
				<p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
					{error}
				</p>
			)}

			<Field label="Username" htmlFor="username">
				<input
					id="username"
					name="username"
					type="text"
					autoComplete="username"
					required
					minLength={3}
					maxLength={24}
					placeholder="e.g. amara_k"
					className={inputCls}
				/>
			</Field>

			<Field label="Password" htmlFor="password">
				<input
					id="password"
					name="password"
					type="password"
					autoComplete="new-password"
					required
					minLength={MIN_PASSWORD}
					className={inputCls}
				/>
			</Field>

			<Field label="Re-enter Password" htmlFor="confirmPassword">
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					required
					minLength={MIN_PASSWORD}
					className={inputCls}
				/>
			</Field>

			<Field label="Age Range" htmlFor="ageBucket">
				<select id="ageBucket" name="ageBucket" className={inputCls}>
					{Object.entries(AGE_BUCKET_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</select>
			</Field>

			<Field label="Country" htmlFor="country">
				<select id="country" name="country" required defaultValue="" className={inputCls}>
					<option value="" disabled>
						Select your country
					</option>
					{COUNTRIES.map((c) => (
						<option key={c.name} value={c.name}>
							{c.name}
						</option>
					))}
				</select>
			</Field>

			<Button type="submit" size="lg" className="w-full justify-center" disabled={busy}>
				{busy ? 'Creating…' : 'Create Account →'}
			</Button>

			{onSignIn && (
				<p className="text-sm text-center text-gray-500">
					Already have an account?{' '}
					<button
						type="button"
						onClick={onSignIn}
						className="font-semibold text-brand-600 hover:underline"
					>
						Sign in
					</button>
				</p>
			)}
		</form>
	);
}
