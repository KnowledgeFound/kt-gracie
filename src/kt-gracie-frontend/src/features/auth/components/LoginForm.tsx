import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui';
import { Field, inputCls } from './formBits';

interface LoginFormProps {
	/** Resolves true on success; false when the credentials do not match. */
	onSubmit: (username: string, password: string) => Promise<boolean>;
	onCreateAccount?: () => void;
}

export default function LoginForm({ onSubmit, onCreateAccount }: LoginFormProps) {
	const [error, setError] = useState('');
	const [busy, setBusy] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		const fd = new FormData(e.currentTarget);
		const username = (fd.get('username') as string).trim();
		const password = fd.get('password') as string;
		if (!username || !password) {
			setError('Enter your username and password.');
			return;
		}
		setBusy(true);
		try {
			const ok = await onSubmit(username, password);
			if (!ok) setError('That username and password do not match an account on this device.');
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
			<h2 className="text-2xl font-bold text-brand-600">Sign In</h2>

			{error && (
				<p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
					{error}
				</p>
			)}

			<Field label="Username" htmlFor="login-username">
				<input
					id="login-username"
					name="username"
					type="text"
					autoComplete="username"
					required
					className={inputCls}
				/>
			</Field>

			<Field label="Password" htmlFor="login-password">
				<input
					id="login-password"
					name="password"
					type="password"
					autoComplete="current-password"
					required
					className={inputCls}
				/>
			</Field>

			<Button type="submit" size="lg" className="w-full justify-center" disabled={busy}>
				{busy ? 'Signing in…' : 'Sign In →'}
			</Button>

			{onCreateAccount && (
				<p className="text-sm text-center text-gray-500">
					Don&apos;t have an account?{' '}
					<button
						type="button"
						onClick={onCreateAccount}
						className="font-semibold text-brand-600 hover:underline"
					>
						Create one
					</button>
				</p>
			)}
		</form>
	);
}
